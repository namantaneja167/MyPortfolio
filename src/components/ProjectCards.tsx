import { motion } from "framer-motion";
import { Card, CardGrid } from "@infinibay/harbor";
import rawProjects from "../content/projects.json";

interface ProjectItem {
  title: string;
  type: string;
  description: string;
  stack: string[];
  cardClass: string;
  link: string;
}

export function ProjectCards() {
  const projects = rawProjects as ProjectItem[];

  // Define details for each project's tone and icon
  const projectMeta: Record<
    string,
    { icon: string; tone: "amber" | "sky" | "purple" | "neutral" | "green" | "rose" }
  > = {
    "Energy Market Data Hub": { icon: "bx bx-bolt-circle", tone: "amber" },
    "Pharma Commercial Intelligence": { icon: "bx bx-capsule", tone: "sky" },
    "Enterprise RAG Knowledge Agent": { icon: "bx bx-brain", tone: "purple" },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      <CardGrid cols={3} className="gap-6">
        {projects.map((project, index) => {
          const meta = projectMeta[project.title] || { icon: "bx bx-code-alt", tone: "neutral" };
          const isNDA = !project.link;

          return (
            <motion.div key={index} variants={itemVariants} className="h-full">
              <Card
                variant="default"
                interactive={true}
                tilt={true}
                spotlight={true}
                glow={true}
                fullHeight={true}
                leadingIcon={<i className={`${meta.icon} text-xl`} />}
                leadingIconTone={meta.tone}
                title={
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-lg font-bold font-display text-[rgb(var(--harbor-text))]">
                      {project.title}
                    </span>
                  </div>
                }
                header={
                  <span className="inline-block px-2 py-0.5 text-[10px] uppercase font-mono font-bold tracking-widest rounded bg-white/[0.04] text-[rgb(var(--harbor-text-muted))] border border-white/[0.06]">
                    {project.type}
                  </span>
                }
                description={
                  <p className="text-sm leading-relaxed text-[rgb(var(--harbor-text-muted))] my-2">
                    {project.description}
                  </p>
                }
                footer={
                  <div className="flex items-center justify-between gap-3 pt-2">
                    {/* Project Link Action */}
                    {isNDA ? (
                      <div className="relative group/tooltip">
                        <button
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white/[0.03] text-[rgb(var(--harbor-text-subtle))] border border-white/[0.05] cursor-not-allowed flex items-center gap-1.5"
                          disabled
                          aria-label="Enterprise NDA Project - Code not public"
                        >
                          <i className="bx bx-lock-alt text-sm" /> NDA Protected
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[var(--harbor-bg-elev-2)] text-[rgb(var(--harbor-text-muted))] text-[10px] font-mono leading-normal rounded-lg border border-[color:var(--harbor-border-default)] shadow-[var(--harbor-shadow-md)] opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 text-center z-20">
                          Proprietary codebase protected by client non-disclosure agreement.
                        </div>
                      </div>
                    ) : (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-accent text-[rgb(var(--harbor-brand-fg))] hover:bg-accent-3 flex items-center gap-1.5 shadow-[var(--harbor-shadow-sm)] transition-all"
                      >
                        <i className="bx bxl-github text-sm" /> View Code
                      </a>
                    )}
                  </div>
                }
              >
                {/* Project Stack Tags in the card body */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-[11px] font-mono rounded bg-white/[0.03] text-[rgb(var(--harbor-text-subtle))] border border-white/[0.04]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </CardGrid>
    </motion.div>
  );
}
