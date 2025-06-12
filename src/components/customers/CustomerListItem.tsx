"use client";

import Link from 'next/link';
import type { Customer } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Phone, Eye } from 'lucide-react';

interface CustomerListItemProps {
  customer: Customer;
}

export default function CustomerListItem({ customer }: CustomerListItemProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-headline">{customer.name}</CardTitle>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/customers/${customer.id}`}>
            <Eye className="mr-2 h-4 w-4" /> View Details
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground">
          <Phone className="mr-2 h-4 w-4" />
          <p>{customer.contactNumber}</p>
        </div>
      </CardContent>
    </Card>
  );
}
