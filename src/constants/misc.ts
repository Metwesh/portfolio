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

// Shared "M" logo mark — path + gradient used across Header, CertificatesSection
// (fan + main logo card), and any future spot needing the mark.
const LOGO_PATH =
  "M39 39C69 109 69 319 39 399C79.6667 397 164.5 399 119 439C137 439 159 406 159 359C159 279 150.5 275 99 275C109 255 109 219 99 199C119 209 159 209 179 199L239 419L299 199C319 209 359 209 379 199C369 219 369 255 379 275C327.5 275 319 279 319 359C319 406 341 439 359 439C313.5 399 398.333 397 439 399C409 319 409 109 439 39C418.5 52.5 311.4 71.4 279 39L239 199L199 39C166.6 71.4 59.5 52.5 39 39Z";

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

const SKILL_CATEGORIES = ["Frontend", "Backend", "DevOps", "Tooling", "Design"];

export {
  ACCENT_COLORS,
  BREAKPOINTS,
  CENTERPIECE_PATH,
  LOGO_GRADIENT_STOPS,
  LOGO_PATH,
  NAV_LINKS,
  SKILL_CATEGORIES,
  SOCIAL_LINKS,
};
