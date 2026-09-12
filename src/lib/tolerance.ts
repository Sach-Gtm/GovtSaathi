export interface Tolerance {
  id: string;
  category: string;
  accuracy_class: string | null;
  mpe_value: number;
  mpe_unit: string;
  mpe_is_percent: boolean;
  basis: string | null;
  reference: string | null;
}

/** Pull the first numeric value out of a free-text reading like "50.02 kg". */
export function parseNum(s?: string | null): number | null {
  if (s === null || s === undefined) return null;
  const m = String(s).replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

/** Best-matching tolerance: exact class, else category default, else first. */
export function pickTolerance(list: Tolerance[], category: string, accuracyClass?: string | null): Tolerance | null {
  const byCat = list.filter((t) => t.category === category);
  if (!byCat.length) return null;
  if (accuracyClass) {
    const exact = byCat.find((t) => (t.accuracy_class ?? "").toUpperCase() === accuracyClass.toUpperCase());
    if (exact) return exact;
  }
  return byCat.find((t) => !t.accuracy_class) ?? byCat[0];
}

export interface Verdict {
  error: number;
  mpe: number;
  ok: boolean;
}

export function evaluate(tol: Tolerance, reference: number, observed: number): Verdict {
  const error = observed - reference;
  const mpe = tol.mpe_is_percent ? Math.abs(reference) * (tol.mpe_value / 100) : tol.mpe_value;
  return { error, mpe, ok: Math.abs(error) <= mpe + 1e-9 };
}

export function mpeLabel(tol: Tolerance): string {
  return tol.mpe_is_percent ? `±${tol.mpe_value}%` : `±${tol.mpe_value} ${tol.mpe_unit}`;
}
