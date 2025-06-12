
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const milkRecordFormSchema = z.object({
  quantity: z.coerce.number().min(0.1, { message: "Quantity must be greater than 0." }),
  fat: z.coerce.number().min(0, { message: "Fat % cannot be negative." }).max(100, { message: "Fat % cannot exceed 100."}),
  snf: z.coerce.number().min(0, { message: "SNF cannot be negative." }),
  totalPrice: z.coerce.number().min(0, { message: "Total price cannot be negative." }),
});

type MilkRecordFormValues = z.infer<typeof milkRecordFormSchema>;

interface MilkRecordFormProps {
  onSubmit: (data: MilkRecordFormValues) => void;
  isLoading?: boolean;
}

export default function MilkRecordForm({ onSubmit, isLoading = false }: MilkRecordFormProps) {
  const form = useForm<MilkRecordFormValues>({
    resolver: zodResolver(milkRecordFormSchema),
    defaultValues: {
      quantity: '' as unknown as number, // Initialize with empty string for controlled input
      fat: '' as unknown as number,      // Zod will coerce to number
      snf: '' as unknown as number,
      totalPrice: '' as unknown as number,
    },
  });

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Add New Milk Record</CardTitle>
        <CardDescription>Enter the details for the new milk record.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity (Liters)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g. 5.5" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fat Percentage (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g. 6.5" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="snf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SNF (Solids-Not-Fat)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g. 8.5" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Price (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g. 200" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? 'Adding Record...' : 'Add Milk Record'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
