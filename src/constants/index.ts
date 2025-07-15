import {
  AWS,
  Algorithms,
  Angular,
  ArtificialIntelligence,
  Azure,
  Bash,
  BootStrap,
  C,
  CICD,
  CSS3,
  DataStructures,
  Docker,
  Express,
  Figma,
  Firebase,
  Git,
  Github,
  GoogleCloud,
  HTML5,
  Heroku,
  Ionic,
  JavaScript,
  Jira,
  MachineLearning,
  MongoDB,
  MySQL,
  NextJS,
  NodeJS,
  PHP,
  PostgreSQL,
  Python,
  RESTfulAPIs,
  React,
  Redis,
  SASS,
  Serverless,
  Threejs,
  TypeScript,
  act,
  addOnCms,
  algorithms,
  amanDashboard,
  bachelorsDegree,
  beltoneHolding,
  bookRentalProject,
  budgetApp,
  cLanguage,
  cisa,
  clinicWebsite,
  completeWebDev,
  dartSpace,
  faceDetectApp,
  jsCert,
  ossa,
  pythonDev,
  seniorWebDev,
  sideupDashboardV2,
  sideupDashboardV3,
  sideupWhite,
  tah,
  taskHandlerApp,
  addOn,
  aradyMisr,
  aradyMisrCms,
  marqCrm,
} from "../assets";

const navLinks = [
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#tech-stacks", label: "Tech Stacks" },
  { href: "#certificates", label: "Certificates" },
];

const technologies = [
  {
    icon: HTML5,
    name: "HTML5",
  },
  {
    icon: CSS3,
    name: "CSS3",
  },
  {
    icon: JavaScript,
    name: "JavaScript",
  },
  {
    icon: TypeScript,
    name: "TypeScript",
  },
  {
    icon: SASS,
    name: "SASS",
  },
  {
    icon: BootStrap,
    name: "BootStrap",
  },
  {
    icon: React,
    name: "React",
  },
  {
    icon: Angular,
    name: "Angular",
  },
  {
    icon: NextJS,
    name: "NEXTJS",
  },
  {
    icon: Jira,
    name: "Jira",
  },
  {
    icon: Ionic,
    name: "Ionic",
  },
  {
    icon: Figma,
    name: "Figma",
  },
  {
    icon: Threejs,
    name: "Threejs",
  },
  {
    icon: NodeJS,
    name: "NodeJS",
  },
  {
    icon: Express,
    name: "Express",
  },
  {
    icon: PHP,
    name: "PHP",
  },
  {
    icon: C,
    name: "C",
  },
  {
    icon: Python,
    name: "Python",
    wip: true,
  },
  {
    icon: Serverless,
    name: "Serverless",
  },
  {
    icon: RESTfulAPIs,
    name: "RESTfulAPIs",
  },
  {
    icon: MachineLearning,
    name: "Machine Learning",
    wip: true,
  },
  {
    icon: ArtificialIntelligence,
    name: "Artificial Intelligence",
    wip: true,
  },
  {
    icon: DataStructures,
    name: "Data Structures",
  },
  {
    icon: Algorithms,
    name: "Algorithms",
  },
  {
    icon: MySQL,
    name: "MySQL",
  },
  {
    icon: PostgreSQL,
    name: "PostgreSQL",
  },
  {
    icon: MongoDB,
    name: "MongoDB",
  },
  {
    icon: Redis,
    name: "Redis",
  },
  {
    icon: Docker,
    name: "Docker",
  },
  {
    icon: Git,
    name: "Git",
  },
  {
    icon: Github,
    name: "GitHub",
  },
  {
    icon: Firebase,
    name: "Firebase",
  },
  {
    icon: AWS,
    name: "AWS",
    wip: true,
  },
  {
    icon: Azure,
    name: "Azure",
    wip: true,
  },
  {
    icon: GoogleCloud,
    name: "Google Cloud",
    wip: true,
  },
  {
    icon: Heroku,
    name: "Heroku",
  },
  {
    icon: Bash,
    name: "Bash",
  },
  {
    icon: CICD,
    name: "CI/CD",
  },
];

