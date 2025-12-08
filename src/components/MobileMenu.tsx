import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { navLinks, socialLinks } from "../constants";
import { cn } from "../lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onNavClick: () => void;
}

export function MobileMenu({ isOpen, onNavClick }: MobileMenuProps) {
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Manage dialog open/close with proper showModal/close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
      // Focus first link when menu opens
      setTimeout(() => firstLinkRef.current?.focus(), 100);
    } else if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return createPortal(
    <dialog
      ref={dialogRef}
      id="mobile-menu"
      aria-label="Mobile navigation menu"
      className={cn(
        "fixed inset-0 z-10 flex h-screen w-screen flex-col items-center justify-center gap-8 bg-black/80 font-bold text-2xl text-white backdrop-blur-xl transition-[opacity,transform] duration-500 md:hidden",
        isOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      )}
    >
      {/* Navigation Links */}
      {navLinks.map((link, index) => (
        <a
          key={link.href}
          ref={index === 0 ? firstLinkRef : undefined}
          href={link.href}
          onClick={onNavClick}
          className={cn(
            "focus rounded transition-all duration-500 hover:text-cyan-400 focus-visible:text-cyan-400 focus-visible:outline-offset-2",
            isOpen
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-8 opacity-0"
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
            : "pointer-events-none translate-y-8 opacity-0"
        )}
        style={{
          transitionDelay: isOpen ? `${navLinks.length * 80 + 120}ms` : "0ms",
        }}
      />

      {/* Social Links */}
      <div
        className={cn(
          "flex gap-6 font-semibold text-lg transition-all duration-500",
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-8 opacity-0"
        )}
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
            className="transition-colors hover:text-cyan-400 focus-visible:text-cyan-400 focus-visible:outline-offset-2"
            tabIndex={isOpen ? 0 : -1}
          >
            {link.label}
          </a>
        ))}
      </div>
    </dialog>,
    document.body
  );
}
