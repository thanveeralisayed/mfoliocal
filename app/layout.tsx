import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/user/navbar";
import { ThemeProvider } from "@/components/user/theme-provider";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { GoogleAnalytics } from '@next/third-parties/google'
import { FinancialAssistantProvider } from "@/context/FinancialAssistantContext";
import { KuberChatWidget } from "@/components/user/chat/kuberChatWidget";

export const metadata: Metadata = {
  title: "MfolioCal | Mutual Fund & Home Loan Portfolio Calculator",
  description: "Mutual Fund Returns Analyzer & Home Loan EMI Amortization Planner with Kuber AI Assistant",
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
          <Navbar />
          <GoogleAnalytics gaId="G-LSXNKFMN4W" />
          <NuqsAdapter>
            <FinancialAssistantProvider>
              {children}
              <KuberChatWidget />
            </FinancialAssistantProvider>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
