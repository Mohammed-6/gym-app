"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api";
import { PhotoCapture } from "@/components/camera/photo-capture";
import { ViewPhotoButton } from "@/components/camera/view-photo-button";
import { deleteMember } from "@/features/members/api";
import { useMember } from "@/features/members/use-member";
import { MembershipFormDialog } from "@/features/memberships/membership-form-dialog";
import { useMemberships } from "@/features/memberships/use-memberships";
import { Membership } from "@/features/memberships/types";
import { CollectPaymentDialog } from "@/features/payments/collect-payment-dialog";
import { useMemberPayments } from "@/features/payments/use-member-payments";

const paymentMethodLabels: Record<string, string> = {
  cash: "Cash",
  upi: "UPI",
  card: "Card",
  bank_transfer: "Bank Transfer",
  other: "Other",
};

function membershipStatusVariant(status: Membership["status"]) {
  if (status === "active") return "success" as const;
  if (status === "cancelled") return "danger" as const;
  return "neutral" as const;
}

function planName(plan: Membership["plan"]) {
  return typeof plan === "string" ? plan : plan.name;
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm text-slate-800">{value || value === 0 ? value : "-"}</p>
    </div>
  );
}

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { member, isLoading, refresh: refreshMember } = useMember(id);
  const { memberships, refresh: refreshMemberships } = useMemberships(id);
  const { payments, refresh: refreshPayments } = useMemberPayments(id);
  const [membershipDialogOpen, setMembershipDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);

  const currentMembership = memberships.find((membership) => membership.status === "active");
  const hasAnyMembership = memberships.length > 0;

  async function handleDelete() {
    if (!member) return;
    if (!window.confirm(`Delete member "${member.firstName} ${member.lastName ?? ""}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteMember(member._id);
      toast.success("Member deleted successfully");
      router.push("/members");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete member"));
    }
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading...</p>;
  }

  if (!member) {
    return <p className="text-sm text-slate-500">Member not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-slate-900">
              {member.firstName} {member.lastName}
            </h1>
            <Badge variant={member.status === "active" ? "success" : "neutral"}>
              {member.status === "active" ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">{member.memberId}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/members/${member._id}/edit`} className={buttonVariants({ variant: "outline" })}>
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <Button onClick={() => setMembershipDialogOpen(true)}>
            {currentMembership ? "Renew Membership" : "Add Membership"}
          </Button>
          <Button variant="secondary" onClick={() => setPaymentDialogOpen(true)}>
            Collect Payment
          </Button>
          <Button variant="outline" onClick={() => setPhotoDialogOpen(true)}>
            <Camera className="h-4 w-4" />
            {member.hasPhoto ? "Retake Photo" : "Take Photo"}
          </Button>
          <ViewPhotoButton photoUrlEndpoint={`/members/${member._id}/photo-url`} hasPhoto={member.hasPhoto} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field label="Father's Name" value={member.fatherName} />
            <Field label="Phone" value={member.phone} />
            <Field label="Alternate Phone" value={member.alternatePhone} />
            <Field label="Email" value={member.email} />
            <Field label="Gender" value={member.gender} />
            <Field
              label="Date of Birth"
              value={member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : undefined}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field label="Address" value={member.address} />
            <Field label="City" value={member.city} />
            <Field label="State" value={member.state} />
            <Field label="Pincode" value={member.pincode} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gym Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field label="Batch" value={member.batch} />
            <Field label="Weight" value={member.weight ? `${member.weight} kg` : undefined} />
            <Field label="Chest" value={member.chest ? `${member.chest} in` : undefined} />
            <Field label="Arm" value={member.arm ? `${member.arm} in` : undefined} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">{member.notes || "No notes yet."}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Membership</CardTitle>
        </CardHeader>
        <CardContent>
          {currentMembership ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="Plan" value={planName(currentMembership.plan)} />
              <Field label="Start Date" value={new Date(currentMembership.startDate).toLocaleDateString()} />
              <Field label="End Date" value={new Date(currentMembership.endDate).toLocaleDateString()} />
              <Field label="Final Amount" value={`₹${currentMembership.finalAmount.toLocaleString("en-IN")}`} />
            </div>
          ) : (
            <p className="text-sm text-slate-500">No active membership.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Membership History</CardTitle>
        </CardHeader>
        <CardContent>
          {memberships.length === 0 ? (
            <p className="text-sm text-slate-500">No membership history yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Final Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships.map((membership) => (
                  <TableRow key={membership._id}>
                    <TableCell>{planName(membership.plan)}</TableCell>
                    <TableCell>{new Date(membership.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(membership.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>₹{membership.finalAmount.toLocaleString("en-IN")}</TableCell>
                    <TableCell>
                      <Badge variant={membershipStatusVariant(membership.status)} className="capitalize">
                        {membership.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-slate-500">No payments recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="w-16 text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                    <TableCell>₹{payment.totalAmount.toLocaleString("en-IN")}</TableCell>
                    <TableCell>₹{payment.paidAmount.toLocaleString("en-IN")}</TableCell>
                    <TableCell>
                      {payment.dueAmount > 0 ? (
                        <span className="text-red-600">₹{payment.dueAmount.toLocaleString("en-IN")}</span>
                      ) : (
                        <span className="text-emerald-600">₹0</span>
                      )}
                    </TableCell>
                    <TableCell>{paymentMethodLabels[payment.paymentMethod] ?? payment.paymentMethod}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/receipts/by-payment/${payment._id}`}
                        className="font-mono text-xs text-slate-500 hover:text-slate-900"
                      >
                        {payment.receiptNumber}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <MembershipFormDialog
        open={membershipDialogOpen}
        onOpenChange={setMembershipDialogOpen}
        memberId={id}
        mode={hasAnyMembership ? "renew" : "add"}
        onSaved={refreshMemberships}
      />

      <CollectPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        memberId={id}
        membershipId={currentMembership?._id}
        defaultMembershipAmount={currentMembership?.finalAmount}
        onSaved={refreshPayments}
      />

      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent>
          <DialogCloseButton onClick={() => setPhotoDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>{member.hasPhoto ? "Retake Photo" : "Take Photo"}</DialogTitle>
          </DialogHeader>
          <PhotoCapture
            uploadUrl={`/members/${member._id}/photo`}
            onUploaded={() => {
              refreshMember();
              setPhotoDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
