"use client";

import { useState } from "react";
import TimelineGrid from "./TimelineGrid";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from "lucide-react";
import { addDays, format, startOfDay, subDays } from "date-fns";
import { mn } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import ReservationSheet from "./ReservationSheet";
import { RoomInstance } from "@/lib/data";

import { useRoom } from "@/context/RoomContext";

export default function CalendarClient() {
    const { roomInstances } = useRoom();
    const [startDate, setStartDate] = useState(startOfDay(new Date()));
    const [daysToShow, setDaysToShow] = useState(14);
    const [selectedInstance, setSelectedInstance] = useState<RoomInstance | undefined>(undefined);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handlePrev = () => setStartDate(prev => subDays(prev, 7));
    const handleNext = () => setStartDate(prev => addDays(prev, 7));
    const handleToday = () => setStartDate(startOfDay(new Date()));

    const handleCellClick = (instance: RoomInstance, date: Date) => {
        setSelectedInstance(instance);
        setSelectedDate(date);
        setIsSheetOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-background p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        {format(startDate, 'yyyy оны M-р сар', { locale: mn })}
                    </h2>
                    <div className="text-sm text-muted-foreground hidden sm:block">
                        ({format(startDate, 'd')}-нээс хойш {daysToShow} хоног)
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-md bg-muted/20">
                        <Button variant="ghost" size="icon" onClick={handlePrev} className="rounded-r-none hover:bg-muted">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleToday} className="rounded-none border-x hover:bg-muted px-4 font-normal">
                            Өнөөдөр
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleNext} className="rounded-l-none hover:bg-muted">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="icon" title="Өдөр сонгох">
                                <CalendarIcon className="w-4 h-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={(date) => date && setStartDate(date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <select
                        className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={daysToShow}
                        onChange={(e) => setDaysToShow(Number(e.target.value))}
                    >
                        <option value={7}>7 хоног</option>
                        <option value={14}>14 хоног</option>
                        <option value={30}>30 хоног</option>
                    </select>
                </div>
            </div>

            <TimelineGrid
                selectedDate={startDate}
                roomInstances={roomInstances}
                daysToShow={daysToShow}
                onCellClick={handleCellClick}
            />

            <div className="flex gap-4 text-xs text-muted-foreground px-2">
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Захиалгатай (Booked)</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> Орсон (Occupied)</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500 rounded-sm"></div> Засвартай (Maint)</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-500 rounded-sm"></div> Хаалттай (Closed)</div>
            </div>

            <ReservationSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                selectedDate={selectedDate}
                selectedInstance={selectedInstance}
            />
        </div>
    );
}
