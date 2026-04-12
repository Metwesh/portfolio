import { actLogo, sideupWhiteLogo, tahLogo } from "../assets";
import { accentColors } from "./misc";

export const experiences = [
  {
    title: "Frontend Engineer",
    company: "The Address Holding",
    abbreviation: "TAH",
    link: "https://theaddressholding.com/",
    icon: tahLogo,
    date: "Nov 2024 - Present",
    color: accentColors.yellow,
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
    color: accentColors.magenta,
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
    color: accentColors.pink,
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
    color: accentColors.orange,
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
