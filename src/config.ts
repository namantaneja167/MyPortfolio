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
  },
  social: {
    email: "er.namantaneja@gmail.com",
    location: "Noida, India",
  },
  about: {
    title: "About Me",
    paragraphs: [
      "I’m a data engineer in Noida, India, building data platforms for energy trading at Uniper. Previously at ZS Associates, I built reporting pipelines for Pfizer and helped introduce MLOps practices for Novartis. I’m interested in practical AI and automation that make everyday work easier.",
    ],
  },
  experiences: [
    {
      position: "Senior Technical Consultant, Data Engineering",
      company: "Uniper",
      period: "Jun 25 – Present",
      location: "Noida, India",
      description:
        "I support Uniper’s North American trading data platform across Azure and Snowflake, covering ingestion, data quality, automation, and production operations.",
      responsibilities: [
        "Joined as the first India-based data engineer supporting the North American team. The vendor had established the Azure and Snowflake platform; I took over its code and deployment processes and helped build internal capability.",
        "Owned technical pipeline readiness for the August 2026 Endur launch, including Azure infrastructure, CI/CD, ingestion, validation, and monitoring. Senior engineers and the data architect owned the business transformation rules.",
        "Extended feeds, pipelines, APIs, tables, and views; built operational tools; improved performance; and fixed production issues.",
        "Serve as Scrum Master, mentor one colleague through onboarding and code reviews, act as an India-based technical contact, and present technical updates and proposals to management.",
      ],
      technologies: [
        "Snowflake",
        "Snowpipe",
        "Dynamic Tables",
        "Azure Data Factory",
        "Azure Functions",
        "C#",
        "Azure DevOps",
        "CI/CD",
        "Key Vault",
        "Application Insights",
      ],
    },
    {
      position: "Business Solution Technical Associate",
      company: "ZS Associates",
      period: "Dec 22 – Jun 25",
      location: "Gurugram, India",
      description:
        "I built and improved weekly reporting pipelines for Pfizer’s global healthcare professional engagement analytics, and presented findings and data issues to client directors and senior directors.",
      responsibilities: [
        "Extended an existing go-to-market platform, managed weekly refreshes, investigated data issues, and improved Snowflake and Dataiku processing.",
        "Built Cockpit reporting pipelines from scratch for priority executive KPIs across approximately 20 countries.",
        "Built a Tableau API utility and weekly KPI checks; saved approximately 3–4 hours of manual extraction each week and flagged changes over 3% for review.",
        "Presented findings and data quality issues to client directors and senior directors in India and the US; mentored one colleague on GTM and three on Cockpit.",
      ],
      technologies: ["Snowflake", "Dataiku DSS", "Tableau", "Python", "SQL"],
    },
    {
      position: "Business Solution Technical Associate Intern",
      company: "ZS Associates",
      period: "Jun 22 – Dec 22",
      location: "Gurugram, India",
      description:
        "I helped structure Databricks machine-learning workflows and introduce MLflow tracking and versioning across three brands for models that recommended the next engagement channel for healthcare professionals.",
      responsibilities: [
        "Split large Databricks notebooks into smaller modules and centralized reusable functions across brands.",
        "Integrated MLflow runs, metrics, model registration, and versioning, and added timestamped model outputs.",
        "Contributed to the team’s data-drift monitoring; I did not develop the predictive models.",
      ],
      technologies: ["Databricks", "Python", "MLflow", "MLOps"],
    },
  ],
  projects: [
    {
      id: 1,
      title: "North American Trading Data Platform",
      category: "Uniper",
      technologies:
        "Azure Data Factory · Azure Functions · C# · Snowflake · Snowpipe · Dynamic Tables · Azure DevOps · CI/CD · Key Vault · Application Insights",
      image: assetUrl("images/etrm-migration.svg"),
      alt: "Illustrative flow for file ingestion and operations on a trading data platform.",
      description:
        "Technical delivery and operational tooling for the data platform supporting North American energy trading.",
      outcome: "Azure File Share sync: ~2 hours → ~2 minutes",
      details: [
        "The vendor established the Azure and Snowflake platform; I took over its code and deployment processes and extended it.",
        "I built a C# Azure Function to sync Endur files from Azure File Share to Blob Storage and standardize column names.",
        "Set up downstream processing with Snowpipe and Dynamic Tables, with data-quality checks, monitoring, and operational alerts.",
        "Supported approximately 70–80 file types across trading, profit and loss, market risk, credit risk, and accounting.",
        "My ownership covered technical pipeline readiness for the August 2026 launch, not the business transformation rules.",
      ],
      link: "",
    },
    {
      id: 2,
      title: "Market Data Refresh Modernization",
      category: "Uniper",
      technologies: "Snowflake Data Sharing · Stored Procedures · Dynamic Tables",
      image: assetUrl("images/market-data.svg"),
      alt: "Illustrative metadata refresh using Snowflake data sharing and Dynamic Tables.",
      status: "In testing",
      description:
        "Replacing API-based metadata ingestion with Snowflake data sharing.",
      outcome: "Metadata refresh: ~14–15 minutes → 30–40 seconds in testing",
      details: [
        "Developed a Wood Mackenzie and Genscape metadata integration using Snowflake shares, stored procedures for orchestration, and incremental Dynamic Tables for updates.",
        "This integration does not use dbt or Snowpipe.",
        "Related Platts and nomination-data work is still in progress.",
      ],
      link: "",
    },
    {
      id: 3,
      title: "Global HCP Engagement Reporting",
      category: "ZS Associates · Client: Pfizer",
      technologies: "Snowflake · Dataiku DSS · Tableau · Tableau REST API · Python · SQL",
      image: assetUrl("images/pharma-analytics.svg"),
      alt: "Illustrative healthcare engagement reporting and analytics flow.",
      description:
        "Data pipelines and weekly reporting for healthcare professional engagement across approximately 80–90 countries, with 300+ KPIs and more than one billion records in the reporting data.",
      outcome: "Reduced pipeline processing time by approximately 25%",
      details: [
        "Extended and maintained the existing GTM platform, managed weekly refreshes, investigated data issues, and improved Snowflake and Dataiku processing.",
        "Built Cockpit reporting pipelines from scratch for priority executive KPIs across approximately 20 countries.",
        "Reporting sources included email, web analytics, virtual and in-person meetings, events, and messaging channels, including WeChat in China.",
        "Presented findings and data-quality issues to client directors and senior directors in India and the US.",
        "A Tableau API utility applied filters and exported CSV and Excel reports, replacing recurring manual extraction and saving approximately 3–4 hours each week.",
        "A Python utility compares current and previous weekly results across 300+ KPIs, calculates absolute and percentage variances, and flags changes above 3% for review.",
        "An accepted internal GenAI pilot retrieves KPI values from generated Excel reports to assist variance review. It is a pilot, not production root-cause diagnosis.",
      ],
      link: "",
    },
    {
      id: 4,
      title: "MLOps for Engagement Models",
      category: "ZS Associates · Client: Novartis",
      technologies: "Databricks · Python · MLflow",
      image: assetUrl("images/tableau-automation.svg"),
      alt: "Illustrative machine-learning workflow with reusable code and MLflow tracking.",
      description:
        "Tracking, versioning, and reusable code for engagement-channel recommendation workflows across three brands.",
      outcome: "Reusable workflow components and versioned model outputs",
      details: [
        "The models recommended the next engagement channel for healthcare professionals, such as email, phone, or an in-person interaction.",
        "Split large Databricks notebooks into smaller modules and centralized reusable functions across brands.",
        "Integrated MLflow for runs, metrics, model registration, and versioning, and added timestamped model outputs.",
        "Contributed to team data-drift monitoring; I did not develop the predictive models.",
      ],
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
      title: "PRACTICAL AI",
      description: "Small tools for real team workflows",
      details:
        "At Uniper, I created a GitHub Copilot skill connected to Azure DevOps through MCP that the team actively uses. It applies the team’s ticket conventions and development context to draft work items, then creates them after explicit review and approval. It supports naming, tags, and work-item hierarchy.",
      tools: ["GitHub Copilot", "MCP", "Azure DevOps"],
    },
  },
};
