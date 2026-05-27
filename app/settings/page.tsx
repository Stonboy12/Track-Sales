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
  Loader2,
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
import { api, ApiClientError } from "@/lib/api-client";
import { initialsOf, cn } from "@/lib/utils";
import type { PublicUser, UserSetting } from "@/server/db/types";

const integrations = [
  { name: "Google Calendar", desc: "Sinkron jadwal visit otomatis", connected: false },
  { name: "WhatsApp Business", desc: "Kirim laporan & update ke supervisor", connected: false },
  { name: "Google Maps", desc: "Navigasi rute outlet", connected: false },
  { name: "Email (SMTP)", desc: "Kirim laporan harian via email", connected: false },
];

const NOTIF_KEYS: { id: string; label: string; desc: string }[] = [
  { id: "visit_reminder", label: "Visit reminder", desc: "Notifikasi 15 menit sebelum jadwal visit" },
  { id: "new_complaint", label: "Komplain baru", desc: "Saat ada komplain baru di area Anda" },
  { id: "target_update", label: "Update target", desc: "Saat target mingguan berubah" },
  { id: "weekly_insight", label: "Insight mingguan", desc: "Ringkasan performa setiap Senin" },
  { id: "new_promo", label: "Promo baru", desc: "Saat ada promo produk baru" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  const [me, setMe] = React.useState<PublicUser | null>(null);
  const [settings, setSettings] = React.useState<UserSetting | null>(null);
  const [bio, setBio] = React.useState("");
  const [notifs, setNotifs] = React.useState<Record<string, boolean>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [user, setting] = await Promise.all([
          api.get<PublicUser>("/api/auth/me"),
          api.get<UserSetting>("/api/settings"),
        ]);
        setMe(user);
        setSettings(setting);
        setBio(setting.bio ?? "");
        setNotifs(setting.notifications ?? {});
        if (mounted && setting.theme && setting.theme !== theme) {
          setTheme(setting.theme);
        }
      } catch (e) {
        setError(e instanceof ApiClientError ? e.message : "Gagal memuat settings.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const updated = await api.patch<UserSetting>("/api/settings", {
        theme: theme as "light" | "dark" | "system",
        bio: bio.trim() || undefined,
        notifications: notifs,
      });
      setSettings(updated);
      setInfo("Settings tersimpan.");
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  void settings;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Kelola profil, tema, notifikasi, dan integrasi akun Anda."
        actions={
          <Button size="sm" onClick={save} disabled={saving || loading}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Perubahan
          </Button>
        }
      />

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {info && (
        <div className="rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">
          {info}
        </div>
      )}

      {loading ? (
        <Card>
          <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat...
          </CardContent>
        </Card>
      ) : (
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
                <CardDescription>Detail akun dari InsForge dan profil internal Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
                      {initialsOf(me?.name ?? "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{me?.name ?? "—"}</p>
                    <p className="text-sm text-muted-foreground">
                      {me?.role === "admin" ? "Administrator" : "Sales"}
                      {me?.area ? ` · ${me.area}` : ""}
                    </p>
                    <Badge variant="info" className="mt-1.5 capitalize">{me?.role ?? "—"}</Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="fname">Nama Lengkap</Label>
                    <Input id="fname" value={me?.name ?? ""} disabled />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={me?.email ?? ""} disabled />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Nomor HP</Label>
                    <Input id="phone" value={me?.phone ?? ""} disabled />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" value={me?.role ?? ""} disabled className="capitalize" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="area">Area Coverage</Label>
                    <Input id="area" value={me?.area ?? "—"} disabled />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="target">Target Bulanan</Label>
                    <Input
                      id="target"
                      value={me?.monthlyTarget ? `Rp ${me.monthlyTarget.toLocaleString("id-ID")}` : "—"}
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bio">Bio Singkat</Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Ceritakan sedikit tentang diri Anda..."
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  Email, nama, dan area dikelola di InsForge & user_profiles. Edit profil lanjut tidak tersedia di MVP ini.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="theme" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tampilan</CardTitle>
                <CardDescription>Sesuaikan tema. Disimpan ke profil server.</CardDescription>
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
          </TabsContent>

          <TabsContent value="notif" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Preferensi Notifikasi</CardTitle>
                <CardDescription>Pilih notifikasi yang ingin Anda terima.</CardDescription>
              </CardHeader>
              <CardContent className="divide-y">
                {NOTIF_KEYS.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{p.label}</p>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                    <Switch
                      checked={!!notifs[p.id]}
                      onCheckedChange={(v) => setNotifs((prev) => ({ ...prev, [p.id]: v }))}
                    />
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
                      <p className="text-sm font-medium">{it.name}</p>
                      <p className="text-xs text-muted-foreground">{it.desc}</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Hubungkan
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
