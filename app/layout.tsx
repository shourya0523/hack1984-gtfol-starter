import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "HACK1984 / GTFOL",
  description: "Off localhost, on the internet.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
