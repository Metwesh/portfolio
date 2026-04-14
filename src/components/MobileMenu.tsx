import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { navLinks, socialLinks } from "../constants";
import { cn } from "../lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onNavClick: () => void;
}

export function MobileMenu({ isOpen, onNavClick }: MobileMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.show();
      dialog.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }

    if (!isOpen) return;

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = [
        ...dialog.querySelectorAll<HTMLElement>(
          'a[href], button, [tabindex]:not([tabindex="-1"])',
        ),
      ];
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !dialog.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [isOpen]);

  return createPortal(
    <dialog
      ref={dialogRef}
      id="mobile-menu"
      tabIndex={-1}
      aria-label="Mobile navigation menu"
      className={cn(
        "fixed inset-0 z-10 m-0 flex h-svh max-h-none w-screen max-w-none flex-col items-center justify-center gap-8 border-0 bg-black/80 p-0 font-bold text-2xl text-white transition-[opacity,transform,backdrop-filter] duration-500 md:hidden",
        isOpen
          ? "pointer-events-auto opacity-100 backdrop-blur-xl"
          : "pointer-events-none opacity-0 backdrop-blur-[0px]",
      )}
    >
      {/* Navigation Links */}
      {navLinks.map((link, index) => (
        <a
          key={link.href}
          href={link.href}
          onClick={onNavClick}
          className={cn(
            "focus rounded transition-all duration-500 hover:text-cyan-400 focus-visible:text-cyan-400 focus-visible:outline-offset-2",
            isOpen
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-8 opacity-0",
          )}
          style={{
            transitionDelay: isOpen ? `${index * 80 + 120}ms` : "0ms",
          }}
          tabIndex={isOpen ? 0 : -1}
        >
          {link.label}
        </a>
      ))}

      {/* Divider */}
      <div
        className={cn(
          "h-px w-32 bg-linear-to-r from-transparent via-white/30 to-transparent transition-all duration-500",
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-8 opacity-0",
        )}
        style={{
          transitionDelay: isOpen ? `${navLinks.length * 80 + 120}ms` : "0ms",
        }}
      />

      {/* Footer links — Socials / Resume / Contact */}
      <div
        className={cn(
          "flex items-start gap-10 font-semibold text-sm transition-all duration-500",
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-8 opacity-0",
        )}
        style={{
          transitionDelay: isOpen
            ? `${(navLinks.length + 1) * 80 + 120}ms`
            : "0ms",
        }}
      >
        {/* Socials */}
        <div className="flex flex-col items-center gap-2">
          <span className="mb-1 text-white/30 text-xs uppercase tracking-widest">
            Socials
          </span>
          {socialLinks.slice(0, 2).map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onNavClick}
              className="text-white/70 transition-colors hover:text-cyan-400 focus-visible:outline-offset-2"
              tabIndex={isOpen ? 0 : -1}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Resume */}
        <div className="flex flex-col items-center gap-2">
          <span className="mb-1 text-white/30 text-xs uppercase tracking-widest">
            Resume
          </span>
          <a
            href={socialLinks[2].href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNavClick}
            className="text-white/70 transition-colors hover:text-cyan-400 focus-visible:outline-offset-2"
            tabIndex={isOpen ? 0 : -1}
          >
            {socialLinks[2].label}
          </a>
        </div>

        {/* Contact */}
        <div className="flex flex-col items-center gap-2">
          <span className="mb-1 text-white/30 text-xs uppercase tracking-widest">
            Contact
          </span>
          {socialLinks.slice(3).map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onNavClick}
              className="text-white/70 transition-colors hover:text-cyan-400 focus-visible:outline-offset-2"
              tabIndex={isOpen ? 0 : -1}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
