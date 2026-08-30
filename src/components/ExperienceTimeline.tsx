import { motion } from "framer-motion";
import rawExperience from "../content/experience.json";

interface ExperienceItem {
  company: string;
  title: string;
  period: string;
  description: string;
  tags: string[];
}

export function ExperienceTimeline() {
  const experiences = rawExperience as ExperienceItem[];

  // Container motion variant for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative pl-6 md:pl-0 flex flex-col gap-10 md:gap-12"
    >
      {/* Central line for desktop timeline */}
      <div className="absolute left-[9px] md:left-1/2 top-0 bottom-0 w-[2px] bg-[color:var(--harbor-border-subtle)] transform md:-translate-x-1/2" />

      {experiences.map((exp, index) => {
        const isEven = index % 2 === 0;

        return (
          <motion.div
            key={index}
            variants={itemVariants}
            className={`relative flex flex-col md:flex-row items-start ${
              isEven ? "md:flex-row-reverse" : ""
            }`}
          >
            {/* Timeline Dot */}
            <div className="absolute -left-6 md:left-1/2 top-2 w-5 h-5 rounded-full border-4 border-[color:var(--harbor-bg)] bg-accent transform md:-translate-x-1/2 z-10 shadow-[var(--harbor-shadow-glow)]" />

            {/* Left side card (Date Period) */}
            <div className={`w-full md:w-1/2 ${isEven ? "md:pl-12" : "md:pr-12 md:text-right"} mb-2 md:mb-0`}>
              <span className="inline-block px-3.5 py-1 text-xs font-mono font-semibold tracking-wider uppercase rounded-full bg-[var(--harbor-state-selected)] text-accent border border-[color:var(--harbor-border-subtle)]">
                {exp.period}
              </span>
            </div>

            {/* Right side card (Experience Content) */}
            <div className={`w-full md:w-1/2 ${isEven ? "md:pr-12" : "md:pl-12"}`}>
              <div className="p-6 rounded-xl border border-[color:var(--harbor-border-default)] bg-[var(--harbor-bg-elev-1)] hover:bg-[var(--harbor-bg-elev-2)] hover:border-accent/30 shadow-[var(--harbor-shadow-sm)] hover:shadow-[var(--harbor-shadow-md)] transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-xl font-bold font-display text-[rgb(var(--harbor-text))] mb-1">
                  {exp.title}
                </h3>
                <h4 className="text-sm font-semibold font-mono text-accent-2 mb-3">
                  {exp.company}
                </h4>
                <p className="text-sm leading-relaxed text-[rgb(var(--harbor-text-muted))] mb-4">
                  {exp.description}
                </p>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-2">
                  {exp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 text-xs font-mono rounded bg-white/[0.04] text-[rgb(var(--harbor-text-muted))] border border-white/[0.06] hover:text-accent hover:border-accent/20 transition-all duration-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
