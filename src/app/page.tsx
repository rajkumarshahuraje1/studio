"use client";

import CustomerList from '@/components/customers/CustomerList';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/contexts/AppDataContext';
import { Users, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { customers } = useAppData();

  return (
    <div>
      <PageHeader 
        title="Customers" 
        icon={Users} 
        actions={
          <Button asChild>
            <Link href="/customers/add">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
            </Link>
          </Button>
        }
      />
      <CustomerList customers={customers} />
    </div>
  );
}
