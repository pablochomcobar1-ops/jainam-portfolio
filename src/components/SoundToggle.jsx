export default function SoundToggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={on ? "Turn sound off" : "Turn sound on"}
      className="fixed bottom-6 left-6 md:left-12 z-50 flex items-center gap-3 text-xs uppercase tracking-widest hover:text-accent transition-colors"
    >
      <span className="flex items-end gap-[3px] h-4">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-[3px] h-full bg-accent origin-bottom ${on ? "eq-bar" : ""}`}
            style={{
              animationDelay: `${i * 0.15}s`,
              transform: on ? undefined : "scaleY(0.25)",
            }}
          />
        ))}
      </span>
      Sound {on ? "on" : "off"}
    </button>
  );
}
