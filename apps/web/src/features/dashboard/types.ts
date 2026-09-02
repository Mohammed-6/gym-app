export interface DashboardMember {
  _id: string;
  memberId: string;
  firstName: string;
  lastName?: string;
  status: string;
  createdAt: string;
}

export interface DashboardPayment {
  _id: string;
  member: { _id: string; memberId: string; firstName: string; lastName?: string } | string;
  paidAmount: number;
  paymentDate: string;
  paymentMethod: string;
}

export interface DashboardMembership {
  _id: string;
  member: { _id: string; memberId: string; firstName: string; lastName?: string } | string;
  plan: { _id: string; name: string } | string;
  endDate: string;
}

export interface DashboardSummary {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  membershipsExpiringSoon: number;
  todaysPayments: number;
  totalRevenue: number;
  recentMembers: DashboardMember[];
  recentPayments: DashboardPayment[];
  recentlyExpiredMemberships: DashboardMembership[];
}
