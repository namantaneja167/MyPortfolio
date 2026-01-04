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
            challenge: "Handling high-frequency time-series data with zero data loss.",
            outcome: "Reduced query latency by 40% for trading desks.",
            stack: ["Snowflake", "Azure", "dbt", "Airflow"],
            theme: "energy-theme",
            icon: "bx-bolt-circle",
            type: "Cloud Infrastructure",
            link: "#",
            linkText: "Enterprise",
            linkIcon: "bx-lock-alt",
            linkClass: "disabled"
        },
        {
            title: "Pharma Commercial Intelligence",
            description: "End-to-end commercial analytics pipeline processing over 1 billion healthcare records. Automated reporting for 300+ KPIs to drive Go-to-Market strategies.",
            challenge: "Complex data governance and privacy (HIPAA) requirements.",
            outcome: "Automated 95% of manual reporting workflows.",
            stack: ["Dataiku", "Python", "SQL", "Tableau"],
            theme: "pharma-theme",
            icon: "bx-capsule",
            type: "Big Data ETL",
            link: "#",
            linkText: "Enterprise",
            linkIcon: "bx-lock-alt",
            linkClass: "disabled"
        },
        {
            title: "Enterprise RAG Knowledge Agent",
            description: "A Retrieval-Augmented Generation system that allows teams to query internal documentation using natural language. Built with agentic workflows for complex reasoning.",
            stack: ["LangChain", "CrewAI", "Docker", "React"], // Used for "Project Stack" meta row if needed, or tech tags
            meta: {
                stack: "LangChain, Pinecone Vector DB, OpenAI API.",
                outcome: "Instant knowledge retrieval for engineering teams."
            },
            theme: "ai-theme",
            icon: "bx-brain",
            type: "Gen AI & RAG",
            link: "https://github.com/namantaneja167",
            linkText: "View Code",
            linkIcon: "bxl-github",
            linkClass: ""
        }
    ],

    // Skills Section
    skills: [
        { name: "Snowflake", icon: "bxs-data", class: "snowflake", level: 5 },
        { name: "Python", icon: "bxl-python", class: "python", level: 5 },
        { name: "Databricks", icon: "bx-chip", class: "databricks", level: 4 },
        { name: "Azure", icon: "bxl-microsoft", class: "azure", level: 4 },
        { name: "Git", icon: "bxl-git", class: "git", level: 5 },
        { name: "DBT", icon: "bx-transfer", class: "dbt", level: 4 },
        { name: "Azure Data Factory", icon: "bx-git-merge", class: "adf", level: 4 },
        { name: "CrewAI", icon: "bx-bot", class: "crewai", level: 4 },
        { name: "RAG", icon: "bx-search-alt-2", class: "rag", level: 4 },
        { name: "Dataiku DSS", icon: "bx-cog", class: "dataiku", level: 5 },
        { name: "SQL", icon: "bx-data", class: "sql", level: 5 },
        { name: "Tableau", icon: "bx-bar-chart-alt-2", class: "tableau", level: 5 },
        { name: "LangChain", icon: "bx-link-alt", class: "langchain", level: 4 },
        { name: "Ollama", icon: "bx-brain", class: "ollama", level: 4 },
        { name: "Excel", icon: "bx-table", class: "excel", level: 5 },
        { name: "CI/CD", icon: "bx-infinite", class: "cicd", level: 4 },
        { name: "Jira", icon: "bxl-trello", class: "jira", level: 4 },
        { name: "ETL Pipelines", icon: "bx-code-alt", class: "placeholder", level: 5 }
    ],

    // Chat Bot Knowledge Base
    chatKnowledgeBase: {
        greetings: {
            keywords: ['hi', 'hello', 'hey', 'greetings', 'who are you', 'what is this'],
            response: "Hello! I'm Naman's AI assistant. I can tell you about his expertise in **Data Engineering**, **Gen AI**, or his work at **Uniper** and **ZS Associates**. What would you like to know?"
        },
        skills: {
            keywords: [
                'skills', 'tech', 'stack', 'languages', 'tools', 'know', 
                'snowflake', 'python', 'sql', 'azure', 'dbt', 'adf', 'data factory', 
                'databricks', 'spark', 'pandas', 'dataiku', 'tableau', 'excel', 'git', 'jira', 'ci/cd'
            ],
            response: "Naman is a heavy-hitter in the modern data stack. His core skills include **Snowflake**, **Python**, **SQL**, **Azure**, and **dbt**. He's also specialized in **Databricks**, **Azure Data Factory**, and **Dataiku DSS**."
        },
        ai: {
            keywords: ['ai', 'gen ai', 'llm', 'rag', 'agent', 'langchain', 'crewai', 'ollama', 'gpt', 'bot'],
            response: "Naman is deeply involved in **Generative AI**. He builds **RAG (Retrieval-Augmented Generation)** systems and **AI Agents** using frameworks like **LangChain**, **CrewAI**, and **Ollama**. He even built me! 😉"
        },
        experience: {
            keywords: ['experience', 'work', 'job', 'uniper', 'zs', 'history', 'background', 'career', 'resume'],
            response: "He has 3+ years of experience. Currently, he's at **Uniper Energy** architecting trading data systems. Previously, he spent 2 years at **ZS Associates** managing healthcare data at a massive scale (1B+ records)."
        },
        projects: {
            keywords: ['projects', 'build', 'portfolio', 'architecture', 'case study', 'app'],
            response: "Some of his key works include an **Energy Market Data Hub**, a **Pharma KPI Automation** pipeline, and an **Enterprise RAG Knowledge Agent**. You can see the full details in the **Projects** section of this site!"
        },
        contact: {
            keywords: ['contact', 'email', 'hire', 'call', 'reach', 'linkedin', 'phone', 'message', 'meeting', 'schedule', 'book', 'sync'],
            response: "You can reach Naman directly at **er.namantaneja@gmail.com** or connect with him on **LinkedIn**. If you'd like to dive straight in, you can **[schedule a sync with him here](https://calendly.com/er-namantaneja/30min)**!"
        },
        default: {
            response: "I'm not quite sure about that yet. I'm trained to answer questions about Naman's **tech stack** (like Snowflake or Python), **projects**, and **work history**. Try asking 'What does he know about Gen AI?'"
        }
    }
};
