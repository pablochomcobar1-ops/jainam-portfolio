import { useState } from "react";
import { motion } from "motion/react";
import RevealText from "./RevealText";
import PortraitReveal from "./PortraitReveal";
import Scramble from "./Scramble";
import Marquee from "./Marquee";

export default function Hero() {
  const [revealed, setRevealed] = useState(false);
  const [alias, setAlias] = useState(false);

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col justify-end px-6 md:px-12 pt-28 pb-12"
    >
      <div className="flex flex-col-reverse md:flex-row md:items-end md:justify-between gap-10 md:gap-12">
        {/* ---------- LEFT: label, name, a.k.a. ---------- */}
        <div className="relative z-10 min-w-0">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-sm uppercase tracking-widest text-muted mb-6"
          >
            Full-stack developer · Ahmedabad, India
          </motion.p>

          {/* ===== OPTION 1: identity swap on hover / tap ===== */}
          <div
            onPointerEnter={(e) => e.pointerType === "mouse" && setAlias(true)}
            onPointerLeave={(e) => e.pointerType === "mouse" && setAlias(false)}
            onClick={() => {
              if (!window.matchMedia("(hover: hover)").matches)
                setAlias((a) => !a);
            }}
            className={`w-fit cursor-default transition-colors duration-500 ${alias ? "text-accent" : ""}`}
          >
            <RevealText
              lines={[
                <Scramble text={alias ? "Pablo" : "Jainam"} />,
                <>
                  <Scramble text={alias ? "Chomcobar" : "Gondaliya"} />
                  <span className={alias ? "text-fg" : "text-accent"}>.</span>
                </>,
              ]}
              className="font-display font-extrabold uppercase leading-[0.85] tracking-tight text-[14vw] md:text-[8vw]"
              delay={0.3}
            />
          </div>

          {/* ===== OPTION 2: decoding a.k.a. tag ===== */}
          <p className="mt-5 font-mono text-sm md:text-base tracking-widest text-muted">
            a.k.a.{" "}
            <span className="text-accent uppercase">
              <Scramble
                text="Pablo Chomcobar"
                startOnMount
                delay={1500}
                duration={1200}
              />
            </span>
          </p>
        </div>

        {/* ---------- RIGHT: photo + reveal controls ---------- */}
        <div className="w-[70vw] max-w-sm md:max-w-none md:w-[min(26vw,50vh)] shrink-0 self-end md:self-auto">
          <motion.div
            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: 1.4, delay: 0.5, ease: [0.76, 0, 0.24, 1] }}
            className="aspect-[4/5]"
          >
            <PortraitReveal
              src="/images/me.png"
              revealed={revealed}
              className="w-full h-full"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="mt-3 flex items-center justify-between gap-4"
          >
            <p className="text-xs uppercase tracking-widest text-muted">
              <span className="hidden md:inline">( Hover to reveal )</span>
              <span className="md:hidden">( Touch &amp; drag )</span>
            </p>

            <button
              onClick={() => setRevealed((r) => !r)}
              className="flex items-center gap-2 text-xs uppercase tracking-widest border border-accent/60 text-accent rounded-full px-4 py-2 hover:bg-accent hover:text-bg transition-colors"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full bg-current ${revealed ? "" : "animate-pulse"}`}
              />
              {revealed ? "Back to dots" : "Reveal"}
            </button>
          </motion.div>
        </div>
      </div>

      {/* ---------- Bottom row: tagline + scroll hint ---------- */}
      <div className="relative z-10 mt-12 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <RevealText
          lines={[
            "I build websites and web apps",
            "that look sharp and actually work.",
          ]}
          className="text-lg md:text-xl max-w-md text-fg/70"
          delay={0.9}
        />
        <motion.a
          href="#work"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="text-sm uppercase tracking-widest hover:text-accent transition-colors"
        >
          Scroll to explore ↓
        </motion.a>
      </div>

      {/* ===== OPTION 3: scrolling strip ===== */}
      <Marquee />
    </section>
  );
}
