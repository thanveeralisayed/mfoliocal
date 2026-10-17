import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/user/navbar";
import { ThemeProvider } from "@/components/user/theme-provider";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { GoogleAnalytics } from '@next/third-parties/google'



export const metadata: Metadata = {
  title: "MfolioCal",
  description: "Mutual Fund Returns Analyzer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased pb-24 md:pb-0">
      <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
        <Navbar/>
        <GoogleAnalytics gaId="G-LSXNKFMN4W" />
        <NuqsAdapter>{children}</NuqsAdapter>
        </ThemeProvider>
        
      </body>
    </html>
  );
}
