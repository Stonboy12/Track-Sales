import { Errors } from "../../core/errors";
import { activityLogger } from "../../core/logger";
import { db } from "../../db";
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
   * AI report generator.
   *
   * Strategi: bila `OPENROUTER_API_KEY` di-set, panggil LLM via OpenRouter
   * (OpenAI-compatible) untuk menyusun narasi yang lebih baik. Fallback ke
   * template deterministik bila key tidak ada — supaya deploy default tetap
   * jalan tanpa biaya API.
   */
  async generate(input: ReportGenerateInput, actor: Actor) {
    const total = input.visits.length;
    const success = input.visits.filter((v) => v.outcome === "order").length;
    const orderTotal = input.visits.reduce((s, v) => s + v.orderValue, 0);

    const fallbackText = buildTemplate(input, actor);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return {
        summary: { total, success, orderTotal },
        generatedText: fallbackText,
        provider: "template" as const,
      };
    }

    try {
      const llmText = await callOpenRouter(apiKey, fallbackText, input, actor);
      return {
        summary: { total, success, orderTotal },
        generatedText: llmText,
        provider: "openrouter" as const,
      };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[reports.generate] OpenRouter failed, fallback to template:", e);
      return {
        summary: { total, success, orderTotal },
        generatedText: fallbackText,
        provider: "template" as const,
      };
    }
  },

  async list(salesId?: string): Promise<Report[]> {
    return db.reports.findAll({
      where: salesId ? { sales_id: salesId } : undefined,
      order: [{ column: "date", ascending: false }],
    });
  },

  async get(id: string): Promise<Report> {
    const r = await db.reports.findById(id);
    if (!r) throw Errors.notFound("Report");
    return r;
  },

  async save(input: ReportSaveInput, actor: Actor): Promise<Report> {
    const created = await db.reports.create({
      date: input.date,
      salesId: actor.id,
      visits: input.visits,
      generalNotes: input.generalNotes,
      generatedText: input.generatedText,
    });
    await activityLogger.record({
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


// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function buildTemplate(input: ReportGenerateInput, actor: Actor) {
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
  return lines.join("\n");
}

const SYSTEM_PROMPT = `Anda adalah asisten manajer sales FMCG di Indonesia.
Tugas: menulis laporan harian dari data visit yang diberikan.
Aturan:
- Bahasa Indonesia profesional, ringkas, struktur jelas.
- Format: judul, paragraf ringkasan eksekutif (2-3 kalimat), bullet list per kunjungan, lalu rekomendasi tindakan untuk supervisor (3-5 poin).
- Sebut nilai order dalam format Rupiah (Rp 1.234.567).
- Jangan mengarang angka di luar data input.
- Maksimal ~250 kata.`;

async function callOpenRouter(
  apiKey: string,
  fallback: string,
  input: ReportGenerateInput,
  actor: Actor
): Promise<string> {
  const model = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free";
  const userMessage = [
    `Tanggal: ${input.date}`,
    `Salesperson: ${actor.name}`,
    "",
    "Visit:",
    ...input.visits.map(
      (v, i) =>
        `${i + 1}. Outlet=${v.outletName}; outcome=${v.outcome}; orderValue=${v.orderValue}; notes=${v.notes ?? "-"}`
    ),
    input.generalNotes ? `\nCatatan umum: ${input.generalNotes}` : "",
    "",
    "Tulis laporan harian sesuai aturan.",
  ].join("\n");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer":
        process.env.OPENROUTER_REFERER || "https://4y8jtr73.insforge.site",
      "X-Title": "FMCG Sales OS",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.4,
      max_tokens: 600,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenRouter ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("OpenRouter returned empty content");
  }
  // Sertakan fallback summary di akhir untuk menjaga nilai numerik tetap akurat.
  return text + "\n\n— Ringkasan akurat sistem —\n" + fallback;
}
