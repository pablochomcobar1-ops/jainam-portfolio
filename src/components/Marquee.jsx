const words = [
  "Pablo Chomcobar",
  "Full-stack developer",
  "Pablo Chomcobar",
  "Creative developer",
];

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {words.map((word, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6">{word}</span>
          <span aria-hidden="true">✦</span>
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="relative z-10 -mx-6 md:-mx-12 mt-12 overflow-hidden bg-accent text-bg py-3 font-display font-bold uppercase tracking-widest text-sm md:text-base">
      <div className="flex w-max animate-[marquee_30s_linear_infinite]">
        {Array.from({ length: 6 }, (_, i) => (
          <Row key={i} />
        ))}
      </div>
    </div>
  );
}
