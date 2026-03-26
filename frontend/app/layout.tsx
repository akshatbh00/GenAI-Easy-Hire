import type { Metadata } from "next";
import { DM_Mono } from "next/font/google";
import "./globals.css";

const dmMono = DM_Mono({
  subsets:  ["latin"],
  weight:   ["300", "400", "500"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title:       "HireFlow — Transparent Hiring",
  description: "AI-powered hiring portal. No black boxes. Full pipeline transparency.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmMono.variable}>
      <body className="bg-[#0a0a0a] text-white antialiased">
        {children}
      </body>
    </html>
  );
}