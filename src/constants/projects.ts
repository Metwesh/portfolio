import {
  addOn,
  addOnCms,
  amanDashboard,
  amanLogo,
  aradyMisr,
  aradyMisrCms,
  aradyMisrLogo,
  BRGRSpinTheWheel,
  beltoneHolding,
  beltoneLogo,
  brgrLogo,
  // bookRentalProject,
  // budgetApp,
  // clinicWebsite,
  dartSpace,
  dartSpaceLogo,
  eAndConfidential,
  eAndLogo,
  // faceDetectApp,
  marqCrm,
  marqLogo,
  sideupDashboardV2,
  sideupDashboardV3,
  sideupLogo,
  tahLogo,
  // taskHandlerApp,
  willysAdmin,
  willysLogo,
  willysWebsite,
} from "../assets";
import { ACCENT_COLORS } from "./misc";

// Valid tag color names
export type TagColor =
  | "orange"
  | "blue"
  | "yellow"
  | "purple"
  | "green"
  | "pink"
  | "red"
  | "cyan"
  | "light-blue"
  | "light-green"
  | "light-purple"
  | "light-pink"
  | "light-orange"
  | "dark-purple"
  | "dark-green"
  | "dull-blue"
  | "gray-white";

export interface ProjectTag {
  name: string;
  color: TagColor;
}

type HexColor = `#${string}`;

export interface Project {
  name: string;
  description: string;
  image: string;
  logo?: string; // Optional logo for the project
  darkLogo?: boolean;
  color: HexColor; // Hex color for the project card
  tags?: ProjectTag[];
  link?: string;
}

