import RevealText from "./RevealText";
import ScrollWords from "./ScrollWords";

const skills = [
  {
    group: "Frontend",
    items: ["React", "Tailwind CSS", "TypeScript", "shadcn/ui"],
  },
  { group: "Backend", items: ["Node.js", "Express", "MongoDB", "REST APIs"] },
  {
    group: "Motion & 3D",
    items: ["Three.js", "GLSL shaders", "Motion", "Lenis"],
  },
  {
    group: "Shipping",
    items: ["Git & GitHub", "Vercel", "Render", "MongoDB Atlas"],
  },
];

export default function About() {
  return (
    <section id="about" className="px-6 md:px-12 py-32 md:py-48">
      <p className="text-sm uppercase tracking-widest text-muted mb-10">
        (About)
      </p>

      <ScrollWords
        text="I'm a 19-year-old developer from Ahmedabad who builds full-stack web apps and websites that move. I care about the details: how a page feels when you scroll, not just whether it works."
        className="font-display text-3xl md:text-6xl font-bold leading-[1.1] tracking-tight max-w-6xl"
      />

      <div className="mt-24 md:mt-40 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 border-t border-fg/15 pt-10">
        {skills.map((s, i) => (
          <div key={s.group}>
            <RevealText
              lines={[s.group]}
              onView
              delay={i * 0.1}
              className="text-sm uppercase tracking-widest text-accent mb-5"
            />
            <RevealText
              lines={s.items}
              onView
              delay={i * 0.1 + 0.15}
              className="font-display text-xl md:text-2xl space-y-1"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
