import { Types } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { addDays, startOfDay } from "../../utils/dates";
import { Member } from "../members/member.model";
import { Attendance } from "./attendance.model";

function todayRange() {
  const start = startOfDay(new Date());
  return { start, end: addDays(start, 1) };
}

export async function getTodayAttendance(memberId: string, branchFilter: { branch?: Types.ObjectId }) {
  const { start, end } = todayRange();
  return Attendance.findOne({
    member: memberId,
    ...branchFilter,
    checkInAt: { $gte: start, $lt: end },
  });
}

export async function checkIn(memberId: string, branchFilter: { branch?: Types.ObjectId }) {
  const member = await Member.findOne({ _id: memberId, ...branchFilter });
  if (!member) {
    throw ApiError.notFound("Member not found");
  }

  const existing = await getTodayAttendance(memberId, branchFilter);
  if (existing) {
    return { attendance: existing, isNew: false };
  }

  const attendance = await Attendance.create({ member: member._id, branch: member.branch });
  return { attendance, isNew: true };
}
