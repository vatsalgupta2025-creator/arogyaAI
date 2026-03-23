import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '../lib/utils';

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function BlurText({ text, className, delay = 0 }: BlurTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: delay },
    },
  };

  const child = {
    hidden: {
      opacity: 0,
      filter: 'blur(10px)',
      y: 50,
    },
    visible: {
      opacity: [0, 0.5, 1],
      filter: ['blur(10px)', 'blur(5px)', 'blur(0px)'],
      y: [50, -5, 0],
      transition: {
        duration: 0.35,
        ease: "easeOut" as const
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={cn("flex flex-wrap justify-center", className)}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {words.map((word, index) => (
        <motion.span
          variants={child}
          key={index}
          className="mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
