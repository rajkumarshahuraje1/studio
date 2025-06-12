export interface Customer {
  id: string;
  name: string;
  contactNumber: string;
}

export interface MilkRecord {
  id: string;
  customerId: string;
  quantity: number; // in liters
  fat: number; // percentage
  snf: number; // Solids-Not-Fat
  totalPrice: number;
  timestamp: string; // ISO date string
}
