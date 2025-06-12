import type { MilkRecord } from '@/lib/types';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Droplet, Percent, Sigma, IndianRupee, CalendarDays } from 'lucide-react';

interface MilkRecordListItemProps {
  record: MilkRecord;
}

export default function MilkRecordListItem({ record }: MilkRecordListItemProps) {
  return (
    <Card className="mb-3 transition-all hover:shadow-md">
      <CardContent className="pt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 items-center text-sm">
        <div className="flex items-center" title="Date">
          <CalendarDays className="h-4 w-4 mr-2 text-primary" />
          <span>{format(new Date(record.timestamp), 'dd-MM-yyyy HH:mm')}</span>
        </div>
        <div className="flex items-center" title="Quantity">
          <Droplet className="h-4 w-4 mr-2 text-primary" />
          <span>{record.quantity} L</span>
        </div>
        <div className="flex items-center" title="Fat">
          <Percent className="h-4 w-4 mr-2 text-primary" />
          <span>{record.fat}%</span>
        </div>
        <div className="flex items-center" title="SNF">
          <Sigma className="h-4 w-4 mr-2 text-primary" />
          <span>{record.snf}</span>
        </div>
        <div className="flex items-center font-semibold" title="Total Price">
          <IndianRupee className="h-4 w-4 mr-1 text-primary" />
          <span>{record.totalPrice.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
