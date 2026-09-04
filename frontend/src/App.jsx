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
  Pencil,
  CheckCircle2,
  AlertTriangle,
  Activity,
  BarChart3,
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
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Users,
  Lock,
  Sparkles
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
  loginWithGoogle,
  getCurrentUserProfile,
  logoutUser,
  predictYield,
  getCropRecommendations,
  getPredictionHistory,
  analyzeWeather,
  assessSoil,
  getRecommendations,
  listFarms,
  createFarm,
  deleteFarm,
  updateFarm,
  getPendingUsers,
  getAdminStats,
  approveUser,
  rejectUser,
  getFarmerActivity,
  deleteFarmer
} from './api';
import LoginPage from './components/LoginPage';
import ReportsView from './components/ReportsView';
import RecommendationWorkflowStudio from './components/RecommendationWorkflowStudio';
import RiskAssessmentView from './components/RiskAssessmentView';
import AdvisorDashboard from './components/AdvisorDashboard';
import {
  SoilNutrientRadarChart,
  ClimateImpactVisualizer,
  CropYieldComparisonChart,
  SoilPHNutrientSpectrum,
  FarmParcelsDistributionChart,
  FertilizerSplitTimeline,
  SeasonalProductivityHeatmap
} from './components/visualizations';

export default function App() {
  const [activeTab, setActiveTab] = useState('login');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [allDbUsers, setAllDbUsers] = useState([]);
  const [adminUserRoleFilter, setAdminUserRoleFilter] = useState('all');
  const [approvingId, setApprovingId] = useState(null);
  const [googlePendingMsg, setGooglePendingMsg] = useState('');
  const [pendingGoogleAdmin, setPendingGoogleAdmin] = useState(null);
  // Farmer Activity Modal (admin view)
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [farmerProfileLoading, setFarmerProfileLoading] = useState(false);
  const [deletingFarmerId, setDeletingFarmerId] = useState(null);
  const [deleteConfirmFarmer, setDeleteConfirmFarmer] = useState(null);
  
  // Auth Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('farmer');
  const [regRegion, setRegRegion] = useState('North Region');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Prediction State
  const [predForm, setPredForm] = useState({
    user_id: '',
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
  const [cropRankResult, setCropRankResult] = useState(null);
  const [cropRankLoading, setCropRankLoading] = useState(false);
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

  const [predictionHistory, setPredictionHistory] = useState([]);
  const [searchLogQuery, setSearchLogQuery] = useState('');
  const [filterLogStatus, setFilterLogStatus] = useState('all');
  const [selectedLogDetail, setSelectedLogDetail] = useState(null);
  const [showLogDetailModal, setShowLogDetailModal] = useState(false);
  const [selectedMongoCollection, setSelectedMongoCollection] = useState('yield_predictions');

  // Notifications & Support Architecture State
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
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
      user_id: user?.id || '',
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
  const [showEditFarmModal, setShowEditFarmModal] = useState(false);
  const [editFarm, setEditFarm] = useState(null);
  const [newFarm, setNewFarm] = useState({
    farm_name: '',
    region: 'North Region',
    area_hectares: 10.0,
    soil_type: 'Loamy',
    irrigation_type: 'Drip',
    crop_allocations: [
      { crop: 'Wheat', area_hectares: 6.0 },
      { crop: 'Rice', area_hectares: 4.0 }
    ],
    primary_crops: ['Wheat', 'Rice']
  });


  // Advisory State
  const [recQuery, setRecQuery] = useState({
    crop: 'Wheat',
    region: 'North Region',
    season: 'Rabi',
    soil_ph: 6.8,
    nitrogen_n: 140.0,
    phosphorus_p: 45.0,
    potassium_k: 80.0,
    organic_matter_percent: 2.5,
    rainfall_mm: 850.0,
    temperature_celsius: 22.0,
    irrigation_type: 'Canal'
  });
  const [recResult, setRecResult] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchHistory();
    fetchFarmList();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchHistory();
      if (user.role === 'admin') {
        fetchPendingUsers();
      }
    }
  }, [user?.id, activeTab]);

  const getRoleRedirectTab = (role) => {
    if (role === 'admin') return 'adminpanel';
    if (role === 'advisor' || role === 'agronomist') return 'advisorhub';
    return 'dashboard';
  };

  const fetchProfile = async () => {
    try {
      const data = await getCurrentUserProfile();
      if (data && data.email) {
        setUser(data);
        setActiveTab(getRoleRedirectTab(data.role));
        if (data.role === 'admin') {
          fetchPendingUsers();
        }
      } else {
        setUser(null);
        setActiveTab('login');
      }
    } catch {
      setUser(null);
      setActiveTab('login');
    }
  };

  const fetchHistory = async () => {
    try {
      const activeUserId = user?.id || 'guest';
      const data = await getPredictionHistory(activeUserId);
      if (data && Array.isArray(data)) {
        setPredictionHistory(data);
      }
    } catch (err) {
      console.error('History fetch:', err);
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

  const fetchPendingUsers = async () => {
    try {
      const data = await getPendingUsers();
      setPendingUsers(data.pending_users || []);
    } catch (err) {
      console.error('Pending users fetch:', err);
    }
    try {
      const stats = await getAdminStats();
      setAdminStats(stats);
      if (stats.all_users) {
        setAllDbUsers(stats.all_users);
      }
    } catch (err) {
      console.error('Admin stats fetch:', err);
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
      setActiveTab(getRoleRedirectTab(data.user.role)); // Role-based redirect
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
        role: regRole, // 'farmer' or 'admin'
        region: regRegion
      });
      setUser(data.user);
      setShowAuthModal(false);
      setActiveTab(getRoleRedirectTab(data.user.role)); // Role-based redirect
      fetchHistory();
      fetchFarmList();
    } catch (err) {
      setAuthError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async (roleOverride = 'farmer') => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const targetEmail = regEmail || loginEmail || `farmer.user.${Math.floor(Math.random() * 899 + 100)}@gmail.com`;
      const targetName = regName || 'Google User';
      const data = await loginWithGoogle({
        email: targetEmail,
        name: targetName,
        role: roleOverride || regRole || 'farmer',
        google_id: `g_${Date.now()}`
      });
      setUser(data.user);
      setShowAuthModal(false);
      setActiveTab(getRoleRedirectTab(data.user.role)); // Role-based redirect
      fetchHistory();
      fetchFarmList();
    } catch (err) {
      setAuthError(err.response?.data?.detail || 'Google Sign-In failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setActiveTab('login');
  };

  const handleQuickLogin = async (email, password) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const data = await loginUser({ email, password });
      setUser(data.user);
      setShowAuthModal(false);
      setActiveTab(getRoleRedirectTab(data.user.role)); // Role-based redirect
      fetchHistory();
      fetchFarmList();
    } catch (err) {
      setAuthError(err.response?.data?.detail || 'Quick login failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setPredLoading(true);
    setCropRankResult(null);
    try {
      const activeUserId = user?.id || 'guest';
      const payload = { ...predForm, user_id: activeUserId };
      const data = await predictYield(payload);
      setPredictionResult(data);
      setPredictionHistory(prev => [data, ...prev]);
      // Also run crop recommendation in background
      setCropRankLoading(true);
      try {
        const rankData = await getCropRecommendations(payload);
        setCropRankResult(rankData);
      } catch (_) {}
      setCropRankLoading(false);
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
    const validAllocations = (newFarm.crop_allocations || [])
      .filter(a => a.crop && a.crop.trim().length > 0)
      .map(a => ({
        crop: a.crop.trim(),
        area_hectares: parseFloat(a.area_hectares) || 0
      }));

    const calculatedArea = validAllocations.length > 0
      ? Math.round(validAllocations.reduce((sum, a) => sum + a.area_hectares, 0) * 10) / 10
      : (parseFloat(newFarm.area_hectares) || 10.0);

    const cropsList = validAllocations.length > 0
      ? validAllocations.map(a => a.crop)
      : (newFarm.primary_crops || ['Wheat']);

    const payload = {
      farm_name: newFarm.farm_name || 'My New Field Parcel',
      region: newFarm.region || 'North Region',
      area_hectares: calculatedArea,
      soil_type: newFarm.soil_type || 'Loamy',
      irrigation_type: newFarm.irrigation_type || 'Drip',
      primary_crops: cropsList,
      crop_allocations: validAllocations,
      user_id: user?.id || ''
    };

    const tempFarm = {
      id: `farm_${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString()
    };

    try {
      await createFarm(payload);
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

  const handleUpdateFarm = async (e) => {
    e.preventDefault();
    if (!editFarm || !editFarm.id) return;
    try {
      const validAllocations = (editFarm.crop_allocations || [])
        .filter(a => a.crop && a.crop.trim().length > 0)
        .map(a => ({
          crop: a.crop.trim(),
          area_hectares: parseFloat(a.area_hectares) || 0
        }));

      const calculatedArea = validAllocations.length > 0
        ? Math.round(validAllocations.reduce((sum, a) => sum + a.area_hectares, 0) * 10) / 10
        : (parseFloat(editFarm.area_hectares) || 1.0);

      const cropsList = validAllocations.length > 0
        ? validAllocations.map(a => a.crop)
        : (editFarm.primary_crops || ['Wheat']);

      await updateFarm(editFarm.id, {
        farm_name: editFarm.farm_name,
        region: editFarm.region,
        area_hectares: calculatedArea,
        soil_type: editFarm.soil_type,
        irrigation_type: editFarm.irrigation_type,
        primary_crops: cropsList,
        crop_allocations: validAllocations
      });
      setShowEditFarmModal(false);
      fetchFarmList();
    } catch (err) {
      alert('Failed to update field: ' + (err.response?.data?.detail || err.message));
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

  // Handle Google OAuth redirect callback from backend
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleToken = params.get('google_token');
    const googleEmail = params.get('google_email');
    const googleName = params.get('google_name');
    const googleRole = params.get('google_role');
    const googleError = params.get('google_error');
    const googlePending = params.get('google_pending');

    // If this page is loaded inside the OAuth popup window,
    // send the token to the PARENT (main) window and close the popup
    if (window.opener && (googleToken || googleError || googlePending)) {
      // Use '*' as targetOrigin: backend redirects to localhost:5173 but main window
      // may be on 127.0.0.1:5173 — these are different origins, so '*' avoids the mismatch.
      if (googleToken && googleEmail) {
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_SUCCESS',
          token: googleToken,
          email: googleEmail,
          name: googleName,
          role: googleRole
        }, '*');
      } else if (googlePending) {
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_PENDING',
          name: params.get('google_name'),
          email: params.get('google_email')
        }, '*');
      } else if (googleError) {
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: googleError === 'account_rejected'
            ? '❌ Your Google account registration has been rejected by the administrator.'
            : googleError
        }, '*');
      }
      window.close();
      return;
    }

    // Handle message from popup (main window listener)
    const handleGoogleMessage = (event) => {
      // Accept messages from localhost:5173 OR 127.0.0.1:5173
      // (backend redirects to localhost, Vite may run on 127.0.0.1 — different origins!)
      const allowedOrigins = [
        window.location.origin,
        'http://localhost:5173',
        'http://127.0.0.1:5173'
      ];
      if (!allowedOrigins.includes(event.origin)) return;
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        const { token, email, name, role } = event.data;
        // Admin Google auth: intercept here in App.jsx (always-mounted listener)
        // and pass payload down to LoginPage via state prop for key-gate modal.
        if (role === 'admin') {
          setPendingGoogleAdmin({ token, email, name: name || email.split('@')[0], role: 'admin' });
          return;
        }
        localStorage.setItem('access_token', token);
        document.cookie = `access_token=${token}; path=/; max-age=86400`;
        document.cookie = `user_email=${email}; path=/; max-age=86400`;
        document.cookie = `user_role=${role || 'farmer'}; path=/; max-age=86400`;
        const googleUser = {
          id: `usr_google_${Date.now()}`,
          name: name || email.split('@')[0],
          email,
          role: role || 'farmer',
          region: 'North Region',
          auth_provider: 'google'
        };
        setUser(googleUser);
        setActiveTab('dashboard');
        fetchHistory();
        fetchFarmList();
      } else if (event.data?.type === 'GOOGLE_AUTH_PENDING') {
        // Show pending message on the login page — do NOT log in
        setGooglePendingMsg(`⏳ Hi ${event.data.name || event.data.email}! Your Google account registration is pending admin approval. You will be notified once approved.`);
      } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
        const err = event.data.error || '';
        if (err.startsWith('role_locked:')) {
          // Format: role_locked:admin:message  or  role_locked:farmer:message
          const parts = err.split(':');
          const lockedAs = parts[1]; // 'admin' or 'farmer'
          const msg = parts.slice(2).join(':');
          setGooglePendingMsg(`🔒 ${msg} Please switch to the ${lockedAs === 'admin' ? 'Admin' : 'Farmer'} tab to sign in.`);
        } else if (err === 'account_rejected') {
          setGooglePendingMsg('❌ Your Google account registration has been rejected by the administrator.');
        } else {
          setGooglePendingMsg(`❌ Google Sign-In failed: ${err}`);
        }
      }
    };

    window.addEventListener('message', handleGoogleMessage);
    return () => window.removeEventListener('message', handleGoogleMessage);
  }, []);

  if (activeTab === 'login' || !user) {
    return (
      <LoginPage
        googlePendingMsg={googlePendingMsg}
        pendingGoogleAdmin={pendingGoogleAdmin}
        onClearPendingGoogleAdmin={() => setPendingGoogleAdmin(null)}
        onLoginSuccess={(loggedInUser) => {
          setPendingGoogleAdmin(null);
          setUser(loggedInUser);
          setActiveTab(getRoleRedirectTab(loggedInUser.role));
          fetchHistory();
          fetchFarmList();
          if (loggedInUser.role === 'admin') fetchPendingUsers();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* ─── iOS 26-STYLE LIQUID GLASS FLOATING NAVBAR ─────────────────────── */}
      <header className="sticky top-0 z-40 px-4 lg:px-6 pt-3 pb-3">
        {/* Subtle page-level ambient glow behind the bar */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

        {/* Floating pill container — the "liquid glass" bar */}
        <div
          className="relative max-w-[1480px] mx-auto flex items-center justify-between gap-2 px-5 py-3.5"
          style={{
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(28px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.75)',
            boxShadow: '0 2px 32px -4px rgba(16,185,129,0.08), 0 1px 0 0 rgba(255,255,255,0.9) inset, 0 -1px 0 0 rgba(0,0,0,0.04) inset',
          }}
        >
          {/* Specular highlight stripe — top edge glint */}
          <div
            className="absolute inset-x-6 top-0 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.9) 70%, transparent)' }}
          />

          {/* ── LOGO ─────────────────────────────────────── */}
          <div
            className="flex items-center space-x-2 cursor-pointer group shrink-0"
            onClick={() => setActiveTab('dashboard')}
          >
            <div
              className="w-8 h-8 flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #059669, #0d9488)',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(5,150,105,0.35), 0 1px 0 rgba(255,255,255,0.4) inset',
              }}
            >
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-slate-900 leading-none">
                YieldSense{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">AI</span>
              </h1>
              <p className="text-[8px] text-slate-400 font-semibold uppercase tracking-widest leading-none mt-0.5">
                Agricultural Platform
              </p>
            </div>
          </div>

          {/* ── NAV + USER CONTROL (grouped right side) ─── */}
          <div className="flex items-center gap-1.5">
            <nav className="hidden md:flex items-center gap-0.5 overflow-x-auto scrollbar-none">
              {(() => {
                const currentRole = user?.role || 'farmer';
                const isAdmin = currentRole === 'admin';
                const navTabs = [
                  { id: 'advisorhub', label: 'Consultation Desk', roles: ['advisor', 'agronomist'] },
                  { id: 'dashboard',  label: 'Dashboard',         roles: ['farmer', 'admin'] },
                  { id: 'forecast',   label: 'Yield Forecast',    roles: ['farmer', 'admin'] },
                  { id: 'analysis',   label: 'Soil & Weather',    roles: ['farmer', 'admin'] },
                  { id: 'risk',       label: 'Risk Assessment',   roles: ['farmer', 'admin'] },
                  { id: 'reports',    label: 'Reports',           roles: ['farmer', 'admin'] },
                  { id: 'farms',      label: 'My Fields',         roles: ['farmer'] },
                  { id: 'advisory',   label: 'Advisory',          roles: ['farmer', 'admin'] },
                  { id: 'adminpanel', label: 'Admin Panel',       roles: ['admin'] },
                ].filter(t => t.roles.includes(currentRole));

                return navTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const isAdminTab = tab.id === 'adminpanel';
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="relative px-3 py-1.5 rounded-[10px] text-xs font-semibold whitespace-nowrap shrink-0 select-none cursor-pointer transition-all duration-150"
                      style={
                        isActive
                          ? {
                              background: isAdminTab
                                ? 'linear-gradient(145deg,rgba(124,58,237,0.18),rgba(139,92,246,0.10))'
                                : 'linear-gradient(145deg,rgba(5,150,105,0.18),rgba(13,148,136,0.10))',
                              color: isAdminTab ? '#6d28d9' : '#065f46',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.8) inset',
                              border: `1px solid ${isAdminTab ? 'rgba(124,58,237,0.18)' : 'rgba(5,150,105,0.18)'}`,
                              fontWeight: 700,
                            }
                          : {
                              color: '#475569',
                              background: 'transparent',
                              border: '1px solid transparent',
                            }
                      }
                      onMouseEnter={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.5)';
                          e.currentTarget.style.color = '#0f172a';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#475569';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                });
              })()}
            </nav>

            {/* ── USER CONTROL ─────────────────────────────── */}
            <div className="flex items-center gap-0 shrink-0">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  title={user.name || 'Profile'}
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center cursor-pointer transition-transform duration-150 hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.7), rgba(241,245,249,0.5))',
                    border: '1px solid rgba(255,255,255,0.8)',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9) inset',
                  }}
                >
                  <User className="w-3.5 h-3.5 text-slate-700" />
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div
                      className="absolute right-0 mt-2.5 z-50 w-52 p-3 space-y-2 animate-fadeIn"
                      style={{
                        background: 'rgba(255,255,255,0.75)',
                        backdropFilter: 'blur(32px) saturate(1.8)',
                        WebkitBackdropFilter: 'blur(32px) saturate(1.8)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.85)',
                        boxShadow: '0 8px 32px -4px rgba(0,0,0,0.14), 0 1px 0 rgba(255,255,255,0.9) inset',
                      }}
                    >
                      {/* Specular glint */}
                      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

                      <div className="px-1 pb-2 border-b border-slate-100/80">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                          <span
                            className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide ${
                              user?.role === 'admin'
                                ? 'bg-violet-100/80 text-violet-700'
                                : user?.role === 'advisor' || user?.role === 'agronomist'
                                ? 'bg-sky-100/80 text-sky-700'
                                : 'bg-emerald-100/80 text-emerald-700'
                            }`}
                          >
                            {user.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{user.email}</p>
                      </div>

                      <button
                        onClick={() => { setShowUserMenu(false); handleLogout(); }}
                        className="w-full flex items-center gap-2 px-2 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50/70 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
                className="flex items-center gap-1.5 text-xs font-bold text-white px-3.5 py-1.5 rounded-[10px] transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                style={{
                  background: 'linear-gradient(145deg, #059669, #0d9488)',
                  boxShadow: '0 2px 8px rgba(5,150,105,0.3), 0 1px 0 rgba(255,255,255,0.25) inset',
                }}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            )}
          </div>
            </div>

          {/* Bottom edge shadow line */}
          <div
            className="absolute inset-x-4 bottom-0 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.06) 30%, rgba(0,0,0,0.06) 70%, transparent)' }}
          />
        </div>
      </header>



      {/* MAIN WORKSPACE */}
      <main className="flex-1 px-6 py-8 lg:px-8 lg:py-10 max-w-7xl w-full mx-auto space-y-8 lg:space-y-10">
        
        {/* VIEW 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Stat Cards — Dynamic by Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {user?.role === 'admin' ? (
                <>
                  {/* ADMIN CARD 1: Total Users */}
                  <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</p>
                    <h3 className="text-3xl font-black text-violet-700 mt-3 mb-1">{adminStats?.total_users ?? 2}</h3>
                    <p className="text-xs text-slate-500">
                      {adminStats?.farmer_count ?? 1} Farmers / {adminStats?.admin_count ?? 1} Admins
                    </p>
                  </div>

                  {/* ADMIN CARD 2: Platform Predictions */}
                  <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Predictions</p>
                    <h3 className="text-3xl font-black text-indigo-600 mt-3 mb-1">{adminStats?.total_predictions ?? predictionHistory.length}</h3>
                    <p className="text-xs text-slate-500">System-Wide AI Runs in DB</p>
                  </div>

                  {/* ADMIN CARD 3: Registered Fields */}
                  <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Fields</p>
                    <h3 className="text-3xl font-black text-blue-600 mt-3 mb-1">{farms.length || 1}</h3>
                    <p className="text-xs text-slate-500">Platform Land Parcels</p>
                  </div>

                  {/* ADMIN CARD 4: Model Accuracy */}
                  <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model Accuracy</p>
                    <h3 className="text-3xl font-black text-emerald-700 mt-3 mb-1">92.61%</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Weighted Ensemble Engine
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* FARMER CARD 1: Model Accuracy */}
                  <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model Accuracy</p>
                    <h3 className="text-3xl font-black text-emerald-700 mt-3 mb-1">92.61%</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Weighted Ensemble Engine
                    </p>
                  </div>

                  {/* FARMER CARD 2: Active Fields */}
                  <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Fields</p>
                    <h3 className="text-3xl font-black text-blue-600 mt-3 mb-1">{farms.length || 1}</h3>
                    <p className="text-xs text-slate-500">Registered Land Parcels</p>
                  </div>

                  {/* FARMER CARD 3: Logged Forecasts */}
                  <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logged Forecasts</p>
                    <h3 className="text-3xl font-black text-amber-600 mt-3 mb-1">{predictionHistory.length}</h3>
                    <p className="text-xs text-slate-500">Saved Prediction Runs</p>
                  </div>

                  {/* FARMER CARD 4: Soil Fertility */}
                  <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Soil Fertility</p>
                    <h3 className="text-3xl font-black text-teal-600 mt-3 mb-1">Optimal</h3>
                    <p className="text-xs text-slate-500">Neutral pH 6.8 | High Organic Matter</p>
                  </div>
                </>
              )}
            </div>

            {/* Quick Tools & Features */}
            <div className="bg-gradient-to-r from-slate-50 via-teal-50/40 to-slate-50 border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Quick Tools & Insights</h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">Easy access to crop predictions, farming tips, risk checks, and visual charts.</p>
                </div>
                <span className="text-[11px] font-bold px-3 py-1 bg-white text-slate-700 rounded-full border border-slate-200 shadow-2xs w-fit">
                  All-in-One Tools
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Hub Tile 1: Harvest Reports */}
                <div 
                  onClick={() => setActiveTab('reports')}
                  className="bg-emerald-50/80 hover:bg-emerald-50 border border-emerald-200/80 hover:border-emerald-300 p-4 rounded-2xl transition cursor-pointer flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-xs group"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                      Reports
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition">Harvest Reports</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">See expected harvest, crop rankings, and simple field summaries.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 group-hover:text-emerald-900 flex items-center gap-1">
                    View Reports →
                  </span>
                </div>

                {/* Hub Tile 2: Crop & Soil Advice */}
                <div 
                  onClick={() => setActiveTab('advisory')}
                  className="bg-amber-50/80 hover:bg-amber-50 border border-amber-200/80 hover:border-amber-300 p-4 rounded-2xl transition cursor-pointer flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-xs group"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md">
                      Advice & Tips
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition">Crop & Soil Advice</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">Best crops for your soil, fertilizer schedules, and pest control tips.</p>
                  </div>
                  <span className="text-xs font-bold text-amber-700 group-hover:text-amber-900 flex items-center gap-1">
                    Get Advice →
                  </span>
                </div>

                {/* Hub Tile 3: Weather & Risk Check */}
                <div 
                  onClick={() => setActiveTab('risk')}
                  className="bg-rose-50/80 hover:bg-rose-50 border border-rose-200/80 hover:border-rose-300 p-4 rounded-2xl transition cursor-pointer flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-xs group"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100/90 px-2 py-0.5 rounded-md">
                      Risk Check
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-800 transition">Weather & Risk Check</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">Check risks from droughts, heavy rain, or heat, and how to protect crops.</p>
                  </div>
                  <span className="text-xs font-bold text-rose-700 group-hover:text-rose-900 flex items-center gap-1">
                    Check Risks →
                  </span>
                </div>

                {/* Hub Tile 4: Charts & Trends */}
                <div 
                  onClick={() => setActiveTab('reports')}
                  className="bg-sky-50/80 hover:bg-sky-50 border border-sky-200/80 hover:border-sky-300 p-4 rounded-2xl transition cursor-pointer flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-xs group"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100/90 px-2 py-0.5 rounded-md">
                      Charts & Trends
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-800 transition">Charts & Trends</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">Simple graphs showing harvest trends, seasonal changes, and comparisons.</p>
                  </div>
                  <span className="text-xs font-bold text-sky-700 group-hover:text-sky-900 flex items-center gap-1">
                    View Charts →
                  </span>
                </div>
              </div>
            </div>

            {/* Charts Workspace — Rich Visualizations Suite */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* CROP YIELD COMPARISON & BENCHMARKS */}
              <CropYieldComparisonChart
                cropsData={cropYieldChartData}
                areaHectares={predForm.area_hectares || 10}
              />

              {/* SOIL NUTRIENT BALANCE RADAR */}
              <SoilNutrientRadarChart
                nitrogen={predForm.nitrogen_n || 140}
                phosphorus={predForm.phosphorus_p || 45}
                potassium={predForm.potassium_k || 80}
                soilPh={predForm.soil_ph || 6.8}
                organicMatter={predForm.organic_matter_percent || 2.5}
                targetCrop={predForm.crop || 'Wheat'}
              />
            </div>

            {/* Interactive Prediction Log Table */}
            <div className="bg-white border border-slate-200/80 p-7 md:p-8 rounded-3xl shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-amber-600" /> Recent Prediction Logs
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Filter, search, inspect full AI inference details, or re-run historical yield models</p>
                </div>
                
                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition border border-slate-200"
                    title="Export historical logs as CSV spreadsheet"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('forecast')}
                    className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Run New Forecast</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center space-x-2.5 flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search logs by crop or region..."
                    value={searchLogQuery}
                    onChange={(e) => setSearchLogQuery(e.target.value)}
                    className="w-full bg-white border border-slate-300/80 rounded-xl px-3.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-500 font-medium">Soil Status:</span>
                  <select
                    value={filterLogStatus}
                    onChange={(e) => setFilterLogStatus(e.target.value)}
                    className="bg-white border border-slate-300/80 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
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
                  <thead className="bg-slate-100/80 text-slate-600 text-[11px] uppercase tracking-wider border-b border-slate-200/80">
                    <tr>
                      <th className="px-5 py-3.5">Crop</th>
                      <th className="px-5 py-3.5">Region</th>
                      <th className="px-5 py-3.5">Yield Forecast</th>
                      <th className="px-5 py-3.5">Total Harvest</th>
                      <th className="px-5 py-3.5">Productivity Score</th>
                      <th className="px-5 py-3.5">Soil Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition">
                          <td className="px-5 py-4 font-bold text-emerald-700">{item.crop}</td>
                          <td className="px-5 py-4 text-xs text-slate-600">{item.region}</td>
                          <td className="px-5 py-4 font-mono text-xs font-bold text-slate-800">
                            {(item.predicted_yield_kg_ha / 1000).toFixed(2)} t/ha <span className="text-[10px] text-slate-400 font-normal">({item.predicted_yield_kg_ha} kg/ha)</span>
                          </td>
                          <td className="px-5 py-4 font-mono text-xs text-teal-700 font-bold">{item.total_production_tonnes} Tonnes</td>
                          <td className="px-5 py-4">
                            <span className="px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 font-bold text-xs">
                              {item.productivity_score} / 100
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-500">{item.soil_health?.status || 'Optimal'}</td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => { setSelectedLogDetail(item); setShowLogDetailModal(true); }}
                                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition"
                                title="View Full AI Forecast Report"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleRerunLog(item)}
                                className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition"
                                title="Re-Run Model with exact parameters"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteLog(idx)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
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
                        <td colSpan="7" className="px-5 py-8 text-center text-slate-500 text-xs">
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
          <div className="space-y-6 animate-fadeIn">
            {/* Upper Side: Input Data Workspace */}
            <div className="bg-white border border-slate-200/90 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg md:text-xl font-bold text-slate-900">Crop Yield Prediction Parameters</h2>
                <p className="text-xs text-slate-500 mt-0.5">Enter your field parameters to calculate expected crop yield and compare alternative crops</p>
              </div>

              <form onSubmit={handlePredict} className="space-y-6">
                {/* 1. Crop & Region Parameters */}
                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    1. Crop & Location
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Target Crop</label>
                      <select
                        value={predForm.crop}
                        onChange={(e) => setPredForm({ ...predForm, crop: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold focus:outline-none focus:border-emerald-600"
                      >
                        {['Wheat', 'Rice', 'Maize', 'Soybean', 'Cotton', 'Barley', 'Sugarcane', 'Potato'].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Region</label>
                      <select
                        value={predForm.region}
                        onChange={(e) => setPredForm({ ...predForm, region: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold focus:outline-none focus:border-emerald-600"
                      >
                        {['North Region', 'South Region', 'East Region', 'West Region', 'Central Region'].map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Season</label>
                      <select
                        value={predForm.season}
                        onChange={(e) => setPredForm({ ...predForm, season: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold focus:outline-none focus:border-emerald-600"
                      >
                        {['Kharif', 'Rabi', 'Zaid', 'Spring', 'Autumn'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Field & Climate Inputs */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <p className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                    2. Field & Irrigation
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Soil Texture</label>
                      <select
                        value={predForm.soil_type}
                        onChange={(e) => setPredForm({ ...predForm, soil_type: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold focus:outline-none focus:border-teal-600"
                      >
                        {['Loamy', 'Clay', 'Sandy', 'Black', 'Alluvial', 'Red'].map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Irrigation Method</label>
                      <select
                        value={predForm.irrigation_type}
                        onChange={(e) => setPredForm({ ...predForm, irrigation_type: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold focus:outline-none focus:border-teal-600"
                      >
                        {['Rainfed', 'Drip', 'Canal', 'Sprinkler'].map((it) => (
                          <option key={it} value={it}>{it}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Field Area (Hectares)</label>
                      <input
                        type="number" step="0.5"
                        value={predForm.area_hectares}
                        onChange={(e) => setPredForm({ ...predForm, area_hectares: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold focus:outline-none focus:border-teal-600"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Rainfall (mm)</label>
                      <input
                        type="number"
                        value={predForm.rainfall_mm}
                        onChange={(e) => setPredForm({ ...predForm, rainfall_mm: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold focus:outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Soil Nutrients & Weather */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    3. Soil Nutrients & Weather Details
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Soil pH</label>
                      <input
                        type="number" step="0.1"
                        value={predForm.soil_ph}
                        onChange={(e) => setPredForm({ ...predForm, soil_ph: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-amber-600"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Nitrogen (N)</label>
                      <input
                        type="number"
                        value={predForm.nitrogen_n}
                        onChange={(e) => setPredForm({ ...predForm, nitrogen_n: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-amber-600"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Phosphorus (P)</label>
                      <input
                        type="number"
                        value={predForm.phosphorus_p}
                        onChange={(e) => setPredForm({ ...predForm, phosphorus_p: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-amber-600"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Potassium (K)</label>
                      <input
                        type="number"
                        value={predForm.potassium_k}
                        onChange={(e) => setPredForm({ ...predForm, potassium_k: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-amber-600"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Humidity (%)</label>
                      <input
                        type="number" step="1" min="0" max="100"
                        value={predForm.humidity_percent}
                        onChange={(e) => setPredForm({ ...predForm, humidity_percent: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-amber-600"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Organic Matter (%)</label>
                      <input
                        type="number" step="0.1" min="0" max="10"
                        value={predForm.organic_matter_percent}
                        onChange={(e) => setPredForm({ ...predForm, organic_matter_percent: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-amber-600"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Temperature (°C)</label>
                      <input
                        type="number" step="0.5"
                        value={predForm.temperature_celsius}
                        onChange={(e) => setPredForm({ ...predForm, temperature_celsius: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={predLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-2xl transition shadow-sm hover:shadow flex items-center justify-center space-x-2 text-sm cursor-pointer disabled:opacity-70"
                  >
                    {predLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Calculating Forecast...</span>
                      </>
                    ) : (
                      <span>Calculate Crop Yield Forecast</span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Lower Down Side: Generated Forecast & Recommendations Report */}
            <div className="bg-white border border-slate-200/90 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Forecast & Crop Recommendation Report</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Detailed yield prediction and alternative crop ranking for your field</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
                  92.6% Accuracy
                </span>
              </div>

              {predictionResult ? (
                <div className="space-y-6 animate-fadeIn">
                  {/* Primary Yield Banner & Key Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    {/* Primary Yield Card */}
                    <div className="md:col-span-6 bg-gradient-to-br from-emerald-50 via-teal-50/70 to-emerald-100/50 border border-emerald-200/90 p-6 rounded-2xl text-center shadow-xs flex flex-col justify-center">
                      <p className="text-xs uppercase tracking-wider font-bold text-emerald-800">
                        Predicted Yield for {predForm.crop}
                      </p>
                      <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-2">
                        {(predictionResult.predicted_yield_kg_ha / 1000).toFixed(2)}{' '}
                        <span className="text-base font-bold text-emerald-700">Tonnes / ha</span>
                      </h2>
                      <div className="flex flex-wrap items-center justify-center gap-3 mt-3 pt-3 border-t border-emerald-200/60 text-xs text-slate-700 font-medium">
                        <span>Per Hectare: <strong className="text-emerald-800 font-bold">{predictionResult.predicted_yield_kg_ha} kg/ha</strong></span>
                        <span>•</span>
                        <span>Total Production: <strong className="text-emerald-800 font-bold">{predictionResult.total_production_tonnes} Tonnes</strong></span>
                      </div>
                    </div>

                    {/* Metric Badges */}
                    <div className="md:col-span-6 grid grid-cols-3 gap-3">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col justify-center items-center text-center">
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Productivity</p>
                        <p className="text-2xl font-black text-amber-600 mt-1">
                          {predictionResult.productivity_score}<span className="text-xs text-slate-400 font-normal">/100</span>
                        </p>
                        <span className="text-[10px] text-slate-500 mt-0.5">Field Score</span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col justify-center items-center text-center">
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Soil Status</p>
                        <p className="text-base font-black text-teal-700 mt-1">
                          {predictionResult.soil_health?.status || 'Good'}
                        </p>
                        <span className="text-[10px] text-slate-500 mt-0.5">Fertility</span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col justify-center items-center text-center">
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Weather Impact</p>
                        <p className="text-base font-black text-sky-700 mt-1">
                          {predictionResult.weather_impact?.status || 'Optimal'}
                        </p>
                        <span className="text-[10px] text-slate-500 mt-0.5">Climate Fit</span>
                      </div>
                    </div>
                  </div>

                  {/* Crop Suitability Ranking */}
                  <div className="border-t border-slate-100 pt-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Best Alternative Crops for Your Field (AI Ranked)
                      </p>
                      {cropRankResult?.based_on_region && (
                        <span className="text-[11px] text-slate-500">
                          Based on {cropRankResult.based_on_region} • {cropRankResult.based_on_season}
                        </span>
                      )}
                    </div>

                    {cropRankLoading ? (
                      <div className="flex items-center space-x-2 text-xs text-slate-400 py-6 justify-center">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Ranking all crops for your field conditions…</span>
                      </div>
                    ) : cropRankResult ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {cropRankResult.recommendations?.map((item, i) => {
                          const colors = [
                            'bg-emerald-500', 'bg-teal-500', 'bg-sky-500', 'bg-blue-500',
                            'bg-indigo-400', 'bg-violet-400', 'bg-amber-400', 'bg-rose-400'
                          ];
                          const barColor = colors[i] || 'bg-slate-400';
                          const isTop = i === 0;
                          return (
                            <div key={item.crop} className={`p-3.5 rounded-2xl border transition ${isTop ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200/80 bg-slate-50/40'}`}>
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center space-x-2">
                                  <span className={`text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center text-white ${isTop ? 'bg-emerald-600' : 'bg-slate-400'}`}>{item.rank}</span>
                                  <span className={`text-xs font-bold ${isTop ? 'text-emerald-900' : 'text-slate-800'}`}>{item.crop}</span>
                                  {isTop && <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">BEST MATCH</span>}
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-black text-slate-800">{item.suitability_pct}% Match</span>
                                  <span className="text-[10px] text-slate-500 font-semibold ml-2 font-mono">{(item.predicted_yield_kg_ha / 1000).toFixed(2)} t/ha</span>
                                </div>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-1.5 rounded-full ${barColor} transition-all duration-500`}
                                  style={{ width: `${item.suitability_pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <p className="text-sm font-bold text-slate-600">No Forecast Generated Yet</p>
                  <p className="text-xs text-slate-400">
                    Fill in your field parameters above and click <strong>"Calculate Crop Yield Forecast"</strong>.<br/>
                    Your predicted harvest and AI crop suitability rankings will appear here.
                  </p>
                </div>
              )}

              <div className="text-[11px] text-slate-400 text-center border-t border-slate-100 pt-3">
                Powered by YieldSense Multi-Algorithm Ensemble (Random Forest • Extra Trees • XGBoost)
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: SOIL & WEATHER ANALYTICS */}
        {activeTab === 'analysis' && (
          <div className="space-y-6 animate-fadeIn">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Soil Quality Module */}
              <div className="bg-white border border-slate-200/80 p-6 md:p-7 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 space-y-5 flex flex-col justify-between">
                <div>
                  <div className="border-b border-slate-100 pb-4 mb-4">
                    <h3 className="text-base font-bold text-slate-900">Soil Quality & Nutrient Assessment</h3>
                    <p className="text-xs text-slate-500">Evaluate NPK balance, pH level, and fertilizer dosage</p>
                  </div>

                  <form onSubmit={handleSoilAssess} className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Soil pH</label>
                        <input
                          type="number" step="0.1"
                          value={soilForm.soil_ph}
                          onChange={(e) => setSoilForm({ ...soilForm, soil_ph: parseFloat(e.target.value) || 6.8 })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Nitrogen N (kg/ha)</label>
                        <input
                          type="number"
                          value={soilForm.nitrogen_n}
                          onChange={(e) => setSoilForm({ ...soilForm, nitrogen_n: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Phosphorus P (kg/ha)</label>
                        <input
                          type="number"
                          value={soilForm.phosphorus_p}
                          onChange={(e) => setSoilForm({ ...soilForm, phosphorus_p: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Potassium K (kg/ha)</label>
                        <input
                          type="number"
                          value={soilForm.potassium_k}
                          onChange={(e) => setSoilForm({ ...soilForm, potassium_k: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Organic Matter (%)</label>
                        <input
                          type="number" step="0.1"
                          value={soilForm.organic_matter_percent || 2.5}
                          onChange={(e) => setSoilForm({ ...soilForm, organic_matter_percent: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Soil Type</label>
                        <select
                          value={soilForm.soil_type || 'Loamy'}
                          onChange={(e) => setSoilForm({ ...soilForm, soil_type: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-teal-500 text-xs"
                        >
                          {['Loamy', 'Clay', 'Sandy', 'Black', 'Silty', 'Red'].map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-xl transition text-xs shadow-sm flex items-center justify-center">
                      <span>Calculate Soil Health & Fertilizer Recommendations</span>
                    </button>
                  </form>
                </div>

                {/* Soil Diagnostic Result */}
                {soilResult ? (
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4 text-xs animate-fadeIn mt-4">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Overall Index</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-teal-700">{soilResult.soil_health_score}</span>
                          <span className="text-xs text-slate-500 font-bold">/ 100</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Fertility Status</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${
                          soilResult.fertility_status === 'Optimal' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          soilResult.fertility_status === 'Fair' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {soilResult.fertility_status}
                        </span>
                      </div>
                    </div>

                    {/* Nutrient Bars */}
                    <div className="space-y-2">
                      <p className="font-bold text-slate-800 text-[11px]">Nutrient Threshold Breakdown:</p>
                      {[
                        { label: 'Nitrogen (N)', val: soilForm.nitrogen_n, max: 180, unit: 'kg/ha', color: 'bg-emerald-500' },
                        { label: 'Phosphorus (P)', val: soilForm.phosphorus_p, max: 60, unit: 'kg/ha', color: 'bg-cyan-500' },
                        { label: 'Potassium (K)', val: soilForm.potassium_k, max: 100, unit: 'kg/ha', color: 'bg-purple-500' },
                        { label: 'Soil pH', val: soilForm.soil_ph, max: 9, unit: 'pH', color: 'bg-amber-500' }
                      ].map((n) => {
                        const pct = Math.min(100, Math.round((n.val / n.max) * 100));
                        return (
                          <div key={n.label} className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-600 font-semibold">{n.label}</span>
                              <span className="font-mono font-bold text-slate-800">{n.val} {n.unit}</span>
                            </div>
                            <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                              <div style={{ width: `${pct}%` }} className={`h-1.5 rounded-full ${n.color} transition-all duration-500`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Recommended Fertilizers */}
                    <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                      <p className="text-slate-800 font-bold text-[11px]">Recommended Corrective Dosage:</p>
                      <div className="space-y-1">
                        {soilResult.recommended_fertilizers?.map((f, idx) => (
                          <div key={idx} className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50/60 p-5 rounded-2xl border border-dashed border-slate-200 text-center py-6 text-slate-400 text-xs">
                    Fill in your field parameters above and click calculate to view full soil diagnostics.
                  </div>
                )}
              </div>

              {/* Weather Module */}
              <div className="bg-white border border-slate-200/80 p-6 md:p-7 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 space-y-5 flex flex-col justify-between">
                <div>
                  <div className="border-b border-slate-100 pb-4 mb-4">
                    <h3 className="text-base font-bold text-slate-900">Weather & Climate Risk Evaluator</h3>
                    <p className="text-xs text-slate-500">Regional rainfall, ambient temperature, and drought risks</p>
                  </div>

                  <form onSubmit={handleWeatherAnalyze} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Region</label>
                        <select
                          value={weatherForm.region}
                          onChange={(e) => setWeatherForm({ ...weatherForm, region: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-sky-500"
                        >
                          {['North Region', 'South Region', 'East Region', 'West Region', 'Central Region'].map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Season</label>
                        <select
                          value={weatherForm.season}
                          onChange={(e) => setWeatherForm({ ...weatherForm, season: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-sky-500"
                        >
                          {['Kharif', 'Rabi', 'Zaid', 'Spring', 'Autumn'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl transition text-xs shadow-sm flex items-center justify-center">
                      <span>Analyze Regional Climate & Risk</span>
                    </button>
                  </form>
                </div>

                {/* Weather Result */}
                {weatherResult ? (
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4 text-xs animate-fadeIn mt-4">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Region</span>
                        <p className="text-base font-bold text-slate-900">{weatherResult.region}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Drought Risk</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${
                          weatherResult.drought_risk === 'Low' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          weatherResult.drought_risk === 'Moderate' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {weatherResult.drought_risk} Risk
                        </span>
                      </div>
                    </div>

                    {/* Climate Cards Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 font-semibold block">Precipitation</span>
                        <span className="text-sm font-bold text-sky-600 font-mono mt-0.5 block">{weatherResult.rainfall_mm} mm</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 font-semibold block">Temperature</span>
                        <span className="text-sm font-bold text-amber-600 font-mono mt-0.5 block">{weatherResult.temperature_celsius} °C</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 font-semibold block">Humidity</span>
                        <span className="text-sm font-bold text-teal-600 font-mono mt-0.5 block">{weatherResult.humidity_percent} %</span>
                      </div>
                    </div>

                    <div className="bg-sky-50/80 p-3 rounded-xl border border-sky-100 text-sky-900 font-medium leading-relaxed">
                      {weatherResult.climate_status}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50/60 p-5 rounded-2xl border border-dashed border-slate-200 text-center py-6 text-slate-400 text-xs">
                    Select your region and season above to evaluate live climate trends and drought risks.
                  </div>
                )}
              </div>
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

            {/* Farm Land Allocation Visualizer */}
            <div className="mb-6">
              <FarmParcelsDistributionChart farms={farms} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {farms.map((farm) => (
                <div key={farm.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-bold text-emerald-700 text-base flex items-center">
                        <Tractor className="w-4 h-4 mr-2 text-emerald-600" /> {farm.farm_name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            const allocations = farm.crop_allocations && farm.crop_allocations.length > 0
                              ? farm.crop_allocations
                              : (farm.primary_crops || ['Wheat']).map(c => ({
                                  crop: c,
                                  area_hectares: Math.round(((parseFloat(farm.area_hectares) || 10) / (farm.primary_crops?.length || 1)) * 10) / 10
                                }));

                            setEditFarm({
                              id: farm.id,
                              farm_name: farm.farm_name,
                              region: farm.region,
                              area_hectares: farm.area_hectares,
                              soil_type: farm.soil_type,
                              irrigation_type: farm.irrigation_type,
                              crop_allocations: allocations,
                              primary_crops: farm.primary_crops || []
                            });
                            setShowEditFarmModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Edit Field Details"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFarm(farm.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Field Parcel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 font-medium">{farm.region}</p>

                    <div className="mt-4 space-y-2 text-xs text-slate-700">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Total Area:</span>
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
                        <span className="text-slate-500 block mb-1">Crops & Hectare Allocations:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {farm.crop_allocations && farm.crop_allocations.length > 0 ? (
                            farm.crop_allocations.map((alloc, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] border border-emerald-200 font-semibold flex items-center gap-1">
                                <span>{alloc.crop}</span>
                                <span className="font-mono font-bold text-emerald-700 bg-emerald-100/70 px-1 rounded">{alloc.area_hectares} ha</span>
                              </span>
                            ))
                          ) : (
                            farm.primary_crops?.map((c, i) => (
                              <span key={i} className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] border border-emerald-200 font-semibold">
                                {c}
                              </span>
                            ))
                          )}
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

        {/* VIEW 5: ADVISORY & RECOMMENDATION WORKFLOW STUDIO */}
        {activeTab === 'advisory' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-slate-50 border border-emerald-200/80 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Agricultural Advisory & Recommendation Workflows</h2>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    Multi-criteria crop matching, precision fertilizer schedules, integrated pest defense (IPM), and irrigation planning.
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white text-emerald-800 border border-emerald-200 shadow-xs w-fit">
                  5 Active Workflow Models
                </span>
              </div>
            </div>

            {/* Dedicated Recommendation Workflow Studio Component */}
            <RecommendationWorkflowStudio
              onApplyToForecast={(params) => {
                setPredForm(prev => ({ ...prev, ...params }));
                setActiveTab('forecast');
              }}
            />

            {/* Quick Single-Crop Advisory Calculator */}
            <div className="bg-white border border-slate-200/80 p-6 md:p-7 rounded-3xl shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-emerald-600" /> Instant Crop Agronomic Profile & Advisory Audit
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Generate rapid field suitability ratings, fertilizer splits, and crop rotation paths</p>
                </div>
              </div>

              {/* Comprehensive Input Form */}
            <form onSubmit={handleFetchRecommendations} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Target Crop</label>
                  <select
                    value={recQuery.crop}
                    onChange={(e) => setRecQuery({ ...recQuery, crop: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition"
                  >
                    {['Wheat', 'Rice', 'Maize', 'Soybean', 'Cotton', 'Potato', 'Sugarcane', 'Barley'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Region</label>
                  <select
                    value={recQuery.region}
                    onChange={(e) => setRecQuery({ ...recQuery, region: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition"
                  >
                    {['North Region', 'South Region', 'East Region', 'West Region', 'Central Region'].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Season</label>
                  <select
                    value={recQuery.season}
                    onChange={(e) => setRecQuery({ ...recQuery, season: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition"
                  >
                    {['Kharif', 'Rabi', 'Zaid', 'Spring', 'Autumn'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Irrigation System</label>
                  <select
                    value={recQuery.irrigation_type}
                    onChange={(e) => setRecQuery({ ...recQuery, irrigation_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition"
                  >
                    {['Canal', 'Drip', 'Sprinkler', 'Rainfed'].map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-sm pt-1">
                <div>
                  <label className="text-xs text-slate-500">Soil pH</label>
                  <input
                    type="number" step="0.1"
                    value={recQuery.soil_ph}
                    onChange={(e) => setRecQuery({ ...recQuery, soil_ph: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Nitrogen N (kg/ha)</label>
                  <input
                    type="number"
                    value={recQuery.nitrogen_n}
                    onChange={(e) => setRecQuery({ ...recQuery, nitrogen_n: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Phosphorus P (kg/ha)</label>
                  <input
                    type="number"
                    value={recQuery.phosphorus_p}
                    onChange={(e) => setRecQuery({ ...recQuery, phosphorus_p: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Potassium K (kg/ha)</label>
                  <input
                    type="number"
                    value={recQuery.potassium_k}
                    onChange={(e) => setRecQuery({ ...recQuery, potassium_k: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Rainfall (mm)</label>
                  <input
                    type="number"
                    value={recQuery.rainfall_mm}
                    onChange={(e) => setRecQuery({ ...recQuery, rainfall_mm: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Avg Temp (°C)</label>
                  <input
                    type="number" step="0.5"
                    value={recQuery.temperature_celsius}
                    onChange={(e) => setRecQuery({ ...recQuery, temperature_celsius: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 mt-1 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition text-xs shadow-xs flex items-center justify-center space-x-2 cursor-pointer">
                  <span>Generate Scientific Advisory Report</span>
                </button>
              </div>
            </form>

            {/* Generated Advisory Report */}
            {recResult && (
              <div className="space-y-6 pt-4 border-t border-slate-200 animate-fadeIn">

                {/* Score & Banner Header */}
                <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-slate-50 border border-emerald-200/80 p-5 rounded-2xl text-slate-900 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs uppercase font-bold tracking-widest text-emerald-800">Agronomic Report</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-600 font-semibold">{recResult.crop} ({recResult.season})</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900">
                      Field Advisory for {recResult.crop} in {recResult.region}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Based on current soil N-P-K reserves, pH level, rainfall patterns, and climate variables.
                    </p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-emerald-200/80 text-center min-w-[170px] shadow-xs">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Suitability Score</p>
                    <div className="text-2xl font-black text-emerald-700">
                      {recResult.suitability_score}%
                    </div>
                    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {recResult.suitability_rating}
                    </span>
                  </div>
                </div>

                {/* Crop Profile Metric Targets Bar */}
                {recResult.detailed_advisory?.crop_profile_metrics && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Optimal Soil pH</p>
                      <p className="text-sm font-bold text-teal-700 mt-0.5">{recResult.detailed_advisory.crop_profile_metrics.ideal_ph_range}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Target N Requirement</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{recResult.detailed_advisory.crop_profile_metrics.n_req_kg_ha} kg/ha</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Target P Requirement</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{recResult.detailed_advisory.crop_profile_metrics.p_req_kg_ha} kg/ha</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Target K Requirement</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{recResult.detailed_advisory.crop_profile_metrics.k_req_kg_ha} kg/ha</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Water Requirement</p>
                      <p className="text-sm font-bold text-sky-700 mt-0.5">{recResult.detailed_advisory.crop_profile_metrics.ideal_rainfall_mm}</p>
                    </div>
                  </div>
                )}

                {/* 4 Categorized Detailed Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* 1. Soil & Nutrients */}
                  <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
                    <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                      <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
                        <FlaskConical className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">1. Soil Health & Nutrient Management</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {recResult.detailed_advisory?.soil_and_nutrients?.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2 bg-teal-50/50 p-2.5 rounded-xl border border-teal-100">
                          <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 2. Water & Irrigation */}
                  <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
                    <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                      <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                        <CloudSun className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">2. Water & Irrigation Strategy</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {recResult.detailed_advisory?.water_management?.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2 bg-sky-50/50 p-2.5 rounded-xl border border-sky-100">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 3. Pest & Disease */}
                  <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
                    <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                      <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">3. Pest & Disease Prevention Protocol</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {recResult.detailed_advisory?.pest_and_disease?.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                          <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 4. Crop Rotation */}
                  <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
                    <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                        <Sprout className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">4. Crop Rotation & Soil Regeneration</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {recResult.detailed_advisory?.crop_rotation?.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Primary Action Plan Summary */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-amber-600" />
                    <span>Executive Summary & Immediate Farmer Action Items</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {recResult.recommendations?.map((rec, i) => (
                      <div key={i} className="flex items-start space-x-2 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <span className="text-slate-800">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
            </div>

            {/* Visual Agronomic Framework: Fertilizer Split Timeline & Seasonal Crop Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <FertilizerSplitTimeline
                crop={recQuery.crop || 'Wheat'}
                nitrogen={recQuery.nitrogen_n || 140}
                phosphorus={recQuery.phosphorus_p || 45}
                potassium={recQuery.potassium_k || 80}
              />
              <SeasonalProductivityHeatmap
                region={recQuery.region || 'North Region'}
              />
            </div>
          </div>
        )}

        {/* ADVISOR CONSULTATION DESK - For advisor & agronomist */}
        {activeTab === 'advisorhub' && (user?.role === 'advisor' || user?.role === 'agronomist') && (
          <AdvisorDashboard user={user} />
        )}

        {/* RISK ASSESSMENT & DISASTER MITIGATION VIEW */}
        {activeTab === 'risk' && (
          <RiskAssessmentView user={user} onRunForecast={() => setActiveTab('forecast')} />
        )}

        {/* REPORTS VIEW - Seasonal & Productivity Analytics Studio */}
        {activeTab === 'reports' && (
          <ReportsView user={user} onRunForecast={() => setActiveTab('forecast')} />
        )}

        {/* ADMIN PANEL VIEW - Only for admin role */}
        {activeTab === 'adminpanel' && user?.role === 'admin' && (
          <div className="space-y-6 animate-fadeIn">

            {/* Admin Header */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-violet-200">Administrator Console</span>
                  </div>
                  <h2 className="text-2xl font-black">YieldSense Admin Panel</h2>
                  <p className="text-violet-200 text-sm mt-1">Full platform access — manage users, monitor system, view all data</p>
                </div>
              </div>
            </div>

            {/* ── PENDING USER APPROVALS (FARMERS & ADVISORS) ─────────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </span>
                  Pending Registrations (Farmers & Advisors)
                  {pendingUsers.length > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold">
                      {pendingUsers.length}
                    </span>
                  )}
                </h3>
                <button onClick={fetchPendingUsers} className="text-xs text-violet-600 font-bold hover:underline flex items-center gap-1 cursor-pointer">
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>
              {pendingUsers.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600">All caught up!</p>
                  <p className="text-xs text-slate-400 mt-1">No pending registrations at this time.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingUsers.map((pu) => {
                    const isAdvisor = pu.role === 'advisor' || pu.role === 'agronomist';
                    return (
                      <div key={pu.id} className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between transition">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow-xs ${
                            isAdvisor ? 'bg-gradient-to-br from-sky-500 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                          }`}>
                            {pu.name?.[0]?.toUpperCase() || (isAdvisor ? 'A' : 'F')}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{pu.name}</p>
                            <p className="text-xs text-slate-500 font-mono">{pu.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isAdvisor ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {isAdvisor ? 'Advisor' : 'Farmer'}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">{pu.region}</span>
                              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 rounded-full">⏳ Pending</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            disabled={approvingId === pu.id}
                            onClick={async () => {
                              setApprovingId(pu.id);
                              try { await approveUser(pu.id); setPendingUsers(prev => prev.filter(u => u.id !== pu.id)); }
                              catch (e) { console.error(e); } finally { setApprovingId(null); }
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs hover:shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                          >
                            {approvingId === pu.id ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            Approve
                          </button>
                          <button
                            disabled={approvingId === pu.id}
                            onClick={async () => {
                              setApprovingId(pu.id);
                              try { await rejectUser(pu.id); setPendingUsers(prev => prev.filter(u => u.id !== pu.id)); }
                              catch (e) { console.error(e); } finally { setApprovingId(null); }
                            }}
                            className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Admin Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: (adminStats?.total_users ?? allDbUsers.length).toString(), sub: `${adminStats?.farmer_count ?? 0} Farmers / ${adminStats?.advisor_count ?? 0} Advisors / ${adminStats?.admin_count ?? 0} Admins`, color: 'violet', icon: Users },
                { label: 'Total Predictions', value: (adminStats?.total_predictions ?? predictionHistory.length).toString(), sub: 'AI Forecast Runs in DB', color: 'indigo', icon: TrendingUp },
                { label: 'Farmer Accounts', value: (adminStats?.farmer_count ?? 0).toString(), sub: 'Registered Farmers in DB', color: 'emerald', icon: Tractor },
                { label: 'Advisor Accounts', value: (adminStats?.advisor_count ?? 0).toString(), sub: 'Agricultural Advisors in DB', color: 'sky', icon: MessageSquare }
              ].map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                      <div className={`p-2 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{stat.sub}</p>
                  </div>
                );
              })}
            </div>

            {/* Role Access Matrix */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-violet-600" /> Role-Based Access Control Matrix
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 px-3 text-slate-500 font-bold">Feature / Module</th>
                      <th className="text-center py-2 px-3 text-emerald-600 font-bold">Farmer</th>
                      <th className="text-center py-2 px-3 text-violet-600 font-bold">Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      { feature: 'Dashboard Overview', farmer: true, admin: true },
                      { feature: 'Yield Forecasting (Run)', farmer: true, admin: true },
                      { feature: 'Soil & Weather Analysis', farmer: true, admin: true },
                      { feature: 'Advisory & Recommendations', farmer: true, admin: true },
                      { feature: 'My Fields (Personal)', farmer: true, admin: false },
                      { feature: 'All Farms Data (All Users)', farmer: false, admin: true },
                      { feature: 'User Management', farmer: false, admin: true },
                      { feature: 'Admin Panel', farmer: false, admin: true },
                      { feature: 'System Analytics', farmer: false, admin: true },
                      { feature: 'Export All Data (CSV)', farmer: true, admin: true },
                    ].map(row => (
                      <tr key={row.feature} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 text-slate-700 font-medium">{row.feature}</td>
                        {['farmer', 'admin'].map(role => (
                          <td key={role} className="text-center py-2.5 px-3">
                            {row[role]
                              ? <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 text-xs">✓</span>
                              : <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-400 text-xs">✗</span>
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Registered Users Table - FARMERS & ADVISORS ONLY (EXCLUDES ADMINS) */}
            {(() => {
              const platformUsers = allDbUsers.filter(u => u.role !== 'admin');
              const farmerCount = platformUsers.filter(u => u.role === 'farmer').length;
              const advisorCount = platformUsers.filter(u => u.role === 'advisor' || u.role === 'agronomist').length;

              return (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-violet-600" />
                      Registered Platform Users ({platformUsers.length})
                    </h3>

                    {/* Role Filter Tabs */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      {[
                        { id: 'all', label: `All (${platformUsers.length})` },
                        { id: 'farmer', label: `Farmers (${farmerCount})` },
                        { id: 'advisor', label: `Advisors (${advisorCount})` }
                      ].map(f => (
                        <button
                          key={f.id}
                          onClick={() => setAdminUserRoleFilter(f.id)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                            adminUserRoleFilter === f.id
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-2 px-3 text-slate-500 font-bold">Name</th>
                          <th className="text-center py-2 px-3 text-slate-500 font-bold">Role</th>
                          <th className="text-left py-2 px-3 text-slate-500 font-bold">Email</th>
                          <th className="text-left py-2 px-3 text-slate-500 font-bold">Region</th>
                          <th className="text-center py-2 px-3 text-slate-500 font-bold">Status</th>
                          <th className="text-center py-2 px-3 text-slate-500 font-bold">Auth</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {platformUsers
                          .filter(u => {
                            if (adminUserRoleFilter === 'farmer') return u.role === 'farmer';
                            if (adminUserRoleFilter === 'advisor') return u.role === 'advisor' || u.role === 'agronomist';
                            return true;
                          })
                          .map((u, i) => {
                            const isAdvisor = u.role === 'advisor' || u.role === 'agronomist';
                            return (
                              <tr key={i} className="hover:bg-violet-50/30 transition group">
                                <td className="py-2.5 px-3">
                                  <button
                                    className="font-bold text-violet-700 hover:text-violet-900 hover:underline text-left transition cursor-pointer"
                                    onClick={async () => {
                                      setFarmerProfileLoading(true);
                                      setFarmerProfile(null);
                                      try {
                                        const data = await getFarmerActivity(u.id);
                                        setFarmerProfile(data);
                                      } catch(e) {
                                        setFarmerProfile({ user: u, farmer: u, predictions: [], farms: [], inquiries: [], error: e.message });
                                      } finally {
                                        setFarmerProfileLoading(false);
                                      }
                                    }}
                                  >
                                    {u.name || u.email.split('@')[0]}
                                  </button>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isAdvisor
                                      ? 'bg-sky-100 text-sky-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {isAdvisor ? 'Advisor' : 'Farmer'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-500 font-mono">{u.email}</td>
                                <td className="py-2.5 px-3 text-slate-500">{u.region || 'North Region'}</td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    u.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                    u.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                  }`}>{u.status || 'active'}</span>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    u.auth_provider === 'google' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'
                                  }`}>{u.auth_provider === 'google' ? 'Google SSO' : 'Email'}</span>
                                </td>
                              </tr>
                            );
                          })}
                        {platformUsers.length === 0 && (
                          <tr><td colSpan={6} className="py-6 text-center text-slate-400 text-xs">No registered platform users found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}


          </div>
        )}

      </main>

      {/* ── USER (FARMER / ADVISOR) ACTIVITY PROFILE MODAL ────────────────────────────────── */}
      {(farmerProfile || farmerProfileLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            {(() => {
              const targetUser = farmerProfile?.user || farmerProfile?.farmer;
              const isAdvisor = targetUser?.role === 'advisor' || targetUser?.role === 'agronomist';
              return (
                <>
                  <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/90 flex items-center justify-center text-slate-600 shadow-xs">
                        <User className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-extrabold text-slate-900">
                            {targetUser?.name || 'User Profile'}
                          </h2>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isAdvisor ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isAdvisor ? 'Advisor' : 'Farmer'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">{targetUser?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDeleteConfirmFarmer(targetUser)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold border border-rose-200 transition cursor-pointer"
                      >
                        Remove {isAdvisor ? 'Advisor' : 'Farmer'}
                      </button>
                      <button onClick={() => setFarmerProfile(null)} className="p-2 hover:bg-slate-100 rounded-xl transition cursor-pointer">
                        <X className="w-5 h-5 text-slate-500" />
                      </button>
                    </div>
                  </div>

                  {farmerProfileLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                      <span className="ml-3 text-slate-500 text-sm">Loading activity profile...</span>
                    </div>
                  ) : (
                    <div className="p-6 space-y-6">
                      {/* Profile Card */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { label: 'Role', value: isAdvisor ? 'Agricultural Advisor' : 'Farmer' },
                          { label: 'Region', value: targetUser?.region || 'North Region' },
                          { label: 'Status', value: targetUser?.status || 'active' },
                          { label: 'Auth Provider', value: targetUser?.auth_provider === 'google' ? 'Google SSO' : 'Email' },
                          { label: isAdvisor ? 'Inquiries Handled' : 'Yield Predictions', value: isAdvisor ? (farmerProfile?.inquiry_count ?? 0) : (farmerProfile?.prediction_count ?? 0) },
                        ].map((item, i) => (
                          <div key={i} className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                            <p className="text-sm font-bold text-slate-800 mt-0.5">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* If Advisor: Show Consultations */}
                      {isAdvisor ? (
                        <div>
                          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center justify-between">
                            <span>Advisor Consultation Activity</span>
                            <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-bold">
                              {farmerProfile?.inquiries?.length || 0} consultations
                            </span>
                          </h3>
                          {farmerProfile?.inquiries?.length > 0 ? (
                            <div className="space-y-2">
                              {farmerProfile.inquiries.map((inq, i) => (
                                <div key={i} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
                                  <div>
                                    <p className="text-xs font-extrabold text-slate-800">
                                      Farmer: {inq.farmer_name} <span className="text-slate-400 font-normal">({inq.farmer_email})</span>
                                    </p>
                                    <p className="text-[10px] text-slate-500">{inq.crop} · {inq.region} · {inq.season}</p>
                                  </div>
                                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                                    inq.status === 'resolved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                                  }`}>
                                    {inq.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                              No active consultations recorded yet
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {/* Prediction History Cards */}
                          <div>
                            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center justify-between">
                              <span>Yield Prediction History</span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                                {farmerProfile?.predictions?.length || 0} records
                              </span>
                            </h3>
                            {farmerProfile?.predictions?.length > 0 ? (
                              <div className="space-y-2">
                                {farmerProfile.predictions.map((p, i) => (
                                  <div key={i} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
                                    <div>
                                      <p className="text-xs font-extrabold text-slate-800">{p.crop} — {p.season}</p>
                                      <p className="text-[10px] text-slate-500">{p.region} · {p.soil_type} · {p.area_hectares} ha</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-extrabold text-emerald-700">{(p.predicted_yield_kg_ha || 0).toFixed(0)} kg/ha</p>
                                      <p className="text-[10px] text-slate-400">{p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : ''}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                No prediction records yet
                              </div>
                            )}
                          </div>

                          {/* Farm Parcels Cards */}
                          <div>
                            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center justify-between">
                              <span>Registered Farm Parcels</span>
                              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                                {farmerProfile?.farms?.length || 0} fields
                              </span>
                            </h3>
                            {farmerProfile?.farms?.length > 0 ? (
                              <div className="grid grid-cols-2 gap-3">
                                {farmerProfile.farms.map((f, i) => (
                                  <div key={i} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                                    <p className="text-xs font-extrabold text-slate-800 mb-1">{f.farm_name || f.name}</p>
                                    <div className="space-y-0.5 text-[10px] text-slate-500">
                                      <p>Region: {f.region}</p>
                                      <p>Area: {f.area_hectares} ha · {f.soil_type}</p>
                                      <p>Irrigation: {f.irrigation_type}</p>
                                      {f.primary_crops?.length > 0 && (
                                        <p>Crops: {f.primary_crops.join(', ')}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                No farm parcels registered
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}


      {/* ── DELETE USER CONFIRMATION MODAL ─────────────────────────────── */}
      {deleteConfirmFarmer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Delete {deleteConfirmFarmer.role === 'advisor' ? 'Advisor' : 'Farmer'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <span className="font-semibold text-slate-800">{deleteConfirmFarmer.name || deleteConfirmFarmer.email}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => setDeleteConfirmFarmer(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={deletingFarmerId === deleteConfirmFarmer.id}
                onClick={async () => {
                  setDeletingFarmerId(deleteConfirmFarmer.id);
                  try {
                    await deleteFarmer(deleteConfirmFarmer.id);
                    setAllDbUsers(prev => prev.filter(u => u.id !== deleteConfirmFarmer.id));
                    setDeleteConfirmFarmer(null);
                    setFarmerProfile(null);
                  } catch (e) {
                    console.error('Delete error:', e);
                  } finally {
                    setDeletingFarmerId(null);
                  }
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition shadow-xs disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                {deletingFarmerId === deleteConfirmFarmer.id ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}


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

            {/* Quick Demo Shortcuts (Farmer & Admin Only) */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Quick Login Credentials:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('farmer@yieldsense.ai', 'farmer123')}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold py-2 rounded-xl border border-emerald-300 transition flex items-center justify-center space-x-1"
                >
                  <span>Farmer Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@yieldsense.ai', 'admin123')}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-800 text-[11px] font-bold py-2 rounded-xl border border-purple-300 transition flex items-center justify-center space-x-1"
                >
                  <span>Admin Sign In</span>
                </button>
              </div>
            </div>

            {/* Google Direct Sign In Button */}
            <div>
              <button
                type="button"
                onClick={() => handleGoogleSignIn(authMode === 'register' ? regRole : 'farmer')}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-xl border border-slate-300 transition text-xs shadow-sm flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google Account</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">OR</span>
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
                Register Account
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
                    placeholder="farmer@yieldsense.ai or admin@yieldsense.ai"
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
                  {authLoading ? 'Logging In...' : 'Log In & Go to Dashboard'}
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
                    <label className="text-xs text-slate-500">Account Type</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2 text-slate-800 mt-1 text-xs"
                    >
                      <option value="farmer">Farmer</option>
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
                  {authLoading ? 'Creating Account...' : 'Create Account & Go to Dashboard'}
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

              {/* Exact Crop & Hectares Allocation Builder */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">Crop & Hectare Allocations</label>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [
                        ...(newFarm.crop_allocations || []),
                        { crop: 'Maize', area_hectares: 2.0 }
                      ];
                      const totalArea = Math.round(updated.reduce((s, a) => s + (parseFloat(a.area_hectares) || 0), 0) * 10) / 10;
                      setNewFarm({
                        ...newFarm,
                        crop_allocations: updated,
                        area_hectares: totalArea,
                        primary_crops: updated.map(u => u.crop)
                      });
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Crop
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(newFarm.crop_allocations || []).map((alloc, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          placeholder="Crop name (e.g. Wheat)"
                          value={alloc.crop}
                          onChange={(e) => {
                            const updated = [...(newFarm.crop_allocations || [])];
                            updated[idx].crop = e.target.value;
                            const totalArea = Math.round(updated.reduce((s, a) => s + (parseFloat(a.area_hectares) || 0), 0) * 10) / 10;
                            setNewFarm({ ...newFarm, crop_allocations: updated, area_hectares: totalArea, primary_crops: updated.map(u => u.crop) });
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div className="w-32 flex items-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          required
                          placeholder="Area"
                          value={alloc.area_hectares}
                          onChange={(e) => {
                            const updated = [...(newFarm.crop_allocations || [])];
                            updated[idx].area_hectares = parseFloat(e.target.value) || 0;
                            const totalArea = Math.round(updated.reduce((s, a) => s + (parseFloat(a.area_hectares) || 0), 0) * 10) / 10;
                            setNewFarm({ ...newFarm, crop_allocations: updated, area_hectares: totalArea, primary_crops: updated.map(u => u.crop) });
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                        />
                        <span className="text-[10px] text-slate-500 font-bold shrink-0">ha</span>
                      </div>
                      {(newFarm.crop_allocations || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = newFarm.crop_allocations.filter((_, i) => i !== idx);
                            const totalArea = Math.round(updated.reduce((s, a) => s + (parseFloat(a.area_hectares) || 0), 0) * 10) / 10;
                            setNewFarm({ ...newFarm, crop_allocations: updated, area_hectares: totalArea, primary_crops: updated.map(u => u.crop) });
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-2 px-1 text-xs">
                  <span className="text-slate-500">Calculated Total Land Size:</span>
                  <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {newFarm.area_hectares || 0} ha
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition text-xs shadow-sm mt-2 cursor-pointer"
              >
                Save Field to My Portfolio
              </button>
            </form>

          </div>
        </div>
      )}

      {/* EDIT FIELD MODAL */}
      {showEditFarmModal && editFarm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl max-w-md w-full space-y-4 relative animate-fadeIn">
            <button
              onClick={() => setShowEditFarmModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm"
            >
              ✕
            </button>

            <div className="text-left border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-emerald-700 flex items-center">
                <Pencil className="w-5 h-5 mr-2 text-emerald-600" /> Edit Field Parcel Details
              </h3>
              <p className="text-xs text-slate-500">Update land area, soil texture, irrigation or crop list</p>
            </div>

            <form onSubmit={handleUpdateFarm} className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-slate-500">Field / Farm Name</label>
                <input
                  type="text"
                  required
                  value={editFarm.farm_name}
                  onChange={(e) => setEditFarm({ ...editFarm, farm_name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 focus:outline-none focus:border-emerald-600 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Region</label>
                  <select
                    value={editFarm.region}
                    onChange={(e) => setEditFarm({ ...editFarm, region: e.target.value })}
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
                    value={editFarm.area_hectares}
                    onChange={(e) => setEditFarm({ ...editFarm, area_hectares: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Soil Texture</label>
                  <select
                    value={editFarm.soil_type}
                    onChange={(e) => setEditFarm({ ...editFarm, soil_type: e.target.value })}
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
                    value={editFarm.irrigation_type}
                    onChange={(e) => setEditFarm({ ...editFarm, irrigation_type: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2 text-slate-800 mt-1 text-xs"
                  >
                    {['Rainfed', 'Drip', 'Canal', 'Sprinkler'].map((it) => (
                      <option key={it} value={it}>{it}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Exact Crop & Hectares Allocation Builder for Edit Modal */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">Crop & Hectare Allocations</label>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [
                        ...(editFarm.crop_allocations || []),
                        { crop: 'Maize', area_hectares: 2.0 }
                      ];
                      const totalArea = Math.round(updated.reduce((s, a) => s + (parseFloat(a.area_hectares) || 0), 0) * 10) / 10;
                      setEditFarm({
                        ...editFarm,
                        crop_allocations: updated,
                        area_hectares: totalArea,
                        primary_crops: updated.map(u => u.crop)
                      });
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Crop
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(editFarm.crop_allocations || []).map((alloc, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          placeholder="Crop name (e.g. Wheat)"
                          value={alloc.crop}
                          onChange={(e) => {
                            const updated = [...(editFarm.crop_allocations || [])];
                            updated[idx].crop = e.target.value;
                            const totalArea = Math.round(updated.reduce((s, a) => s + (parseFloat(a.area_hectares) || 0), 0) * 10) / 10;
                            setEditFarm({ ...editFarm, crop_allocations: updated, area_hectares: totalArea, primary_crops: updated.map(u => u.crop) });
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div className="w-32 flex items-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          required
                          placeholder="Area"
                          value={alloc.area_hectares}
                          onChange={(e) => {
                            const updated = [...(editFarm.crop_allocations || [])];
                            updated[idx].area_hectares = parseFloat(e.target.value) || 0;
                            const totalArea = Math.round(updated.reduce((s, a) => s + (parseFloat(a.area_hectares) || 0), 0) * 10) / 10;
                            setEditFarm({ ...editFarm, crop_allocations: updated, area_hectares: totalArea, primary_crops: updated.map(u => u.crop) });
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                        />
                        <span className="text-[10px] text-slate-500 font-bold shrink-0">ha</span>
                      </div>
                      {(editFarm.crop_allocations || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editFarm.crop_allocations.filter((_, i) => i !== idx);
                            const totalArea = Math.round(updated.reduce((s, a) => s + (parseFloat(a.area_hectares) || 0), 0) * 10) / 10;
                            setEditFarm({ ...editFarm, crop_allocations: updated, area_hectares: totalArea, primary_crops: updated.map(u => u.crop) });
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-2 px-1 text-xs">
                  <span className="text-slate-500">Calculated Total Land Size:</span>
                  <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {editFarm.area_hectares || 0} ha
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition text-xs shadow-sm mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Update Field Parcel Details
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
                {(selectedLogDetail.predicted_yield_kg_ha / 1000).toFixed(2)} <span className="text-base text-emerald-700 font-bold">Tonnes/ha</span>
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Equivalent to <span className="text-emerald-800 font-bold">{selectedLogDetail.predicted_yield_kg_ha} kg/ha</span> | Total Harvest: <span className="text-emerald-800 font-bold">{selectedLogDetail.total_production_tonnes} Tonnes</span>
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
