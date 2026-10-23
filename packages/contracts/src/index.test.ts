import { describe, expect, it } from "vitest";
import { HealthResponseSchema } from "./index";

describe("HealthResponseSchema", () => {
  it("accepts the API health response contract", () => {
    expect(
      HealthResponseSchema.safeParse({ status: "ok", service: "link-api" }).success,
    ).toBe(true);
  });

  it("rejects an unexpected health status", () => {
    expect(
      HealthResponseSchema.safeParse({ status: "failed", service: "link-api" }).success,
    ).toBe(false);
  });
});
