"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/features/auth/auth-context";
import { deleteUser, listUsers } from "@/features/users/api";
import { UserFormDialog } from "@/features/users/user-form-dialog";
import { StaffUser } from "@/features/users/types";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function refresh() {
    setRefreshKey((key) => key + 1);
  }

  useEffect(() => {
    let ignore = false;

    listUsers()
      .then((data) => {
        if (!ignore) setUsers(data);
      })
      .catch((error) => {
        if (!ignore) toast.error(getApiErrorMessage(error, "Could not load users"));
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  function openAddDialog() {
    setEditingUser(null);
    setDialogOpen(true);
  }

  function openEditDialog(user: StaffUser) {
    setEditingUser(user);
    setDialogOpen(true);
  }

  async function handleDelete(user: StaffUser) {
    if (user._id === currentUser?.id) {
      toast.error("You cannot delete your own account");
      return;
    }
    if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    try {
      await deleteUser(user._id);
      toast.success("User deleted successfully");
      refresh();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete user"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
          <p className="mt-1 text-sm text-slate-500">Manage staff accounts and access.</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Status</TableHead>
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
          {!isLoading && users.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-slate-400">
                No users yet. Add your first staff account.
              </TableCell>
            </TableRow>
          )}
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell className="font-medium text-slate-900">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell className="capitalize">{user.role}</TableCell>
              <TableCell>{user.branch?.name ?? "All branches"}</TableCell>
              <TableCell>
                <Badge variant={user.isActive ? "success" : "neutral"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuItem onClick={() => openEditDialog(user)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem danger onClick={() => handleDelete(user)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <UserFormDialog open={dialogOpen} onOpenChange={setDialogOpen} user={editingUser} onSaved={refresh} />
    </div>
  );
}
