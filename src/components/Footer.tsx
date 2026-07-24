import { SOCIAL_LINKS } from "../constants/misc";

export function Footer() {
  return (
    <footer className="relative z-10 w-full space-y-1 py-8 text-center text-gray-400 text-sm">
      <div>
        {SOCIAL_LINKS.map((link, index) => (
          <span key={link.href}>
            {index > 0 && <span className="mx-2">|</span>}
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-semibold text-cyan-400 transition-colors hover:text-cyan-300 hover:underline focus-visible:text-cyan-300 focus-visible:underline focus-visible:outline-offset-2"
            >
              {link.label}
            </a>
          </span>
        ))}
      </div>
      <p>
        <span>&copy;&nbsp;{new Date().getFullYear()}&nbsp;</span>
        <a
          href="#scroll-section"
          aria-label="Scroll to top"
          className="inline-block font-semibold text-cyan-400 transition-colors hover:text-cyan-300 hover:underline focus-visible:text-cyan-300 focus-visible:underline focus-visible:outline-offset-2"
        >
          Mohamed H. Aly
        </a>
        <span>&nbsp;All rights reserved.</span>
      </p>
    </footer>
  );
}
