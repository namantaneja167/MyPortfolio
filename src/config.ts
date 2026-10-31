const baseUrl = import.meta.env.BASE_URL;

export const assetUrl = (path: string) =>
  `${baseUrl}${path.replace(/^\/+/, "")}`;

export const mobileCharacterPortraitUrl = assetUrl("images/character-mobile.png?v=smile");

export const config = {
  developer: {
    name: "Naman",
    fullName: "Naman Taneja",
    title: "Data Engineer",
    secondaryFocus: "Applied AI",
    description:
      "I build enterprise data platforms across energy trading and pharma analytics, turning complex source data into reliable reporting.",
  },
  social: {
    email: "er.namantaneja@gmail.com",
    location: "Noida, India",
  },
  about: {
    title: "About Me",
    description:
      "I’m a data engineer based in Noida, India. At Uniper and ZS Associates, I’ve built enterprise data pipelines across energy trading and pharmaceutical analytics—from fragmented source feeds to reliable reporting. Alongside my professional work, I explore RAG and agentic workflows through personal projects.",
  },
  experiences: [
    {
      position: "Senior Technical Consultant — Data Engineering",
      company: "Uniper",
      period: "2026 – Present",
      location: "Noida, India",
      description:
        "Assumed ownership of an inherited Endur migration during a vendor transition, completed go-live, stabilised the data platform and helped onboard the wider team. Delivered end-to-end ingestion and reporting flows processing 500M+ source rows daily.",
      responsibilities: [
        "Reduced report latency from ~5 minutes to under 10 seconds with incremental dbt models",
        "Cut daily file sync from ~120 minutes to ~2 minutes with parallel transfers across Azure VNets",
        "Productionised Azure Functions with monitoring, logging and error handling",
        "Integrated external market-data feeds and optimised Azure Data Factory orchestration",
      ],
      technologies: [
        "Snowflake",
        "dbt",
        "Snowpipe",
        "Azure Data Factory",
        "Azure Functions",
        "Python",
        "C#",
      ],
    },
    {
      position: "Business Technology Solution Associate",
      company: "ZS Associates",
      period: "Dec 2022 – 2026",
      location: "Gurugram, India",
      description:
        "Built and supported go-to-market analytics for a large US pharmaceutical client, evaluating 300+ KPIs across more than one billion healthcare records.",
      responsibilities: [
        "Optimised ingestion to reduce processing time by 25%",
        "Built a Python and Tableau REST API framework that reduced manual reporting effort by 60%",
        "Delivered automated reporting with recurring data quality checks",
      ],
      technologies: ["Snowflake", "Dataiku DSS", "Tableau", "Python", "SQL"],
    },
    {
      position: "Business Technology Solution Associate Intern",
      company: "ZS Associates",
      period: "Jun 2022 – Dec 2022",
      location: "Gurugram, India",
      description:
        "Streamlined machine-learning workflows for three brands with MLOps practices, improving operational efficiency by almost 20%.",
      responsibilities: [
        "Implemented CI/CD and data orchestration",
        "Improved model and data drift monitoring",
        "Centralised configuration management and data versioning",
      ],
      technologies: ["Python", "MLOps", "CI/CD", "Data Versioning"],
    },
  ],
  projects: [
    {
      id: 1,
      title: "CXL → Endur ETRM Migration",
      category: "Uniper",
      technologies: "Snowflake · dbt · Azure Data Factory · Azure DevOps · C#",
      image: assetUrl("images/etrm-migration.svg"),
      alt: "Illustrative data-flow graphic for the ETRM migration, not a production screenshot.",
      description:
        "Took ownership of the inherited migration, completed the Endur go-live and delivered Snowflake/dbt reporting flows.",
      outcome: "5 min → 10 s report latency",
      link: "",
    },
    {
      id: 2,
      title: "Market Data Ingestion Platform",
      category: "Uniper",
      technologies: "Snowpipe · Azure Data Factory · Azure Functions · Python",
      image: assetUrl("images/market-data.svg"),
      alt: "Illustrative data-flow graphic for market-data ingestion, not client architecture.",
      description:
        "Unified provider feeds through ADF and Snowpipe, then productionised monitored Azure Functions.",
      outcome: "120 min → 2 min daily file sync",
      link: "",
    },
    {
      id: 3,
      title: "Pharma Go-to-Market Analytics",
      category: "ZS Associates",
      technologies: "Snowflake · Dataiku DSS · Python · SQL · Tableau",
      image: assetUrl("images/pharma-analytics.svg"),
      alt: "Illustrative analytics graphic, not a client dashboard or screenshot.",
      description:
        "Optimised Snowflake/Dataiku ETL and delivered automated, quality-checked go-to-market reporting.",
      outcome: "25% faster processing",
      link: "",
    },
    {
      id: 4,
      title: "Tableau Automation Framework",
      category: "ZS Associates",
      technologies: "Python · Tableau REST API · XML",
      image: assetUrl("images/tableau-automation.svg"),
      alt: "Illustrative workflow graphic for Tableau automation, not a production screenshot.",
      description:
        "Built a Python framework to automate extracts, dashboard comparisons and sheet visibility.",
      outcome: "60% less manual effort",
      link: "",
    },
  ],
  contact: {
    email: "er.namantaneja@gmail.com",
    github: "https://github.com/namantaneja167",
    linkedin: "https://www.linkedin.com/in/namantaneja167/",
    twitter: "https://x.com/naman_taneja_",
    medium: "https://medium.com/@namantaneja167",
  },
  resume: assetUrl("assets/Naman-Taneja-Data-Engineer-Resume.pdf"),
  skills: {
    develop: {
      title: "DATA ENGINEERING",
      description: "Reliable data platforms for enterprise reporting",
      details:
        "Professional experience building production data flows across energy trading and pharmaceutical analytics.",
      tools: [
        "Snowflake",
        "dbt",
        "Snowpipe",
        "Azure Data Factory",
        "Azure Functions",
        "Azure VNets",
        "Python",
        "SQL",
        "C#",
        "Dataiku DSS",
        "Tableau",
      ],
    },
    design: {
      title: "APPLIED AI",
      description: "RAG and agentic workflows through project work",
      details:
        "Applied-AI experience comes from personal and learning projects, not production employment systems.",
      tools: ["RAG", "AI Agents", "Agentic Workflows", "LangChain", "CrewAI", "Ollama"],
    },
  },
};
