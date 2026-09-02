import { MemberForm } from "@/features/members/member-form";

export default function NewMemberPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Add Member</h1>
        <p className="mt-1 text-sm text-slate-500">Create a new gym member profile.</p>
      </div>
      <MemberForm />
    </div>
  );
}
