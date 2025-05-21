'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type Props = {
  initialKeys: {
    id: number;
    key: string;
    teamId: number;
    active: boolean;
    createdAt: Date;
  }[];
};

export default function ApiKeysClient({ initialKeys }: Props) {
  const [apiKeys, setApiKeys] = useState(initialKeys);
  const [copiedKeyId, setCopiedKeyId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [openConfirm, setOpenConfirm] = useState(false);

  function handleCreateKeyConfirmed() {
    startTransition(async () => {
      const res = await fetch('/api/api-keys', { method: 'POST' });
      if (!res.ok) {
        console.error('Failed to create key');
        return;
      }

      const newKey = await res.json();
      setApiKeys((prev) => [...prev.map((k) => ({ ...k, active: false })), newKey]);
      setOpenConfirm(false);
    });
  }

  function handleCreateKeyClick() {
    setOpenConfirm(true);
  }

  async function handleCopyKey(key: string, id: number) {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKeyId(id);
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch {
      console.error('Erro ao copiar para a área de transferência');
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Chaves disponíveis</h3>
          <Button onClick={handleCreateKeyClick} disabled={isPending} size="sm" className="flex items-center gap-2">
            {isPending ? 'Criando...' : 'Gerar nova chave'}
          </Button>
        </div>

        {apiKeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
            {/* ... ícone e texto quando não tem chaves */}
          </div>
        ) : (
          <div className="overflow-x-auto px-6 py-4">
            <Table className="min-w-full text-sm border border-gray-300 rounded-lg shadow-sm">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="border-b border-gray-300 text-gray-700 font-semibold">Chave</TableHead>
                  <TableHead className="border-b border-gray-300 text-gray-700 font-semibold">Status</TableHead>
                  <TableHead className="border-b border-gray-300 text-gray-700 font-semibold">Criada em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map(({ id, key, active, createdAt }) => (
                  <Tooltip
                    key={id}
                    open={copiedKeyId === id}
                    onOpenChange={(open) => {
                      if (!open) setCopiedKeyId(null);
                    }}
                  >
                    <TooltipTrigger asChild>
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        className={`cursor-pointer ${copiedKeyId === id ? 'bg-green-50' : ''}`}
                        onClick={() => handleCopyKey(key, id)}
                        aria-label="Copiar chave para área de transferência"
                      >
                        <TableCell className="border-b border-gray-200 px-3 py-2">
                          <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs select-all break-all">{key}</code>
                        </TableCell>
                        <TableCell className="border-b border-gray-200 px-3 py-2">
                          {active ? (
                            <Badge variant="default">Ativa</Badge>
                          ) : (
                            <Badge variant="secondary">Inativa</Badge>
                          )}
                        </TableCell>
                        <TableCell className="border-b border-gray-200 px-3 py-2">{new Date(createdAt).toLocaleDateString()}</TableCell>
                      </motion.tr>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      Copiado!
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Gerar nova chave?</AlertDialogTitle>
            <AlertDialogDescription>
              Criar uma nova chave vai desativar a chave atualmente ativa. Tem certeza que deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateKeyConfirmed} disabled={isPending}>
              {isPending ? 'Criando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
