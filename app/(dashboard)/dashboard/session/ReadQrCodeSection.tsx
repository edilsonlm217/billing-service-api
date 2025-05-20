import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { SessionState } from '@/types/session'

interface Props {
  state: SessionState
}

export default function ReadQrCodeSection({ state }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-1 pb-2">
        <p className="text-sm text-muted-foreground">
          Nenhuma sessão ativa no momento
        </p>
        <CardTitle className="text-xl font-semibold text-foreground mt-1">
          Inicie sua conexão com o WhatsApp
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-muted rounded-xl p-6 border flex flex-col items-center justify-center text-center shadow-inner"
        >
          <>
            <p className="text-base font-medium text-muted-foreground mb-2">Pronto para conectar</p>

            {!state.qrCode ? (
              <div className="w-56 h-56 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
                <span className="text-sm text-gray-400">Gerando QR Code...</span>
              </div>
            ) : (
              <>
                <QRCodeSVG value={state.qrCode} size={224} className="rounded-md shadow-md" />
                <p className="text-sm text-muted-foreground mt-4 max-w-xs">
                  Escaneie com seu WhatsApp para iniciar a sessão automaticamente.
                </p>
              </>
            )}
          </>
        </motion.div>
      </CardContent>
    </Card>
  )
}
