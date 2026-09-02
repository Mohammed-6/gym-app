import { FilterQuery, Types } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { PaginationParams, buildPaginatedResult } from "../../utils/pagination";
import { addDays, calculateMembershipEndDate, startOfDay } from "../../utils/dates";
import { Member } from "../members/member.model";
import { MembershipPlan } from "../membership-plans/membership-plan.model";
import { Membership, MembershipDocument } from "./membership.model";
import { CreateMembershipInput, UpdateMembershipInput } from "./membership.schema";

export async function expireStaleMemberships(filter: FilterQuery<MembershipDocument>) {
  await Membership.updateMany(
    { ...filter, status: "active", endDate: { $lt: startOfDay(new Date()) } },
    { $set: { status: "expired" } }
  );
}

export interface ListMembershipsOptions {
  branchFilter: { branch?: Types.ObjectId };
  pagination: PaginationParams;
  member?: string;
  status?: string;
}

export async function listMemberships(options: ListMembershipsOptions) {
  const { branchFilter, pagination, member, status } = options;
  const filter: FilterQuery<MembershipDocument> = { ...branchFilter };

  if (member) {
    filter.member = new Types.ObjectId(member);
  }

  await expireStaleMemberships(filter);

  if (status === "active" || status === "expired" || status === "cancelled") {
    filter.status = status;
  }

  const [items, total] = await Promise.all([
    Membership.find(filter)
      .populate("plan", "name durationInMonths price")
      .populate("member", "memberId firstName lastName")
      .sort({ startDate: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),
    Membership.countDocuments(filter),
  ]);

  return buildPaginatedResult(items, total, pagination);
}

export async function getMembershipById(id: string, branchFilter: { branch?: Types.ObjectId }) {
  await expireStaleMemberships({ _id: id, ...branchFilter });
  const membership = await Membership.findOne({ _id: id, ...branchFilter })
    .populate("plan", "name durationInMonths price")
    .populate("member", "memberId firstName lastName");
  if (!membership) {
    throw ApiError.notFound("Membership not found");
  }
  return membership;
}

export async function createMembership(
  input: CreateMembershipInput,
  branchFilter: { branch?: Types.ObjectId }
) {
  const member = await Member.findOne({ _id: input.member, ...branchFilter });
  if (!member) {
    throw ApiError.notFound("Member not found");
  }

  const plan = await MembershipPlan.findById(input.plan);
  if (!plan || !plan.isActive) {
    throw ApiError.badRequest("Membership plan not found or inactive");
  }

  await expireStaleMemberships({ member: member._id });

  let startDate = input.startDate ? startOfDay(input.startDate) : undefined;

  if (!startDate) {
    const latestActive = await Membership.findOne({
      member: member._id,
      status: "active",
      endDate: { $gte: startOfDay(new Date()) },
    }).sort({ endDate: -1 });

    startDate = latestActive ? addDays(latestActive.endDate, 1) : startOfDay(new Date());
  }

  const endDate = calculateMembershipEndDate(startDate, plan.durationInMonths);
  const discount = input.discount ?? 0;
  const finalAmount = Math.max(0, plan.price - discount);

  return Membership.create({
    member: member._id,
    plan: plan._id,
    branch: member.branch,
    startDate,
    endDate,
    price: plan.price,
    discount,
    finalAmount,
    status: "active",
  });
}

export async function updateMembershipStatus(
  id: string,
  input: UpdateMembershipInput,
  branchFilter: { branch?: Types.ObjectId }
) {
  const membership = await Membership.findOneAndUpdate({ _id: id, ...branchFilter }, input, {
    new: true,
    runValidators: true,
  });
  if (!membership) {
    throw ApiError.notFound("Membership not found");
  }
  return membership;
}

export async function deleteMembership(id: string, branchFilter: { branch?: Types.ObjectId }) {
  const membership = await Membership.findOneAndDelete({ _id: id, ...branchFilter });
  if (!membership) {
    throw ApiError.notFound("Membership not found");
  }
}
