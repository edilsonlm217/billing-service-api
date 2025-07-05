'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import useSWR from 'swr';
import { Suspense } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SubscriptionSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>Assinatura do Time</CardTitle>
      </CardHeader>
    </Card>
  );
}

function GerenciarAssinatura() {
  const { data: teamData } = useSWR('/api/team', fetcher);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Assinatura do Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <p className="font-medium">
                Plano Atual: {teamData?.planName || 'Gratuito'}
              </p>
              <p className="text-sm text-muted-foreground">
                {teamData?.subscriptionStatus === 'active'
                  ? 'Cobrado mensalmente'
                  : teamData?.subscriptionStatus === 'trialing'
                    ? 'Período de teste'
                    : 'Nenhuma assinatura ativa'}
              </p>
            </div>
            <form action={customerPortalAction}>
              <Button type="submit" variant="outline">
                Gerenciar Assinatura
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Gerenciamento de Assinatura</h1>
      <Suspense fallback={<SubscriptionSkeleton />}>
        <GerenciarAssinatura />
      </Suspense>
    </section>
  );
}
