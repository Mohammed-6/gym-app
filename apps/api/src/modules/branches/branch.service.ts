import { ApiError } from "../../utils/ApiError";
import { getEntityPhotoViewUrl, uploadEntityPhoto } from "../photos/photo.service";
import { Branch } from "./branch.model";
import { CreateBranchInput, UpdateBranchInput } from "./branch.schema";

function branchPhotoKey(id: string): string {
  return `branches/${id}.jpg`;
}

export async function listBranches() {
  return Branch.find().sort({ name: 1 });
}

export async function getBranchById(id: string) {
  const branch = await Branch.findById(id);
  if (!branch) {
    throw ApiError.notFound("Branch not found");
  }
  return branch;
}

export async function createBranch(input: CreateBranchInput) {
  return Branch.create(input);
}

export async function updateBranch(id: string, input: UpdateBranchInput) {
  const branch = await Branch.findByIdAndUpdate(id, input, { new: true, runValidators: true });
  if (!branch) {
    throw ApiError.notFound("Branch not found");
  }
  return branch;
}

export async function deleteBranch(id: string) {
  const branch = await Branch.findByIdAndDelete(id);
  if (!branch) {
    throw ApiError.notFound("Branch not found");
  }
}

export async function uploadBranchPhoto(id: string, buffer: Buffer) {
  const branch = await Branch.findById(id);
  if (!branch) {
    throw ApiError.notFound("Branch not found");
  }

  await uploadEntityPhoto(branchPhotoKey(id), buffer);

  if (!branch.hasPhoto) {
    branch.hasPhoto = true;
    await branch.save();
  }
}

export async function getBranchPhotoUrl(id: string) {
  const branch = await Branch.findById(id);
  if (!branch) {
    throw ApiError.notFound("Branch not found");
  }
  if (!branch.hasPhoto) {
    throw ApiError.notFound("This branch doesn't have a photo yet");
  }
  return getEntityPhotoViewUrl(branchPhotoKey(id));
}
