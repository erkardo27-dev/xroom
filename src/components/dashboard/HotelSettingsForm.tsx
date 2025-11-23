

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
import { Amenity, amenityOptions, locations } from "@/lib/data";
import { useEffect } from "react";
import { Check, CheckCircle } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { format } from "date-fns";

const formSchema = z.object({
  hotelName: z.string().min(2, { message: "Зочид буудлын нэр оруулна уу." }),
  location: z.string({ required_error: "Байршил сонгоно уу."}),
  phoneNumber: z.string().min(8, { message: "Утасны дугаар буруу байна." }),
  amenities: z.array(z.string()).optional(),
  galleryImageIds: z.array(z.string()).optional(),
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
    const { hotelInfo, updateHotelInfo } = useAuth();
    const isContractSigned = !!hotelInfo?.contractSignedOn;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: 'onChange', // Validate on change to enable button
        defaultValues: {
            hotelName: hotelInfo?.hotelName || "",
            location: hotelInfo?.location || undefined,
            phoneNumber: hotelInfo?.phoneNumber || "",
            amenities: hotelInfo?.amenities || [],
            galleryImageIds: hotelInfo?.galleryImageIds || [],
            bankName: hotelInfo?.bankName || "",
            accountNumber: hotelInfo?.accountNumber || "",
            accountHolderName: hotelInfo?.accountHolderName || "",
            signatureName: hotelInfo?.signatureName || "",
            termsAccepted: isContractSigned,
        },
    });
    
    useEffect(() => {
        if (hotelInfo) {
            form.reset({
                ...hotelInfo,
                amenities: hotelInfo.amenities || [],
                galleryImageIds: hotelInfo.galleryImageIds || [],
                signatureName: hotelInfo.signatureName || "",
                termsAccepted: !!hotelInfo.contractSignedOn,
            });
        }
    }, [hotelInfo, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const payload: Parameters<typeof updateHotelInfo>[0] = {
             hotelName: values.hotelName,
             location: values.location,
             phoneNumber: values.phoneNumber,
             amenities: values.amenities,
             galleryImageIds: values.galleryImageIds,
             bankName: values.bankName,
             accountNumber: values.accountNumber,
             accountHolderName: values.accountHolderName,
        };

        if (!isContractSigned && values.signatureName && values.termsAccepted) {
            payload.contractSignedOn = new Date().toISOString();
            payload.signatureName = values.signatureName;
        } else {
            payload.contractSignedOn = hotelInfo?.contractSignedOn;
            payload.signatureName = hotelInfo?.signatureName;
        }

        updateHotelInfo(payload);
        onFormSubmit();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <Tabs defaultValue="info" className="w-full">
                    <TabsList className="h-auto flex-wrap">
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
                                    <FormLabel>Байршил</FormLabel>
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
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Утасны дугаар</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Мэдэгдэл хүлээн авах дугаар" {...field} />
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
                            <FormField
                                control={form.control}
                                name="galleryImageIds"
                                render={() => (
                                    <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">Буудлын зургийн сан</FormLabel>
                                        <FormDescription>
                                            Танай буудлыг илэрхийлэх зургуудыг сонгоно уу. Энэ нь хэрэглэгчийн хуудсанд харагдана.
                                        </FormDescription>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {PlaceHolderImages.filter(img => img.id.startsWith("hotel-")).map((item) => (
                                        <FormField
                                        key={item.id}
                                        control={form.control}
                                        name="galleryImageIds"
                                        render={({ field }) => {
                                            const isChecked = field.value?.includes(item.id);
                                            return (
                                            <FormItem key={item.id}>
                                                <FormControl>
                                                    <Checkbox
                                                        id={`gallery-${item.id}`}
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...(field.value || []), item.id])
                                                                : field.onChange(
                                                                    field.value?.filter(
                                                                    (value) => value !== item.id
                                                                    )
                                                                )
                                                        }}
                                                        className="sr-only"
                                                    />
                                                </FormControl>
                                                <FormLabel htmlFor={`gallery-${item.id}`} className="block cursor-pointer rounded-lg border-2 data-[state=checked]:border-primary transition-all overflow-hidden relative">
                                                     <Image src={item.imageUrl} alt={item.description} width={200} height={150} className="aspect-video object-cover" />
                                                     {isChecked && <div className="absolute inset-0 bg-primary/70 flex items-center justify-center"><Check className="w-8 h-8 text-primary-foreground" /></div>}
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
                            
                             {isContractSigned ? (
                                <div className="rounded-lg border bg-secondary/50 p-4 text-center">
                                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                    <p className="font-semibold text-green-700 dark:text-green-400">Гэрээ баталгаажсан</p>
                                    <p className="text-sm text-muted-foreground">
                                        Та {format(new Date(hotelInfo.contractSignedOn!), 'yyyy оны M сарын d-нд')} <strong className="text-foreground">{hotelInfo.signatureName}</strong> нэрээр гэрээг баталгаажуулсан байна.
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

                <Button type="submit" className="w-full" disabled={!form.formState.isDirty}>
                    Хадгалах
                </Button>
            </form>
        </Form>
    )
}
