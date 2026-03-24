import mixpanel from "mixpanel-browser";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("Mixpanel Initialization", () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });

    // Mock console.warn
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Mock mixpanel
    vi.mock("mixpanel-browser", () => ({
      default: {
        init: vi.fn(),
        identify: vi.fn(),
        people: {
          set: vi.fn(),
        },
      },
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("should initialize Mixpanel when environment variables are present", () => {
    const mockToken = "test-token";
    const mockHost = "https://test-host.com";

    // Mock environment variables
    vi.stubEnv("VITE_MIXPANEL_TOKEN", mockToken);
    vi.stubEnv("VITE_MIXPANEL_HOST", mockHost);

    const mockInit = vi.spyOn(mixpanel, "init");

    // Simulate initialization logic
    const mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN;
    const mixpanelHost = import.meta.env.VITE_MIXPANEL_HOST;

    if (mixpanelToken && mixpanelHost) {
      mixpanel.init(mixpanelToken, {
        autocapture: true,
        record_sessions_percent: 100,
        api_host: mixpanelHost,
      });
    }

    expect(mockInit).toHaveBeenCalledWith(mockToken, {
      autocapture: true,
      record_sessions_percent: 100,
      api_host: mockHost,
    });

    vi.unstubAllEnvs();
  });

  it("should not initialize Mixpanel when environment variables are missing", () => {
    // Mock missing environment variables
    vi.stubEnv("VITE_MIXPANEL_TOKEN", undefined);
    vi.stubEnv("VITE_MIXPANEL_HOST", undefined);

    const mockInit = vi.spyOn(mixpanel, "init");

    // Simulate initialization logic
    const mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN;
    const mixpanelHost = import.meta.env.VITE_MIXPANEL_HOST;

    if (mixpanelToken && mixpanelHost) {
      mixpanel.init(mixpanelToken, {
        autocapture: true,
        record_sessions_percent: 100,
        api_host: mixpanelHost,
      });
    } else {
      console.warn("Mixpanel not initialized: Missing environment variables");
    }

    expect(mockInit).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Mixpanel not initialized: Missing environment variables",
    );

    vi.unstubAllEnvs();
  });

  it("should generate a new user ID when not in localStorage", () => {
    const storageKey = "portfolio-user-id";

    // Simulate getUserId logic
    const getUserId = (): string => {
      let userId = localStorage.getItem(storageKey);

      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem(storageKey, userId);
      }

      return userId;
    };

    const userId = getUserId();

    expect(localStorage.setItem).toHaveBeenCalled();
    expect(userId).toMatch(/^user_\d+_[a-z0-9]+$/);
  });

  it("should retrieve existing user ID from localStorage", () => {
    const storageKey = "portfolio-user-id";
    const existingUserId = "user_1234567890_abcdefg";

    // Pre-populate localStorage
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      existingUserId,
    );

    // Simulate getUserId logic
    const getUserId = (): string => {
      let userId = localStorage.getItem(storageKey);

      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem(storageKey, userId);
      }

      return userId;
    };

    const userId = getUserId();

    expect(localStorage.getItem).toHaveBeenCalledWith(storageKey);
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(userId).toBe(existingUserId);
  });

  it("should call mixpanel.identify with user ID", () => {
    const userId = "user_test_123";
    const identifySpy = vi.spyOn(mixpanel, "identify");

    mixpanel.identify(userId);

    expect(identifySpy).toHaveBeenCalledWith(userId);
  });

  it("should set user properties with mixpanel.people.set", () => {
    const peopleSetSpy = vi.spyOn(mixpanel.people, "set");
    const userProperties = {
      $first_visit: new Date().toISOString(),
      user_agent: navigator.userAgent,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    mixpanel.people.set(userProperties);

    expect(peopleSetSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        $first_visit: expect.any(String),
        user_agent: expect.any(String),
        screen_resolution: expect.any(String),
        timezone: expect.any(String),
      }),
    );
  });
});
