import { beforeEach, describe, expect, it } from "vitest";
import {
  getIntegration,
  listIntegrations,
  registerIntegration,
  requireIntegration,
} from "@/lib/integrations/registry";

describe("integration registry", () => {
  beforeEach(() => {
    // Registry state is intentionally process-local. Use unique keys per test.
  });

  it("registers and retrieves an integration", () => {
    const key = `test-reviews-${crypto.randomUUID()}`;
    const definition = {
      key,
      name: "Test Reviews",
      version: 1,
      auth: { type: "oauth2" as const, scopes: ["reviews.read"] },
      capabilities: ["source_discovery", "reviews", "sync"] as const,
    };

    registerIntegration(definition);

    expect(getIntegration(key)).toEqual(definition);
    expect(requireIntegration(key)).toEqual(definition);
    expect(listIntegrations()).toContainEqual(definition);
  });

  it("rejects duplicate registration", () => {
    const key = `test-duplicate-${crypto.randomUUID()}`;
    const definition = {
      key,
      name: "Duplicate Test",
      version: 1,
      auth: { type: "none" as const },
      capabilities: ["sync"] as const,
    };

    registerIntegration(definition);

    expect(() => registerIntegration(definition)).toThrow(
      `Integration already registered: ${key}`,
    );
  });

  it("rejects invalid definitions", () => {
    expect(() =>
      registerIntegration({
        key: "",
        name: "Invalid",
        version: 1,
        auth: { type: "none" },
        capabilities: [],
      }),
    ).toThrow("Integration key is required");

    const key = `test-version-${crypto.randomUUID()}`;
    expect(() =>
      registerIntegration({
        key,
        name: "Invalid Version",
        version: 0,
        auth: { type: "none" },
        capabilities: [],
      }),
    ).toThrow("Integration version must be a positive integer");
  });

  it("requires registered integrations", () => {
    const key = `test-missing-${crypto.randomUUID()}`;
    expect(() => requireIntegration(key)).toThrow(
      `Integration not registered: ${key}`,
    );
  });
});
