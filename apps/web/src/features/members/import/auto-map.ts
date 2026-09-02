import { IMPORT_FIELDS } from "./field-definitions";

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Best-effort guess at which file column maps to which target field, based on header text.
 * The receptionist can override every suggestion in the mapping step — this just saves
 * re-picking the obvious ones (columns are rarely in a predictable order in an old register).
 */
export function autoMapColumns(columns: string[]): Record<string, string> {
  const normalizedColumns = columns.map((column) => ({ original: column, normalized: normalize(column) }));
  const mapping: Record<string, string> = {};
  const usedColumns = new Set<string>();

  for (const field of IMPORT_FIELDS) {
    const exactMatch = normalizedColumns.find(
      (column) => !usedColumns.has(column.original) && field.aliases.includes(column.normalized)
    );
    if (exactMatch) {
      mapping[field.key] = exactMatch.original;
      usedColumns.add(exactMatch.original);
      continue;
    }

    const partialMatch = normalizedColumns.find(
      (column) =>
        !usedColumns.has(column.original) &&
        field.aliases.some((alias) => column.normalized.includes(alias) || alias.includes(column.normalized))
    );
    if (partialMatch) {
      mapping[field.key] = partialMatch.original;
      usedColumns.add(partialMatch.original);
    }
  }

  return mapping;
}