const experiences = [
  {
    title: "Frontend Engineer",
    company: "The Address Holding",
    link: "https://theaddressholding.com/",
    icon: tah,
    date: "Nov 2024 - Present",
    color: "#fde047",
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
    link: "https://eg.sideup.co/",
    icon: sideupWhite,
    date: "Dec 2023 - Nov 2024",
    color: "#ff00cc",
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
    link: "https://eg.sideup.co/",
    icon: sideupWhite,
    date: "Feb 2023 - Dec 2023",
    color: "#ec4899",
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
    link: "https://www.act.eg/",
    icon: act,
    date: "Feb 2022 - Feb 2023",
    color: "#ff9900",
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

const projects = [
  {
    name: "Book Rental Dashboard",
    description:
      "A full-stack online bookstore built for a graduation project using PHP, SQL, and HTML/CSS/JS. Project files were lost due to hard drive failure.",
    tags: [
      {
        name: "HTML",
        color: "orange",
      },
      {
        name: "CSS",
        color: "blue",
      },
      {
        name: "JS",
        color: "yellow",
      },
      {
        name: "PHP",
        color: "purple",
      },
      {
        name: "PHPMyAdmin",
        color: "green",
      },
      {
        name: "SQL",
        color: "pink",
      },
    ],
    image: bookRentalProject,
    color: "#14b8a6",
  },
  {
    name: "Clinic Landing Page",
    description:
      "A responsive frontend-only clinic landing page built with React, Bootstrap, and SASS, adapted from a Frontend Mentor challenge.",
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
        name: "SASS",
        color: "pink",
      },
    ],
    image: clinicWebsite,
    color: "#6366f1",
    source_code_link: "https://github.com/Metwesh/health-clinics/",
    link: "https://metwesh.github.io/health-clinics/",
  },
  {
    name: "Budget calculator",
    description:
      "A CRUD-based React budget tracker with Bootstrap styling and localStorage support for data persistence.",
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
        name: "CSS",
        color: "blue",
      },
    ],
    image: budgetApp,
    color: "#1d4ed8",
    source_code_link: "https://github.com/Metwesh/budget-app/",
    link: "https://metwesh.github.io/budget-app/",
  },
  {
    name: "Face detection Web-App",
    description:
      "A face recognition app using the Clarifai API with a React frontend, Node.js backend, and PostgreSQL database.",
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
        name: "KnexJs",
        color: "pink",
      },
      {
        name: "SHA-Hashing",
        color: "blue",
      },
      {
        name: "NodeJs",
        color: "green",
      },
      {
        name: "Express",
        color: "light-green",
      },
      {
        name: "PostgreSQL",
        color: "dull-blue",
      },
    ],
    image: faceDetectApp,
    color: "#f97316",
    source_code_link: "https://github.com/Metwesh/face-recognition/",
  },
  {
    name: "Task Handler Web-App",
    description:
      "A secure task management app with React frontend, Node.js/Express backend, MongoDB, and JWT-based auth.",
    tags: [
      {
        name: "React",
        color: "light-blue",
      },
      {
        name: "Typescript",
        color: "blue",
      },
      {
        name: "Bootstrap",
        color: "purple",
      },
      {
        name: "NodeJs",
        color: "green",
      },
      {
        name: "Express",
        color: "light-green",
      },
      {
        name: "MongoDB",
        color: "dark-green",
      },
      {
        name: "SHA-Hashing",
        color: "pink",
      },
      {
        name: "JWT",
        color: "dull-blue",
      },
    ],
    image: taskHandlerApp,
    color: "#ec4899",
    source_code_link: "https://github.com/Metwesh/task-handler",
  },
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
        name: "NextJS",
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
  },
  {
    name: "Address Online",
    description:
      "A Next.js-powered e-commerce platform built for The Address Holding, enabling users to explore and purchase residential and commercial properties.",
    image: addOn,
    color: "#ec4899",
  },
  {
    name: "Address Online CMS",
    description:
      "An internal dashboard built with Next.js for managing listings, content, and user activity on the Address Online property platform.",
    image: addOnCms,
    color: "#ff9900",
  },
  {
    name: "Arady Misr Platform",
    description:
      "A Next.js-based real estate marketplace specialized in land plots, offering users a seamless experience to browse and invest in land opportunities.",
    image: aradyMisr,
    color: "#22c55e",
  },
  {
    name: "Arady Misr CMS",
    description:
      "A content and listing management system for the Arady Misr platform, built with Next.js to support admin workflows and data control.",
    image: aradyMisrCms,
    color: "#00eaff",
  },
];

