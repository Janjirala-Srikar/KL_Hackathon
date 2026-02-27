import { useEffect, useRef } from "react";
import "../styles/landing.css";
import { Link } from "react-router-dom";


const REPORT_ITEMS = [
  { label: "Hemoglobin (HGB)", value: "14.2 g/dL", tag: "normal" },
  { label: "WBC Count", value: "11.8 K/µL", tag: "high" },
  { label: "Platelets", value: "148 K/µL", tag: "low" },
  { label: "Glucose (Fasting)", value: "98 mg/dL", tag: "normal" },
];

const HOW_STEPS = [
  {
    num: "01",
    title: "Upload your PDF lab report",
    desc: "Drag and drop or browse to upload any lab report. PDFPlumber extracts structured data with precision.",
  },
  {
    num: "02",
    title: "AI parses & benchmarks values",
    desc: "The RAG pipeline cross-references your results against a curated medical benchmark database in real time.",
  },
  {
    num: "03",
    title: "Receive a plain-language summary",
    desc: "Get a clear, jargon-free explanation of every value — what it means, why it matters, and what to ask your doctor.",
  },
  {
    num: "04",
    title: "Review flagged abnormalities",
    desc: "Abnormal values are highlighted with context, helping you understand significance without triggering unnecessary anxiety.",
  },
];

const FEATURES = [
  { icon: "🧾", theme: "green", title: "Intelligent PDF Parsing", desc: "PDFPlumber extracts tabular lab data from any report format with high accuracy, handling varied layouts." },
  { icon: "📊", theme: "warm", title: "Medical Benchmark Comparison", desc: "Every value is compared against curated, up-to-date reference ranges stratified by age and gender." },
  { icon: "🤖", theme: "blue", title: "RAG-Powered Explanations", desc: "LangChain retrieval-augmented generation fetches relevant medical knowledge for contextual, accurate summaries." },
  { icon: "🔴", theme: "purple", title: "Abnormality Highlighting", desc: "Critical and borderline values are clearly flagged with severity indicators and plain-English context." },
  { icon: "💬", theme: "gold", title: "Patient-Friendly Language", desc: "Complex medical terminology is translated into clear, calming language that anyone can understand." },
  { icon: "🔒", theme: "teal", title: "Privacy First", desc: "Reports are processed securely and never stored. Your medical data stays yours." },
];

const TECH_STACK = [
  { icon: "🐍", label: "Python" },
  { icon: "🦜", label: "LangChain" },
  { icon: "📄", label: "PDFPlumber" },
  { icon: "🔍", label: "RAG Pipeline" },
  { icon: "🧠", label: "LLM Integration" },
  { icon: "🗃️", label: "Vector Store" },
  { icon: "⚡", label: "FastAPI" },
  { icon: "📐", label: "Medical Benchmarks DB" },
];

const DELIVERABLES = [
  {
    num: "1",
    title: "Lab Report Intelligence Agent",
    desc: "A fully functional AI agent that parses, analyzes, and interprets diagnostic lab reports end-to-end.",
  },
  {
    num: "2",
    title: "Human-Friendly Report Generator",
    desc: "Generates readable, structured summaries that patients can act on and bring to follow-up appointments.",
  },
  {
    num: "3",
    title: "Demo with Sample Lab Reports",
    desc: "Live demonstration using real-world sample reports covering CBC, metabolic panels, and lipid profiles.",
  },
  {
    num: "4",
    title: "Medical Benchmark Reference System",
    desc: "A curated, queryable database of clinical reference ranges used to contextualize every lab value.",
  },
];