export const PROJECTS: readonly Project[] = [
  // {
  //   name: "Book Rental Dashboard",
  //   description:
  //     "A full-stack online bookstore built for a graduation project using PHP, SQL, and HTML/CSS/JS. Project files were lost due to hard drive failure.",
  //   tags: [
  //     {
  //       name: "HTML",
  //       color: "orange",
  //     },
  //     {
  //       name: "CSS",
  //       color: "blue",
  //     },
  //     {
  //       name: "JS",
  //       color: "yellow",
  //     },
  //     {
  //       name: "PHP",
  //       color: "purple",
  //     },
  //     {
  //       name: "PHPMyAdmin",
  //       color: "green",
  //     },
  //     {
  //       name: "SQL",
  //       color: "pink",
  //     },
  //   ],
  //   image: bookRentalProject,
  //   color: "#14b8a6",
  // },
  // {
  //   name: "Clinic Landing Page",
  //   description:
  //     "A responsive frontend-only clinic landing page built with React, Bootstrap, and SASS, adapted from a Frontend Mentor challenge.",
  //   tags: [
  //     {
  //       name: "React",
  //       color: "light-blue",
  //     },
  //     {
  //       name: "Bootstrap",
  //       color: "purple",
  //     },
  //     {
  //       name: "SASS",
  //       color: "pink",
  //     },
  //   ],
  //   image: clinicWebsite,
  //   color: "#6366f1",
  //   source_code_link: "https://github.com/Metwesh/health-clinics/",
  //   link: "https://metwesh.github.io/health-clinics/",
  // },
  // {
  //   name: "Budget calculator",
  //   description:
  //     "A CRUD-based React budget tracker with Bootstrap styling and localStorage support for data persistence.",
  //   tags: [
  //     {
  //       name: "React",
  //       color: "light-blue",
  //     },
  //     {
  //       name: "Bootstrap",
  //       color: "purple",
  //     },
  //     {
  //       name: "CSS",
  //       color: "blue",
  //     },
  //   ],
  //   image: budgetApp,
  //   color: "#1d4ed8",
  //   source_code_link: "https://github.com/Metwesh/budget-app/",
  //   link: "https://metwesh.github.io/budget-app/",
  // },
  // {
  //   name: "Face detection Web-App",
  //   description:
  //     "A face recognition app using the Clarifai API with a React frontend, Node.js backend, and PostgreSQL database.",
  //   tags: [
  //     {
  //       name: "React",
  //       color: "light-blue",
  //     },
  //     {
  //       name: "Bootstrap",
  //       color: "purple",
  //     },
  //     {
  //       name: "KnexJs",
  //       color: "pink",
  //     },
  //     {
  //       name: "SHA-Hashing",
  //       color: "blue",
  //     },
  //     {
  //       name: "NodeJs",
  //       color: "green",
  //     },
  //     {
  //       name: "Express",
  //       color: "light-green",
  //     },
  //     {
  //       name: "PostgreSQL",
  //       color: "dull-blue",
  //     },
  //   ],
  //   image: faceDetectApp,
  //   color: "#f97316",
  //   source_code_link: "https://github.com/Metwesh/face-recognition/",
  // },
  // {
  //   name: "Task Handler Web-App",
  //   description:
  //     "A secure task management app with React frontend, Node.js/Express backend, MongoDB, and JWT-based auth.",
  //   tags: [
  //     {
  //       name: "React",
  //       color: "light-blue",
  //     },
  //     {
  //       name: "Typescript",
  //       color: "blue",
  //     },
  //     {
  //       name: "Bootstrap",
  //       color: "purple",
  //     },
  //     {
  //       name: "NodeJs",
  //       color: "green",
  //     },
  //     {
  //       name: "Express",
  //       color: "light-green",
  //     },
  //     {
  //       name: "MongoDB",
  //       color: "dark-green",
  //     },
  //     {
  //       name: "SHA-Hashing",
  //       color: "pink",
  //     },
  //     {
  //       name: "JWT",
  //       color: "dull-blue",
  //     },
  //   ],
  //   image: taskHandlerApp,
  //   color: "#ec4899",
  //   source_code_link: "https://github.com/Metwesh/task-handler",
  // },
  {
    name: "SIDEUP Dashboard v2",
    description:
      "A PWA shipping dashboard with advanced caching, auth, analytics, and real-time features built using React and Redux.",
    tags: [
      {
        name: "React",
        color: "light-blue",
      },
      {
        name: "Bootstrap",
        color: "purple",
      },
      {
        name: "Axios",
        color: "light-purple",
      },
      {
        name: "React-Query",
        color: "pink",
      },
      {
        name: "PWA",
        color: "yellow",
      },
      {
        name: "Redux",
        color: "dark-purple",
      },
      {
        name: "Pusher",
        color: "red",
      },
      {
        name: "React-Router",
        color: "light-pink",
      },
      {
        name: "Mixpanel",
        color: "cyan",
      },
      {
        name: "Recharts",
        color: "orange",
      },
      {
        name: "i18n",
        color: "blue",
      },
      {
        name: "Vitest",
        color: "light-green",
      },
      {
        name: "React-Testing-Library",
        color: "green",
      },
    ],
    logo: sideupLogo,
    darkLogo: true,
    image: sideupDashboardV2,
    color: ACCENT_COLORS.blue,
  },
  {
    name: "Aman Accept Dashboard",
    description:
      "A payment dashboard showing real-time transactions and analytics built with React, Redux, and Recharts.",
    tags: [
      {
        name: "React",
        color: "light-blue",
      },
      {
        name: "Bootstrap",
        color: "purple",
      },
      {
        name: "Axios",
        color: "light-purple",
      },
      {
        name: "React-Query",
        color: "pink",
      },
      {
        name: "Redux",
        color: "dark-purple",
      },
      {
        name: "React-Router",
        color: "light-pink",
      },
      {
        name: "Recharts",
        color: "orange",
      },
      {
        name: "i18n",
        color: "blue",
      },
    ],
    logo: amanLogo,
    image: amanDashboard,
    color: ACCENT_COLORS.skyBlue,
    // link: "https://www.amanaccept.com/",
  },
  {
    name: "SIDEUP Dashboard v3",
    description:
      "An enhanced version of SIDEUP's dashboard with new features, analytics, and real-time updates, integrated into the existing system.",
    tags: [
      {
        name: "React",
        color: "light-blue",
      },
      {
        name: "Bootstrap",
        color: "purple",
      },
      {
        name: "Axios",
        color: "light-purple",
      },
      {
        name: "React-Query",
        color: "pink",
      },
      {
        name: "PWA",
        color: "yellow",
      },
      {
        name: "Redux",
        color: "dark-purple",
      },
      {
        name: "Pusher",
        color: "red",
      },
      {
        name: "React-Router",
        color: "light-pink",
      },
      {
        name: "Mixpanel",
        color: "cyan",
      },
      {
        name: "Recharts",
        color: "orange",
      },
      {
        name: "i18n",
        color: "blue",
      },
      {
        name: "Vitest",
        color: "light-green",
      },
      {
        name: "React-Testing-Library",
        color: "green",
      },
    ],
    logo: sideupLogo,
    darkLogo: true,
    image: sideupDashboardV3,
    color: ACCENT_COLORS.amber,
    link: "https://portal.sideup.co/login",
  },
  {
    name: "BELTONE Holding Site",
    description:
      "A multilingual, dynamic corporate site built with Next.js that integrates with an internal dashboard and supports SEO.",
    tags: [
      {
        name: "Next.js",
        color: "gray-white",
      },
      {
        name: "Bootstrap",
        color: "purple",
      },
      {
        name: "Axios",
        color: "light-purple",
      },
      {
        name: "SEO",
        color: "light-orange",
      },
      {
        name: "React-Router",
        color: "light-pink",
      },
      {
        name: "i18n",
        color: "blue",
      },
    ],
    logo: beltoneLogo,
    darkLogo: true,
    image: beltoneHolding,
    color: ACCENT_COLORS.yellow,
    link: "https://www.beltoneholding.com/",
  },
  {
    name: "D'Art Space Art Store",
    description:
      "A cross-platform e-commerce portal for an art store built with Angular and Ionic, featuring PWA support and charts.",
    tags: [
      {
        name: "Angular",
        color: "pink",
      },
      {
        name: "Ionic",
        color: "light-blue",
      },
      {
        name: "SASS",
        color: "red",
      },
      {
        name: "PWA",
        color: "yellow",
      },
      {
        name: "ChartJs",
        color: "green",
      },
    ],
    logo: dartSpaceLogo,
    image: dartSpace,
    color: ACCENT_COLORS.rose,
  },
  {
    name: "MARQ CRM",
    description:
      "A Next.js-based CRM for The MARQ communities, featuring advanced caching, analytics, and real-time updates.",
    tags: [
      {
        name: "TypeScript",
        color: "blue",
      },
      {
        name: "Next.js",
        color: "gray-white",
      },
      {
        name: "Shadcn UI",
        color: "purple",
      },
      {
        name: "TailwindCSS",
        color: "light-blue",
      },
      {
        name: "NextAuth",
        color: "pink",
      },
      {
        name: "Recharts",
        color: "orange",
      },
    ],
    logo: marqLogo,
    darkLogo: true,
    image: marqCrm,
    color: ACCENT_COLORS.violet,
  },
  {
    name: "Address Online",
    description:
      "A Next.js-powered e-commerce platform built for The Address Holding, featuring interactive maps, property listings, and multi-language support with advanced UI components.",
    tags: [
      {
        name: "Next.js",
        color: "gray-white",
      },
      {
        name: "TypeScript",
        color: "blue",
      },
      {
        name: "TailwindCSS",
        color: "light-blue",
      },
      {
        name: "Shadcn UI",
        color: "purple",
      },
      {
        name: "React Query",
        color: "light-purple",
      },
      {
        name: "next-intl",
        color: "dull-blue",
      },
      {
        name: "Mapbox GL",
        color: "green",
      },
      {
        name: "React Map GL",
        color: "orange",
      },
      {
        name: "Lucide React",
        color: "pink",
      },
      {
        name: "Embla Carousel",
        color: "yellow",
      },
    ],
    logo: tahLogo,
    image: addOn,
    color: ACCENT_COLORS.deepRose,
  },
  {
    name: "Address Online CMS",
    description:
      "A comprehensive admin dashboard built with Next.js featuring rich text editing, data visualization, file management, and advanced table functionality for property management.",
    tags: [
      {
        name: "Next.js",
        color: "gray-white",
      },
      {
        name: "TypeScript",
        color: "blue",
      },
      {
        name: "TailwindCSS",
        color: "light-blue",
      },
      {
        name: "Shadcn UI",
        color: "purple",
      },
      {
        name: "NextAuth",
        color: "pink",
      },
      {
        name: "React Query",
        color: "light-purple",
      },
      {
        name: "TanStack Table",
        color: "dull-blue",
      },
      {
        name: "Tiptap",
        color: "green",
      },
      {
        name: "Recharts",
        color: "orange",
      },
      {
        name: "React Hook Form",
        color: "yellow",
      },
      {
        name: "Zod",
        color: "red",
      },
    ],
    logo: tahLogo,
    image: addOnCms,
    color: ACCENT_COLORS.red,
  },
  {
    name: "BRGR Spin The Wheel",
    description:
      "A spin the wheel game built with Next.js, NextAuth, Prisma, and TailwindCSS, featuring authentication, database integration, and responsive design.",
    logo: brgrLogo,
    darkLogo: true,
    image: BRGRSpinTheWheel,
    color: ACCENT_COLORS.lightAmber,
    tags: [
      {
        name: "Next.js",
        color: "gray-white",
      },
      {
        name: "NextAuth",
        color: "pink",
      },
      {
        name: "Shadcn UI",
        color: "purple",
      },
      {
        name: "TailwindCSS",
        color: "light-blue",
      },
      {
        name: "PostgreSQL",
        color: "dull-blue",
      },
      {
        name: "Prisma",
        color: "green",
      },
      {
        name: "TypeScript",
        color: "blue",
      },
      {
        name: "React Hook Form",
        color: "light-purple",
      },
      {
        name: "Zod",
        color: "orange",
      },
    ],
  },
  {
    name: "Arady Misr Platform",
    description:
      "A Next.js-powered e-commerce platform for selling land and properties, featuring Google Maps integration, internationalization, and modern UI components for property listings.",
    tags: [
      {
        name: "Next.js",
        color: "gray-white",
      },
      {
        name: "TypeScript",
        color: "blue",
      },
      {
        name: "Shadcn UI",
        color: "purple",
      },
      {
        name: "TailwindCSS",
        color: "light-blue",
      },
      {
        name: "NextAuth",
        color: "pink",
      },
      {
        name: "React Query",
        color: "light-purple",
      },
      {
        name: "next-intl",
        color: "dull-blue",
      },
      {
        name: "Google Maps API",
        color: "green",
      },
      {
        name: "Lucide React",
        color: "orange",
      },
      {
        name: "Sonner",
        color: "yellow",
      },
    ],
    logo: aradyMisrLogo,
    darkLogo: true,
    image: aradyMisr,
    color: ACCENT_COLORS.green,
  },
  {
    name: "Arady Misr CMS",
    description:
      "A comprehensive content management system for the Arady Misr platform, featuring rich text editing, data tables, file management, and Google Maps integration with advanced admin capabilities.",
    tags: [
      {
        name: "Next.js",
        color: "gray-white",
      },
      {
        name: "TypeScript",
        color: "blue",
      },
      {
        name: "Shadcn UI",
        color: "purple",
      },
      {
        name: "TailwindCSS",
        color: "light-blue",
      },
      {
        name: "NextAuth",
        color: "pink",
      },
      {
        name: "React Query",
        color: "light-purple",
      },
      {
        name: "TanStack Table",
        color: "dull-blue",
      },
      {
        name: "Tiptap",
        color: "green",
      },
      {
        name: "Google Maps API",
        color: "orange",
      },
      {
        name: "React Hook Form",
        color: "yellow",
      },
      {
        name: "Zod",
        color: "red",
      },
    ],
    logo: aradyMisrLogo,
    darkLogo: true,
    image: aradyMisrCms,
    color: ACCENT_COLORS.cyan,
  },
  {
    name: "Willy's Website",
    description:
      "Customer-facing Next.js storefront for browsing menus, placing orders, and tracking deliveries, featuring interactive delivery maps, i18n support, and a modern component library.",
    tags: [
      {
        name: "Next.js",
        color: "gray-white",
      },
      {
        name: "TypeScript",
        color: "blue",
      },
      {
        name: "TailwindCSS",
        color: "light-blue",
      },
      {
        name: "Shadcn UI",
        color: "purple",
      },
      {
        name: "React Query",
        color: "light-purple",
      },
      {
        name: "i18n",
        color: "dull-blue",
      },
      {
        name: "Mapbox GL",
        color: "green",
      },
      {
        name: "Zustand",
        color: "orange",
      },
      {
        name: "React Hook Form",
        color: "yellow",
      },
      {
        name: "Zod",
        color: "red",
      },
    ],
    logo: willysLogo,
    image: willysWebsite,
    color: ACCENT_COLORS.red,
    link: "https://willys-kitchen.com/",
  },
  {
    name: "Willy's Admin",
    description:
      "Employee portal for tracking and monitoring customer orders, deliveries, and delivery zones, featuring drag-and-drop zone management, rich text editing, real-time charts, and Firebase integration.",
    tags: [
      {
        name: "Next.js",
        color: "gray-white",
      },
      {
        name: "TypeScript",
        color: "blue",
      },
      {
        name: "TailwindCSS",
        color: "light-blue",
      },
      {
        name: "Shadcn UI",
        color: "purple",
      },
      {
        name: "React Query",
        color: "light-purple",
      },
      {
        name: "TanStack Table",
        color: "dull-blue",
      },
      {
        name: "Recharts",
        color: "orange",
      },
      {
        name: "React Hook Form",
        color: "yellow",
      },
      {
        name: "Zod",
        color: "red",
      },
      {
        name: "Firebase",
        color: "pink",
      },
      {
        name: "Mapbox GL",
        color: "green",
      },
      {
        name: "DnD Kit",
        color: "cyan",
      },
      {
        name: "Tiptap",
        color: "light-green",
      },
    ],
    logo: willysLogo,
    image: willysAdmin,
    color: ACCENT_COLORS.indigo,
  },
  {
    name: "E& CIM Portal v2",
    description:
      "Modernization of a legacy Java Server Faces enterprise portal to a React micro-frontend architecture, featuring a Backend For Frontend pattern, microservices integration, and advanced data visualization.",
    tags: [
      {
        name: "React",
        color: "gray-white",
      },
      {
        name: "TypeScript",
        color: "blue",
      },
      {
        name: "TailwindCSS",
        color: "light-blue",
      },
      {
        name: "Shadcn UI",
        color: "purple",
      },
      {
        name: "React Query",
        color: "light-purple",
      },
      {
        name: "TanStack Table",
        color: "dull-blue",
      },
      {
        name: "Recharts",
        color: "orange",
      },
      {
        name: "React Hook Form",
        color: "yellow",
      },
      {
        name: "Zod",
        color: "red",
      },
      {
        name: "Micro-frontends",
        color: "pink",
      },
      {
        name: "Microservices",
        color: "green",
      },
      {
        name: "BFF",
        color: "dark-purple",
      },
    ],
    logo: eAndLogo,
    image: eAndConfidential,
    color: ACCENT_COLORS.maroon,
  },
];
