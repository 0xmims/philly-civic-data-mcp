import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Philadelphia Civic Data MCP",
  description:
    "Read-only MCP server for discovering, inspecting, querying, and planning work with Philadelphia civic datasets.",
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
