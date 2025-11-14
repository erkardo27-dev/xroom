import Header from "@/components/layout/Header";
import { RoomProvider } from "@/context/RoomContext";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default function DashboardPage() {
  return (
    <RoomProvider>
      <div className="flex flex-col min-h-screen bg-muted/30 text-foreground">
        <Header isDashboard={true} />
        <main className="flex-1 container mx-auto py-8 px-4 md:px-8">
            <DashboardClient />
        </main>
      </div>
    </RoomProvider>
  );
}
