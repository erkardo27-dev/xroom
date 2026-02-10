"use client";

import { useRoom } from "@/context/RoomContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export function ChannelMapping() {
    const { rooms, updateRoom } = useRoom();
    const { userUid } = useAuth();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    // Store local state for inputs before saving: { roomId: { channexRoomTypeId: string, channexRatePlanId: string } }
    const [mappingData, setMappingData] = useState<Record<string, { roomId: string, rateId: string }>>({});

    // Filter rooms owned by current user
    const myRooms = rooms.filter(r => r.ownerId === userUid);

    useEffect(() => {
        // Initialize state from existing room data
        const initialData: Record<string, { roomId: string, rateId: string }> = {};
        myRooms.forEach(room => {
            initialData[room.id] = {
                roomId: room.channexRoomTypeId || "",
                rateId: room.channexRatePlanId || ""
            };
        });
        setMappingData(initialData);
    }, [rooms, userUid]);

    const handleInputChange = (roomId: string, field: 'roomId' | 'rateId', value: string) => {
        setMappingData(prev => ({
            ...prev,
            [roomId]: {
                ...prev[roomId],
                [field]: value
            }
        }));
    };

    const handleSave = async (room: import("@/lib/data").Room) => {
        try {
            setLoading(true);
            const data = mappingData[room.id];

            // Update room in Firestore via RoomContext
            await updateRoom({
                ...room,
                channexRoomTypeId: data.roomId,
                channexRatePlanId: data.rateId
            });

            toast({
                title: "Амжилттай хадгаллаа",
                description: `${room.roomName} холболт шинэчлэгдлээ.`,
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Алдаа",
                description: "Хадгалахад алдаа гарлаа.",
            });
        } finally {
            setLoading(false);
        }
    };

    if (myRooms.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">Танд одоогоор өрөө бүртгэлгүй байна.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mt-6 border-dashed">
            <CardHeader>
                <CardTitle className="text-lg">Өрөөний холболт (Mapping)</CardTitle>
                <CardDescription>
                    XRoom дээрх өрөөнүүдээ Channex дээрх ID-тай нь холбоно уу.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {myRooms.map((room) => (
                    <div key={room.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border-b pb-4 last:border-0 last:pb-0">
                        <div className="md:col-span-4">
                            <Label className="text-xs text-muted-foreground uppercase mb-1 block">XRoom Өрөө</Label>
                            <div className="font-medium text-sm pt-2">{room.roomName}</div>
                            <div className="text-xs text-muted-foreground">{room.location}</div>
                        </div>

                        <div className="md:col-span-3">
                            <Label className="text-xs mb-1.5 block">Channex Room ID</Label>
                            <Input
                                placeholder="Room ID"
                                value={mappingData[room.id]?.roomId || ""}
                                onChange={(e) => handleInputChange(room.id, 'roomId', e.target.value)}
                                className="h-8"
                            />
                        </div>

                        <div className="md:col-span-3">
                            <Label className="text-xs mb-1.5 block">Channex Rate ID</Label>
                            <Input
                                placeholder="Rate Plan ID"
                                value={mappingData[room.id]?.rateId || ""}
                                onChange={(e) => handleInputChange(room.id, 'rateId', e.target.value)}
                                className="h-8"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Button
                                size="sm"
                                className="w-full"
                                disabled={loading}
                                onClick={() => handleSave(room)}
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                Хадгалах
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
