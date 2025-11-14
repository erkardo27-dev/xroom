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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email({ message: "И-мэйл хаяг буруу байна." }),
  password: z.string().min(6, { message: "Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой." }),
});

const registerSchema = z.object({
  hotelName: z.string().min(2, { message: "Зочид буудлын нэр оруулна уу." }),
  location: z.string({ required_error: "Байршил сонгоно уу."}),
  phoneNumber: z.string().min(8, { message: "Утасны дугаар буруу байна." }),
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
    
    const loginForm = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const registerForm = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { 
            hotelName: "", 
            location: undefined, 
            phoneNumber: "", 
            email: "", 
            password: ""
        },
    });

    async function onLoginSubmit(values: LoginFormValues) {
        // In a real app, you'd fetch this for a logging-in user
        const hotelInfo = { hotelName: "Миний буудал", location: "Хотын төв", phoneNumber: "88118811"};
        await login(values.email, hotelInfo);
        onFormSubmit();
    }
    
    async function onRegisterSubmit(values: RegisterFormValues) {
        await login(values.email, { 
            hotelName: values.hotelName, 
            location: values.location,
            phoneNumber: values.phoneNumber,
        });
        onFormSubmit();
    }

    return (
        <Tabs defaultValue="register" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Нэвтрэх</TabsTrigger>
                <TabsTrigger value="register">Бүртгүүлэх</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
                <Card>
                    <CardHeader>
                        <CardTitle>Нэвтрэх</CardTitle>
                        <CardDescription>
                            Бүртгэлтэй хэрэглэгч мэдээллээ оруулан нэвтэрнэ үү.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <Form {...loginForm}>
                            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                                <FormField
                                    control={loginForm.control}
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
                                    control={loginForm.control}
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
                                    Нэвтрэх
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="register">
                <Card>
                    <CardHeader>
                        <CardTitle>Бүртгүүлэх</CardTitle>
                        <CardDescription>
                            Шинээр бүртгүүлж, зочид буудлын мэдээллээ оруулна уу.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <Form {...registerForm}>
                            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                                <FormField
                                    control={registerForm.control}
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
                                    control={registerForm.control}
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
                                    control={registerForm.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Утасны дугаар</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Мэдэгдэл хүлээн авах дугаар" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={registerForm.control}
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
                                    control={registerForm.control}
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
                                    Бүртгүүлэх
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