function useScrollAnimate() {
  const refs = useRef([]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return (i) => (el) => { refs.current[i] = el; };
}

export default function App() {
  const ref = useScrollAnimate();

  return (
    <>
      {/* NAV */}
      <nav>
        <a href="#" className="nav-logo">
          <span className="nav-logo-dot" />
          LabLens
        </a>
        <ul className="nav-links">
          
          <li>
            <Link to="/login" className="nav-cta">Login</Link>
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">
          
        </div>
        <h1>
          Lab reports, <em>finally</em>
          <br />
          explained clearly
        </h1>
        <p className="hero-sub">
          Turn complex lab reports into clear, human explanations.
        </p>
        <div className="hero-actions">
          <a href="#cta" className="btn-primary">Request Early Access</a>
          <a href="#how-it-works" className="btn-ghost">
            <span>▶</span> See how it works
          </a>
        </div>

        {/* DEMO REPORT */}
        <div className="hero-visual">
          <div className="report-header">
            <div className="report-dots">
              <span /><span /><span />
            </div>
            <span className="report-title">Complete Blood Count · Processed by LabLens</span>
          </div>
          <div className="report-body">
            <div>
              <p className="report-section-title">Raw Lab Values</p>
              {REPORT_ITEMS.map((item) => (
                <div className="report-item" key={item.label}>
                  <span className="report-label">{item.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="report-value">{item.value}</span>
                    <span className={`tag tag-${item.tag}`}>
                      {item.tag.charAt(0).toUpperCase() + item.tag.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <p className="report-section-title">AI-Generated Summary</p>
              <div className="report-summary">
                <div className="report-summary-header">
                  <div className="report-summary-icon">✦</div>
                  <span className="report-summary-label">LabLens Insight</span>
                </div>
                <p>
                  Your hemoglobin and glucose levels are within healthy ranges. Your white blood cell count is slightly elevated, which may suggest your body is actively fighting an infection. Platelets are mildly low — not an immediate concern, but worth discussing with your doctor at your next visit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      {/* <section className="how-section" id="how-it-works">
        <div className="how-inner">
          <div ref={ref(0)} className="animate-in">
            <p className="section-label">How It Works</p>
            <h2 className="section-title">From raw data to clear understanding in seconds</h2>
            <p className="section-sub">
              A four-step pipeline designed around the patient experience — not the clinician's workflow.
            </p>
          </div>
          <div className="steps" ref={ref(1)}>
            {HOW_STEPS.map((s) => (
              <div className="step animate-in" key={s.num} ref={ref(`step-${s.num}`)}>
                <div className="step-num">{s.num}</div>
                <div className="step-content">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* FEATURES */}
      <section id="features" style={{ maxWidth: "none" }}>
        <div className="features-section" style={{ maxWidth: 1140, margin: "0 auto" }}>
          <p className="section-label" ref={ref(10)} style={{}} >Features</p>
          <h2 className="section-title">Everything a patient needs to feel informed</h2>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div className="feature-card animate-in" key={f.title} ref={ref(20 + i)}>
                <div className={`feature-icon ${f.theme}`}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      {/* <section className="tech-section" id="tech-stack">
        <div className="tech-inner">
          <div ref={ref(30)} className="animate-in">
            <p className="section-label">Tech Stack</p>
            <h2 className="section-title">Built on a foundation of proven AI infrastructure</h2>
            <p className="section-sub">
              Python, LangChain, PDFPlumber, and a RAG pipeline combine to form a robust, scalable diagnostic intelligence system.
            </p>
          </div>
          <div ref={ref(31)} className="animate-in">
            <div className="tech-chips">
              {TECH_STACK.map((t) => (
                <div className="chip" key={t.label}>
                  <span className="chip-icon">{t.icon}</span>
                  {t.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section> */}

      {/* DELIVERABLES */}
      <section className="deliverables-section" id="deliverables">
        <div className="deliverables-inner">
          <div ref={ref(40)} className="animate-in">
            <p className="section-label">Deliverables</p>
            <h2 className="section-title">What we're shipping</h2>
          </div>
          <div className="deliverables-grid">
            {DELIVERABLES.map((d, i) => (
              <div className="deliverable-card animate-in" key={d.num} ref={ref(50 + i)}>
                <div className="deliverable-num">{d.num}</div>
                <div>
                  <h3>{d.title}</h3>
                  <p>{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="cta">
        <div className="cta-inner animate-in" ref={ref(60)}>
          <p className="section-label">Get Started</p>
          <h2 className="section-title">Your lab report shouldn't feel like a mystery</h2>
          <p className="section-sub">
            Join the waitlist for early access. Be the first to experience healthcare clarity powered by AI.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:hello@lablens.ai" className="btn-primary">Request Early Access</a>
            <a href="#how-it-works" className="btn-ghost">Learn more</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
  <div>
    <div className="footer-left">
      <span className="nav-logo-dot" />
      LabLens
    </div>
    <p className="footer-tagline">
      AI-powered Lab Report Intelligence · Making Diagnostics Understandable
    </p>
  </div>
  <div className="footer-right">
    Team Lumora 
  </div>
</footer>
    </>
  );
}