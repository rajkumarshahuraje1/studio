
export interface Customer {
  id: string;
  name: string;
  contactNumber: string;
}

export type MilkSession = 'morning' | 'evening';
export type PaymentStatus = 'pending' | 'paid';

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
  session: MilkSession;
  paymentStatus: PaymentStatus;
}

// Added for authentication
export interface User {
  id: string;
  username: string;
  // In a real app, store a securely hashed password.
  // For this prototype, we'll store it as is or use a very simple "hash".
  passwordHash: string; 
}
