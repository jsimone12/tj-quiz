"use client";

import { useState } from "react";

// =====================================================================
// REAL ESTATE PORTFOLIO QUIZ  |  Top-of-funnel lead capture
// Fresh brand direction for TJ: premium masculine wealth, dark, clean.
// Hero accent: emerald. Detail accent: bronze hairline. Type: bone.
//
// GHL WIRING NOTE (for later, on the Vercel build):
// In handleCapture, POST { email, answers, result } to your capture
// endpoint (Sheetmonkey or EmailJS for now, GHL when restored).
// The quiz already tags by result type so nurture can route by segment.
// =====================================================================

const QUESTIONS = [
  {
    q: "What excites you most about real estate?",
    a: [
      { t: "Transforming a property and selling for profit", v: "F" },
      { t: "Steady monthly income that builds over time", v: "L" },
      { t: "I'm still figuring out where to start", v: "B" },
    ],
  },
  {
    q: "How much time can you put in week to week?",
    a: [
      { t: "A lot, I want to be hands on", v: "F" },
      { t: "Some, but I want systems doing the work", v: "L" },
      { t: "Not sure yet, depends on the strategy", v: "B" },
    ],
  },
  {
    q: "How do you feel about managing contractors or renovations?",
    a: [
      { t: "Love it, that's the fun part", v: "F" },
      { t: "Rather avoid it or hand it off", v: "L" },
      { t: "Never done it", v: "B" },
    ],
  },
  {
    q: "What's your current capital situation?",
    a: [
      { t: "$50k+ ready to deploy, and strong access to credit/funding", v: "F" },
      { t: "$10k to $50k and building, with decent credit to leverage", v: "L" },
      { t: "Under $10k right now, and working on my credit", v: "B" },
    ],
  },
  {
    q: "Where do you want to be in 3 years?",
    a: [
      { t: "Multiple flips done, profit in hand", v: "F" },
      { t: "A portfolio paying me every month", v: "L" },
      { t: "My first deal closed with confidence", v: "B" },
    ],
  },
];

const RESULTS = {
  F: {
    type: "The Flipper",
    body:
      "You see potential where others see problems, and you want the win you can hold in your hands. Let's get you flipping smart so your first project pays off.",
  },
  L: {
    type: "The Landlord",
    body:
      "You think long term and you want money that works while you sleep. Let's build you a portfolio that pays every month.",
  },
  B: {
    type: "The Beginner Builder",
    body:
      "That's the best place to start. You're ready to learn the right way before risking a dollar. Let's get your first deal closed with confidence.",
  },
};

function score(answers) {
  // Q4 (capital) is a gate: under $10k + working on credit forces Beginner
  // Builder no matter how they answered the rest. They can't flip or buy yet.
  if (answers[3] === "B") return "B";

  const tally = { F: 0, L: 0, B: 0 };
  answers.forEach((v) => (tally[v] += 1));
  const max = Math.max(tally.F, tally.L, tally.B);
  const top = ["F", "L", "B"].filter((k) => tally[k] === max);
  // Ties break toward B, keeping cold leads in the lowest-pressure lane.
  return top.length > 1 ? "B" : top[0];
}

