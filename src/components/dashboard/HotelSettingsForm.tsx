
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
import { Image as ImageIcon, Loader2, Trash2, UploadCloud } from "lucide-react";
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

const formSchema = z.object({
  hotelName: z.string().min(2, { message: "Зочид буудлын нэр оруулна уу."}),
  location: z.string({ required_error: "Байршил сонгоно уу."}),
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
  termsAccepted: z.boolean().default(false),
});

export function HotelSettingsForm({ onFormSubmit }: { onFormSubmit: () => void }) {
  const { hotelInfo, updateHotelInfo, userUid } = useAuth();
  const storage = useStorage();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      hotelName: "",
      location: undefined,
      detailedAddress: "",
      phoneNumber: "",
      amenities: [],
      galleryImageUrls: [],
      bankName: "",
      accountNumber: "",
      accountHolderName: "",
      signatureName: "",
      termsAccepted: false,
    },
  });

  useEffect(() => {
    if (hotelInfo) {
      form.reset({
        ...hotelInfo,
        termsAccepted: !!hotelInfo.contractSignedOn,
      });
    }
  }, [hotelInfo]);

  // 🔽 SUBMIT
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isUploading) {
      toast({
        variant: "destructive",
        title: "Зураг хуулагдаж байна",
        description: "Хэсэг хүлээгээд дахин хадгална уу.",
      });
      return;
    }
  
    // 🧹 values → зөвхөн defined утга үлдээж цэвэрлэх
    const cleaned: any = {};
    for (const key in values) {
      const val = values[key as keyof typeof values];
      if (val !== undefined) cleaned[key] = val;
    }
  
    await updateHotelInfo(cleaned);
    onFormSubmit();
  }

  // 🖼️ Upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !userUid) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadHotelImage(storage, file, userUid));
      const downloadUrls = await Promise.all(uploadPromises);

      const currentUrls = form.getValues("galleryImageUrls") || [];
      
      form.setValue(
        "galleryImageUrls",
        [...currentUrls, ...downloadUrls],
        { shouldDirty: true }
      );
      await form.trigger("galleryImageUrls");

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Алдаа",
        description: "Зураг хуулахад алдаа гарлаа.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };


  // 🗑️ Delete
  const handleRemoveImage = async (urlToRemove: string) => {
    try {
      await deleteHotelImage(storage, urlToRemove);
      const currentUrls = form.getValues("galleryImageUrls") || [];
      
      form.setValue(
        "galleryImageUrls",
        currentUrls.filter(url => url !== urlToRemove),
        { shouldDirty: true }
      );
       await form.trigger("galleryImageUrls");

      toast({
        title: "Амжилттай устгалаа",
        description: "Зураг амжилттай устгагдлаа.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Алдаа",
        description: "Зураг устгахад алдаа гарлаа.",
      });
    }
  };

  // ---------------- UI ----------------
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Мэдээлэл</TabsTrigger>
            <TabsTrigger value="gallery">Зураг</TabsTrigger>
            <TabsTrigger value="payment">Данс</TabsTrigger>
            <TabsTrigger value="contract">Гэрээ</TabsTrigger>
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
                             <MapLocationPicker
                                value={{ lat: field.value, lng: form.getValues().longitude }}
                                onChange={({ lat, lng }) => {
                                    form.setValue('latitude', lat, { shouldDirty: true, shouldTouch: true });
                                    form.setValue('longitude', lng, { shouldDirty: true, shouldTouch: true });
                                }}
                            />
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

            <TabsContent value="gallery">
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
                    {(field.value?.length ?? 0) > 0 || isUploading ? (
                      <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {field.value?.map((url, idx) => (
                            <div key={idx} className="relative group aspect-video">
                              <Image
                                src={url}
                                alt=""
                                width={200}
                                height={150}
                                className="object-cover rounded-lg border aspect-video"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100"
                                onClick={() => handleRemoveImage(url)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {isUploading && (
                            <div className="aspect-video flex items-center justify-center bg-secondary rounded-lg">
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
                                <Input placeholder="Эрх бүхий албан тушаалтны нэр" {...field} disabled={!!hotelInfo?.contractSignedOn} />
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
          </div>
        </Tabs>

        <Button type="submit" className="w-full" disabled={isUploading}>
          {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isUploading ? "Зураг хуулагдаж байна..." : "Хадгалах"}
        </Button>
      </form>
    </Form>
  );
}

    