import { useEffect, useState } from "react";
import RevealText from "./RevealText";

// ✏️ Fill these in. Empty values are hidden automatically.
const contact = {
  email: "pablochomcobar1@gmail.com",
  whatsapp: "+91 7043977143", // e.g. "91XXXXXXXXXX" (country code, no + or spaces)
  socials: [
    { label: "GitHub", url: "https://github.com/pablochomcobar1-ops" },
    { label: "LinkedIn", url: "" },
    { label: "Instagram", url: "" },
    { label: "X", url: "" },
  ],
};

function getIndiaTime() {
  return new Date().toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LocalTime() {
  const [time, setTime] = useState(getIndiaTime);

  useEffect(() => {
    const id = setInterval(() => setTime(getIndiaTime()), 30_000);
    return () => clearInterval(id);
  }, []);

  return <span>{time} IST</span>;
}

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const socials = contact.socials.filter((s) => s.url);
  const whatsappLink = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
    "Hi Jainam, I saw your portfolio and wanted to talk about a project.",
  )}`;

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked by the browser; the mailto link still works
    }
  }

  return (
    <section
      id="contact"
      className="min-h-screen flex flex-col justify-between px-6 md:px-12 pt-32 md:pt-48 pb-10 border-t border-fg/15"
    >
      <div>
        <p className="text-sm uppercase tracking-widest text-muted mb-10">
          (Contact)
        </p>

        <RevealText
          lines={[
            "Let's build",
            <>
              something<span className="text-accent">.</span>
            </>,
          ]}
          onView
          className="font-display font-extrabold uppercase leading-[0.85] tracking-tight text-[13vw] md:text-[10vw]"
        />

        <div className="mt-16 md:mt-24 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          <a
            href={`mailto:${contact.email}`}
            className="font-display text-2xl md:text-5xl font-bold break-all md:break-normal border-b-2 border-fg/20 hover:border-accent hover:text-accent transition-colors pb-2"
          >
            {contact.email}
          </a>

          <div className="flex gap-4">
            <button
              onClick={copyEmail}
              className="text-sm uppercase tracking-widest border border-fg/30 rounded-full px-5 py-3 hover:border-accent hover:text-accent transition-colors"
            >
              {copied ? "Copied ✓" : "Copy email"}
            </button>

            {contact.whatsapp && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="text-sm uppercase tracking-widest bg-accent text-bg rounded-full px-5 py-3 hover:opacity-80 transition-opacity"
              >
                WhatsApp ↗
              </a>
            )}
          </div>
        </div>
      </div>

      <footer className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm uppercase tracking-widest">
        <div>
          <p className="text-muted mb-3">Socials</p>
          <ul className="space-y-1">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  {s.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-muted mb-3">Local time</p>
          <p>Ahmedabad, IN</p>
          <LocalTime />
        </div>

        <div className="md:col-start-4 md:text-right flex flex-col justify-end gap-1 col-span-2 md:col-span-1">
          <a href="#home" className="hover:text-accent transition-colors">
            Back to top ↑
          </a>
          <p className="text-muted">
            © {new Date().getFullYear()} Jainam Gondaliya
          </p>
        </div>
      </footer>
    </section>
  );
}
