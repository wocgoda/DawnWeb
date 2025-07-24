import { projectsData } from "@/lib/data";
import { useRef } from "react";
import { motion, useTransform, useScroll } from "framer-motion";
import Image from 'next/image';


type ProjectProps = (typeof projectsData)[number];

export default function Project({ title, description, tags, imageUrl }:
    ProjectProps) {
        const ref = useRef<HTMLDivElement>(null);
        const { scrollYProgress } = useScroll({
            target: ref,
            offset: ["0 1", "1.33 1"],
        });

    const scaleProgess = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
    const opacityProgess = useTransform(scrollYProgress, [0, 1], [0.6, 1]);
    
    // 检查是否为Flutter项目
    const isFlutterApp = title === "Weather App" || title === "Shop App";
    
    // 选择背景颜色
    const getBgColor = () => {
        if (!isFlutterApp) return '';
        
        if (title === "Weather App") {
            return 'bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 dark:from-blue-800 dark:via-blue-700 dark:to-blue-900';
        } else if (title === "Shop App") {
            return 'bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900 dark:from-emerald-800 dark:via-emerald-700 dark:to-emerald-900';
        }
        
        return 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800';
    };

    return (
        <motion.div
        ref={ref}
      style={{
        scale: scaleProgess,
        opacity: opacityProgess,
      }}
      className="group mb-3 sm:mb-8 last:mb-0"
      >
    <section
    className="bg-gray-100 max-w-[42rem] border border-black/5 
    rounded-lg overflow-hidden sm:pr-8 relative sm:h-[21rem] hover:bg-gray-200 
    transition sm:group-even:pl-8 dark:text-white dark:bg-white/10 
    dark:hover:bg-white/20">
        <div className="pt-4 pb-7 px-5 sm:pl-10 sm:pr-2 sm:pt-10 
        sm:max-w-[50%] flex flex-col h-full sm:group-even:ml-[18rem]">
            <h3 className="text-2xl font-semibold">{title}</h3>
            <p className="mt-2 leading-relaxed text-gray-700 dark:text-white/70">
                {description}
            </p>
            <ul className="flex flex-wrap mt-4 gap-2 sm:mt-auto">
                {tags.map((tag, index) => (
                    <li
                        className="bg-black/[0.7] px-3 py-1 text-[0.7rem] 
                uppercase tracking-wider text-white rounded-full dark:text-white/70"
                        key={index}>{tag}</li>
                ))}
            </ul>
        </div>
        <Image 
            src={imageUrl} 
            alt="Project I worked on" 
            quality={95}
            className="sm:hidden block mx-auto mt-6 w-full max-w-[20rem] rounded-t-lg shadow-md"
        />
        
        <div className={`absolute hidden sm:block overflow-hidden ${isFlutterApp ? 'top-6 -right-32 w-[20rem] h-[24rem]' : 'top-8 -right-40 w-[28.25rem] h-auto'} 
            rounded-lg shadow-2xl
            ${isFlutterApp ? 'group-even:right-[initial] group-even:-left-32' : 'group-even:right-[initial] group-even:-left-40'}
            transition duration-300 ease-out
            group-hover:scale-[1.04]
            group-hover:-translate-x-3
            group-hover:translate-y-3
            group-hover:-rotate-2
            group-even:group-hover:translate-x-3
            group-even:group-hover:translate-y-3
            group-even:group-hover:rotate-2
            ${getBgColor()}`}>
            <Image 
                src={imageUrl} 
                alt={isFlutterApp ? "Flutter App Screenshot" : "Project I worked on"}
                fill={isFlutterApp ? true : false}
                width={isFlutterApp ? undefined : 1000}
                height={isFlutterApp ? undefined : 1000}
                quality={95}
                className={`
                ${isFlutterApp ? 'object-contain p-4 w-full h-full opacity-95' : 'w-full h-auto'}`}
            />
            {isFlutterApp && (
                <>
                    {/* 顶部渐变 */}
                    <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/30 to-transparent"></div>
                    {/* 底部渐变 */}
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/30 to-transparent"></div>
                    {/* 左侧渐变 */}
                    <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/30 to-transparent"></div>
                    {/* 右侧渐变 */}
                    <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/30 to-transparent"></div>
                </>
            )}
        </div>
    </section>
        </motion.div>
    );
}
