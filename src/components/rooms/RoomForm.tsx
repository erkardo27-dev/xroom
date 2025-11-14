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
import { Amenity, Room } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Checkbox } from "../ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const amenityOptions: { id: Amenity, label: string }[] = [
    { id: 'wifi', label: 'Wi-Fi' },
    { id: 'parking', label: 'Машины зогсоол' },
    { id: 'restaurant', label: 'Ресторан' },
];

const formSchema = z.object({
  roomName: z.string().min(2, { message: "Өрөөний нэр оруулна уу." }),
  price: z.coerce.number().positive({ message: "Үнэ эерэг тоо байх ёстой." }),
  totalQuantity: z.coerce.number().int().min(1, { message: "Хамгийн багадаа 1 өрөө байх ёстой." }),
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
    const { userEmail, hotelInfo } = useAuth();
    
    const isEditMode = !!roomToEdit;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
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
                roomName: "",
                price: 0,
                totalQuantity: 1,
                imageIds: [],
                amenities: [],
            });
        }
    }, [roomToEdit, isEditMode, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (!userEmail || !hotelInfo) {
             toast({
                variant: "destructive",
                title: "Алдаа",
                description: "Нэвтэрч орж байж өрөө нэмэх/засах боломжтой.",
            });
            return;
        }

        const roomDataPayload = {
            ...values,
            amenities: values.amenities as Amenity[],
            ownerId: userEmail,
            hotelName: hotelInfo.hotelName,
            location: hotelInfo.location,
        };

        if (isEditMode && roomToEdit) {
             const updatedRoom: Room = {
                ...roomToEdit,
                ...roomDataPayload,
                // When editing, if total quantity changes, we might need to adjust available quantity
                availableQuantity: roomToEdit.availableQuantity + (values.totalQuantity - roomToEdit.totalQuantity),
            };
            updateRoom(updatedRoom);
             toast({
                title: "Амжилттай заслаа!",
                description: `${values.roomName} өрөөний мэдээлэл шинэчлэгдлээ.`,
            });
        } else {
            addRoom(roomDataPayload);
             toast({
                title: "Өрөө бүртгэгдлээ!",
                description: `${hotelInfo.hotelName}-д ${values.roomName} өрөөг ${values.price.toLocaleString()}₮ үнээр бүртгэв.`,
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
                    {isEditMode ? 'Мэдээлэл хадгалах' : 'Шинэ өрөө нэмэх'}
                </Button>
            </form>
        </Form>
    )
}
