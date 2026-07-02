import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Philadelphia Data MCP",
  description:
    "A premium MCP interface for querying Philadelphia civic datasets, public records, and local context.",
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
