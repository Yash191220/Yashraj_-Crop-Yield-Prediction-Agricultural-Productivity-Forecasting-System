import React, { useState, useEffect } from 'react';
import {
  Sprout,
  TrendingUp,
  CloudSun,
  FlaskConical,
  Tractor,
  Lightbulb,
  User,
  LogOut,
  LogIn,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Activity,
  BarChart3,
  Sparkles,
  RefreshCw,
  Globe,
  Database,
  Eye,
  Download,
  Search,
  RotateCcw,
  Filter,
  FileText,
  X,
  Bell,
  Headphones,
  HelpCircle,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  loginUser,
  registerUser,
  getCurrentUserProfile,
  logoutUser,
  predictYield,
  getPredictionHistory,
  analyzeWeather,
  assessSoil,
  getRecommendations,
  listFarms,
  createFarm,
  deleteFarm
} from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  
  // Auth Form State
  const [loginEmail, setLoginEmail] = useState('farmer@yieldsense.ai');
  const [loginPassword, setLoginPassword] = useState('farmer123');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('farmer');
  const [regRegion, setRegRegion] = useState('North Region');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Prediction State
  const [predForm, setPredForm] = useState({
    user_id: 'usr_farmer_1',
    crop: 'Wheat',
    region: 'North Region',
    season: 'Rabi',
    soil_type: 'Loamy',
    irrigation_type: 'Canal',
    area_hectares: 10.0,
    rainfall_mm: 950.0,
    temperature_celsius: 22.5,
    humidity_percent: 65.0,
    soil_ph: 6.8,
    nitrogen_n: 140.0,
    phosphorus_p: 45.0,
    potassium_k: 80.0,
    organic_matter_percent: 2.5
  });
  const [predictionResult, setPredictionResult] = useState(null);
  const [predLoading, setPredLoading] = useState(false);
  const DEFAULT_INITIAL_LOGS = [
    {
      id: 'pred_001',
      crop: 'Wheat',
      region: 'North Region',
      season: 'Rabi',
      soil_type: 'Loamy',
      irrigation_type: 'Canal',
      area_hectares: 12.5,
      rainfall_mm: 950.0,
      temperature_celsius: 22.5,
      soil_ph: 6.8,
      nitrogen_n: 140.0,
      phosphorus_p: 45.0,
      potassium_k: 80.0,
      predicted_yield_kg_ha: 3450.5,
      total_production_tonnes: 43.13,
      productivity_score: 92,
      soil_health: { status: 'Optimal', score: 94 },
      weather_impact: { risk_level: 'Low Risk' },
      risk_assessment: ['Slight temperature variance during grain filling phase'],
      recommendations: ['Apply 25 kg/ha Nitrogen top-dressing at tillering stage', 'Ensure drip irrigation during critical flowering window'],
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'pred_002',
      crop: 'Rice',
      region: 'East Region',
      season: 'Kharif',
      soil_type: 'Clay',
      irrigation_type: 'Canal',
      area_hectares: 18.0,
      rainfall_mm: 1250.0,
      temperature_celsius: 28.0,
      soil_ph: 6.2,
      nitrogen_n: 160.0,
      phosphorus_p: 50.0,
      potassium_k: 90.0,
      predicted_yield_kg_ha: 4280.0,
      total_production_tonnes: 77.04,
      productivity_score: 88,
      soil_health: { status: 'Optimal', score: 90 },
      weather_impact: { risk_level: 'Low Risk' },
      risk_assessment: ['High humidity may increase sheath blight probability'],
      recommendations: ['Maintain 5cm standing water level during panicle initiation', 'Apply balanced NPK fertilization'],
      created_at: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    {
      id: 'pred_003',
      crop: 'Maize',
      region: 'Central Region',
      season: 'Kharif',
      soil_type: 'Black',
      irrigation_type: 'Rainfed',
      area_hectares: 15.0,
      rainfall_mm: 880.0,
      temperature_celsius: 26.5,
      soil_ph: 7.1,
      nitrogen_n: 130.0,
      phosphorus_p: 40.0,
      potassium_k: 75.0,
      predicted_yield_kg_ha: 4920.0,
      total_production_tonnes: 73.80,
      productivity_score: 95,
      soil_health: { status: 'Optimal', score: 96 },
      weather_impact: { risk_level: 'Low Risk' },
      risk_assessment: ['Potential dry spell during silk formation'],
      recommendations: ['Incorporate organic compost to enhance water retention'],
      created_at: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      id: 'pred_004',
      crop: 'Soybean',
      region: 'West Region',
      season: 'Kharif',
      soil_type: 'Red',
      irrigation_type: 'Rainfed',
      area_hectares: 10.0,
      rainfall_mm: 720.0,
      temperature_celsius: 25.0,
      soil_ph: 5.8,
      nitrogen_n: 90.0,
      phosphorus_p: 35.0,
      potassium_k: 60.0,
      predicted_yield_kg_ha: 2680.0,
      total_production_tonnes: 26.80,
      productivity_score: 79,
      soil_health: { status: 'Suboptimal', score: 72 },
      weather_impact: { risk_level: 'Moderate Risk' },
      risk_assessment: ['Low phosphorus levels and acidic soil pH (5.8) limiting nodulation'],
      recommendations: ['Apply agricultural lime (500 kg/ha) to elevate soil pH to 6.5', 'Inoculate seed with Rhizobium biofertilizer'],
      created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: 'pred_005',
      crop: 'Potato',
      region: 'North Region',
      season: 'Rabi',
      soil_type: 'Loamy',
      irrigation_type: 'Sprinkler',
      area_hectares: 8.5,
      rainfall_mm: 650.0,
      temperature_celsius: 18.5,
      soil_ph: 6.5,
      nitrogen_n: 150.0,
      phosphorus_p: 60.0,
      potassium_k: 120.0,
      predicted_yield_kg_ha: 18500.0,
      total_production_tonnes: 157.25,
      productivity_score: 94,
      soil_health: { status: 'Optimal', score: 95 },
      weather_impact: { risk_level: 'Low Risk' },
      risk_assessment: ['Cool temperatures ideal for tuber enlargement'],
      recommendations: ['Earthing up soil around plants at 30 days after planting', 'Fungicidal spray prevention against late blight'],
      created_at: new Date(Date.now() - 3600000 * 36).toISOString()
    }
  ];

  const [predictionHistory, setPredictionHistory] = useState(DEFAULT_INITIAL_LOGS);
  const [searchLogQuery, setSearchLogQuery] = useState('');
  const [filterLogStatus, setFilterLogStatus] = useState('all');
  const [selectedLogDetail, setSelectedLogDetail] = useState(null);
  const [showLogDetailModal, setShowLogDetailModal] = useState(false);

  // Notifications & Support Architecture State
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [notificationsList, setNotificationsList] = useState([
    { id: 1, type: 'weather', title: 'Rainfall Variance Alert', time: '10 mins ago', message: 'Precipitation model predicts 12% lower rainfall in North Region. Drip irrigation recommended.', unread: true },
    { id: 2, type: 'soil', title: 'Soil Nutrient Deficit', time: '1 hour ago', message: 'Nitrogen N levels (140 kg/ha) are slightly below optimal for target wheat yield.', unread: true },
    { id: 3, type: 'forecast', title: 'AI Model Inference Ready', time: '3 hours ago', message: 'Ensemble model calibrated with 92.61% accuracy. High productivity expected.', unread: false }
  ]);

  // Prediction History Functional Handlers
  const handleExportCSV = () => {
    if (!predictionHistory || predictionHistory.length === 0) {
      alert('No prediction history logged yet to export.');
      return;
    }
    const headers = ['Crop', 'Region', 'Season', 'Soil Type', 'Area (ha)', 'Predicted Yield (kg/ha)', 'Total Harvest (Tonnes)', 'Productivity Score', 'Soil Health Status'];
    const rows = predictionHistory.map(item => [
      `"${item.crop || ''}"`,
      `"${item.region || ''}"`,
      `"${item.season || 'Rabi'}"`,
      `"${item.soil_type || 'Loamy'}"`,
      item.area_hectares || 10,
      item.predicted_yield_kg_ha || 0,
      item.total_production_tonnes || 0,
      item.productivity_score || 85,
      `"${item.soil_health?.status || 'Optimal'}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `YieldSense_Forecast_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRerunLog = (item) => {
    setPredForm({
      user_id: user?.id || 'usr_farmer_1',
      crop: item.crop || 'Wheat',
      region: item.region || 'North Region',
      season: item.season || 'Rabi',
      soil_type: item.soil_type || 'Loamy',
      irrigation_type: item.irrigation_type || 'Canal',
      area_hectares: item.area_hectares || 10.0,
      rainfall_mm: item.rainfall_mm || 950.0,
      temperature_celsius: item.temperature_celsius || 22.5,
      humidity_percent: item.humidity_percent || 65.0,
      soil_ph: item.soil_ph || 6.8,
      nitrogen_n: item.nitrogen_n || 140.0,
      phosphorus_p: item.phosphorus_p || 45.0,
      potassium_k: item.potassium_k || 80.0,
      organic_matter_percent: item.organic_matter_percent || 2.5
    });
    setActiveTab('forecast');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteLog = (idxToDelete) => {
    if (confirm('Are you sure you want to delete this forecast record?')) {
      setPredictionHistory(prev => prev.filter((_, idx) => idx !== idxToDelete));
    }
  };

  const filteredLogs = predictionHistory.filter((item) => {
    const matchesSearch =
      item.crop?.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
      item.region?.toLowerCase().includes(searchLogQuery.toLowerCase());
    const status = (item.soil_health?.status || 'Optimal').toLowerCase();
    const matchesStatus = filterLogStatus === 'all' || status === filterLogStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Soil & Weather State
  const [soilForm, setSoilForm] = useState({
    region: 'North Region',
    soil_type: 'Loamy',
    soil_ph: 6.8,
    nitrogen_n: 120.0,
    phosphorus_p: 40.0,
    potassium_k: 60.0,
    organic_matter_percent: 2.5
  });
  const [soilResult, setSoilResult] = useState(null);
  const [weatherForm, setWeatherForm] = useState({
    region: 'North Region',
    season: 'Rabi'
  });
  const [weatherResult, setWeatherResult] = useState(null);

  // Farm Management State
  const [farms, setFarms] = useState([]);
  const [showAddFarmModal, setShowAddFarmModal] = useState(false);
  const [newFarm, setNewFarm] = useState({
    farm_name: '',
    region: 'North Region',
    area_hectares: 15.0,
    soil_type: 'Loamy',
    irrigation_type: 'Drip',
    primary_crops: ['Wheat', 'Rice']
  });

  // Advisory State
  const [recQuery, setRecQuery] = useState({
    crop: 'Wheat',
    region: 'North Region',
    soil_ph: 6.8,
    rainfall_mm: 950.0
  });
  const [recResult, setRecResult] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchHistory();
    fetchFarmList();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getCurrentUserProfile();
      setUser(data);
    } catch {
      setUser(null);
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await getPredictionHistory(user?.id || 'usr_farmer_1');
      if (data && data.length > 0) {
        setPredictionHistory(prev => {
          // Merge backend history with local prediction history safely
          const existingIds = new Set(prev.map(i => i.id || `${i.crop}_${i.region}_${i.predicted_yield_kg_ha}`));
          const newBackendItems = data.filter(i => !existingIds.has(i.id || `${i.crop}_${i.region}_${i.predicted_yield_kg_ha}`));
          return [...prev, ...newBackendItems];
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFarmList = async () => {
    try {
      const data = await listFarms();
      setFarms(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const data = await loginUser({ email: loginEmail, password: loginPassword });
      setUser(data.user);
      setShowAuthModal(false);
      fetchHistory();
      fetchFarmList();
    } catch (err) {
      setAuthError(err.response?.data?.detail || 'Login failed. Please check credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const data = await registerUser({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        region: regRegion
      });
      setUser(data.user);
      setShowAuthModal(false);
      fetchHistory();
      fetchFarmList();
    } catch (err) {
      setAuthError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  const handleQuickLogin = (email, password) => {
    setLoginEmail(email);
    setLoginPassword(password);
    setAuthMode('login');
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setPredLoading(true);
    try {
      const activeUserId = user?.id || 'usr_farmer_1';
      const data = await predictYield({
        ...predForm,
        user_id: activeUserId
      });
      setPredictionResult(data);

      // Immediately prepend new prediction to Recent Prediction Logs history
      const newLogItem = {
        crop: predForm.crop,
        region: predForm.region,
        season: predForm.season,
        soil_type: predForm.soil_type,
        irrigation_type: predForm.irrigation_type,
        area_hectares: predForm.area_hectares,
        rainfall_mm: predForm.rainfall_mm,
        temperature_celsius: predForm.temperature_celsius,
        soil_ph: predForm.soil_ph,
        nitrogen_n: predForm.nitrogen_n,
        phosphorus_p: predForm.phosphorus_p,
        potassium_k: predForm.potassium_k,
        predicted_yield_kg_ha: data.predicted_yield_kg_ha,
        total_production_tonnes: data.total_production_tonnes,
        productivity_score: data.productivity_score,
        soil_health: data.soil_health,
        weather_impact: data.weather_impact,
        risk_assessment: data.risk_assessment,
        recommendations: data.recommendations,
        created_at: new Date().toISOString()
      };

      setPredictionHistory(prev => [newLogItem, ...prev]);
    } catch (err) {
      alert('Prediction failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setPredLoading(false);
    }
  };

  const handleSoilAssess = async (e) => {
    e.preventDefault();
    try {
      const data = await assessSoil(soilForm);
      setSoilResult(data);
    } catch (err) {
      alert('Soil assessment error: ' + err.message);
    }
  };

  const handleWeatherAnalyze = async (e) => {
    e.preventDefault();
    try {
      const data = await analyzeWeather(weatherForm);
      setWeatherResult(data);
    } catch (err) {
      alert('Weather analysis error: ' + err.message);
    }
  };

  const handleCreateFarm = async (e) => {
    e.preventDefault();
    const tempFarm = {
      id: `farm_${Date.now()}`,
      farm_name: newFarm.farm_name || 'My New Field Parcel',
      region: newFarm.region || 'North Region',
      area_hectares: newFarm.area_hectares || 10.0,
      soil_type: newFarm.soil_type || 'Loamy',
      irrigation_type: newFarm.irrigation_type || 'Drip',
      primary_crops: newFarm.primary_crops || ['Wheat', 'Rice'],
      created_at: new Date().toISOString()
    };

    try {
      await createFarm({ ...newFarm, user_id: user?.id || 'usr_farmer_1' });
      setFarms(prev => [tempFarm, ...prev.filter(f => f.id !== tempFarm.id)]);
      setShowAddFarmModal(false);
      fetchFarmList();
    } catch (err) {
      console.warn('Backend create farm notice, using local state:', err);
      setFarms(prev => [tempFarm, ...prev.filter(f => f.id !== tempFarm.id)]);
      setShowAddFarmModal(false);
    }
  };

  const handleDeleteFarm = async (id) => {
    if (confirm('Are you sure you want to delete this field profile?')) {
      try {
        await deleteFarm(id);
        fetchFarmList();
      } catch (err) {
        alert('Failed to delete farm: ' + err.message);
      }
    }
  };

  const handleFetchRecommendations = async (e) => {
    e.preventDefault();
    try {
      const data = await getRecommendations(recQuery);
      setRecResult(data);
    } catch (err) {
      alert('Failed to get recommendations: ' + err.message);
    }
  };

  // Chart Data
  const cropYieldChartData = [
    { crop: 'Wheat', yield: 3400, baseline: 3000 },
    { crop: 'Rice', yield: 4200, baseline: 3800 },
    { crop: 'Maize', yield: 4900, baseline: 4200 },
    { crop: 'Soybean', yield: 2700, baseline: 2400 },
    { crop: 'Barley', yield: 3200, baseline: 2900 },
    { crop: 'Cotton', yield: 2100, baseline: 1800 }
  ];

  const soilRadarData = [
    { subject: 'Nitrogen (N)', A: predForm.nitrogen_n, max: 200 },
    { subject: 'Phosphorus (P)', A: predForm.phosphorus_p * 2, max: 200 },
    { subject: 'Potassium (K)', A: predForm.potassium_k * 1.5, max: 200 },
    { subject: 'Soil pH', A: predForm.soil_ph * 20, max: 200 },
    { subject: 'Organic Matter', A: predForm.organic_matter_percent * 40, max: 200 }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* BRIGHT LIGHT HEADER & NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3 flex items-center justify-between shadow-sm gap-4">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-md shadow-emerald-500/20 transition-transform group-hover:scale-105 flex items-center justify-center">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center">
              YieldSense <span className="text-emerald-600 ml-1 font-black">AI</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Agricultural Productivity & Forecasting</p>
          </div>
        </div>

        {/* Right Side Section: Nav Tabs & Log In grouped closely */}
        <div className="flex items-center space-x-3">
          <nav className="flex items-center space-x-1 py-1">
            {(() => {
              const currentRole = user?.role || 'farmer';
              const navTabs = [
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['farmer', 'agronomist', 'admin'] },
                { id: 'forecast', label: 'Yield Forecasting', icon: TrendingUp, roles: ['farmer', 'agronomist', 'admin'] },
                { id: 'analysis', label: 'Soil & Weather', icon: FlaskConical, roles: ['farmer', 'agronomist', 'admin'] },
                { id: 'farms', label: 'My Fields', icon: Tractor, roles: ['farmer', 'admin'] },
                { id: 'advisory', label: 'Advisory', icon: Lightbulb, roles: ['farmer', 'agronomist', 'admin'] }
              ].filter(tab => tab.roles.includes(currentRole));

              return navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              });
            })()}
          </nav>

          {/* Notifications Dropdown Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition relative"
              title="Agricultural Notifications & Risk Alerts"
            >
              <Bell className="w-4 h-4" />
              {notificationsList.some(n => n.unread) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-ping"></span>
              )}
              {notificationsList.some(n => n.unread) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center">
                    <Bell className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Notifications & Alerts
                  </h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    {notificationsList.filter(n => n.unread).length} New
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notificationsList.map(n => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Support / Assistance Button */}
          <button
            onClick={() => setShowSupportModal(true)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="Agronomic Support & Expert Assistance"
          >
            <Headphones className="w-4 h-4" />
          </button>

          {/* Log In / User Profile */}
          {user ? (
            <div className="flex items-center space-x-2.5 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                {user.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800">{user.name}</p>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
                    {user.role}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">{user.region}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-md shadow-emerald-600/20 shrink-0"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </header>

      {/* SUB-HEADER BANNER */}
      <div className="bg-emerald-50/70 border-b border-emerald-100/80 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-500">YieldSense ML Engine Calibrated</p>
              <p className="text-xs font-bold text-slate-800 flex items-center">
                Ensemble Model Accuracy: <span className="text-emerald-700 ml-1.5 font-mono">92.61%</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-xs text-slate-600">
            <span className="flex items-center"><Database className="w-3.5 h-3.5 mr-1 text-emerald-600" /> 40,228 Records</span>
            <span className="flex items-center"><Globe className="w-3.5 h-3.5 mr-1 text-teal-600" /> FAOSTAT & Kaggle Data</span>
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* VIEW 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model Accuracy</p>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-emerald-700 mt-2">92.61%</h3>
                <p className="text-xs text-slate-500 mt-2 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" /> Weighted Ensemble Engine
                </p>
              </div>

              <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Fields</p>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Tractor className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-blue-600 mt-2">{farms.length || 1}</h3>
                <p className="text-xs text-slate-500 mt-2">Registered Land Parcels</p>
              </div>

              <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logged Forecasts</p>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-amber-600 mt-2">{predictionHistory.length || 10}</h3>
                <p className="text-xs text-slate-500 mt-2">Saved Prediction Runs</p>
              </div>

              <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Soil Fertility</p>
                  <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-teal-600 mt-2">Optimal</h3>
                <p className="text-xs text-slate-500 mt-2">Neutral pH 6.8 | High Organic Matter</p>
              </div>
            </div>

            {/* Charts Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2 text-emerald-600" />
                      Crop Yield Forecasting (kg/ha)
                    </h3>
                    <p className="text-xs text-slate-500">AI prediction vs regional benchmark</p>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-semibold">
                    Random Forest + XGB
                  </span>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cropYieldChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="crop" stroke="#64748b" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="yield" name="AI Forecast (kg/ha)" fill="#10b981" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="baseline" name="Regional Baseline" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center">
                      <FlaskConical className="w-4 h-4 mr-2 text-teal-600" />
                      Nutrient Profile & Soil Health Radar
                    </h3>
                    <p className="text-xs text-slate-500">NPK composition and soil quality radar</p>
                  </div>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={soilRadarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" stroke="#475569" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis stroke="#cbd5e1" />
                      <Radar name="Nutrient Level" dataKey="A" stroke="#059669" fill="#10b981" fillOpacity={0.45} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Interactive Prediction Log Table */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-amber-600" /> Recent Prediction Logs
                  </h3>
                  <p className="text-xs text-slate-500">Filter, search, inspect full AI inference details, or re-run historical yield models</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition border border-slate-200"
                    title="Export historical logs as CSV spreadsheet"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('forecast')}
                    className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Run New Forecast</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search logs by crop or region..."
                    value={searchLogQuery}
                    onChange={(e) => setSearchLogQuery(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-500 font-medium">Soil Status:</span>
                  <select
                    value={filterLogStatus}
                    onChange={(e) => setFilterLogStatus(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="optimal">Optimal</option>
                    <option value="suboptimal">Suboptimal</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
              </div>

              {/* Interactive Log Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-100 text-slate-600 text-[11px] uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Crop</th>
                      <th className="px-4 py-3">Region</th>
                      <th className="px-4 py-3">Yield Forecast</th>
                      <th className="px-4 py-3">Total Harvest</th>
                      <th className="px-4 py-3">Productivity Score</th>
                      <th className="px-4 py-3">Soil Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3 font-bold text-emerald-700">{item.crop}</td>
                          <td className="px-4 py-3 text-xs text-slate-600">{item.region}</td>
                          <td className="px-4 py-3 font-mono text-xs font-bold text-slate-800">{item.predicted_yield_kg_ha} kg/ha</td>
                          <td className="px-4 py-3 font-mono text-xs text-teal-700 font-bold">{item.total_production_tonnes} Tonnes</td>
                          <td className="px-4 py-3">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                              {item.productivity_score} / 100
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">{item.soil_health?.status || 'Optimal'}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => { setSelectedLogDetail(item); setShowLogDetailModal(true); }}
                                className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                                title="View Full AI Forecast Report"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleRerunLog(item)}
                                className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                                title="Re-Run Model with exact parameters"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteLog(idx)}
                                className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete Log Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-4 py-6 text-center text-slate-500 text-xs">
                          {predictionHistory.length === 0
                            ? 'No prediction history logged yet. Execute a forecast to populate log data.'
                            : 'No matching prediction logs found for your search/filter.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: YIELD FORECASTING ENGINE */}
        {activeTab === 'forecast' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Form Column */}
            <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5">
              <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
                <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">AI Crop Yield Prediction Workspace</h2>
                  <p className="text-xs text-slate-500">Configure parameters to execute multi-model ensemble inference</p>
                </div>
              </div>

              <form onSubmit={handlePredict} className="space-y-4">
                {/* Crop & Location */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center">
                    <Globe className="w-3.5 h-3.5 mr-1" /> 1. Crop & Region Parameters
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <label className="text-xs text-slate-500">Target Crop</label>
                      <select
                        value={predForm.crop}
                        onChange={(e) => setPredForm({ ...predForm, crop: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 focus:outline-none focus:border-emerald-600 text-xs"
                      >
                        {['Wheat', 'Rice', 'Maize', 'Soybean', 'Cotton', 'Barley', 'Sugarcane', 'Potato'].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-500">Region</label>
                      <select
                        value={predForm.region}
                        onChange={(e) => setPredForm({ ...predForm, region: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 focus:outline-none focus:border-emerald-600 text-xs"
                      >
                        {['North Region', 'South Region', 'East Region', 'West Region', 'Central Region'].map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-500">Season</label>
                      <select
                        value={predForm.season}
                        onChange={(e) => setPredForm({ ...predForm, season: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 focus:outline-none focus:border-emerald-600 text-xs"
                      >
                        {['Kharif', 'Rabi', 'Zaid', 'Spring', 'Autumn'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Field & Environment */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center">
                    <CloudSun className="w-3.5 h-3.5 mr-1" /> 2. Field & Climate Inputs
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <label className="text-xs text-slate-500">Soil Texture</label>
                      <select
                        value={predForm.soil_type}
                        onChange={(e) => setPredForm({ ...predForm, soil_type: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                      >
                        {['Loamy', 'Clay', 'Sandy', 'Black', 'Alluvial', 'Red'].map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-500">Irrigation System</label>
                      <select
                        value={predForm.irrigation_type}
                        onChange={(e) => setPredForm({ ...predForm, irrigation_type: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                      >
                        {['Rainfed', 'Drip', 'Canal', 'Sprinkler'].map((it) => (
                          <option key={it} value={it}>{it}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-500">Area (ha)</label>
                      <input
                        type="number" step="0.5"
                        value={predForm.area_hectares}
                        onChange={(e) => setPredForm({ ...predForm, area_hectares: parseFloat(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-500">Rainfall (mm)</label>
                      <input
                        type="number"
                        value={predForm.rainfall_mm}
                        onChange={(e) => setPredForm({ ...predForm, rainfall_mm: parseFloat(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Soil Nutrients NPK */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center">
                    <FlaskConical className="w-3.5 h-3.5 mr-1" /> 3. Soil Nutrients (NPK & pH)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                    <div>
                      <label className="text-xs text-slate-500">Temp (°C)</label>
                      <input
                        type="number" step="0.5"
                        value={predForm.temperature_celsius}
                        onChange={(e) => setPredForm({ ...predForm, temperature_celsius: parseFloat(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-500">Soil pH</label>
                      <input
                        type="number" step="0.1"
                        value={predForm.soil_ph}
                        onChange={(e) => setPredForm({ ...predForm, soil_ph: parseFloat(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-500">Nitrogen N</label>
                      <input
                        type="number"
                        value={predForm.nitrogen_n}
                        onChange={(e) => setPredForm({ ...predForm, nitrogen_n: parseFloat(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-500">Phosphorus P</label>
                      <input
                        type="number"
                        value={predForm.phosphorus_p}
                        onChange={(e) => setPredForm({ ...predForm, phosphorus_p: parseFloat(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-500">Potassium K</label>
                      <input
                        type="number"
                        value={predForm.potassium_k}
                        onChange={(e) => setPredForm({ ...predForm, potassium_k: parseFloat(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={predLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-2xl transition shadow-md flex items-center justify-center space-x-2 text-sm"
                  >
                    {predLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Running Weighted Ensemble Model...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Execute Crop Yield Forecast</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Inference Output Display */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center justify-between">
                  <span className="flex items-center"><Activity className="w-4 h-4 mr-2 text-emerald-600" /> AI Forecast Output</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">92.61% Accuracy</span>
                </h3>

                {predictionResult ? (
                  <div className="mt-4 space-y-4 animate-fadeIn">
                    <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-center shadow-sm">
                      <p className="text-xs uppercase tracking-wider font-bold text-emerald-700">Predicted Yield</p>
                      <h2 className="text-4xl font-black text-slate-900 mt-1">
                        {predictionResult.predicted_yield_kg_ha} <span className="text-base text-emerald-700 font-bold">kg/ha</span>
                      </h2>
                      <p className="text-xs text-slate-600 font-medium mt-2">
                        Total Harvest Tonnage: <span className="text-emerald-700 font-bold">{predictionResult.total_production_tonnes} Tonnes</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Productivity Index</p>
                        <p className="text-xl font-black text-amber-600 mt-1">{predictionResult.productivity_score} / 100</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Soil Fertility</p>
                        <p className="text-xl font-black text-teal-600 mt-1">{predictionResult.soil_health?.status}</p>
                      </div>
                    </div>

                    <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80 space-y-2">
                      <p className="text-xs font-bold text-amber-900 flex items-center">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-600" /> Climate & Soil Risks
                      </p>
                      <ul className="text-xs text-amber-800 space-y-1 pl-4 list-disc">
                        {predictionResult.risk_assessment?.map((risk, i) => (
                          <li key={i}>{risk}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80 space-y-2">
                      <p className="text-xs font-bold text-emerald-900 flex items-center">
                        <Lightbulb className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Actionable Agronomic Advice
                      </p>
                      <ul className="text-xs text-emerald-800 space-y-1 pl-4 list-disc">
                        {predictionResult.recommendations?.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="my-16 text-center text-slate-400 space-y-3">
                    <Sprout className="w-12 h-12 mx-auto text-slate-300" />
                    <p className="text-xs">Fill field parameters and click "Execute Crop Yield Forecast".</p>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-400 text-center border-t border-slate-100 pt-3">
                Powered by YieldSense Multi-Algorithm Pipeline (Accuracy: 92.61%)
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: SOIL & WEATHER */}
        {activeTab === 'analysis' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
            {/* Soil Quality Module */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
                <FlaskConical className="w-6 h-6 text-teal-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Soil Quality & Fertilizer Assessment</h3>
                  <p className="text-xs text-slate-500">Evaluate NPK balance, pH, and fertilizer dosage</p>
                </div>
              </div>

              <form onSubmit={handleSoilAssess} className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-xs text-slate-500">Soil pH</label>
                  <input
                    type="number" step="0.1"
                    value={soilForm.soil_ph}
                    onChange={(e) => setSoilForm({ ...soilForm, soil_ph: parseFloat(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Nitrogen N (kg/ha)</label>
                  <input
                    type="number"
                    value={soilForm.nitrogen_n}
                    onChange={(e) => setSoilForm({ ...soilForm, nitrogen_n: parseFloat(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Phosphorus P (kg/ha)</label>
                  <input
                    type="number"
                    value={soilForm.phosphorus_p}
                    onChange={(e) => setSoilForm({ ...soilForm, phosphorus_p: parseFloat(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Potassium K (kg/ha)</label>
                  <input
                    type="number"
                    value={soilForm.potassium_k}
                    onChange={(e) => setSoilForm({ ...soilForm, potassium_k: parseFloat(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 mt-1 text-xs"
                  />
                </div>
                <div className="col-span-2 pt-2">
                  <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 rounded-xl transition text-xs shadow-sm">
                    Calculate Soil Health Index
                  </button>
                </div>
              </form>

              {soilResult && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Soil Health Score:</span>
                    <span className="text-lg font-bold text-teal-600">{soilResult.soil_health_score} / 100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Fertility Rating:</span>
                    <span className="font-semibold text-emerald-600">{soilResult.fertility_status}</span>
                  </div>
                  <p className="text-slate-700 font-semibold mt-2">Recommended Corrective Dosage:</p>
                  <ul className="list-disc pl-4 text-slate-600 space-y-1">
                    {soilResult.recommended_fertilizers?.map((f, idx) => (
                      <li key={idx}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Weather Module */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
                <CloudSun className="w-6 h-6 text-sky-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Weather & Drought Risk Evaluator</h3>
                  <p className="text-xs text-slate-500">Regional rainfall, temperature, and drought risks</p>
                </div>
              </div>

              <form onSubmit={handleWeatherAnalyze} className="space-y-3 text-sm">
                <div>
                  <label className="text-xs text-slate-500">Region</label>
                  <select
                    value={weatherForm.region}
                    onChange={(e) => setWeatherForm({ ...weatherForm, region: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                  >
                    {['North Region', 'South Region', 'East Region', 'West Region', 'Central Region'].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Season</label>
                  <select
                    value={weatherForm.season}
                    onChange={(e) => setWeatherForm({ ...weatherForm, season: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                  >
                    {['Kharif', 'Rabi', 'Zaid', 'Spring', 'Autumn'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 rounded-xl transition text-xs shadow-sm mt-2">
                  Analyze Regional Climate
                </button>
              </form>

              {weatherResult && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Precipitation:</span>
                    <span className="font-bold text-sky-600">{weatherResult.rainfall_mm} mm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Avg Temperature:</span>
                    <span className="font-bold text-amber-600">{weatherResult.temperature_celsius} °C</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Drought Risk:</span>
                    <span className="font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">{weatherResult.drought_risk} Risk</span>
                  </div>
                  <p className="text-slate-700 mt-2">{weatherResult.climate_status}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 4: MY FARMS */}
        {activeTab === 'farms' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">My Farm Portfolios & Fields</h2>
                <p className="text-xs text-slate-500">Manage registered farm land parcels, soil types, and crop history</p>
              </div>
              <button
                onClick={() => setShowAddFarmModal(true)}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Field</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {farms.map((farm) => (
                <div key={farm.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-bold text-emerald-700 text-base flex items-center">
                        <Tractor className="w-4 h-4 mr-2" /> {farm.farm_name}
                      </h3>
                      <button onClick={() => handleDeleteFarm(farm.id)} className="text-slate-400 hover:text-rose-600 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 font-medium">{farm.region}</p>

                    <div className="mt-4 space-y-2 text-xs text-slate-700">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Area Size:</span>
                        <span className="font-mono font-bold text-slate-900">{farm.area_hectares} Hectares</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Soil Texture:</span>
                        <span className="font-medium">{farm.soil_type}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Irrigation:</span>
                        <span className="font-medium">{farm.irrigation_type}</span>
                      </div>
                      <div className="py-1">
                        <span className="text-slate-500 block mb-1">Primary Crops:</span>
                        <div className="flex flex-wrap gap-1">
                          {farm.primary_crops?.map((c, i) => (
                            <span key={i} className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] border border-emerald-200 font-semibold">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { setPredForm({ ...predForm, region: farm.region, soil_type: farm.soil_type, irrigation_type: farm.irrigation_type, area_hectares: farm.area_hectares }); setActiveTab('forecast'); }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-emerald-800 text-xs font-bold py-2 rounded-xl transition border border-slate-200"
                  >
                    Run Forecast for this Field
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: ADVISORY */}
        {activeTab === 'advisory' && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6 animate-fadeIn">
            <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
              <Lightbulb className="w-6 h-6 text-amber-600" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">Agricultural Advisory Engine</h2>
                <p className="text-xs text-slate-500">Crop planning recommendations and risk mitigation strategies</p>
              </div>
            </div>

            <form onSubmit={handleFetchRecommendations} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <label className="text-xs text-slate-500">Target Crop</label>
                <input
                  type="text"
                  value={recQuery.crop}
                  onChange={(e) => setRecQuery({ ...recQuery, crop: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Region</label>
                <input
                  type="text"
                  value={recQuery.region}
                  onChange={(e) => setRecQuery({ ...recQuery, region: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Soil pH</label>
                <input
                  type="number" step="0.1"
                  value={recQuery.soil_ph}
                  onChange={(e) => setRecQuery({ ...recQuery, soil_ph: parseFloat(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl transition text-xs shadow-sm">
                  Generate Advisory Report
                </button>
              </div>
            </form>

            {recResult && (
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 animate-fadeIn">
                <h3 className="text-sm font-bold text-amber-800">Agronomic Recommendations for {recResult.crop} in {recResult.region}</h3>
                <div className="space-y-2">
                  {recResult.recommendations?.map((rec, i) => (
                    <div key={i} className="flex items-start space-x-2 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl max-w-md w-full space-y-5 relative animate-fadeIn">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900">Welcome to YieldSense AI</h2>
              <p className="text-xs text-slate-500">Sign in to access your agricultural dashboard</p>
            </div>

            {/* Quick Demo Shortcuts */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quick Demo Login Shortcuts:</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('farmer@yieldsense.ai', 'farmer123')}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold py-1.5 rounded-lg border border-emerald-300 transition"
                >
                  Farmer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('agronomist@yieldsense.ai', 'agro123')}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-[11px] font-bold py-1.5 rounded-lg border border-blue-300 transition"
                >
                  Agronomist
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@yieldsense.ai', 'admin123')}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-800 text-[11px] font-bold py-1.5 rounded-lg border border-purple-300 transition"
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 text-xs font-bold py-2 rounded-lg transition ${authMode === 'login' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`flex-1 text-xs font-bold py-2 rounded-lg transition ${authMode === 'register' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'}`}
              >
                Register
              </button>
            </div>

            {authError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl text-center">
                {authError}
              </div>
            )}

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-3 text-sm">
                <div>
                  <label className="text-xs text-slate-500">Email Address</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 focus:outline-none focus:border-emerald-600 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 focus:outline-none focus:border-emerald-600 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition mt-2 text-xs shadow-sm"
                >
                  {authLoading ? 'Logging In...' : 'Log In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3 text-sm">
                <div>
                  <label className="text-xs text-slate-500">Full Name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Email Address</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Password</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-500">Role</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2 text-slate-800 mt-1 text-xs"
                    >
                      <option value="farmer">Farmer</option>
                      <option value="agronomist">Agronomist</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Region</label>
                    <select
                      value={regRegion}
                      onChange={(e) => setRegRegion(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2 text-slate-800 mt-1 text-xs"
                    >
                      {['North Region', 'South Region', 'East Region', 'West Region', 'Central Region'].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition mt-2 text-xs shadow-sm"
                >
                  {authLoading ? 'Registering...' : 'Create Account & Login'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ADD NEW FIELD MODAL */}
      {showAddFarmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl max-w-md w-full space-y-4 relative animate-fadeIn">
            <button
              onClick={() => setShowAddFarmModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm"
            >
              ✕
            </button>

            <div className="text-left border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-emerald-700 flex items-center">
                <Tractor className="w-5 h-5 mr-2 text-emerald-600" /> Register New Field Parcel
              </h3>
              <p className="text-xs text-slate-500">Add land size, soil type, and irrigation metadata</p>
            </div>

            <form onSubmit={handleCreateFarm} className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-slate-500">Field / Farm Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunrise Valley Wheat Field"
                  value={newFarm.farm_name}
                  onChange={(e) => setNewFarm({ ...newFarm, farm_name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 focus:outline-none focus:border-emerald-600 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Region</label>
                  <select
                    value={newFarm.region}
                    onChange={(e) => setNewFarm({ ...newFarm, region: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2 text-slate-800 mt-1 text-xs"
                  >
                    {['North Region', 'South Region', 'East Region', 'West Region', 'Central Region'].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Area (Hectares)</label>
                  <input
                    type="number" step="0.5" required
                    value={newFarm.area_hectares}
                    onChange={(e) => setNewFarm({ ...newFarm, area_hectares: parseFloat(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Soil Texture</label>
                  <select
                    value={newFarm.soil_type}
                    onChange={(e) => setNewFarm({ ...newFarm, soil_type: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2 text-slate-800 mt-1 text-xs"
                  >
                    {['Loamy', 'Clay', 'Sandy', 'Black', 'Alluvial', 'Red'].map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Irrigation System</label>
                  <select
                    value={newFarm.irrigation_type}
                    onChange={(e) => setNewFarm({ ...newFarm, irrigation_type: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2 text-slate-800 mt-1 text-xs"
                  >
                    {['Rainfed', 'Drip', 'Canal', 'Sprinkler'].map((it) => (
                      <option key={it} value={it}>{it}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500">Primary Crops (comma separated)</label>
                <input
                  type="text"
                  placeholder="Wheat, Rice, Maize"
                  value={newFarm.primary_crops.join(', ')}
                  onChange={(e) => setNewFarm({ ...newFarm, primary_crops: e.target.value.split(',').map(s => s.trim()) })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition text-xs shadow-sm mt-2"
              >
                Save Field to My Portfolio
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LOG DETAILS MODAL */}
      {showLogDetailModal && selectedLogDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl max-w-lg w-full space-y-4 relative animate-fadeIn max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowLogDetailModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm"
            >
              ✕
            </button>

            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-emerald-600" /> Forecast Log Details
                </h3>
                <p className="text-xs text-slate-500">{selectedLogDetail.crop} ({selectedLogDetail.region})</p>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                Score: {selectedLogDetail.productivity_score}/100
              </span>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-xl text-center space-y-1">
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">AI Forecast Result</p>
              <h2 className="text-3xl font-black text-slate-900">
                {selectedLogDetail.predicted_yield_kg_ha} <span className="text-base text-emerald-700 font-bold">kg/ha</span>
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Total Harvest Tonnage: <span className="text-emerald-800 font-bold">{selectedLogDetail.total_production_tonnes} Tonnes</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Season:</span>
                <span className="font-bold text-slate-800">{selectedLogDetail.season || 'Rabi'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Soil Texture:</span>
                <span className="font-bold text-slate-800">{selectedLogDetail.soil_type || 'Loamy'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Land Area:</span>
                <span className="font-bold text-slate-800">{selectedLogDetail.area_hectares || 10} Hectares</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Soil Fertility:</span>
                <span className="font-bold text-emerald-700">{selectedLogDetail.soil_health?.status || 'Optimal'}</span>
              </div>
            </div>

            {selectedLogDetail.risk_assessment && selectedLogDetail.risk_assessment.length > 0 && (
              <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 space-y-1.5 text-xs">
                <p className="font-bold text-amber-900 flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" /> Identified Risks
                </p>
                <ul className="list-disc pl-4 text-amber-800 space-y-0.5">
                  {selectedLogDetail.risk_assessment.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedLogDetail.recommendations && selectedLogDetail.recommendations.length > 0 && (
              <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 space-y-1.5 text-xs">
                <p className="font-bold text-emerald-900 flex items-center">
                  <Lightbulb className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Agronomic Recommendations
                </p>
                <ul className="list-disc pl-4 text-emerald-800 space-y-0.5">
                  {selectedLogDetail.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => { setShowLogDetailModal(false); handleRerunLog(selectedLogDetail); }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition shadow-sm flex items-center justify-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-Run This Forecast</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT & LIVE HELP MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl max-w-md w-full space-y-4 relative animate-fadeIn">
            <button
              onClick={() => setShowSupportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm"
            >
              ✕
            </button>

            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center">
                <Headphones className="w-5 h-5 mr-2 text-emerald-600" /> Agronomic Support & Help Desk
              </h3>
              <p className="text-xs text-slate-500">Connect with agricultural consultants, researchers & administrators</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-1">
                <p className="font-bold text-emerald-800 flex items-center">
                  <MessageSquare className="w-3.5 h-3.5 mr-1" /> Live Advisory Support
                </p>
                <p className="text-emerald-700">Toll-free Kisan Helplines: <span className="font-mono font-bold">1800-180-1551</span></p>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-slate-500 block mb-1">Select User Role</label>
                  <select className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 text-xs">
                    <option>Farmer Query</option>
                    <option>Agri Consultant Assistance</option>
                    <option>Researcher Data Request</option>
                    <option>Administrator Technical Support</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Inquiry / Support Description</label>
                  <textarea
                    rows="3"
                    placeholder="Describe your soil, crop, or system query..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-emerald-600"
                  ></textarea>
                </div>
              </div>

              <button
                onClick={() => { alert('Support request submitted! An agronomist will contact you within 2 hours.'); setShowSupportModal(false); }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition shadow-sm"
              >
                Submit Support Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
