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
import { amenityOptions } from "@/lib/data";
import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Loader2, Trash2, UploadCloud } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardDescription } from "../ui/card";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

// 🔥 Firebase Upload / Delete
import { uploadHotelImage, deleteHotelImage } from "@/firebase/storage";
import { useStorage } from "@/firebase";

const formSchema = z.object({
  hotelName: z.string().min(2),
  location: z.string(),
  detailedAddress: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  phoneNumber: z.string().min(8),
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
  }, [hotelInfo, form]);

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
    
    // Omit the UI-only field 'termsAccepted' before saving
    const { termsAccepted, ...dataToSave } = values;
    
    await updateHotelInfo(dataToSave);
    onFormSubmit();
  }

  // 🖼️ Upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userUid) return;

    setIsUploading(true);
    try {
      const downloadUrl = await uploadHotelImage(storage, file, userUid);
      const currentUrls = form.getValues("galleryImageUrls") || [];
      
      form.setValue(
        "galleryImageUrls",
        [...currentUrls, downloadUrl],
        { shouldDirty: true, shouldTouch: true, shouldValidate: true }
      );
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
        { shouldDirty: true, shouldTouch: true, shouldValidate: true }
      );

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
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Мэдээлэл</TabsTrigger>
            <TabsTrigger value="payment">Данс</TabsTrigger>
            <TabsTrigger value="gallery">Зураг</TabsTrigger>
            <TabsTrigger value="contract">Гэрээ</TabsTrigger>
          </TabsList>

          <div className="mt-4 max-h-[60vh] overflow-y-auto pr-3">
            <TabsContent value="gallery">
              <CardDescription>
                Буудлынхаа зургуудыг эндээс удирдана уу.
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
                    {(field.value?.length ?? 0) > 0 || isUploading ? (
                      <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {field.value?.map((url, idx) => (
                            <div key={idx} className="relative group aspect-video">
                              <Image
                                src={url}
                                alt=""
                                fill
                                sizes="(max-width: 768px) 50vw, 33vw"
                                className="object-cover rounded-lg border"
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
          </div>
        </Tabs>

        <Button type="submit" className="w-full" disabled={isUploading || !form.formState.isDirty}>
          {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isUploading ? "Зураг хуулагдаж байна..." : "Хадгалах"}
        </Button>
      </form>
    </Form>
  );
}
