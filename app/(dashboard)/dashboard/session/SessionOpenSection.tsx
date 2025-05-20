import React from 'react'
import { useFetch } from './useFetch'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Copy, User, Key, Smartphone, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { SessionConnectionStatus, SessionState } from '@/types/session'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'


const statusColors: Record<SessionConnectionStatus, string> = {
  connecting: 'text-yellow-800 bg-yellow-100 border-yellow-300',
  open: 'text-green-800 bg-green-100 border-green-300',
  close: 'text-red-800 bg-red-100 border-red-300',
  'logged-out': 'text-red-900 bg-red-200 border-red-400',
  'qr-timeout': 'text-gray-700 bg-gray-200 border-gray-400',
}

function RealTimePulse() {
  return (
    <motion.div
      className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-md"
      animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
    />
  )
}

// Função para formatar o número no padrão +55 11 91234-5678
function formatPhoneNumber(phoneId: string): string {
  // Exemplo do id: "559284533639:22@s.whatsapp.net" ou "5511912345678@s.whatsapp.net"

  // Pega só a parte antes do "@"
  let digits = phoneId.split('@')[0]

  // Remove qualquer coisa depois dos dois-pontos (":")
  if (digits.includes(':')) {
    digits = digits.split(':')[0]
  }

  // Se não começar com 55, retorna o valor original (fallback)
  if (!digits.startsWith('55')) return digits

  // +55 92 8453-3639 (exemplo com 92 de DDD)
  const countryCode = digits.slice(0, 2) // 55
  const ddd = digits.slice(2, 4) // ex: 92
  const part1 = digits.slice(4, 8) // ex: 8453
  const part2 = digits.slice(8) // ex: 3639

  return `+${countryCode} ${ddd} ${part1}-${part2}`
}


interface Props {
  state: SessionState
}

export default function SessionOpenSection({ state }: Props) {
  const { data, error, loading, execute: executeFetch } = useFetch()

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  async function handleLogout() {
    const res = await executeFetch(`/api/session/${state.sessionId}/logout`, {
      method: 'POST',
    })

    if (res) {
      alert('Logout iniciado com sucesso')
    }
  }

  // Título dinâmico usando o número formatado
  const sessionTitle = state.creds?.contact?.id
    ? `Sessão de ${formatPhoneNumber(state.creds.contact.id)}`
    : 'Sessão ativa'

  return (
    <Card>
      <CardHeader className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <CardTitle className="text-xl">{sessionTitle}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-default">
                  <RealTimePulse />
                  <span>Em tempo real</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Dados atualizados automaticamente sem precisar atualizar a página.
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              disabled={loading}
              aria-label="Logout"
              className="flex items-center gap-1"
            >
              {loading ? (
                'Deslogando...'
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  Logout
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza que deseja sair?</AlertDialogTitle>
              <AlertDialogDescription>
                Essa sessão será encerrada. Enquanto ela estiver deslogada, não será possível enviar mensagens.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
              >
                <LogOut className="w-4 h-4" />
                Confirmar logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-1">
          <p>
            <span className="font-medium">Status:</span>{' '}
            <Badge className={`border ${statusColors[state.status]}`} variant="outline">
              {state.status}
            </Badge>
          </p>

          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Último evento recebido:</span>{' '}
            {new Date(state.lastUpdated).toLocaleString()}
          </p>
        </div>

        {state.creds && (
          <Card className="border border-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <User className="w-5 h-5" />
                Informações do contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.creds.contact ? (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold">ID:</span>
                      <span className="break-all">{state.creds.contact.id}</span>
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
      </CardContent>
    </Card>
  )
}
