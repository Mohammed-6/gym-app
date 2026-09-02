import { Types } from "mongoose";
import { Member } from "../members/member.model";
import { Membership } from "../memberships/membership.model";
import { expireStaleMemberships } from "../memberships/membership.service";
import { Payment } from "../payments/payment.model";
import { addDays, startOfDay } from "../../utils/dates";

export interface DashboardOptions {
  branchFilter: { branch?: Types.ObjectId };
}

export async function getDashboardSummary({ branchFilter }: DashboardOptions) {
  await expireStaleMemberships(branchFilter);

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const sevenDaysFromNow = addDays(today, 7);

  const [
    totalMembers,
    activeMemberIds,
    expiredMemberIds,
    membershipsExpiringSoon,
    todaysPaymentsAgg,
    totalRevenueAgg,
    recentMembers,
    recentPayments,
    recentlyExpiredMemberships,
  ] = await Promise.all([
    Member.countDocuments(branchFilter),
    Membership.distinct("member", { ...branchFilter, status: "active" }),
    Membership.distinct("member", { ...branchFilter, status: "expired" }),
    Membership.countDocuments({
      ...branchFilter,
      status: "active",
      endDate: { $gte: today, $lte: sevenDaysFromNow },
    }),
    Payment.aggregate([
      { $match: { ...branchFilter, paymentDate: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]),
    Payment.aggregate([{ $match: branchFilter }, { $group: { _id: null, total: { $sum: "$paidAmount" } } }]),
    Member.find(branchFilter).sort({ createdAt: -1 }).limit(5),
    Payment.find(branchFilter)
      .populate("member", "memberId firstName lastName")
      .sort({ paymentDate: -1 })
      .limit(5),
    Membership.find({ ...branchFilter, status: "expired" })
      .populate("member", "memberId firstName lastName")
      .populate("plan", "name")
      .sort({ endDate: -1 })
      .limit(5),
  ]);

  const activeIdSet = new Set(activeMemberIds.map((id) => id.toString()));
  const expiredMembers = expiredMemberIds.filter((id) => !activeIdSet.has(id.toString())).length;

  return {
    totalMembers,
    activeMembers: activeMemberIds.length,
    expiredMembers,
    membershipsExpiringSoon,
    todaysPayments: todaysPaymentsAgg[0]?.total ?? 0,
    totalRevenue: totalRevenueAgg[0]?.total ?? 0,
    recentMembers,
    recentPayments,
    recentlyExpiredMemberships,
  };
}
