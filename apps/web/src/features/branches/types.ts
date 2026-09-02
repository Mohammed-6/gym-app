export interface Branch {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  hasPhoto: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BranchInput {
  name: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
}