const getBasePath = () => (import.meta.env.DEV ? "" : "/threejs-portfolio");

const certificates = [
  {
    title: "Bachelor's degree",
    icon: bachelorsDegree,
    issuer: "AAST",
    color: "#4267B2",
    year: 2021,
    link: `${getBasePath()}/documents/English certificate.pdf`,
  },
  {
    title: "Complete Web Dev",
    icon: completeWebDev,
    issuer: "Zero to Mastery",
    color: "#ff00cc",
    year: 2022,
    link: `${getBasePath()}/documents/Certificate-of-completion-for-complete-web-developer-in-2020-zero-to-mastery.pdf`,
  },
  {
    title: "Junior To Senior Web Dev",
    icon: seniorWebDev,
    issuer: "Udemy",
    color: "#ff9900",
    year: 2022,
    link: "https://www.udemy.com/certificate/UC-ebbe19f2-8c53-4d44-9098-b7662a4954b3/",
  },
  {
    title: "C Language Course",
    icon: cLanguage,
    issuer: "Udemy",
    color: "#006400",
    year: 2022,
    link: "https://www.udemy.com/certificate/UC-e3bbec7e-1d48-42f4-99ec-9cc0357d5575/",
  },
  {
    title: "Algorithms & Data Structures",
    icon: algorithms,
    issuer: "Udemy",
    color: "#00eaff",
    year: 2022,
    link: "https://www.udemy.com/certificate/UC-1ecabe2a-7108-4462-8ae5-09085e501c2d/",
  },
  {
    title: "OSSA",
    icon: ossa,
    issuer: "Oracle",
    color: "#7c3aed",
    year: 2022,
    link: `${getBasePath()}/documents/OSSA.pdf`,
  },
  {
    title: "CISA",
    icon: cisa,
    issuer: "Oracle",
    color: "#ef4444",
    year: 2022,
    link: `${getBasePath()}/documents/CISA.pdf`,
  },
  {
    title: "JS Cert",
    icon: jsCert,
    issuer: "Codingame",
    color: "#fde047",
    year: 2022,
    link: "https://www.codingame.com/certification/_qSkPD6K1GYUn4FIDBnGFg",
  },
  {
    title: "Python Developer",
    icon: pythonDev,
    issuer: "Udemy",
    color: "#14b8a6",
    year: 2024,
    link: "https://www.udemy.com/certificate/UC-2cb10543-7b97-40aa-bd2e-6341de1b1970/",
  },
];

const accentColors = [
  "#4267B2",
  "#ff00cc",
  "#ff9900",
  "#00eaff",
  "#7c3aed",
  "#ef4444",
  "#fde047",
  "#14b8a6",
  "#6366f1",
  "#1d4ed8",
  "#f97316",
  "#ec4899",
  "#8b5cf6",
  "#22c55e",
  "#f59e0b",
  "#0ea5e9",
  "#e11d48",
];

export {
  accentColors,
  certificates,
  experiences,
  navLinks,
  projects,
  technologies,
};
