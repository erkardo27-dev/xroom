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
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  hotelName: z.string().min(2, { message: "Hotel name is required." }),
  roomName: z.string().min(2, { message: "Room name is required." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
});

export function AddRoomForm() {
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            hotelName: "",
            roomName: "",
            price: 0,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        // Mock submission
        console.log("New Room Data:", values);
        toast({
            title: "Room Listed!",
            description: `${values.roomName} at ${values.hotelName} has been listed for $${values.price}.`,
        });
        form.reset();
        // In a real app, you'd send this to the backend.
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                <FormField
                    control={form.control}
                    name="hotelName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Hotel Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. The Grand Oasis" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="roomName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Room Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Deluxe King Suite" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price for Tonight ($)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g. 150" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">
                    List Room for Tonight
                </Button>
            </form>
        </Form>
    )
}
