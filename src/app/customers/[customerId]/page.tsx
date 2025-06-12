
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useAppData } from '@/contexts/AppDataContext';
import PageHeader from '@/components/shared/PageHeader';
import MilkRecordForm from '@/components/forms/MilkRecordForm';
import type { MilkRecordFormValues } from '@/components/forms/MilkRecordForm';
import MilkRecordList from '@/components/milk-records/MilkRecordList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Phone, Send, ArrowLeft, Trash2, FileText, BarChart3, Droplet, Percent, Sigma, TrendingUp as DegreeIcon, IndianRupee, Sunrise, Sunset, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo } from 'react';
import type { Customer, MilkRecord, MilkSession, PaymentStatus } from '@/lib/types';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
// import 'jspdf-autotable'; // Temporarily commented out due to build issues

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

interface SessionSummaryData {
  totalQuantity: number;
  avgFat: number;
  avgSnf: number;
  avgDegree: number;
  avgPricePerLiter: number;
  totalRevenue: number;
  recordCount: number;
}

const calculateSessionSummary = (records: MilkRecord[]): SessionSummaryData | null => {
  if (!records || records.length === 0) return null;
  
  const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);
  const totalFatWeighted = records.reduce((sum, r) => sum + r.fat * r.quantity, 0); 
  const totalSnfWeighted = records.reduce((sum, r) => sum + r.snf * r.quantity, 0); 
  const totalDegreeWeighted = records.reduce((sum, r) => sum + r.degree * r.quantity, 0); 
  const totalRevenue = records.reduce((sum, r) => sum + r.totalPrice, 0);
  const recordCount = records.length;

  return {
    totalQuantity,
    avgFat: totalQuantity > 0 ? totalFatWeighted / totalQuantity : 0,
    avgSnf: totalQuantity > 0 ? totalSnfWeighted / totalQuantity : 0,
    avgDegree: totalQuantity > 0 ? totalDegreeWeighted / totalQuantity : 0,
    avgPricePerLiter: totalQuantity > 0 ? totalRevenue / totalQuantity : 0,
    totalRevenue,
    recordCount
  };
};


