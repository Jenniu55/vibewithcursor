/**
 * Root layout component that wraps all pages in the application.
 * Uses system fonts to avoid 500 errors from font loading (e.g. under EMFILE).
 */

import type { Metadata } from "next";
import "./styles/globals.css";

export const metadata: Metadata = {
  title: "My Digital Piano",
  description: "An interactive digital piano with keyboard mapping and sample songs",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✨</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
