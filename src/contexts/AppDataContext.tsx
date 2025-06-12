"use client";

import type { Customer, MilkRecord } from '@/lib/types';
import { createContext, useContext, ReactNode } from 'react';
import useClientStorage from '@/hooks/useClientStorage';
import { CUSTOMERS_KEY, MILK_RECORDS_KEY } from '@/lib/storageKeys';
import { v4 as uuidv4 } from 'uuid';

interface AppDataContextType {
  customers: Customer[];
  milkRecords: MilkRecord[];
  addCustomer: (customerData: Omit<Customer, 'id'>) => Customer;
  getCustomerById: (id: string) => Customer | undefined;
  addMilkRecord: (recordData: Omit<MilkRecord, 'id' | 'timestamp'>) => MilkRecord;
  getMilkRecordsByCustomerId: (customerId: string) => MilkRecord[];
  getLastNMilkRecordsByCustomerId: (customerId: string, n: number) => MilkRecord[];
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

  const addMilkRecord = (recordData: Omit<MilkRecord, 'id' | 'timestamp'>): MilkRecord => {
    const newRecord: MilkRecord = { 
      ...recordData, 
      id: uuidv4(), 
      timestamp: new Date().toISOString() 
    };
    setMilkRecords((prevRecords) => [...prevRecords, newRecord]);
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

  return (
    <AppDataContext.Provider value={{ 
      customers, 
      milkRecords, 
      addCustomer, 
      getCustomerById, 
      addMilkRecord, 
      getMilkRecordsByCustomerId,
      getLastNMilkRecordsByCustomerId
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
