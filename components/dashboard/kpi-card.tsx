import * as React from "react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number;
  caption?: string;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "destructive";
}

const toneClass: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function KpiCard({
  label,
  value,
  delta,
  caption,
  icon: Icon,
  tone = "default",
}: KpiCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          {Icon && (
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                toneClass[tone]
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
        <div className="mt-2 flex items-center gap-2 text-xs">
          {typeof delta === "number" && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
                positive
                  ? "bg-success/15 text-success"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(delta).toFixed(1)}%
            </span>
          )}
          {caption && <span className="text-muted-foreground">{caption}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
