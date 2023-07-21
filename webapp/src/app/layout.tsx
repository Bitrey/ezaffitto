import "./globals.css";
import type { Metadata } from "next";

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
