import type { PromoResult } from "../../db/types";
import type { PromoCalculateInput, PromoSimulateInput } from "./schemas";

export const promoService = {
  /**
   * Pure function — tidak menyentuh DB. Sengaja dibuat deterministik
   * agar bisa dipanggil server-side maupun reused di service lain (mis. saat
   * generate quote / proposal otomatis).
   */
  calculate(input: PromoCalculateInput): PromoResult {
    const gross = input.basePrice * input.qty;
    const discountAmount = (gross * input.discountPct) / 100;
    const bundlingValue = input.bundling * input.basePrice;
    const finalPrice = Math.max(0, gross - discountAmount - bundlingValue - input.cashback);
    const effectiveQty = input.qty + input.bundling;
    const pricePerUnit = effectiveQty > 0 ? finalPrice / effectiveQty : 0;
    const savingsPct = gross > 0 ? ((gross - finalPrice) / gross) * 100 : 0;

    let marginPct: number | undefined;
    if (typeof input.costPerUnit === "number" && input.costPerUnit > 0 && effectiveQty > 0) {
      const totalCost = input.costPerUnit * effectiveQty;
      marginPct = finalPrice > 0 ? ((finalPrice - totalCost) / finalPrice) * 100 : 0;
    }

    return {
      gross: Math.round(gross),
      discountAmount: Math.round(discountAmount),
      bundlingValue: Math.round(bundlingValue),
      finalPrice: Math.round(finalPrice),
      effectiveQty,
      pricePerUnit: Math.round(pricePerUnit),
      savingsPct: Math.round(savingsPct * 10) / 10,
      ...(marginPct !== undefined ? { marginPct: Math.round(marginPct * 10) / 10 } : {}),
    };
  },

  simulate(input: PromoSimulateInput) {
    return input.scenarios.map((s) => ({
      name: s.name,
      input: s,
      result: this.calculate(s),
    }));
  },
};
