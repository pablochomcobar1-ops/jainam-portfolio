import { useRef } from "react";
import { motion, useInView } from "motion/react";

const ease = [0.76, 0, 0.24, 1];

export default function RevealText({
  lines,
  className = "",
  delay = 0,
  onView = false,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const show = onView ? inView : true;

  return (
    <div ref={ref} className={className}>
      {lines.map((line, i) => (
        <div key={i} className="overflow-hidden">
          <motion.div
            initial={{ y: "110%" }}
            animate={{ y: show ? "0%" : "110%" }}
            transition={{ duration: 1, delay: delay + i * 0.12, ease }}
          >
            {line}
          </motion.div>
        </div>
      ))}
    </div>
  );
}
