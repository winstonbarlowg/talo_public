import { Inter } from 'next/font/google';
import './globals.css';
import { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Mortgage Calculator',
  description: 'Calculate mortgage payments, refinancing scenarios, and more',
};

// Add type definition for the layout props
interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* This tells the browser: resolve all relative URLs from /talo_public/ */}
        <base href="/talo_public/" />
      </head>
      <body>{children}</body>
    </html>
  );
}