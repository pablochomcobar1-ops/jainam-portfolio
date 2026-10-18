import { useEffect } from "react";
import { motion } from "motion/react";
import Scramble from "./Scramble";

export default function IntroGate({ onEnter }) {
  // Pressing Enter anywhere on the intro screen = clicking ENTER
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        onEnter(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onEnter]);

  return (
    <motion.div
      initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
      exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-10 bg-bg/60 px-6 text-center"
    >
      <p className="font-mono text-xs md:text-sm tracking-widest text-muted">
        <Scramble
          text="PABLO CHOMCOBAR PRESENTS"
          startOnMount
          delay={300}
          duration={1200}
        />
      </p>

      <button
        onClick={() => onEnter(true)}
        className="group font-display font-extrabold uppercase text-[18vw] md:text-[10vw] leading-none tracking-tight hover:text-accent transition-colors"
      >
        Enter
        <span className="text-accent group-hover:text-fg transition-colors">
          .
        </span>
      </button>

      <div className="flex flex-col items-center gap-3 text-xs uppercase tracking-widest">
        <span className="text-accent">( Best experienced with sound )</span>
        <span className="hidden md:inline text-muted">
          Click or press{" "}
          <kbd className="border border-fg/30 rounded px-1.5 py-0.5 text-fg">
            Enter ↵
          </kbd>
        </span>
        <button
          onClick={() => onEnter(false)}
          className="text-muted hover:text-fg underline-offset-4 hover:underline"
        >
          Enter without sound
        </button>
      </div>
    </motion.div>
  );
}
