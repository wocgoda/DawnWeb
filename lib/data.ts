import React from "react";
import { CgWorkAlt } from "react-icons/cg";
import { FaReact } from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";
import corpcommentImg from "@/public/corpcomment.png";
import rmtdevImg from "@/public/rmtdev.png";
import wordanalyticsImg from "@/public/wordanalytics.png";

export const links = [
  {
    name: "Home",
    hash: "#Home",
  },
  {
    name: "About",
    hash: "#About",
  },
  {
    name: "Project",
    hash: "#Project",
  },
  {
    name: "Skills",
    hash: "#Skills",
  },
  {
    name: "Experience",
    hash: "#Experience",
  },
  {
    name: "Contact",
    hash: "#Contact",
  },
] as const;

export const experiencesData = [
  {
    title: "初学者",
    location: "河南南阳",
    description:
      "第一次接触到编程并开始学习，写出第一个程序（人机对战五子棋），并在算法竞赛拿下第一次奖项",
    icon: React.createElement(LuGraduationCap),
    date: "2023",
  },
  {
    title: "略知一二",
    location: "河南南阳",
    description:
      "搭建人生中第一个AI网站，用Flutter做出第一个跨平台应用，学习CTF相关知识，并开始接触到全栈开发",
    icon: React.createElement(CgWorkAlt),
    date: "2023 - 2024",
  },
  {
    title: "求学者",
    location: "河南南阳",
    description:
      "我现在是一名“伪”全栈开发人员,我将继续学习不断尝试做出更多努力。",
    icon: React.createElement(FaReact),
    date: "2023 - 现在",
  },
] as const;

export const projectsData = [
  {
    title: "CorpComment",
    description:
      "I worked as a full-stack developer on this startup project for 2 years. Users can give public feedback to companies.",
    tags: ["React", "Next.js", "MongoDB", "Tailwind", "Prisma"],
    imageUrl: corpcommentImg,
  },
  {
    title: "rmtDev",
    description:
      "Job board for remote developer jobs. I was the front-end developer. It has features like filtering, sorting and pagination.",
    tags: ["React", "TypeScript", "Next.js", "Tailwind", "Redux"],
    imageUrl: rmtdevImg,
  },
  {
    title: "Word Analytics",
    description:
      "A public web app for quick analytics on text. It shows word count, character count and social media post limits.",
    tags: ["React", "Next.js", "SQL", "Tailwind", "Framer"],
    imageUrl: wordanalyticsImg,
  },
] as const;

export const skillsData = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Git",
  "C/C++",
  "LLM",
  "Flutter",
  "Dart",
  "MySQL",
  "JavaSE",
  "JavaEE",
  "3DMAX",
  "Python",
  "Sql Sever",
  "Framer Motion",
  "Kali Linux",
  "Linux",
  "Tailwind",
  "Vue3",
  "Wire Shark",
  "Qt",
  "BurpSuite",
] as const;