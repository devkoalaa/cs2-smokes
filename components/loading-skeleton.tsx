import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function MapGridSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full sm:w-[180px]" />
        <Skeleton className="h-10 w-full sm:w-[180px]" />
      </div>

      {/* Results count Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Maps Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="group hover:shadow-xl transition-all duration-300 bg-card border-border">
            <CardContent className="p-0">
              <div className="relative overflow-hidden rounded-t-lg h-48">
                <Skeleton className="w-full h-full" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-md" />
                  <Skeleton className="h-6 w-12 rounded-md" />
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="w-4 h-4 rounded" />
                  ))}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function MapViewerSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Controls Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Skeleton className="h-10 w-20" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      {/* Map Controls Skeleton */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Map Container Skeleton */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-48" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
              
              <div className="relative overflow-hidden rounded-lg border border-border bg-muted/20">
                <Skeleton className="w-full h-96" />
              </div>
            </div>

            {/* Controls Panel Skeleton */}
            <div className="w-full lg:w-80 space-y-4">
              <div className="space-y-4">
                <div className="grid w-full grid-cols-2">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Skeleton key={index} className="w-full h-16" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div>
                <Skeleton className="h-6 w-24 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-9" />
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section Skeleton */}
        <div className="text-center mb-16">
          <Skeleton className="h-6 w-48 mx-auto mb-6 rounded-full" />
          <Skeleton className="h-16 w-96 mx-auto mb-6" />
          <Skeleton className="h-6 w-3/4 mx-auto mb-8" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>

        {/* Stats Section Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                </div>
                <Skeleton className="h-8 w-16 mx-auto mb-1" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section Skeleton */}
        <div className="mb-16">
          <Skeleton className="h-8 w-80 mx-auto mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-40 mx-auto mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Maps Section Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <MapGridSkeleton />
        </div>
      </main>
    </div>
  )
}
