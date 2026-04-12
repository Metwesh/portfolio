import { useGLTF } from "@react-three/drei";
import { lazy, Suspense } from "react";
import { Footer, Header, SkipToContent } from "./components";
import { CustomCursor } from "./components/CustomCursor";
import { UniverseCanvas } from "./components/UniverseCanvas";
import { mainLogoPath } from "./constants";
import { useLenisScroll } from "./hooks/useLenisScroll";

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

export default function App() {
  const { scrollY } = useLenisScroll();

  const handleCanvasReady = () => {
    const loadingScreen = document.getElementById("loading-screen");
    if (!loadingScreen) return;
    loadingScreen.classList.add("swipe-out");
    setTimeout(() => {
      loadingScreen.remove();
      document.dispatchEvent(new CustomEvent("app:ready"));
    }, 700);
  };

  return (
    <>
      <CustomCursor />
      <SkipToContent />

      {/* Single unified 3D universe — fixed behind everything */}
      <UniverseCanvas onReady={handleCanvasReady} />

      <Header scrollY={scrollY} />

      <main id="main-content" className="relative z-10 max-w-screen">
        <Suspense fallback={null}>
          <HeroSection />
        </Suspense>

        <Suspense fallback={null}>
          <ProjectsSection />
        </Suspense>

        <Suspense fallback={null}>
          <ExperienceSection />
        </Suspense>

        <Suspense fallback={null}>
          <TechStacksSection />
        </Suspense>

        <div className="relative z-10 bg-linear-to-b from-black/0 to-black">
          <Suspense fallback={null}>
            <CertificatesSection />
          </Suspense>

          <Footer />
        </div>
      </main>

      {/* Film grain overlay */}
      <div className="grain-overlay" aria-hidden="true" />
    </>
  );
}
