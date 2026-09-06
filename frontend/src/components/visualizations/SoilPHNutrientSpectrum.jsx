import { FlaskConical, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

export default function SoilPHNutrientSpectrum({
  soilPh = 6.8,
  crop: _crop = 'Wheat'
}) {
  // Scientific nutrient availability percentages based on soil pH
  const calculateNutrientAvailability = (ph) => {
    // Availability calculation formulas modeling real soil chemistry curves
    const n = Math.max(10, Math.min(100, Math.round(100 - Math.pow(Math.abs(ph - 6.8), 2) * 18)));
    const p = Math.max(10, Math.min(100, Math.round(100 - Math.pow(Math.abs(ph - 6.5), 2) * 26))); // P drops sharply in acid/alkaline
    const k = Math.max(20, Math.min(100, Math.round(100 - Math.max(0, 6.0 - ph) * 35 - Math.max(0, ph - 8.2) * 20)));
    const caMg = Math.max(15, Math.min(100, Math.round(100 - Math.max(0, 6.2 - ph) * 40))); // Ca/Mg locks up in acid soils
    const microFeZn = Math.max(10, Math.min(100, Math.round(100 - Math.max(0, ph - 6.8) * 35))); // Micronutrients lock up in alkaline soils

    return [
      { name: 'Nitrogen (N)', percent: n, color: 'bg-emerald-500', barColor: '#10b981' },
      { name: 'Phosphorus (P)', percent: p, color: 'bg-cyan-500', barColor: '#06b6d4' },
      { name: 'Potassium (K)', percent: k, color: 'bg-purple-500', barColor: '#8b5cf6' },
      { name: 'Calcium & Magnesium', percent: caMg, color: 'bg-blue-500', barColor: '#3b82f6' },
      { name: 'Iron & Zinc (Micronutrients)', percent: microFeZn, color: 'bg-amber-500', barColor: '#f59e0b' },
    ];
  };

  const nutrients = calculateNutrientAvailability(soilPh);

  const getPhClassification = (ph) => {
    if (ph < 5.5) return { text: 'Strongly Acidic', color: 'text-rose-600', badge: 'bg-rose-100 text-rose-800' };
    if (ph < 6.5) return { text: 'Slightly Acidic', color: 'text-amber-600', badge: 'bg-amber-100 text-amber-800' };
    if (ph <= 7.5) return { text: 'Optimal Neutral', color: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-800' };
    if (ph <= 8.5) return { text: 'Moderately Alkaline', color: 'text-blue-600', badge: 'bg-blue-100 text-blue-800' };
    return { text: 'Strongly Alkaline', color: 'text-purple-600', badge: 'bg-purple-100 text-purple-800' };
  };

  const classification = getPhClassification(soilPh);
  const pointerPositionPercent = Math.max(0, Math.min(100, ((soilPh - 4.0) / 6.0) * 100)); // Scale for 4.0 to 10.0 range

  return (
    <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="p-1.5 rounded-lg bg-teal-50 border border-teal-100 text-teal-600">
              <FlaskConical className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Soil pH & Nutrient Bioavailability Spectrum</h3>
          </div>
          <p className="text-[11px] text-slate-500 ml-8">Chemical uptake efficiency at measured pH {soilPh}</p>
        </div>
        <span className={`px-3 py-1 rounded-full font-bold text-[11px] ${classification.badge}`}>
          {classification.text}
        </span>
      </div>

      {/* pH Spectrum Bar */}
      <div className="my-3 space-y-2">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>4.0 Acidic</span>
          <span>6.0</span>
          <span className="text-emerald-700 font-black">6.8 - 7.2 Optimal</span>
          <span>8.0</span>
          <span>10.0 Alkaline</span>
        </div>

        {/* Gradient Track with Needle Pointer */}
        <div className="relative w-full h-4 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-500 via-teal-400 to-purple-600 shadow-inner">
          {/* Target Zone Highlight */}
          <div className="absolute top-0 bottom-0 left-[35%] right-[40%] border-2 border-white/80 rounded-sm pointer-events-none" />

          {/* Measured Pointer */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-950 border-2 border-white shadow-md flex items-center justify-center transition-all duration-500"
            style={{ left: `${pointerPositionPercent}%` }}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Nutrient Bioavailability Progress Bars */}
      <div className="space-y-2.5 mt-3 pt-3 border-t border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Macronutrient & Micronutrient Assimilation Rates
        </p>

        {nutrients.map((n, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">{n.name}</span>
              <span className="font-mono font-bold text-slate-900">{n.percent}% Availability</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${n.color}`}
                style={{ width: `${n.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Corrective Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
        {soilPh < 6.2 ? (
          <p className="text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Apply <strong>Agricultural Lime (CaCO3)</strong> @ 1.5–2.5 tonnes/ha to neutralize soil acidity and unlock Phosphorus.</span>
          </p>
        ) : soilPh > 7.8 ? (
          <p className="text-blue-800 bg-blue-50 p-2.5 rounded-xl border border-blue-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>Apply <strong>Elemental Sulfur / Gypsum</strong> @ 500–800 kg/ha to mitigate alkalinity and prevent Zinc/Iron chlorosis.</span>
          </p>
        ) : (
          <p className="text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Soil pH is in the prime zone for maximum root nutrient assimilation.</span>
          </p>
        )}
      </div>
    </div>
  );
}
