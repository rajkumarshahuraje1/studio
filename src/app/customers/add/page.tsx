"use client";

import CustomerForm from '@/components/forms/CustomerForm';
import PageHeader from '@/components/shared/PageHeader';
import { useAppData } from '@/contexts/AppDataContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';

export default function AddCustomerPage() {
  const { addCustomer } = useAppData();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: { name: string; contactNumber: string }) => {
    setIsLoading(true);
    try {
      addCustomer(data);
      toast({
        title: "Success",
        description: "Customer added successfully.",
      });
      router.push('/');
    } catch (error) {
      console.error("Failed to add customer:", error);
      toast({
        title: "Error",
        description: "Failed to add customer. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Add New Customer" icon={UserPlus} />
      <CustomerForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
