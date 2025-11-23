
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

Нэг. Ерөнхий зүйл
1.1. Энэхүү гэрээ нь "XRoom Tonight" (цаашид "Үйлчилгээ үзүүлэгч") болон гэрээнд нэгдсэн зочид буудал (цаашид "Хамтрагч") хоорондын хамтын ажиллагааны нөхцөлийг тодорхойлно.
1.2. Хамтрагч нь Үйлчилгээ үзүүлэгчийн платформоор дамжуулан сүүлчийн минутын өрөөний захиалга авах, сурталчлах үйлчилгээнд хамрагдана.

Хоёр. Талуудын эрх, үүрэг
2.1. Үйлчилгээ үзүүлэгчийн эрх, үүрэг:
- Платформын хэвийн, найдвартай ажиллагааг хангах.
- Хамтрагчийн өрөөний мэдээллийг хэрэглэгчдэд үнэн зөв хүргэх.
- Захиалгын төлбөр тооцоог гэрээнд заасны дагуу шийдвэрлэх.
- Хэрэглэгчийн санал гомдлыг хүлээн авч, шийдвэрлэхэд хамтран ажиллах.
2.2. Хамтрагчийн эрх, үүрэг:
- Өрөөний үнэ, тоо ширхэг, нөхцөл зэрэг мэдээллийг үнэн зөв, цаг тухайд нь системд оруулах.
- Платформоор орж ирсэн захиалгыг хүлээн авч, хэрэглэгчид гэрээнд заасан үйлчилгээг үзүүлэх.
- Үйлчилгээний шимтгэлийг тохиролцсон хугацаанд төлөх.
- Хэрэглэгчийн нэвтрэх кодыг шалгаж, өрөөг хүлээлгэн өгөх.

Гурав. Төлбөр тооцоо
3.1. Үйлчилгээ үзүүлэгч нь амжилттай хийгдсэн захиалга бүрээс тохиролцсон хувийн шимтгэл авна.
3.2. Хэрэглэгчийн төлсөн төлбөр нь үйлчилгээний шимтгэл болон аппликейшний хураамжийг хассаны дараа Хамтрагчийн дансанд шилжинэ.

Дөрөв. Бусад заалт
4.1. Энэхүү гэрээ нь Хамтрагч системд бүртгүүлж, үйлчилгээний нөхцөлийг зөвшөөрснөөр хүчин төгөлдөр болно.
4.2. Гэрээтэй холбоотой маргаантай асуудлыг талууд харилцан тохиролцох замаар шийдвэрлэнэ.`;


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
    }, [hotelInfo, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const payload: Partial<Omit<HotelInfo, 'id'>> = {
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
                fileInputRef.current.value = ""; // Reset file input
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
                variant: 'default'
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
                                    <FormLabel>Байршил (Дүүрэг)</FormLabel>
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
                                            <Textarea placeholder="ж.нь: СБД, 8-р хороо, Амарын гудамж, 28-р байр" {...field} value={field.value ?? ""} />
                                        </FormControl>
                                         <FormDescription>
                                            Захиалагчид харагдах дэлгэрэнгүй хаяг.
                                        </FormDescription>
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
                                        <FormControl>
                                            <MapLocationPicker
                                                value={{ lat: field.value, lng: form.getValues().longitude }}
                                                onChange={(coords) => {
                                                    form.setValue('latitude', coords.lat, { shouldDirty: true });
                                                    form.setValue('longitude', coords.lng, { shouldDirty: true });
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Газрын зураг дээр дарж буудлынхаа байршлыг сонгоно уу.
                                        </FormDescription>
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
                                            <Input placeholder="9911XXXX" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Шинэ захиалга орж ирэх үед энэ дугаарт мэдэгдэл илгээнэ.
                                        </FormDescription>
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
                                        <FormLabel className="text-base">Нийтлэг үйлчилгээ</FormLabel>
                                        <FormDescription>
                                            Танай буудалд байдаг нийтлэг үйлчилгээнүүдийг сонгоно уу.
                                        </FormDescription>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
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
                                                            const newValue = checked
                                                                ? [...(field.value || []), item.id]
                                                                : (field.value || []).filter((value) => value !== item.id);
                                                            field.onChange(newValue);
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
                        <TabsContent value="payment" className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Зочны төлсөн төлбөр энэ данс руу автоматаар шилжинэ.
                            </p>
                            <FormField
                                control={form.control}
                                name="bankName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Банкны нэр</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ХААН БАНК" {...field} value={field.value ?? ""} />
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
                                            <Input placeholder="50xxxxxxxx" {...field} value={field.value ?? ""} />
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
                                            <Input placeholder="Б.БАТ" {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </TabsContent>
                         <TabsContent value="gallery">
                             <div className="space-y-4">
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
                                                     {isUploading ? (
                                                        <>
                                                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                                                            <p className="text-sm font-semibold text-foreground">Зураг хуулж байна...</p>
                                                        </>
                                                     ) : (
                                                        <>
                                                            <div className="p-3 bg-secondary rounded-full border mb-4">
                                                                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                                            </div>
                                                            <p className="mt-2 text-sm font-semibold text-foreground">Зураг хуулах</p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                PNG, JPG, WEBP төрлийн зураг сонгоно уу.
                                                            </p>
                                                        </>
                                                     )}
                                                </div>
                                            )}
                                        </FormItem>
                                    )}
                                />
                             </div>
                        </TabsContent>
                        <TabsContent value="contract" className="space-y-6">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Үйлчилгээний гэрээ</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        readOnly
                                        value={contractText}
                                        className="min-h-[250px] text-xs bg-muted/30"
                                    />
                                </CardContent>
                            </Card>
                            
                             {isContractSigned && hotelInfo?.contractSignedOn ? (
                                <div className="rounded-lg border bg-secondary/50 p-4 text-center">
                                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                    <p className="font-semibold text-green-700 dark:text-green-400">Гэрээ баталгаажсан</p>
                                    <p className="text-sm text-muted-foreground">
                                        Та {format(new Date(hotelInfo.contractSignedOn), 'yyyy оны M сарын d-нд')} <strong className="text-foreground">{hotelInfo.signatureName}</strong> нэрээр гэрээг баталгаажуулсан байна.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4 p-4 border rounded-lg">
                                    <FormField
                                        control={form.control}
                                        name="termsAccepted"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={isContractSigned}
                                                    />
                                                </FormControl>
                                                <FormLabel className="text-sm font-medium">
                                                    Би гэрээний нөхцөлийг уншиж, танилцан, зөвшөөрч байна.
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="signatureName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Цахим гарын үсэг</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder="Та энд өөрийн нэрээ бүтэн бичнэ үү" 
                                                        {...field} 
                                                        disabled={isContractSigned}
                                                        value={field.value ?? ""}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                   Энэ нь таныг гэрээг зөвшөөрснийг баталгаажуулна.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>

                <Button type="submit" className="w-full" disabled={!form.formState.isDirty || isUploading}>
                     {isUploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     ) : null }
                    {isUploading ? 'Зураг хуулж байна...' : 'Хадгалах'}
                </Button>
            </form>
        </Form>
    )
}
