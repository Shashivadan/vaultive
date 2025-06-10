import React from "react";
import { ThemeProvider } from "./theme-provider";
import { ClientProviders } from "./client-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClientProviders>
        <ThemeProvider attribute="class">{children}</ThemeProvider>
      </ClientProviders>
    </>
  );
}
