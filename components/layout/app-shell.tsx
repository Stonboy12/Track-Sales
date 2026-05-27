"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import type { Role } from "@/server/db/types";

const BARE_PATHS = ["/login", "/register"];

interface AppShellProps {
  children: React.ReactNode;
  role?: Role;
  userName?: string;
}

export function AppShell({ children, role, userName }: AppShellProps) {
  const pathname = usePathname();
  if (BARE_PATHS.includes(pathname)) {
    return <>{children}</>;
  }
  return (
    <div className="flex h-svh w-full bg-muted/30">
      <Sidebar className="hidden lg:flex" role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar role={role} userName={userName} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-screen-2xl p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
