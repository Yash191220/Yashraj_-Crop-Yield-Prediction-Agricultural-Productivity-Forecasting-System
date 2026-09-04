import React, { useState, useEffect, useRef } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Cell, ReferenceLine
} from 'recharts';
import {
  evaluateFarmRisk, simulateClimateStressTest,
  getRegionalRiskMatrix, submitFarmerInquiry, getFarmerActiveThread
} from '../api';

// ─── Quick Scenarios ─────────────────────────────────────────────────────────
const QUICK_SCENARIOS = [
  { label: 'Drought Risk', prompt: 'My Wheat crop in North Region is facing severe drought. Rainfall dropped to 200mm and temperature is 38°C. What\'s my risk level?' },
  { label: 'Flood Alert', prompt: 'Heavy rains flooded my Rice paddy in East Region. Rainfall was 1400mm this season. 12 hectares at risk. How bad is it?' },
  { label: 'Pest Outbreak', prompt: 'I\'ve detected locust swarm near my Maize fields in Central Region. Humidity 80%, temperature 32°C. What\'s the pest risk and IPM steps?' },
  { label: 'Heatwave', prompt: '45°C for 10 days during Kharif affecting my Cotton in West Region. Soil moisture critically low. Assess thermal stress risk for 8 hectares.' },
  { label: 'Insurance Help', prompt: 'I have PMFBY at 75% coverage for Soybean. Expected yield loss 40% due to irregular monsoon. How much financial protection do I have?' },
  { label: 'Soil Health', prompt: 'My soil pH dropped to 5.2 and organic matter below 1%. Growing Barley in South Region. What\'s the soil degradation risk?' },
];

