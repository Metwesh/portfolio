import { useGLTF } from "@react-three/drei";
import gsap from "gsap";
import { lazy, Suspense } from "react";
import { Footer, Header } from "./components";
import { CustomCursor } from "./components/CustomCursor";
import { UniverseCanvas } from "./components/UniverseCanvas";
import { CENTERPIECE_PATH } from "./constants/misc";
import { useLenisScroll } from "./hooks/useLenisScroll";

// Preload the model
useGLTF.preload(CENTERPIECE_PATH);

// Lazy load sections for better performance — import each section's own
// file directly (not the barrel) so Rollup can actually split them into
// separate chunks instead of bundling all five together.
const HeroSection = lazy(() =>
  import("./sections/HeroSection").then((module) => ({
    default: module.HeroSection,
  })),
);
const ProjectsSection = lazy(() =>
  import("./sections/ProjectsSection").then((module) => ({
    default: module.ProjectsSection,
  })),
);
const ExperienceSection = lazy(() =>
  import("./sections/ExperienceSection").then((module) => ({
    default: module.ExperienceSection,
  })),
);
const TechStacksSection = lazy(() =>
  import("./sections/TechStacksSection").then((module) => ({
    default: module.TechStacksSection,
  })),
);
const CertificatesSection = lazy(() =>
  import("./sections/CertificatesSection").then((module) => ({
    default: module.CertificatesSection,
  })),
);

export default function App() {
  const { scrollY } = useLenisScroll();

  const handleCanvasReady = () => {
    const loadingScreen = document.getElementById("loading-screen");
    if (!loadingScreen) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      loadingScreen.remove();
      document.dispatchEvent(new CustomEvent("app:ready"));
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        loadingScreen.remove();
        document.dispatchEvent(new CustomEvent("app:ready"));
      },
    });

    // Stars + label collapse toward center simultaneously
    tl.to(
      "#loading-screen .ls-stars",
      {
        scale: 0,
        duration: 0.45,
        ease: "power3.in",
        transformOrigin: "center center",
      },
      0,
    )
      .to(
        "#loading-screen .ls-label",
        { opacity: 0, y: 12, duration: 0.2, ease: "power2.in" },
        0,
      )
      // Rings implode inward, staggered
      .to(
        "#loading-screen .ls-ring",
        {
          scale: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power3.in",
          stagger: 0.05,
        },
        0.05,
      )
      // Glow expands outward as energy releases
      .to(
        "#loading-screen .ls-glow",
        { scale: 3, opacity: 0, duration: 0.4, ease: "power2.in" },
        0.05,
      )
      // M pulses bright — absorbing everything
      .to(
        "#loading-screen .ls-m",
        {
          scale: 2.2,
          filter: "drop-shadow(0 0 60px #00eeff) drop-shadow(0 0 30px #a855f7)",
          duration: 0.35,
          ease: "power2.out",
        },
        0.1,
      )
      // M implodes to a point
      .to(
        "#loading-screen .ls-m",
        { scale: 0, opacity: 0, duration: 0.22, ease: "power4.in" },
        0.42,
      )
      // Screen fades out
      .to("#loading-screen", { opacity: 0, duration: 0.22 }, 0.52);
  };

  return (
    <>
      {/* Skip-to-content: visible only on keyboard focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-black focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      <CustomCursor />

      {/* Single unified 3D universe — fixed behind everything */}
      <UniverseCanvas onReady={handleCanvasReady} />

      <Header scrollY={scrollY} />

      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 max-w-screen"
      >
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
    </>
  );
}
