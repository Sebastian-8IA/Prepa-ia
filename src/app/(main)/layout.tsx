import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/app/sidebar-nav';
import { Logo } from '@/components/app/logo';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar variant="inset" side="left">
        <SidebarHeader>
          <div className="flex items-center gap-3 p-2 group-data-[collapsible=icon]:justify-center">
            <Logo />
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <Link href="/" className="font-semibold text-lg text-sidebar-foreground">
                Academia IA
              </Link>
              <p className="text-xs text-sidebar-foreground/80">Perú</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex items-center h-14 border-b bg-background/80 backdrop-blur-sm px-4 md:hidden">
          <SidebarTrigger />
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
