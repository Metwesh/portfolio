import { actLogo, eAndLogo, sideupWhiteLogo, tahLogo } from "../assets";
import { ACCENT_COLORS } from "./misc";

export const EXPERIENCES = [
  {
    title: "Senior Software Developer",
    company: "E& (Etisalat UAE)",
    abbreviation: "E&",
    link: "https://www.eand.com/",
    icon: eAndLogo,
    date: "Dec 2025 - Present",
    color: ACCENT_COLORS.red,
    points: [
      {
        title: "Portal modernization",
        subtitle:
          "Led migration of a 15-year-old Java Server Faces CIM portal to React with micro-frontend architecture, each module backed by a dedicated BFF microservice.",
      },
      {
        title: "Component library overhaul",
        subtitle:
          "Shrunk a bloated internal component library from 50 MB to under 5 MB by eliminating redundancy and dead code, preserving 100% of original functionality.",
      },
      {
        title: "Algorithm optimization",
        subtitle:
          "Optimized cell selection logic from O(n) to O(1), replacing linear scans with direct index lookups in interactive data grids.",
      },
      {
        title: "Technical leadership",
        subtitle:
          "Drove React adoption within a team transitioning from a legacy JSF codebase, establishing patterns and standards that accelerated delivery across all micro-frontend modules.",
      },
    ],
  },
  {
    title: "Frontend Engineer",
    company: "The Address Holding",
    abbreviation: "TAH",
    link: "https://theaddressholding.com/",
    icon: tahLogo,
    date: "Nov 2024 - Nov 2025",
    color: ACCENT_COLORS.yellow,
    points: [
      {
        title: "Internal system development",
        subtitle:
          "Built and maintained internal CRMs and HRMs using Next.js, optimizing frontend performance to support 2000+ active users / daily administrative workflows.",
      },
      {
        title: "Project ownership",
        subtitle:
          "Spearheaded end-to-end development of a high-traffic property listing platform, authoring over 85% of production code for over 10,000+ active property listings.",
      },
      {
        title: "SEO optimization",
        subtitle:
          "Implemented Next.js SSR and dynamic routing strategies, driving a 35% increase in organic traffic and improving Core Web Vitals to a clean 100.",
      },
      {
        title: "Legacy modernization",
        subtitle:
          "Refactored a legacy Vue.js codebase to integrate with modern REST APIs, reducing client-side bug reports by 20% and ensuring seamless platform stability.",
      },
    ],
  },
  {
    title: "Senior Frontend Engineer",
    company: "SIDEUP",
    abbreviation: "SIDEUP",
    link: "https://eg.sideup.co/",
    icon: sideupWhiteLogo,
    date: "Nov 2023 - Oct 2024",
    color: ACCENT_COLORS.magenta,
    points: [
      {
        title: "Mentorship & technical leadership",
        subtitle:
          "Mentored junior engineers, establishing team-wide code review standards and TypeScript conventions that elevated overall code quality.",
      },
      {
        title: "Hands-on architecture",
        subtitle:
          "Designed complex dashboard features using React, Redux Toolkit, and state management to support real-time logistics tracking.",
      },
      {
        title: "Stakeholder collaboration",
        subtitle:
          "Partnered with product owners and backend engineers to translate business requirements into responsive UI components, ensuring seamless API integrations.",
      },
      {
        title: "Process & CI/CD optimization",
        subtitle:
          "Streamlined frontend workflows by setting up automated linting, pre-commit hooks, and CI/CD testing pipelines, reducing pull request review time.",
      },
    ],
  },
  {
    title: "Frontend Engineer",
    company: "SIDEUP",
    abbreviation: "SIDEUP",
    link: "https://eg.sideup.co/",
    icon: sideupWhiteLogo,
    date: "Feb 2023 - Oct 2023",
    color: ACCENT_COLORS.pink,
    points: [
      {
        title: "B2C dashboard development",
        subtitle:
          "Led frontend implementation of a next-generation shipping dashboard using React, TypeScript, and Bootstrap.",
      },
      {
        title: "UX/UI excellence",
        subtitle:
          "Partnered with designers to deliver intuitive, accessible interfaces.",
      },
      {
        title: "Quality assurance",
        subtitle:
          "Collaborated with QA to execute thorough testing, debugging, and performance optimization.",
      },
      {
        title: "Adaptability",
        subtitle:
          "Quickly mastered Next.js and Material UI to modernize legacy features and deliver consistent improvements.",
      },
    ],
  },
  {
    title: "Interface Specialist",
    company: "Advanced Computer Technologies (ACT)",
    abbreviation: "ACT",
    link: "https://www.act.eg/",
    icon: actLogo,
    date: "Feb 2022 - Jan 2023",
    color: ACCENT_COLORS.orange,
    points: [
      {
        title: "System Integration Expertise",
        subtitle:
          "Integrated digital subsystems like Door Lock Systems, IPTV, and POS with Property Management Systems for renowned hotel chains, facilitating seamless operations.",
      },
      {
        title: "Agile Collaboration",
        subtitle:
          "Collaborated in agile settings, prioritizing and addressing stakeholder requirements, ensuring effective communication and alignment.",
      },
      {
        title: "Remote Troubleshooting",
        subtitle:
          "Analyzed logs and error codes to troubleshoot issues remotely, minimizing downtime and ensuring prompt issue resolution.",
      },
      {
        title: "Project Coordination Expertise",
        subtitle:
          "Orchestrated the integration of Oracle's Opera Web Services for 480+ Intercontinental Holiday Inn Group (IHG) hotels globally within four months, demonstrating adeptness in coordinating complex projects with multiple stakeholders and ensuring timely execution.",
      },
    ],
  },
  {
    title: "Freelance Frontend Engineer",
    company: "Self-Employed",
    abbreviation: "FREELANCE",
    link: "",
    icon: "/favicons/logo-no-background.svg",
    date: "Jul 2021 - Present",
    color: ACCENT_COLORS.cyan,
    points: [
      {
        title: "Multi-industry project delivery",
        subtitle:
          "Delivered production Next.js and Angular platforms across industries — a payment operations dashboard (Aman Accept), a blockchain-based art e-commerce site (D'Art Space), and SEO-optimized corporate/e-commerce sites (Beltone, Willy's Kitchen).",
      },
      {
        title: "Timely delivery",
        subtitle:
          "Delivered client projects using Next.js, Vue, Angular, and TypeScript, with focus on scalability and SEO.",
      },
      {
        title: "Team collaboration",
        subtitle:
          "Worked closely with designers and backend teams to deliver pixel-perfect, responsive UIs.",
      },
      {
        title: "Client relations",
        subtitle:
          "Maintained ongoing client partnerships through reliable delivery and technical guidance.",
      },
    ],
  },
];
