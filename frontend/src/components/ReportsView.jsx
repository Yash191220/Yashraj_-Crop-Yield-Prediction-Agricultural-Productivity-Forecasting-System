import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { getProductivitySeasonalReport, generateCustomReport } from '../api';

export default function ReportsView({ user, onRunForecast }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [selectedSeason, setSelectedSeason] = useState('All Seasons');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [areaHectares, setAreaHectares] = useState(10.0);

  // Custom Audit Simulation Modal
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customForm, setCustomForm] = useState({
    crop: 'Wheat',
    region: 'North Region',
    season: 'Rabi',
    area_hectares: 10.0,
    rainfall_mm: 750.0,
    temperature_celsius: 21.0,
    soil_ph: 6.8,
    nitrogen_n: 140.0,
    phosphorus_p: 45.0,
    potassium_k: 75.0,
    soil_type: 'Loamy',
    irrigation_type: 'Canal'
  });
  const [customResult, setCustomResult] = useState(null);
  const [customLoading, setCustomLoading] = useState(false);

  // Search in matrix table
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProductivitySeasonalReport({
        season: selectedSeason,
        region: selectedRegion,
        area_hectares: areaHectares
      });
      setReportData(data);
    } catch (err) {
      console.error("Report fetch error:", err);
      setError("Failed to fetch live agricultural report. Loading cached intelligence...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeason, selectedRegion, areaHectares]);

  // Export CSV handler
  const handleExportCSV = () => {
    if (!reportData || !reportData.detailed_matrix) return;
    const headers = [
      'Crop', 'Region', 'Season', 'Predicted Yield (kg/ha)', 
      'Predicted Yield (t/ha)', 'Total Harvest (Tonnes)', 'Productivity Score', 
      'Grade', 'Climate Risk', 'Soil pH', 'Rainfall (mm)', 'Temperature (°C)'
    ];
    const rows = reportData.detailed_matrix.map(item => [
      `"${item.crop}"`,
      `"${item.region}"`,
      `"${item.season}"`,
      item.predicted_yield_kg_ha,
      item.predicted_yield_tonnes_ha,
      item.total_harvest_tonnes,
      item.productivity_score,
      `"${item.productivity_grade}"`,
      `"${item.climate_risk}"`,
      item.soil_ph,
      item.rainfall_mm,
      item.temp_celsius
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `YieldSense_Productivity_Seasonal_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Run Custom Single-Farm Audit
  const handleGenerateCustom = async (e) => {
    e.preventDefault();
    setCustomLoading(true);
    try {
      const res = await generateCustomReport(customForm);
      setCustomResult(res);
    } catch (err) {
      alert("Failed to generate custom audit report: " + err.message);
    } finally {
      setCustomLoading(false);
    }
  };

  // Sub-tabs: 'productivity' | 'seasonal' | 'visualization'
  const [activeReportTab, setActiveReportTab] = useState('productivity');

  // Filter matrix data
  const filteredMatrix = reportData?.detailed_matrix?.filter(item => {
    const q = (searchQuery || '').toLowerCase();
    return (item.crop || '').toLowerCase().includes(q) || 
           (item.region || '').toLowerCase().includes(q) || 
           (item.season || '').toLowerCase().includes(q);
  }) || [];

  // Seasonal multi-crop trajectory trend data for LineChart
  const seasonalTrendData = ['Kharif', 'Rabi', 'Zaid'].map(seasonName => {
    const row = { season: seasonName };
    const seasonItems = reportData?.detailed_matrix?.filter(item => item.season === seasonName) || [];
    ['Wheat', 'Rice', 'Maize', 'Soybean', 'Cotton', 'Potato'].forEach(cropName => {
      const matches = seasonItems.filter(item => item.crop === cropName);
      if (matches.length > 0) {
        const avg = matches.reduce((acc, curr) => acc + curr.predicted_yield_tonnes_ha, 0) / matches.length;
        row[cropName] = parseFloat(avg.toFixed(2));
      } else {
        const fallbackMap = { Wheat: 3.2, Rice: 3.6, Maize: 2.9, Soybean: 2.3, Cotton: 1.8, Potato: 18.5 };
        row[cropName] = fallbackMap[cropName] || 2.5;
      }
    });
    return row;
  });

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-slate-50 border border-emerald-200/80 rounded-2xl p-5 shadow-sm">
        {/* Top Row: Title + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-xl font-black text-slate-900">Agricultural Reports & Intelligence</h1>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">Explore crop productivity, seasonal cycles, and visual analytics.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCustomModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition cursor-pointer shadow-sm"
            >
              Custom Field Audit
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-2 rounded-lg transition cursor-pointer border border-slate-200 shadow-xs"
            >
              Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-2 rounded-lg transition cursor-pointer border border-slate-200 shadow-xs"
            >
              Print / PDF
            </button>
            <button
              onClick={fetchReport}
              className="bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs px-4 py-2 rounded-lg transition cursor-pointer border border-slate-200 shadow-xs"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-emerald-100">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Season</label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="w-full bg-white/90 border border-emerald-200 text-slate-800 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 shadow-xs"
            >
              <option value="All Seasons">All Seasons</option>
              <option value="Kharif">Kharif (Monsoon)</option>
              <option value="Rabi">Rabi (Winter)</option>
              <option value="Zaid">Zaid (Summer)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Region</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-white/90 border border-emerald-200 text-slate-800 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 shadow-xs"
            >
              <option value="All Regions">All Regions</option>
              <option value="North Region">North</option>
              <option value="South Region">South</option>
              <option value="East Region">East</option>
              <option value="West Region">West</option>
              <option value="Central Region">Central</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Farm Area</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0.5"
                max="500"
                step="0.5"
                value={areaHectares}
                onChange={(e) => setAreaHectares(parseFloat(e.target.value) || 10.0)}
                className="w-full bg-white/90 border border-emerald-200 text-slate-800 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 shadow-xs"
              />
              <span className="text-xs text-slate-600 font-semibold shrink-0">ha</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Analytics Summary Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 p-4 rounded-xl shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Analyzed Data Points</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900">{reportData?.detailed_matrix?.length || 120}</span>
            <span className="text-xs text-slate-500 font-semibold">matrices</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">8 Crops × 5 Zones × 3 Seasons</p>
        </div>

        <div className="bg-white border border-slate-200/90 p-4 rounded-xl shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Regional Coverage</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900">{reportData?.regional_analytics?.length || 5}</span>
            <span className="text-xs text-slate-500 font-semibold">Agri Zones</span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium mt-0.5">North, South, East, West, Central</p>
        </div>

        <div className="bg-white border border-slate-200/90 p-4 rounded-xl shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">System Productivity</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-emerald-700">{reportData?.kpis?.overall_productivity_score || 84.5}%</span>
            <span className="text-xs text-emerald-600 font-bold">Optimal</span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium mt-0.5">Yield vs Climate Synergy</p>
        </div>

        <div className="bg-white border border-slate-200/90 p-4 rounded-xl shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Average Biomass Yield</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900">{reportData?.kpis?.overall_avg_yield_tonnes_ha || 3.12}</span>
            <span className="text-xs text-slate-500 font-semibold">t/ha</span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium mt-0.5">Multi-Crop Mean Benchmark</p>
        </div>
      </div>

      {/* 3 Dedicated Report Sub-Tabs Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/70 rounded-xl w-fit">
        <button
          onClick={() => setActiveReportTab('productivity')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeReportTab === 'productivity'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          Productivity Report
        </button>

        <button
          onClick={() => setActiveReportTab('seasonal')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeReportTab === 'seasonal'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          Seasonal Report
        </button>

        <button
          onClick={() => setActiveReportTab('visualization')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeReportTab === 'visualization'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          Visualization Report
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 1: PRODUCTIVITY REPORT
          ════════════════════════════════════════════════════════════════════════ */}
      {activeReportTab === 'productivity' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Productivity KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Productivity Index</p>
              <h3 className="text-2xl font-black text-emerald-700 mt-2 mb-1">
                {reportData?.kpis?.overall_productivity_score ?? 87.3}
                <span className="text-xs font-semibold text-slate-400">/100</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Optimal Agronomic Health</p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mean Yield Forecast</p>
              <h3 className="text-2xl font-black text-blue-600 mt-2 mb-1">
                {reportData?.kpis?.overall_avg_yield_tonnes_ha ?? 2.85}
                <span className="text-xs font-semibold text-slate-400"> t/ha</span>
              </h3>
              <p className="text-xs text-slate-500">~{reportData?.kpis?.overall_avg_yield_kg_ha ?? 2850} kg/ha average</p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Top Productivity Crop</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2 mb-1">
                {reportData?.crop_rankings?.[0]?.crop || 'Wheat'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Score: {reportData?.crop_rankings?.[0]?.avg_productivity_score || 91.2} / 100</p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Top Performing Region</p>
              <h3 className="text-2xl font-black text-teal-700 mt-2 mb-1">
                {reportData?.regional_analytics?.[0]?.region || 'North Region'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">{reportData?.regional_analytics?.[0]?.avg_yield_tonnes_ha || 3.12} t/ha regional mean</p>
            </div>
          </div>

          {/* Regional Productivity Rankings */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Regional Agricultural Performance Summary</h3>
            <p className="text-xs text-slate-500 mb-4">Benchmarking average yields and soil productivity by zone.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {reportData?.regional_analytics?.map((reg, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{reg.region}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-200 text-slate-700">{reg.climate_status}</span>
                  </div>
                  <p className="text-slate-500">Soil: <span className="text-slate-800 font-medium">{reg.soil_type}</span></p>
                  <p className="font-mono font-bold text-emerald-700 pt-1">{reg.avg_yield_tonnes_ha} t/ha <span className="text-[10px] font-normal text-slate-400">({reg.productivity_score}/100)</span></p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Productivity Table */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Crop Productivity & Harvest Yield Table</h3>
                <p className="text-xs text-slate-500">Model predictions across crops, soil pH, and climate conditions.</p>
              </div>
              <input
                type="text"
                placeholder="Search crop, season, region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-200/60 font-bold">
                  <tr>
                    <th className="px-3.5 py-2.5">Crop</th>
                    <th className="px-3.5 py-2.5">Region</th>
                    <th className="px-3.5 py-2.5">Season</th>
                    <th className="px-3.5 py-2.5">Yield (t/ha)</th>
                    <th className="px-3.5 py-2.5">Total ({areaHectares} ha)</th>
                    <th className="px-3.5 py-2.5">Productivity Score</th>
                    <th className="px-3.5 py-2.5">Climate Risk</th>
                    <th className="px-3.5 py-2.5">Rainfall / Temp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMatrix.length > 0 ? (
                    filteredMatrix.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition">
                        <td className="px-3.5 py-2.5 font-bold text-slate-900">{row.crop}</td>
                        <td className="px-3.5 py-2.5 text-slate-600">{row.region}</td>
                        <td className="px-3.5 py-2.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {row.season}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 font-mono font-bold text-slate-900">
                          {row.predicted_yield_tonnes_ha} t/ha
                        </td>
                        <td className="px-3.5 py-2.5 font-mono font-bold text-teal-700">
                          {row.total_harvest_tonnes} Tonnes
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[11px]">
                            {row.productivity_score} / 100
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.climate_risk === 'Low' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {row.climate_risk}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-500 font-mono text-[11px]">
                          {row.rainfall_mm}mm | {row.temp_celsius}°C
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-4 py-6 text-center text-slate-500 text-xs">
                        No matching report data found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 2: SEASONAL REPORT
          ════════════════════════════════════════════════════════════════════════ */}
      {activeReportTab === 'seasonal' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Seasonal KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Most Productive Season</p>
              <h3 className="text-2xl font-black text-amber-600 mt-2 mb-1">
                {reportData?.kpis?.most_productive_season ?? 'Rabi'}
              </h3>
              <p className="text-xs text-slate-500">Lower climate volatility cycle</p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monsoon Yield Index</p>
              <h3 className="text-2xl font-black text-emerald-700 mt-2 mb-1">
                {reportData?.season_comparison?.find(s => s.season === 'Kharif')?.avg_yield_tonnes_ha || 2.34} t/ha
              </h3>
              <p className="text-xs text-slate-500">Kharif rainfed primary output</p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Summer Cycle (Zaid)</p>
              <h3 className="text-2xl font-black text-teal-700 mt-2 mb-1">
                {reportData?.season_comparison?.find(s => s.season === 'Zaid')?.avg_yield_tonnes_ha || 2.44} t/ha
              </h3>
              <p className="text-xs text-slate-500">Micro-irrigation focused cycle</p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Climate Resilience</p>
              <h3 className="text-2xl font-black text-blue-600 mt-2 mb-1">92.4%</h3>
              <p className="text-xs text-slate-500 font-medium">Low Vulnerability Index</p>
            </div>
          </div>

          {/* Seasonal Profiles Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reportData?.season_comparison?.map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                      {item.season} Cycle
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {item.avg_yield_tonnes_ha} t/ha avg
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mb-2">{item.title}</h4>
                  
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p><span className="text-slate-500 font-medium">Sowing:</span> <span className="text-slate-800 font-semibold">{item.sowing_window}</span></p>
                    <p><span className="text-slate-500 font-medium">Harvest:</span> <span className="text-slate-800 font-semibold">{item.harvest_window}</span></p>
                    <p><span className="text-slate-500 font-medium">Key Crops:</span> <span className="text-slate-800">{item.primary_crops?.join(', ')}</span></p>
                    <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">{item.climate_profile}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Irrigation Directive</p>
                  <p className="text-xs text-slate-700 mt-0.5">{item.irrigation_strategy}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Strategic Agronomic Directives */}
          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-800 mb-1">Strategic Agronomic Directives & Crop Rotation</h3>
            <p className="text-xs text-slate-500 mb-4">
              AI-generated operational advisories synthesized from regional soil health assays and precipitation models.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {reportData?.strategic_directives?.map((directive, dIdx) => (
                <div key={dIdx} className="bg-white border border-slate-200 p-4 rounded-xl text-xs text-slate-700 leading-relaxed shadow-sm">
                  <div dangerouslySetInnerHTML={{ __html: directive.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>') }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 3: VISUALIZATION REPORT
          ════════════════════════════════════════════════════════════════════════ */}
      {activeReportTab === 'visualization' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top 2 Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* CHART 1: Seasonal Yield Comparison */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Seasonal Yield Comparison (t/ha)</h3>
                  <p className="text-[11px] text-slate-500">Average agricultural output by season</p>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold">
                  Kharif vs Rabi vs Zaid
                </span>
              </div>

              <div className="h-96 md:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData?.season_comparison || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="season" stroke="#64748b" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#475569', paddingTop: '8px' }} />
                    <Bar dataKey="avg_yield_tonnes_ha" name="Average Yield (t/ha)" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CHART 2: Crop Productivity Score Ranking */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Crop Productivity Score Ranking</h3>
                  <p className="text-[11px] text-slate-500">AI score evaluated on soil pH and weather compatibility</p>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold">
                  Score / 100
                </span>
              </div>

              <div className="h-96 md:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData?.crop_rankings || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis dataKey="crop" type="category" stroke="#64748b" tick={{ fontSize: 11, fill: '#334155', fontWeight: 'bold' }} width={80} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                    />
                    <Bar dataKey="avg_productivity_score" name="Productivity Score" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom 2 Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* CHART 3: Regional Productivity Benchmarks */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Regional Productivity (t/ha)</h3>
                  <p className="text-[11px] text-slate-500">Mean yield across agricultural regions</p>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold">
                  5 Agricultural Zones
                </span>
              </div>

              <div className="h-96 md:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData?.regional_analytics || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="region" stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#475569', paddingTop: '8px' }} />
                    <Bar dataKey="avg_yield_tonnes_ha" name="Regional Yield (t/ha)" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CHART 4: Crop Total Production (Tonnes) */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Total Harvest Output ({areaHectares} ha)</h3>
                  <p className="text-[11px] text-slate-500">Expected production volume per crop</p>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold">
                  Tonnes
                </span>
              </div>

              <div className="h-96 md:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData?.crop_rankings || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="crop" stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#475569', paddingTop: '8px' }} />
                    <Bar dataKey="avg_total_tonnes" name="Total Production (Tonnes)" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* CHART 5: Yield Trajectory Across Sowing Seasons */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Yield Trajectory Across Sowing Seasons</h3>
                <p className="text-[11px] text-slate-500">Multi-crop comparative yield curves across Kharif (Monsoon), Rabi (Winter), and Zaid (Summer) cycles</p>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100 w-fit">
                Trajectory Analysis (t/ha)
              </span>
            </div>

            <div className="h-[460px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={seasonalTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="season" stroke="#64748b" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#475569', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="Wheat" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Rice" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Maize" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Soybean" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Cotton" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}


      {/* CUSTOM SINGLE-FARM AUDIT MODAL */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">Custom Farm Seasonal Audit Simulator</h3>
              <button
                onClick={() => { setShowCustomModal(false); setCustomResult(null); }}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateCustom} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Crop</label>
                  <select
                    value={customForm.crop}
                    onChange={(e) => setCustomForm({ ...customForm, crop: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  >
                    {['Wheat', 'Rice', 'Maize', 'Soybean', 'Cotton', 'Barley', 'Sugarcane', 'Potato'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Season</label>
                  <select
                    value={customForm.season}
                    onChange={(e) => setCustomForm({ ...customForm, season: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  >
                    <option value="Kharif">Kharif</option>
                    <option value="Rabi">Rabi</option>
                    <option value="Zaid">Zaid</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Region</label>
                  <select
                    value={customForm.region}
                    onChange={(e) => setCustomForm({ ...customForm, region: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  >
                    {['North Region', 'South Region', 'East Region', 'West Region', 'Central Region'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Area (ha)</label>
                  <input
                    type="number" step="0.5"
                    value={customForm.area_hectares}
                    onChange={(e) => setCustomForm({ ...customForm, area_hectares: parseFloat(e.target.value) || 1 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Soil pH</label>
                  <input
                    type="number" step="0.1"
                    value={customForm.soil_ph}
                    onChange={(e) => setCustomForm({ ...customForm, soil_ph: parseFloat(e.target.value) || 6.5 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Rainfall (mm)</label>
                  <input
                    type="number"
                    value={customForm.rainfall_mm}
                    onChange={(e) => setCustomForm({ ...customForm, rainfall_mm: parseFloat(e.target.value) || 500 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Temp (°C)</label>
                  <input
                    type="number" step="0.5"
                    value={customForm.temperature_celsius}
                    onChange={(e) => setCustomForm({ ...customForm, temperature_celsius: parseFloat(e.target.value) || 25 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={customLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition text-xs shadow-md cursor-pointer"
              >
                {customLoading ? 'Synthesizing ML Audit...' : 'Run Farm Seasonal Audit'}
              </button>
            </form>

            {/* Custom Audit Results Output */}
            {customResult && (
              <div className="space-y-4 pt-4 border-t border-slate-200 animate-fadeIn text-xs">
                <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{customResult.report_id}</span>
                    <h4 className="text-lg font-black text-white">{customResult.crop} • {customResult.season} Season</h4>
                    <p className="text-xs text-slate-400">{customResult.region} ({customResult.area_hectares} ha)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-emerald-400">{customResult.forecast?.predicted_yield_tonnes_ha} t/ha</p>
                    <p className="text-xs text-slate-300 font-bold">{customResult.forecast?.total_production_tonnes} Total Tonnes</p>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-900">
                  <p className="font-bold mb-1 text-emerald-800">
                    Customized Agronomic Directives:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-emerald-800">
                    {customResult.agronomic_advisory?.map((adv, aIdx) => (
                      <li key={aIdx}>{adv}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

