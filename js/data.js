/* ============================================
   Portfolio Data Store
   ============================================ */
window.PORTFOLIO_DATA = {
    // Identity & Contact
    profile: {
        name: "Naman Taneja",
        role: "Data Engineer",
        tagline: "Building the future of data and AI.",
        email: "er.namantaneja@gmail.com",
        calendly: "https://calendly.com/er-namantaneja/30min",
        socials: {
            linkedin: "https://www.linkedin.com/in/namantaneja167/",
            medium: "https://medium.com/@namantaneja167",
            twitter: "https://x.com/naman_taneja_",
            github: "https://github.com/namantaneja167"
        }
    },

    // Projects Section
    projects: [
        {
            title: "Energy Market Data Hub",
            description: "A high-throughput trading data platform designed for North American electricity markets. Ingests millions of real-time market signals to empower trading algorithms.",
            stack: ["Snowflake", "Azure", "dbt", "Airflow"],
            theme: "energy-theme",
            icon: "bx-bolt-circle",
            link: "",
            linkText: "Enterprise Project",
            linkIcon: "bx-lock-alt",
            linkClass: "disabled"
        },
        {
            title: "Pharma Commercial Intelligence",
            description: "End-to-end commercial analytics pipeline processing over 1 billion healthcare records. Automated reporting for 300+ KPIs to drive Go-to-Market strategies.",
            stack: ["Dataiku", "Python", "SQL", "Tableau"],
            theme: "pharma-theme",
            icon: "bx-capsule",
            link: "",
            linkText: "Enterprise Project",
            linkIcon: "bx-lock-alt",
            linkClass: "disabled"
        },
        {
            title: "Enterprise RAG Knowledge Agent",
            description: "A Retrieval-Augmented Generation system that allows teams to query internal documentation using natural language. Built with agentic workflows for complex reasoning.",
            stack: ["LangChain", "CrewAI", "Docker", "React"], // Used for "Project Stack" meta row if needed, or tech tags
            theme: "ai-theme",
            icon: "bx-brain",
            link: "https://github.com/namantaneja167",
            linkText: "View Code",
            linkIcon: "bxl-github",
            linkClass: ""
        }
    ],

    // Skills Section
    skills: [
        { name: "Snowflake", icon: "bxs-data", class: "snowflake", level: 5, category: "Data Engineering" },
        { name: "Python", icon: "bxl-python", class: "python", level: 5, category: "Languages" },
        { name: "Databricks", icon: "bx-chip", class: "databricks", level: 4, category: "Data Engineering" },
        { name: "Azure", icon: "bxl-microsoft", class: "azure", level: 4, category: "Cloud" },
        { name: "Git", icon: "bxl-git", class: "git", level: 5, category: "Tools" },
        { name: "DBT", icon: "bx-transfer", class: "dbt", level: 4, category: "Data Engineering" },
        { name: "Azure Data Factory", icon: "bx-git-merge", class: "adf", level: 4, category: "Data Engineering" },
        { name: "CrewAI", icon: "bx-bot", class: "crewai", level: 4, category: "Gen AI" },
        { name: "RAG", icon: "bx-search-alt-2", class: "rag", level: 4, category: "Gen AI" },
        { name: "Dataiku DSS", icon: "bx-cog", class: "dataiku", level: 5, category: "Data Engineering" },
        { name: "SQL", icon: "bx-data", class: "sql", level: 5, category: "Languages" },
        { name: "Tableau", icon: "bx-bar-chart-alt-2", class: "tableau", level: 5, category: "Data Engineering" },
        { name: "LangChain", icon: "bx-link-alt", class: "langchain", level: 4, category: "Gen AI" },
        { name: "Ollama", icon: "bx-brain", class: "ollama", level: 4, category: "Gen AI" },
        { name: "Excel", icon: "bx-table", class: "excel", level: 5, category: "Tools" },
        { name: "CI/CD", icon: "bx-infinite", class: "cicd", level: 4, category: "Cloud" },
        { name: "Jira", icon: "bxl-trello", class: "jira", level: 4, category: "Tools" },
        { name: "ETL Pipelines", icon: "bx-code-alt", class: "placeholder", level: 5, category: "Data Engineering" }
    ],

    // Chat Bot Knowledge Base
    chatKnowledgeBase: {
        quickPrompts: ["Experience?", "Technical Skills", "Contact Info", "Projects"],
        greetings: {
            keywords: ['hi', 'hello', 'hey', 'greetings', 'who are you', 'what is this', 'start'],
            response: "Hello! I'm Naman's AI assistant. I can tell you about his work in **Data Engineering** and **Gen AI**, his impact at **ZS Associates**, or his latest **RAG** projects. What's on your mind?"
        },
        skills: {
            keywords: [
                'skills', 'tech', 'stack', 'languages', 'tools', 'know',
                'snowflake', 'python', 'sql', 'azure', 'dbt', 'adf', 'data factory',
                'databricks', 'spark', 'pandas', 'dataiku', 'excel', 'git', 'jira', 'ci/cd',
                'etl', 'orchestration', 'automation'
            ],
            response: "Naman's technical arsenal is deep. Key skills include:\n• **Core:** Python, SQL (Snowflake), Databricks, Azure.\n• **ETL/Orchestration:** Dataiku DSS, dbt, Azure Data Factory.\n• **Gen AI:** LangChain, CrewAI, Ollama, RAG pipelines.\n• **Viz:** Tableau, Excel."
        },
        ai: {
            keywords: ['ai', 'gen ai', 'llm', 'rag', 'agent', 'langchain', 'crewai', 'ollama', 'gpt', 'bot', 'dreambooth', 'stable diffusion', 'llama', 'civitai', '100x'],
            response: "Naman is a **Gen AI Engineer** (via 100x Engineers Apprenticeship). He specializes in:\n• **Fine-tuning:** DreamBooth, Stable Diffusion, Llama Adapter.\n• **Frameworks:** LangChain, CrewAI, CivitAI.\n• **Deployment:** Building full-stack LLM apps and enterprise RAG solutions."
        },
        tableau: {
            keywords: ['tableau', 'dashboard', 'viz', 'visualization', 'reporting', 'xml', 'rest api'],
            response: "Naman isn't just a Tableau user; he automates it. He built a **Python-based framework using Tableau REST APIs** that automated data extracts and XML manipulation, achieving **60% time savings** on manual reporting efforts."
        },
        impact: {
            keywords: ['impact', 'achievement', 'accomplishment', 'result', 'metric', 'savings', 'kpi', 'growth', 'champion'],
            response: "Naman delivers measurable results:\n• **60% Time Savings** via Tableau automation.\n• **25% Faster Processing** for 1B+ records via Snowflake optimization.\n• **20% Efficiency Boost** in ML workflows using MLOps.\n• Recognized as a **Subject Matter Expert** and **Project Champion** at ZS."
        },
        experience: {
            keywords: ['experience', 'work', 'job', 'uniper', 'zs', 'history', 'background', 'career', 'resume', 'sme'],
            response: "He has 3+ years of experience:\n• **Uniper Energy (Present):** Architecting trading data systems.\n• **ZS Associates (3 Years):** Managed 1B+ healthcare records, automated 300+ KPIs, and led vendor onboarding as a **Project Champion Lead**."
        },
        education: {
            keywords: ['education', 'college', 'degree', 'btech', 'school', 'university', 'study', 'apprenticeship', '100x'],
            response: "• **Gen AI Engineer:** 100x Engineers Apprenticeship (2024).\n• **B.Tech (CS):** Guru Gobind Singh Indraprastha University (2018-2022)."
        },
        projects: {
            keywords: ['projects', 'build', 'portfolio', 'architecture', 'case study', 'app'],
            response: "Key highlights:\n• **Energy Market Data Hub:** High-frequency trading signals.\n• **Pharma Commercial Intelligence:** 1B+ records, 300+ KPIs.\n• **Tableau Automation Framework:** Python + REST APIs.\nCheck the **Projects** section for more!"
        },
        contact: {
            keywords: ['contact', 'email', 'hire', 'call', 'reach', 'linkedin', 'phone', 'message', 'meeting', 'schedule', 'book', 'sync'],
            response: "You can reach Naman directly at **er.namantaneja@gmail.com** or connect with him on **LinkedIn**. If you'd like to dive straight in, you can **[schedule a sync with him here](https://calendly.com/er-namantaneja/30min)**!"
        },
        default: {
            response: "I'm tuned to Naman's professional background. Try asking about his **Tableau automation**, **Gen AI projects**, or his **impact at ZS Associates**!"
        }
    }
};
