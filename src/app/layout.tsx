import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { PeriodProvider } from "@/lib/period-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Adalysis — Search Ads Intelligence",
  description: "PPC analytics dashboard for Google Ads and Microsoft Ads",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <TooltipProvider>
          <PeriodProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="ml-[220px] flex flex-1 flex-col">
                <Topbar />
                <main className="flex-1 p-6">{children}</main>
              </div>
            </div>
          </PeriodProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
