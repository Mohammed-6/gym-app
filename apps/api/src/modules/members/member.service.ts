import { FilterQuery, SortOrder, Types } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { PaginationParams, buildPaginatedResult } from "../../utils/pagination";
import { formatSequence, getNextSequenceValue, peekNextSequenceValue } from "../sequences/sequence.service";
import { Membership } from "../memberships/membership.model";
import { Payment } from "../payments/payment.model";
import { getEntityPhotoViewUrl, uploadEntityPhoto } from "../photos/photo.service";
import { getMemberIdPrefix } from "../settings/settings.service";
import { Member, MemberDocument } from "./member.model";
import { CreateMemberInput, UpdateMemberInput, createMemberSchema } from "./member.schema";

function memberPhotoKey(memberId: Types.ObjectId): string {
  return `members/${memberId.toString()}.jpg`;
}

const SORTABLE_FIELDS = ["createdAt", "firstName", "memberId"] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

export interface ListMembersOptions {
  branchFilter: { branch?: Types.ObjectId };
  pagination: PaginationParams;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}

export async function listMembers(options: ListMembersOptions) {
  const { branchFilter, pagination, search, status, sortBy, sortOrder } = options;

  const filter: FilterQuery<MemberDocument> = { ...branchFilter };

  if (status === "active" || status === "inactive") {
    filter.status = status;
  }

  if (search?.trim()) {
    const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ memberId: regex }, { firstName: regex }, { lastName: regex }, { phone: regex }];
  }

  const field: SortableField = SORTABLE_FIELDS.includes(sortBy as SortableField)
    ? (sortBy as SortableField)
    : "createdAt";
  const order: SortOrder = sortOrder === "asc" ? 1 : -1;

  const [members, total] = await Promise.all([
    Member.find(filter)
      .populate("branch", "name")
      .sort({ [field]: order })
      .skip(pagination.skip)
      .limit(pagination.limit),
    Member.countDocuments(filter),
  ]);

  const memberIds = members.map((member) => member._id);
  // Latest membership regardless of status — an expired member should still show which plan
  // they were on and when it lapsed, not look like they never had a membership at all.
  const [allMemberships, recentPayments] = await Promise.all([
    Membership.find({ member: { $in: memberIds } })
      .populate("plan", "name")
      .sort({ startDate: -1 }),
    Payment.find({ member: { $in: memberIds } }).sort({ paymentDate: -1 }),
  ]);

  const latestMembershipByMemberId = new Map<string, (typeof allMemberships)[number]>();
  for (const membership of allMemberships) {
    const key = membership.member.toString();
    if (!latestMembershipByMemberId.has(key)) {
      latestMembershipByMemberId.set(key, membership);
    }
  }

  const lastPaymentByMemberId = new Map<string, (typeof recentPayments)[number]>();
  for (const payment of recentPayments) {
    const key = payment.member.toString();
    if (!lastPaymentByMemberId.has(key)) {
      lastPaymentByMemberId.set(key, payment);
    }
  }

  const items = members.map((member) => {
    const membership = latestMembershipByMemberId.get(member._id.toString());
    const lastPayment = lastPaymentByMemberId.get(member._id.toString());
    return {
      ...member.toObject(),
      latestMembership: membership
        ? {
            plan: membership.plan,
            startDate: membership.startDate,
            endDate: membership.endDate,
            status: membership.status,
            finalAmount: membership.finalAmount,
          }
        : null,
      lastPayment: lastPayment
        ? { paidAmount: lastPayment.paidAmount, paymentDate: lastPayment.paymentDate }
        : null,
    };
  });

  return buildPaginatedResult(items, total, pagination);
}

export async function getMemberById(id: string, branchFilter: { branch?: Types.ObjectId }) {
  const member = await Member.findOne({ _id: id, ...branchFilter }).populate("branch", "name");
  if (!member) {
    throw ApiError.notFound("Member not found");
  }
  return member;
}

export async function previewNextMemberId(): Promise<string> {
  const [prefix, sequenceValue] = await Promise.all([
    getMemberIdPrefix(),
    peekNextSequenceValue("member"),
  ]);
  return formatSequence(prefix, sequenceValue, 0, "");
}

export async function uploadMemberPhoto(
  id: string,
  buffer: Buffer,
  branchFilter: { branch?: Types.ObjectId }
) {
  const member = await Member.findOne({ _id: id, ...branchFilter });
  if (!member) {
    throw ApiError.notFound("Member not found");
  }

  await uploadEntityPhoto(memberPhotoKey(member._id), buffer);

  if (!member.hasPhoto) {
    member.hasPhoto = true;
    await member.save();
  }
}

export async function getMemberPhotoUrl(id: string, branchFilter: { branch?: Types.ObjectId }) {
  const member = await Member.findOne({ _id: id, ...branchFilter });
  if (!member) {
    throw ApiError.notFound("Member not found");
  }
  if (!member.hasPhoto) {
    throw ApiError.notFound("This member doesn't have a photo yet");
  }
  return getEntityPhotoViewUrl(memberPhotoKey(member._id));
}

export async function createMember(input: CreateMemberInput, branch: Types.ObjectId) {
  const { email, memberId: requestedMemberId, ...rest } = input;

  const memberId =
    requestedMemberId ||
    formatSequence(await getMemberIdPrefix(), await getNextSequenceValue("member"), 0, "");

  try {
    return await Member.create({
      ...rest,
      email: email || undefined,
      branch,
      memberId,
    });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      throw ApiError.conflict(`Member ID "${memberId}" is already in use`);
    }
    throw error;
  }
}

function cleanImportRow(row: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      cleaned[key] = trimmed === "" ? undefined : trimmed;
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export interface ImportRowResult {
  row: number;
  success: boolean;
  memberId?: string;
  error?: string;
}

export async function bulkImportMembers(
  rows: Record<string, unknown>[],
  branch: Types.ObjectId
): Promise<{ results: ImportRowResult[]; importedCount: number; failedCount: number }> {
  const results: ImportRowResult[] = [];

  for (let i = 0; i < rows.length; i += 1) {
    const rowNumber = i + 1;
    const parsed = createMemberSchema.safeParse(cleanImportRow(rows[i]));

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      results.push({
        row: rowNumber,
        success: false,
        error: firstIssue ? `${firstIssue.path.join(".") || "value"}: ${firstIssue.message}` : "Invalid row",
      });
      continue;
    }

    try {
      const member = await createMember(parsed.data, branch);
      results.push({ row: rowNumber, success: true, memberId: member.memberId });
    } catch (error) {
      results.push({
        row: rowNumber,
        success: false,
        error: error instanceof ApiError ? error.message : "Could not create member",
      });
    }
  }

  const importedCount = results.filter((r) => r.success).length;
  return { results, importedCount, failedCount: results.length - importedCount };
}

export async function updateMember(
  id: string,
  input: UpdateMemberInput,
  branchFilter: { branch?: Types.ObjectId }
) {
  const { branch: _branch, memberId: _memberId, email, ...rest } = input;
  const update = { ...rest, ...(email !== undefined ? { email: email || undefined } : {}) };

  const member = await Member.findOneAndUpdate({ _id: id, ...branchFilter }, update, {
    new: true,
    runValidators: true,
  });
  if (!member) {
    throw ApiError.notFound("Member not found");
  }
  return member;
}

export async function deleteMember(id: string, branchFilter: { branch?: Types.ObjectId }) {
  const member = await Member.findOneAndDelete({ _id: id, ...branchFilter });
  if (!member) {
    throw ApiError.notFound("Member not found");
  }
}
