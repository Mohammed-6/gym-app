import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { findUserByEmail } from "../users/user.service";
import { User } from "../users/user.model";
import { BootstrapAdminInput, ChangePasswordInput, LoginInput } from "./auth.schema";

export async function login(input: LoginInput) {
  const user = await findUserByEmail(input.email);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = jwt.sign(
    { id: user._id.toString(), role: user.role, branchId: user.branch ? user.branch.toString() : null },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn } as jwt.SignOptions
  );

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
    },
  };
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  const passwordMatches = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!passwordMatches) {
    throw ApiError.unauthorized("Current password is incorrect");
  }

  user.passwordHash = await bcrypt.hash(input.newPassword, 10);
  await user.save();
}

// Public, unauthenticated by design — only ever succeeds once (before any admin
// exists), so it self-closes as soon as the first admin is created.
export async function bootstrapAdmin(input: BootstrapAdminInput) {
  const existingAdmin = await User.findOne({ role: "admin" });
  if (existingAdmin) {
    throw ApiError.conflict("An admin already exists");
  }

  const existingEmail = await findUserByEmail(input.email);
  if (existingEmail) {
    throw ApiError.conflict("A user with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: "admin",
    branch: null,
    isActive: true,
  });

  const token = jwt.sign(
    { id: user._id.toString(), role: user.role, branchId: null },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn } as jwt.SignOptions
  );

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
    },
  };
}
