import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { FlaskConical, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

export default function SoilNutrientRadarChart({
  nitrogen = 140,
  phosphorus = 45,
  potassium = 80,
  soilPh = 6.8,
  organicMatter = 2.5,
  targetCrop = 'Wheat'
}) {
  // Crop specific optimal targets
  const cropTargets = {
    Wheat: { n: 140, p: 50, k: 60, ph: 6.8, om: 3.0 },
    Rice: { n: 150, p: 60, k: 80, ph: 6.2, om: 3.2 },
    Maize: { n: 160, p: 60, k: 70, ph: 6.5, om: 2.8 },
    Soybean: { n: 90, p: 70, k: 85, ph: 6.5, om: 3.0 },
    Cotton: { n: 130, p: 55, k: 75, ph: 7.0, om: 2.5 },
    Barley: { n: 110, p: 40, k: 50, ph: 7.0, om: 2.6 },
    Sugarcane: { n: 220, p: 90, k: 120, ph: 6.8, om: 3.5 },
    Potato: { n: 160, p: 80, k: 140, ph: 5.8, om: 3.0 }
  };

  const target = cropTargets[targetCrop] || cropTargets.Wheat;

  // Normalized to 0 - 100 scale for visual comparability on radar
  const data = [
    {
      subject: 'Nitrogen (N)',
      current: Math.min(100, Math.round((nitrogen / Math.max(target.n, 1)) * 100)),
      optimal: 100,
      actualVal: `${nitrogen} kg/ha`,
      optimalVal: `${target.n} kg/ha`,
      status: nitrogen >= target.n * 0.9 ? 'Optimal' : (nitrogen >= target.n * 0.7 ? 'Moderate' : 'Deficient')
    },
    {
      subject: 'Phosphorus (P)',
      current: Math.min(100, Math.round((phosphorus / Math.max(target.p, 1)) * 100)),
      optimal: 100,
      actualVal: `${phosphorus} kg/ha`,
      optimalVal: `${target.p} kg/ha`,
      status: phosphorus >= target.p * 0.9 ? 'Optimal' : (phosphorus >= target.p * 0.7 ? 'Moderate' : 'Deficient')
    },
    {
      subject: 'Potassium (K)',
      current: Math.min(100, Math.round((potassium / Math.max(target.k, 1)) * 100)),
      optimal: 100,
      actualVal: `${potassium} kg/ha`,
      optimalVal: `${target.k} kg/ha`,
      status: potassium >= target.k * 0.9 ? 'Optimal' : (potassium >= target.k * 0.7 ? 'Moderate' : 'Deficient')
    },
    {
      subject: 'Soil pH',
      current: Math.min(100, Math.round((1 - Math.abs(soilPh - target.ph) / 4) * 100)),
      optimal: 100,
      actualVal: `${soilPh} pH`,
      optimalVal: `${target.ph} pH`,
      status: Math.abs(soilPh - target.ph) <= 0.4 ? 'Optimal' : (Math.abs(soilPh - target.ph) <= 0.9 ? 'Moderate' : 'Altered')
    },
    {
      subject: 'Organic Matter',
      current: Math.min(100, Math.round((organicMatter / Math.max(target.om, 1)) * 100)),
      optimal: 100,
      actualVal: `${organicMatter}%`,
      optimalVal: `${target.om}%`,
      status: organicMatter >= target.om * 0.8 ? 'Optimal' : 'Low'
    }
  ];

  const overallBalance = Math.round(data.reduce((acc, d) => acc + d.current, 0) / data.length);

  return (
    <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="p-1.5 rounded-lg bg-teal-50 border border-teal-100 text-teal-600">
              <FlaskConical className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Soil Nutrient Balance Radar</h3>
          </div>
          <p className="text-[11px] text-slate-500 ml-8">Actual soil reserves vs optimal {targetCrop} targets</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-extrabold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>{overallBalance}% Match</span>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#334155', fontSize: 11, fontWeight: 'bold' }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl border border-slate-800 space-y-1">
                      <p className="font-bold text-emerald-400">{d.subject}</p>
                      <p className="text-slate-300">Measured: <span className="text-white font-mono font-bold">{d.actualVal}</span></p>
                      <p className="text-slate-300">Crop Target: <span className="text-emerald-300 font-mono">{d.optimalVal}</span></p>
                      <p className="text-[10px] text-slate-400 pt-0.5">Status: <span className={`font-bold ${d.status === 'Optimal' ? 'text-emerald-400' : 'text-amber-400'}`}>{d.status}</span></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Radar
              name="Optimal Requirement"
              dataKey="optimal"
              stroke="#cbd5e1"
              fill="#f1f5f9"
              fillOpacity={0.4}
            />
            <Radar
              name="Current Field Levels"
              dataKey="current"
              stroke="#0d9488"
              fill="#14b8a6"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Summary Chips */}
      <div className="grid grid-cols-5 gap-1.5 pt-3 border-t border-slate-100 text-center">
        {data.map((item, idx) => (
          <div key={idx} className="p-1.5 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[9px] font-bold text-slate-500 truncate">{item.subject.split(' ')[0]}</p>
            <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">{item.actualVal.split(' ')[0]}</p>
            <span className={`text-[8px] font-bold block mt-0.5 ${item.status === 'Optimal' ? 'text-emerald-600' : 'text-amber-600'}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