// ─── AI Response Engine ───────────────────────────────────────────────────────
function generateAIResponse(msg) {
  const m = msg.toLowerCase();
  if (m.includes('drought') || (m.includes('rain') && (m.includes('200') || m.includes('low')))) {
    return { severity: 'HIGH', color: 'rose', title: 'High Drought Risk Detected',
      summary: 'Your farm faces a **HIGH drought risk** with estimated 35–50% yield loss if no intervention is taken.',
      sections: [
        { heading: 'Immediate Actions (0–7 days)', items: ['Switch to deficit irrigation — apply 40% of normal water at critical stages', 'Apply mulching (sugarcane trash/straw) to reduce soil evaporation by up to 30%', 'Spray kaolin particle film on leaf surfaces to reduce heat absorption'] },
        { heading: 'Medium-Term Measures (1–4 weeks)', items: ['Apply potassium-rich fertilizer (MOP 40 kg/ha) to improve drought tolerance', 'Consider foliar spray of 1% KNO₃ to maintain osmotic balance', 'Install soil moisture sensors to monitor field stress in real-time'] },
        { heading: 'Financial Risk Estimate', items: ['Yield loss projection: 35–50% of expected harvest', 'If insured under PMFBY: claim eligibility likely triggered at >25% area damage', 'Notify your insurance provider within 72 hours of visible crop stress'] },
      ],
      tip: 'Emergency drip irrigation for critical growth stage crops can reduce drought losses by up to 60%.',
    };
  }
  if (m.includes('flood') || m.includes('waterlog') || m.includes('heavy rain')) {
    return { severity: 'CRITICAL', color: 'indigo', title: 'Critical Flood & Waterlogging Hazard',
      summary: 'Your field has entered a **CRITICAL flood risk zone**. Waterlogging beyond 48 hours causes severe root rot, leading to 60–90% crop loss.',
      sections: [
        { heading: 'Emergency Protocol (Within 24 hours)', items: ['Open all field drainage channels immediately — top priority', 'Install portable water pumps if natural drainage is blocked', 'Spray 250g urea dissolved in 200L water to compensate nitrogen leaching'] },
        { heading: 'Crop Protection Steps', items: ['Remove excess water to expose soil crown within 48 hours', 'Apply fungicide (Mancozeb 2g/L) to prevent Pythium root rot post-flood', 'Replant in partially damaged areas with short-duration variety if >60% affected'] },
        { heading: 'Insurance & Documentation', items: ['Photograph all flood damage within 24 hours — critical for PMFBY claim', 'File joint inspection request with patwari within 48 hours', 'Keep all input cost receipts — they form the basis of your compensation'] },
      ],
      tip: 'Evidence tip: Video-document water standing levels. Insurance verification requires geo-tagged proof.',
    };
  }
  if (m.includes('pest') || m.includes('locust') || m.includes('ipm') || m.includes('disease')) {
    return { severity: 'MEDIUM-HIGH', color: 'amber', title: 'Elevated Pest & Pathogen Pressure',
      summary: 'Current conditions create a **high-risk window for pest outbreaks**. Each day of inaction amplifies damage by 8–15%.',
      sections: [
        { heading: 'Immediate Scouting Protocol', items: ['Deploy yellow sticky traps (2/acre) to measure pest pressure index', 'Count pests per plant: threshold is >5 aphids/leaf or >1 larva/plant', 'Check 5 random spots per acre — mark GPS location for spread tracking'] },
        { heading: 'IPM Treatment Protocol (4-Tier)', items: ['Tier 1 — Biological: Release Trichogramma parasitoids (1 lakh cards/ha)', 'Tier 2 — Botanical: Spray Neem oil 5ml/L + garlic extract', 'Tier 3 — Chemical: If threshold crossed, apply Imidacloprid 17.8 SL @ 200ml/ha', 'Tier 4 — Systemic: Contact district agriculture officer for aerial spray coordination'] },
        { heading: 'Economic Impact Estimate', items: ['Uncontrolled outbreak: 70–100% crop loss within 4 days', 'Early intervention within 48 hours: reduces loss to <15%', 'IPM cost: ~₹2,500–₹4,000/acre vs. ₹25,000–₹40,000 crop value at risk'] },
      ],
      tip: 'Emergency locust reports: Call Locust Warning Organisation at +91-141-2621960 immediately.',
    };
  }
  if (m.includes('heat') || m.includes('45') || m.includes('thermal')) {
    return { severity: 'HIGH', color: 'orange', title: 'High Thermal Stress Risk',
      summary: 'Temperatures above 40°C for 3+ consecutive days trigger **irreversible cellular damage**. Pollen sterility and grain shriveling reduce yield 30–55%.',
      sections: [
        { heading: 'Crop Heat Damage Thresholds', items: ['Wheat: critical damage above 35°C during grain fill', 'Cotton: flower abortion starts above 38°C for 3+ consecutive days', 'Maize: pollen viability drops 50% at 36°C — poor kernel set'] },
        { heading: 'Cooling & Stress Reduction', items: ['Irrigate at evening (6–8 PM) to reduce field temperature by 2–4°C overnight', 'Spray kaolin (5%) or white reflective clay on leaves', 'Apply antitranspirant spray (Cytokinin-based) to reduce water loss'] },
        { heading: 'Financial Exposure', items: ['Estimated yield reduction: 30–55% depending on crop stage', 'If event lasted >10 days: PMFBY thermal stress clause may trigger claim', 'Apply for Agricultural Input Subsidy (AIS) — ₹13,500/ha for dryland'] },
      ],
      tip: 'Night irrigation is 40% more effective during heatwaves — irrigate between 9 PM and 6 AM.',
    };
  }
  if (m.includes('insurance') || m.includes('pmfby') || m.includes('claim')) {
    return { severity: 'LOW', color: 'emerald', title: 'PMFBY Insurance & Financial Coverage Guide',
      summary: 'Under **PMFBY**, your crop is covered against natural calamities, pests, and diseases from sowing to post-harvest.',
      sections: [
        { heading: 'How Your Coverage Works', items: ['For 75% coverage: insurer pays 75% of difference between threshold and actual yield', 'Claim trigger: when area yield drops below district threshold yield', 'Maximum benefit: sum insured = crop value at notified MSP × area insured'] },
        { heading: 'Claim Process & Timeline', items: ['Notify loss within 72 hours of damage (via app, SMS, or agent)', 'Joint survey by bank/insurance agent within 10 days', 'Claim settlement: 30–45 days post-survey'] },
        { heading: 'Maximizing Your Claim', items: ['Keep all purchase receipts — they validate your investment cost', 'Request crop-cutting experiment records from Gram Panchayat', 'If rejected: file grievance on PMFBY portal or call 14447'] },
      ],
      tip: 'Download the PMFBY app or call 14447 — report crop loss 24×7 via the helpline.',
    };
  }
  if (m.includes('soil') || m.includes('ph') || m.includes('organic')) {
    return { severity: 'MEDIUM', color: 'teal', title: 'Soil Health Degradation Risk',
      summary: 'Low soil pH (<5.5) causes **aluminum and manganese toxicity**, limiting nutrient uptake. Organic matter below 1.5% means poor water retention.',
      sections: [
        { heading: 'Immediate Soil Correction', items: ['Apply agricultural lime at 2–4 tonnes/ha to raise pH by 0.5–1 unit', 'After liming, wait 3–4 weeks before applying phosphorus fertilizers', 'Apply green manure crop (Dhaincha/Sesbania) to boost organic matter'] },
        { heading: 'Long-Term Restoration (1–3 seasons)', items: ['Apply FYM (Farm Yard Manure) at 10 tonnes/ha before kharif sowing', 'Introduce legume rotation (Moong/Arhar) to fix atmospheric nitrogen', 'Apply Zinc Sulphate 25 kg/ha — most Indian soils are zinc deficient'] },
        { heading: 'Yield Impact at pH 5.2', items: ['Barley yield reduction: approximately 25–40% below potential', 'Applied phosphorus fertilizer is 60% wasted until pH is corrected', 'Target pH 6.0–7.5 for Barley — each 0.5 unit improvement = ~10% yield gain'] },
      ],
      tip: 'Get a free Soil Health Card from your nearest Krishi Vigyan Kendra for exact amendment recommendations.',
    };
  }
  return {
    severity: 'ANALYZING', color: 'violet', title: 'Farm Risk Overview',
    summary: 'Share your **specific crop, region, and conditions** for a personalized risk analysis.',
    sections: [
      { heading: 'Climate & Weather Risks', items: ['Monitor district-level rainfall: <500mm signals drought advisory alert', 'Temperature spikes >38°C for 3+ days during flowering = critical intervention', 'Subscribe to IMD Agro-Met advisory for block-level 5-day forecasts'] },
      { heading: 'Soil & Crop Indicators', items: ['Test soil NPK every season — imbalances reduce yields by 20–35%', 'Maintain soil pH between 6.0–7.0 for optimal nutrient availability', 'Target organic matter >2% for good water retention and microbial health'] },
      { heading: 'Financial Risk Management', items: ['Enroll in PMFBY before cut-off date (varies by state and crop season)', 'Keep crop input cost records — they support insurance claim valuations', 'Diversify crops across 30% of farm area to reduce income concentration risk'] },
    ],
    tip: 'For a precise risk score, describe your specific crop, region, rainfall, temperature, and farm size.',
  };
}

