"use client";

import { use } from "react";
import { MemberForm } from "@/features/members/member-form";
import { useMember } from "@/features/members/use-member";

export default function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { member, isLoading } = useMember(id);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading...</p>;
  }

  if (!member) {
    return <p className="text-sm text-slate-500">Member not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Edit Member</h1>
        <p className="mt-1 text-sm text-slate-500">
          {member.memberId} &middot; {member.firstName} {member.lastName}
        </p>
      </div>
      <MemberForm member={member} />
    </div>
  );
}
