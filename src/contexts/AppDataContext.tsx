
"use client";

import type { Customer, MilkRecord } from '@/lib/types';
import { createContext, useContext, ReactNode } from 'react';
import useClientStorage from '@/hooks/useClientStorage';
import { CUSTOMERS_KEY, MILK_RECORDS_KEY } from '@/lib/storageKeys';
import { v4 as uuidv4 } from 'uuid';
import { PRICE_PER_LITER } from '@/lib/constants';

// Define more specific input type for adding milk records
type MilkRecordInputData = Pick<MilkRecord, 'quantity' | 'fat' | 'snf' | 'customerId'>;

interface AppDataContextType {
  customers: Customer[];
  milkRecords: MilkRecord[];
  addCustomer: (customerData: Omit<Customer, 'id'>) => Customer;
  getCustomerById: (id: string) => Customer | undefined;
  deleteCustomer: (customerId: string) => void;
  addMilkRecord: (recordData: MilkRecordInputData) => MilkRecord;
  getMilkRecordsByCustomerId: (customerId: string) => MilkRecord[];
  getLastNMilkRecordsByCustomerId: (customerId: string, n: number) => MilkRecord[];
  deleteMilkRecord: (recordId: string) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useClientStorage<Customer[]>(CUSTOMERS_KEY, []);
  const [milkRecords, setMilkRecords] = useClientStorage<MilkRecord[]>(MILK_RECORDS_KEY, []);

  const addCustomer = (customerData: Omit<Customer, 'id'>): Customer => {
    const newCustomer: Customer = { ...customerData, id: uuidv4() };
    setCustomers((prevCustomers) => [...prevCustomers, newCustomer]);
    return newCustomer;
  };

  const getCustomerById = (id: string): Customer | undefined => {
    return customers.find(customer => customer.id === id);
  };

  const deleteCustomer = (customerId: string): void => {
    setCustomers((prevCustomers) => prevCustomers.filter(c => c.id !== customerId));
    // Also delete all milk records for this customer
    setMilkRecords((prevRecords) => prevRecords.filter(r => r.customerId !== customerId));
  };

  const addMilkRecord = (recordData: MilkRecordInputData): MilkRecord => {
    const totalPrice = recordData.quantity * PRICE_PER_LITER;
    const newRecord: MilkRecord = { 
      ...recordData, 
      id: uuidv4(), 
      timestamp: new Date().toISOString(),
      totalPrice: totalPrice,
    };
    setMilkRecords((prevRecords) => [newRecord, ...prevRecords]); // Add to beginning for default sort by new
    return newRecord;
  };

  const getMilkRecordsByCustomerId = (customerId: string): MilkRecord[] => {
    return milkRecords
      .filter(record => record.customerId === customerId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };
  
  const getLastNMilkRecordsByCustomerId = (customerId: string, n: number): MilkRecord[] => {
    return getMilkRecordsByCustomerId(customerId).slice(0, n);
  };

  const deleteMilkRecord = (recordId: string): void => {
    setMilkRecords((prevRecords) => prevRecords.filter(r => r.id !== recordId));
  };

  return (
    <AppDataContext.Provider value={{ 
      customers, 
      milkRecords, 
      addCustomer, 
      getCustomerById,
      deleteCustomer,
      addMilkRecord, 
      getMilkRecordsByCustomerId,
      getLastNMilkRecordsByCustomerId,
      deleteMilkRecord
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
