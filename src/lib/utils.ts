import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Shared glass-card base, reused by CertificatesSection and ExperienceSection
// cards so the look stays in sync across both.
export const GLASS_CARD_CLASS =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl";
