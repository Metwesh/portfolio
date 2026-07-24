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
    date: "Nov 2024 - Dec 2025",
    color: ACCENT_COLORS.yellow,
    points: [
      {
        title: "Internal system development",
        subtitle:
          "Built and maintained CRMs and HRMs using Next.js, focusing on performance, scalability, and maintainability.",
      },
      {
        title: "Project ownership",
        subtitle:
          "Spearheaded development of a property listing e-commerce website, authoring 85%+ of the production code.",
      },
      {
        title: "SEO optimization",
        subtitle:
          "Implemented server-side rendering and dynamic routing to maximize organic visibility and meet SEO best practices.",
      },
      {
        title: "Cross-functional collaboration",
        subtitle:
          "Worked closely with designers and backend teams to ensure seamless UI/UX and reliable system integration.",
      },
    ],
  },
  {
    title: "Senior Frontend Engineer",
    company: "SIDEUP",
    abbreviation: "SIDEUP",
    link: "https://eg.sideup.co/",
    icon: sideupWhiteLogo,
    date: "Dec 2023 - Nov 2024",
    color: ACCENT_COLORS.magenta,
    points: [
      {
        title: "Led and mentored junior engineers",
        subtitle:
          "Cultivated a collaborative environment, fostering skill development and productivity.",
      },
      {
        title: "Hands-on coding leadership",
        subtitle:
          "Prioritized efficient task distribution, tackled complex features, ensuring robust code quality.",
      },
      {
        title: "Stakeholder collaboration",
        subtitle:
          "Provided valuable insights, aligning dashboard direction with user needs and business objectives.",
      },
      {
        title: "Process optimization",
        subtitle:
          "Implemented initiatives to streamline workflows, enhance productivity, and ensure code efficiency and reliability.",
      },
    ],
  },
  {
    title: "Frontend Engineer",
    company: "SIDEUP",
    abbreviation: "SIDEUP",
    link: "https://eg.sideup.co/",
    icon: sideupWhiteLogo,
    date: "Feb 2023 - Dec 2023",
    color: ACCENT_COLORS.pink,
    points: [
      {
        title: "Led frontend development",
        subtitle:
          "Spearheaded the creation of a cutting-edge B2C shipping dashboard using React, TypeScript, and Bootstrap, ensuring seamless integration with backend systems.",
      },
      {
        title: "Ensured optimal UX/UI",
        subtitle:
          "Collaborated with UX designers to create an intuitive design, enhancing user satisfaction and usability.",
      },
      {
        title: "Maintained system stability",
        subtitle:
          "Partnered with QA to conduct rigorous testing and debugging, ensuring high reliability and performance.",
      },
      {
        title: "Adapted to new tech",
        subtitle:
          "Quickly mastered Next.js and Material UI to maintain and improve previous versions, demonstrating adeptness in learning new technologies.",
      },
    ],
  },
  {
    title: "Interface Specialist",
    company: "Advanced Computer Technologies (ACT)",
    abbreviation: "ACT",
    link: "https://www.act.eg/",
    icon: actLogo,
    date: "Feb 2022 - Feb 2023",
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
];
