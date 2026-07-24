const NAV_LINKS = [
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#tech-stacks", label: "Tech Stacks" },
  { href: "#certificates", label: "Certificates" },
];

const SOCIAL_LINKS = [
  {
    href: "https://www.linkedin.com/in/mohamed-h-aly/",
    label: "LinkedIn",
    external: true,
  },
  {
    href: "https://github.com/metwesh",
    label: "Github",
    external: true,
  },
  {
    href: "/documents/Mohamed%20H.%20Aly.pdf",
    label: "Resume",
    external: true,
  },
  {
    href: "mailto:mohamedh.aly@hotmail.com",
    label: "Email",
    external: true,
  },
  {
    href: "tel:+201278189999",
    label: "Phone",
    external: true,
  },
];

const ACCENT_COLORS = {
  blue: "#4267B2",
  magenta: "#ff00cc",
  orange: "#ff9900",
  cyan: "#00eaff",
  violet: "#7c3aed",
  red: "#ef4444",
  lightRed: "#f87171",
  yellow: "#fde047",
  teal: "#14b8a6",
  indigo: "#6366f1",
  darkBlue: "#1d4ed8",
  deepOrange: "#f97316",
  pink: "#ec4899",
  purple: "#8b5cf6",
  green: "#22c55e",
  amber: "#f59e0b",
  skyBlue: "#0ea5e9",
  rose: "#e11d48",
  deepRose: "#be123c",
  maroon: "#7f1d1d",
  lightAmber: "#fbbf24",
} as const;

const CENTERPIECE_PATH = "./m-logo/main-logo.gltf";

// Shared cyan → blue → violet gradient used across the logo mark
// (Header, CertificatesSection fan + main logo).
const LOGO_GRADIENT_STOPS = [
  { offset: undefined, color: "#22D3EE" },
  { offset: "0.5", color: "#3B82F6" },
  { offset: "1", color: "#A855F7" },
] as const;

const BREAKPOINTS = {
  smallMobile: 640,
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const;

// Shared glass-card base, reused by CertificatesSection and ExperienceSection
// cards so the look stays in sync across both.
const GLASS_CARD_CLASS =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl";

const SKILL_CATEGORIES = ["Frontend", "Backend", "DevOps", "Tooling", "Design"];

export {
  ACCENT_COLORS,
  BREAKPOINTS,
  CENTERPIECE_PATH,
  GLASS_CARD_CLASS,
  LOGO_GRADIENT_STOPS,
  NAV_LINKS,
  SKILL_CATEGORIES,
  SOCIAL_LINKS,
};