// ─── Severity Badge ───────────────────────────────────────────────────────────
function SeverityBadge({ severity }) {
  const map = {
    CRITICAL: 'bg-rose-100 text-rose-800 border-rose-300',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
    'MEDIUM-HIGH': 'bg-amber-100 text-amber-800 border-amber-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    LOW: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    ANALYZING: 'bg-violet-100 text-violet-800 border-violet-300',
  };
  return <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${map[severity] || map.ANALYZING}`}>{severity}</span>;
}

// ─── Chat Message ─────────────────────────────────────────────────────────────
function ChatMessage({ msg }) {
  if (msg.role === 'user') {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="max-w-[80%] bg-rose-600 text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed shadow-sm">
          {msg.content}
        </div>
        <div className="flex items-center gap-1 px-1">
          {msg.sentToAdvisor ? (
            <span className="text-[10px] text-sky-600 font-semibold">Sent to Advisor</span>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium">{msg.timestamp}</span>
          )}
        </div>
      </div>
    );
  }
  if (msg.role === 'advisor') {
    return (
      <div className="flex justify-start">
        <div className="max-w-[88%] space-y-1.5">
          <div className="flex items-center gap-1.5 px-1">
            <span className="text-[10px] font-black text-sky-900">{msg.sender_name || 'Agricultural Advisor'}</span>
            <span className="bg-sky-100 text-sky-800 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border border-sky-200">Advisor</span>
            <span className="text-[9px] text-slate-400 ml-auto">{msg.timestamp}</span>
          </div>
          <div className="bg-gradient-to-br from-sky-50 to-indigo-50/60 border border-sky-300 rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs">
            <p className="text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-line">{msg.content}</p>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

// ─── Risk Score Gauge ─────────────────────────────────────────────────────────
function RiskGauge({ score }) {
  const color = score >= 70 ? '#e11d48' : score >= 48 ? '#f59e0b' : score >= 25 ? '#eab308' : '#10b981';
  const label = score >= 70 ? 'Critical' : score >= 48 ? 'High Hazard' : score >= 25 ? 'Moderate' : 'Low / Safe';
  const pct = Math.min(100, score);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-28 h-14 overflow-hidden">
        <svg viewBox="0 0 120 60" className="w-full h-full">
          <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
          <path
            d="M10,60 A50,50 0 0,1 110,60"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * 157} 157`}
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className="text-xl font-black" style={{ color }}>{score}</span>
        </div>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>{label}</p>
    </div>
  );
}

