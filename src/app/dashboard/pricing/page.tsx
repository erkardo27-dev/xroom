import Header from "@/components/layout/Header";
import { RoomProvider } from "@/context/RoomContext";
import PricingClient from "./PricingClient";

export default function PricingPage() {
  return (
    <RoomProvider>
      <div className="flex flex-col min-h-screen bg-muted/30 text-foreground">
        <Header isDashboard={true} />
        <main className="flex-1 container mx-auto py-8 px-4 md:px-8">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Үнийн удирдлага</h1>
            <PricingClient />
        </main>
      </div>
    </RoomProvider>
  );
}
