import { Library } from 'lucide-react';
import { PageHeader } from '@/components/app/page-header';
import { Card } from '@/components/ui/card';

export default function MisCursosPage() {
  return (
    <div className="animate-in">
      <PageHeader
        title="Mis Cursos"
        description="Un espacio personal para guardar y gestionar los cursos que generes."
      />
      <Card className="mt-8">
        <div className="flex flex-col items-center justify-center text-center p-12 min-h-[400px]">
          <div className="bg-primary/10 p-4 rounded-full">
              <Library className="h-10 w-10 text-primary" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold">Próximamente</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
              Estamos trabajando para que pronto puedas guardar tus cursos generados y acceder a ellos cuando quieras. ¡Vuelve pronto!
          </p>
        </div>
      </Card>
    </div>
  );
}
