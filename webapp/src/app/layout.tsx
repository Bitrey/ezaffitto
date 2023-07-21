import type { Metadata } from "next";

import "./globals.css";
import "react-placeholder/lib/reactPlaceholder.css";

export const metadata: Metadata = {
  title: "ezaffitto (dev)",
  description: "Client web ezaffitto"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
