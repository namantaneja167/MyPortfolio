import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArticleCard, CardGrid, Skeleton, SkeletonText } from "@infinibay/harbor";

interface ArticleItem {
  title: string;
  pubDate: string;
  link: string;
  author: string;
  thumbnail: string;
  description: string;
  categories: string[];
}

export function WritingCards() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fallbacks: ArticleItem[] = [
    {
      title: "Optimizing Snowflake Storage for Scale",
      pubDate: "2026-01-15 00:00:00",
      link: "https://medium.com/@namantaneja167",
      author: "Naman Taneja",
      thumbnail: "",
      description: "Analyzing the impact of micro-partitions on query performance and storage costs in high-volume environments.",
      categories: ["Data Engineering", "Snowflake"],
    },
    {
      title: "Building Resilient Data Pipelines",
      pubDate: "2026-01-08 00:00:00",
      link: "https://medium.com/@namantaneja167",
      author: "Naman Taneja",
      thumbnail: "",
      description: "Strategies for implementing fault tolerance and automated recovery in Azure Data Factory pipelines.",
      categories: ["Cloud Architecture", "Azure"],
    },
    {
      title: "RAG Systems in Production",
      pubDate: "2025-12-20 00:00:00",
      link: "https://medium.com/@namantaneja167",
      author: "Naman Taneja",
      thumbnail: "",
      description: "Lessons learned from deploying retrieval-augmented generation agents for enterprise knowledge bases.",
      categories: ["AI Engineering", "Gen AI"],
    },
  ];

  useEffect(() => {
    let active = true;

    async function fetchFeed() {
      try {
        const res = await fetch(
          "https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@namantaneja167"
        );
        const data = await res.json();
        if (active && data.status === "ok" && data.items && data.items.length > 0) {
          setArticles(data.items.slice(0, 3));
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("WritingCards: failed to fetch Medium RSS, using fallback placeholders.", err);
      }
      if (active) {
        setArticles(fallbacks);
        setLoading(false);
      }
    }

    fetchFeed();
    return () => {
      active = false;
    };
  }, []);

  // Format date helper: "2026-01-15 00:00:00" -> "Jan 2026"
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr.replace(/-/g, "/"));
      const formatter = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });
      return formatter.format(date);
    } catch {
      return "Jan 2026";
    }
  };

  // Strip HTML tags helper to generate a clean text excerpt from description
  const getExcerpt = (html: string, fallback: string) => {
    if (!html) return fallback;
    if (typeof window === "undefined") return fallback;
    const temp = document.createElement("div");
    temp.innerHTML = html;
    const text = temp.textContent || temp.innerText || "";
    // Clean spaces and slice
    const cleanText = text.replace(/\s+/g, " ").trim();
    if (cleanText.length > 130) {
      return cleanText.substring(0, 130) + "...";
    }
    return cleanText || fallback;
  };

  if (loading) {
    return (
      <CardGrid cols={3} className="gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 flex flex-col gap-4">
            <Skeleton height={20} width="30%" className="rounded" />
            <Skeleton height={24} width="85%" className="rounded" />
            <SkeletonText lines={3} />
            <Skeleton height={14} width="40%" className="rounded mt-2" />
          </div>
        ))}
      </CardGrid>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      <CardGrid cols={3} className="gap-6">
        {articles.map((item, index) => {
          const date = formatDate(item.pubDate);
          const excerpt = getExcerpt(item.description, item.title);
          // Only show categories that are relevant tags
          const tags = item.categories?.slice(0, 2) || ["Article"];

          return (
            <motion.div key={index} variants={itemVariants}>
              <ArticleCard
                title={item.title}
                excerpt={excerpt}
                href={item.link}
                date={date}
                tags={tags}
                readTime="5 min read"
                className="h-full border-[color:var(--harbor-border-default)] bg-[var(--harbor-bg-elev-1)] hover:border-accent/30 shadow-[var(--harbor-shadow-sm)] transition-all duration-300 transform hover:-translate-y-1"
              />
            </motion.div>
          );
        })}
      </CardGrid>
    </motion.div>
  );
}
