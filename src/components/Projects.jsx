import { useRef, useState } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "motion/react";
import RevealText from "./RevealText";
import { projects } from "../data/projects";

const ease = [0.76, 0, 0.24, 1];

export default function Projects() {
  return (
    <section id="work" className="px-6 md:px-12 py-32 md:py-48">
      <div className="flex items-end justify-between mb-20 md:mb-32">
        <RevealText
          lines={["Selected", "work"]}
          onView
          className="font-display font-extrabold uppercase leading-[0.85] tracking-tight text-[14vw] md:text-[9vw]"
        />
        <p className="text-sm uppercase tracking-widest text-muted">
          (0{projects.length})
        </p>
      </div>

      <div className="flex flex-col gap-32 md:gap-48">
        {projects.map((project, i) => (
          <ProjectCard key={project.title} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project, index }) {
  const flip = index % 2 === 1;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <article
      ref={ref}
      className={`flex flex-col gap-8 md:gap-12 md:items-center ${
        flip ? "md:flex-row-reverse" : "md:flex-row"
      }`}
    >
      <ProjectImage project={project} inView={inView} />

      <div className="w-full md:w-5/12">
        <p className="text-sm uppercase tracking-widest text-muted mb-4">
          0{index + 1} / {project.year}
        </p>

        <RevealText
          lines={[project.title]}
          onView
          className="font-display font-bold text-4xl md:text-6xl tracking-tight mb-6"
        />

        <p className="text-fg/70 text-lg leading-relaxed mb-6 max-w-md">
          {project.description}
        </p>

        <ul className="flex flex-wrap gap-2 mb-8">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="text-xs uppercase tracking-wider border border-fg/20 rounded-full px-3 py-1"
            >
              {tag}
            </li>
          ))}
        </ul>

        <div className="flex gap-6 text-sm uppercase tracking-widest">
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noreferrer"
              className="border-b border-accent pb-1 hover:text-accent transition-colors"
            >
              Live site ↗
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="border-b border-fg/30 pb-1 hover:text-accent hover:border-accent transition-colors"
            >
              Code ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

const MAGNET_STRENGTH = 20; // max pixels the frame moves toward the cursor

function ProjectImage({ project, inView }) {
  const wrapperRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  // 1. Parallax: image drifts inside the frame while scrolling
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  // 2. Magnetic pull: frame moves toward the cursor on a spring
  const pullX = useMotionValue(0);
  const pullY = useMotionValue(0);
  const springConfig = { stiffness: 150, damping: 15, mass: 0.4 };
  const frameX = useSpring(pullX, springConfig);
  const frameY = useSpring(pullY, springConfig);

  // 3. Depth: the picture inside moves the opposite way
  const innerX = useTransform(frameX, (v) => v * -0.6);
  const innerY = useTransform(frameY, (v) => v * -0.6);

  function handleMouseMove(e) {
    const rect = wrapperRef.current.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    pullX.set(dx * MAGNET_STRENGTH);
    pullY.set(dy * MAGNET_STRENGTH);
  }

  function handleMouseLeave() {
    setHovered(false);
    pullX.set(0);
    pullY.set(0);
  }

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative isolate w-full md:w-7/12"
    >
      {/* Backlight: a blurred copy of the screenshot glowing behind the frame */}
      <motion.div
        aria-hidden="true"
        style={{ x: frameX, y: frameY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: inView ? (hovered ? 0.8 : 0.4) : 0 }}
        transition={{ duration: 0.8, ease }}
        className="pointer-events-none absolute inset-4 -z-10"
      >
        <img
          src={project.image}
          alt=""
          className="w-full h-full object-cover object-top blur-3xl scale-110 saturate-150"
        />
      </motion.div>

      <motion.a
        href={project.live}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${project.title} live site`}
        style={{ x: frameX, y: frameY }}
        initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
        animate={{
          clipPath: inView ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
        }}
        transition={{ duration: 1.2, ease }}
        className={`relative block aspect-[16/10] overflow-hidden rounded-xl border transition-colors duration-500 ${
          hovered ? "border-accent/60" : "border-fg/15"
        }`}
      >
        <motion.div
          style={{ x: innerX, y: innerY }}
          className="absolute inset-0"
        >
          <motion.img
            src={project.image}
            alt={`${project.title} website screenshot`}
            style={{ y: imageY }}
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.8, ease }}
            className="absolute inset-x-0 -top-[8%] w-full h-[116%] object-cover object-top"
          />
        </motion.div>

        {/* Glass edge: a thin line of light along the top */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent" />

        <motion.span
          initial={{ y: "150%" }}
          animate={{ y: hovered ? "0%" : "150%" }}
          transition={{ duration: 0.5, ease }}
          className="pointer-events-none absolute left-4 bottom-4 bg-accent text-bg text-xs font-medium uppercase tracking-widest px-4 py-2 rounded-full"
        >
          View site ↗
        </motion.span>
      </motion.a>
    </div>
  );
}
