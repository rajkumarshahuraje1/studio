
"use client";

import { useState, useMemo } from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Droplet, IndianRupee, Sunrise, Sunset, Users, FileText } from 'lucide-react';
import { format, startOfDay, parseISO } from 'date-fns';
import type { MilkRecord, Customer } from '@/lib/types';
import jsPDF from 'jspdf';
// import 'jspdf-autotable'; // Import for side effects to extend jsPDF - Temporarily commented out
import { useToast } from '@/hooks/use-toast';

interface DailyTotals {
  totalQuantity: number;
  morningQuantity: number;
  eveningQuantity: number;
  totalRevenue: number;
  recordCount: number;
  customerCount: number;
}

export default function DailySummaryPage() {
  const { getMilkRecordsByDate, getCustomerById } = useAppData();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(startOfDay(new Date()));

  const dailyRecords = useMemo(() => {
    if (!selectedDate) return [];
    return getMilkRecordsByDate(selectedDate);
  }, [selectedDate, getMilkRecordsByDate]);

  const dailyTotals: DailyTotals = useMemo(() => {
    let totalQuantity = 0;
    let morningQuantity = 0;
    let eveningQuantity = 0;
    let totalRevenue = 0;
    const uniqueCustomerIds = new Set<string>();

    dailyRecords.forEach(record => {
      totalQuantity += record.quantity;
      totalRevenue += record.totalPrice;
      uniqueCustomerIds.add(record.customerId);
      if (record.session === 'morning') {
        morningQuantity += record.quantity;
      } else if (record.session === 'evening') {
        eveningQuantity += record.quantity;
      }
    });

    return {
      totalQuantity,
      morningQuantity,
      eveningQuantity,
      totalRevenue,
      recordCount: dailyRecords.length,
      customerCount: uniqueCustomerIds.size,
    };
  }, [dailyRecords]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date ? startOfDay(date) : undefined);
  }

  const handleGenerateDailyPdf = () => {
    if (!selectedDate || !dailyRecords.length) {
      toast({ title: "No data", description: "No records to generate PDF for this date.", variant: "default" });
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(18);
    doc.text("Daily Milk Collection Summary", pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Date: ${format(selectedDate, 'PPP')}`, 14, 30);
    doc.text(`Report Generated: ${format(new Date(), 'dd-MM-yyyy HH:mm')}`, 14, 36);

    let currentY = 45;

    doc.setFontSize(14);
    doc.text("Summary Statistics", 14, currentY);
    currentY += 6;
    doc.setFontSize(10);
    const summaryText = [
      `Total Milk Collected: ${dailyTotals.totalQuantity.toFixed(2)} Liters`,
      `Morning Collection: ${dailyTotals.morningQuantity.toFixed(2)} Liters`,
      `Evening Collection: ${dailyTotals.eveningQuantity.toFixed(2)} Liters`,
      `Total Revenue: ₹${dailyTotals.totalRevenue.toFixed(2)}`,
      `Total Records: ${dailyTotals.recordCount}`,
      `Contributing Customers: ${dailyTotals.customerCount}`,
    ];
    summaryText.forEach((text) => {
      doc.text(text, 14, currentY);
      currentY += 5;
    });
    currentY += 5; 

    doc.setFontSize(14);
    doc.text("Detailed Records", 14, currentY);
    currentY += 8;

    // Temporarily disable autotable due to build issues
    doc.setFontSize(10);
    doc.text("Detailed records table generation is temporarily disabled due to a build issue.", 14, currentY);
    currentY += 10;
    doc.text("This section would normally contain a table of all milk records for the day.", 14, currentY);

    /*
    // Check if autoTable is available (it might not be if jspdf-autotable failed to load/extend)
    if (typeof (doc as any).autoTable === 'function') {
      const tableColumn = ["Customer", "Session", "Time", "Qty (L)", "Fat (%)", "SNF", "Degree", "Price/L (₹)", "Total (₹)", "Payment"];
      const tableRows: (string | number)[][] = [];

      dailyRecords.forEach(record => {
        const customer = getCustomerById(record.customerId);
        const recordData = [
          customer ? customer.name : 'N/A',
          record.session.charAt(0).toUpperCase() + record.session.slice(1),
          format(new Date(record.timestamp), 'HH:mm'),
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
          headStyles: { fillColor: [93, 16, 67] }, // Using an example primary color shade
          styles: { fontSize: 8, cellPadding: 1.5 },
          columnStyles: {
              0: { cellWidth: 30 }, // Customer name
              2: { cellWidth: 15 }, // Time
          }
      });
    } else {
      doc.setFontSize(10);
      doc.text("Detailed records table feature is currently unavailable (autoTable function not found).", 14, currentY);
      currentY += 10;
      doc.text("Please ensure jspdf-autotable is correctly installed and imported.", 14, currentY);
    }
    */

    doc.save(`daily_milk_summary_${format(selectedDate, 'yyyyMMdd')}.pdf`);
    toast({ title: "PDF Generated (Limited)", description: "Daily summary PDF downloaded. Detailed table pending fix." });
  };


  return (
    <div>
      <PageHeader 
        title="Daily Milk Summary" 
        icon={CalendarIcon}
        actions={
          <div className="flex flex-wrap gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-[240px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
                />
              </PopoverContent>
            </Popover>
            <Button onClick={handleGenerateDailyPdf} variant="outline" disabled={!selectedDate || dailyRecords.length === 0}>
              <FileText className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </div>
        }
      />

      {selectedDate ? (
        <>
          {dailyRecords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center">
                    <Droplet className="mr-2 h-5 w-5 text-primary"/> Total Milk Collected
                  </CardTitle>
                  <CardDescription>{dailyTotals.recordCount} records from {dailyTotals.customerCount} customers.</CardDescription>
                </CardHeader>
                <CardContent className="text-3xl font-bold">
                  {dailyTotals.totalQuantity.toFixed(2)} Liters
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center">
                    <Sunrise className="mr-2 h-5 w-5 text-primary"/> Morning Collection
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-bold">
                  {dailyTotals.morningQuantity.toFixed(2)} Liters
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center">
                    <Sunset className="mr-2 h-5 w-5 text-primary"/> Evening Collection
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-bold">
                  {dailyTotals.eveningQuantity.toFixed(2)} Liters
                </CardContent>
              </Card>
              
              <Card className="shadow-md md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center">
                    <IndianRupee className="mr-2 h-5 w-5 text-primary"/> Total Revenue for the Day
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-bold">
                  ₹{dailyTotals.totalRevenue.toFixed(2)}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="mt-6 shadow-md">
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-4" />
                <p className="text-xl">No milk records found for {format(selectedDate, "PPP")}.</p>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
         <Card className="mt-6 shadow-md">
            <CardContent className="pt-6 text-center text-muted-foreground">
                <p className="text-xl">Please select a date to view the summary.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
