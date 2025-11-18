import {
  algorithms,
  bachelorsDegree,
  cisa,
  cLanguage,
  completeWebDev,
  jsCert,
  ossa,
  pythonDev,
  seniorWebDev,
} from "../assets";
import { accentColors } from "./misc";

const getBasePath = () => (import.meta.env.DEV ? "" : "/portfolio");

export const certificates = [
  {
    title: "Bachelor's degree",
    icon: bachelorsDegree,
    issuer: "AAST",
    color: accentColors.blue,
    year: 2021,
    link: `${getBasePath()}/documents/English certificate.pdf`,
  },
  {
    title: "Complete Web Dev",
    icon: completeWebDev,
    issuer: "Zero to Mastery",
    color: accentColors.magenta,
    year: 2022,
    link: `${getBasePath()}/documents/Certificate-of-completion-for-complete-web-developer-in-2020-zero-to-mastery.pdf`,
  },
  {
    title: "Junior To Senior Web Dev",
    icon: seniorWebDev,
    issuer: "Udemy",
    color: accentColors.orange,
    year: 2022,
    link: "https://www.udemy.com/certificate/UC-ebbe19f2-8c53-4d44-9098-b7662a4954b3/",
  },
  {
    title: "C Language Course",
    icon: cLanguage,
    issuer: "Udemy",
    color: accentColors.green,
    year: 2022,
    link: "https://www.udemy.com/certificate/UC-e3bbec7e-1d48-42f4-99ec-9cc0357d5575/",
  },
  {
    title: "Algorithms & Data Structures",
    icon: algorithms,
    issuer: "Udemy",
    color: accentColors.cyan,
    year: 2022,
    link: "https://www.udemy.com/certificate/UC-1ecabe2a-7108-4462-8ae5-09085e501c2d/",
  },
  {
    title: "OSSA",
    icon: ossa,
    issuer: "Oracle",
    color: accentColors.violet,
    year: 2022,
    link: `${getBasePath()}/documents/OSSA.pdf`,
  },
  {
    title: "CISA",
    icon: cisa,
    issuer: "Oracle",
    color: accentColors.red,
    year: 2022,
    link: `${getBasePath()}/documents/CISA.pdf`,
  },
  {
    title: "JS Cert",
    icon: jsCert,
    issuer: "Codingame",
    color: accentColors.yellow,
    year: 2022,
    link: "https://www.codingame.com/certification/_qSkPD6K1GYUn4FIDBnGFg",
  },
  {
    title: "Python Developer",
    icon: pythonDev,
    issuer: "Udemy",
    color: accentColors.teal,
    year: 2024,
    link: "https://www.udemy.com/certificate/UC-2cb10543-7b97-40aa-bd2e-6341de1b1970/",
  },
];
