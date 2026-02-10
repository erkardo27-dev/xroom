"use client";

import { useMemo, useState } from "react";
import { format, eachDayOfInterval, addDays, isSameDay } from "date-fns";
import { mn } from "date-fns/locale";
import { RoomInstance, RoomStatus } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
    DragEndEvent,
    DragStartEvent
} from "@dnd-kit/core";
import { reservationService } from "@/services/reservationService";
import { useToast } from "@/hooks/use-toast";

type TimelineGridProps = {
    selectedDate: Date;
    roomInstances: RoomInstance[];
    daysToShow?: number;
    onCellClick?: (instance: RoomInstance, date: Date) => void;
};

// --- Draggable Component ---
function DraggableReservation({
    id,
    bookingCode,
    status,
    children,
    className
}: {
    id: string,
    bookingCode: string,
    status: string,
    children: React.ReactNode,
    className?: string
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `res-${id}`, // draggable ID
        data: { bookingCode, status }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
        opacity: 0.8,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(className, isDragging ? "shadow-xl ring-2 ring-primary relative z-50 pointer-events-none" : "")}
        >
            {children}
        </div>
    );
}

// --- Droppable Cell Component ---
function DroppableCell({
    id,
    date,
    instance,
    children,
    onClick,
    className
}: {
    id: string,
    date: Date,
    instance: RoomInstance,
    children: React.ReactNode,
    onClick?: () => void,
    className?: string
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        data: { date, instance }
    });

    return (
        <div
            ref={setNodeRef}
            onClick={onClick}
            className={cn(
                className,
                isOver ? "bg-blue-100 ring-2 ring-inset ring-blue-400 z-10" : ""
            )}
        >
            {children}
        </div>
    );
}


export default function TimelineGrid({
    selectedDate,
    roomInstances,
    daysToShow = 14,
    onCellClick
}: TimelineGridProps) {
    const { toast } = useToast();
    const [activeId, setActiveId] = useState<string | null>(null);

    const dates = useMemo(() => {
        return eachDayOfInterval({
            start: selectedDate,
            end: addDays(selectedDate, daysToShow - 1)
        });
    }, [selectedDate, daysToShow]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            const bookingCode = active.data.current?.bookingCode;
            const newDate = over.data.current?.date as Date;
            const newInstance = over.data.current?.instance as RoomInstance;

            if (!bookingCode || !newDate || !newInstance) return;

            toast({ description: "Шилжүүлж байна..." });

            try {
                const reservation = await reservationService.getReservationByCode(bookingCode);

                if (!reservation) {
                    toast({ title: "Алдаа", description: "Захиалга олдсонгүй (Manual booking?).", variant: "destructive" });
                    return;
                }

                if (reservation.source === 'manual' && !reservation.id) {
                    toast({ title: "Алдаа", description: "Энэ захиалгыг системд бүртгээгүй тул шилжүүлэх боломжгүй.", variant: "destructive" });
                    return;
                }

                await reservationService.moveReservation(reservation.id, newDate, newInstance.instanceId);
                toast({ title: "Амжилттай", description: "Захиалга шилжлээ." });

                // Realtime, so we rely on context update
            } catch (e) {
                console.error(e);
                toast({ title: "Алдаа", description: "Шилжүүлж чадсангүй.", variant: "destructive" });
            }
        }
    };

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="border rounded-md overflow-x-auto select-none">
                {/* Header Row */}
                <div
                    className="grid bg-muted/50 border-b min-w-max"
                    style={{ gridTemplateColumns: `200px repeat(${daysToShow}, minmax(100px, 1fr))` }}
                >
                    <div className="p-3 font-medium text-sm sticky left-0 bg-background z-20 border-r flex items-center">
                        Өрөөнүүд
                    </div>
                    {dates.map(date => (
                        <div key={date.toString()} className="p-2 text-center border-r last:border-r-0">
                            <div className="text-xs text-muted-foreground uppercase font-semibold">
                                {format(date, 'EEE', { locale: mn })}
                            </div>
                            <div className="text-sm font-bold">
                                {format(date, 'd')}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Rows */}
                <div className="min-w-max">
                    {roomInstances.map(instance => (
                        <div
                            key={instance.instanceId}
                            className="grid border-b last:border-b-0 hover:bg-muted/5 transition-colors"
                            style={{ gridTemplateColumns: `200px repeat(${daysToShow}, minmax(100px, 1fr))` }}
                        >
                            {/* Room info sticky column */}
                            <div className="p-3 sticky left-0 bg-background z-10 border-r flex flex-col justify-center">
                                <div className="font-medium text-sm">
                                    Өрөө {instance.roomNumber}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {instance.status === 'maintenance' ? 'Засвартай' : 'Хэвийн'}
                                </div>
                            </div>

                            {/* Date cells */}
                            {dates.map(date => {
                                const dateKey = format(date, 'yyyy-MM-dd');
                                const dayData = instance.overrides?.[dateKey];
                                const status = dayData?.status || instance.status;
                                const isBooked = status === 'booked' || status === 'occupied';
                                const bookingCode = dayData?.bookingCode;

                                // Color logic
                                let bgClass = "bg-transparent";
                                let textClass = "";
                                let content = null;

                                if (status === 'booked') {
                                    bgClass = "bg-blue-100 hover:bg-blue-200";
                                    textClass = "text-blue-700";
                                    content = "Захиалга";
                                } else if (status === 'occupied') {
                                    bgClass = "bg-green-100 hover:bg-green-200";
                                    textClass = "text-green-700";
                                    content = "Орсон";
                                } else if (status === 'maintenance') {
                                    bgClass = "bg-orange-100/50";
                                    textClass = "text-orange-700";
                                    content = "Засвар";
                                } else if (status === 'closed') {
                                    bgClass = "bg-gray-100";
                                    content = "Хаалттай";
                                }

                                const cellId = `cell-${instance.instanceId}-${dateKey}`;

                                return (
                                    <DroppableCell
                                        key={cellId}
                                        id={cellId}
                                        date={date}
                                        instance={instance}
                                        onClick={() => onCellClick?.(instance, date)}
                                        className={cn(
                                            "h-16 p-1 border-r last:border-r-0 relative group cursor-pointer text-xs",
                                            !isBooked && !dayData?.status ? "hover:bg-muted/50" : ""
                                        )}
                                    >
                                        {isBooked && bookingCode ? (
                                            <DraggableReservation
                                                id={bookingCode}
                                                bookingCode={bookingCode}
                                                status={status}
                                                className={cn(
                                                    "w-full h-full rounded p-1 font-medium transition-shadow flex flex-col justify-center truncate",
                                                    bgClass, textClass
                                                )}
                                            >
                                                <span>{content}</span>
                                                <span className="opacity-75 text-[10px]">{bookingCode}</span>
                                            </DraggableReservation>
                                        ) : (
                                            <div className={cn("w-full h-full rounded p-1 flex items-center justify-center", bgClass, textClass)}>
                                                {content}
                                            </div>
                                        )}
                                    </DroppableCell>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <DragOverlay>
                {activeId ? (
                    <div className="bg-blue-500 text-white p-2 rounded shadow-lg w-32 text-xs font-bold">
                        Зөөж байна...
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
