
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Users, PlusCircle, CalendarDays } from 'lucide-react';

// Minimalist dairy icon SVG
const DairyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2h8" />
    <path d="M9 2v2.34c0 .55.45 1 .99 1H14c.55 0 1-.45 1-1V2" />
    <path d="M5 7h14" />
    <path d="M5 7v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7" />
    <path d="M10 12h4" />
  </svg>
);


export default function Header() {
  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-primary-foreground hover:text-opacity-80 transition-opacity">
          <DairyIcon />
          <span>DairySMS</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <Home className="mr-1 sm:mr-2 h-4 w-4" />
              Customers
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/customers/add">
              <PlusCircle className="mr-1 sm:mr-2 h-4 w-4" />
              Add Customer
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/reports/daily-summary">
              <CalendarDays className="mr-1 sm:mr-2 h-4 w-4" />
              Daily Summary
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
