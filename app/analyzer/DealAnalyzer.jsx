"use client";

import { useState } from "react";

// =====================================================================
// DEAL ANALYZER  |  Flip + Rental, beginner-friendly
// Brand-matched to the Real Estate Portfolio Quiz.
// Full results shown free (the order bump is already paid upstream).
// =====================================================================

const fmtMoney = (n) =>
  isFinite(n)
    ? n.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      })
    : "$0";

const fmtPct = (n) => (isFinite(n) ? `${n.toFixed(1)}%` : "0%");

// ---- Rental math -----------------------------------------------------
function analyzeRental(r) {
  const price = +r.price || 0;
  const downPct = +r.downPct || 0;
  const rate = +r.rate || 0;
  const term = +r.term || 0;
  const rent = +r.rent || 0;
  const taxes = +r.taxes || 0;
  const insurance = +r.insurance || 0;
  const vacancyPct = +r.vacancyPct || 0;
  const repairsPct = +r.repairsPct || 0;
  const mgmtPct = +r.mgmtPct || 0;

  const downPayment = price * (downPct / 100);
  const loan = price - downPayment;
  const mr = rate / 100 / 12;
  const n = term * 12;
  const mortgage =
    mr === 0 ? (n ? loan / n : 0) : (loan * mr * (1 + mr) ** n) / ((1 + mr) ** n - 1);

  const mTaxes = taxes / 12;
  const mInsurance = insurance / 12;
  const mVacancy = rent * (vacancyPct / 100);
  const mRepairs = rent * (repairsPct / 100);
  const mMgmt = rent * (mgmtPct / 100);

  const opExpenses = mTaxes + mInsurance + mVacancy + mRepairs + mMgmt;
  const totalExpenses = opExpenses + mortgage;
  const cashFlow = rent - totalExpenses;

  const noi = (rent - opExpenses) * 12;
  const capRate = price ? (noi / price) * 100 : 0;
  const coc = downPayment ? ((cashFlow * 12) / downPayment) * 100 : 0;

  let verdict;
  if (cashFlow >= 0 && coc >= 8)
    verdict = { tier: "green", label: "Strong deal", note: "Positive cash flow and a healthy return on the cash you put in." };
  else if (cashFlow >= 0)
    verdict = { tier: "yellow", label: "Workable deal", note: "It cash flows. The return is modest, so the price or terms decide whether it is worth it." };
  else
    verdict = { tier: "red", label: "Cash flow negative", note: "This one costs you each month at these numbers. Worth a lower offer or higher rent before moving." };

  return { mortgage, totalExpenses, cashFlow, coc, capRate, downPayment, verdict };
}

// ---- Flip math -------------------------------------------------------
function analyzeFlip(f) {
  const price = +f.price || 0;
  const rehab = +f.rehab || 0;
  const arv = +f.arv || 0;
  const costsPct = +f.costsPct || 0;

  const costs = arv * (costsPct / 100);
  const totalInvested = price + rehab + costs;
  const profit = arv - totalInvested;
  const roi = totalInvested ? (profit / totalInvested) * 100 : 0;
  const maxOffer = arv * 0.7 - rehab;
  const passes70 = price <= maxOffer;

  let verdict;
  if (passes70 && profit > 0)
    verdict = { tier: "green", label: "Strong deal", note: "Profitable and inside the 70% rule. This is the kind of margin to act on." };
  else if (profit > 0)
    verdict = { tier: "yellow", label: "Thin margin", note: "There is profit, though the purchase price is above the 70% guideline. Tighten the offer to protect yourself." };
  else
    verdict = { tier: "red", label: "No profit", note: "At these numbers the deal loses money. A lower purchase price or higher ARV is needed." };

  return { costs, totalInvested, profit, roi, maxOffer, verdict };
}

const VERDICT_COLOR = {
  green: "#2f9d72",
  yellow: "#c9a24c",
  red: "#cf6b5a",
};

