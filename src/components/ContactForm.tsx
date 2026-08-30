import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TextField, Textarea, CopyButton } from "@infinibay/harbor";

export function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [fieldErrors, setFieldErrors] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    const errors = { name: "", email: "", message: "" };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "Name is required.";
      isValid = false;
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required.";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
      isValid = false;
    }
    if (!formData.message.trim()) {
      errors.message = "Message is required.";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError("");

    try {
      const response = await fetch("https://formspree.io/f/xvgebpon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: "", email: "", message: "" });
      } else {
        const data = await response.json();
        setApiError(data.error || "Oops! There was a problem submitting your message.");
      }
    } catch (err) {
      setApiError("Unable to connect to the server. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-layout grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      {/* Left Column: Contact details & copy email */}
      <div className="flex flex-col gap-6">
        <span className="text-accent font-mono font-bold tracking-widest text-sm uppercase">06</span>
        <h2 className="text-4xl md:text-5xl font-display font-extrabold text-[rgb(var(--harbor-text))] leading-none">
          Let's Work<br />Together
        </h2>
        <p className="text-base leading-relaxed text-[rgb(var(--harbor-text-muted))] max-w-md">
          Open to data engineering roles and consulting collaborations. Share your scope, timeline, and constraints, and I will reply with a clear next step.
        </p>

        <div className="flex flex-col gap-4 mt-6">
          {/* Email row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-[color:var(--harbor-border-default)] bg-[var(--harbor-bg-elev-1)] gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold text-[rgb(var(--harbor-text-subtle))] uppercase tracking-wider">Email</span>
              <span className="text-sm font-semibold text-[rgb(var(--harbor-text))]">er.namantaneja@gmail.com</span>
            </div>
            <CopyButton value="er.namantaneja@gmail.com" size="sm" className="self-start md:self-auto">
              Copy Email
            </CopyButton>
          </div>

          {/* Status row */}
          <div className="flex items-center gap-3 p-4 rounded-xl border border-[color:var(--harbor-border-default)] bg-[var(--harbor-bg-elev-1)]">
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold text-[rgb(var(--harbor-text-subtle))] uppercase tracking-wider">Status</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-[rgb(var(--harbor-success))] animate-pulse" />
                <span className="text-sm font-semibold text-[rgb(var(--harbor-text))]">Available - replies within 24 hours</span>
              </div>
            </div>
          </div>

          {/* Social connections */}
          <div className="flex flex-col p-4 rounded-xl border border-[color:var(--harbor-border-default)] bg-[var(--harbor-bg-elev-1)] gap-1">
            <span className="text-xs font-mono font-bold text-[rgb(var(--harbor-text-subtle))] uppercase tracking-wider mb-2">Connect</span>
            <div className="flex flex-wrap gap-4">
              {[
                { name: "LinkedIn", href: "https://www.linkedin.com/in/namantaneja167/" },
                { name: "Medium", href: "https://medium.com/@namantaneja167" },
                { name: "X", href: "https://x.com/naman_taneja_" },
                { name: "GitHub", href: "https://github.com/namantaneja167" },
              ].map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-accent-2 hover:text-accent transition-colors"
                >
                  {link.name} &rarr;
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Contact form / success message */}
      <div className="p-6 md:p-8 rounded-2xl border border-[color:var(--harbor-border-default)] bg-[var(--harbor-bg-elev-1)]/50 backdrop-blur-md shadow-[var(--harbor-shadow-md)]">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-6"
            >
              {/* Name */}
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={fieldErrors.name}
                valid={formData.name.trim().length > 0}
                required
                placeholder="Your name"
              />

              {/* Email */}
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={fieldErrors.email}
                valid={emailRegex.test(formData.email)}
                required
                placeholder="your@email.com"
              />

              {/* Message */}
              <Textarea
                label="Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                maxChars={1000}
                required
                placeholder="What would you like to discuss?"
                className={`${fieldErrors.message ? "border-[rgb(var(--harbor-danger)/0.60)]" : ""}`}
              />
              {fieldErrors.message && (
                <p className="text-xs text-[rgb(var(--harbor-danger))] -mt-4">{fieldErrors.message}</p>
              )}

              {/* API Submission Error */}
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-lg bg-[rgb(var(--harbor-danger)/0.15)] border border-[rgb(var(--harbor-danger)/0.25)] text-sm text-[rgb(var(--harbor-danger))]"
                >
                  {apiError}
                </motion.div>
              )}

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 text-sm font-semibold rounded-lg bg-accent text-[rgb(var(--harbor-brand-fg))] hover:bg-accent-3 flex items-center justify-center gap-2 active:scale-95 shadow-[var(--harbor-shadow-sm)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <>
                    <i className="bx bx-loader-alt bx-spin text-lg" /> Sending…
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center py-12 gap-5"
            >
              <div className="w-16 h-16 rounded-full bg-[rgb(var(--harbor-success)/0.15)] border-2 border-[rgb(var(--harbor-success)/0.3)] flex items-center justify-center text-[rgb(var(--harbor-success))] text-3xl">
                <i className="bx bx-check" />
              </div>
              <h3 className="text-2xl font-bold font-display text-[rgb(var(--harbor-text))]">
                Message Sent!
              </h3>
              <p className="text-sm leading-relaxed text-[rgb(var(--harbor-text-muted))] max-w-sm">
                Thank you for reaching out. Your message has been sent successfully, and I will get back to you shortly.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-4 px-6 py-2.5 text-xs font-semibold rounded-lg border border-[color:var(--harbor-border-default)] bg-[var(--harbor-bg-elev-1)] hover:bg-[var(--harbor-bg-elev-2)] text-[rgb(var(--harbor-text))] transition-all"
              >
                Send Another Message
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
