const links = ["work", "about", "contact"];

export default function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex justify-between items-center px-6 md:px-12 py-6">
      <a
        href="#home"
        className="group flex items-center gap-3 font-display font-bold text-lg"
      >
        <img
          src="/favicon.svg"
          alt=""
          className="w-9 h-9 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
        />
        <span className="mix-blend-difference">
          JG<span className="text-accent">.</span>
        </span>
      </a>

      <ul className="flex gap-6 md:gap-10 text-sm uppercase tracking-widest mix-blend-difference">
        {links.map((link) => (
          <li key={link}>
            <a
              href={`#${link}`}
              className="hover:text-accent transition-colors"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
