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
  degree: number; // 'egrre' or quality metric
  pricePerLiter: number; // price per liter for this record
  totalPrice: number; // calculated: quantity * pricePerLiter
  timestamp: string; // ISO date string
}
