"use client";

import { useEffect, useState } from "react";
import { Camera, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogCloseButton, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api";
import { PhotoCapture } from "@/components/camera/photo-capture";
import { ViewPhotoButton } from "@/components/camera/view-photo-button";
import { deleteBranch, listBranches } from "@/features/branches/api";
import { BranchFormDialog } from "@/features/branches/branch-form-dialog";
import { Branch } from "@/features/branches/types";

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [photoBranch, setPhotoBranch] = useState<Branch | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function refresh() {
    setRefreshKey((key) => key + 1);
  }

  useEffect(() => {
    let ignore = false;

    listBranches()
      .then((data) => {
        if (!ignore) setBranches(data);
      })
      .catch((error) => {
        if (!ignore) toast.error(getApiErrorMessage(error, "Could not load branches"));
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  function openAddDialog() {
    setEditingBranch(null);
    setDialogOpen(true);
  }

  function openEditDialog(branch: Branch) {
    setEditingBranch(branch);
    setDialogOpen(true);
  }

  async function handleDelete(branch: Branch) {
    if (!window.confirm(`Delete branch "${branch.name}"? This cannot be undone.`)) return;
    try {
      await deleteBranch(branch._id);
      toast.success("Branch deleted successfully");
      refresh();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete branch"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Branches</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your gym locations.</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add Branch
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Photo</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-slate-400">
                Loading...
              </TableCell>
            </TableRow>
          )}
          {!isLoading && branches.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-slate-400">
                No branches yet. Add your first branch to get started.
              </TableCell>
            </TableRow>
          )}
          {branches.map((branch) => (
            <TableRow key={branch._id}>
              <TableCell className="font-medium text-slate-900">{branch.name}</TableCell>
              <TableCell>{branch.address || "-"}</TableCell>
              <TableCell>{branch.phone || "-"}</TableCell>
              <TableCell>
                <Badge variant={branch.isActive ? "success" : "neutral"}>
                  {branch.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <ViewPhotoButton photoUrlEndpoint={`/branches/${branch._id}/photo-url`} hasPhoto={branch.hasPhoto} />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuItem onClick={() => openEditDialog(branch)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPhotoBranch(branch)}>
                    <Camera className="h-4 w-4" />
                    {branch.hasPhoto ? "Retake Photo" : "Take Photo"}
                  </DropdownMenuItem>
                  <DropdownMenuItem danger onClick={() => handleDelete(branch)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <BranchFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        branch={editingBranch}
        onSaved={refresh}
      />

      <Dialog open={Boolean(photoBranch)} onOpenChange={(open) => !open && setPhotoBranch(null)}>
        <DialogContent>
          <DialogCloseButton onClick={() => setPhotoBranch(null)} />
          <DialogHeader>
            <DialogTitle>{photoBranch?.hasPhoto ? "Retake Photo" : "Take Photo"}</DialogTitle>
          </DialogHeader>
          {photoBranch && (
            <PhotoCapture
              uploadUrl={`/branches/${photoBranch._id}/photo`}
              onUploaded={() => {
                setPhotoBranch(null);
                refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
