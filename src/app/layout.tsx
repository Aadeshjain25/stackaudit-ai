import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Inter, Space_Grotesk } from "next/font/google";

export const metadata: Metadata = {
  title: "StackAudit AI",
  description: "Automated engineering audit for your codebase",
  icons: {
    icon: [
      { url: "/logo.png?v=20260301b", type: "image/png" },
      { url: "/logo.png?v=20260301b", sizes: "32x32", type: "image/png" },
      { url: "/logo.png?v=20260301b", sizes: "192x192", type: "image/png" },
    ],
    shortcut: [{ url: "/logo.png?v=20260301b", type: "image/png" }],
    apple: [{ url: "/logo.png?v=20260301b", sizes: "180x180", type: "image/png" }],
  },
};
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
     <body className={`${inter.variable} ${display.variable} font-sans bg-[#070B14] text-white antialiased`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
