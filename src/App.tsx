import { useGLTF } from "@react-three/drei";
import {
  Footer,
  Header,
  MainCanvas,
  SkipToContent,
  LoadingScreen,
} from "./components";
import { useEffect, useState, lazy, Suspense } from "react";

// Preload the model
useGLTF.preload("./m-logo/M-logo.gltf");

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
  const [scrollY, setScrollY] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleCanvasReady = () => {
    // Hide loader once MainCanvas is ready
    setIsLoading(false);
  };

  useEffect(() => {
    const controller = new AbortController();
    let ticking = false;
    let lastScrollY = window.scrollY;

    const updateScroll = () => {
      const currentScrollY = window.scrollY;
      // Only update if scroll changed significantly (reduces re-renders)
      if (Math.abs(currentScrollY - lastScrollY) > 1) {
        setScrollY(currentScrollY);
        lastScrollY = currentScrollY;
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
      signal: controller.signal,
    });
    updateScroll();
    return () => controller.abort();
  }, []);

  return (
    <>
      {isLoading && <LoadingScreen />}

      <div className="px-4">
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
            <ProjectsSection />
          </Suspense>

          <Suspense fallback={null}>
            <ExperienceSection />
          </Suspense>

          <TechStacksSection />

          <div className="relative z-10 bg-gradient-to-b from-black/0 to-black">
            <Suspense fallback={null}>
              <CertificatesSection />
            </Suspense>

            <Footer />
          </div>
        </main>
      </div>
    </>
  );
}
