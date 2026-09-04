import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { CloudSun, Droplets, Thermometer, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ClimateImpactVisualizer({
  rainfallMm = 800,
  tempCelsius = 22,
  crop = 'Wheat',
  season = 'Rabi'
}) {
  const [viewMode, setViewMode] = useState('rainfall'); // 'rainfall' | 'temperature'

  // Dynamic simulation curves based on crop & climatic tolerances
  const generateRainfallData = () => {
    const points = [];
    for (let r = 200; r <= 2000; r += 150) {
      // Crop optimal curves
      let optimal = crop === 'Rice' ? 1400 : (crop === 'Wheat' ? 800 : 700);
      let yieldImpact = Math.max(10, Math.round(100 - Math.pow(Math.abs(r - optimal) / 25, 1.3) * 0.15));
      let riskLevel = r < 450 ? 'Drought Stress' : (r > 1600 ? 'Flood / Waterlog' : 'Favorable Zone');
      points.push({
        rainfall: r,
        yieldIndex: Math.max(20, Math.min(100, yieldImpact)),
        moistureSufficiency: Math.min(100, Math.round((r / (optimal * 1.2)) * 100)),
        riskLevel
      });
    }
    return points;
  };

  const generateTempData = () => {
    const points = [];
    for (let t = 10; t <= 42; t += 2) {
      let optimal = crop === 'Wheat' ? 21 : (crop === 'Rice' ? 28 : (crop === 'Cotton' ? 30 : 25));
      let yieldImpact = Math.max(15, Math.round(100 - Math.pow(Math.abs(t - optimal), 1.8) * 1.8));
      let riskLevel = t < 14 ? 'Cold Retardation' : (t > 34 ? 'Heat Shock' : 'Thermal Optimum');
      points.push({
        temperature: t,
        yieldIndex: Math.max(10, Math.min(100, yieldImpact)),
        evapotranspiration: Math.min(100, Math.round((t / 40) * 100)),
        riskLevel
      });
    }
    return points;
  };

  const rainData = generateRainfallData();
  const tempData = generateTempData();

  const isCurrentDrought = rainfallMm < 450;
  const isCurrentFlood = rainfallMm > 1500;
  const isHeatStress = tempCelsius > 32;

  return (
    <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="p-1.5 rounded-lg bg-sky-50 border border-sky-100 text-sky-600">
              <CloudSun className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Climate & Weather Sensitivity Curve</h3>
          </div>
          <p className="text-[11px] text-slate-500 ml-8">
            Yield productivity response to climate variables for <span className="font-semibold text-slate-700">{crop} ({season})</span>
          </p>
        </div>

        {/* Toggle buttons */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setViewMode('rainfall')}
            className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
              viewMode === 'rainfall' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" /> Rainfall Response
          </button>
          <button
            onClick={() => setViewMode('temperature')}
            className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
              viewMode === 'temperature' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" /> Temp Response
          </button>
        </div>
      </div>

      {/* Interactive Chart */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'rainfall' ? (
            <AreaChart data={rainData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rainYieldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="rainfall"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                unit="mm"
              />
              <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl border border-slate-800 space-y-1">
                        <p className="font-bold text-sky-400">{d.rainfall} mm Seasonal Rainfall</p>
                        <p className="text-slate-300">Expected Yield Index: <span className="text-white font-mono font-bold">{d.yieldIndex}%</span></p>
                        <p className="text-slate-300">Moisture Index: <span className="text-sky-300 font-mono">{d.moistureSufficiency}%</span></p>
                        <p className="text-[10px] text-slate-400 pt-0.5">Climatic Zone: <span className="font-bold text-emerald-400">{d.riskLevel}</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine x={rainfallMm} stroke="#e11d48" strokeDasharray="4 4" label={{ value: `Current (${rainfallMm}mm)`, fill: '#e11d48', fontSize: 10, position: 'top' }} />
              <Area
                type="monotone"
                dataKey="yieldIndex"
                name="Yield Capacity (%)"
                stroke="#0284c7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#rainYieldGrad)"
              />
            </AreaChart>
          ) : (
            <AreaChart data={tempData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempYieldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="temperature"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                unit="°C"
              />
              <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl border border-slate-800 space-y-1">
                        <p className="font-bold text-amber-400">{d.temperature}°C Ambient Temp</p>
                        <p className="text-slate-300">Expected Yield Index: <span className="text-white font-mono font-bold">{d.yieldIndex}%</span></p>
                        <p className="text-slate-300">Evapotranspiration: <span className="text-amber-300 font-mono">{d.evapotranspiration}%</span></p>
                        <p className="text-[10px] text-slate-400 pt-0.5">Thermal Zone: <span className="font-bold text-emerald-400">{d.riskLevel}</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine x={tempCelsius} stroke="#dc2626" strokeDasharray="4 4" label={{ value: `Current (${tempCelsius}°C)`, fill: '#dc2626', fontSize: 10, position: 'top' }} />
              <Area
                type="monotone"
                dataKey="yieldIndex"
                name="Yield Capacity (%)"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#tempYieldGrad)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Climate Risk Status Footer */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-medium">Field Climate Status:</span>
          {isCurrentDrought ? (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Drought Risk — Supplemental Irrigation Required
            </span>
          ) : isCurrentFlood ? (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> High Precipitation — Surface Drainage Vital
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Optimal Climate Suitability Zone
            </span>
          )}
        </div>

        <span className="text-[10px] text-slate-400 font-mono">
          Measured: {rainfallMm}mm | {tempCelsius}°C
        </span>
      </div>
    </div>
  );
}
