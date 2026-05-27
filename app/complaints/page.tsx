"use client";

import * as React from "react";
import {
  Plus,
  AlertOctagon,
  Clock,
  CheckCircle2,
  Search,
  Send,
  Loader2,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { api, ApiClientError } from "@/lib/api-client";
import { insforge } from "@/lib/insforge";
import { cn } from "@/lib/utils";
import type {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  Outlet,
  Priority,
} from "@/server/db/types";

const statusConfig: Record<
  ComplaintStatus,
  { label: string; variant: "warning" | "info" | "success" }
> = {
  open: { label: "Open", variant: "warning" },
  in_progress: { label: "In Progress", variant: "info" },
  resolved: { label: "Resolved", variant: "success" },
};

const priorityVariant: Record<Priority, "destructive" | "warning" | "muted"> = {
  high: "destructive",
  medium: "warning",
  low: "muted",
};

const priorityLabel: Record<Priority, string> = {
  high: "Tinggi",
  medium: "Sedang",
  low: "Rendah",
};

const ALL = "__all__";

export default function ComplaintsPage() {
  const [items, setItems] = React.useState<Complaint[]>([]);
  const [outlets, setOutlets] = React.useState<Outlet[]>([]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>(ALL);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  // create form
  const [open, setOpen] = React.useState(false);
  const [fOutlet, setFOutlet] = React.useState("");
  const [fProduct, setFProduct] = React.useState("");
  const [fCategory, setFCategory] = React.useState<ComplaintCategory>("kualitas");
  const [fPriority, setFPriority] = React.useState<Priority>("medium");
  const [fDescription, setFDescription] = React.useState("");
  const [fAttachments, setFAttachments] = React.useState<string[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [c, o] = await Promise.all([
          api.get<Complaint[]>("/api/complaints"),
          api.get<Outlet[]>("/api/outlets"),
        ]);
        setItems(c);
        setOutlets(o);
      } catch (e) {
        setError(e instanceof ApiClientError ? e.message : "Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function refresh() {
    const data = await api.get<Complaint[]>("/api/complaints");
    setItems(data);
  }

  async function createComplaint() {
    if (!fOutlet || !fProduct || !fDescription) {
      setError("Lengkapi outlet, produk, dan deskripsi.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await api.post<Complaint>("/api/complaints", {
        outletId: fOutlet,
        productName: fProduct.trim(),
        category: fCategory,
        priority: fPriority,
        description: fDescription.trim(),
        attachmentUrls: fAttachments,
      });
      setInfo(`Komplain ${created.code} tersimpan${fAttachments.length ? ` (${fAttachments.length} foto)` : ""}.`);
      setOpen(false);
      // reset
      setFOutlet("");
      setFProduct("");
      setFCategory("kualitas");
      setFPriority("medium");
      setFDescription("");
      setFAttachments([]);
      await refresh();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Gagal menyimpan komplain.");
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = items.filter((c) => {
    if (statusFilter !== ALL && c.status !== statusFilter) return false;
    if (
      search &&
      !`${c.outletName} ${c.productName} ${c.code}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const counts = {
    open: items.filter((c) => c.status === "open").length,
    in_progress: items.filter((c) => c.status === "in_progress").length,
    resolved: items.filter((c) => c.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Complaint Tracker"
        description="Catat, pantau, dan selesaikan komplain pelanggan dengan cepat."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" /> Komplain Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Catat Komplain Baru</DialogTitle>
                <DialogDescription>
                  Isi detail komplain yang dilaporkan oleh outlet.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Outlet</Label>
                  <Select value={fOutlet} onValueChange={setFOutlet}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih outlet" />
                    </SelectTrigger>
                    <SelectContent>
                      {outlets.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Kategori</Label>
                    <Select
                      value={fCategory}
                      onValueChange={(v) => setFCategory(v as ComplaintCategory)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kualitas">Kualitas</SelectItem>
                        <SelectItem value="pengiriman">Pengiriman</SelectItem>
                        <SelectItem value="harga">Harga</SelectItem>
                        <SelectItem value="lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Prioritas</Label>
                    <Select
                      value={fPriority}
                      onValueChange={(v) => setFPriority(v as Priority)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Tinggi</SelectItem>
                        <SelectItem value="medium">Sedang</SelectItem>
                        <SelectItem value="low">Rendah</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Produk Terkait</Label>
                  <Input
                    value={fProduct}
                    onChange={(e) => setFProduct(e.target.value)}
                    placeholder="Misal: Susu UHT 250ml"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Deskripsi</Label>
                  <Textarea
                    rows={4}
                    value={fDescription}
                    onChange={(e) => setFDescription(e.target.value)}
                    placeholder="Jelaskan komplain dari outlet..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Foto bukti (opsional, max 10)</Label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading || fAttachments.length >= 10}
                    onChange={async (e) => {
                      const files = Array.from(e.target.files ?? []);
                      e.currentTarget.value = "";
                      if (!files.length) return;
                      setUploading(true);
                      setError(null);
                      try {
                        const remaining = 10 - fAttachments.length;
                        const uploads = await Promise.all(
                          files.slice(0, remaining).map((f) =>
                            insforge.storage.from("attachments").uploadAuto(f)
                          )
                        );
                        const urls = uploads
                          .map((u) => u.data?.url)
                          .filter((u): u is string => Boolean(u));
                        if (urls.length === 0) {
                          throw new Error("Upload gagal — server tidak mengembalikan URL.");
                        }
                        setFAttachments((prev) => [...prev, ...urls]);
                      } catch (err) {
                        setError(
                          err instanceof Error ? err.message : "Upload foto gagal."
                        );
                      } finally {
                        setUploading(false);
                      }
                    }}
                    className="block w-full text-xs file:mr-2 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-secondary-foreground hover:file:bg-secondary/80"
                  />
                  {(uploading || fAttachments.length > 0) && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {uploading && (
                        <span className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-xs">
                          <Loader2 className="h-3 w-3 animate-spin" /> Upload...
                        </span>
                      )}
                      {fAttachments.map((url, i) => (
                        <div
                          key={url}
                          className="relative h-14 w-14 overflow-hidden rounded-md border bg-muted"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`foto ${i + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFAttachments((prev) => prev.filter((u) => u !== url))}
                            className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background/90 text-destructive hover:bg-background"
                            title="Hapus"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Batal
                </Button>
                <Button onClick={createComplaint} disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Simpan Komplain"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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

      <div className="grid gap-4 sm:grid-cols-3">
        <StatusCard label="Open" count={counts.open} icon={AlertOctagon} tone="bg-warning/15 text-warning" />
        <StatusCard label="In Progress" count={counts.in_progress} icon={Clock} tone="bg-primary/10 text-primary" />
        <StatusCard label="Resolved" count={counts.resolved} icon={CheckCircle2} tone="bg-success/15 text-success" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base">Daftar Komplain</CardTitle>
              <CardDescription>
                {loading ? "memuat..." : `${filtered.length} komplain`}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari kode/outlet/produk..."
                  className="pl-8 sm:w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Semua Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              {items.length === 0
                ? "Belum ada komplain. 🎉 Tetap pantau outlet rutin."
                : "Tidak ada komplain pada filter ini."}
            </div>
          ) : (
            filtered.map((c) => (
              <Sheet key={c.id}>
                <SheetTrigger asChild>
                  <button className="w-full rounded-lg border bg-background p-4 text-left transition-colors hover:bg-muted/40">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-xs text-muted-foreground">{c.code}</p>
                          <Badge variant={statusConfig[c.status].variant}>
                            {statusConfig[c.status].label}
                          </Badge>
                          <Badge variant={priorityVariant[c.priority]} className="text-[10px]">
                            {priorityLabel[c.priority]}
                          </Badge>
                        </div>
                        <p className="mt-1.5 truncate text-sm font-medium">{c.outletName}</p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {c.productName} · {c.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 md:flex-col md:items-end">
                        <p className="text-xs text-muted-foreground">
                          {new Date(c.createdAt).toLocaleString("id-ID")}
                        </p>
                        <p className="text-xs font-medium">{c.reportedByName}</p>
                      </div>
                    </div>
                  </button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg">
                  <ComplaintDetail complaint={c} onUpdated={refresh} />
                </SheetContent>
              </Sheet>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusCard({
  label,
  count,
  icon: Icon,
  tone,
}: {
  label: string;
  count: number;
  icon: typeof AlertOctagon;
  tone: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg", tone)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{count}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ComplaintDetail({
  complaint,
  onUpdated,
}: {
  complaint: Complaint;
  onUpdated: () => Promise<void>;
}) {
  const [note, setNote] = React.useState("");
  const [status, setStatus] = React.useState<ComplaintStatus>(complaint.status);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit() {
    if (!note.trim()) {
      setError("Tulis catatan update terlebih dahulu.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/api/complaints/${complaint.id}/timeline`, {
        note: note.trim(),
        status,
      });
      setNote("");
      await onUpdated();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Gagal mengirim update.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <SheetHeader>
        <div className="flex items-center gap-2">
          <Badge variant={statusConfig[complaint.status].variant}>
            {statusConfig[complaint.status].label}
          </Badge>
          <Badge variant={priorityVariant[complaint.priority]} className="text-[10px]">
            {priorityLabel[complaint.priority]}
          </Badge>
        </div>
        <SheetTitle className="text-xl">{complaint.code}</SheetTitle>
        <SheetDescription>
          {new Date(complaint.createdAt).toLocaleString("id-ID")}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-3 rounded-lg border bg-muted/30 p-4 text-sm">
        <Field label="Outlet" value={complaint.outletName} />
        <Field label="Area" value={complaint.area} />
        <Field label="Produk" value={complaint.productName} />
        <Field label="Kategori" value={complaint.category} className="capitalize" />
        <Field label="Dilaporkan oleh" value={complaint.reportedByName} />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-semibold">Deskripsi</p>
        <p className="rounded-lg border bg-background p-3 text-sm leading-relaxed text-muted-foreground">
          {complaint.description}
        </p>
      </div>

      {complaint.attachmentUrls && complaint.attachmentUrls.length > 0 && (
        <div>
          <p className="mb-1.5 text-sm font-semibold">
            Foto Bukti ({complaint.attachmentUrls.length})
          </p>
          <div className="grid grid-cols-3 gap-2">
            {complaint.attachmentUrls.map((url, i) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-square overflow-hidden rounded-md border bg-muted hover:opacity-90"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`foto ${i + 1}`} className="h-full w-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold">Timeline</p>
          <Badge variant="muted">{complaint.timeline.length} update</Badge>
        </div>
        <ol className="relative space-y-3 border-l pl-5">
          {complaint.timeline.map((t, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[26px] top-0.5 flex h-3 w-3 rounded-full bg-primary ring-4 ring-primary/15" />
              <p className="text-xs text-muted-foreground">
                {new Date(t.at).toLocaleString("id-ID")}
              </p>
              <p className="text-sm">
                <span className="font-medium">{t.actorName}</span>{" "}
                <span className="text-muted-foreground">— {t.note}</span>
              </p>
            </li>
          ))}
        </ol>
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="text-sm font-semibold">Tambah Update</p>
        <Textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Tulis progress atau tindakan terbaru..."
        />
        {error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as ComplaintStatus)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={submit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Kirim Update</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-right font-medium", className)}>{value}</span>
    </div>
  );
}
