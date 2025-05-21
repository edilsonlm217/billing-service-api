import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";

export function ApiKeyInstructions() {
  return (
    <Card className="mb-8 shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle>Integração via API Key</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-700 space-y-4">
        <p>
          As chaves de API permitem que seu <strong>mk-auth</strong> se conecte com a nossa plataforma de mensageria,
          autenticando requisições enviadas para a nossa API.
        </p>
        <p>
          Sempre que uma nova chave for criada, a anterior será automaticamente invalidada.
        </p>
        <Alert variant="default" className="border-l-4 border-primary/80 bg-muted">
          <ShieldCheck className="h-4 w-4 text-primary mr-2" />
          <AlertTitle>Importante</AlertTitle>
          <AlertDescription>
            Mantenha sua chave em local seguro e atualize as configurações do seu mk-auth sempre que ela for rotacionada.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
