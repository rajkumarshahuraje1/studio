
"use client";

import { useState, useMemo } from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Droplet, IndianRupee, Sunrise, Sunset, Users } from 'lucide-react';
import { format, startOfDay } from 'date-fns';
import type { MilkRecord } from '@/lib/types';

interface DailyTotals {
  totalQuantity: number;
  morningQuantity: number;
  eveningQuantity: number;
  totalRevenue: number;
  recordCount: number;
  customerCount: number;
}

export default function DailySummaryPage() {
  const { getMilkRecordsByDate, customers } = useAppData();
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

  return (
    <div>
      <PageHeader 
        title="Daily Milk Summary" 
        icon={CalendarIcon}
        actions={
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-[280px] justify-start text-left font-normal"
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

