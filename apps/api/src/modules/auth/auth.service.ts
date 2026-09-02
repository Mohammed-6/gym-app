import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { findUserByEmail } from "../users/user.service";
import { LoginInput } from "./auth.schema";

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
