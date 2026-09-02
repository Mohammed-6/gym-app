"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileSpreadsheet, Upload, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/features/auth/auth-context";
import { listBranches } from "@/features/branches/api";
import { Branch } from "@/features/branches/types";
import { IMPORT_FIELDS } from "@/features/members/import/field-definitions";
import { parseSpreadsheetFile, ParsedSpreadsheet } from "@/features/members/import/parse-file";
import { autoMapColumns } from "@/features/members/import/auto-map";
import { buildMemberRow } from "@/features/members/import/build-row";
import { ColumnMappingRow } from "@/features/members/import/column-mapping-row";
import { importMembers } from "@/features/members/import/api";
import { ImportMembersResult } from "@/features/members/import/types";

type Step = "upload" | "map" | "preview" | "result";

export default function ImportMembersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("upload");
  const [parsed, setParsed] = useState<ParsedSpreadsheet | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [defaults, setDefaults] = useState<Record<string, string>>({});
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportMembersResult | null>(null);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAdmin) return;
    listBranches()
      .then((data) => {
        setBranches(data);
        if (data.length > 0) setBranchId((current) => current || data[0]._id);
      })
      .catch(() => toast.error("Could not load branches"));
  }, [isAdmin]);

  async function handleFileSelected(file: File) {
    try {
      const data = await parseSpreadsheetFile(file);
      setParsed(data);
      setMapping(autoMapColumns(data.columns));
      setDefaults({});
      setStep("map");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read that file");
    }
  }

  const previewRows = useMemo(() => {
    if (!parsed) return [];
    return parsed.rows.slice(0, 20).map((row) => buildMemberRow(row, mapping, defaults, IMPORT_FIELDS));
  }, [parsed, mapping, defaults]);

  const missingRequired = IMPORT_FIELDS.filter(
    (field) => field.required && !mapping[field.key] && !defaults[field.key]
  );

  async function handleImport() {
    if (!parsed) return;
    setIsImporting(true);
    try {
      const rows = parsed.rows.map((row) => buildMemberRow(row, mapping, defaults, IMPORT_FIELDS));
      const importResult = await importMembers(rows, isAdmin ? branchId : undefined);
      setResult(importResult);
      setStep("result");
      if (importResult.failedCount === 0) {
        toast.success(`Imported all ${importResult.importedCount} members`);
      } else {
        toast.warning(`Imported ${importResult.importedCount}, ${importResult.failedCount} need attention`);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Import failed"));
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Import Members</h1>
          <p className="mt-1 text-sm text-slate-500">
            Bring in your existing member register from a CSV or Excel file.
          </p>
        </div>
        <Link href="/members" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Back to Members
        </Link>
      </div>

      {step === "upload" && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <FileSpreadsheet className="h-10 w-10 text-slate-400" />
            <div>
              <p className="font-medium text-slate-900">Upload your member list</p>
              <p className="mt-1 text-sm text-slate-500">
                .csv, .xlsx, or .xls — columns can be in any order, you&apos;ll map them next.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              <Upload className="h-4 w-4" />
              Choose File
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleFileSelected(file);
                  event.target.value = "";
                }}
              />
            </label>
          </CardContent>
        </Card>
      )}

      {step === "map" && parsed && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Map Columns <span className="font-normal text-slate-400">&middot; {parsed.rows.length} rows found</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAdmin && (
                <div className="mb-4 max-w-xs border-b border-slate-100 pb-4">
                  <Label htmlFor="import-branch">Import into Branch *</Label>
                  <Select id="import-branch" value={branchId} onChange={(event) => setBranchId(event.target.value)}>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              {IMPORT_FIELDS.map((field) => (
                <ColumnMappingRow
                  key={field.key}
                  field={field}
                  columns={parsed.columns}
                  selectedColumn={mapping[field.key] ?? ""}
                  defaultValue={defaults[field.key] ?? ""}
                  onColumnChange={(column) => setMapping((prev) => ({ ...prev, [field.key]: column }))}
                  onDefaultChange={(value) => setDefaults((prev) => ({ ...prev, [field.key]: value }))}
                />
              ))}
            </CardContent>
          </Card>

          {missingRequired.length > 0 && (
            <p className="text-sm text-amber-700">
              Map or set a default for: {missingRequired.map((f) => f.label).join(", ")} before continuing.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setStep("upload")}>
              Choose a Different File
            </Button>
            <Button disabled={missingRequired.length > 0} onClick={() => setStep("preview")}>
              Preview Import
            </Button>
          </div>
        </div>
      )}

      {step === "preview" && parsed && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Preview <span className="font-normal text-slate-400">&middot; showing first {previewRows.length} of {parsed.rows.length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {IMPORT_FIELDS.filter((f) => mapping[f.key] || defaults[f.key]).map((field) => (
                      <TableHead key={field.key}>{field.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((row, index) => (
                    <TableRow key={index}>
                      {IMPORT_FIELDS.filter((f) => mapping[f.key] || defaults[f.key]).map((field) => (
                        <TableCell key={field.key}>{row[field.key] || "-"}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setStep("map")}>
              Back to Mapping
            </Button>
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? "Importing..." : `Import ${parsed.rows.length} Members`}
            </Button>
          </div>
        </div>
      )}

      {step === "result" && result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <div>
                  <p className="text-xl font-semibold text-slate-900">{result.importedCount}</p>
                  <p className="text-sm text-slate-500">Imported successfully</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <XCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-xl font-semibold text-slate-900">{result.failedCount}</p>
                  <p className="text-sm text-slate-500">Need attention</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {result.failedCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Rows that need attention</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.results
                      .filter((r) => !r.success)
                      .map((r) => (
                        <TableRow key={r.row}>
                          <TableCell>{r.row}</TableCell>
                          <TableCell className="text-red-600">{r.error}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setStep("upload");
                setParsed(null);
                setResult(null);
              }}
            >
              Import Another File
            </Button>
            <Button onClick={() => router.push("/members")}>Done — View Members</Button>
          </div>
        </div>
      )}

      {step !== "upload" && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Badge variant={step === "map" ? "default" : "neutral"}>1. Map</Badge>
          <Badge variant={step === "preview" ? "default" : "neutral"}>2. Preview</Badge>
          <Badge variant={step === "result" ? "default" : "neutral"}>3. Result</Badge>
        </div>
      )}
    </div>
  );
}
