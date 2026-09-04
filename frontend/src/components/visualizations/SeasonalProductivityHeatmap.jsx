import React, { useState } from 'react';
import { Calendar, Sparkles, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

export default function SeasonalProductivityHeatmap({
  region = 'North Region',
  onSelectCrop = () => {}
}) {
  const [activeSeason, setActiveSeason] = useState('All');

  // Multi-crop seasonal suitability data
  const matrix = [
    { crop: 'Wheat', kharif: { yield: 0, score: 20, status: 'Not Recommended' }, rabi: { yield: 3.2, score: 95, status: 'Prime Crop' }, zaid: { yield: 1.8, score: 65, status: 'Moderate' } },
    { crop: 'Rice', kharif: { yield: 3.4, score: 96, status: 'Prime Crop' }, rabi: { yield: 2.1, score: 70, status: 'Moderate' }, zaid: { yield: 2.5, score: 80, status: 'Good (Boro)' } },
    { crop: 'Maize', kharif: { yield: 3.0, score: 92, status: 'Prime Crop' }, rabi: { yield: 3.3, score: 94, status: 'Prime Crop' }, zaid: { yield: 2.8, score: 88, status: 'High' } },
    { crop: 'Soybean', kharif: { yield: 2.4, score: 94, status: 'Prime Crop' }, rabi: { yield: 1.2, score: 45, status: 'Low' }, zaid: { yield: 1.9, score: 75, status: 'Moderate' } },
    { crop: 'Cotton', kharif: { yield: 2.6, score: 93, status: 'Prime Crop' }, rabi: { yield: 0, score: 15, status: 'Not Recommended' }, zaid: { yield: 0, score: 10, status: 'Not Recommended' } },
    { crop: 'Barley', kharif: { yield: 0, score: 25, status: 'Not Recommended' }, rabi: { yield: 2.9, score: 91, status: 'Prime Crop' }, zaid: { yield: 1.5, score: 55, status: 'Low' } },
    { crop: 'Sugarcane', kharif: { yield: 72.0, score: 90, status: 'Annual Prime' }, rabi: { yield: 68.0, score: 88, status: 'Annual Prime' }, zaid: { yield: 64.0, score: 82, status: 'Irrigated' } },
    { crop: 'Potato', kharif: { yield: 0, score: 30, status: 'Not Recommended' }, rabi: { yield: 24.5, score: 96, status: 'Prime Crop' }, zaid: { yield: 14.0, score: 60, status: 'Early Summer' } }
  ];

  const getScoreBadge = (score, status) => {
    if (score >= 90) return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black';
    if (score >= 75) return 'bg-teal-100 text-teal-800 border-teal-300 font-bold';
    if (score >= 50) return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
    return 'bg-slate-100 text-slate-400 border-slate-200';
  };

  return (
    <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Seasonal Crop Suitability Matrix</h3>
          </div>
          <p className="text-[11px] text-slate-500 ml-8">Expected harvest efficiency & score across seasons in {region}</p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          {['All', 'Kharif', 'Rabi', 'Zaid'].map(s => (
            <button
              key={s}
              onClick={() => setActiveSeason(s)}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeSeason === s ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-200/60 font-bold">
            <tr>
              <th className="px-3 py-2.5">Crop</th>
              {(activeSeason === 'All' || activeSeason === 'Kharif') && (
                <th className="px-3 py-2.5 text-center">Kharif (Monsoon)</th>
              )}
              {(activeSeason === 'All' || activeSeason === 'Rabi') && (
                <th className="px-3 py-2.5 text-center">Rabi (Winter)</th>
              )}
              {(activeSeason === 'All' || activeSeason === 'Zaid') && (
                <th className="px-3 py-2.5 text-center">Zaid (Summer)</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matrix.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition">
                <td className="px-3 py-2.5 font-bold text-slate-900">{row.crop}</td>
                
                {(activeSeason === 'All' || activeSeason === 'Kharif') && (
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] border ${getScoreBadge(row.kharif.score, row.kharif.status)}`}>
                        {row.kharif.score > 30 ? `${row.kharif.yield} t/ha` : '—'} ({row.kharif.score}/100)
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">{row.kharif.status}</span>
                    </div>
                  </td>
                )}

                {(activeSeason === 'All' || activeSeason === 'Rabi') && (
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] border ${getScoreBadge(row.rabi.score, row.rabi.status)}`}>
                        {row.rabi.score > 30 ? `${row.rabi.yield} t/ha` : '—'} ({row.rabi.score}/100)
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">{row.rabi.status}</span>
                    </div>
                  </td>
                )}

                {(activeSeason === 'All' || activeSeason === 'Zaid') && (
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] border ${getScoreBadge(row.zaid.score, row.zaid.status)}`}>
                        {row.zaid.score > 30 ? `${row.zaid.yield} t/ha` : '—'} ({row.zaid.score}/100)
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">{row.zaid.status}</span>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> 90+ Prime Suitability
          <span className="w-2.5 h-2.5 rounded-sm bg-teal-500 inline-block ml-2" /> 75-89 Good
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block ml-2" /> 50-74 Moderate
        </span>
        <span className="font-semibold text-emerald-700">Dynamic Agronomic Matrix</span>
      </div>
    </div>
  );
}
