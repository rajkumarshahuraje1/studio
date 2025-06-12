"use client";

import type { Customer } from '@/lib/types';
import CustomerListItem from './CustomerListItem';
import { Users } from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
}

export default function CustomerList({ customers }: CustomerListProps) {
  if (customers.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <Users className="mx-auto h-12 w-12 mb-4" />
        <p className="text-xl">No customers found.</p>
        <p>Add a new customer to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {customers.map((customer) => (
        <CustomerListItem key={customer.id} customer={customer} />
      ))}
    </div>
  );
}
