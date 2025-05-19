import React from "react";
import { CgWorkAlt } from "react-icons/cg";
import { FaReact } from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";
import corpcommentImg from "@/public/corpcomment.png";
import rmtdevImg from "@/public/rmtdev.png";
import wordanalyticsImg from "@/public/wordanalytics.png";
import { BsBriefcase } from "react-icons/bs";

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
    title: "编程启蒙",
    location: "河南南阳",
    description:
      "第一次接触编程，独立完成了人机对战五子棋，并在算法竞赛中获得了第一个奖项，由此开启了编程之路。",
    icon: React.createElement(LuGraduationCap),
    date: "2023",
  },
  {
    title: "探索阶段",
    location: "河南南阳",
    description:
      "搭建了个人第一个 AI 网站，使用 Flutter 开发了跨平台应用，开始学习 CTF 与网络安全基础，并接触全栈开发。",
    icon: React.createElement(CgWorkAlt),
    date: "2023 - 2024",
  },
  {
    title: "项目实战与深入学习",
    location: "河南南阳",
    description:
      "2024 至今，独立完成了 Sky-takeaway 外卖平台（基于 SpringBoot）与 GPT3-LLM 模型优化项目，涵盖前后端开发、大模型训练与部署等内容，全面提升了工程实践与理论能力。",
    icon: React.createElement(FaReact),
    date: "2024 - 2025",
  },  
  {
    title: "持续进阶",
    location: "河南南阳",
    description:
      "目前正深入学习全栈开发与安全方向，持续迭代个人项目，不断拓展技术广度与深度。",
    icon: React.createElement(BsBriefcase),
    date: "2024 - 至今",
  },
] as const;

export const projectsData = [
  {
    title: "一个简单的个人网站",
    description:
      "我开发的个人网站基于 Next.js 13，使用 App Router、Server Actions、Tailwind CSS 等构建，UI 全部纯手写，无任何模板或组件库。支持明暗模式、响应式设计与邮件发送，功能完整、体验流畅。",
    tags: ["React", "Next.js", "TypeScript", "Tailwind", "Framer","React.Email","Resend"],
    imageUrl: wordanalyticsImg,
  },
  {
    title: "Sky-takeaway",
    description:
      "一个功能完善的外卖小程序，基于 SpringBoot 构建，采用前后端分离和分模块架构，包含用户管理、商家管理、订单处理、商品管理、微信支付等核心功能。",
    tags: [
      "SpringBoot", "SpringMVC", "MyBatis", "Redis", "WebSocket", "Vue.js", "Element UI"
    ],
    imageUrl: corpcommentImg,
  },
  {
    title: "GPT3-LLM",
    description:
      "高效轻量的大模型，借助 GPT-2/GPT-3 架构，仅用 400 亿 tokens 即在 HellaSwag 上追平 GPT-3 (124M) 准确率，训练效率提升近 10 倍。",
    tags: ["Python", "LLM", "NLP"],
    imageUrl: rmtdevImg,
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
  "SpringBoot",
  "MyBatis",
  "Redis",
  "SpringMVC",
  "WebSocket",
  "NLP"
] as const;