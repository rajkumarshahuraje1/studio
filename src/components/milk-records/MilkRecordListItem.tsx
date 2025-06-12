
import type { MilkRecord } from '@/lib/types';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplet, Percent, Sigma, IndianRupee, CalendarDays, Trash2 } from 'lucide-react';

interface MilkRecordListItemProps {
  record: MilkRecord;
  onDelete?: (recordId: string) => void;
}

export default function MilkRecordListItem({ record, onDelete }: MilkRecordListItemProps) {
  return (
    <Card className="mb-3 transition-all hover:shadow-md">
      <CardContent className="pt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 items-center text-sm">
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
        <div className="flex items-center justify-end">
          {onDelete && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDelete(record.id)} 
              className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
              aria-label="Delete milk record"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
