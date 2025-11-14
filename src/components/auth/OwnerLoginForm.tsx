"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email({ message: "И-мэйл хаяг буруу байна." }),
  password: z.string().min(6, { message: "Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой." }),
});

const registerSchema = z.object({
  hotelName: z.string().min(2, { message: "Зочид буудлын нэр оруулна уу." }),
  location: z.string({ required_error: "Байршил сонгоно уу."}),
  email: z.string().email({ message: "И-мэйл хаяг буруу байна." }),
  password: z.string().min(6, { message: "Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;


type OwnerLoginFormProps = {
    onFormSubmit: () => void;
};


export function OwnerLoginForm({ onFormSubmit }: OwnerLoginFormProps) {
    const { login } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);

    const loginForm = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const registerForm = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { hotelName: "", location: undefined, email: "", password: "" },
    });

    const form = isRegistering ? registerForm : loginForm;
    
    async function onSubmit(values: LoginFormValues | RegisterFormValues) {
        const hotelInfo = isRegistering 
            ? { hotelName: (values as RegisterFormValues).hotelName, location: (values as RegisterFormValues).location }
            // In a real app, you'd fetch this for a logging-in user
            : { hotelName: "Миний буудал", location: "Хотын төв"};

        await login(values.email, hotelInfo);
        onFormSubmit();
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                    {isRegistering && (
                        <>
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
                        </>
                    )}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>И-мэйл</FormLabel>
                                <FormControl>
                                    <Input placeholder="tanii@email.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Нууц үг</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full">
                        {isRegistering ? 'Бүртгүүлэх' : 'Нэвтрэх'}
                    </Button>
                </form>
            </Form>
             <div className="mt-4 text-center text-sm">
                {isRegistering ? "Бүртгэлтэй юу?" : "Бүртгэлгүй юу?"}{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => {
                    setIsRegistering(!isRegistering);
                    form.reset();
                }}>
                    {isRegistering ? "Нэвтрэх" : "Шинээр бүртгүүлэх"}
                </Button>
            </div>
        </>
    )
}