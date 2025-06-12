
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useAppData } from '@/contexts/AppDataContext';
import PageHeader from '@/components/shared/PageHeader';
import MilkRecordForm from '@/components/forms/MilkRecordForm';
import type { MilkRecordFormValues } from '@/components/forms/MilkRecordForm';
import MilkRecordList from '@/components/milk-records/MilkRecordList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Phone, Send, ArrowLeft, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import type { Customer, MilkRecord } from '@/lib/types';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { 
    getCustomerById, 
    addMilkRecord, 
    getMilkRecordsByCustomerId, 
    getLastNMilkRecordsByCustomerId,
    deleteCustomer,
    deleteMilkRecord
  } = useAppData();
  const { toast } = useToast();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [records, setRecords] = useState<MilkRecord[]>([]);
  const [isLoadingRecord, setIsLoadingRecord] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);

  const [isDeleteCustomerDialogOpen, setIsDeleteCustomerDialogOpen] = useState(false);
  const [isDeleteMilkRecordDialogOpen, setIsDeleteMilkRecordDialogOpen] = useState(false);
  const [recordToDeleteId, setRecordToDeleteId] = useState<string | null>(null);

  const customerId = params.customerId as string;

  useEffect(() => {
    if (customerId) {
      const foundCustomer = getCustomerById(customerId);
      if (foundCustomer) {
        setCustomer(foundCustomer);
        setRecords(getMilkRecordsByCustomerId(customerId));
      } else {
        toast({ title: "Error", description: "Customer not found.", variant: "destructive" });
        router.push('/');
      }
    }
  }, [customerId, getCustomerById, getMilkRecordsByCustomerId, router, toast]);

  const handleAddMilkRecord = async (data: MilkRecordFormValues) => {
    if (!customer) return;
    setIsLoadingRecord(true);
    try {
      addMilkRecord({ ...data, customerId: customer.id });
      setRecords(getMilkRecordsByCustomerId(customer.id)); 
      toast({
        title: "Success",
        description: "Milk record added successfully.",
      });
    } catch (error) {
      console.error("Failed to add milk record:", error);
      toast({
        title: "Error",
        description: "Failed to add milk record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRecord(false);
    }
  };

  const handleSendSMSSummary = () => {
    if (!customer) return;
    setIsSendingSMS(true);
    const last10Records = getLastNMilkRecordsByCustomerId(customer.id, 10);

    if (last10Records.length === 0) {
      toast({
        title: "No Records",
        description: "No milk records found to send.",
        variant: "default",
      });
      setIsSendingSMS(false);
      return;
    }

    let smsBody = `Milk Summary for ${customer.name}:\n`;
    last10Records.forEach(record => {
      smsBody += `${format(new Date(record.timestamp), 'dd-MM-yyyy')} - Qty: ${record.quantity}L, Fat: ${record.fat}, SNF: ${record.snf}, Total: ₹${record.totalPrice.toFixed(2)}\n`;
    });

    try {
      const smsUri = `sms:${customer.contactNumber}?body=${encodeURIComponent(smsBody.trim())}`;
      window.location.href = smsUri;
      toast({
        title: "SMS Prepared",
        description: "Your SMS app should open with the summary. Please verify and send.",
      });
    } catch (error) {
      console.error("Failed to initiate SMS:", error);
      toast({
        title: "SMS Failed",
        description: "Could not open SMS app automatically. You can copy the summary manually.",
        variant: "destructive",
      });
    } finally {
      setIsSendingSMS(false);
    }
  };

  const openDeleteCustomerDialog = () => {
    setIsDeleteCustomerDialogOpen(true);
  };

  const confirmDeleteCustomer = () => {
    if (!customer) return;
    deleteCustomer(customer.id);
    toast({ title: "Success", description: `Customer ${customer.name} and all their records deleted.` });
    router.push('/');
    setIsDeleteCustomerDialogOpen(false);
  };

  const openDeleteMilkRecordDialog = (recordId: string) => {
    setRecordToDeleteId(recordId);
    setIsDeleteMilkRecordDialogOpen(true);
  };

  const confirmDeleteMilkRecord = () => {
    if (!recordToDeleteId || !customer) return;
    deleteMilkRecord(recordToDeleteId);
    setRecords(getMilkRecordsByCustomerId(customer.id)); // Refresh records
    toast({ title: "Success", description: "Milk record deleted." });
    setIsDeleteMilkRecordDialogOpen(false);
    setRecordToDeleteId(null);
  };

  if (!customer) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Loading customer details...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title={customer.name} 
        icon={User}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
            </Button>
            <Button variant="destructive" onClick={openDeleteCustomerDialog}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete Customer
            </Button>
          </div>
        }
      />
      
      <Card className="mb-8 shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center">
            <Phone className="mr-2 h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Contact:</span>&nbsp;
            <span>{customer.contactNumber}</span>
          </div>
          <Button onClick={handleSendSMSSummary} disabled={isSendingSMS} size="sm">
            <Send className="mr-2 h-4 w-4" />
            {isSendingSMS ? 'Preparing SMS...' : 'Send SMS Summary (Last 10)'}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Milk Records</CardTitle>
          <CardDescription>Showing all milk records for {customer.name}, sorted by most recent. Price calculated at ₹{process.env.NEXT_PUBLIC_PRICE_PER_LITER || 35}/Liter.</CardDescription>
        </CardHeader>
        <CardContent>
          <MilkRecordList records={records} onDeleteRecord={openDeleteMilkRecordDialog} />
        </CardContent>
      </Card>
      
      <MilkRecordForm onSubmit={handleAddMilkRecord} isLoading={isLoadingRecord} />

      {/* Delete Customer Dialog */}
      <AlertDialog open={isDeleteCustomerDialogOpen} onOpenChange={setIsDeleteCustomerDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer 
              <span className="font-semibold"> {customer?.name} </span> 
              and all associated milk records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCustomer} className="bg-destructive hover:bg-destructive/90">
              Delete Customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Milk Record Dialog */}
      <AlertDialog open={isDeleteMilkRecordDialogOpen} onOpenChange={setIsDeleteMilkRecordDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this milk record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMilkRecord} className="bg-destructive hover:bg-destructive/90">
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
