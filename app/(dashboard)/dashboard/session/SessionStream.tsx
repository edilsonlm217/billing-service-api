'use client'

import React from 'react'
import { useSse } from './useSse'
import { useFetch } from './useFetch'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Copy, User, Key, Smartphone, LogOut } from 'lucide-react'
import { SessionConnectionStatus, SessionSsePayload } from '@/types/session'
import { SessionMode } from '@/types/session-mode'
import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'framer-motion'

const statusColors: Record<SessionConnectionStatus, string> = {
  connecting: 'text-yellow-800 bg-yellow-100 border-yellow-300',
  open: 'text-green-800 bg-green-100 border-green-300',
  close: 'text-red-800 bg-red-100 border-red-300',
  'logged-out': 'text-red-900 bg-red-200 border-red-400',
  'qr-timeout': 'text-gray-700 bg-gray-200 border-gray-400',
}

interface SimpleSessionStreamProps {
  mode: SessionMode
}

export default function SimpleSessionStream({ mode }: SimpleSessionStreamProps) {
  if (mode.type === 'unauthorized') {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">Minha Sessão</h1>
        <Card>
          <CardHeader>
            <CardTitle>Assinatura Inativa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{mode.reason}</p>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (mode.type === 'unavailable') {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">Minha Sessão</h1>
        <Card>
          <CardHeader>
            <CardTitle>Erro ao iniciar sessão</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{mode.reason}</p>
          </CardContent>
        </Card>
      </section>
    )
  }

  // type === 'listen'
  const { sessionId } = mode
  const { data, error } = useSse<SessionSsePayload>(`/api/session/${sessionId}`)
  const state = data?.state

  const { data: logoutData, error: logoutError, loading: logoutLoading, execute: executeFetch } = useFetch()

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  async function handleLogout() {
    const res = await executeFetch(`/api/session/${sessionId}/logout`, {
      method: 'POST',
    })

    if (res) {
      alert('Logout iniciado com sucesso')
    }
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium bold text-gray-900 mb-6">Minha Sessão</h1>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Status da Conexão</CardTitle>

          {state?.status === 'open' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              disabled={logoutLoading}
              aria-label="Logout"
              className="flex items-center gap-1"
            >
              {logoutLoading ? 'Deslogando...' : (
                <>
                  <LogOut className="w-4 h-4" />
                  Logout
                </>
              )}
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {error && <p className="text-red-600">{error}</p>}
          {logoutError && <p className="text-red-600">{logoutError}</p>}

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

                {state.status !== 'open' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="bg-muted rounded-xl p-6 border flex flex-col items-center justify-center text-center shadow-inner"
                  >
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
                  </motion.div>
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
