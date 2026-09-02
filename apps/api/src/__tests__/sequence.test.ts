import { describe, expect, it } from "vitest";
import { formatSequence } from "../modules/sequences/sequence.service";

describe("formatSequence", () => {
  it("pads receipt numbers to 6 digits with the default hyphen separator", () => {
    expect(formatSequence("RCP", 1)).toBe("RCP-000001");
    expect(formatSequence("RCP", 42)).toBe("RCP-000042");
  });

  it("does not truncate values wider than the padding", () => {
    expect(formatSequence("RCP", 1234567)).toBe("RCP-1234567");
  });

  it("omits the separator entirely when the prefix is empty, regardless of the separator arg", () => {
    expect(formatSequence("", 1)).toBe("000001");
    expect(formatSequence("   ", 42, 6, "-")).toBe("000042");
  });

  it("member ids pass an empty separator so the prefix and digits run together", () => {
    expect(formatSequence("MEM", 1, 6, "")).toBe("MEM000001");
    expect(formatSequence("GYM", 42, 6, "")).toBe("GYM000042");
    expect(formatSequence("", 42, 6, "")).toBe("000042");
  });
});
