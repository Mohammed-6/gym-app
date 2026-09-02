import { describe, expect, it } from "vitest";
import { ApiError } from "../utils/ApiError";

describe("ApiError", () => {
  it("builds a not found error with status 404", () => {
    const error = ApiError.notFound("Branch not found");
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Branch not found");
  });

  it("carries field errors for bad requests", () => {
    const error = ApiError.badRequest("Validation failed", { name: ["Required"] });
    expect(error.statusCode).toBe(400);
    expect(error.errors).toEqual({ name: ["Required"] });
  });
});
