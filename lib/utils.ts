/**
 * Format a number as BRL currency.
 * @param v - The value to format (null returns "—")
 * @param opts.mult - If true, appends "×" instead of "R$ " prefix (for multiplier columns)
 * @param opts.decimals - Number of decimal places (default: 2)
 */
export function fmtBRL(v: number | null | undefined, opts: { mult?: boolean; decimals?: number } = {}): string {
  if (v == null) return "—";
  const { mult = false, decimals = 2 } = opts;
  if (mult) return v.toFixed(decimals).replace(".", ",") + "×";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
