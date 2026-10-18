import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$!?<>/";

export default function Scramble({
  text,
  duration = 800,
  delay = 0,
  startOnMount = false,
}) {
  const [display, setDisplay] = useState(startOnMount ? "" : text);
  const displayRef = useRef(display);

  useEffect(() => {
    const from = displayRef.current;
    if (from === text) return;

    const length = Math.max(from.length, text.length);
    const start = performance.now() + delay;
    let frameId;

    function tick(now) {
      if (now < start) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      const p = Math.min((now - start) / duration, 1);
      let out = "";

      for (let i = 0; i < length; i++) {
        const scrambleAt = 0.3 * (i / length); // when this letter starts scrambling
        const lockAt = 0.3 + 0.7 * (i / length); // when it locks into the final letter

        if (p >= lockAt) out += text[i] ?? "";
        else if (p >= scrambleAt)
          out += CHARS[Math.floor(Math.random() * CHARS.length)];
        else out += from[i] ?? "";
      }

      displayRef.current = out;
      setDisplay(out);
      if (p < 1) frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [text, duration, delay]);

  return <span>{display}</span>;
}
