'use client'

import React from 'react'
import { useSse } from './useSse'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { SessionSsePayload } from '@/types/session'
import { SessionMode } from '@/types/session-mode'
import SseErrorSection from './SseErrorSection'
import SkeletonSection from './SkeletonSection'
import ReadQrCodeSection from './ReadQrCodeSection'
import SessionOpenSection from './SessionOpenSection'

interface SimpleSessionStreamProps {
  mode: SessionMode
}

export default function SimpleSessionStream({ mode }: SimpleSessionStreamProps) {
  if (mode.type === 'unauthorized') {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">Gerenciar Sessão</h1>
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
        <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">Gerenciar Sessão</h1>
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

  const { sessionId } = mode
  const { data, error } = useSse<SessionSsePayload>(`/api/session/${sessionId}`)
  const state = data?.state

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium bold text-gray-900 mb-6">Gerenciar Sessão</h1>
      {error && <SseErrorSection error={error} />}
      {!state
        ? (<SkeletonSection />)
        : (
          <>
            {state.status === 'open' && (<SessionOpenSection state={state} />)}
            {state.status !== 'open' && (<ReadQrCodeSection state={state} />)}
          </>
        )
      }
    </section>
  )
}
