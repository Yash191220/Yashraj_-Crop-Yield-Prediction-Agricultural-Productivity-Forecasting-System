import React, { useState } from 'react';
import {
  runCropSelectionWorkflow,
  runNutrientPlanWorkflow,
  runPestManagementWorkflow,
  runIrrigationScheduleWorkflow,
  runCropRotationWorkflow
} from '../api';

export default function RecommendationWorkflowStudio({ onApplyToForecast }) {
  const [activeWorkflow, setActiveWorkflow] = useState('crop_selection');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Workflow 1: Crop Selection Form
  const [cropSelForm, setCropSelForm] = useState({
    region: 'North Region',
    season: 'Rabi',
    soil_type: 'Loamy',
    soil_ph: 6.8,
    water_availability: 'Medium (Canal / Borewell)',
    area_hectares: 10.0,
    primary_goal: 'Maximum Yield & Profit'
  });

  // Workflow 2: Nutrient Plan Form
  const [nutrientForm, setNutrientForm] = useState({
    crop: 'Wheat',
    area_hectares: 10.0,
    soil_ph: 6.8,
    nitrogen_n: 120.0,
    phosphorus_p: 40.0,
    potassium_k: 60.0,
    organic_matter_percent: 2.2,
    soil_texture: 'Loamy'
  });

  // Workflow 3: Pest Management Form
  const [pestForm, setPestForm] = useState({
    crop: 'Wheat',
    season: 'Rabi',
    temperature_celsius: 22.0,
    humidity_percent: 68.0,
    rainfall_mm: 650.0
  });

  // Workflow 4: Irrigation Schedule Form
  const [irrigationForm, setIrrigationForm] = useState({
    crop: 'Wheat',
    season: 'Rabi',
    soil_type: 'Loamy',
    irrigation_type: 'Canal',
    area_hectares: 10.0,
    seasonal_rainfall_mm: 650.0
  });

  // Workflow 5: Crop Rotation Form
  const [rotationForm, setRotationForm] = useState({
    current_crop: 'Wheat',
    region: 'North Region',
    soil_health_rating: 'Moderate'
  });

  // Execute active workflow
  const handleExecuteWorkflow = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      let res;
      if (activeWorkflow === 'crop_selection') {
        res = await runCropSelectionWorkflow(cropSelForm);
      } else if (activeWorkflow === 'nutrient_plan') {
        res = await runNutrientPlanWorkflow(nutrientForm);
      } else if (activeWorkflow === 'pest_management') {
        res = await runPestManagementWorkflow(pestForm);
      } else if (activeWorkflow === 'irrigation') {
        res = await runIrrigationScheduleWorkflow(irrigationForm);
      } else if (activeWorkflow === 'rotation') {
        res = await runCropRotationWorkflow(rotationForm);
      }
      setResult(res);
    } catch (err) {
      console.error("Workflow error:", err);
      alert("Workflow execution error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const workflows = [
    { id: 'crop_selection', num: '01', label: 'Crop Selection Wizard', desc: 'Rank optimal crops for your soil, season & market objective' },
    { id: 'nutrient_plan', num: '02', label: 'Precision Fertilizer Plan', desc: 'Exact Urea, DAP & MOP dosages with 3-stage split schedule' },
    { id: 'pest_management', num: '03', label: 'Integrated Pest Defense', desc: '4-tier biological, cultural & chemical disease defense' },
    { id: 'irrigation', num: '04', label: 'Irrigation Scheduler', desc: 'Stage-by-stage watering calendar & water saving tips' },
    { id: 'rotation', num: '05', label: 'Crop Rotation Planner', desc: '3-cycle sustainable rotation to fix biological Nitrogen' }
  ];

  const currentWf = workflows.find(w => w.id === activeWorkflow);

  return (
    <div className="space-y-6">
      
      {/* 5 Upper Workflow Model Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {workflows.map((wf) => {
          const isActive = activeWorkflow === wf.id;
          return (
            <button
              key={wf.id}
              type="button"
              onClick={() => { setActiveWorkflow(wf.id); setResult(null); }}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-2.5 ${
                isActive
                  ? 'bg-gradient-to-b from-emerald-50/90 to-teal-50/40 border-emerald-400 ring-2 ring-emerald-400/20 shadow-sm'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                  isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  Model {wf.num}
                </span>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <div>
                <h4 className={`text-xs font-bold ${isActive ? 'text-emerald-950 font-black' : 'text-slate-900'}`}>
                  {wf.label}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {wf.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Single Box Container: Upper Input Form + Lower Output Prescription */}
      <div className="bg-white border border-slate-200/80 p-6 md:p-7 rounded-3xl shadow-sm space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {currentWf?.label}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{currentWf?.desc}</p>
          </div>
          {result && (
            <button
              onClick={() => window.print()}
              className="p-1.5 px-3 rounded-xl hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer shadow-xs transition"
            >
              Print
            </button>
          )}
        </div>

        {/* Upper Part: Configuration Input Form */}
        <form onSubmit={handleExecuteWorkflow} className="space-y-4">
          
          {/* WORKFLOW 1 FORM: CROP SELECTION */}
          {activeWorkflow === 'crop_selection' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Region</label>
                  <select
                    value={cropSelForm.region}
                    onChange={(e) => setCropSelForm({ ...cropSelForm, region: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition font-medium"
                  >
                    {['North Region', 'South Region', 'East Region', 'West Region', 'Central Region'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Season</label>
                  <select
                    value={cropSelForm.season}
                    onChange={(e) => setCropSelForm({ ...cropSelForm, season: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition font-medium"
                  >
                    <option value="Kharif">Kharif (Monsoon)</option>
                    <option value="Rabi">Rabi (Winter)</option>
                    <option value="Zaid">Zaid (Summer)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Soil Texture</label>
                  <select
                    value={cropSelForm.soil_type}
                    onChange={(e) => setCropSelForm({ ...cropSelForm, soil_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition font-medium"
                  >
                    {['Loamy', 'Clay', 'Sandy', 'Black', 'Silty', 'Red'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Measured Soil pH</label>
                  <input
                    type="number" step="0.1"
                    value={cropSelForm.soil_ph}
                    onChange={(e) => setCropSelForm({ ...cropSelForm, soil_ph: parseFloat(e.target.value) || 6.8 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Water Availability</label>
                  <select
                    value={cropSelForm.water_availability}
                    onChange={(e) => setCropSelForm({ ...cropSelForm, water_availability: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition font-medium"
                  >
                    <option value="Low (Rainfed)">Low (Rainfed / Moisture Constrained)</option>
                    <option value="Medium (Canal / Borewell)">Medium (Canal / Tube-well)</option>
                    <option value="High (Assured Drip / Canal)">High (Assured Pressurized Drip / Canal)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Primary Objective</label>
                  <select
                    value={cropSelForm.primary_goal}
                    onChange={(e) => setCropSelForm({ ...cropSelForm, primary_goal: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition font-medium"
                  >
                    <option value="Maximum Yield & Profit">Maximum Yield & Financial Profit</option>
                    <option value="Low Water Usage">Water Conservation / Drought Resilience</option>
                    <option value="Soil Regeneration">Soil Regeneration & Nitrogen Fixation</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Farm Acreage (Hectares)</label>
                  <input
                    type="number" step="0.5"
                    value={cropSelForm.area_hectares}
                    onChange={(e) => setCropSelForm({ ...cropSelForm, area_hectares: parseFloat(e.target.value) || 10 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* WORKFLOW 2 FORM: NUTRIENT PRESCRIPTION */}
          {activeWorkflow === 'nutrient_plan' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Target Crop</label>
                  <select
                    value={nutrientForm.crop}
                    onChange={(e) => setNutrientForm({ ...nutrientForm, crop: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition font-medium"
                  >
                    {['Wheat', 'Rice', 'Maize', 'Soybean', 'Cotton', 'Potato', 'Sugarcane', 'Barley'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Area (ha)</label>
                  <input
                    type="number" step="0.5"
                    value={nutrientForm.area_hectares}
                    onChange={(e) => setNutrientForm({ ...nutrientForm, area_hectares: parseFloat(e.target.value) || 10 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Soil pH</label>
                  <input
                    type="number" step="0.1"
                    value={nutrientForm.soil_ph}
                    onChange={(e) => setNutrientForm({ ...nutrientForm, soil_ph: parseFloat(e.target.value) || 6.8 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Organic Matter (%)</label>
                  <input
                    type="number" step="0.1"
                    value={nutrientForm.organic_matter_percent}
                    onChange={(e) => setNutrientForm({ ...nutrientForm, organic_matter_percent: parseFloat(e.target.value) || 2.0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Nitrogen N (kg/ha)</label>
                  <input
                    type="number"
                    value={nutrientForm.nitrogen_n}
                    onChange={(e) => setNutrientForm({ ...nutrientForm, nitrogen_n: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Phosphorus P (kg/ha)</label>
                  <input
                    type="number"
                    value={nutrientForm.phosphorus_p}
                    onChange={(e) => setNutrientForm({ ...nutrientForm, phosphorus_p: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Potassium K (kg/ha)</label>
                  <input
                    type="number"
                    value={nutrientForm.potassium_k}
                    onChange={(e) => setNutrientForm({ ...nutrientForm, potassium_k: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* WORKFLOW 3 FORM: PEST MANAGEMENT */}
          {activeWorkflow === 'pest_management' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Target Crop</label>
                  <select
                    value={pestForm.crop}
                    onChange={(e) => setPestForm({ ...pestForm, crop: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  >
                    {['Wheat', 'Rice', 'Maize', 'Soybean', 'Cotton', 'Potato', 'Sugarcane', 'Barley'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Season</label>
                  <select
                    value={pestForm.season}
                    onChange={(e) => setPestForm({ ...pestForm, season: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  >
                    <option value="Kharif">Kharif (Monsoon)</option>
                    <option value="Rabi">Rabi (Winter)</option>
                    <option value="Zaid">Zaid (Summer)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Ambient Temp (°C)</label>
                  <input
                    type="number" step="0.5"
                    value={pestForm.temperature_celsius}
                    onChange={(e) => setPestForm({ ...pestForm, temperature_celsius: parseFloat(e.target.value) || 24 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Relative Humidity (%)</label>
                  <input
                    type="number"
                    value={pestForm.humidity_percent}
                    onChange={(e) => setPestForm({ ...pestForm, humidity_percent: parseFloat(e.target.value) || 60 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Rainfall (mm)</label>
                  <input
                    type="number"
                    value={pestForm.rainfall_mm}
                    onChange={(e) => setPestForm({ ...pestForm, rainfall_mm: parseFloat(e.target.value) || 600 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* WORKFLOW 4 FORM: IRRIGATION SCHEDULING */}
          {activeWorkflow === 'irrigation' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Target Crop</label>
                  <select
                    value={irrigationForm.crop}
                    onChange={(e) => setIrrigationForm({ ...irrigationForm, crop: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  >
                    {['Wheat', 'Rice', 'Maize', 'Soybean', 'Cotton', 'Potato', 'Sugarcane', 'Barley'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Irrigation System</label>
                  <select
                    value={irrigationForm.irrigation_type}
                    onChange={(e) => setIrrigationForm({ ...irrigationForm, irrigation_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  >
                    <option value="Canal">Canal / Flood</option>
                    <option value="Drip">Pressurized Drip</option>
                    <option value="Sprinkler">Sprinkler</option>
                    <option value="Tube-well">Borewell / Tube-well</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Soil Type</label>
                  <select
                    value={irrigationForm.soil_type}
                    onChange={(e) => setIrrigationForm({ ...irrigationForm, soil_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  >
                    {['Loamy', 'Clay', 'Sandy', 'Black', 'Silty'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Area (ha)</label>
                  <input
                    type="number" step="0.5"
                    value={irrigationForm.area_hectares}
                    onChange={(e) => setIrrigationForm({ ...irrigationForm, area_hectares: parseFloat(e.target.value) || 10 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* WORKFLOW 5 FORM: CROP ROTATION */}
          {activeWorkflow === 'rotation' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Current Primary Crop</label>
                  <select
                    value={rotationForm.current_crop}
                    onChange={(e) => setRotationForm({ ...rotationForm, current_crop: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  >
                    {['Wheat', 'Rice', 'Maize', 'Soybean', 'Cotton', 'Potato', 'Sugarcane', 'Barley'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Region</label>
                  <select
                    value={rotationForm.region}
                    onChange={(e) => setRotationForm({ ...rotationForm, region: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  >
                    {['North Region', 'South Region', 'East Region', 'West Region', 'Central Region'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Full-width Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition text-xs shadow-xs flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Executing Workflow Models...' : `Generate ${currentWf?.label}`}</span>
            </button>
          </div>
        </form>

        {/* Lower Part: Dynamic Workflow Results Canvas inside the same box */}
        {result && (
          <div className="pt-6 border-t border-slate-200 space-y-6 animate-fadeIn">
            
            {/* RESULT 1: CROP SELECTION */}
            {activeWorkflow === 'crop_selection' && (
              <div className="space-y-4">
                {/* Top Selected Hero Card */}
                <div className="bg-emerald-50/70 border border-emerald-200/80 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">Top Recommended Crop</span>
                    <h4 className="text-2xl font-black text-slate-900 mt-0.5">{result.top_match}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Best match for {result.inputs?.region} in {result.inputs?.season} ({cropSelForm.soil_type} soil, pH {cropSelForm.soil_ph})
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-black text-emerald-700">{result.recommendations?.[0]?.suitability_score}%</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Suitability</p>
                    </div>
                    {onApplyToForecast && (
                      <button
                        type="button"
                        onClick={() => onApplyToForecast({
                          crop: result.top_match,
                          region: cropSelForm.region,
                          season: cropSelForm.season,
                          soil_type: cropSelForm.soil_type,
                          soil_ph: cropSelForm.soil_ph,
                          area_hectares: cropSelForm.area_hectares,
                          irrigation_type: cropSelForm.water_availability.includes('Drip') ? 'Drip' : (cropSelForm.water_availability.includes('Canal') ? 'Canal' : 'Rainfed')
                        })}
                        className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer whitespace-nowrap"
                      >
                        Forecast Yield →
                      </button>
                    )}
                  </div>
                </div>

                {/* Streamlined Ranked Alternative Crops */}
                <div className="space-y-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">All Ranked Crops</p>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
                    {result.recommendations?.slice(0, 4).map((rec, i) => (
                      <div key={i} className="p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-900">{rec.crop}</p>
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                {rec.suitability_score}% Match
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">{rec.primary_rationale}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-slate-800">{rec.expected_yield_t_ha} t/ha</p>
                            <p className="text-[10px] text-slate-400">{rec.total_production_tonnes} T</p>
                          </div>
                          {onApplyToForecast && (
                            <button
                              type="button"
                              onClick={() => onApplyToForecast({
                                crop: rec.crop,
                                region: cropSelForm.region,
                                season: cropSelForm.season,
                                soil_type: cropSelForm.soil_type,
                                soil_ph: cropSelForm.soil_ph,
                                area_hectares: cropSelForm.area_hectares,
                                irrigation_type: cropSelForm.water_availability.includes('Drip') ? 'Drip' : (cropSelForm.water_availability.includes('Canal') ? 'Canal' : 'Rainfed')
                              })}
                              className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              Select →
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* RESULT 2: NUTRIENT PRESCRIPTION */}
            {activeWorkflow === 'nutrient_plan' && (
              <div className="space-y-5">
                {/* Fertilizer Bag Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold uppercase text-emerald-700">Urea (46% N)</p>
                    <p className="text-2xl font-black text-emerald-900 mt-1">{result.fertilizer_totals?.urea_kg} <span className="text-xs font-normal">kg</span></p>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{result.fertilizer_totals?.urea_bags_50kg} Bags (50kg)</p>
                  </div>

                  <div className="bg-cyan-50 border border-cyan-200 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold uppercase text-cyan-700">DAP (46% P, 18% N)</p>
                    <p className="text-2xl font-black text-cyan-900 mt-1">{result.fertilizer_totals?.dap_kg} <span className="text-xs font-normal">kg</span></p>
                    <p className="text-[10px] text-cyan-600 font-semibold mt-0.5">{result.fertilizer_totals?.dap_bags_50kg} Bags (50kg)</p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold uppercase text-purple-700">MOP (60% K2O)</p>
                    <p className="text-2xl font-black text-purple-900 mt-1">{result.fertilizer_totals?.mop_kg} <span className="text-xs font-normal">kg</span></p>
                    <p className="text-[10px] text-purple-600 font-semibold mt-0.5">{result.fertilizer_totals?.mop_bags_50kg} Bags (50kg)</p>
                  </div>
                </div>

                {/* Soil Amendment Callout if present */}
                {result.soil_amendment && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <p className="font-bold text-amber-800">
                      Soil Amendment Recommended: {result.soil_amendment.type}
                    </p>
                    <p className="text-amber-800">{result.soil_amendment.purpose}</p>
                    <p className="font-mono font-bold text-amber-900">Total Field Dosage: {result.soil_amendment.total_dosage_kg} kg ({result.soil_amendment.dosage_per_ha} kg/ha)</p>
                  </div>
                )}

                {/* Split Application Schedule Table */}
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">3-Stage Split Application Schedule</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {result.application_schedule?.map((item, sIdx) => (
                      <div key={sIdx} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs space-y-1.5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between font-bold text-slate-900">
                            <span>{item.phase}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{item.timing}</span>
                          </div>
                          <p className="text-slate-600 mt-1">{item.description}</p>
                        </div>
                        <div className="pt-2 border-t border-slate-200/80 text-[11px] font-mono text-emerald-800 font-bold flex flex-wrap gap-2">
                          {item.urea_kg > 0 && <span>Urea: {item.urea_kg} kg</span>}
                          {item.dap_kg > 0 && <span>DAP: {item.dap_kg} kg</span>}
                          {item.mop_kg > 0 && <span>MOP: {item.mop_kg} kg</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* RESULT 3: PEST MANAGEMENT */}
            {activeWorkflow === 'pest_management' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-slate-50 border border-amber-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Climate Threat Level</span>
                    <h4 className="text-base font-black text-slate-900 mt-0.5">{result.climate_threat_level} Pressure Zone</h4>
                    <p className="text-xs text-slate-600">{result.weather_threat_summary}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    result.climate_threat_level === 'High' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {result.climate_threat_level} Risk
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Cultural */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <p className="font-bold text-emerald-900">
                      Tier 1: Cultural & Preventive
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-emerald-800 text-[11px]">
                      {result.defense_protocol?.tier_1_cultural_preventive?.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Biological */}
                  <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
                    <p className="font-bold text-teal-900">
                      Tier 3: Biological & Organic Bio-Agents
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-teal-800 text-[11px]">
                      {result.defense_protocol?.tier_3_biological_organic?.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Chemical */}
                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                    <p className="font-bold text-rose-900">
                      Tier 4: Chemical Intervention Thresholds
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-rose-800 text-[11px]">
                      {result.defense_protocol?.tier_4_chemical_intervention?.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* RESULT 4: IRRIGATION */}
            {activeWorkflow === 'irrigation' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900">
                  <p className="font-bold text-sky-900 mb-0.5">Critical Hydration Stages</p>
                  <p className="text-sky-800">{result.critical_window_summary}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Scheduled Irrigation Intervals</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.schedule?.map((item, iIdx) => (
                      <div key={iIdx} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900">{item.phenological_stage}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              item.priority === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                            }`}>{item.priority}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">{item.method_directive}</p>
                        </div>
                        <div className="text-right ml-3 shrink-0">
                          <span className="font-mono font-bold text-sky-700 text-sm">{item.water_depth_mm} mm</span>
                          <p className="text-[10px] text-slate-400">{item.target_day}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* RESULT 5: CROP ROTATION */}
            {activeWorkflow === 'rotation' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {result.rotation_plan?.map((cycle, cIdx) => (
                    <div key={cIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-amber-800">{cycle.cycle}</span>
                        <span className="font-mono text-emerald-700 font-bold">{cycle.nitrogen_balance}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900">{cycle.crop}</h4>
                      <p className="text-slate-600">{cycle.soil_impact}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1 text-emerald-900">
                  <p className="font-bold text-emerald-800">
                    Agronomic Benefits of Rotation:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-emerald-800 text-[11px]">
                    {result.agronomic_benefits?.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
