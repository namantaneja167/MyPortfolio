import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatBubble, ChatInput, TypingIndicator } from "@infinibay/harbor";

interface Message {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(1);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      from: "them",
      text: "Hi there! I'm a simulated AI assistant trained on Naman's professional background. You can ask me about his **skills**, **experience**, **impact**, or **projects**. How can I help?",
      time: "Just now",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Chatbot knowledge base
  const knowledgeBase: Record<string, { keywords?: string[]; response: string }> = {
    greetings: {
      keywords: ["hi", "hello", "hey", "greetings", "who are you", "what is this", "start"],
      response: "Hello! I'm Naman's AI assistant. I can tell you about his work in **Data Engineering** and **Gen AI**, his impact at **ZS Associates**, or his latest **RAG** projects. What's on your mind?",
    },
    skills: {
      keywords: [
        "skills", "tech", "stack", "languages", "tools", "know",
        "snowflake", "python", "sql", "azure", "dbt", "adf", "data factory",
        "databricks", "spark", "pandas", "dataiku", "excel", "git", "jira", "ci/cd",
        "etl", "orchestration", "automation"
      ],
      response: "Naman's technical arsenal is deep. Key skills include:\n• **Core:** Python, SQL (Snowflake), Databricks, Azure.\n• **ETL/Orchestration:** Dataiku DSS, dbt, Azure Data Factory.\n• **Gen AI:** LangChain, CrewAI, Ollama, RAG pipelines.\n• **Viz:** Tableau, Excel.",
    },
    ai: {
      keywords: ["ai", "gen ai", "llm", "rag", "agent", "langchain", "crewai", "ollama", "gpt", "bot", "dreambooth", "stable diffusion", "llama", "civitai", "100x"],
      response: "Naman is a **Gen AI Engineer** (via 100x Engineers Apprenticeship). He specializes in:\n• **Fine-tuning:** DreamBooth, Stable Diffusion, Llama Adapter.\n• **Frameworks:** LangChain, CrewAI, CivitAI.\n• **Deployment:** Building full-stack LLM apps and enterprise RAG solutions.",
    },
    tableau: {
      keywords: ["tableau", "dashboard", "viz", "visualization", "reporting", "xml", "rest api"],
      response: "Naman isn't just a Tableau user; he automates it. He built a **Python-based framework using Tableau REST APIs** that automated data extracts and XML manipulation, achieving **60% time savings** on manual reporting efforts.",
    },
    impact: {
      keywords: ["impact", "achievement", "accomplishment", "result", "metric", "savings", "kpi", "growth", "champion"],
      response: "Naman delivers measurable results:\n• **60% Time Savings** via Tableau automation.\n• **25% Faster Processing** for 1B+ records via Snowflake optimization.\n• **20% Efficiency Boost** in ML workflows using MLOps.\n• Recognized as a **Subject Matter Expert** and **Project Champion** at ZS.",
    },
    experience: {
      keywords: ["experience", "work", "job", "uniper", "zs", "history", "background", "career", "resume", "sme"],
      response: "He has 3+ years of experience:\n• **Uniper Energy (Present):** Architecting trading data systems.\n• **ZS Associates (3 Years):** Managed 1B+ healthcare records, automated 300+ KPIs, and led vendor onboarding as a **Project Champion Lead**.",
    },
    education: {
      keywords: ["education", "college", "degree", "btech", "school", "university", "study", "apprenticeship", "100x"],
      response: "• **Gen AI Engineer:** 100x Engineers Apprenticeship (2024).\n• **B.Tech (CS):** Guru Gobind Singh Indraprastha University (2018-2022).",
    },
    projects: {
      keywords: ["projects", "build", "portfolio", "architecture", "case study", "app"],
      response: "Key highlights:\n• **Energy Market Data Hub:** High-frequency trading signals.\n• **Pharma Commercial Intelligence:** 1B+ records, 300+ KPIs.\n• **Tableau Automation Framework:** Python + REST APIs.\nCheck the **Projects** section for more!",
    },
    contact: {
      keywords: ["contact", "email", "hire", "call", "reach", "linkedin", "phone", "message", "meeting", "schedule", "book", "sync"],
      response: "You can reach Naman directly at **er.namantaneja@gmail.com** or connect with him on **LinkedIn**. If you'd like to dive straight in, you can **[schedule a sync with him here](https://calendly.com/er-namantaneja/30min)**!",
    },
    default: {
      response: "I'm tuned to Naman's professional background. Try asking about his **Tableau automation**, **Gen AI projects**, or his **impact at ZS Associates**!",
    },
  };

