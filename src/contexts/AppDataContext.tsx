
"use client";

import type { Customer, MilkRecord, MilkSession, PaymentStatus } from '@/lib/types';
import { createContext, useContext, ReactNode } from 'react';
import useClientStorage from '@/hooks/useClientStorage';
import { CUSTOMERS_KEY, MILK_RECORDS_KEY } from '@/lib/storageKeys';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO, isSameDay } from 'date-fns';


type MilkRecordInputData = Pick<MilkRecord, 'quantity' | 'fat' | 'snf' | 'degree' | 'pricePerLiter' | 'customerId' | 'session'>;

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
  updateMilkRecordPaymentStatus: (recordId: string, status: PaymentStatus) => void;
  getMilkRecordsByDate: (date: Date) => MilkRecord[];
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
    setMilkRecords((prevRecords) => prevRecords.filter(r => r.customerId !== customerId));
  };

  const addMilkRecord = (recordData: MilkRecordInputData): MilkRecord => {
    const totalPrice = recordData.quantity * recordData.pricePerLiter;
    const newRecord: MilkRecord = { 
      ...recordData, 
      id: uuidv4(), 
      timestamp: new Date().toISOString(),
      totalPrice: totalPrice,
      paymentStatus: 'pending', // Default payment status
    };
    setMilkRecords((prevRecords) => [newRecord, ...prevRecords]);
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

  const updateMilkRecordPaymentStatus = (recordId: string, status: PaymentStatus): void => {
    setMilkRecords((prevRecords) => 
      prevRecords.map(record => 
        record.id === recordId ? { ...record, paymentStatus: status } : record
      )
    );
  };

  const getMilkRecordsByDate = (date: Date): MilkRecord[] => {
    return milkRecords.filter(record => 
      isSameDay(parseISO(record.timestamp), date)
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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
      deleteMilkRecord,
      updateMilkRecordPaymentStatus,
      getMilkRecordsByDate,
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