export default function DealAnalyzer() {
  const [mode, setMode] = useState("rental");

  const [rental, setRental] = useState({
    price: 250000,
    downPct: 25,
    rate: 7,
    term: 30,
    rent: 2200,
    taxes: 3000,
    insurance: 1500,
    vacancyPct: 5,
    repairsPct: 8,
    mgmtPct: 8,
  });

  const [flip, setFlip] = useState({
    price: 180000,
    rehab: 45000,
    arv: 300000,
    costsPct: 10,
  });

  const setR = (k) => (e) => setRental({ ...rental, [k]: e.target.value });
  const setF = (k) => (e) => setFlip({ ...flip, [k]: e.target.value });

  const r = analyzeRental(rental);
  const f = analyzeFlip(flip);
  const v = mode === "rental" ? r.verdict : f.verdict;

  return (
    <div className="da-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');
        .da-root {
          --ink:#0a0d0c; --ink2:#0e1311; --surface:#131917;
          --line:rgba(181,137,90,0.28); --emerald:#2f9d72; --bronze:#b5895a;
          --bone:#ece9e1; --muted:#8b948f;
          min-height:100vh; background:
            radial-gradient(120% 90% at 50% -10%, rgba(47,157,114,0.10), transparent 60%),
            var(--ink);
          color:var(--bone); font-family:'Hanken Grotesk',sans-serif;
          padding:48px 20px;
        }
        .da-wrap { max-width:860px; margin:0 auto; }
        .da-eyebrow { font-size:11px; letter-spacing:0.32em; text-transform:uppercase;
          color:var(--bronze); font-weight:600; display:flex; align-items:center; gap:12px; margin-bottom:18px; }
        .da-eyebrow::before { content:""; width:34px; height:1px; background:var(--bronze); }
        .da-title { font-family:'Fraunces',serif; font-weight:500; font-size:clamp(30px,5vw,42px);
          line-height:1.1; letter-spacing:-0.01em; margin-bottom:28px; }
        .da-toggle { display:inline-flex; background:var(--ink2); border:1px solid var(--line);
          border-radius:12px; padding:5px; margin-bottom:32px; }
        .da-tab { padding:11px 26px; border:none; background:none; color:var(--muted);
          font-family:inherit; font-size:15px; font-weight:600; border-radius:8px; cursor:pointer; transition:all .2s; }
        .da-tab.active { background:var(--emerald); color:#06140e; }
        .da-grid { display:grid; grid-template-columns:1fr 1fr; gap:32px; align-items:start; }
        @media (max-width:720px){ .da-grid{ grid-template-columns:1fr; } }
        .da-field { margin-bottom:16px; }
        .da-label { font-size:13px; color:var(--muted); margin-bottom:6px; display:block; }
        .da-inputwrap { position:relative; }
        .da-adorn { position:absolute; top:50%; transform:translateY(-50%); color:var(--bronze); font-size:15px; }
        .da-adorn.l { left:14px; } .da-adorn.r { right:14px; }
        .da-input { width:100%; background:var(--ink2); border:1px solid var(--line); color:var(--bone);
          padding:13px 14px; border-radius:9px; font-size:15px; font-family:inherit; box-sizing:border-box; }
        .da-input.pad-l { padding-left:28px; } .da-input.pad-r { padding-right:34px; }
        .da-input:focus { outline:none; border-color:var(--emerald); }
        .da-panel { background:var(--surface); border:1px solid var(--line); border-radius:16px; padding:28px; position:sticky; top:24px; }
        .da-verdict { border-radius:11px; padding:16px 18px; margin-bottom:22px; }
        .da-verdict-label { font-family:'Fraunces',serif; font-size:22px; font-weight:600; margin-bottom:4px; }
        .da-verdict-note { font-size:14px; line-height:1.5; }
        .da-metric { display:flex; justify-content:space-between; align-items:baseline;
          padding:13px 0; border-bottom:1px solid rgba(255,255,255,0.06); }
        .da-metric:last-child { border-bottom:none; }
        .da-metric-label { font-size:14px; color:var(--muted); }
        .da-metric-val { font-size:20px; font-weight:600; font-variant-numeric:tabular-nums; }
        .da-hero { text-align:center; padding:8px 0 18px; }
        .da-hero-label { font-size:13px; color:var(--muted); margin-bottom:4px; }
        .da-hero-val { font-family:'Fraunces',serif; font-size:40px; font-weight:600; line-height:1; }
        .da-row2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
      `}</style>

      <div className="da-wrap">
        <div className="da-eyebrow">Deal Analyzer</div>
        <h1 className="da-title">Run the numbers before you make the offer</h1>

        <div className="da-toggle">
          <button className={`da-tab ${mode === "rental" ? "active" : ""}`} onClick={() => setMode("rental")}>
            Rental
          </button>
          <button className={`da-tab ${mode === "flip" ? "active" : ""}`} onClick={() => setMode("flip")}>
            Flip
          </button>
        </div>

        <div className="da-grid">
          {/* ---------- INPUTS ---------- */}
          <div>
            {mode === "rental" ? (
              <>
                <Field label="Purchase price" adorn="$" side="l" value={rental.price} onChange={setR("price")} />
                <div className="da-row2">
                  <Field label="Down payment" adorn="%" side="r" value={rental.downPct} onChange={setR("downPct")} />
                  <Field label="Interest rate" adorn="%" side="r" value={rental.rate} onChange={setR("rate")} />
                </div>
                <div className="da-row2">
                  <Field label="Loan term (years)" value={rental.term} onChange={setR("term")} />
                  <Field label="Gross monthly rent" adorn="$" side="l" value={rental.rent} onChange={setR("rent")} />
                </div>
                <div className="da-row2">
                  <Field label="Property taxes (annual)" adorn="$" side="l" value={rental.taxes} onChange={setR("taxes")} />
                  <Field label="Insurance (annual)" adorn="$" side="l" value={rental.insurance} onChange={setR("insurance")} />
                </div>
                <div className="da-row2">
                  <Field label="Vacancy" adorn="%" side="r" value={rental.vacancyPct} onChange={setR("vacancyPct")} />
                  <Field label="Repairs & capex" adorn="%" side="r" value={rental.repairsPct} onChange={setR("repairsPct")} />
                </div>
                <Field label="Management" adorn="%" side="r" value={rental.mgmtPct} onChange={setR("mgmtPct")} />
              </>
            ) : (
              <>
                <Field label="Purchase price" adorn="$" side="l" value={flip.price} onChange={setF("price")} />
                <Field label="Rehab budget" adorn="$" side="l" value={flip.rehab} onChange={setF("rehab")} />
                <Field label="After repair value (ARV)" adorn="$" side="l" value={flip.arv} onChange={setF("arv")} />
                <Field label="Closing & selling costs" adorn="%" side="r" value={flip.costsPct} onChange={setF("costsPct")} />
              </>
            )}
          </div>

          {/* ---------- RESULTS ---------- */}
          <div className="da-panel">
            <div className="da-verdict" style={{ background: VERDICT_COLOR[v.tier] + "1f", border: `1px solid ${VERDICT_COLOR[v.tier]}55` }}>
              <div className="da-verdict-label" style={{ color: VERDICT_COLOR[v.tier] }}>{v.label}</div>
              <div className="da-verdict-note">{v.note}</div>
            </div>

            {mode === "rental" ? (
              <>
                <div className="da-hero">
                  <div className="da-hero-label">Monthly cash flow</div>
                  <div className="da-hero-val" style={{ color: r.cashFlow >= 0 ? "var(--emerald)" : VERDICT_COLOR.red }}>
                    {fmtMoney(Math.round(r.cashFlow))}
                  </div>
                </div>
                <div className="da-metric"><span className="da-metric-label">Cash on cash return</span><span className="da-metric-val">{fmtPct(r.coc)}</span></div>
                <div className="da-metric"><span className="da-metric-label">Cap rate</span><span className="da-metric-val">{fmtPct(r.capRate)}</span></div>
                <div className="da-metric"><span className="da-metric-label">Monthly mortgage (P&I)</span><span className="da-metric-val">{fmtMoney(Math.round(r.mortgage))}</span></div>
                <div className="da-metric"><span className="da-metric-label">Total monthly expenses</span><span className="da-metric-val">{fmtMoney(Math.round(r.totalExpenses))}</span></div>
                <div className="da-metric"><span className="da-metric-label">Cash to close (down payment)</span><span className="da-metric-val">{fmtMoney(Math.round(r.downPayment))}</span></div>
              </>
            ) : (
              <>
                <div className="da-hero">
                  <div className="da-hero-label">Estimated net profit</div>
                  <div className="da-hero-val" style={{ color: f.profit >= 0 ? "var(--emerald)" : VERDICT_COLOR.red }}>
                    {fmtMoney(Math.round(f.profit))}
                  </div>
                </div>
                <div className="da-metric"><span className="da-metric-label">Return on investment</span><span className="da-metric-val">{fmtPct(f.roi)}</span></div>
                <div className="da-metric"><span className="da-metric-label">Max offer (70% rule)</span><span className="da-metric-val">{fmtMoney(Math.round(f.maxOffer))}</span></div>
                <div className="da-metric"><span className="da-metric-label">Total invested</span><span className="da-metric-val">{fmtMoney(Math.round(f.totalInvested))}</span></div>
                <div className="da-metric"><span className="da-metric-label">Closing & selling costs</span><span className="da-metric-val">{fmtMoney(Math.round(f.costs))}</span></div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, adorn, side, value, onChange }) {
  return (
    <div className="da-field">
      <label className="da-label">{label}</label>
      <div className="da-inputwrap">
        {adorn && <span className={`da-adorn ${side}`}>{adorn}</span>}
        <input
          className={`da-input ${adorn && side === "l" ? "pad-l" : ""} ${adorn && side === "r" ? "pad-r" : ""}`}
          type="number"
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
