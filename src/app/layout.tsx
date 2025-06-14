
import type { Metadata } from 'next';
import './globals.css';
import { AppDataProvider } from '@/contexts/AppDataContext';
import { AuthProvider } from '@/contexts/AuthContext'; // Import AuthProvider
import ProtectedPage from '@/components/shared/ProtectedPage'; // Import ProtectedPage
import Header from '@/components/layout/Header';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'DairySMS - Milk Management',
  description: 'Manage customers and milk records for your dairy business.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-background">
        <AuthProvider> {/* AuthProvider wraps everything */}
          <AppDataProvider> {/* AppDataProvider can be inside AuthProvider */}
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              <ProtectedPage>{children}</ProtectedPage> {/* ProtectedPage wraps children */}
            </main>
            <Toaster />
          </AppDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
