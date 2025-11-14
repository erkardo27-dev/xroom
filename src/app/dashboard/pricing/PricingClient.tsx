
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Construction } from "lucide-react";


export default function PricingClient() {
  const { userEmail, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, isAuthLoading, router]);

  const isLoading = isAuthLoading;

  if (isLoading || !isLoggedIn) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-[60vh] bg-muted/50 rounded-xl border-2 border-dashed">
        <Alert className="max-w-md text-center bg-transparent border-none">
            <div className="flex justify-center mb-4">
                <Construction className="h-12 w-12 text-muted-foreground" />
            </div>
            <AlertTitle className="text-xl font-bold">Тун удахгүй!</AlertTitle>
            <AlertDescription className="mt-2">
                Үнийн удирдлагын дэлгэрэнгүй хэсэг хөгжүүлэлтийн шатанд байна. Эндээс та олон өдрийн үнийг нэг дор удирдах боломжтой болно.
            </AlertDescription>
        </Alert>
    </div>
  )
}