// ─── Risk Dashboard ───────────────────────────────────────────────────────────
function RiskDashboard({ riskData, loading }) {
  const [showActions, setShowActions] = useState(true);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
      <p className="text-xs font-semibold">Evaluating risk profile...</p>
    </div>
  );
  if (!riskData) return (
    <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
      <p className="text-sm font-bold text-slate-500">No Risk Profile Yet</p>
      <p className="text-xs text-slate-400 text-center">Fill the form and click "Run Risk Assessment"</p>
    </div>
  );

  const score = riskData.composite_risk_score || 0;
  const scoreColor = score >= 70 ? '#e11d48' : score >= 48 ? '#f59e0b' : score >= 25 ? '#eab308' : '#10b981';
  const cls = score >= 70 ? { text: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' }
    : score >= 48 ? { text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' }
    : score >= 25 ? { text: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' }
    : { text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };

  const hazards = [
    { label: 'Drought', val: riskData.hazard_breakdown?.drought_moisture_risk || 0, color: '#0ea5e9' },
    { label: 'Heatwave', val: riskData.hazard_breakdown?.heatwave_thermal_risk || 0, color: '#f97316' },
    { label: 'Flood', val: riskData.hazard_breakdown?.flood_waterlogging_hazard || 0, color: '#6366f1' },
    { label: 'Pest', val: riskData.hazard_breakdown?.pest_disease_epidemic_risk || 0, color: '#f59e0b' },
    { label: 'Soil', val: riskData.hazard_breakdown?.soil_degradation_risk || 0, color: '#10b981' },
  ];

  const priorityColors = {
    'Urgent': 'bg-rose-100 text-rose-800 border-rose-300',
    'Immediate': 'bg-rose-100 text-rose-800 border-rose-300',
    'High': 'bg-orange-100 text-orange-800 border-orange-300',
    'Medium': 'bg-amber-100 text-amber-800 border-amber-300',
    'Routine': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  };

  return (
    <div className="space-y-4 animate-fadeIn">

      {/* Risk Context + Score */}
      <div className={`border rounded-2xl p-4 ${cls.bg}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-slate-700 mb-2">
              <span className="font-black text-slate-900">{riskData.crop}</span>
              <span className="text-slate-300">•</span>
              <span>{riskData.region}</span>
              <span className="text-slate-300">•</span>
              <span>{riskData.season} Season</span>
              <span className="text-slate-300">•</span>
              <span>{riskData.area_hectares} ha</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-4xl font-black ${cls.text}`}>{score}</span>
              <span className="text-sm text-slate-400 font-semibold">/100</span>
              <span className={`ml-2 text-xs font-black uppercase px-2.5 py-0.5 rounded-full border ${cls.bg} ${cls.text}`}>
                {riskData.risk_level}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-1">
              {score < 25 ? 'Favorable field & climate balance — minimal intervention needed.'
                : score < 50 ? 'Minor environmental stress — monitor closely & apply precautions.'
                : score < 75 ? 'Elevated hazard — implement mitigation actions within 7 days.'
                : 'Critical hazard — immediate emergency action required.'}
            </p>
          </div>
          <RiskGauge score={score} />
        </div>

        {/* 4-Zone Bar */}
        <div className="mt-3 space-y-1">
          <div className="w-full h-2 rounded-full overflow-hidden flex relative">
            <div className="bg-emerald-400 h-full" style={{ width: '25%' }} />
            <div className="bg-yellow-400 h-full" style={{ width: '25%' }} />
            <div className="bg-orange-500 h-full" style={{ width: '25%' }} />
            <div className="bg-rose-600 h-full" style={{ width: '25%' }} />
            {/* Marker */}
            <div className="absolute top-0 h-full w-0.5 bg-slate-900 rounded-full transition-all duration-500" style={{ left: `${Math.min(99, score)}%` }} />
          </div>
          <div className="flex justify-between text-[9px] font-bold text-slate-400">
            <span className="text-emerald-600">0 Safe</span>
            <span className="text-yellow-600">25 Moderate</span>
            <span className="text-orange-600">50 Alert</span>
            <span className="text-rose-600">75+ Critical</span>
          </div>
        </div>
      </div>

      {/* Financial VaR Cards */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <p className="text-[9px] font-bold uppercase text-slate-400 mb-0.5">Est. Revenue</p>
          <p className="text-sm font-black text-slate-800">₹{(riskData.financial_impact?.potential_revenue_usd || 0).toLocaleString()}</p>
          <p className="text-[9px] text-slate-400">{riskData.financial_impact?.potential_production_tonnes} t total</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl">
          <p className="text-[9px] font-bold uppercase text-rose-500 mb-0.5">Yield Loss</p>
          <p className="text-sm font-black text-rose-700">{riskData.financial_impact?.projected_yield_loss_percent}%</p>
          <p className="text-[9px] text-rose-400">{riskData.financial_impact?.projected_loss_tonnes} t at risk</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
          <p className="text-[9px] font-bold uppercase text-amber-600 mb-0.5">Net Exposure</p>
          <p className="text-sm font-black text-amber-700">₹{(riskData.financial_impact?.net_farmer_exposure_usd || 0).toLocaleString()}</p>
          <p className="text-[9px] text-amber-400">{riskData.financial_impact?.insurance_status}</p>
        </div>
      </div>

      {/* Hazard Breakdown Bars */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hazard Breakdown</p>
        {hazards.map(({ label, val, color }, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>{label}</span>
              <span className="font-mono font-bold" style={{ color }}>{val}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${val}%`, backgroundColor: color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Mitigation Action Plan */}
      {riskData.mitigation_action_plan?.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowActions(a => !a)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900">Mitigation Action Plan</span>
              <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-full border border-amber-200">
                {riskData.mitigation_action_plan.length} Actions
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">{showActions ? '▲' : '▼'}</span>
          </button>
          {showActions && (
            <div className="px-4 pb-4 space-y-2.5">
              {riskData.mitigation_action_plan.map((item, i) => (
                <div key={i} className="border border-slate-200 rounded-xl p-3 space-y-1.5 bg-slate-50/50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-slate-900">{item.category}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${priorityColors[item.priority] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">{item.action}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Stress Test Panel ────────────────────────────────────────────────────────
function StressTestPanel({ riskForm }) {
  const [rainfallDev, setRainfallDev] = useState(-25);
  const [tempInc, setTempInc] = useState(2.5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await simulateClimateStressTest({
        base_request: riskForm,
        rainfall_deviation_percent: rainfallDev,
        temperature_increase_celsius: tempInc,
      });
      setResult(res);
    } catch (err) {
      setError('Failed to run stress test. Please ensure the risk form inputs are valid.');
    } finally {
      setLoading(false);
    }
  };

  const baseline = result?.baseline_profile;
  const stressed = result?.stressed_profile;
  const deltas = result?.impact_deltas;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <h3 className="text-sm font-black text-slate-900">Climate Shock Stress-Test Simulator</h3>
      </div>
      <p className="text-xs text-slate-500">Simulate what happens to your farm risk if climate conditions worsen — drought, heatwave, or rainfall surplus.</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            Rainfall Change: <span className={rainfallDev < 0 ? 'text-rose-600' : 'text-emerald-600'}>{rainfallDev > 0 ? '+' : ''}{rainfallDev}%</span>
          </label>
          <input
            type="range" min="-60" max="60" step="5"
            value={rainfallDev}
            onChange={e => setRainfallDev(+e.target.value)}
            className="w-full accent-rose-500"
          />
          <div className="flex justify-between text-[9px] text-slate-400 font-medium">
            <span>-60% Drought</span>
            <span>+60% Excess</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            Temp. Increase: <span className="text-orange-600">+{tempInc}°C</span>
          </label>
          <input
            type="range" min="0" max="8" step="0.5"
            value={tempInc}
            onChange={e => setTempInc(+e.target.value)}
            className="w-full accent-orange-500"
          />
          <div className="flex justify-between text-[9px] text-slate-400 font-medium">
            <span>No change</span>
            <span>+8°C Extreme</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleRun}
        disabled={loading}
        className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
      >
        {loading ? 'Running Simulation...' : 'Run Climate Stress Test'}
      </button>

      {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-xl">{error}</p>}

      {result && baseline && stressed && (
        <div className="space-y-3 animate-fadeIn">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
            <p className="font-bold text-slate-600 mb-1.5">Scenario Applied:</p>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-lg font-mono">
                Rainfall: {result.scenario?.simulated_rainfall_mm} mm ({rainfallDev > 0 ? '+' : ''}{rainfallDev}%)
              </span>
              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-lg font-mono">
                Temp: {result.scenario?.simulated_temp_celsius}°C (+{tempInc}°C)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
              <p className="text-[9px] font-bold uppercase text-emerald-600 mb-0.5">Baseline Risk</p>
              <p className="text-2xl font-black text-emerald-700">{baseline.composite_risk_score}</p>
              <p className="text-[9px] text-emerald-600 font-semibold">{baseline.risk_level}</p>
            </div>
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-center">
              <p className="text-[9px] font-bold uppercase text-rose-600 mb-0.5">Under Stress</p>
              <p className="text-2xl font-black text-rose-700">{stressed.composite_risk_score}</p>
              <p className="text-[9px] text-rose-600 font-semibold">{stressed.risk_level}</p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs bg-white">
            <p className="font-black text-slate-700">Stress Impact Deltas:</p>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Risk Score Increase</span>
              <span className="font-black text-rose-700">+{deltas?.risk_score_increase}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Additional Yield Lost</span>
              <span className="font-black text-rose-700">{deltas?.additional_tonnes_lost} tonnes</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Additional Financial Risk</span>
              <span className="font-black text-rose-700">₹{(deltas?.additional_financial_var_usd || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Regional Risk Matrix ─────────────────────────────────────────────────────
function RegionalRiskMatrix() {
  const [matrixData, setMatrixData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadMatrix = async () => {
    if (loaded) return;
    setLoading(true);
    try {
      const res = await getRegionalRiskMatrix();
      setMatrixData(res.matrix);
      setLoaded(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMatrix(); }, []);

  const getRiskColor = (indexStr) => {
    const score = parseInt(indexStr?.match(/\d+/)?.[0] || '0');
    if (score >= 60) return 'text-rose-700 font-black';
    if (score >= 45) return 'text-amber-700 font-bold';
    if (score >= 30) return 'text-yellow-700 font-semibold';
    return 'text-emerald-700 font-semibold';
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <h3 className="text-sm font-black text-slate-900">Regional Vulnerability Matrix</h3>
      </div>
      <p className="text-xs text-slate-500">Multi-hazard risk indices across all 5 agricultural zones — helps identify region-specific threats.</p>

      {loading && (
        <div className="flex justify-center py-6 text-xs text-slate-400">
          Loading...
        </div>
      )}

      {matrixData && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-500">
                <th className="px-3 py-2.5">Region</th>
                <th className="px-3 py-2.5">Primary Hazard</th>
                <th className="px-3 py-2.5 text-center">Drought</th>
                <th className="px-3 py-2.5 text-center">Flood</th>
                <th className="px-3 py-2.5 text-center">Heat</th>
                <th className="px-3 py-2.5 text-center">Overall</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrixData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition">
                  <td className="px-3 py-2.5 font-bold text-slate-900 whitespace-nowrap">{row.region}</td>
                  <td className="px-3 py-2.5 text-slate-600 max-w-[160px]">{row.primary_hazard}</td>
                  <td className="px-3 py-2.5 text-center text-slate-600">{row.drought_vulnerability}</td>
                  <td className="px-3 py-2.5 text-center text-slate-600">{row.flood_vulnerability}</td>
                  <td className="px-3 py-2.5 text-center text-slate-600">{row.heatwave_vulnerability}</td>
                  <td className={`px-3 py-2.5 text-center ${getRiskColor(row.overall_climate_index)}`}>
                    {row.overall_climate_index}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function RiskAssessmentView({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [riskData, setRiskData] = useState(null);
  const [activeRightTab, setActiveRightTab] = useState('form');

  const [riskForm, setRiskForm] = useState({
    crop: 'Wheat', region: 'North Region', season: 'Rabi',
    soil_type: 'Loamy', soil_ph: 6.8, nitrogen_n: 120, phosphorus_p: 40,
    potassium_k: 60, organic_matter_percent: 2.2, rainfall_mm: 500,
    temperature_celsius: 27, humidity_percent: 65, irrigation_type: 'Canal',
    area_hectares: 10, has_crop_insurance: true, insurance_coverage_percent: 75,
  });

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Sync advisor replies
  useEffect(() => {
    const syncThread = async () => {
      try {
        if (!user?.email) return;
        const thread = await getFarmerActiveThread(user.email);
        if (thread?.messages) {
          const advisorMsgs = thread.messages.filter(m => m.sender_role === 'advisor');
          if (advisorMsgs.length > 0) {
            setMessages(prev => {
              const existingIds = new Set(prev.map(m => m.id).filter(Boolean));
              const newMsgs = advisorMsgs
                .filter(m => !existingIds.has(m.id))
                .map(m => ({
                  id: m.id, role: 'advisor', sender_name: m.sender_name,
                  content: m.content,
                  timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
              return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
            });
          }
        }
      } catch (_) {}
    };
    syncThread();
    const interval = setInterval(syncThread, 4000);
    return () => clearInterval(interval);
  }, [user?.email]);

  const handleSend = async (text) => {
    const userText = (text || input).trim();
    if (!userText) return;
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user', content: userText, timestamp: ts, sentToAdvisor: false };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    try {
      await submitFarmerInquiry({
        farmer_name: user?.name || 'Farmer',
        farmer_email: user?.email || '',
        farmer_id: user?.id || '',
        crop: riskForm.crop, region: riskForm.region, season: riskForm.season,
        risk_level: 'ALERT', risk_score: 50.0, content: userText,
      });
      setMessages(prev => prev.map(m =>
        m === userMsg || (m.role === 'user' && m.content === userText && m.timestamp === ts)
          ? { ...m, sentToAdvisor: true } : m
      ));
    } catch (_) {}
  };

  const handleEvaluateRisk = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await evaluateFarmRisk(riskForm);
      setRiskData(res.data);
      setActiveRightTab('results');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!riskData) return;
    const headers = ['Crop', 'Region', 'Season', 'Risk Score', 'Risk Level',
      'Yield Loss (%)', 'Drought Risk', 'Heatwave Risk', 'Flood Hazard',
      'Pest Risk', 'Soil Risk', 'Area (ha)', 'Net Exposure (₹)'];
    const row = [
      `"${riskData.crop}"`, `"${riskData.region}"`, `"${riskData.season}"`,
      riskData.composite_risk_score, `"${riskData.risk_level}"`,
      riskData.financial_impact?.projected_yield_loss_percent,
      riskData.hazard_breakdown?.drought_moisture_risk,
      riskData.hazard_breakdown?.heatwave_thermal_risk,
      riskData.hazard_breakdown?.flood_waterlogging_hazard,
      riskData.hazard_breakdown?.pest_disease_epidemic_risk,
      riskData.hazard_breakdown?.soil_degradation_risk,
      riskData.area_hectares,
      riskData.financial_impact?.net_farmer_exposure_usd
    ];
    const csv = [headers.join(','), row.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `YieldSense_Risk_${riskData.crop}_${riskData.season}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const fieldStyle = "w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-rose-400 focus:bg-white transition text-xs";

  return (
    <div className="animate-fadeIn space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-rose-50/90 via-orange-50/60 to-amber-50/70 border border-rose-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Agricultural Risk Assessment & Workflows</h2>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Multi-hazard vulnerability scoring · Climate stress-test simulation · Regional risk matrix · Advisor consultation
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {riskData && (
              <button onClick={handleExportCSV}
                className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-2 rounded-lg transition cursor-pointer border border-slate-200 shadow-xs">
                Export CSV
              </button>
            )}
            <button onClick={() => window.print()}
              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-2 rounded-lg transition cursor-pointer border border-slate-200 shadow-xs">
              Print / PDF
            </button>
          </div>
        </div>
      </div>

      {/* ─── Two-Panel Row ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">

        {/* Left: Advisor Chat */}
        <div className="xl:col-span-7 flex flex-col bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden h-[740px]">

          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
            <div className="flex items-center gap-2.5">
              <div>
                <p className="text-sm font-black text-slate-900">AgriRisk Advisory Desk</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] text-emerald-700 font-semibold">Advisor Active</p>
                  <span className="text-slate-300">·</span>
                  <p className="text-[10px] text-slate-500">Direct Field Consultation</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-200 rounded-xl px-2.5 py-1.5">
              <span className="text-[10px] text-sky-800 font-bold">Connected</span>
            </div>
          </div>

          {/* Quick Scenarios */}
          <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/40 shrink-0">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SCENARIOS.map((s, i) => (
                <button key={i} onClick={() => handleSend(s.prompt)}
                  className="bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-700 text-[11px] font-semibold px-2.5 py-1 rounded-full transition cursor-pointer shadow-xs">
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-600">Start your farm consultation</p>
                  <p className="text-xs text-slate-400 mt-0.5">Use a Quick Scenario or type your own field situation</p>
                </div>
              </div>
            )}
            {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3.5 border-t border-slate-100 bg-white shrink-0">
            <div className="flex items-end gap-2.5">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder='Describe your farm situation... e.g. "My Wheat in Punjab facing drought, rainfall only 180mm"'
                className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition leading-relaxed"
                rows={2}
              />
              <button onClick={() => handleSend()} disabled={!input.trim()}
                className="h-10 px-4 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl flex items-center justify-center transition shadow-md cursor-pointer disabled:cursor-not-allowed shrink-0">
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Right: Risk Assessment Form + Results */}
        <div className="xl:col-span-5 bg-white border border-slate-200 rounded-3xl shadow-sm p-5 flex flex-col h-[740px]">

          <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
            <h3 className="text-sm font-black text-slate-900">
              {activeRightTab === 'results' && riskData ? 'Risk Assessment Report' : 'Farm Risk Parameters'}
            </h3>
            {riskData && (
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {['results', 'form'].map(tab => (
                  <button key={tab} type="button" onClick={() => setActiveRightTab(tab)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${activeRightTab === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>
                    {tab === 'results' ? 'Report' : 'Edit Inputs'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pt-3">

            {/* FORM */}
            {(activeRightTab === 'form' || !riskData) && (
              <form onSubmit={handleEvaluateRisk} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Crop</label>
                    <select value={riskForm.crop} onChange={e => setRiskForm({ ...riskForm, crop: e.target.value })} className={fieldStyle}>
                      {['Wheat','Rice','Maize','Soybean','Cotton','Potato','Sugarcane','Barley'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Region</label>
                    <select value={riskForm.region} onChange={e => setRiskForm({ ...riskForm, region: e.target.value })} className={fieldStyle}>
                      {['North Region','South Region','East Region','West Region','Central Region'].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Season</label>
                    <select value={riskForm.season} onChange={e => setRiskForm({ ...riskForm, season: e.target.value })} className={fieldStyle}>
                      {['Kharif','Rabi','Zaid'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Soil Type</label>
                    <select value={riskForm.soil_type} onChange={e => setRiskForm({ ...riskForm, soil_type: e.target.value })} className={fieldStyle}>
                      {['Loamy','Sandy','Clay','Black','Red','Silty'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Irrigation</label>
                    <select value={riskForm.irrigation_type} onChange={e => setRiskForm({ ...riskForm, irrigation_type: e.target.value })} className={fieldStyle}>
                      {['Canal','Drip','Sprinkler','Rainfed','Tube-well'].map(i => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Rain (mm)</label>
                    <input type="number" value={riskForm.rainfall_mm} onChange={e => setRiskForm({ ...riskForm, rainfall_mm: +e.target.value || 0 })} className={fieldStyle} />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Temp (°C)</label>
                    <input type="number" value={riskForm.temperature_celsius} onChange={e => setRiskForm({ ...riskForm, temperature_celsius: +e.target.value || 0 })} className={fieldStyle} />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Humidity (%)</label>
                    <input type="number" value={riskForm.humidity_percent} onChange={e => setRiskForm({ ...riskForm, humidity_percent: +e.target.value || 0 })} className={fieldStyle} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Area (ha)</label>
                    <input type="number" value={riskForm.area_hectares} onChange={e => setRiskForm({ ...riskForm, area_hectares: +e.target.value || 1 })} className={fieldStyle} />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Soil pH</label>
                    <input type="number" step="0.1" value={riskForm.soil_ph} onChange={e => setRiskForm({ ...riskForm, soil_ph: +e.target.value || 0 })} className={fieldStyle} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Nitrogen N</label>
                    <input type="number" value={riskForm.nitrogen_n} onChange={e => setRiskForm({ ...riskForm, nitrogen_n: +e.target.value || 0 })} className={fieldStyle} />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Phosphorus P</label>
                    <input type="number" value={riskForm.phosphorus_p} onChange={e => setRiskForm({ ...riskForm, phosphorus_p: +e.target.value || 0 })} className={fieldStyle} />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Potassium K</label>
                    <input type="number" value={riskForm.potassium_k} onChange={e => setRiskForm({ ...riskForm, potassium_k: +e.target.value || 0 })} className={fieldStyle} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Organic Matter (%)</label>
                    <input type="number" step="0.1" value={riskForm.organic_matter_percent} onChange={e => setRiskForm({ ...riskForm, organic_matter_percent: +e.target.value || 0 })} className={fieldStyle} />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Insurance Coverage (%)</label>
                    <input type="number" value={riskForm.insurance_coverage_percent} onChange={e => setRiskForm({ ...riskForm, insurance_coverage_percent: +e.target.value || 0 })} className={fieldStyle} />
                  </div>
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="has_insurance"
                    checked={riskForm.has_crop_insurance}
                    onChange={e => setRiskForm({ ...riskForm, has_crop_insurance: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 cursor-pointer"
                  />
                  <label htmlFor="has_insurance" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Crop insured under PMFBY / other scheme
                  </label>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black py-3 rounded-2xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm mt-2">
                  <span>{loading ? 'Evaluating Risk...' : 'Run Risk Assessment'}</span>
                </button>
              </form>
            )}

            {/* RESULTS */}
            {activeRightTab === 'results' && riskData && (
              <div className="space-y-4">
                <RiskDashboard riskData={riskData} loading={loading} />
                <button type="button" onClick={() => setActiveRightTab('form')}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition text-xs cursor-pointer">
                  Adjust Parameters & Re-Evaluate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}
