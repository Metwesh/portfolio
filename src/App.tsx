import { useGLTF } from "@react-three/drei";
import { Footer, Header, MainCanvas } from "./components";
import {
  CertificatesSection,
  ExperienceSection,
  HeroSection,
  ProjectsSection,
  TechStacksSection,
} from "./sections";
import { useEffect, useState } from "react";

// Preload the model
useGLTF.preload("./m-logo/M-logo.gltf");

// Track scroll position for 3D parallax
export default function App() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let ticking = false;
    const updateScroll = () => {
      setScrollY(window.scrollY);
      ticking = false;
    };
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, {
      signal: controller.signal,
    });
    updateScroll();
    return () => controller.abort();
  }, []);

  return (
    <div className="px-4">
      {/* Fixed 3D Canvas */}
      <MainCanvas scrollY={scrollY} />

      {/* Sticky Header with Logo and lively text */}
      <Header scrollY={scrollY} />

      <HeroSection scrollY={scrollY} />

      <ProjectsSection />

      <ExperienceSection />

      <TechStacksSection />

      <div className="relative z-10 bg-gradient-to-b from-black/0 to-black">
        <CertificatesSection />

        <Footer />
      </div>
    </div>
  );
}
