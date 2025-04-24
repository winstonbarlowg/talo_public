import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Mortgage Calculator',
  description: 'Calculate mortgage payments, refinancing scenarios, and more',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}