import { describe, expect, it } from "vitest";
import { addDays, calculateMembershipEndDate, startOfDay } from "../utils/dates";

describe("calculateMembershipEndDate", () => {
  it("matches the spec example: 29 Aug + 1 month -> 28 Sep", () => {
    const end = calculateMembershipEndDate(new Date(2026, 7, 29), 1);
    expect(end.getFullYear()).toBe(2026);
    expect(end.getMonth()).toBe(8);
    expect(end.getDate()).toBe(28);
  });

  it("matches the renewal example: 01 Aug -> 31 Aug for a monthly plan", () => {
    const end = calculateMembershipEndDate(new Date(2026, 7, 1), 1);
    expect(end.getMonth()).toBe(7);
    expect(end.getDate()).toBe(31);
  });

  it("handles multi-month durations: 01 Jan + 3 months -> 31 Mar", () => {
    const end = calculateMembershipEndDate(new Date(2026, 0, 1), 3);
    expect(end.getMonth()).toBe(2);
    expect(end.getDate()).toBe(31);
  });
});

describe("addDays", () => {
  it("adds the given number of days", () => {
    const result = addDays(new Date(2026, 7, 31), 1);
    expect(result.getMonth()).toBe(8);
    expect(result.getDate()).toBe(1);
  });
});

describe("startOfDay", () => {
  it("zeroes out the time portion", () => {
    const result = startOfDay(new Date(2026, 7, 29, 15, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });
});
