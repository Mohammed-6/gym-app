export interface MembershipPlan {
  _id: string;
  name: string;
  durationInMonths: number;
  price: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MembershipPlanInput {
  name: string;
  durationInMonths: number;
  price: number;
  description?: string;
  isActive?: boolean;
}
