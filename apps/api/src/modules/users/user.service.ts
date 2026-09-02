import bcrypt from "bcryptjs";
import { ApiError } from "../../utils/ApiError";
import { User } from "./user.model";
import { CreateUserInput, UpdateUserInput } from "./user.schema";

const SALT_ROUNDS = 10;

export async function listUsers() {
  return User.find().populate("branch", "name").sort({ createdAt: -1 });
}

export async function getUserById(id: string) {
  const user = await User.findById(id).populate("branch", "name");
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  return user;
}

export async function findUserByEmail(email: string) {
  return User.findOne({ email: email.toLowerCase() });
}

export async function createUser(input: CreateUserInput) {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw ApiError.conflict("A user with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  return User.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: input.role,
    branch: input.branch ?? null,
    isActive: input.isActive ?? true,
  });
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const { password, ...rest } = input;
  const update: Record<string, unknown> = { ...rest };

  if (password) {
    update.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  }

  const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  return user;
}

export async function deleteUser(id: string) {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw ApiError.notFound("User not found");
  }
}
