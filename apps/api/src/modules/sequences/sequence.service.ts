import { Counter } from "./counter.model";

export async function getNextSequenceValue(name: string): Promise<number> {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return counter.value;
}

export function formatSequence(prefix: string, value: number, padding = 6, separator = "-"): string {
  const paddedValue = String(value).padStart(padding, "0");
  const trimmedPrefix = prefix.trim();
  // No separator at all when there's no prefix — an empty prefix means plain digits, not "-000001".
  return trimmedPrefix ? `${trimmedPrefix}${separator}${paddedValue}` : paddedValue;
}

/**
 * Read-only preview of what the next sequence value would be, without reserving it.
 * Purely for pre-filling a form field — the value actually assigned at creation time may
 * differ if the counter moves in between (or the user overrides it), so never rely on this
 * for uniqueness.
 */
export async function peekNextSequenceValue(name: string): Promise<number> {
  const counter = await Counter.findById(name);
  return (counter?.value ?? 0) + 1;
}

/** Admin override — jumps the counter so the *next* generated value is exactly `nextValue`. */
export async function setNextSequenceValue(name: string, nextValue: number): Promise<void> {
  await Counter.findByIdAndUpdate(name, { value: nextValue - 1 }, { upsert: true });
}
