
import type { MilkRecord, PaymentStatus } from '@/lib/types';
import MilkRecordListItem from './MilkRecordListItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PackageOpen } from 'lucide-react'; 

interface MilkRecordListProps {
  records: MilkRecord[];
  onDeleteRecord?: (recordId: string) => void;
  onTogglePaymentStatus?: (recordId: string, currentStatus: PaymentStatus) => void;
}

export default function MilkRecordList({ records, onDeleteRecord, onTogglePaymentStatus }: MilkRecordListProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <PackageOpen className="mx-auto h-10 w-10 mb-3" />
        <p>No milk records found for this customer yet.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4"> 
      <div className="space-y-3">
        {records.map((record) => (
          <MilkRecordListItem 
            key={record.id} 
            record={record} 
            onDelete={onDeleteRecord}
            onTogglePaymentStatus={onTogglePaymentStatus}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
