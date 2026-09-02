import { api } from "@/lib/api";
import { Attendance } from "./types";

export async function getTodayAttendance(memberId: string) {
  const { data } = await api.get<{ data: Attendance | null }>(`/attendance/today/${memberId}`);
  return data.data;
}

export async function checkIn(memberId: string) {
  const { data } = await api.post<{ data: { attendance: Attendance; isNew: boolean } }>("/attendance", {
    member: memberId,
  });
  return data.data;
}
