"use client";

import * as React from "react";
import {
  Bell,
  Menu,
  Moon,
  Search,
  Sun,
  LogOut,
  User,
  Settings as SettingsIcon,
  HelpCircle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "./sidebar";
import { initialsOf } from "@/lib/utils";

const notifications = [
  {
    id: 1,
    title: "Komplain baru dari Toko Sumber Rejeki",
    time: "5 menit lalu",
    unread: true,
  },
  {
    id: 2,
    title: "Target mingguan Anda 78% tercapai",
    time: "1 jam lalu",
    unread: true,
  },
  {
    id: 3,
    title: "Harga kompetitor untuk Indomilk berubah",
    time: "3 jam lalu",
    unread: true,
  },
  {
    id: 4,
    title: "Visit ke Indomaret Sudirman terjadwal besok",
    time: "Kemarin",
    unread: false,
  },
];

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur lg:px-6">
      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar className="border-r-0" />
        </SheetContent>
      </Sheet>

      {/* Search */}
      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari outlet, produk, atau salesman..."
          className="pl-9"
        />
      </div>

      <div className="flex flex-1 items-center justify-end gap-1.5 md:flex-none">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Cari"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {mounted && theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-3 py-2">
              <p className="text-sm font-semibold">Notifikasi</p>
              <Badge variant="secondary">{unreadCount} baru</Badge>
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  className="flex items-start gap-2 px-3 py-2.5"
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      n.unread ? "bg-primary" : "bg-transparent"
                    }`}
                  />
                  <div className="flex-1 leading-tight">
                    <p className="text-sm">{n.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.time}</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-sm font-medium text-primary">
              Lihat semua notifikasi
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="ml-1 h-9 gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initialsOf("Adi Pratama")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left leading-tight sm:block">
                <p className="text-xs font-medium">Adi Pratama</p>
                <p className="text-[11px] text-muted-foreground">Sales Senior</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Akun saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4" /> Profil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SettingsIcon className="h-4 w-4" /> Pengaturan
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="h-4 w-4" /> Bantuan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" /> Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
