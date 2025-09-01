'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookPlus, School, GitCompareArrows, Library, Copy } from 'lucide-react';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const navItems = [
  {
    href: '/generador-cursos',
    icon: <BookPlus />,
    label: 'Generador de Cursos',
  },
  {
    href: '/encontrar-universidad',
    icon: <School />,
    label: 'Encontrar mi Universidad',
  },
  {
    href: '/comparador-curriculas',
    icon: <GitCompareArrows />,
    label: 'Comparador de Mallas',
  },
  {
    href: '/mis-cursos',
    icon: <Library />,
    label: 'Mis Cursos',
  },
  {
    href: '/flashcards',
    icon: <Copy />,
    label: 'Flashcards',
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
          >
            <Link href={item.href}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
