"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { GENDERS, MEMBER_STATUSES } from "@gym-app/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Camera } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { PhotoCapture } from "@/components/camera/photo-capture";
import { PhotoCaptureStage } from "@/components/camera/photo-capture-stage";
import { ViewPhotoButton } from "@/components/camera/view-photo-button";
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createMember, getNextMemberId, updateMember } from "./api";
import { Member } from "./types";

const memberFormSchema = z.object({
  memberId: z.string().trim().optional(),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().optional(),
  fatherName: z.string().trim().optional(),
  phone: z.string().trim().min(6, "Enter a valid phone number"),
  alternatePhone: z.string().trim().optional(),
  email: z.union([z.string().length(0), z.string().email("Enter a valid email address")]),
  gender: z.union([z.enum(GENDERS), z.literal("")]),
  dateOfBirth: z.string().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
  batch: z.string().trim().optional(),
  weight: z.union([z.string().length(0), z.coerce.number().min(0)]),
  chest: z.union([z.string().length(0), z.coerce.number().min(0)]),
  arm: z.union([z.string().length(0), z.coerce.number().min(0)]),
  notes: z.string().trim().optional(),
  status: z.enum(MEMBER_STATUSES),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

function toFormValues(member?: Member | null): Partial<MemberFormValues> {
  if (!member) return { status: "active", city: "Hyderabad", state: "Telangana" };
  return {
    firstName: member.firstName,
    lastName: member.lastName ?? "",
    fatherName: member.fatherName ?? "",
    phone: member.phone,
    alternatePhone: member.alternatePhone ?? "",
    email: member.email ?? "",
    gender: member.gender ?? "",
    dateOfBirth: member.dateOfBirth ? member.dateOfBirth.slice(0, 10) : "",
    address: member.address ?? "",
    city: member.city ?? "",
    state: member.state ?? "",
    pincode: member.pincode ?? "",
    batch: member.batch ?? "",
    weight: member.weight?.toString() ?? "",
    chest: member.chest?.toString() ?? "",
    arm: member.arm?.toString() ?? "",
    notes: member.notes ?? "",
    status: member.status,
  };
}

interface MemberFormProps {
  member?: Member | null;
}

export function MemberForm({ member }: MemberFormProps) {
  const router = useRouter();
  const isEditing = Boolean(member);
  const [createdMemberId, setCreatedMemberId] = useState<string | null>(null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(member?.hasPhoto ?? false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: toFormValues(member),
  });

  useEffect(() => {
    if (isEditing) return;
    getNextMemberId()
      .then((nextMemberId) => setValue("memberId", nextMemberId))
      .catch(() => {
        // Non-critical preview — the server still assigns a real id at creation time if left blank.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only preview once, on mount
  }, []);

  async function onSubmit(values: MemberFormValues) {
    const payload = {
      ...values,
      // Only send a custom id if the receptionist actually edited the previewed value —
      // otherwise let the server assign the real one atomically to avoid a stale-preview collision.
      memberId: dirtyFields.memberId ? values.memberId : undefined,
      gender: values.gender || undefined,
      weight: values.weight === "" ? undefined : Number(values.weight),
      chest: values.chest === "" ? undefined : Number(values.chest),
      arm: values.arm === "" ? undefined : Number(values.arm),
    };

    try {
      if (isEditing && member) {
        await updateMember(member._id, payload);
        toast.success("Member updated successfully");
        router.push(`/members/${member._id}`);
        router.refresh();
      } else {
        const created = await createMember(payload);
        toast.success("Member created successfully");
        // Last stage of the create flow: offer a photo before landing on the profile.
        setCreatedMemberId(created._id);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save member"));
    }
  }

  if (createdMemberId) {
    return (
      <PhotoCaptureStage
        uploadUrl={`/members/${createdMemberId}/photo`}
        onDone={() => {
          router.push(`/members/${createdMemberId}`);
          router.refresh();
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {!isEditing && (
            <div>
              <Label htmlFor="memberId">Member ID</Label>
              <Input id="memberId" className="font-mono" {...register("memberId")} />
              <p className="mt-1 text-xs text-slate-400">Auto-suggested — edit only if you need a specific ID.</p>
            </div>
          )}
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input id="firstName" {...register("firstName")} />
            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" {...register("lastName")} />
          </div>
          <div>
            <Label htmlFor="fatherName">Father&apos;s Name</Label>
            <Input id="fatherName" {...register("fatherName")} />
          </div>
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input id="phone" {...register("phone")} />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
          </div>
          <div>
            <Label htmlFor="alternatePhone">Alternate Phone</Label>
            <Input id="alternatePhone" {...register("alternatePhone")} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select id="gender" {...register("gender")}>
              <option value="">Select gender</option>
              {GENDERS.map((gender) => (
                <option key={gender} value={gender} className="capitalize">
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Photo</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing && member ? (
            <div className="flex items-center gap-2">
              <ViewPhotoButton photoUrlEndpoint={`/members/${member._id}/photo-url`} hasPhoto={hasPhoto} />
              <Button type="button" variant="outline" size="sm" onClick={() => setPhotoDialogOpen(true)}>
                <Camera className="h-4 w-4" />
                {hasPhoto ? "Retake Photo" : "Take Photo"}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              You&apos;ll be prompted to take their photo right after you save this member.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register("city")} />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register("state")} />
          </div>
          <div>
            <Label htmlFor="pincode">Pincode</Label>
            <Input id="pincode" {...register("pincode")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gym Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="batch">Batch</Label>
            <Input id="batch" placeholder="e.g. Morning 6-8 AM" {...register("batch")} />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...register("status")}>
              {MEMBER_STATUSES.map((status) => (
                <option key={status} value={status} className="capitalize">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input id="weight" type="number" step="0.1" {...register("weight")} />
          </div>
          <div>
            <Label htmlFor="chest">Chest (in)</Label>
            <Input id="chest" type="number" step="0.1" {...register("chest")} />
          </div>
          <div>
            <Label htmlFor="arm">Arm (in)</Label>
            <Input id="arm" type="number" step="0.1" {...register("arm")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea id="notes" rows={3} {...register("notes")} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Member"}
        </Button>
      </div>

      {isEditing && member && (
        <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
          <DialogContent>
            <DialogCloseButton onClick={() => setPhotoDialogOpen(false)} />
            <DialogHeader>
              <DialogTitle>{hasPhoto ? "Retake Photo" : "Take Photo"}</DialogTitle>
            </DialogHeader>
            <PhotoCapture
              uploadUrl={`/members/${member._id}/photo`}
              onUploaded={() => {
                setHasPhoto(true);
                setPhotoDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </form>
  );
}
