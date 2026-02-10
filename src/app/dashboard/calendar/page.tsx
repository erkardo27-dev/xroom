import Header from "@/components/layout/Header";
import { RoomProvider } from "@/context/RoomContext";
import CalendarClient from "@/components/dashboard/CalendarClient";

export default function CalendarPage() {
    return (
        <RoomProvider>
            <div className="flex flex-col min-h-screen bg-muted/30 text-foreground">
                <Header isDashboard={true} />
                <main className="flex-1 container max-w-[1400px] mx-auto py-8 px-4 md:px-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Захиалгын Календарь</h1>
                    <p className="text-muted-foreground mb-8">
                        Бүх өрөөний захиалгыг нэг дороос хянах, удирдах боломжтой Gantt chart загварын харагдац.
                    </p>
                    <CalendarClient />
                </main>
            </div>
        </RoomProvider>
    );
}
