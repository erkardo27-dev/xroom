
"use client";

import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormDescription, FormField, FormItem,
  FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { amenityOptions, locations } from "@/lib/data";
import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Loader2, Map, Trash2, UploadCloud } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardDescription } from "../ui/card";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { uploadHotelImage, deleteHotelImage } from "@/firebase/storage";
import { useStorage } from "@/firebase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { MapLocationPicker } from "./MapLocationPicker";
import { Label } from "@/components/ui/label";
import { APIProvider } from "@vis.gl/react-google-maps";
import { ChannelMapping } from "./ChannelMapping";

const formSchema = z.object({
  hotelName: z.string().min(2, { message: "Зочид буудлын нэр оруулна уу." }),
  location: z.string({ required_error: "Байршил сонгоно уу." }),
  detailedAddress: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  phoneNumber: z.string().min(8, { message: "Утасны дугаар буруу байна." }),
  amenities: z.array(z.string()).optional(),
  galleryImageUrls: z.array(z.string().url()).optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountHolderName: z.string().optional(),
  signatureName: z.string().optional(),
  depositPercentage: z.coerce.number().min(0).max(100).default(100),
  termsAccepted: z.boolean().default(false),
  // Channel Manager
  channexApiKey: z.string().optional(),
  channexPropertyId: z.string().optional(),
  channexIsActive: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export function HotelSettingsForm({ onFormSubmit }: { onFormSubmit: () => void }) {
  const { hotelInfo, updateHotelInfo, userUid } = useAuth();
  const storage = useStorage();
  const { toast } = useToast();
  const [showMap, setShowMap] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const defaultValues: Partial<FormValues> = {
    hotelName: hotelInfo?.hotelName || "",
    location: hotelInfo?.location || undefined,
    detailedAddress: hotelInfo?.detailedAddress || "",
    latitude: hotelInfo?.latitude,
    longitude: hotelInfo?.longitude,
    phoneNumber: hotelInfo?.phoneNumber || "",
    amenities: hotelInfo?.amenities || [],
    galleryImageUrls: hotelInfo?.galleryImageUrls || [],
    bankName: hotelInfo?.bankName || "",
    accountNumber: hotelInfo?.accountNumber || "",
    accountHolderName: hotelInfo?.accountHolderName || "",
    signatureName: hotelInfo?.signatureName || "",
    depositPercentage: hotelInfo?.depositPercentage ?? 100,
    termsAccepted: !!hotelInfo?.contractSignedOn,
    // Channel Manager
    channexApiKey: hotelInfo?.channexConfig?.apiKey || "",
    channexPropertyId: hotelInfo?.channexConfig?.propertyId || "",
    channexIsActive: hotelInfo?.channexConfig?.isActive || false,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues,
  });

  const { reset, watch, setValue } = form;
  const watchedValues = watch();

  useEffect(() => {
    if (hotelInfo) {
      reset(hotelInfo);
    }
  }, [hotelInfo, reset]);

  // Manual geolocation trigger
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Алдаа",
        description: "Таны хөтөч байршил тогтоохыг дэмжихгүй байна.",
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setValue('latitude', latitude, { shouldDirty: true, shouldTouch: true });
        setValue('longitude', longitude, { shouldDirty: true, shouldTouch: true });
        setIsGettingLocation(false);
        toast({
          title: "Байршил олдлоо",
          description: "Таны одоогийн байршлыг газрын зураг дээр тэмдэглэлээ.",
        });
      },
      () => {
        setIsGettingLocation(false);
        toast({
          variant: "destructive",
          title: "Байршил олдсонгүй",
          description: "Таны байршлыг авах боломжгүй байна. Гараар сонгоно уу.",
        });
      }
    );
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isUploading) {
      toast({
        variant: "destructive",
        title: "Зураг хуулагдаж байна",
        description: "Хэсэг хүлээгээд дахин хадгална уу.",
      });
      return;
    }

    if (!userUid) {
      toast({
        variant: "destructive",
        title: "Алдаа",
        description: "Хэрэглэгчийн мэдээлэл олдсонгүй. Дахин нэвтэрнэ үү.",
      });
      return;
    }

    const dataToUpdate: Partial<z.infer<typeof formSchema>> = { ...values };

    const updateData: Partial<Omit<import("@/context/AuthContext").HotelInfo, 'id'>> = {
      hotelName: values.hotelName,
      location: values.location,
      detailedAddress: values.detailedAddress,
      latitude: values.latitude,
      longitude: values.longitude,
      phoneNumber: values.phoneNumber,
      amenities: values.amenities,
      bankName: values.bankName,
      accountNumber: values.accountNumber,
      accountHolderName: values.accountHolderName,
      signatureName: values.signatureName,
      depositPercentage: values.depositPercentage,

      // Channel Manager
      channexConfig: {
        apiKey: values.channexApiKey,
        propertyId: values.channexPropertyId,
        isActive: values.channexIsActive
      }
    };

    // termsAccepted is a client-side only field, don't save to Firestore
    delete dataToUpdate.termsAccepted;

    // If terms were accepted now and contract wasn't signed before, add sign date
    if (values.termsAccepted && !hotelInfo?.contractSignedOn) {
      (dataToUpdate as any).contractSignedOn = new Date().toISOString();
    }

    // Remove undefined fields before sending to Firestore
    Object.keys(dataToUpdate).forEach(key => {
      if (dataToUpdate[key as keyof typeof dataToUpdate] === undefined) {
        delete dataToUpdate[key as keyof typeof dataToUpdate];
      }
    });

    await updateHotelInfo(dataToUpdate);
    form.reset(values); // Optimistic UI update
    onFormSubmit();
  }

  // 🖼️ Image Compression helper
  const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.7): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new (window as any).Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error("Canvas toBlob failed"));
            }
          }, "image/jpeg", quality);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const [previews, setPreviews] = useState<string[]>([]);

  // 🖼️ Upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !userUid) return;

    setIsUploading(true);

    // Create local previews immediately
    const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);

    try {
      const uploadPromises = Array.from(files).map(async (file, idx) => {
        try {
          // 1. Compress
          const compressed = await compressImage(file);
          // 2. Upload
          const url = await uploadHotelImage(storage, compressed, userUid);
          return url;
        } catch (e) {
          console.error("Single image upload failed:", e);
          return null;
        }
      });

      const downloadUrls = await Promise.all(uploadPromises);
      const validUrls = downloadUrls.filter((url): url is string => url !== null);

      const currentUrls = form.getValues("galleryImageUrls") || [];
      form.setValue(
        "galleryImageUrls",
        [...currentUrls, ...validUrls],
        { shouldDirty: true, shouldTouch: true }
      );

      if (validUrls.length < files.length) {
        toast({
          variant: "destructive",
          title: "Анхааруулга",
          description: `${files.length - validUrls.length} зураг хуулахад алдаа гарлаа.`,
        });
      }

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Алдаа",
        description: "Зураг хуулахад алдаа гарлаа.",
      });
    } finally {
      setIsUploading(false);
      setPreviews([]); // Clear temporary previews
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };


  // 🗑️ Delete
  const handleRemoveImage = async (urlToRemove: string) => {
    try {
      // If it's a blob URL, we don't need to delete from storage
      if (!urlToRemove.startsWith('blob:')) {
        await deleteHotelImage(storage, urlToRemove);
      }

      const currentUrls = form.getValues("galleryImageUrls") || [];

      form.setValue(
        "galleryImageUrls",
        currentUrls.filter(url => url !== urlToRemove),
        { shouldDirty: true, shouldTouch: true }
      );

      toast({
        title: "Амжилттай устгалаа",
        description: "Зураг амжилттай устгагдлаа.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Алдаа",
        description: "Зураг устгахад алдаа гарлаа. (Зөвхөн жагсаалтаас хасагдлаа)",
      });
      // Force remove from form even if storage delete fails
      const currentUrls = form.getValues("galleryImageUrls") || [];
      form.setValue(
        "galleryImageUrls",
        currentUrls.filter(url => url !== urlToRemove),
        { shouldDirty: true, shouldTouch: true }
      );
    }
  };

  // ---------------- UI ----------------
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">Ерөнхий мэдээлэл</TabsTrigger>
              <TabsTrigger value="amenities">Үйлчилгээ & Зураг</TabsTrigger>
              <TabsTrigger value="payment">Төлбөр & Гэрээ</TabsTrigger>
              <TabsTrigger value="channel">Channel Manager</TabsTrigger>
            </TabsList>

            <div className="mt-4 max-h-[60vh] overflow-y-auto pr-3 space-y-6">
              <TabsContent value="info" className="space-y-4">
                <FormField
                  control={form.control}
                  name="hotelName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Зочид буудлын нэр</FormLabel>
                      <FormControl>
                        <Input placeholder="Танай буудлын нэр" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ерөнхий байршил</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Буудлын байршил сонгоно уу" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="detailedAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Дэлгэрэнгүй хаяг</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Дүүрэг, хороо, гудамж, байр, тоот..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Газрын зургийн байршил</FormLabel>
                      {showMap ? (
                        <MapLocationPicker
                          value={{ lat: field.value, lng: form.getValues().longitude }}
                          onChange={({ lat, lng }) => {
                            form.setValue('latitude', lat, { shouldDirty: true, shouldTouch: true });
                            form.setValue('longitude', lng, { shouldDirty: true, shouldTouch: true });
                          }}
                          isGettingLocation={isGettingLocation}
                          onGetCurrentLocation={handleGetCurrentLocation}
                        />
                      ) : (
                        <Button variant="outline" className="w-full" onClick={() => setShowMap(true)}>
                          <Map className="mr-2 h-4 w-4" />
                          {hotelInfo?.latitude ? "Байршил өөрчлөх" : "Газрын зураг дээр байршил сонгох"}
                        </Button>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Холбоо барих утас</FormLabel>
                      <FormControl>
                        <Input placeholder="Захиалгын мэдээлэл хүлээн авах утас" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amenities"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Буудлын үйлчилгээ</FormLabel>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {amenityOptions.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="amenities"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), item.id])
                                          : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
                                          )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="amenities">
                <CardDescription>
                  Буудлынхаа зургуудыг эндээс удирдана уу. Нэг дор олон зураг сонгож болно.
                </CardDescription>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  disabled={isUploading}
                  multiple
                />

                <FormField
                  control={form.control}
                  name="galleryImageUrls"
                  render={({ field }) => (
                    <FormItem>
                      {(field.value?.length ?? 0) > 0 || isUploading || previews.length > 0 ? (
                        <div className="space-y-4 pt-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Existing Images */}
                            {field.value?.map((url, idx) => (
                              <div key={url || idx} className="relative group aspect-video">
                                <img
                                  src={url}
                                  alt=""
                                  className="object-cover rounded-lg border aspect-video w-full h-full"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Зураг+алга";
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleRemoveImage(url)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}

                            {/* Local Previews (Uploading) */}
                            {previews.map((url, idx) => (
                              <div key={`preview-${idx}`} className="relative aspect-video">
                                <img
                                  src={url}
                                  alt="Uploading..."
                                  className="object-cover rounded-lg border aspect-video w-full h-full opacity-60 grayscale"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                              </div>
                            ))}

                            {isUploading && previews.length === 0 && (
                              <div className="aspect-video flex items-center justify-center bg-secondary rounded-lg border border-dashed animate-pulse">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              </div>
                            )}
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                          >
                            <UploadCloud className="mr-2 h-4 w-4" />
                            Дахин зураг хуулах
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="flex flex-col items-center justify-center text-center p-6 mt-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="p-3 bg-secondary rounded-full border mb-4">
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <p className="mt-2 text-sm font-semibold">Зураг хуулах</p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, WEBP сонгоно уу.
                          </p>
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="payment" className="space-y-4">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Банкны нэр</FormLabel>
                      <FormControl>
                        <Input placeholder="ХААН БАНК" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Дансны дугаар</FormLabel>
                      <FormControl>
                        <Input placeholder="500..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountHolderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Данс эзэмшигчийн нэр</FormLabel>
                      <FormControl>
                        <Input placeholder="ХХК эсвэл хувь хүний нэр" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="depositPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Урьдчилгаа төлбөрийн хувь (%)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                            className="w-24"
                          />
                          <span className="text-sm text-muted-foreground">
                            {field.value}% -ийг урьдчилж, үлдэгдлийг буудалд ирэхэд төлнө.
                          </span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Хэрэглэгч захиалга баталгаажуулахдаа төлөх дүн. 100% бол бүрэн төлөлт хийнэ.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="contract" className="space-y-4">
                <div className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-lg h-60 overflow-y-auto">
                  <h4>Үйлчилгээний гэрээ</h4>
                  <p>Энэхүү гэрээ нь "XRoom Tonight" (цаашид "Үйлчилгээ үзүүлэгч") болон танай зочид буудал (цаашид "Хамтрагч") хооронд байгуулагдав.</p>
                  <ol>
                    <li><strong>Зорилго:</strong> Хамтрагч нь өөрийн зочид буудлын сул өрөөг Үйлчилгээ үзүүлэгчийн платформоор дамжуулан сүүлчийн минутын хямдралтай үнээр борлуулах.</li>
                    <li><strong>Талуудын үүрэг:</strong>
                      <ul>
                        <li><strong>Хамтрагч:</strong> Өрөөний бодит мэдээлэл, үнэ, тоо ширхэгийг үнэн зөв оруулах. Захиалга орж ирсэн тохиолдолд хэрэглэгчийг хүлээн авч, үйлчилгээ үзүүлэх.</li>
                        <li><strong>Үйлчилгээ үзүүлэгч:</strong> Платформын тасралтгүй, найдвартай ажиллагааг хангах. Захиалгын мэдээллийг Хамтрагчид цаг алдалгүй хүргэх.</li>
                      </ul>
                    </li>
                    <li><strong>Төлбөр тооцоо:</strong> Үйлчилгээ үзүүлэгч нь амжилттай болсон захиалга бүрээс 5% шимтгэл авна. Шимтгэлийг сар бүр нэгтгэн тооцоо хийнэ.</li>
                    <li><strong>Нууцлал:</strong> Талууд энэхүү гэрээний хүрээнд олж авсан аливаа мэдээллийг гуравдагч этгээдэд задруулахгүй байх үүрэгтэй.</li>
                  </ol>
                  <p>Гэрээтэй танилцаж, хүлээн зөвшөөрснөө баталгаажуулна уу.</p>
                </div>
                <FormField
                  control={form.control}
                  name="signatureName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Баталгаажуулсан хүний нэр</FormLabel>
                      <FormControl>
                        <Input placeholder="Эрх бүхий албан тушаалтны нэр" {...field} disabled={!!hotelInfo?.contractSignedOn} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!!hotelInfo?.contractSignedOn}
                        />
                      </FormControl>
                      <Label htmlFor="terms" className="text-sm font-medium leading-none">
                        Дээрх гэрээний нөхцөлийг хүлээн зөвшөөрч байна.
                      </Label>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="channel" className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold mb-2">Channel Manager (Channex.io) интеграц</h3>
                  <p className="text-sm text-muted-foreground">
                    Booking.com, Airbnb, Expedia зэрэг гадны захиалгын сувгуудтай холбогдохын тулд Channex.io-ийн API түлхүүрийг энд оруулна уу.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="channexApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Channex API Key</FormLabel>
                      <FormControl>
                        <Input placeholder="API Key оруулна уу" type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Channex.io бүртгэлээсээ авсан API түлхүүр.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="channexPropertyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Channex Property ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Property ID" {...field} />
                      </FormControl>
                      <FormDescription>
                        Танай буудлын Channex дээрх ID.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="channexIsActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <Label>Идэвхжүүлэх</Label>
                        <p className="text-sm text-muted-foreground">
                          Энэ сонголтыг идэвхжүүлснээр систем автоматаар үнэ болон захиалгыг синк хийж эхэлнэ.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <ChannelMapping />
              </TabsContent>
            </div>
          </Tabs>

          <Button type="submit" className="w-full" disabled={isUploading || isGettingLocation}>
            {isUploading ? "Зураг хуулагдаж байна..." : isGettingLocation ? "Байршил тодорхойлж байна..." : "Хадгалах"}
          </Button>
        </form>
      </Form>
    </APIProvider>
  );
}



