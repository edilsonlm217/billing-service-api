'use client';

import React, { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, XCircle, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Opções de período
const TIME_WINDOWS = [
  { label: 'Última 1 hora', value: '1h' },
  { label: 'Últimas 24 horas', value: '24h' },
  { label: 'Últimos 7 dias', value: '7d' },
  { label: 'Últimos 30 dias', value: '30d' },
]

// Função para formatar data no padrão local
function formatDate(date: Date) {
  return date.toLocaleString()
}

// Gráfico de barras para múltiplas séries
function MultiBarChart({ data }: { data: Record<string, number[]> }) {
  const keys = Object.keys(data)
  const max = Math.max(...Object.values(data).flat())
  const barWidth = 20
  const barSpacing = 8
  const groupSpacing = 12

  return (
    <svg
      width={
        data[keys[0]].length * (keys.length * (barWidth + barSpacing) + groupSpacing)
      }
      height={100}
    >
      {data[keys[0]].map((_, i) => {
        return keys.map((key, idx) => {
          const value = data[key][i]
          const barHeight = (value / max) * 80
          return (
            <rect
              key={`${key}-${i}`}
              x={
                i * (keys.length * (barWidth + barSpacing) + groupSpacing) +
                idx * (barWidth + barSpacing)
              }
              y={100 - barHeight}
              width={barWidth}
              height={barHeight}
              fill={
                key === 'sent' ? '#22c55e' : key === 'delivered' ? '#3b82f6' : '#f59e0b'
              }
              rx={4}
            />
          )
        })
      })}
    </svg>
  )
}

export default function ClientDashboard() {
  const [selectedWindow, setSelectedWindow] = useState('7d')

  // Dados simulados por janela temporal
  const messageDataByWindow: Record<
    string,
    { sent: number[]; delivered: number[]; read: number[] }
  > = {
    '1h': {
      sent: [1, 0, 2, 0, 1, 3, 1],
      delivered: [1, 0, 1, 0, 1, 2, 1],
      read: [0, 0, 1, 0, 0, 1, 0],
    },
    '24h': {
      sent: [5, 10, 8, 15, 12, 7, 11],
      delivered: [4, 9, 7, 13, 11, 6, 9],
      read: [3, 7, 5, 11, 8, 4, 6],
    },
    '7d': {
      sent: [35, 42, 30, 48, 40, 37, 45],
      delivered: [33, 40, 28, 45, 38, 35, 42],
      read: [25, 32, 22, 38, 30, 29, 33],
    },
    '30d': {
      sent: [120, 130, 140, 125, 110, 115, 130],
      delivered: [115, 125, 135, 120, 105, 110, 125],
      read: [90, 100, 110, 95, 85, 90, 105],
    },
  }

  // Somar arrays para resumo total
  const totalSent = messageDataByWindow[selectedWindow].sent.reduce((a, b) => a + b, 0)
  const totalDelivered = messageDataByWindow[selectedWindow].delivered.reduce(
    (a, b) => a + b,
    0,
  )
  const totalRead = messageDataByWindow[selectedWindow].read.reduce((a, b) => a + b, 0)
  const totalFailed = totalSent - totalDelivered
  const readRate = totalDelivered > 0 ? ((totalRead / totalDelivered) * 100).toFixed(1) : '0.0'

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard de Envio</h1>

      {/* Filtro janela temporal */}
      <div className="flex gap-4 mb-6">
        {TIME_WINDOWS.map(({ label, value }) => (
          <Button
            key={value}
            variant={selectedWindow === value ? 'default' : 'outline'}
            onClick={() => setSelectedWindow(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Alerta (exemplo fixo) */}
      <Card className="bg-red-50 border-red-300">
        <CardContent className="flex items-center gap-4 text-red-700">
          <AlertCircle className="w-6 h-6" />
          <p className="font-semibold">
            Sessão desconectada! As mensagens não estão sendo enviadas.
          </p>
        </CardContent>
      </Card>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="border border-gray-300">
          <CardHeader>
            <CardTitle>Total de Mensagens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-gray-900">{totalSent}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-300">
          <CardHeader>
            <CardTitle>Entregues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-blue-600">{totalDelivered}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-300">
          <CardHeader>
            <CardTitle>Lidas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-yellow-600">{totalRead}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-300">
          <CardHeader>
            <CardTitle>Falhas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-red-600">{totalFailed}</p>
          </CardContent>
        </Card>
      </div>


      {/* Gráfico com as 3 séries */}
      <Card>
        <CardHeader>
          <CardTitle>
            Mensagens Enviadas / Entregues / Lidas na Última{' '}
            {selectedWindow.replace('h', ' hora(s)').replace('d', ' dia(s)')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MultiBarChart data={messageDataByWindow[selectedWindow]} />
        </CardContent>
      </Card>

      {/* Lista de mensagens recentes com badge leitura */}
      <Card>
        <CardHeader>
          <CardTitle>Mensagens Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                id: 'msg1',
                to: '+55 11 91234-5678',
                status: 'success',
                read: true,
                date: new Date(Date.now() - 1000 * 60 * 5),
                text: 'Olá! Seu pedido foi confirmado.',
              },
              {
                id: 'msg2',
                to: '+55 21 99876-5432',
                status: 'error',
                read: false,
                date: new Date(Date.now() - 1000 * 60 * 10),
                text: 'Não foi possível enviar sua mensagem.',
              },
              {
                id: 'msg3',
                to: '+55 31 91234-9876',
                status: 'pending',
                read: false,
                date: new Date(Date.now() - 1000 * 60 * 15),
                text: 'Processando envio...',
              },
            ].map(({ id, to, status, read, date, text }) => (
              <div
                key={id}
                className="flex items-center justify-between border border-gray-200 rounded p-3"
              >
                <div>
                  <p className="font-semibold">{to}</p>
                  <p className="text-sm text-muted-foreground">{text}</p>
                  <p className="text-xs text-gray-400">{formatDate(date)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {status === 'success' && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 text-green-600 border-green-600"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Enviada
                    </Badge>
                  )}
                  {status === 'error' && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 text-red-600 border-red-600"
                    >
                      <XCircle className="w-4 h-4" />
                      Falhou
                    </Badge>
                  )}
                  {status === 'pending' && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 text-yellow-600 border-yellow-600"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Pendente
                    </Badge>
                  )}

                  {read && status === 'success' && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 text-yellow-600 border-yellow-600"
                    >
                      <Eye className="w-4 h-4" />
                      Lida
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
