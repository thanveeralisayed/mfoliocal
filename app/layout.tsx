import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/user/navbar";
import { ThemeProvider } from "@/components/user/theme-provider";



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
        {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
