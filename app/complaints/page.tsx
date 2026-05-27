"use client";

import * as React from "react";
import {
  Plus,
  AlertOctagon,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  MessageSquare,
  Send,
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
import {
  complaints,
  outlets,
  type Complaint,
  type ComplaintStatus,
  type Priority,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  ComplaintStatus,
  { label: string; tone: string; variant: "warning" | "info" | "success" }
> = {
  open: { label: "Open", tone: "bg-warning/15 text-warning", variant: "warning" },
  in_progress: { label: "In Progress", tone: "bg-primary/10 text-primary", variant: "info" },
  resolved: { label: "Resolved", tone: "bg-success/15 text-success", variant: "success" },
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

export default function ComplaintsPage() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selected, setSelected] = React.useState<Complaint | null>(null);

  const filtered = complaints.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (
      search &&
      !`${c.outlet} ${c.product} ${c.code}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const counts = {
    open: complaints.filter((c) => c.status === "open").length,
    in_progress: complaints.filter((c) => c.status === "in_progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Complaint Tracker"
        description="Catat, pantau, dan selesaikan komplain pelanggan dengan cepat."
        actions={
          <Dialog>
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
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih outlet" />
                    </SelectTrigger>
                    <SelectContent>
                      {outlets.map((o) => (
                        <SelectItem key={o.id} value={o.name}>
                          {o.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Kategori</Label>
                    <Select defaultValue="kualitas">
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
                    <Select defaultValue="medium">
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
                  <Input placeholder="Misal: Susu UHT 250ml" />
                </div>
                <div className="space-y-1.5">
                  <Label>Deskripsi</Label>
                  <Textarea rows={4} placeholder="Jelaskan komplain dari outlet..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Batal</Button>
                <Button>Simpan Komplain</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatusCard
          label="Open"
          count={counts.open}
          icon={AlertOctagon}
          tone="bg-warning/15 text-warning"
        />
        <StatusCard
          label="In Progress"
          count={counts.in_progress}
          icon={Clock}
          tone="bg-primary/10 text-primary"
        />
        <StatusCard
          label="Resolved"
          count={counts.resolved}
          icon={CheckCircle2}
          tone="bg-success/15 text-success"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base">Daftar Komplain</CardTitle>
              <CardDescription>{filtered.length} komplain</CardDescription>
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
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {filtered.length === 0 && (
            <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              Tidak ada komplain pada filter ini. 🎉
            </div>
          )}
          {filtered.map((c) => (
            <Sheet key={c.id}>
              <SheetTrigger asChild>
                <button
                  onClick={() => setSelected(c)}
                  className="w-full rounded-lg border bg-background p-4 text-left transition-colors hover:bg-muted/40"
                >
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
                      <p className="mt-1.5 truncate text-sm font-medium">{c.outlet}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {c.product} · {c.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 md:flex-col md:items-end">
                      <p className="text-xs text-muted-foreground">{c.createdAt}</p>
                      <p className="text-xs font-medium">{c.reportedBy}</p>
                    </div>
                  </div>
                </button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg">
                <ComplaintDetail complaint={c} />
              </SheetContent>
            </Sheet>
          ))}
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

function ComplaintDetail({ complaint }: { complaint: Complaint }) {
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
        <SheetDescription>{complaint.createdAt}</SheetDescription>
      </SheetHeader>

      <div className="space-y-3 rounded-lg border bg-muted/30 p-4 text-sm">
        <Field label="Outlet" value={complaint.outlet} />
        <Field label="Area" value={complaint.area} />
        <Field label="Produk" value={complaint.product} />
        <Field label="Kategori" value={complaint.category} className="capitalize" />
        <Field label="Dilaporkan oleh" value={complaint.reportedBy} />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-semibold">Deskripsi</p>
        <p className="rounded-lg border bg-background p-3 text-sm leading-relaxed text-muted-foreground">
          {complaint.description}
        </p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold">Timeline</p>
          <Badge variant="muted">{complaint.timeline.length} update</Badge>
        </div>
        <ol className="relative space-y-3 border-l pl-5">
          {complaint.timeline.map((t, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[26px] top-0.5 flex h-3 w-3 rounded-full bg-primary ring-4 ring-primary/15" />
              <p className="text-xs text-muted-foreground">{t.time}</p>
              <p className="text-sm">
                <span className="font-medium">{t.actor}</span>{" "}
                <span className="text-muted-foreground">— {t.note}</span>
              </p>
            </li>
          ))}
        </ol>
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="text-sm font-semibold">Tambah Update</p>
        <Textarea rows={3} placeholder="Tulis progress atau tindakan terbaru..." />
        <div className="flex flex-wrap gap-2">
          <Select defaultValue={complaint.status}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm">
            <Send className="h-4 w-4" /> Kirim Update
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
