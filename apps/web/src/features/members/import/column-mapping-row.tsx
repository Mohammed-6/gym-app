import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ImportFieldDef } from "./field-definitions";

interface ColumnMappingRowProps {
  field: ImportFieldDef;
  columns: string[];
  selectedColumn: string;
  defaultValue: string;
  onColumnChange: (column: string) => void;
  onDefaultChange: (value: string) => void;
}

export function ColumnMappingRow({
  field,
  columns,
  selectedColumn,
  defaultValue,
  onColumnChange,
  onDefaultChange,
}: ColumnMappingRowProps) {
  return (
    <div className="grid grid-cols-1 items-end gap-3 border-b border-slate-100 py-3 last:border-0 sm:grid-cols-[minmax(0,180px)_1fr_1fr]">
      <div>
        <Label className="mb-0">
          {field.label}
          {field.required && <span className="text-red-600"> *</span>}
        </Label>
      </div>

      <div>
        <Label className="text-xs text-slate-400">From file column</Label>
        <Select value={selectedColumn} onChange={(event) => onColumnChange(event.target.value)}>
          <option value="">— Not in file —</option>
          {columns.map((column) => (
            <option key={column} value={column}>
              {column}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label className="text-xs text-slate-400">
          {selectedColumn ? "Default if blank" : "Fixed value for all rows"}
        </Label>
        {field.kind === "select" && field.options ? (
          <Select value={defaultValue} onChange={(event) => onDefaultChange(event.target.value)}>
            <option value="">—</option>
            {field.options.map((option) => (
              <option key={option} value={option} className="capitalize">
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </Select>
        ) : (
          <Input
            type={field.kind === "date" ? "date" : field.kind === "number" ? "number" : "text"}
            value={defaultValue}
            onChange={(event) => onDefaultChange(event.target.value)}
          />
        )}
      </div>
    </div>
  );
}
