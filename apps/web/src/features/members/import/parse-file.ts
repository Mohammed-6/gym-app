import * as XLSX from "xlsx";

export interface ParsedSpreadsheet {
  columns: string[];
  rows: Record<string, string>[];
}

const MAX_ROWS = 5000;

export async function parseSpreadsheetFile(file: File): Promise<ParsedSpreadsheet> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("The file has no sheets");
  }

  const worksheet = workbook.Sheets[firstSheetName];
  // defval keeps every row the same shape even when a cell is blank; raw:false formats
  // numbers/dates as the strings a spreadsheet would show, so parsing stays predictable.
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: "",
    raw: false,
  });

  if (rawRows.length === 0) {
    throw new Error("No rows found in the file");
  }
  if (rawRows.length > MAX_ROWS) {
    throw new Error(`This file has ${rawRows.length} rows — please split it into batches of ${MAX_ROWS} or fewer`);
  }

  const columns = Object.keys(rawRows[0]);
  const rows = rawRows.map((row) => {
    const stringRow: Record<string, string> = {};
    for (const column of columns) {
      const value = row[column];
      stringRow[column] = value === undefined || value === null ? "" : String(value).trim();
    }
    return stringRow;
  });

  return { columns, rows };
}
