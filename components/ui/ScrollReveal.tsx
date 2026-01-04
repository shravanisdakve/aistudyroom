import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface ScrollRevealProps {
    children: React.ReactNode;
    width?: "fit-content" | "100%";
    delay?: number;
    className?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({ children, width = "100%", delay = 0, className = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <div ref={ref} style={{ width }} className={className}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{ duration: 0.6, delay: delay, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </div>
    );
};
