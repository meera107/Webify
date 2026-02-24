import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Webify - Create Websites Instantly',
  description: 'Generate professional websites for your business in minutes',
  openGraph: {
    title: 'Webify - Create Websites Instantly',
    description: 'Generate professional websites for your business in minutes',
    images: ['/og-image.png'],
  },
};


export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  // Await params in Next.js 16
  const {locale} = await params;
  
  // Validate locale
  const validLocales = ['en', 'hi'];
  if (!validLocales.includes(locale)) {
    notFound();
  }

  // Get messages for the locale
  const messages = await getMessages({locale});

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}