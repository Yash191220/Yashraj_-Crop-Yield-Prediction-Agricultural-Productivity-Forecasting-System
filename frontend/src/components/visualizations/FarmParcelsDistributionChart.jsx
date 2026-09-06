import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Tractor, Layers, Droplets } from 'lucide-react';

export default function FarmParcelsDistributionChart({
  farms = []
}) {
  if (!farms || farms.length === 0) {
    return (
      <div className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-sm text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <Tractor className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">No Farm Fields Registered Yet</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Click <span className="font-bold text-emerald-700">+ Add New Field</span> to register your fields with your exact crops and land sizes. The land allocation chart will plot your real data here automatically.
        </p>
      </div>
    );
  }

  // Aggregate crops across all real farms provided by the farmer
  const cropMap = {};

  farms.forEach(f => {
    if (Array.isArray(f.crop_allocations) && f.crop_allocations.length > 0) {
      f.crop_allocations.forEach(alloc => {
        const cName = (alloc.crop || 'Crop').trim();
        const cArea = parseFloat(alloc.area_hectares) || 0;
        if (cName && cArea > 0) {
          cropMap[cName] = (cropMap[cName] || 0) + cArea;
        }
      });
    } else {
      const area = parseFloat(f.area_hectares) || 0;
      const rawCrops = Array.isArray(f.primary_crops) && f.primary_crops.length > 0
        ? f.primary_crops
        : [f.crop || f.primary_crop || 'Mixed Crop'];
      
      const crops = rawCrops.filter(c => c && c.trim().length > 0);
      const cropList = crops.length > 0 ? crops : ['Mixed Crop'];
      
      cropList.forEach(c => {
        const cleanCrop = c.trim();
        cropMap[cleanCrop] = (cropMap[cleanCrop] || 0) + (area / cropList.length);
      });
    }
  });

  const cropData = Object.keys(cropMap).map(k => ({
    name: k,
    value: Math.round(cropMap[k] * 10) / 10
  }));

  const totalHectares = cropData.reduce((sum, item) => sum + item.value, 0);



  const COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#84cc16'];

  return (
    <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
              <Tractor className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Land Allocation by Crop</h3>
          </div>
          <p className="text-[11px] text-slate-500 ml-8">Acreage breakdown across registered fields</p>
        </div>
        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          {totalHectares.toFixed(1)} ha Total
        </span>
      </div>

      {/* Donut Chart */}
      <div className="h-64 sm:h-72 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={cropData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {cropData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: 11, paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-4 text-center pointer-events-none">
          <p className="text-[10px] font-bold uppercase text-slate-400">Total Area</p>
          <p className="text-lg font-black text-slate-900 leading-none">{totalHectares.toFixed(0)}<span className="text-xs">ha</span></p>
        </div>
      </div>

      {/* Summary Tags */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
        {cropData.slice(0, 4).map((c, i) => (
          <div key={i} className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 font-bold block truncate">{c.name}</span>
            <span className="font-mono font-bold text-slate-800">{c.value} ha</span>
          </div>
        ))}
      </div>
    </div>
  );
}
