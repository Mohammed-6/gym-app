export const MEMBER_STATUSES = ["active", "inactive"] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export const GENDERS = ["male", "female", "other"] as const;
export type Gender = (typeof GENDERS)[number];

export const MEMBERSHIP_STATUSES = ["active", "expired", "cancelled"] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export const PAYMENT_METHODS = ["cash", "upi", "card", "bank_transfer", "other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_PURPOSES = ["membership", "due_settlement", "advance", "other"] as const;
export type PaymentPurpose = (typeof PAYMENT_PURPOSES)[number];

export const ISSUE_STATUSES = ["pending", "ai_resolve", "git_push", "approve", "rejected"] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];
