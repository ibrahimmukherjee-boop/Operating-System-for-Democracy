import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Operating System for a Democracy",
  description: "Transparent, auditable framework for evaluating governments and policies",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="max-w-6xl mx-auto px-4 pb-16">{children}</main>
      </body>
    </html>
  );
}
