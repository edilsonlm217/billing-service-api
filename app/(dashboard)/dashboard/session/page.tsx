'use client'

import React from 'react'
import { useSse } from './useSse'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Copy, User, Key, Smartphone } from 'lucide-react'
import { SessionConnectionStatus, SessionSsePayload } from '@/types/session'

const statusColors: Record<SessionConnectionStatus, string> = {
  connecting: 'text-yellow-800 bg-yellow-100 border-yellow-300',
  open: 'text-green-800 bg-green-100 border-green-300',
  close: 'text-red-800 bg-red-100 border-red-300',
  'logged-out': 'text-red-900 bg-red-200 border-red-400',
  'qr-timeout': 'text-gray-700 bg-gray-200 border-gray-400',
}

export default function SimpleSessionStream() {
  const sessionId = 'cliente-whatsapp-01'
  const { data, error } = useSse<SessionSsePayload>(`/api/session/${sessionId}`)
  const state = data?.state

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium bold text-gray-900 mb-6">
        Minha Sessão
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Status da Conexão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-red-600">{error}</p>}

          {!state ? (
            <div className="h-24 w-full bg-gray-100 animate-pulse rounded" />
          ) : (
            <>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <Badge
                    className={`border ${statusColors[state.status]}`}
                    variant="outline"
                  >
                    {state.status}
                  </Badge>
                </p>

                <p>
                  <span className="font-medium">Última atualização:</span>{' '}
                  {new Date(state.lastUpdated).toLocaleString()}
                </p>

                {state.qrCode && (
                  <div>
                    <p className="font-medium mb-1">QR Code</p>
                    <img
                      src={state.qrCode}
                      alt="QR Code"
                      className="rounded border max-w-xs"
                    />
                  </div>
                )}
              </div>

              {state.creds && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <User className="w-5 h-5" />
                      Informações do contato
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {state.creds.contact ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold">ID:</span>
                            <span>{state.creds.contact.id}</span>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(state.creds!.contact!.id)}
                                aria-label="Copiar ID"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copiado!</TooltipContent>
                          </Tooltip>
                        </div>

                        {state.creds.contact.name && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold">Nome:</span>
                            <span>{state.creds.contact.name}</span>
                          </div>
                        )}

                        {state.creds.contact.lid && (
                          <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold">LID:</span>
                            <span>{state.creds.contact.lid}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500 italic">Nenhum contato disponível</p>
                    )}

                    {state.creds.phonePlatform && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-gray-600" />
                          <span className="font-semibold">Plataforma:</span>
                          <Badge variant="secondary">{state.creds.phonePlatform}</Badge>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
