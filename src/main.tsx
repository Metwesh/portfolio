import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components";
import "./index.css";

// Register GSAP plugins once for the entire app
gsap.registerPlugin(ScrollTrigger);

createRoot(document.getElementById("root") ?? document.body).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
