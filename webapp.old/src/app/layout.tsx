import type { Metadata } from "next";

import "./globals.css";
// import "react-placeholder/lib/reactPlaceholder.css";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "react-medium-image-zoom/dist/styles.css";

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
