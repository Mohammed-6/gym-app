import { ImportFieldDef } from "./field-definitions";

/**
 * Old paper registers almost always use DD-MM-YYYY (or DD/MM/YYYY) rather than ISO —
 * JS's native Date parser gets that backwards, so convert it before it ever reaches
 * validation. Anything already ISO-shaped, or anything we don't recognize, passes through
 * unchanged (an unrecognized format will surface as a per-row error the user can fix).
 */
function normalizeDateValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || /^\d{4}-\d{1,2}-\d{1,2}/.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (!match) {
    return trimmed;
  }

  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function buildMemberRow(
  sourceRow: Record<string, string>,
  mapping: Record<string, string>,
  defaults: Record<string, string>,
  fields: ImportFieldDef[]
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const field of fields) {
    const column = mapping[field.key];
    const fromColumn = column ? sourceRow[column] : "";
    let value = fromColumn || defaults[field.key] || "";
    if (value && field.kind === "date") {
      value = normalizeDateValue(value);
    }
    if (value) {
      result[field.key] = value;
    }
  }
  return result;
}
