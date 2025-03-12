import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/user/navbar";
import { ThemeProvider } from "@/components/user/theme-provider";
import { NuqsAdapter } from 'nuqs/adapters/next/app'



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
      <body >
      <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
        <Navbar/>
        <NuqsAdapter>{children}</NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
