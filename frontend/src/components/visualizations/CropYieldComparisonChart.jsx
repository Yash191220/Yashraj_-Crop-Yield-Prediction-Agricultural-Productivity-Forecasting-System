import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { BarChart3, ArrowUpDown, Sparkles, TrendingUp } from 'lucide-react';

export default function CropYieldComparisonChart({
  cropsData = [],
  areaHectares = 10,
  onSelectCrop = () => {}
}) {
  const [metric, setMetric] = useState('yield_t_ha'); // 'yield_t_ha' | 'total_tonnes' | 'score'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'

  // Default mock dataset if empty
  const defaultCrops = [
    { crop: 'Wheat', yield_kg_ha: 2950, baseline_kg_ha: 2600, score: 92 },
    { crop: 'Rice', yield_kg_ha: 3100, baseline_kg_ha: 2800, score: 88 },
    { crop: 'Maize', yield_kg_ha: 2800, baseline_kg_ha: 2400, score: 95 },
    { crop: 'Soybean', yield_kg_ha: 2150, baseline_kg_ha: 1900, score: 85 },
    { crop: 'Cotton', yield_kg_ha: 2400, baseline_kg_ha: 2100, score: 86 },
    { crop: 'Barley', yield_kg_ha: 2700, baseline_kg_ha: 2300, score: 90 },
    { crop: 'Sugarcane', yield_kg_ha: 68000, baseline_kg_ha: 62000, score: 89 },
    { crop: 'Potato', yield_kg_ha: 22000, baseline_kg_ha: 19500, score: 94 }
  ];

  const sourceData = cropsData.length > 0 ? cropsData : defaultCrops;

  // Process data for charts
  let processed = sourceData.map(item => {
    const yieldKg = item.predicted_yield_kg_ha || item.yield_kg_ha || 2500;
    const baseKg = item.baseline_kg_ha || Math.round(yieldKg * 0.88);
    const yieldTHa = roundTo(yieldKg / 1000, 2);
    const baseTHa = roundTo(baseKg / 1000, 2);
    const totalTonnes = roundTo((yieldKg * areaHectares) / 1000, 1);
    const score = item.productivity_score || item.score || 85;

    return {
      crop: item.crop,
      yield_t_ha: yieldTHa,
      baseline_t_ha: baseTHa,
      yield_kg_ha: yieldKg,
      total_tonnes: totalTonnes,
      score: score,
      gainPercent: roundTo(((yieldKg - baseKg) / baseKg) * 100, 1)
    };
  });

  // Filter out sugarcane/potato outliers when viewing in t/ha if needed, or scale appropriately
  processed.sort((a, b) => {
    const valA = a[metric];
    const valB = b[metric];
    return sortOrder === 'desc' ? valB - valA : valA - valB;
  });

  function roundTo(num, dec) {
    return +(Math.round(num + `e+${dec}`) + `e-${dec}`);
  }

  const metricTitles = {
    yield_t_ha: 'Harvest Yield (t/ha)',
    total_tonnes: `Total Production (${areaHectares} ha Tonnes)`,
    score: 'Productivity Score Index (/100)'
  };

  return (
    <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition flex flex-col justify-between">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Multi-Crop Yield & Benchmark Analysis</h3>
          </div>
          <p className="text-[11px] text-slate-500 ml-8">AI Yield forecast vs regional historical baseline</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setMetric('yield_t_ha')}
              className={`px-2.5 py-1 rounded-lg transition ${
                metric === 'yield_t_ha' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Yield (t/ha)
            </button>
            <button
              onClick={() => setMetric('total_tonnes')}
              className={`px-2.5 py-1 rounded-lg transition ${
                metric === 'total_tonnes' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Total Tonnes
            </button>
            <button
              onClick={() => setMetric('score')}
              className={`px-2.5 py-1 rounded-lg transition ${
                metric === 'score' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Score (/100)
            </button>
          </div>

          {/* Sort Button */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition"
            title={`Sort ${sortOrder === 'desc' ? 'Ascending' : 'Descending'}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processed} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="crop" stroke="#64748b" tick={{ fontSize: 11, fontWeight: 'bold' }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl border border-slate-800 space-y-1">
                      <p className="font-bold text-emerald-400">{d.crop}</p>
                      <p className="text-slate-300">Predicted Yield: <span className="text-white font-mono font-bold">{d.yield_t_ha} t/ha</span> ({d.yield_kg_ha} kg)</p>
                      <p className="text-slate-300">Regional Baseline: <span className="text-sky-300 font-mono">{d.baseline_t_ha} t/ha</span></p>
                      <p className="text-slate-300">Total for {areaHectares} ha: <span className="text-teal-300 font-mono font-bold">{d.total_tonnes} Tonnes</span></p>
                      <p className="text-slate-300">Productivity Score: <span className="text-amber-400 font-bold">{d.score}/100</span></p>
                      <p className="text-[10px] text-emerald-300 pt-0.5 font-semibold">📈 +{d.gainPercent}% vs Baseline</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: '8px' }} />
            {metric === 'yield_t_ha' && (
              <>
                <Bar dataKey="yield_t_ha" name="AI Forecast (t/ha)" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="baseline_t_ha" name="Regional Baseline (t/ha)" fill="#94a3b8" radius={[6, 6, 0, 0]} />
              </>
            )}
            {metric === 'total_tonnes' && (
              <Bar dataKey="total_tonnes" name="Total Harvest (Tonnes)" fill="#0d9488" radius={[6, 6, 0, 0]} />
            )}
            {metric === 'score' && (
              <Bar dataKey="score" name="Productivity Score (/100)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Highlight */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Current Metric: <strong className="text-slate-700">{metricTitles[metric]}</strong></span>
        <span className="flex items-center text-emerald-700 font-bold">
          <Sparkles className="w-3.5 h-3.5 mr-1" /> Top Performer: {processed[0]?.crop || 'Wheat'}
        </span>
      </div>
    </div>
  );
}
