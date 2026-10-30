import React from 'react';
import { motion } from 'framer-motion';

interface FloatingElementProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  className?: string;
  rotate?: number;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  delay = 0,
  duration = 4,
  yOffset = 8,
  className = '',
  rotate = 0,
}) => {
  return (
    <motion.div
      initial={{ y: 0, rotate }}
      animate={{
        y: [-yOffset, yOffset, -yOffset],
        rotate: [rotate - 1, rotate + 1, rotate - 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
