const navLinks = [
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#tech-stacks", label: "Tech Stacks" },
  { href: "#certificates", label: "Certificates" },
];

const socialLinks = [
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
    href: `${import.meta.env.BASE_URL}documents/Mohamed%20H.%20Aly.pdf`,
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

const accentColors = {
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

const mainLogoPath = "./m-logo/main-logo.gltf";

// Shared cyan → blue → violet gradient used across the logo mark
// (Header, CertificatesSection fan + main logo).
const logoGradientStops = [
  { offset: undefined, color: "#22D3EE" },
  { offset: "0.5", color: "#3B82F6" },
  { offset: "1", color: "#A855F7" },
] as const;

const breakpoints = {
  smallMobile: 640,
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const;

export {
  accentColors,
  breakpoints,
  logoGradientStops,
  mainLogoPath,
  navLinks,
  socialLinks,
};
