import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function RoomCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col">
      <Skeleton className="h-56 w-full" />
      <CardContent className="p-4 space-y-3 flex flex-col flex-1">
        <div className="flex justify-between items-start">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-10" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <div className="flex gap-4">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-5 w-1/3" />
        </div>
        
        <div className="flex-grow" />

        <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
        </div>

        <div className="flex justify-between items-end pt-4 border-t">
          <div className="space-y-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
      </CardContent>
    </Card>
  )
}
