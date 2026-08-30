import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function NavBar() {
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [scrolled, setScrolled] = useState(false);

  // Initialize theme from document attribute
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      setTheme(isLight ? "light" : "dark");
    }
  }, []);

  // Sync theme to document element
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  // Scroll listener to update active tab and background scroll state
  useEffect(() => {
    const handleScroll = () => {
      // 1. Update background opacity on scroll
      setScrolled(window.scrollY > 20);

      // 2. Scroll Spy to detect current section
      const sections = ["hero", "about", "experience", "skills", "projects", "blog", "contact"];
      const scrollPos = window.scrollY + 200; // Offset for header height

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "about", label: "About", href: "#about" },
    { id: "experience", label: "Experience", href: "#experience" },
    { id: "skills", label: "Skills", href: "#skills" },
    { id: "projects", label: "Projects", href: "#projects" },
    { id: "blog", label: "Writing", href: "#blog" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
        scrolled
          ? "py-3 bg-[var(--harbor-surface-toolbar)] border-b border-[color:var(--harbor-border-subtle)] backdrop-blur-xl"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="max-w-[var(--harbor-container-xl)] mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <motion.a
          href="#hero"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="font-display font-bold text-xl tracking-wider text-accent transition-colors hover:text-accent-3"
        >
          NAMAN
        </motion.a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = activeSection === item.id;
            return (
              <motion.a
                key={item.id}
                href={item.href}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 outline-none rounded-lg ${
                  active
                    ? "text-[var(--harbor-text)]"
                    : "text-[rgb(var(--harbor-text-muted))] hover:text-[rgb(var(--harbor-text))]"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-[var(--harbor-state-selected)] border border-[color:var(--harbor-border-subtle)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </motion.a>
            );
          })}
          <motion.a
            href="/MyPortfolio/assets/Naman_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="px-4 py-2 text-sm font-medium text-[rgb(var(--harbor-text-muted))] hover:text-[rgb(var(--harbor-text))] transition-colors"
          >
            Resume
          </motion.a>
        </nav>

        {/* Header Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg border border-[color:var(--harbor-border-default)] bg-[var(--harbor-bg-elev-1)] hover:bg-[var(--harbor-bg-elev-2)] text-[rgb(var(--harbor-text-muted))] hover:text-[rgb(var(--harbor-text))] transition-all"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <i className="bx bx-sun text-lg" aria-hidden="true" />
            ) : (
              <i className="bx bx-moon text-lg" aria-hidden="true" />
            )}
          </button>

          {/* Contact Button */}
          <a
            href="#contact"
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-accent text-[rgb(var(--harbor-brand-fg))] hover:bg-accent-3 hover:scale-[1.02] shadow-[var(--harbor-shadow-sm)] active:scale-95 transition-all"
          >
            Contact
          </a>
        </div>

        {/* Mobile Action Controls */}
        <div className="flex items-center gap-3 md:hidden">
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-[color:var(--harbor-border-default)] bg-[var(--harbor-bg-elev-1)] text-[rgb(var(--harbor-text-muted))] transition-all"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <i className="bx bx-sun text-base" aria-hidden="true" />
            ) : (
              <i className="bx bx-moon text-base" aria-hidden="true" />
            )}
          </button>

          {/* Mobile Hamburg Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-[color:var(--harbor-border-default)] bg-[var(--harbor-bg-elev-1)] text-[rgb(var(--harbor-text))] transition-all"
            aria-label="Toggle Menu"
          >
            <i className={`bx ${mobileMenuOpen ? "bx-x" : "bx-menu"} text-xl`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-[var(--harbor-bg-elev-1)] border-b border-[color:var(--harbor-border-default)] shadow-[var(--harbor-shadow-md)] md:hidden z-[90]"
          >
            <nav className="flex flex-col p-6 gap-4">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-medium transition-colors ${
                    activeSection === item.id ? "text-accent" : "text-[rgb(var(--harbor-text-muted))]"
                  }`}
                >
                  {item.label}
                </a>
              ))}
              <a
                href="/MyPortfolio/assets/Naman_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[rgb(var(--harbor-text-muted))] hover:text-accent transition-colors"
              >
                Resume
              </a>
              <hr className="border-[color:var(--harbor-border-subtle)] my-2" />
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-semibold rounded-lg bg-accent text-[rgb(var(--harbor-brand-fg))] block"
              >
                Contact
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
