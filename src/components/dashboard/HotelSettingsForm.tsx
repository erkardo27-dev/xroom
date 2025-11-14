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
import { locations } from "@/lib/data";
import { useEffect } from "react";
import { Separator } from "../ui/separator";

const formSchema = z.object({
  hotelName: z.string().min(2, { message: "Зочид буудлын нэр оруулна уу." }),
  location: z.string({ required_error: "Байршил сонгоно уу."}),
  phoneNumber: z.string().min(8, { message: "Утасны дугаар буруу байна." }),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountHolderName: z.string().optional(),
});

type HotelSettingsFormProps = {
    onFormSubmit: () => void;
};


export function HotelSettingsForm({ onFormSubmit }: HotelSettingsFormProps) {
    const { hotelInfo, updateHotelInfo } = useAuth();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            hotelName: hotelInfo?.hotelName || "",
            location: hotelInfo?.location || undefined,
            phoneNumber: hotelInfo?.phoneNumber || "",
            bankName: hotelInfo?.bankName || "",
            accountNumber: hotelInfo?.accountNumber || "",
            accountHolderName: hotelInfo?.accountHolderName || "",
        },
    });
    
    useEffect(() => {
        if (hotelInfo) {
            form.reset(hotelInfo);
        }
    }, [hotelInfo, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        updateHotelInfo(values);
        onFormSubmit();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
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
                <Separator className="my-6" />
                <div>
                    <h3 className="text-lg font-medium">Төлбөрийн данс</h3>
                    <p className="text-sm text-muted-foreground">
                        Зочны төлсөн төлбөр энэ данс руу автоматаар шилжинэ.
                    </p>
                </div>
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


                <Button type="submit" className="w-full">
                    Хадгалах
                </Button>
            </form>
        </Form>
    )
}
