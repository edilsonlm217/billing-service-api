import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function QrCodeTimeOutSection() {
  const handleRetry = () => {
    location.reload()
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-1 pb-2">
        <CardTitle className="text-xl font-semibold text-foreground mt-1">
          O QR Code expirou
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Tempo de leitura expirado
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-muted rounded-xl p-6 border flex flex-col items-center justify-center text-center shadow-inner"
        >
          <>
            <p className="text-base font-medium text-muted-foreground mb-4">
              O tempo para escanear o QR Code expirou. Isso pode acontecer se você demorar muito para escanear.
            </p>
            <Button onClick={handleRetry} variant="default">
              Tentar novamente
            </Button>
          </>
        </motion.div>
      </CardContent>
    </Card>
  )
}