export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { 
    getCustomerById, 
    addMilkRecord, 
    getMilkRecordsByCustomerId, 
    getLastNMilkRecordsByCustomerId,
    deleteCustomer,
    deleteMilkRecord,
    updateMilkRecordPaymentStatus
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

  const overallSummaryData = useMemo(() => calculateSessionSummary(records), [records]);
  const morningRecords = useMemo(() => records.filter(r => r.session === 'morning'), [records]);
  const eveningRecords = useMemo(() => records.filter(r => r.session === 'evening'), [records]);
  
  const morningSummaryData = useMemo(() => calculateSessionSummary(morningRecords), [morningRecords]);
  const eveningSummaryData = useMemo(() => calculateSessionSummary(eveningRecords), [eveningRecords]);


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
    if (!customer || !overallSummaryData) return;
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
    smsBody += `Total Qty: ${overallSummaryData.totalQuantity.toFixed(1)}L, Avg Fat: ${overallSummaryData.avgFat.toFixed(1)}%, Total Amt: ₹${overallSummaryData.totalRevenue.toFixed(2)}\nLast 10 records:\n`;
    last10Records.forEach(record => {
      smsBody += `${format(new Date(record.timestamp), 'dd/MM')}(${record.session.charAt(0).toUpperCase()}) Q:${record.quantity}L F:${record.fat} PPL:₹${record.pricePerLiter.toFixed(0)} Tot:₹${record.totalPrice.toFixed(0)}\n`;
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
    setRecords(getMilkRecordsByCustomerId(customer.id)); 
    toast({ title: "Success", description: "Milk record deleted." });
    setIsDeleteMilkRecordDialogOpen(false);
    setRecordToDeleteId(null);
  };
  
  const handleTogglePaymentStatus = (recordId: string, currentStatus: PaymentStatus) => {
    if (!customer) return;
    const newStatus = currentStatus === 'pending' ? 'paid' : 'pending';
    updateMilkRecordPaymentStatus(recordId, newStatus);
    setRecords(getMilkRecordsByCustomerId(customer.id));
    toast({
      title: "Payment Status Updated",
      description: `Record marked as ${newStatus}.`,
    });
  };

  const handleGeneratePdf = () => {
    if (!customer || !records.length) {
      toast({ title: "No data", description: "No records to generate PDF.", variant: "default" });
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(18);
    doc.text(`Milk Record Report: ${customer.name}`, pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Contact: ${customer.contactNumber}`, 14, 30);
    doc.text(`Report Date: ${format(new Date(), 'dd-MM-yyyy HH:mm')}`, 14, 36);

    let currentY = 45;

    if (overallSummaryData) {
      doc.setFontSize(14);
      doc.text("Overall Summary", 14, currentY);
      currentY += 6;
      doc.setFontSize(10);
      const summaryText = [
        `Total Milk Collected: ${overallSummaryData.totalQuantity.toFixed(2)} Liters`,
        `Average Fat: ${overallSummaryData.avgFat.toFixed(2)} %`,
        `Average SNF: ${overallSummaryData.avgSnf.toFixed(2)}`,
        `Average Degree: ${overallSummaryData.avgDegree.toFixed(2)}`,
        `Average Price/Liter: ₹${overallSummaryData.avgPricePerLiter.toFixed(2)}`,
        `Total Revenue: ₹${overallSummaryData.totalRevenue.toFixed(2)} from ${overallSummaryData.recordCount} records`
      ];
      summaryText.forEach((text) => {
        doc.text(text, 14, currentY);
        currentY += 5;
      });
      currentY += 5; 
    }
    
    // Temporarily comment out autotable usage
    /*
    const tableColumn = ["Date", "Session", "Qty (L)", "Fat (%)", "SNF", "Degree", "Price/L (₹)", "Total (₹)", "Payment"];
    const tableRows: (string | number)[][] = [];

    records.forEach(record => {
      const recordData = [
        format(new Date(record.timestamp), 'dd-MM-yy HH:mm'),
        record.session.charAt(0).toUpperCase() + record.session.slice(1),
        record.quantity.toFixed(1),
        record.fat.toFixed(1),
        record.snf.toFixed(1),
        record.degree.toFixed(1),
        record.pricePerLiter.toFixed(2),
        record.totalPrice.toFixed(2),
        record.paymentStatus.charAt(0).toUpperCase() + record.paymentStatus.slice(1)
      ];
      tableRows.push(recordData);
    });

    (doc as any).autoTable({ 
      head: [tableColumn],
      body: tableRows,
      startY: currentY, 
      theme: 'striped',
      headStyles: { fillColor: [93, 16, 67] }, 
      styles: { fontSize: 8 },
    });
    */
    
    doc.setFontSize(10);
    doc.text("Detailed records table generation is temporarily disabled.", 14, currentY);
    currentY += 10;
    doc.text("This section would normally contain a table of all milk records.", 14, currentY);


    doc.save(`${customer.name}_milk_report_${format(new Date(), 'yyyyMMdd')}.pdf`);
    toast({ title: "PDF Generated (Limited)", description: "Report downloaded. Table feature pending fix." });
  };


  if (!customer) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Loading customer details...</p>
      </div>
    );
  }

  const SummaryCard = ({ title, data, icon: Icon }: { title: string, data: SessionSummaryData | null, icon?: React.ElementType }) => {
    if (!data) return null;
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            {Icon && <Icon className="mr-2 h-5 w-5 text-primary"/>}
            {title}
          </CardTitle>
          <CardDescription>{data.recordCount} record(s) analyzed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center text-muted-foreground"><Droplet className="mr-1.5 h-4 w-4" />Total Quantity:</span>
            <span className="font-medium">{data.totalQuantity.toFixed(2)} L</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-muted-foreground"><Percent className="mr-1.5 h-4 w-4" />Avg. Fat:</span>
            <span className="font-medium">{data.avgFat.toFixed(2)} %</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-muted-foreground"><Sigma className="mr-1.5 h-4 w-4" />Avg. SNF:</span>
            <span className="font-medium">{data.avgSnf.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-muted-foreground"><DegreeIcon className="mr-1.5 h-4 w-4" />Avg. Degree:</span>
            <span className="font-medium">{data.avgDegree.toFixed(2)}</span>
          </div>
           <div className="flex items-center justify-between">
            <span className="flex items-center text-muted-foreground"><IndianRupee className="mr-1.5 h-4 w-4" />Avg. Price/Liter:</span>
            <span className="font-medium">₹{data.avgPricePerLiter.toFixed(2)}</span>
          </div>
           <div className="flex items-center justify-between pt-1 border-t mt-2">
            <span className="flex items-center text-muted-foreground font-semibold"><IndianRupee className="mr-1.5 h-4 w-4" />Total Revenue:</span>
            <span className="font-bold text-primary">₹{data.totalRevenue.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    );
  };


  return (
    <div>
      <PageHeader 
        title={customer.name} 
        icon={User}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
             <Button onClick={handleGeneratePdf} variant="outline">
              <FileText className="mr-2 h-4 w-4" /> PDF Report
            </Button>
            <Button variant="destructive" onClick={openDeleteCustomerDialog}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete Customer
            </Button>
          </div>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-md md:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center">
              <Phone className="mr-2 h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Contact:</span>&nbsp;
              <span>{customer.contactNumber}</span>
            </div>
            <Button onClick={handleSendSMSSummary} disabled={isSendingSMS || !overallSummaryData} size="sm" className="w-full sm:w-auto">
              <Send className="mr-2 h-4 w-4" />
              {isSendingSMS ? 'Preparing SMS...' : 'Send SMS Summary (Overall)'}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold font-headline mb-4 flex items-center">
            <Sparkles className="mr-2 h-6 w-6 text-primary" />
            Milk Collection Summaries
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SummaryCard title="Overall Summary" data={overallSummaryData} icon={BarChart3} />
            <SummaryCard title="Morning Session Summary" data={morningSummaryData} icon={Sunrise} />
            <SummaryCard title="Evening Session Summary" data={eveningSummaryData} icon={Sunset} />
        </div>
      </div>


      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Milk Records</CardTitle>
          <CardDescription>Showing all milk records for {customer.name}, sorted by most recent.</CardDescription>
        </CardHeader>
        <CardContent>
          <MilkRecordList 
            records={records} 
            onDeleteRecord={openDeleteMilkRecordDialog} 
            onTogglePaymentStatus={handleTogglePaymentStatus}
          />
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
