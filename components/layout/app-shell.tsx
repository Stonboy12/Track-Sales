"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

const BARE_PATHS = ["/login", "/register"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Halaman publik (login/register) tampil tanpa sidebar/topbar.
  if (BARE_PATHS.includes(pathname)) {
    return <>{children}</>;
  }
  return (
    <div className="flex h-svh w-full bg-muted/30">
      <Sidebar className="hidden lg:flex" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-screen-2xl p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
