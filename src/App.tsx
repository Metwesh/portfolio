import { useGLTF } from "@react-three/drei";
import { Footer, Header, MainCanvas } from "./components";
import {
  CertificatesSection,
  ExperienceSection,
  HeroSection,
  ProjectsSection,
  TechStacksSection,
} from "./sections";

// Preload the model
useGLTF.preload("./m-logo/M-logo.gltf");

// Track scroll position for 3D parallax
export default function App() {
  return (
    <div className="mx-4 overflow-hidden">
      {/* Fixed 3D Canvas */}
      <MainCanvas />

      {/* Sticky Header with Logo and lively text */}
      <Header />

      <HeroSection />

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
