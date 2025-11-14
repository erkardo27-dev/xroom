import Header from "@/components/layout/Header";
import { RoomProvider } from "@/context/RoomContext";
import StatsClient from "./StatsClient";

export default function StatsPage() {
  return (
    <RoomProvider>
      <div className="flex flex-col min-h-screen bg-muted/30 text-foreground">
        <Header isDashboard={true} />
        <main className="flex-1 container mx-auto py-8 px-4 md:px-8">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Статистик</h1>
            <StatsClient />
        </main>
      </div>
    </RoomProvider>
  );
}
