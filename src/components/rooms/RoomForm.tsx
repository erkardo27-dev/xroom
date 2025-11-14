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
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRoom } from "@/context/RoomContext";
import { Amenity, locations, Room } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "../ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const amenityOptions: { id: Amenity, label: string }[] = [
    { id: 'wifi', label: 'Wi-Fi' },
    { id: 'parking', label: 'Машины зогсоол' },
    { id: 'restaurant', label: 'Ресторан' },
];

const formSchema = z.object({
  hotelName: z.string().min(2, { message: "Зочид буудлын нэр оруулна уу." }),
  roomName: z.string().min(2, { message: "Өрөөний нэр оруулна уу." }),
  price: z.coerce.number().positive({ message: "Үнэ эерэг тоо байх ёстой." }),
  totalQuantity: z.coerce.number().int().min(1, { message: "Хамгийн багадаа 1 өрөө байх ёстой." }),
  location: z.string({ required_error: "Байршил сонгоно уу."}),
  imageIds: z.array(z.string()).refine(value => value.some(item => item), {
    message: "You have to select at least one item.",
  }),
  amenities: z.array(z.string()).refine(value => value.some(item => item), {
    message: "You have to select at least one item.",
  }),
});

type RoomFormProps = {
    onFormSubmit: () => void;
    roomToEdit?: Room | null;
};

export function RoomForm({ onFormSubmit, roomToEdit }: RoomFormProps) {
    const { toast } = useToast();
    const { addRoom, updateRoom } = useRoom();
    const { userEmail } = useAuth();
    
    const isEditMode = !!roomToEdit;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            hotelName: "",
            roomName: "",
            price: 0,
            totalQuantity: 1,
            imageIds: [],
            amenities: [],
        },
    });
    
    useEffect(() => {
        if (isEditMode && roomToEdit) {
            form.reset({
                ...roomToEdit,
                price: roomToEdit.price || 0,
                totalQuantity: roomToEdit.totalQuantity || 1,
            });
        } else {
            form.reset({
                hotelName: "",
                roomName: "",
                price: 0,
                totalQuantity: 1,
                location: undefined,
                imageIds: [],
                amenities: [],
            });
        }
    }, [roomToEdit, isEditMode, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (!userEmail) {
             toast({
                variant: "destructive",
                title: "Алдаа",
                description: "Нэвтэрч орж байж өрөө нэмэх/засах боломжтой.",
            });
            return;
        }

        if (isEditMode && roomToEdit) {
             const updatedRoom: Room = {
                ...roomToEdit,
                ...values,
                amenities: values.amenities as Amenity[],
                // When editing, if total quantity changes, we might need to adjust available quantity
                availableQuantity: roomToEdit.availableQuantity + (values.totalQuantity - roomToEdit.totalQuantity),
            };
            updateRoom(updatedRoom);
             toast({
                title: "Амжилттай заслаа!",
                description: `${values.hotelName}-н ${values.roomName} өрөөний мэдээлэл шинэчлэгдлээ.`,
            });
        } else {
            const newRoomData: Omit<Room, 'id' | 'rating' | 'distance' | 'availableQuantity'> = {
                ...values,
                amenities: values.amenities as Amenity[],
                ownerId: userEmail,
            };
            addRoom(newRoomData);
             toast({
                title: "Өрөө бүртгэгдлээ!",
                description: `${values.hotelName}-д ${values.roomName} өрөөг ${values.price.toLocaleString()}₮ үнээр бүртгэв.`,
            });
        }
       
        form.reset();
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
                                <Input placeholder="ж.нь: Их Оазис" {...field} />
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
                            <FormLabel>Өрөөний нэр</FormLabel>
                            <FormControl>
                                <Input placeholder="ж.нь: Делюкс люкс" {...field} />
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
                            <FormLabel>Энэ шөнийн үнэ (₮)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="ж.нь: 150000" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="totalQuantity"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Нийт өрөөний тоо</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="ж.нь: 5" {...field} />
                            </FormControl>
                             <FormDescription>
                                Энэ төрлийн нийт хэдэн өрөө байгаа вэ?
                            </FormDescription>
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
                                <SelectValue placeholder="Өрөөний байршил сонгоно уу" />
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
                    name="imageIds"
                    render={() => (
                        <FormItem>
                        <div className="mb-4">
                            <FormLabel className="text-base">Зураг</FormLabel>
                            <FormDescription>
                                Хамгийн багадаа нэг зураг сонгоно уу.
                            </FormDescription>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                        {PlaceHolderImages.slice(0, 6).map((item) => (
                            <FormField
                            key={item.id}
                            control={form.control}
                            name="imageIds"
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
                                    <FormLabel className="text-sm font-normal">
                                        {item.id}
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

                <FormField
                    control={form.control}
                    name="amenities"
                    render={() => (
                        <FormItem>
                        <div className="mb-4">
                            <FormLabel className="text-base">Нэмэлт үйлчилгээ</FormLabel>
                             <FormDescription>
                                Хамгийн багадаа нэг үйлчилгээ сонгоно уу.
                            </FormDescription>
                        </div>
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
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">
                    {isEditMode ? 'Мэдээлэл хадгалах' : 'Өрөөгөө шөнөөр бүртгүүлэх'}
                </Button>
            </form>
        </Form>
    )
}
