import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface Props {
  error: string | null
}

export default function SseErrorSection({ error }: Props) {
  const handleRetry = () => {
    location.reload()
  }

  return (
    <Card className="border-red-200 bg-red-50/50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 text-red-600 rounded-full p-2">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Problema na conexão em tempo real</p>
            <CardTitle className="text-lg font-semibold text-red-800">
              Não foi possível carregar a sessão
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pl-14">
        <p className="text-sm text-red-700 leading-relaxed">
          {error ?? 'Ocorreu um erro inesperado ao tentar carregar os dados da sessão.'}
        </p>
        <Button variant="outline" size="sm" onClick={handleRetry}>
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  )
}
