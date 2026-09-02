"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/features/auth/auth-context";
import { getSettings, updateSettings } from "@/features/settings/api";

function previewMemberId(prefix: string, nextNumber: string) {
  const number = nextNumber.trim() || "1";
  return `${prefix.trim()}${number}`;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [isLoading, setIsLoading] = useState(true);
  const [memberIdPrefix, setMemberIdPrefix] = useState("");
  const [nextMemberNumber, setNextMemberNumber] = useState("");
  const [saved, setSaved] = useState({ memberIdPrefix: "", nextMemberNumber: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    getSettings()
      .then((data) => {
        if (ignore) return;
        setMemberIdPrefix(data.memberIdPrefix);
        setNextMemberNumber(String(data.nextMemberNumber));
        setSaved({ memberIdPrefix: data.memberIdPrefix, nextMemberNumber: String(data.nextMemberNumber) });
      })
      .catch((error) => toast.error(getApiErrorMessage(error, "Could not load settings")))
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const isDirty = memberIdPrefix !== saved.memberIdPrefix || nextMemberNumber !== saved.nextMemberNumber;

  async function handleSave() {
    const parsedNumber = Number(nextMemberNumber);
    if (!Number.isInteger(parsedNumber) || parsedNumber < 1) {
      toast.error("Next member number must be a whole number of at least 1");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateSettings({ memberIdPrefix, nextMemberNumber: parsedNumber });
      setMemberIdPrefix(result.memberIdPrefix);
      setNextMemberNumber(String(result.nextMemberNumber));
      setSaved({ memberIdPrefix: result.memberIdPrefix, nextMemberNumber: String(result.nextMemberNumber) });
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update settings"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Gym-wide configuration.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member ID Format</CardTitle>
        </CardHeader>
        <CardContent className="max-w-sm space-y-4">
          {isLoading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : (
            <>
              <div>
                <Label htmlFor="memberIdPrefix">Prefix</Label>
                <Input
                  id="memberIdPrefix"
                  value={memberIdPrefix}
                  onChange={(event) => setMemberIdPrefix(event.target.value)}
                  placeholder="e.g. MEM"
                  disabled={!isAdmin}
                  className="font-mono"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Letters and numbers only, no separator — leave blank for plain numeric IDs.
                </p>
              </div>

              <div>
                <Label htmlFor="nextMemberNumber">Next Member Number</Label>
                <Input
                  id="nextMemberNumber"
                  type="number"
                  min={1}
                  step={1}
                  value={nextMemberNumber}
                  onChange={(event) => setNextMemberNumber(event.target.value)}
                  disabled={!isAdmin}
                  className="font-mono"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Defaults to the next number in sequence — change it to skip ahead (e.g. to 201).
                </p>
              </div>

              <p className="text-sm text-slate-500">
                Next member ID will look like:{" "}
                <span className="font-mono text-slate-900">{previewMemberId(memberIdPrefix, nextMemberNumber)}</span>
              </p>

              {isAdmin ? (
                <Button onClick={handleSave} disabled={isSaving || !isDirty}>
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              ) : (
                <p className="text-xs text-slate-400">Only admins can change this.</p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
