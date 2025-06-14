
"use client";

import type { Customer, MilkRecord, MilkSession, PaymentStatus } from '@/lib/types';
import { createContext, useContext, ReactNode, useMemo } from 'react';
import useClientStorage from '@/hooks/useClientStorage';
import { BASE_CUSTOMERS_KEY, BASE_MILK_RECORDS_KEY } from '@/lib/storageKeys';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO, isSameDay } from 'date-fns';
import { useAuth } from './AuthContext'; // Import useAuth

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
  isDataReady: boolean; // To indicate if user-specific data is loaded
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser, isLoading: isAuthLoading } = useAuth();

  // Define a stable key prefix based on user ID, or a default for unauthenticated/loading states
  // Using 'unauthenticated' for the key when no user is logged in makes it explicit.
  // Data for 'unauthenticated' will generally not be interacted with due to ProtectedPage.
  const userIdSpecificPrefix = useMemo(() => {
    if (isAuthLoading) return 'loading'; // Use a temporary key while auth is loading
    return currentUser?.id || 'unauthenticated';
  }, [currentUser, isAuthLoading]);

  const customersKey = `${BASE_CUSTOMERS_KEY}_${userIdSpecificPrefix}`;
  const milkRecordsKey = `${BASE_MILK_RECORDS_KEY}_${userIdSpecificPrefix}`;

  const [customers, setCustomers] = useClientStorage<Customer[]>(customersKey, []);
  const [milkRecords, setMilkRecords] = useClientStorage<MilkRecord[]>(milkRecordsKey, []);

  // isDataReady will be true when auth is no longer loading.
  // This helps consuming components know if the data context reflects the correct user.
  const isDataReady = !isAuthLoading;

  const addCustomer = (customerData: Omit<Customer, 'id'>): Customer => {
    if (!currentUser) throw new Error("User must be logged in to add a customer.");
    const newCustomer: Customer = { ...customerData, id: uuidv4() };
    setCustomers((prevCustomers) => [...prevCustomers, newCustomer]);
    return newCustomer;
  };

  const getCustomerById = (id: string): Customer | undefined => {
    return customers.find(customer => customer.id === id);
  };

  const deleteCustomer = (customerId: string): void => {
    if (!currentUser) throw new Error("User must be logged in to delete a customer.");
    setCustomers((prevCustomers) => prevCustomers.filter(c => c.id !== customerId));
    setMilkRecords((prevRecords) => prevRecords.filter(r => r.customerId !== customerId));
  };

  const addMilkRecord = (recordData: MilkRecordInputData): MilkRecord => {
    if (!currentUser) throw new Error("User must be logged in to add a milk record.");
    const totalPrice = recordData.quantity * recordData.pricePerLiter;
    const newRecord: MilkRecord = {
      ...recordData,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      totalPrice: totalPrice,
      paymentStatus: 'pending',
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
    if (!currentUser) throw new Error("User must be logged in to delete a milk record.");
    setMilkRecords((prevRecords) => prevRecords.filter(r => r.id !== recordId));
  };

  const updateMilkRecordPaymentStatus = (recordId: string, status: PaymentStatus): void => {
    if (!currentUser) throw new Error("User must be logged in to update payment status.");
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
      isDataReady,
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
