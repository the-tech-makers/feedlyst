import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Feedlyst",
  description: "Embeddable content widgets for websites.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
