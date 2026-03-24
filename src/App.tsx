import { useGLTF } from "@react-three/drei";
import { lazy, Suspense } from "react";
import { Footer, Header, MainCanvas, SkipToContent } from "./components";
import { mainLogoPath } from "./constants";
import { useScrollPosition } from "./hooks/useScrollPosition";

// Preload the model
useGLTF.preload(mainLogoPath);

// Lazy load sections for better performance
const HeroSection = lazy(() =>
  import("./sections").then((module) => ({ default: module.HeroSection })),
);
const ProjectsSection = lazy(() =>
  import("./sections").then((module) => ({ default: module.ProjectsSection })),
);
const ExperienceSection = lazy(() =>
  import("./sections").then((module) => ({
    default: module.ExperienceSection,
  })),
);
const TechStacksSection = lazy(() =>
  import("./sections").then((module) => ({
    default: module.TechStacksSection,
  })),
);
const CertificatesSection = lazy(() =>
  import("./sections").then((module) => ({
    default: module.CertificatesSection,
  })),
);

// Track scroll position for 3D parallax
export default function App() {
  const scrollY = useScrollPosition();

  const handleCanvasReady = () => {
    // Hide the HTML loading screen when canvas is ready
    const loadingScreen = document.getElementById("loading-screen");
    if (!loadingScreen) return;
    loadingScreen.classList.add("fade-out");
    // Remove from DOM after transition completes
    setTimeout(() => {
      loadingScreen.remove();
    }, 300);
  };

  return (
    <div className="px-gutter">
      {/* Skip to content for accessibility */}
      <SkipToContent />

      {/* Fixed 3D Canvas */}
      <MainCanvas scrollY={scrollY} onReady={handleCanvasReady} />

      {/* Sticky Header with Logo and lively text */}
      <Header scrollY={scrollY} />

      <main id="main-content">
        <Suspense fallback={null}>
          <HeroSection scrollY={scrollY} />
        </Suspense>

        <Suspense fallback={null}>
          <ProjectsSection scrollY={scrollY} />
        </Suspense>

        <Suspense fallback={null}>
          <ExperienceSection />
        </Suspense>

        <TechStacksSection />

        <div className="relative z-10 bg-linear-to-b from-black/0 to-black">
          <Suspense fallback={null}>
            <CertificatesSection />
          </Suspense>

          <Footer />
        </div>
      </main>
    </div>
  );
}
