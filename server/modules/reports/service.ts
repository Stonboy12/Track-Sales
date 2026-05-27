import { Errors } from "../../core/errors";
import { activityLogger } from "../../core/logger";
import { db } from "../../db/memory";
import type { Report } from "../../db/types";
import type { ReportGenerateInput, ReportSaveInput } from "./schemas";

interface Actor {
  id: string;
  name: string;
}

function fmtIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

const OUTCOME_LABEL: Record<string, string> = {
  order: "berhasil order",
  no_order: "no order",
  follow_up: "perlu follow-up",
  closed: "outlet tutup",
};

export const reportService = {
  /**
   * Mock "AI report generator". Mengubah input visit jadi narasi rapi.
   * Saat AI siap (LLM via OpenRouter), ganti implementasi fungsi ini saja.
   */
  generate(input: ReportGenerateInput, actor: Actor) {
    const total = input.visits.length;
    const success = input.visits.filter((v) => v.outcome === "order").length;
    const orderTotal = input.visits.reduce((s, v) => s + v.orderValue, 0);

    const lines: string[] = [];
    lines.push(`Laporan Harian — ${input.date}`);
    lines.push(`Salesperson: ${actor.name}`);
    lines.push("");
    lines.push(
      `Total ${total} visit dengan ${success} order berhasil; nilai order ${fmtIDR(orderTotal)}.`
    );
    lines.push("");
    lines.push("Detail Kunjungan:");
    input.visits.forEach((v, i) => {
      const tag = OUTCOME_LABEL[v.outcome] ?? v.outcome;
      const order = v.outcome === "order" ? ` (${fmtIDR(v.orderValue)})` : "";
      const note = v.notes ? ` — ${v.notes}` : "";
      lines.push(`${i + 1}. ${v.outletName}: ${tag}${order}${note}`);
    });
    if (input.generalNotes) {
      lines.push("");
      lines.push("Catatan Umum:");
      lines.push(input.generalNotes);
    }
    const generatedText = lines.join("\n");
    return {
      summary: { total, success, orderTotal },
      generatedText,
    };
  },

  list(salesId?: string) {
    return db.reports
      .findAll((r) => (salesId ? r.salesId === salesId : true))
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  get(id: string): Report {
    const r = db.reports.findById(id);
    if (!r) throw Errors.notFound("Report");
    return r;
  },

  save(input: ReportSaveInput, actor: Actor): Report {
    const created = db.reports.create({
      date: input.date,
      salesId: actor.id,
      visits: input.visits,
      generalNotes: input.generalNotes,
      generatedText: input.generatedText,
    });
    activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "report.save",
      entity: "report",
      entityId: created.id,
      meta: { date: created.date, visits: created.visits.length },
    });
    return created;
  },
};
