const links = ["work", "about", "contact"];

export default function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex justify-between items-center px-6 md:px-12 py-6 mix-blend-difference">
      <a href="#home" className="font-display font-bold text-lg">
        JG<span className="text-accent">.</span>
      </a>
      <ul className="flex gap-6 md:gap-10 text-sm uppercase tracking-widest">
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
