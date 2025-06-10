import type { Metadata } from "next";

import "./globals.css";
import "@/styles/utils.css";

import Providers from "@/components/providers";
import Navbar from "@/components/sections/navbar/default";

export const metadata: Metadata = {
  title: "JStack App",
  description: "Created using JStack",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body className="antialiased ">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
