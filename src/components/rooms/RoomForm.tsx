
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
import { Amenity, Room, amenityOptions } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Checkbox } from "../ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo } from "react";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Check, Image as ImageIcon } from "lucide-react";

const formSchema = z.object({
  roomName: z.string().min(2, { message: "Өрөөний нэр оруулна уу." }),
  price: z.coerce.number().positive({ message: "Үнэ эерэг тоо байх ёстой." }),
  originalPrice: z.coerce.number().optional().nullable(),
  totalQuantity: z.coerce.number().int().min(1, { message: "Хамгийн багадаа 1 өрөө байх ёстой." }),
  imageIds: z.array(z.string()).refine(value => value.length > 0, {
    message: "Та дор хаяж нэг зураг сонгох шаардлагатай.",
  }),
  amenities: z.array(z.string()).refine(value => value.some(item => item), {
    message: "You have to select at least one item.",
  }),
}).refine(data => !data.originalPrice || data.originalPrice > data.price, {
    message: "Хямдрахаас өмнөх үнэ одоогийн үнээс их байх ёстой.",
    path: ["originalPrice"],
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

    const hotelGalleryImages = useMemo(() => {
        if (!hotelInfo?.galleryImageIds || hotelInfo.galleryImageIds.length === 0) return [];
        return hotelInfo.galleryImageIds.map(id => 
            PlaceHolderImages.find(p_img => p_img.id === id)
        ).filter(Boolean);
    }, [hotelInfo?.galleryImageIds]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            roomName: "",
            price: 0,
            originalPrice: undefined,
            totalQuantity: 1,
            imageIds: [],
            amenities: hotelInfo?.amenities || [],
        },
    });
    
    useEffect(() => {
        if (isEditMode && roomToEdit) {
            form.reset({
                ...roomToEdit,
                price: roomToEdit.price || 0,
                originalPrice: roomToEdit.originalPrice || undefined,
                totalQuantity: roomToEdit.totalQuantity || 1,
            });
        } else {
            form.reset({
                roomName: "",
                price: 0,
                originalPrice: undefined,
                totalQuantity: 1,
                imageIds: [],
                amenities: hotelInfo?.amenities || [],
            });
        }
    }, [roomToEdit, isEditMode, form, hotelInfo]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (!userEmail || !hotelInfo || !hotelInfo.phoneNumber) {
             toast({
                variant: "destructive",
                title: "Алдаа",
                description: "Нэвтэрч орж, буудлын тохиргоог бүрэн хийсний дараа өрөө нэмэх/засах боломжтой.",
            });
            return;
        }

        const roomDataPayload = {
            ...values,
            originalPrice: values.originalPrice || undefined,
            amenities: values.amenities as Amenity[],
            ownerId: userEmail,
            hotelName: hotelInfo.hotelName,
            location: hotelInfo.location,
            phoneNumber: hotelInfo.phoneNumber,
        };

        if (isEditMode && roomToEdit) {
             const updatedRoom: Room = {
                ...roomToEdit,
                ...roomDataPayload,
            };
            updateRoom(updatedRoom);
             toast({
                title: "Амжилттай заслаа!",
                description: `${values.roomName} өрөөний төрлийн мэдээлэл шинэчлэгдлээ.`,
            });
        } else {
            addRoom(roomDataPayload as Omit<Room, 'id' | 'rating' | 'distance' | 'likes'>);
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
                            <FormLabel>Өрөөний төрлийн нэр</FormLabel>
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
                    name="originalPrice"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Хямдрахаас өмнөх үнэ (₮)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="ж.нь: 200000" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormDescription>
                                Хэрэв хямдрал зарлах бол энд хуучин үнийг оруулна.
                            </FormDescription>
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
                                <Input type="number" placeholder="ж.нь: 5" {...field} disabled={isEditMode} />
                            </FormControl>
                             <FormDescription>
                                Энэ төрлийн нийт хэдэн өрөө байгаа вэ? (Үүсгэсний дараа засах боломжгүй)
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
                            <FormLabel className="text-base">Өрөөний зураг</FormLabel>
                            <FormDescription>
                                Энэ өрөөг илэрхийлэх зургуудыг буудлынхаа зургийн сангаас сонгоно уу.
                            </FormDescription>
                        </div>
                        {hotelGalleryImages.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {hotelGalleryImages.map((item) => (
                                <FormField
                                key={item!.id}
                                control={form.control}
                                name="imageIds"
                                render={({ field }) => {
                                    const isChecked = field.value?.includes(item!.id);
                                    return (
                                    <FormItem key={item!.id}>
                                        <FormControl>
                                            <Checkbox
                                                id={`room-image-${item!.id}`}
                                                checked={isChecked}
                                                onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([...(field.value || []), item!.id])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                            (value) => value !== item!.id
                                                            )
                                                        )
                                                }}
                                                className="sr-only"
                                            />
                                        </FormControl>
                                        <FormLabel htmlFor={`room-image-${item!.id}`} className="block cursor-pointer rounded-lg border-2 data-[state=checked]:border-primary transition-all overflow-hidden relative">
                                                <Image src={item!.imageUrl} alt={item!.description} width={200} height={150} className="aspect-video object-cover" />
                                                {isChecked && <div className="absolute inset-0 bg-primary/70 flex items-center justify-center"><Check className="w-8 h-8 text-primary-foreground" /></div>}
                                        </FormLabel>
                                    </FormItem>
                                    )
                                }}
                                />
                            ))}
                            </div>
                        ) : (
                            <Alert variant="default" className="bg-amber-50 border-amber-200">
                                <ImageIcon className="h-4 w-4 text-amber-600" />
                                <AlertTitle className="text-amber-800">Зургийн сан хоосон байна</AlertTitle>
                                <AlertDescription className="text-amber-700">
                                    Эхлээд Буудлын тохиргоо &gt; Зургийн сан хэсэгт зураг нэмнэ үү.
                                </AlertDescription>
                            </Alert>
                        )}
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
                                Энэ өрөөнд байх үйлчилгээнүүдийг сонгоно уу.
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
                <Button type="submit" className="w-full">
                    {isEditMode ? 'Мэдээлэл хадгалах' : 'Шинэ төрөл нэмэх'}
                </Button>
            </form>
        </Form>
    )
}
