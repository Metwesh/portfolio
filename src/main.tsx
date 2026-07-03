import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import mixpanel from "mixpanel-browser";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components";
import "./index.css";
import { storageKey } from "./constants/misc";

// Register GSAP plugins once for the entire app
gsap.registerPlugin(ScrollTrigger);

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
            userId = `user_${Date.now()}_${Math.random()
              .toString(36)
              .substring(2, 15)}`;
            localStorage.setItem(storageKey, userId);
          }

          return userId;
        };

        const userId = getUserId();
        mixpanel.identify(userId);

        const ipController = new AbortController();
        const ipTimeout = setTimeout(() => ipController.abort(), 2000);
        fetch("https://api.ipify.org?format=json", {
          signal: ipController.signal,
        })
          .then((response) => response.json())
          .then((data) => {
            clearTimeout(ipTimeout);
            mixpanel.people.set({
              $first_visit: new Date().toISOString(),
              user_agent: navigator.userAgent,
              screen_resolution: `${window.screen.width}x${window.screen.height}`,
              ip_address: data.ip,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });
          })
          .catch(() => {
            clearTimeout(ipTimeout);
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
