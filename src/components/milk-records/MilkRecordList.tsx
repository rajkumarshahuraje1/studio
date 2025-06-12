
import type { MilkRecord } from '@/lib/types';
import MilkRecordListItem from './MilkRecordListItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PackageOpen } from 'lucide-react'; 

interface MilkRecordListProps {
  records: MilkRecord[];
  onDeleteRecord?: (recordId: string) => void;
}

export default function MilkRecordList({ records, onDeleteRecord }: MilkRecordListProps) {
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
          <MilkRecordListItem key={record.id} record={record} onDelete={onDeleteRecord} />
        ))}
      </div>
    </ScrollArea>
  );
}
