import TechCanvas from "../components/TechCanvas";

export function TechStacksSection() {
  return (
    <section
      id="tech-stacks"
      className="z-10 flex min-h-[60vh] flex-col items-center justify-center py-24"
    >
      <h2 className="mb-12 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent drop-shadow-lg">
        Tech Stacks
      </h2>
      <div className="h-[420px] w-full max-w-4xl md:h-[520px] lg:h-[600px]">
        <TechCanvas />
      </div>
    </section>
  );
}
