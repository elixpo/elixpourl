import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ElixpoURL',
  description: 'URL shortener for the Elixpo ecosystem',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
