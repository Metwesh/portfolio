import {
  addOn,
  addOnCms,
  amanDashboard,
  aradyMisr,
  aradyMisrCms,
  beltoneHolding,
  // bookRentalProject,
  // budgetApp,
  // clinicWebsite,
  dartSpace,
  // faceDetectApp,
  marqCrm,
  sideupDashboardV2,
  sideupDashboardV3,
  BRGRSpinTheWheel,
  // taskHandlerApp,
} from "../assets";

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
  color: HexColor; // Hex color for the project card
  tags?: ProjectTag[];
  source_code_link?: string;
  link?: string;
}

export const projects: readonly Project[] = [
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
    image: sideupDashboardV2,
    color: "#8b5cf6",
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
    image: amanDashboard,
    color: "#22c55e",
    link: "https://www.amanaccept.com/",
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
    image: sideupDashboardV3,
    color: "#f59e0b",
  },
  {
    name: "BELTONE Holding Company Site",
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
    image: beltoneHolding,
    color: "#0ea5e9",
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
    image: dartSpace,
    color: "#e11d48",
  },
  {
    name: "MARQ CRM",
    description:
      "A Next.js-based CRM for The MARQ communities, featuring advanced caching, analytics, and real-time updates.",
    image: marqCrm,
    color: "#7c3aed",
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
  },
  {
    name: "Address Online",
    description:
      "A Next.js-powered e-commerce platform built for The Address Holding, featuring interactive maps, property listings, and multi-language support with advanced UI components.",
    image: addOn,
    color: "#ec4899",
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
  },
  {
    name: "Address Online CMS",
    description:
      "A comprehensive admin dashboard built with Next.js featuring rich text editing, data visualization, file management, and advanced table functionality for property management.",
    image: addOnCms,
    color: "#ff9900",
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
  },
  {
    name: "BRGR Spin The Wheel",
    description:
      "A spin the wheel game built with Next.js, NextAuth, Prisma, and TailwindCSS, featuring authentication, database integration, and responsive design.",
    image: BRGRSpinTheWheel,
    color: "#22c55e",
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
    image: aradyMisr,
    color: "#3b82f6",
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
  },
  {
    name: "Arady Misr CMS",
    description:
      "A comprehensive content management system for the Arady Misr platform, featuring rich text editing, data tables, file management, and Google Maps integration with advanced admin capabilities.",
    image: aradyMisrCms,
    color: "#00eaff",
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
  },
];
