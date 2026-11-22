import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export const EASE = [0.16, 1, 0.3, 1];

export default function Reveal({ children, delay = 0, y = 28, className = "", ...rest }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function MaskedLines({ lines, ready, delay = 0, stagger = 0.11, className = "", render }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const show = ready === undefined ? inView : ready;
  return (
    <span ref={ref} className={`block ${className}`}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden py-[0.08em] -my-[0.08em]">
          <motion.span
            className="block"
            initial={{ y: "115%" }}
            animate={{ y: show ? 0 : "115%" }}
            transition={{ duration: 1.05, ease: EASE, delay: delay + i * stagger }}
          >
            {render ? render(line, i) : line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
