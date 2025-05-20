import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function SkeletonSection() {
  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-1 pb-2">
        <div className="h-4 w-48 bg-muted animate-pulse rounded" />
        <div className="h-6 w-64 bg-muted animate-pulse rounded mt-2" />
      </CardHeader>

      <CardContent>
        <div className="bg-muted rounded-xl p-6 border flex flex-col items-center justify-center text-center shadow-inner space-y-4">
          {/* Simulando texto de status */}
          <div className="h-4 w-40 bg-gray-200 animate-pulse rounded" />

          {/* Simulando QR Code */}
          <div className="w-56 h-56 bg-gray-200 animate-pulse rounded-lg shadow-md" />

          {/* Simulando descrição */}
          <div className="h-3 w-56 bg-gray-200 animate-pulse rounded" />
          <div className="h-3 w-32 bg-gray-200 animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  )
}
