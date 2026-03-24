import mixpanel from "mixpanel-browser";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components";
import "./index.css";
import { storageKey } from "./constants/misc";

// Initialize Mixpanel only if token is available
const mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN;
const mixpanelHost = import.meta.env.VITE_MIXPANEL_HOST;

// Defer Mixpanel initialization to avoid blocking initial render
if (mixpanelToken && mixpanelHost) {
  const initMixpanel = () => {
    mixpanel.init(mixpanelToken, {
      autocapture: true,
      record_sessions_percent: 100,
      api_host: mixpanelHost,
      loaded: (mixpanel) => {
        // User fingerprinting - generate or retrieve a unique user ID
        const getUserId = (): string => {
          let userId = localStorage.getItem(storageKey);

          if (!userId) {
            // Generate a unique ID based on timestamp and random string
            userId = `user_${Date.now()}_${Math.random()
              .toString(36)
              .substring(2, 15)}`;
            localStorage.setItem(storageKey, userId);
          }

          return userId;
        };

        // Identify the user with Mixpanel
        const userId = getUserId();
        mixpanel.identify(userId);

        // Fetch IP address and set user properties
        fetch("https://api.ipify.org?format=json")
          .then((response) => response.json())
          .then((data) => {
            mixpanel.people.set({
              $first_visit: new Date().toISOString(),
              user_agent: navigator.userAgent,
              screen_resolution: `${window.screen.width}x${window.screen.height}`,
              ip_address: data.ip,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });
          })
          .catch(() => {
            // Fallback if IP fetch fails
            mixpanel.people.set({
              $first_visit: new Date().toISOString(),
              user_agent: navigator.userAgent,
              screen_resolution: `${window.screen.width}x${window.screen.height}`,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });
          });
      },
    });
  };

  // Use requestIdleCallback to defer initialization
  if ("requestIdleCallback" in window) {
    requestIdleCallback(initMixpanel);
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(initMixpanel, 1);
  }
} else if (import.meta.env.DEV) {
  console.warn("Mixpanel not initialized: Missing environment variables");
}

createRoot(document.getElementById("root") ?? document.body).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
