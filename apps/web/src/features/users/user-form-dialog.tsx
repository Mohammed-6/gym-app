"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { USER_ROLES } from "@gym-app/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/api";
import { listBranches } from "@/features/branches/api";
import { Branch } from "@/features/branches/types";
import { createUser, updateUser } from "./api";
import { StaffUser } from "./types";

const baseUserFields = {
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  role: z.enum(USER_ROLES),
  branch: z.string(),
};

const createUserFormSchema = z.object({
  ...baseUserFields,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const editUserFormSchema = z.object({
  ...baseUserFields,
  password: z.union([z.string().length(0), z.string().min(6, "Password must be at least 6 characters")]),
});

type UserFormValues = z.infer<typeof editUserFormSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: StaffUser | null;
  onSaved: () => void;
}

export function UserFormDialog({ open, onOpenChange, user, onSaved }: UserFormDialogProps) {
  const isEditing = Boolean(user);
  const [branches, setBranches] = useState<Branch[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(isEditing ? editUserFormSchema : createUserFormSchema),
  });

  useEffect(() => {
    if (!open) return;
    listBranches()
      .then(setBranches)
      .catch(() => toast.error("Could not load branches"));
    reset({
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      role: user?.role ?? "receptionist",
      branch: user?.branch?._id ?? "",
    });
  }, [open, user, reset]);

  async function onSubmit(values: UserFormValues) {
    const payload = {
      name: values.name,
      email: values.email,
      role: values.role,
      branch: values.branch || null,
      ...(values.password ? { password: values.password } : {}),
    };

    try {
      if (isEditing && user) {
        await updateUser(user._id, payload);
        toast.success("User updated successfully");
      } else {
        await createUser({ ...payload, password: values.password });
        toast.success("User created successfully");
      }
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save user"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogCloseButton onClick={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Add User"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="password">{isEditing ? "New Password (optional)" : "Password *"}</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role *</Label>
              <Select id="role" {...register("role")}>
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role === "admin" ? "Admin" : "Receptionist"}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="branch">Branch</Label>
              <Select id="branch" {...register("branch")}>
                <option value="">All branches</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
