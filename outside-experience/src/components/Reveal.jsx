import { motion } from "framer-motion";

export const EASE = [0.16, 1, 0.3, 1];

// Entrada discreta ao rolar. Sem efeitos de vitrine: só sobe um pouco e aparece.
export default function Reveal({ children, delay = 0, y = 20, className = "", as = "div", ...rest }) {
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
