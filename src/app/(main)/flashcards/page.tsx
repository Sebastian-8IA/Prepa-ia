import { Copy } from 'lucide-react';
import { PageHeader } from '@/components/app/page-header';
import { Card } from '@/components/ui/card';

export default function FlashcardsPage() {
  return (
    <div className="animate-in">
      <PageHeader
        title="Flashcards"
        description="Crea y estudia con tarjetas de memoria inteligentes generadas por IA."
      />
      <Card className="mt-8">
        <div className="flex flex-col items-center justify-center text-center p-12 min-h-[400px]">
          <div className="bg-primary/10 p-4 rounded-full">
              <Copy className="h-10 w-10 text-primary" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold">Próximamente</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
              Imagina crear flashcards de cualquier tema con un solo clic. Estamos construyendo esta increíble función para ti. ¡Mantente atento!
          </p>
        </div>
      </Card>
    </div>
  );
}
