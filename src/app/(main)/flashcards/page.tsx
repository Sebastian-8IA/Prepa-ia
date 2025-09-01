import { Copy } from 'lucide-react';
import { PageHeader } from '@/components/app/page-header';

export default function FlashcardsPage() {
  return (
    <>
      <PageHeader
        title="Flashcards"
        description="Crea y estudia con tarjetas de memoria inteligentes generadas por IA."
      />
      <div className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12 mt-8 min-h-[400px]">
        <div className="bg-primary/10 p-4 rounded-full">
            <Copy className="h-10 w-10 text-primary" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold">Próximamente</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
            Imagina crear flashcards de cualquier tema con un solo clic. Estamos construyendo esta increíble función para ti. ¡Mantente atento!
        </p>
      </div>
    </>
  );
}
