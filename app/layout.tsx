import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { DesktopHeader, Footer } from "@/components/navigation";

export const metadata: Metadata = {
  title: "Bloom Vapor Dashboard",
  description: "Account overview and orders for Bloom Vapor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-surface text-white">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <DesktopHeader />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
