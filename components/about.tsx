"use client"

import React from 'react'
import SectionHeading from './section-heading'
import { motion } from "framer-motion";
import { useSectionInView } from '@/lib/hooks';


export default function About() {
  const { ref } = useSectionInView("About");

  return (
    <motion.section
    ref={ref}
    className="mb-28 max-w-[45rem] text-center leading-8 sm:mb-40 scroll-mt-28"
    initial={{ opacity: 0, y: 100 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.175 }}
    id="About"
    >
        <SectionHeading>About me</SectionHeading>
        <p className="mb-3">
          我是 <span className="font-medium">软件工程专业</span>的学生，
          目前在学校 <span className="font-medium">ACM 实验室</span>学习算法，
          并参与 <span className="italic">CTF 实验室</span>的渗透测试研究。
          我熟悉 <span className="font-medium">C、C++、Java 和 Python</span>，
          掌握 Dart 和 Flutter 进行跨平台开发。
          <span className="italic">我最喜欢的是</span>解决各种技术难题。
          我曾开发多个计算机相关项目，如
          <span className="font-medium">游戏开发、AI 个人网站搭建</span>等，
          并在<span className="underline">蓝桥杯</span>等竞赛中获奖。
          我希望通过完整的全栈项目提升实战经验，在实践中不断探索和精进技术。
        </p>

        <p>
          <span className="italic">在工作之余</span>，
          我喜欢玩电子游戏、看电影和打球。
          我也热衷于<span className="font-medium">学习新事物</span>，
          目前正在研究<span className="font-medium">乐理和心理学</span>。
        </p>
    </motion.section>
  )
}
