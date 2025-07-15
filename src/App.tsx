import { Footer, Header, MainCanvas } from "./components";
import { CertificatesSection } from "./sections/CertificatesSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { HeroSection } from "./sections/HeroSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { TechStacksSection } from "./sections/TechStacksSection";

// Track scroll position for 3D parallax
export default function App() {
  return (
    <div className="mx-4">
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
