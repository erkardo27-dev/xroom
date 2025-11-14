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

const formSchema = z.object({
  hotelName: z.string().min(2, { message: "Зочид буудлын нэр оруулна уу." }),
  location: z.string({ required_error: "Байршил сонгоно уу."}),
  phoneNumber: z.string().min(8, { message: "Утасны дугаар буруу байна." }),
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Button type="submit" className="w-full">
                    Хадгалах
                </Button>
            </form>
        </Form>
    )
}