export default function PortfolioQuiz() {
  const [step, setStep] = useState("welcome"); // welcome | 0..4 | capture | result
  const [answers, setAnswers] = useState([]);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "" });
  const [touched, setTouched] = useState(false);
  const [result, setResult] = useState(null);

  const setField = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const phoneValid = form.phone.replace(/\D/g, "").length >= 10;
  const nameValid = form.firstName.trim() !== "" && form.lastName.trim() !== "";
  const formValid = nameValid && phoneValid && emailValid;

  const pick = (v) => {
    const next = [...answers, v];
    setAnswers(next);
    if (next.length === QUESTIONS.length) setStep("capture");
    else setStep(next.length);
  };

 const handleCapture = () => {
    setTouched(true);
    if (!formValid) return;
    const r = score(answers);

    // Build readable answers for GHL (matches each answer code to its text)
    const readableAnswers = answers.map(
      (v, i) => QUESTIONS[i].a.find((o) => o.v === v).t
    );

    // Send the lead to GHL via inbound webhook
    fetch(
      "https://services.leadconnectorhq.com/hooks/DvWTrdD23UD09zv6GgZj/webhook-trigger/19706384-766d-419f-93ed-8f50289d287d",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone,
          email: form.email,
          investor_type: RESULTS[r].type,
          q1_excites: readableAnswers[0],
          q2_time: readableAnswers[1],
          q3_renovations: readableAnswers[2],
          q4_capital: readableAnswers[3],
          q5_three_years: readableAnswers[4],
        }),
      }
    ).catch((err) => console.error("GHL webhook error:", err));

    setResult(r);
    setStep("result");
  };

  const restart = () => {
    setAnswers([]);
    setForm({ firstName: "", lastName: "", phone: "", email: "" });
    setTouched(false);
    setResult(null);
    setStep("welcome");
  };

  const qIndex = typeof step === "number" ? step : null;
  const progress =
    typeof step === "number"
      ? step
      : step === "capture"
      ? QUESTIONS.length
      : step === "result"
      ? QUESTIONS.length
      : 0;

  return (
    <div className="req-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');

        .req-root {
          --bg: #0a0d0c;
          --bg2: #0e1311;
          --surface: #131917;
          --line: rgba(181, 137, 90, 0.28);
          --emerald: #2f9d72;
          --emerald-deep: #1f6e4e;
          --bone: #ece9e1;
          --muted: #8b948f;
          --bronze: #b5895a;
          min-height: 560px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background:
            radial-gradient(120% 90% at 50% -10%, rgba(47,157,114,0.10), transparent 60%),
            radial-gradient(100% 80% at 100% 110%, rgba(181,137,90,0.07), transparent 55%),
            var(--bg);
          font-family: 'Hanken Grotesk', sans-serif;
          color: var(--bone);
          position: relative;
        }
        .req-root::after {
          content: "";
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .req-card {
          width: 100%;
          max-width: 620px;
          position: relative;
          z-index: 1;
        }
        .req-eyebrow {
          font-size: 11px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--bronze);
          font-weight: 600;
          margin-bottom: 22px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .req-eyebrow::before {
          content: "";
          width: 34px; height: 1px;
          background: var(--bronze);
          display: inline-block;
        }
        .req-display {
          font-family: 'Fraunces', serif;
          font-weight: 500;
          line-height: 1.08;
          letter-spacing: -0.01em;
          color: var(--bone);
        }
        .req-h1 { font-size: clamp(34px, 6vw, 52px); }
        .req-q { font-size: clamp(26px, 4.6vw, 36px); margin-bottom: 30px; }
        .req-sub {
          color: var(--muted);
          font-size: 16px;
          line-height: 1.6;
          margin: 18px 0 34px;
          max-width: 460px;
        }
        .req-opt {
          width: 100%;
          text-align: left;
          background: var(--surface);
          border: 1px solid rgba(255,255,255,0.06);
          border-left: 2px solid transparent;
          color: var(--bone);
          padding: 18px 20px;
          margin-bottom: 12px;
          border-radius: 10px;
          font-size: 16px;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.22s ease;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .req-opt:hover {
          border-color: rgba(47,157,114,0.4);
          border-left-color: var(--emerald);
          transform: translateX(4px);
          background: #161d1a;
        }
        .req-dot {
          width: 8px; height: 8px; border-radius: 50%;
          border: 1px solid var(--bronze);
          flex-shrink: 0;
          transition: all 0.22s ease;
        }
        .req-opt:hover .req-dot { background: var(--emerald); border-color: var(--emerald); }
        .req-btn {
          background: var(--emerald);
          color: #06140e;
          border: none;
          padding: 17px 34px;
          border-radius: 10px;
          font-family: inherit;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: all 0.22s ease;
        }
        .req-btn:hover { background: #36b283; transform: translateY(-2px); box-shadow: 0 12px 30px rgba(47,157,114,0.25); }
        .req-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }
        .req-input {
          width: 100%;
          background: var(--bg2);
          border: 1px solid var(--line);
          color: var(--bone);
          padding: 17px 18px;
          border-radius: 10px;
          font-size: 16px;
          font-family: inherit;
          margin-bottom: 8px;
          box-sizing: border-box;
          transition: border-color 0.2s ease;
        }
        .req-input:focus { outline: none; border-color: var(--emerald); }
        .req-input::placeholder { color: #5f6864; }
        .req-row { display: flex; gap: 12px; }
        .req-row .req-input { flex: 1; }
        @media (max-width: 440px) { .req-row { flex-direction: column; gap: 0; } }
        .req-err { color: #d98a7a; font-size: 13px; min-height: 18px; margin-bottom: 14px; }
        .req-meta {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 26px;
        }
        .req-count { font-size: 12px; letter-spacing: 0.2em; color: var(--muted); font-variant-numeric: tabular-nums; }
        .req-track { flex: 1; height: 2px; background: rgba(255,255,255,0.08); margin-left: 18px; border-radius: 2px; overflow: hidden; }
        .req-fill { height: 100%; background: linear-gradient(90deg, var(--emerald-deep), var(--emerald)); border-radius: 2px; transition: width 0.4s cubic-bezier(.4,0,.2,1); }
        .req-result-type {
          font-family: 'Fraunces', serif;
          font-size: clamp(40px, 8vw, 64px);
          font-weight: 600;
          color: var(--emerald);
          line-height: 1;
          margin-bottom: 20px;
        }
        .req-cta-row { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; margin-top: 36px; }
        .req-ghost {
          background: none; border: none; color: var(--muted);
          font-family: inherit; font-size: 14px; cursor: pointer; text-decoration: underline; text-underline-offset: 3px;
        }
        .req-ghost:hover { color: var(--bone); }
        .req-fade { animation: reqFade 0.5s cubic-bezier(.16,1,.3,1) both; }
        .req-fade-2 { animation: reqFade 0.5s cubic-bezier(.16,1,.3,1) 0.08s both; }
        .req-fade-3 { animation: reqFade 0.5s cubic-bezier(.16,1,.3,1) 0.16s both; }
        @keyframes reqFade { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="req-card">
        {step === "welcome" && (
          <div>
            <div className="req-eyebrow req-fade">Real Estate Portfolio Quiz</div>
            <h1 className="req-display req-h1 req-fade-2">
              How to Build Your<br />Real Estate Portfolio?
            </h1>
            <p className="req-sub req-fade-3">
              Answer 5 quick questions and discover the exact path that fits your
              goals, your capital, and the life you want to build. Takes under a minute.
            </p>
            <button className="req-btn req-fade-3" onClick={() => setStep(0)}>
              Start the Quiz
            </button>
          </div>
        )}

        {qIndex !== null && (
          <div key={qIndex}>
            <div className="req-meta req-fade">
              <span className="req-count">
                {String(qIndex + 1).padStart(2, "0")} / {String(QUESTIONS.length).padStart(2, "0")}
              </span>
              <div className="req-track">
                <div className="req-fill" style={{ width: `${(progress / QUESTIONS.length) * 100}%` }} />
              </div>
            </div>
            <h2 className="req-display req-q req-fade-2">{QUESTIONS[qIndex].q}</h2>
            <div className="req-fade-3">
              {QUESTIONS[qIndex].a.map((opt, i) => (
                <button key={i} className="req-opt" onClick={() => pick(opt.v)}>
                  <span className="req-dot" />
                  {opt.t}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "capture" && (
          <div>
            <div className="req-eyebrow req-fade">Last step</div>
            <h2 className="req-display req-q req-fade-2">
              Where should we send your results?
            </h2>
            <div className="req-fade-3">
              <div className="req-row">
                <input
                  className="req-input"
                  type="text"
                  placeholder="First name"
                  value={form.firstName}
                  onChange={setField("firstName")}
                />
                <input
                  className="req-input"
                  type="text"
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={setField("lastName")}
                />
              </div>
              <input
                className="req-input"
                type="tel"
                placeholder="Phone number"
                value={form.phone}
                onChange={setField("phone")}
              />
              <input
                className="req-input"
                type="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={setField("email")}
                onKeyDown={(e) => e.key === "Enter" && handleCapture()}
              />
              <div className="req-err">
                {touched && !formValid
                  ? !nameValid
                    ? "Please enter your first and last name."
                    : !phoneValid
                    ? "Please enter a valid phone number."
                    : "Please enter a valid email address."
                  : ""}
              </div>
              <button className="req-btn" onClick={handleCapture} disabled={!formValid}>
                Reveal My Investor Type
              </button>
            </div>
          </div>
        )}

        {step === "result" && result && (
          <div>
            <div className="req-eyebrow req-fade">Your investor type</div>
            <div className="req-result-type req-fade-2">{RESULTS[result].type}</div>
            <p className="req-sub req-fade-3" style={{ maxWidth: 500 }}>
              {RESULTS[result].body}
            </p>
            <div className="req-cta-row req-fade-3">
              <button className="req-btn" onClick={() => {}}>
                Get Your Starter System
              </button>
              <button className="req-ghost" onClick={restart}>
                Retake the quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
