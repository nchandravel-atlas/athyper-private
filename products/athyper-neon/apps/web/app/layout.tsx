import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neon",
  description: "athyper Neon Workbench"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
