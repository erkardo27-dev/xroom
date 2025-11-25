"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { amenityOptions, locations } from "@/lib/data";
import { useEffect, useRef, useState } from "react";
import { CheckCircle, Image as ImageIcon, Loader2, Trash2, UploadCloud } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import Image from "next/image";
import { format } from "date-fns";
import { MapLocationPicker } from './MapLocationPicker';
import { useToast } from "@/hooks/use-toast";

// ⬇️ Firebase Image Upload & Delete
import { uploadHotelImage, deleteHotelImage } from "@/firebase/storage";
import { useStorage } from "@/firebase";

const formSchema = z.object({
  hotelName: z.string().min(2, { message: "Зочид буудлын нэр оруулна уу." }),
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
  termsAccepted: z.boolean().optional(),
});

type HotelSettingsFormProps = {
  onFormSubmit: () => void;
};

const contractText = `XROOM TONIGHT - ҮЙЛЧИЛГЭЭНИЙ ГЭРЭЭ

... (ТАНЫ ГЭРЭЭНИЙ ТЕКСТ ХЭВЭЭР ҮЛДЭНЭ) ...
`;

export function HotelSettingsForm({ onFormSubmit }: HotelSettingsFormProps) {
  const { hotelInfo, updateHotelInfo, userEmail } = useAuth();
  const storage = useStorage();
  const isContractSigned = !!hotelInfo?.contractSignedOn;
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      hotelName: "",
      location: undefined,
      detailedAddress: "",
      latitude: undefined,
      longitude: undefined,
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
        hotelName: hotelInfo.hotelName || "",
        location: hotelInfo.location || undefined,
        detailedAddress: hotelInfo.detailedAddress || "",
        latitude: hotelInfo.latitude,
        longitude: hotelInfo.longitude,
        phoneNumber: hotelInfo.phoneNumber || "",
        amenities: hotelInfo.amenities || [],
        galleryImageUrls: hotelInfo.galleryImageUrls || [],
        bankName: hotelInfo.bankName || "",
        accountNumber: hotelInfo.accountNumber || "",
        accountHolderName: hotelInfo.accountHolderName || "",
        signatureName: hotelInfo.signatureName || "",
        termsAccepted: !!hotelInfo.contractSignedOn,
      });
    }
  }, [hotelInfo, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload: any = {
      hotelName: values.hotelName,
      location: values.location,
      detailedAddress: values.detailedAddress,
      latitude: values.latitude,
      longitude: values.longitude,
      phoneNumber: values.phoneNumber,
      amenities: values.amenities,
      galleryImageUrls: values.galleryImageUrls,
      bankName: values.bankName,
      accountNumber: values.accountNumber,
      accountHolderName: values.accountHolderName,
    };

    if (!isContractSigned && values.signatureName && values.termsAccepted) {
      payload.contractSignedOn = new Date().toISOString();
      payload.signatureName = values.signatureName;
    }

    updateHotelInfo(payload);
    onFormSubmit();
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userEmail) return;

    setIsUploading(true);
    try {
      const downloadUrl = await uploadHotelImage(storage, file, userEmail);
      const currentUrls = form.getValues('galleryImageUrls') || [];
      form.setValue('galleryImageUrls', [...currentUrls, downloadUrl], { shouldDirty: true });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Алдаа',
        description: 'Зураг хуулахад алдаа гарлаа.',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async (urlToRemove: string) => {
    try {
      await deleteHotelImage(storage, urlToRemove);
      const currentUrls = form.getValues('galleryImageUrls') || [];
      form.setValue('galleryImageUrls', currentUrls.filter(url => url !== urlToRemove), { shouldDirty: true });
      toast({
        title: 'Амжилттай устгалаа',
        description: 'Зураг амжилттай устгагдлаа.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Алдаа',
        description: 'Зураг устгахад алдаа гарлаа.',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Үндсэн мэдээлэл</TabsTrigger>
            <TabsTrigger value="payment">Банкны данс</TabsTrigger>
            <TabsTrigger value="gallery">Зургийн сан</TabsTrigger>
            <TabsTrigger value="contract">Гэрээ</TabsTrigger>
          </TabsList>

          <div className="mt-4 max-h-[60vh] overflow-y-auto pr-3">
            <TabsContent value="gallery">
              <CardDescription>
                Буудлынхаа зургуудыг эндээс удирдан, өрөөний төрөл үүсгэхдээ ашиглана уу.
              </CardDescription>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                disabled={isUploading}
              />

              <FormField
                control={form.control}
                name="galleryImageUrls"
                render={({ field }) => (
                  <FormItem>
                    {(field.value && field.value.length > 0) || isUploading ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {field.value?.map((url, index) => (
                            <div key={index} className="relative group aspect-video">
                              <Image
                                src={url}
                                alt={`Uploaded image ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 50vw, 33vw"
                                className="object-cover rounded-lg border"
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
                          {isUploading && (
                            <div className="relative group aspect-video flex items-center justify-center bg-secondary rounded-lg">
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
                        className="flex flex-col items-center justify-center text-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 hover:border-primary/50 transition-colors"
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                      >
                        <div className="p-3 bg-secondary rounded-full border mb-4">
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="mt-2 text-sm font-semibold text-foreground">Зураг хуулах</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, WEBP төрлийн зураг сонгоно уу.
                        </p>
                      </div>
                    )}
                  </FormItem>
                )}
              />
            </TabsContent>
          </div>
        </Tabs>

        <Button type="submit" className="w-full" disabled={!form.formState.isDirty || isUploading}>
          {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isUploading ? "Зураг хуулж байна..." : "Хадгалах"}
        </Button>
      </form>
    </Form>
  );
}