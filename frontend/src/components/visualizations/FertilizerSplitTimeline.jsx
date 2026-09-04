import React from 'react';
import { Layers, CheckCircle2, Clock, Droplets, AlertCircle } from 'lucide-react';

export default function FertilizerSplitTimeline({
  crop = 'Wheat',
  nitrogen = 140,
  phosphorus = 45,
  potassium = 60
}) {
  // Agronomic dosage calculations (Urea 46% N, DAP 46% P2O5 & 18% N, MOP 60% K2O)
  const dapNeeded = Math.round((Math.max(0, 50 - phosphorus) / 0.46));
  const nFromDap = dapNeeded * 0.18;
  const remN = Math.max(0, 140 - nitrogen - nFromDap);
  const ureaNeeded = Math.round(remN / 0.46);
  const mopNeeded = Math.round(Math.max(0, 60 - potassium) / 0.60);

  const stages = [
    {
      stage: 'Basal / Sowing Stage',
      timing: 'Day 0 (At planting)',
      action: 'Full P & K reserves + 50% Basal Nitrogen placement',
      dosage: `${Math.round(ureaNeeded * 0.5)} kg/ha Urea + ${dapNeeded || 50} kg/ha DAP + ${mopNeeded || 40} kg/ha MOP`,
      note: 'Incorporate 5cm below seed furrow; do not place directly in contact with seed coat.',
      color: 'border-emerald-500 bg-emerald-50 text-emerald-800'
    },
    {
      stage: 'Active Tillering / Vegetative',
      timing: '21 – 25 Days After Sowing',
      action: '25% Nitrogen top-dressing immediately before 1st crown root irrigation',
      dosage: `${Math.round(ureaNeeded * 0.25)} kg/ha Urea`,
      note: 'Critical for primary tiller formation and root anchorage system.',
      color: 'border-teal-500 bg-teal-50 text-teal-800'
    },
    {
      stage: 'Panicle / Booting Stage',
      timing: '45 – 55 Days After Sowing',
      action: 'Final 25% Nitrogen top-dressing for spikelet density & grain filling',
      dosage: `${Math.round(ureaNeeded * 0.25)} kg/ha Urea`,
      note: 'Ensure adequate soil moisture before broadcasting fertilizer to prevent volatilization.',
      color: 'border-blue-500 bg-blue-50 text-blue-800'
    }
  ];

  return (
    <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-600">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Scientific Fertilizer Split Schedule</h3>
          </div>
          <p className="text-[11px] text-slate-500 ml-8">Phased nutrient application protocol for {crop}</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
          3-Stage Split Protocol
        </span>
      </div>

      {/* Timeline Steps */}
      <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
        {stages.map((stg, idx) => (
          <div key={idx} className="relative flex items-start space-x-3.5 pl-1">
            <div className="w-6 h-6 rounded-full bg-white border-2 border-emerald-600 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0 z-10 shadow-xs">
              {idx + 1}
            </div>

            <div className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <h4 className="text-xs font-bold text-slate-900">{stg.stage}</h4>
                <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> {stg.timing}
                </span>
              </div>

              <p className="text-xs text-slate-700 font-medium">{stg.action}</p>

              <div className="pt-1.5 flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[10px] font-bold text-teal-800">
                  {stg.dosage}
                </span>
                <span className="text-[10px] text-slate-500 italic">{stg.note}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Moisture Alert Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center space-x-2 text-xs text-slate-600">
        <Droplets className="w-4 h-4 text-sky-500 shrink-0" />
        <span><strong>Agronomic Best Practice:</strong> Apply top-dress urea within 24 hours prior to light irrigation to minimize ammonia gas volatilization loss by up to 28%.</span>
      </div>
    </div>
  );
}
