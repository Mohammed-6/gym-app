import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";

describe("GET /health", () => {
  it("returns ok status", async () => {
    const app = createApp();
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, message: "OK" });
  });
});

describe("unknown route", () => {
  it("returns a consistent 404 error shape", async () => {
    const app = createApp();
    const response = await request(app).get("/api/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
