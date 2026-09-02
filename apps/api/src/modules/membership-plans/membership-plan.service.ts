import { ApiError } from "../../utils/ApiError";
import { MembershipPlan } from "./membership-plan.model";
import { CreateMembershipPlanInput, UpdateMembershipPlanInput } from "./membership-plan.schema";

export async function listMembershipPlans() {
  return MembershipPlan.find().sort({ durationInMonths: 1 });
}

export async function getMembershipPlanById(id: string) {
  const plan = await MembershipPlan.findById(id);
  if (!plan) {
    throw ApiError.notFound("Membership plan not found");
  }
  return plan;
}

export async function createMembershipPlan(input: CreateMembershipPlanInput) {
  return MembershipPlan.create(input);
}

export async function updateMembershipPlan(id: string, input: UpdateMembershipPlanInput) {
  const plan = await MembershipPlan.findByIdAndUpdate(id, input, { new: true, runValidators: true });
  if (!plan) {
    throw ApiError.notFound("Membership plan not found");
  }
  return plan;
}

export async function deleteMembershipPlan(id: string) {
  const plan = await MembershipPlan.findByIdAndDelete(id);
  if (!plan) {
    throw ApiError.notFound("Membership plan not found");
  }
}
