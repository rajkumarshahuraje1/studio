
import type { MilkRecord } from '@/lib/types';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplet, Percent, Sigma, IndianRupee, CalendarDays, Trash2, Tag, TrendingUp, Sunrise, Sunset, CreditCard, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MilkRecordListItemProps {
  record: MilkRecord;
  onDelete?: (recordId: string) => void;
  onTogglePaymentStatus?: (recordId: string, currentStatus: 'pending' | 'paid') => void;
}

export default function MilkRecordListItem({ record, onDelete, onTogglePaymentStatus }: MilkRecordListItemProps) {
  const SessionIcon = record.session === 'morning' ? Sunrise : Sunset;
  const paymentStatusText = record.paymentStatus === 'paid' ? "Paid" : "Pending";
  const paymentButtonText = record.paymentStatus === 'paid' ? "Mark Pending" : "Mark Paid";
  const PaymentButtonIcon = record.paymentStatus === 'paid' ? CreditCard : CheckCircle2;

  const formatNumber = (value: number | undefined | null, decimalPlaces: number = 1, fallback: string = 'N/A') => {
    if (typeof value === 'number' && !isNaN(value)) {
      return value.toFixed(decimalPlaces);
    }
    return fallback;
  };

  return (
    <Card className="mb-3 transition-all hover:shadow-md">
      <CardContent className="pt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-x-4 gap-y-2 items-center text-sm">
        <div className="flex items-center col-span-2 sm:col-span-1 lg:col-span-2 xl:col-span-2" title="Date">
          <CalendarDays className="h-4 w-4 mr-2 text-primary" />
          <span>{record.timestamp ? format(new Date(record.timestamp), 'dd-MM-yy HH:mm') : 'N/A'}</span>
        </div>
        <div className="flex items-center" title="Session">
          <SessionIcon className="h-4 w-4 mr-2 text-primary" />
          <span className="capitalize">{record.session || 'N/A'}</span>
        </div>
        <div className="flex items-center" title="Quantity">
          <Droplet className="h-4 w-4 mr-2 text-primary" />
          <span>{formatNumber(record.quantity, 1)} L</span>
        </div>
        <div className="flex items-center" title="Fat">
          <Percent className="h-4 w-4 mr-2 text-primary" />
          <span>{formatNumber(record.fat, 1)}%</span>
        </div>
        <div className="flex items-center" title="SNF">
          <Sigma className="h-4 w-4 mr-2 text-primary" />
          <span>{formatNumber(record.snf, 1)}</span>
        </div>
        <div className="flex items-center" title="Degree">
          <TrendingUp className="h-4 w-4 mr-2 text-primary" />
          <span>{formatNumber(record.degree, 1)}</span>
        </div>
        <div className="flex items-center" title="Price Per Liter">
          <Tag className="h-4 w-4 mr-2 text-primary" />
          <span>₹{formatNumber(record.pricePerLiter, 2)}</span>
        </div>
        <div className="flex items-center font-semibold" title="Total Price">
          <IndianRupee className="h-4 w-4 mr-1 text-primary" />
          <span>{formatNumber(record.totalPrice, 2)}</span>
        </div>
        
        <div className="flex items-center col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 xl:col-span-2 justify-end space-x-1">
          {onTogglePaymentStatus && (
            <Button
              variant={record.paymentStatus === 'paid' ? 'outline' : 'default'}
              size="sm"
              onClick={() => record.id && onTogglePaymentStatus(record.id, record.paymentStatus)}
              className={cn(
                "text-xs px-2 py-1 h-auto",
                record.paymentStatus === 'paid' ? "border-green-500 text-green-600 hover:bg-green-50" : "bg-amber-500 hover:bg-amber-600 text-white"
              )}
              title={`Status: ${paymentStatusText}. Click to ${paymentButtonText.toLowerCase()}.`}
              disabled={!record.id}
            >
              <PaymentButtonIcon className="h-3.5 w-3.5 mr-1.5" />
              {paymentStatusText}
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => record.id && onDelete(record.id)} 
              className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
              aria-label="Delete milk record"
              disabled={!record.id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