  const quickPrompts = ["Experience?", "Technical Skills", "Contact Info", "Projects"];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Listen for Escape key to close chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setUnread(0);
  };

  const getBotResponse = (userInput: string): string => {
    const lowerText = userInput.toLowerCase().trim();

    // Match keywords
    for (const key in knowledgeBase) {
      if (key === "default") continue;
      const entry = knowledgeBase[key];
      if (entry.keywords && entry.keywords.some((kw) => lowerText.includes(kw))) {
        return entry.response;
      }
    }

    return knowledgeBase.default.response;
  };

  const handleSendMessage = (text: string) => {
    const userMsg: Message = {
      id: Math.random().toString(),
      from: "me",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate natural typing delay (800ms - 1500ms)
    const delay = Math.floor(Math.random() * 700 + 800);
    setTimeout(() => {
      const botReplyText = getBotResponse(text);
      const botReply: Message = {
        id: Math.random().toString(),
        from: "them",
        text: botReplyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    }, delay);
  };

  // Format message text with basic markdown styling (**bold** and \n lists)
  const formatMessageText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, lineIdx) => {
      // Split bold markers
      const parts = line.split(/\*\*([^*]+)\*\*/g);
      const renderedLine = parts.map((part, partIdx) => {
        // odd indices contain the bolded text due to capturing group split
        return partIdx % 2 === 1 ? <strong key={partIdx}>{part}</strong> : part;
      });

      // Handle bullet lists
      if (line.startsWith("• ")) {
        return (
          <li key={lineIdx} className="list-none pl-3 relative mt-1 first:mt-0">
            <span className="absolute left-0 top-0 text-accent">•</span>
            {renderedLine.slice(1)}
          </li>
        );
      }

      // Check if it's a link in markdown [label](url)
      const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const [full, label, url] = linkMatch;
        const before = line.substring(0, line.indexOf(full));
        const after = line.substring(line.indexOf(full) + full.length);
        return (
          <p key={lineIdx} className="mt-1 first:mt-0">
            {before}
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-accent-2 hover:underline font-semibold">
              {label}
            </a>
            {after}
          </p>
        );
      }

      return (
        <p key={lineIdx} className="mt-1 first:mt-0 min-h-[1em]">
          {renderedLine}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end">
      {/* Chat Trigger Button */}
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-accent text-[rgb(var(--harbor-brand-fg))] flex items-center justify-center shadow-[var(--harbor-shadow-lg)] relative hover:bg-accent-3 border border-white/10 outline-none cursor-pointer"
        aria-label="Chat with Naman's AI Assistant"
      >
        <i className={`bx ${isOpen ? "bx-x text-2xl" : "bx-bot text-2xl"}`} />
        <AnimatePresence>
          {unread > 0 && !isOpen && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[rgb(var(--harbor-danger))] text-[10px] font-bold flex items-center justify-center"
            >
              {unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="w-[360px] max-w-[calc(100vw-32px)] h-[500px] max-h-[calc(100vh-100px)] rounded-2xl border border-[color:var(--harbor-border-default)] bg-[var(--harbor-bg-elev-1)]/95 backdrop-blur-xl shadow-[var(--harbor-shadow-lg)] flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="p-4 border-b border-[color:var(--harbor-border-subtle)] flex items-center justify-between bg-[var(--harbor-bg-elev-2)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center text-accent">
                  <i className="bx bx-bot text-xl" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display text-[rgb(var(--harbor-text))]">
                    Naman's AI Agent
                  </h3>
                  <span className="text-[10px] text-[rgb(var(--harbor-success))] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--harbor-success))] animate-pulse" /> Online
                  </span>
                </div>
              </div>
              <button
                onClick={handleToggle}
                className="text-[rgb(var(--harbor-text-subtle))] hover:text-[rgb(var(--harbor-text))] transition-colors"
                aria-label="Close Chat Window"
              >
                <i className="bx bx-x text-xl" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin">
              {messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  from={msg.from}
                  time={msg.time}
                  avatar={
                    msg.from === "them" ? (
                      <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs">
                        <i className="bx bx-bot" />
                      </div>
                    ) : undefined
                  }
                  className={msg.from === "me" ? "spotlight-quiet" : ""}
                >
                  <div className="space-y-1">{formatMessageText(msg.text)}</div>
                </ChatBubble>
              ))}

              {isTyping && (
                <TypingIndicator
                  name="AI Agent"
                  className="bg-white/5 border border-white/10"
                />
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 text-xs font-medium rounded-full bg-white/[0.03] text-[rgb(var(--harbor-text-muted))] border border-white/[0.05] hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-all cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className="p-3 border-t border-[color:var(--harbor-border-subtle)] bg-[var(--harbor-bg-elev-2)]/50">
              <ChatInput
                onSend={handleSendMessage}
                placeholder="Ask Naman's agent anything..."
                className="bg-[var(--harbor-field-bg)] border-[color:var(--harbor-field-border)] focus-within:border-accent/50 text-[rgb(var(--harbor-text))]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
