import { createPortal } from "react-dom";
import { navLinks, socialLinks } from "../constants";

interface MobileMenuProps {
  isOpen: boolean;
  onNavClick: () => void;
}

export function MobileMenu({ isOpen, onNavClick }: MobileMenuProps) {
  return createPortal(
    <div
      aria-modal="true"
      role="dialog"
      className={`fixed inset-0 z-10 flex h-screen w-screen flex-col items-center justify-center gap-8 bg-black/80 text-2xl font-bold text-white backdrop-blur-xl transition-[opacity,transform] duration-500 md:hidden ${
        isOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      } `}
    >
      {/* Navigation Links */}
      {navLinks.map((link, index) => (
        <a
          key={link.href}
          href={link.href}
          onClick={onNavClick}
          className={`focus:ring-none focus rounded transition-all duration-500 hover:text-cyan-400 focus:text-cyan-400 focus:outline-none ${
            isOpen
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-8 opacity-0"
          }`}
          style={{
            transitionDelay: isOpen ? `${index * 80 + 120}ms` : "0ms",
          }}
          tabIndex={isOpen ? 0 : -1}
          id={index === 0 ? "mobile-nav-first-link" : undefined}
        >
          {link.label}
        </a>
      ))}

      {/* Divider */}
      <div
        className={`h-px w-32 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-500 ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-8 opacity-0"
        }`}
        style={{
          transitionDelay: isOpen ? `${navLinks.length * 80 + 120}ms` : "0ms",
        }}
      />

      {/* Social Links */}
      <div
        className={`flex gap-6 text-lg font-semibold transition-all duration-500 ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-8 opacity-0"
        }`}
        style={{
          transitionDelay: isOpen
            ? `${(navLinks.length + 1) * 80 + 120}ms`
            : "0ms",
        }}
      >
        {socialLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNavClick}
            className="transition-colors hover:text-cyan-400 focus:text-cyan-400 focus:outline-none"
            tabIndex={isOpen ? 0 : -1}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>,
    document.body,
  );
}
