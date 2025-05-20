import { AlertCircle, QrCode } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SessionConnectionStatus, SessionState } from '@/types/session'

const statusColors: Record<SessionConnectionStatus, string> = {
  starting: 'text-yellow-800 bg-yellow-100 border-yellow-300',
  open: 'text-green-800 bg-green-100 border-green-300',
  close: 'text-red-800 bg-red-100 border-red-300',
  'logged-out': 'text-red-900 bg-red-200 border-red-400',
  'qr-timeout': 'text-gray-700 bg-gray-200 border-gray-400',
  'awaiting-qr-code-reading': 'text-blue-800 bg-blue-100 border-blue-300',
  restarting: 'text-purple-800 bg-purple-100 border-purple-300',
}

function formatPhoneNumber(phoneId: string): string {
  let digits = phoneId.split('@')[0]
  if (digits.includes(':')) digits = digits.split(':')[0]
  if (!digits.startsWith('55')) return digits
  const countryCode = digits.slice(0, 2)
  const ddd = digits.slice(2, 4)
  const part1 = digits.slice(4, 8)
  const part2 = digits.slice(8)
  return `+${countryCode} ${ddd} ${part1}-${part2}`
}

interface Props {
  state: SessionState
}

export default function LoggedOutSection({ state }: Props) {
  const sessionTitle = state.creds?.contact?.id
    ? `Sessão de ${formatPhoneNumber(state.creds.contact.id)}`
    : 'Sessão desconectada'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-red-300 shadow-md">
        <CardHeader className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <CardTitle className="text-xl">{sessionTitle}</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Esta sessão foi <strong>desconectada</strong> do WhatsApp e não pode mais ser usada para envio de mensagens.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            <Badge className={`border ${statusColors['logged-out']}`} variant="outline">
              {state.status}
            </Badge>
          </div>

          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Último evento:</span>{' '}
            {new Date(state.lastUpdated).toLocaleString()}
          </div>

          <Button size="sm" className="mt-2" onClick={() => window.location.reload()}>
            <QrCode className="w-4 h-4 mr-2" />
            Reconectar com novo QR Code
          </Button>

        </CardContent>
      </Card>
    </motion.div>
  )
}
