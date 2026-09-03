import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Research Log",
  description: "Independent study research log and progress dashboard.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
