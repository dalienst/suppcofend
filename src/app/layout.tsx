
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";
import { auth } from "@/auth";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SUPPCO | B2B Supply Chain Platform",
  description: "Advanced procurement and inventory management for construction and industrial projects.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const role = (session?.user as any)?.is_supplier 
    ? "supplier" 
    : (session?.user as any)?.is_contractor 
      ? "contractor" 
      : "none";

  return (
    <html lang="en" className="h-full">
      <body
        className={cn(
          inter.variable,
          "font-sans antialiased h-full flex flex-col pt-16 bg-slate-50"
        )}
      >
        <Providers session={session}>
          <Navbar />
          <div className="flex-1 flex overflow-hidden">
            {role !== "none" && <Sidebar role={role as any} />}
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
