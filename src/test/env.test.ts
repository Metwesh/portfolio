import { describe, it, expect } from "vitest";

describe("Environment Variables", () => {
  it("should have VITE_MIXPANEL_TOKEN defined in vite-env.d.ts", () => {
    const envType = import.meta.env.VITE_MIXPANEL_TOKEN;
    expect(envType).toBeDefined();
  });

  it("should have VITE_MIXPANEL_HOST defined in vite-env.d.ts", () => {
    const envType = import.meta.env.VITE_MIXPANEL_HOST;
    expect(envType).toBeDefined();
  });

  it("VITE_MIXPANEL_TOKEN should be a string", () => {
    const token = import.meta.env.VITE_MIXPANEL_TOKEN;
    expect(typeof token).toBe("string");
  });

  it("VITE_MIXPANEL_HOST should be a string", () => {
    const host = import.meta.env.VITE_MIXPANEL_HOST;
    expect(typeof host).toBe("string");
  });

  it("VITE_MIXPANEL_HOST should be a valid URL format", () => {
    const host = import.meta.env.VITE_MIXPANEL_HOST;
    if (host) {
      expect(() => new URL(host)).not.toThrow();
    }
  });

  it("should have all required environment variables for production", () => {
    const requiredEnvVars = [
      "VITE_MIXPANEL_TOKEN" as const,
      "VITE_MIXPANEL_HOST" as const,
    ];

    requiredEnvVars.forEach((varName) => {
      const value = import.meta.env[varName];
      expect(
        value,
        `${varName} should be defined in environment variables`,
      ).toBeDefined();
    });
  });
});
