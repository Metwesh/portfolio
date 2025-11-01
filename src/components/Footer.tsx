import { socialLinks } from "../constants";

export function Footer() {
  return (
    <footer className="relative z-10 w-full space-y-1 py-8 text-center text-sm text-gray-400">
      <div>
        {socialLinks.map((link, index) => (
          <span key={link.href}>
            {index > 0 && <span className="mx-2">|</span>}
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-semibold text-cyan-400 transition-colors hover:text-cyan-300 hover:underline"
            >
              {link.label}
            </a>
          </span>
        ))}
      </div>
      <p>
        <span>&copy;&nbsp;{new Date().getFullYear()}&nbsp;</span>
        <a
          href="#"
          aria-label="scroll-to-top"
          className="inline-block font-semibold text-cyan-400 transition-colors hover:text-cyan-300 hover:underline"
        >
          Mohamed H. Aly
        </a>
        <span>&nbsp;All rights reserved.</span>
      </p>
    </footer>
  );
}
