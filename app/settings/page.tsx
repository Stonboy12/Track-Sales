"use client";

import * as React from "react";
import {
  User,
  Palette,
  Bell,
  Plug,
  Save,
  Sun,
  Moon,
  Monitor,
  Camera,
} from "lucide-react";
import { useTheme } from "next-themes";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { initialsOf, cn } from "@/lib/utils";

const integrations = [
  { name: "Google Calendar", desc: "Sinkron jadwal visit otomatis", connected: true },
  { name: "WhatsApp Business", desc: "Kirim laporan & update ke supervisor", connected: true },
  { name: "Google Maps", desc: "Navigasi rute outlet", connected: false },
  { name: "Email (SMTP)", desc: "Kirim laporan harian via email", connected: false },
];

const notifPrefs = [
  { id: "n1", label: "Visit reminder", desc: "Notifikasi 15 menit sebelum jadwal visit", on: true },
  { id: "n2", label: "Komplain baru", desc: "Saat ada komplain baru di area Anda", on: true },
  { id: "n3", label: "Update target", desc: "Saat target mingguan berubah", on: false },
  { id: "n4", label: "Insight mingguan", desc: "Ringkasan performa setiap Senin", on: true },
  { id: "n5", label: "Promo baru", desc: "Saat ada promo produk baru", on: true },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [prefs, setPrefs] = React.useState(notifPrefs);

  React.useEffect(() => setMounted(true), []);

  const togglePref = (id: string) =>
    setPrefs((prev) => prev.map((p) => (p.id === id ? { ...p, on: !p.on } : p)));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Kelola profil, tema, notifikasi, dan integrasi akun Anda."
        actions={
          <Button size="sm">
            <Save className="h-4 w-4" /> Simpan Perubahan
          </Button>
        }
      />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:w-fit sm:grid-cols-4">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" /> Profil
          </TabsTrigger>
          <TabsTrigger value="theme" className="gap-2">
            <Palette className="h-4 w-4" /> Tampilan
          </TabsTrigger>
          <TabsTrigger value="notif" className="gap-2">
            <Bell className="h-4 w-4" /> Notifikasi
          </TabsTrigger>
          <TabsTrigger value="integration" className="gap-2">
            <Plug className="h-4 w-4" /> Integrasi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informasi Profil</CardTitle>
              <CardDescription>Detail akun dan kontak Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
                      {initialsOf("Adi Pratama")}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div>
                  <p className="font-semibold">Adi Pratama</p>
                  <p className="text-sm text-muted-foreground">Sales Senior · Jakarta Selatan</p>
                  <Badge variant="info" className="mt-1.5">PT Sumber Niaga</Badge>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="fname">Nama Lengkap</Label>
                  <Input id="fname" defaultValue="Adi Pratama" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="adi.pratama@sumbernag.co.id" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Nomor HP</Label>
                  <Input id="phone" defaultValue="+62 812-3456-7890" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" defaultValue="Sales Senior" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="area">Area Coverage</Label>
                  <Input id="area" defaultValue="Jakarta Selatan" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lang">Bahasa</Label>
                  <Input id="lang" defaultValue="Indonesia" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio Singkat</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  defaultValue="Sales senior dengan pengalaman 5 tahun di FMCG. Spesialisasi outlet segmen A."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tampilan</CardTitle>
              <CardDescription>Sesuaikan tema sesuai preferensi Anda.</CardDescription>
            </CardHeader>
            <CardContent>
              {mounted && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { val: "light", label: "Terang", icon: Sun },
                    { val: "dark", label: "Gelap", icon: Moon },
                    { val: "system", label: "Sistem", icon: Monitor },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const active = theme === opt.val;
                    return (
                      <button
                        key={opt.val}
                        onClick={() => setTheme(opt.val)}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors",
                          active
                            ? "border-primary bg-primary/5"
                            : "border-border bg-background hover:bg-muted/40"
                        )}
                      >
                        <Icon className={cn("h-6 w-6", active && "text-primary")} />
                        <span className="text-sm font-medium">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Density & Aksesibilitas</CardTitle>
              <CardDescription>Pilih kepadatan tampilan & opsi aksesibilitas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <PrefRow
                label="Mode kompak"
                desc="Mengurangi padding untuk tampilan lebih padat."
              />
              <Separator />
              <PrefRow
                label="Animasi minimal"
                desc="Kurangi animasi & transisi (untuk pengguna sensitif)."
              />
              <Separator />
              <PrefRow
                label="Font besar"
                desc="Perbesar ukuran teks default 12.5%."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notif" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Preferensi Notifikasi</CardTitle>
              <CardDescription>Pilih notifikasi yang ingin Anda terima.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {prefs.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                  <Switch checked={p.on} onCheckedChange={() => togglePref(p.id)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Integrasi Akun</CardTitle>
              <CardDescription>
                Hubungkan FMCG Sales OS dengan tools lain (placeholder).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {integrations.map((it) => (
                <div
                  key={it.name}
                  className="flex items-center gap-3 rounded-lg border bg-background p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                    <Plug className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{it.name}</p>
                      {it.connected && (
                        <Badge variant="success" className="text-[10px]">
                          Terhubung
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{it.desc}</p>
                  </div>
                  <Button
                    variant={it.connected ? "outline" : "default"}
                    size="sm"
                  >
                    {it.connected ? "Putuskan" : "Hubungkan"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PrefRow({ label, desc }: { label: string; desc: string }) {
  const [on, setOn] = React.useState(false);
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={on} onCheckedChange={setOn} />
    </div>
  );
}
