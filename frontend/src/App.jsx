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
  Users,
  Lock
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

export default function App() {
  const [activeTab, setActiveTab] = useState('login');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [allDbUsers, setAllDbUsers] = useState([]);
  const [approvingId, setApprovingId] = useState(null);
  const [googlePendingMsg, setGooglePendingMsg] = useState('');
  const [pendingGoogleAdmin, setPendingGoogleAdmin] = useState(null);
  // Farmer Activity Modal (admin view)
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [farmerProfileLoading, setFarmerProfileLoading] = useState(false);
  const [deletingFarmerId, setDeletingFarmerId] = useState(null);
  const [deleteConfirmFarmer, setDeleteConfirmFarmer] = useState(null);
  
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
  const [showEditFarmModal, setShowEditFarmModal] = useState(false);
  const [editFarm, setEditFarm] = useState(null);
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

  const fetchProfile = async () => {
    try {
      const data = await getCurrentUserProfile();
      if (data && data.email) {
        setUser(data);
        setActiveTab(data.role === 'admin' ? 'adminpanel' : 'dashboard');
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
      setActiveTab(data.user.role === 'admin' ? 'adminpanel' : 'dashboard'); // Role-based redirect
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
      setActiveTab(data.user.role === 'admin' ? 'adminpanel' : 'dashboard'); // Role-based redirect
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
      setActiveTab(data.user.role === 'admin' ? 'adminpanel' : 'dashboard'); // Role-based redirect
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
      setActiveTab(data.user.role === 'admin' ? 'adminpanel' : 'dashboard'); // Role-based redirect
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

  const handleUpdateFarm = async (e) => {
    e.preventDefault();
    if (!editFarm || !editFarm.id) return;
    try {
      await updateFarm(editFarm.id, {
        farm_name: editFarm.farm_name,
        region: editFarm.region,
        area_hectares: parseFloat(editFarm.area_hectares) || 1.0,
        soil_type: editFarm.soil_type,
        irrigation_type: editFarm.irrigation_type,
        primary_crops: Array.isArray(editFarm.primary_crops)
          ? editFarm.primary_crops
          : editFarm.primary_crops.split(',').map(s => s.trim())
      });
      setShowEditFarmModal(false);
      fetchFarmList();
    } catch (err) {
      alert('Failed to update field: ' + err.message);
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
          setActiveTab(loggedInUser.role === 'admin' ? 'adminpanel' : 'dashboard');
          fetchHistory();
          fetchFarmList();
          if (loggedInUser.role === 'admin') fetchPendingUsers();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* BRIGHT LIGHT HEADER & NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/70 px-6 lg:px-8 py-2.5 shadow-sm shadow-slate-100 transition-all">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-0.5 shadow-md shadow-emerald-500/20 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center">
                YieldSense <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 ml-1 font-black">AI</span>
              </h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Agricultural Productivity & Forecasting</p>
            </div>
          </div>

          {/* Right Side Section: Nav Tabs & Log In grouped closely */}
          <div className="flex items-center space-x-3">
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
              {(() => {
                const currentRole = user?.role || 'farmer';
                const isAdmin = currentRole === 'admin';
                const navTabs = [
                  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['farmer', 'agronomist', 'admin'] },
                  { id: 'forecast', label: 'Yield Forecasting', icon: TrendingUp, roles: ['farmer', 'agronomist', 'admin'] },
                  { id: 'analysis', label: 'Soil & Weather', icon: FlaskConical, roles: ['farmer', 'agronomist', 'admin'] },
                  { id: 'farms', label: 'My Fields', icon: Tractor, roles: ['farmer'] },
                  { id: 'advisory', label: 'Advisory', icon: Lightbulb, roles: ['farmer', 'agronomist', 'admin'] },
                  { id: 'adminpanel', label: 'Admin Panel', icon: ShieldCheck, roles: ['admin'] }
                ].filter(tab => tab.roles.includes(currentRole));

                return navTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const activeClass = isAdmin
                    ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-md shadow-violet-500/25 scale-[1.02] backdrop-blur-md'
                    : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-[1.02] backdrop-blur-md';
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ease-out cursor-pointer ${
                        isActive ? activeClass : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:scale-95'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-white' : 'text-slate-500'}`} />
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
                className="w-8.5 h-8.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 text-slate-600 hover:text-slate-900 transition flex items-center justify-center border border-slate-200/50 shadow-sm relative"
                title="Agricultural Notifications & Risk Alerts"
              >
                <Bell className="w-4 h-4" />
                {notificationsList.some(n => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-ping"></span>
                )}
                {notificationsList.some(n => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl shadow-2xl p-4 z-50 animate-fadeIn space-y-3">
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
                      <div key={n.id} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
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
              className="w-8.5 h-8.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 text-slate-600 hover:text-slate-900 transition flex items-center justify-center border border-slate-200/50 shadow-sm"
              title="Agronomic Support & Expert Assistance"
            >
              <Headphones className="w-4 h-4" />
            </button>

            {/* User Avatar Circle with Logout Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`w-8.5 h-8.5 rounded-xl text-white font-black text-xs flex items-center justify-center shadow-md transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 cursor-pointer ${
                    user?.role === 'admin'
                      ? 'bg-gradient-to-tr from-violet-600 to-purple-600 ring-2 ring-violet-400/30 shadow-violet-500/20'
                      : 'bg-gradient-to-tr from-emerald-600 to-teal-500 ring-2 ring-emerald-400/30 shadow-emerald-500/20'
                  }`}
                  title={user.name}
                >
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </button>

                {showUserMenu && (
                  <>
                    {/* Backdrop to close on outside click */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    {/* Dropdown Banner */}
                    <div className="absolute right-0 mt-2 z-50 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl shadow-2xl p-3.5 w-52 space-y-2.5 animate-fadeIn">
                      <div className="px-1 pb-2 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            user?.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>{user.role}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { setShowUserMenu(false); handleLogout(); }}
                        className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-md shadow-emerald-600/20 shrink-0"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </button>
            )}
          </div>
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
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</p>
                      <div className="p-2.5 rounded-2xl bg-violet-50 text-violet-600">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-violet-700 mt-3 mb-1">{adminStats?.total_users ?? 2}</h3>
                    <p className="text-xs text-slate-500">
                      {adminStats?.farmer_count ?? 1} Farmers / {adminStats?.admin_count ?? 1} Admins
                    </p>
                  </div>

                  {/* ADMIN CARD 2: Platform Predictions */}
                  <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Predictions</p>
                      <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-indigo-600 mt-3 mb-1">{adminStats?.total_predictions ?? predictionHistory.length}</h3>
                    <p className="text-xs text-slate-500">System-Wide AI Runs in DB</p>
                  </div>

                  {/* ADMIN CARD 3: Registered Fields */}
                  <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Fields</p>
                      <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
                        <Tractor className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-blue-600 mt-3 mb-1">{farms.length || 1}</h3>
                    <p className="text-xs text-slate-500">Platform Land Parcels</p>
                  </div>

                  {/* ADMIN CARD 4: Model Accuracy */}
                  <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model Accuracy</p>
                      <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                        <Activity className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-emerald-700 mt-3 mb-1">92.61%</h3>
                    <p className="text-xs text-slate-500 flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" /> Weighted Ensemble Engine
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* FARMER CARD 1: Model Accuracy */}
                  <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model Accuracy</p>
                      <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                        <Activity className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-emerald-700 mt-3 mb-1">92.61%</h3>
                    <p className="text-xs text-slate-500 flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" /> Weighted Ensemble Engine
                    </p>
                  </div>

                  {/* FARMER CARD 2: Active Fields */}
                  <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Fields</p>
                      <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
                        <Tractor className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-blue-600 mt-3 mb-1">{farms.length || 1}</h3>
                    <p className="text-xs text-slate-500">Registered Land Parcels</p>
                  </div>

                  {/* FARMER CARD 3: Logged Forecasts */}
                  <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logged Forecasts</p>
                      <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-amber-600 mt-3 mb-1">{predictionHistory.length}</h3>
                    <p className="text-xs text-slate-500">Saved Prediction Runs</p>
                  </div>

                  {/* FARMER CARD 4: Soil Fertility */}
                  <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Soil Fertility</p>
                      <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-600">
                        <FlaskConical className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-teal-600 mt-3 mb-1">Optimal</h3>
                    <p className="text-xs text-slate-500">Neutral pH 6.8 | High Organic Matter</p>
                  </div>
                </>
              )}
            </div>

            {/* Charts Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* CROP YIELD FORECASTING CARD (LIGHT MODE) */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">Crop Yield Forecasting (kg/ha)</h3>
                    </div>
                    <p className="text-[11px] text-slate-500 ml-8">AI prediction vs regional benchmark</p>
                  </div>
                  <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-semibold">
                    Random Forest + XGB
                  </span>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cropYieldChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="crop" stroke="#64748b" tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }} itemStyle={{ color: '#334155' }} labelStyle={{ color: '#0f172a', fontWeight: 'bold' }} />
                      <Legend wrapperStyle={{ fontSize: 12, color: '#475569', paddingTop: '10px' }} />
                      <Bar dataKey="yield" name="AI Forecast (kg/ha)" fill="#10b981" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="baseline" name="Regional Baseline" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* SOIL HEALTH CARD (LIGHT MODE) */}
              {(() => {
                const nVal = predForm.nitrogen_n || 140;
                const pVal = predForm.phosphorus_p || 45;
                const kVal = predForm.potassium_k || 80;
                const phVal = predForm.soil_ph || 6.8;
                const orgVal = predForm.organic_matter_percent || 2.5;
                const score = Math.max(30, Math.min(98, Math.round(100 - Math.abs(phVal - 6.8)*12 - Math.max(0, 80-nVal)*0.2 - Math.max(0, 30-pVal)*0.4)));
                const scoreColor = score >= 80 ? '#10b981' : score >= 55 ? '#f59e0b' : '#ef4444';
                const scoreLabel = score >= 80 ? 'Excellent' : score >= 55 ? 'Moderate' : 'Poor';

                const radius = 52;
                const circ = 2 * Math.PI * radius;
                const offset = circ - (score / 100) * circ;

                const nutrients = [
                  { label: 'Nitrogen', symbol: 'N', val: nVal, unit: 'kg/ha', max: 180, color: '#10b981', badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                  { label: 'Phosphorus', symbol: 'P', val: pVal, unit: 'kg/ha', max: 60, color: '#06b6d4', badgeBg: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
                  { label: 'Potassium', symbol: 'K', val: kVal, unit: 'kg/ha', max: 100, color: '#8b5cf6', badgeBg: 'bg-purple-50 text-purple-800 border-purple-200' },
                  { label: 'Soil pH', symbol: 'pH', val: phVal, unit: '', max: 9, color: '#f59e0b', badgeBg: 'bg-amber-50 text-amber-800 border-amber-200' },
                  { label: 'Organic', symbol: 'OM', val: orgVal, unit: '%', max: 5, color: '#84cc16', badgeBg: 'bg-lime-50 text-lime-800 border-lime-200' },
                ];

                return (
                  <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-5 justify-between">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="p-1.5 rounded-lg bg-teal-50 border border-teal-100 text-teal-600">
                            <FlaskConical className="w-4 h-4" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-900">Soil Health Index</h3>
                        </div>
                        <p className="text-[11px] text-slate-500 ml-8">Live agronomic balance analysis</p>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                        {scoreLabel}
                      </div>
                    </div>

                    {/* Donut Score Ring + Nutrients */}
                    <div className="flex items-center gap-5">
                      {/* SVG Donut Ring */}
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <svg width="130" height="130" viewBox="0 0 130 130">
                          {/* BG track */}
                          <circle cx="65" cy="65" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="10" />
                          {/* Subtle tick marks */}
                          {[0,25,50,75].map(t => {
                            const a = ((t/100)*360 - 90) * Math.PI / 180;
                            return <circle key={t} cx={65 + (radius+8)*Math.cos(a)} cy={65 + (radius+8)*Math.sin(a)} r="2" fill="#cbd5e1" />;
                          })}
                          {/* Score arc */}
                          <circle
                            cx="65" cy="65" r={radius}
                            fill="none"
                            stroke={scoreColor}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={circ}
                            strokeDashoffset={offset}
                            transform="rotate(-90 65 65)"
                            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
                          />
                          {/* Center text */}
                          <text x="65" y="60" textAnchor="middle" fill="#0f172a" fontSize="22" fontWeight="900" fontFamily="system-ui">{score}</text>
                          <text x="65" y="76" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="system-ui" fontWeight="600">/100 SCORE</text>
                        </svg>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: scoreColor }} />
                          <span className="text-[10px] text-slate-500 font-medium">NPK Ratio 140:45:80</span>
                        </div>
                      </div>

                      {/* Nutrient Mini-Cards Grid */}
                      <div className="flex-1 grid grid-cols-1 gap-2">
                        {nutrients.map((n) => {
                          const pct = Math.min(100, Math.round((n.val / n.max) * 100));
                          return (
                            <div key={n.symbol} className="bg-slate-50/80 border border-slate-200/60 rounded-xl px-3 py-2">
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-1.5 py-0.5 rounded border text-[9px] font-extrabold ${n.badgeBg}`}>{n.symbol}</span>
                                  <span className="text-[11px] text-slate-700 font-medium">{n.label}</span>
                                </div>
                                <span className="text-[11px] font-bold text-slate-900 font-mono">{n.val}{n.unit}</span>
                              </div>
                              <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                                <div
                                  style={{ width: `${pct}%`, backgroundColor: n.color, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }}
                                  className="h-1.5 rounded-full"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Based on current form inputs</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-emerald-700 font-bold">Live Analysis</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
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
                          <td className="px-5 py-4 font-mono text-xs font-bold text-slate-800">{item.predicted_yield_kg_ha} kg/ha</td>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
            {/* Form Column */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5">
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
                    <Globe className="w-3.5 h-3.5 mr-1" /> 1. CROP & REGION PARAMETERS
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
                    <CloudSun className="w-3.5 h-3.5 mr-1" /> 2. FIELD & CLIMATE INPUTS
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
                    <FlaskConical className="w-3.5 h-3.5 mr-1" /> 3. SOIL NUTRIENTS (NPK & PH)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
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
                      <label className="text-xs text-slate-500">Nitrogen N (kg/ha)</label>
                      <input
                        type="number"
                        value={predForm.nitrogen_n}
                        onChange={(e) => setPredForm({ ...predForm, nitrogen_n: parseFloat(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Phosphorus P (kg/ha)</label>
                      <input
                        type="number"
                        value={predForm.phosphorus_p}
                        onChange={(e) => setPredForm({ ...predForm, phosphorus_p: parseFloat(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Potassium K (kg/ha)</label>
                      <input
                        type="number"
                        value={predForm.potassium_k}
                        onChange={(e) => setPredForm({ ...predForm, potassium_k: parseFloat(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Humidity (%)</label>
                      <input
                        type="number" step="1" min="0" max="100"
                        value={predForm.humidity_percent}
                        onChange={(e) => setPredForm({ ...predForm, humidity_percent: parseFloat(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Organic Matter (%)</label>
                      <input
                        type="number" step="0.1" min="0" max="10"
                        value={predForm.organic_matter_percent}
                        onChange={(e) => setPredForm({ ...predForm, organic_matter_percent: parseFloat(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Temperature */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-sky-700 uppercase tracking-wider flex items-center">
                    <CloudSun className="w-3.5 h-3.5 mr-1" /> 4. TEMPERATURE
                  </p>
                  <div className="grid grid-cols-1 gap-3 text-sm max-w-[200px]">
                    <div>
                      <label className="text-xs text-slate-500">Temp (°C)</label>
                      <input
                        type="number" step="0.5"
                        value={predForm.temperature_celsius}
                        onChange={(e) => setPredForm({ ...predForm, temperature_celsius: parseFloat(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={predLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-2xl transition shadow-md flex items-center justify-center space-x-2 text-sm cursor-pointer"
                  >
                    {predLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Running Weighted Ensemble Model...</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5" />
                        <span>Execute Crop Yield Forecast</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Inference Output Display */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col space-y-4 overflow-y-auto max-h-[780px]">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center justify-between shrink-0">
                <span className="flex items-center"><Activity className="w-4 h-4 mr-2 text-emerald-600" /> AI Forecast Output</span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">92.61% Accuracy</span>
              </h3>

              {predictionResult ? (
                <div className="space-y-4 animate-fadeIn">
                  {/* Primary yield result */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-5 rounded-2xl text-center shadow-sm">
                    <p className="text-xs uppercase tracking-wider font-bold text-emerald-700">Predicted Yield — {predForm.crop}</p>
                    <h2 className="text-4xl font-black text-slate-900 mt-1">
                      {predictionResult.predicted_yield_kg_ha} <span className="text-base text-emerald-700 font-bold">kg/ha</span>
                    </h2>
                    <p className="text-xs text-slate-600 font-medium mt-2">
                      Total Harvest: <span className="text-emerald-700 font-bold">{predictionResult.total_production_tonnes} Tonnes</span>
                    </p>
                  </div>

                  {/* Metrics row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Productivity</p>
                      <p className="text-lg font-black text-amber-600 mt-0.5">{predictionResult.productivity_score}<span className="text-xs">/100</span></p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Soil</p>
                      <p className="text-sm font-black text-teal-600 mt-0.5">{predictionResult.soil_health?.status}</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Weather</p>
                      <p className="text-sm font-black text-sky-600 mt-0.5">{predictionResult.weather_impact?.status || 'OK'}</p>
                    </div>
                  </div>

                  {/* ===== CROP SUITABILITY RANKING ===== */}
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <p className="text-xs font-bold text-violet-800 uppercase tracking-wider flex items-center">
                      <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-violet-600" />
                      Best Crops for Your Field (AI Ranked)
                    </p>
                    {cropRankLoading ? (
                      <div className="flex items-center space-x-2 text-xs text-slate-400 py-4 justify-center">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Ranking all crops…</span>
                      </div>
                    ) : cropRankResult ? (
                      <div className="space-y-2">
                        {cropRankResult.recommendations?.map((item, i) => {
                          const colors = [
                            'bg-emerald-500', 'bg-teal-500', 'bg-sky-500', 'bg-blue-500',
                            'bg-indigo-400', 'bg-violet-400', 'bg-amber-400', 'bg-rose-400'
                          ];
                          const barColor = colors[i] || 'bg-slate-400';
                          const isTop = i === 0;
                          return (
                            <div key={item.crop} className={`p-2.5 rounded-xl border ${isTop ? 'border-emerald-300 bg-emerald-50/60' : 'border-slate-200 bg-slate-50/40'}`}>
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-1.5">
                                  <span className={`text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center text-white ${isTop ? 'bg-emerald-600' : 'bg-slate-400'}`}>{item.rank}</span>
                                  <span className={`text-xs font-bold ${isTop ? 'text-emerald-800' : 'text-slate-700'}`}>{item.crop}</span>
                                  {isTop && <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">BEST</span>}
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-black text-slate-700">{item.suitability_pct}%</span>
                                  <span className="text-[9px] text-slate-400 ml-1">{item.predicted_yield_kg_ha} kg/ha</span>
                                </div>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${barColor} transition-all duration-500`}
                                  style={{ width: `${item.suitability_pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                        <p className="text-[10px] text-slate-400 text-center pt-1">Based on your region ({cropRankResult.based_on_region}) & season ({cropRankResult.based_on_season})</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="my-12 text-center text-slate-400 space-y-3">
                  <Sprout className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="text-xs">Fill field parameters and click "Execute Crop Yield Forecast".<br/>AI will also rank the best crops for your conditions.</p>
                </div>
              )}

              <div className="text-[11px] text-slate-400 text-center border-t border-slate-100 pt-3 shrink-0">
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
                        <Tractor className="w-4 h-4 mr-2 text-emerald-600" /> {farm.farm_name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setEditFarm({
                              id: farm.id,
                              farm_name: farm.farm_name,
                              region: farm.region,
                              area_hectares: farm.area_hectares,
                              soil_type: farm.soil_type,
                              irrigation_type: farm.irrigation_type,
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
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">AI Agricultural Advisory Engine</h2>
                  <p className="text-xs text-slate-500">Scientific crop recommendations, nutrient dosage, IPM protocols & risk mitigation</p>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full">
                  Agronomic Decision Engine v2.0
                </span>
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
                <button type="submit" className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3 rounded-xl transition text-xs shadow-md flex items-center justify-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-amber-200" />
                  <span>Generate Scientific Advisory Report</span>
                </button>
              </div>
            </form>

            {/* Generated Advisory Report */}
            {recResult && (
              <div className="space-y-6 pt-4 border-t border-slate-200 animate-fadeIn">

                {/* Score & Banner Header */}
                <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 p-6 rounded-2xl text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Agronomic Report</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-xs text-slate-300">{recResult.crop} ({recResult.season})</span>
                    </div>
                    <h3 className="text-xl font-black text-white">
                      Field Advisory for {recResult.crop} in {recResult.region}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Based on current soil N-P-K reserves, pH level, rainfall patterns, and climate variables.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 text-center min-w-[200px]">
                    <p className="text-[10px] text-amber-300 uppercase tracking-widest font-bold mb-1">Suitability Score</p>
                    <div className="text-3xl font-black text-amber-400">
                      {recResult.suitability_score}%
                    </div>
                    <span className="inline-block mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30">
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
        )}
        {/* ADMIN PANEL VIEW - Only for admin role */}
        {activeTab === 'adminpanel' && user?.role === 'admin' && (
          <div className="space-y-6 animate-fadeIn">

            {/* Admin Header */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest text-violet-200">Administrator Console</span>
                  </div>
                  <h2 className="text-2xl font-black">YieldSense Admin Panel</h2>
                  <p className="text-violet-200 text-sm mt-1">Full platform access — manage users, monitor system, view all data</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* ── PENDING FARMER APPROVALS ─────────────────────────────── */}
            <div className={`rounded-2xl border-2 p-6 shadow-sm ${pendingUsers.length > 0 ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-amber-600" />
                  </span>
                  Pending Farmer Registrations
                  {pendingUsers.length > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
                      {pendingUsers.length}
                    </span>
                  )}
                </h3>
                <button onClick={fetchPendingUsers} className="text-xs text-violet-600 font-bold hover:underline flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>
              {pendingUsers.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600">All caught up!</p>
                  <p className="text-xs text-slate-400 mt-1">No pending farmer registrations at this time.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingUsers.map((pu) => (
                    <div key={pu.id} className="bg-white border border-amber-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-sm">
                          {pu.name?.[0]?.toUpperCase() || 'F'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{pu.name}</p>
                          <p className="text-xs text-slate-500">{pu.email}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Farmer</span>
                            <span className="text-[10px] text-slate-400">{pu.region}</span>
                            <span className="text-[10px] bg-amber-100 text-amber-600 font-bold px-2 py-0.5 rounded-full">⏳ Pending</span>
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
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center gap-1"
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
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: (adminStats?.total_users ?? 2).toString(), sub: `${adminStats?.farmer_count ?? 1} Farmers / ${adminStats?.admin_count ?? 1} Admins`, color: 'violet', icon: Users },
                { label: 'Total Predictions', value: (adminStats?.total_predictions ?? predictionHistory.length).toString(), sub: 'AI Forecast Runs in DB', color: 'indigo', icon: TrendingUp },
                { label: 'Farmer Accounts', value: (adminStats?.farmer_count ?? 1).toString(), sub: 'Registered Farmers in DB', color: 'emerald', icon: Tractor },
                { label: 'Active Regions', value: (adminStats?.active_regions_count ?? 5).toString(), sub: 'North, South, East, West, Central', color: 'purple', icon: Globe }
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

            {/* Registered Users Table - FARMERS ONLY */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-violet-600" />
                  Registered Farmers ({(allDbUsers.filter(u => u.role === 'farmer')).length})
                </h3>

              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 text-slate-500 font-bold">Name</th>
                      <th className="text-left py-2 px-3 text-slate-500 font-bold">Email</th>
                      <th className="text-left py-2 px-3 text-slate-500 font-bold">Region</th>
                      <th className="text-center py-2 px-3 text-slate-500 font-bold">Status</th>
                      <th className="text-center py-2 px-3 text-slate-500 font-bold">Auth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {allDbUsers.filter(u => u.role === 'farmer').map((u, i) => (
                      <tr key={i} className="hover:bg-violet-50/30 transition group">
                        <td className="py-2.5 px-3">
                          <button
                            className="font-bold text-violet-700 hover:text-violet-900 hover:underline text-left transition"
                            onClick={async () => {
                              setFarmerProfileLoading(true);
                              setFarmerProfile(null);
                              try {
                                const data = await getFarmerActivity(u.id);
                                setFarmerProfile(data);
                              } catch(e) {
                                setFarmerProfile({ farmer: u, predictions: [], farms: [], error: e.message });
                              } finally {
                                setFarmerProfileLoading(false);
                              }
                            }}
                          >
                            {u.name || u.email.split('@')[0]}
                          </button>
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
                    ))}
                    {allDbUsers.filter(u => u.role === 'farmer').length === 0 && (
                      <tr><td colSpan={5} className="py-6 text-center text-slate-400 text-xs">No farmers registered yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ── FARMER ACTIVITY PROFILE MODAL ────────────────────────────────── */}
      {(farmerProfile || farmerProfileLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    {farmerProfile?.farmer?.name || 'Farmer Profile'}
                  </h2>
                  <p className="text-xs text-slate-500">{farmerProfile?.farmer?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeleteConfirmFarmer(farmerProfile?.farmer)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold border border-rose-200 transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Farmer
                </button>
                <button onClick={() => setFarmerProfile(null)} className="p-2 hover:bg-slate-100 rounded-xl transition">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            {farmerProfileLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-slate-500 text-sm">Loading farmer activity...</span>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Profile Card */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Region', value: farmerProfile?.farmer?.region || 'North Region' },
                    { label: 'Status', value: farmerProfile?.farmer?.status || 'active' },
                    { label: 'Auth Provider', value: farmerProfile?.farmer?.auth_provider === 'google' ? 'Google SSO' : 'Email' },
                    { label: 'Total Predictions', value: farmerProfile?.prediction_count ?? 0 },
                    { label: 'Farm Parcels', value: farmerProfile?.farm_count ?? 0 },
                    { label: 'Joined', value: farmerProfile?.farmer?.created_at ? new Date(farmerProfile.farmer.created_at).toLocaleDateString('en-IN') : 'N/A' },
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Prediction History Cards */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" /> Yield Prediction History
                    <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                      {farmerProfile?.predictions?.length || 0} records
                    </span>
                  </h3>
                  {farmerProfile?.predictions?.length > 0 ? (
                    <div className="space-y-2">
                      {farmerProfile.predictions.map((p, i) => (
                        <div key={i} className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                              <Sprout className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-xs font-extrabold text-slate-800">{p.crop} — {p.season}</p>
                              <p className="text-[10px] text-slate-500">{p.region} · {p.soil_type} · {p.area_hectares} ha</p>
                            </div>
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
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Tractor className="w-4 h-4 text-amber-600" /> Registered Farm Parcels
                    <span className="ml-auto text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                      {farmerProfile?.farms?.length || 0} fields
                    </span>
                  </h3>
                  {farmerProfile?.farms?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {farmerProfile.farms.map((f, i) => (
                        <div key={i} className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4">
                          <p className="text-xs font-extrabold text-slate-800 mb-1">{f.farm_name || f.name}</p>
                          <div className="space-y-0.5 text-[10px] text-slate-500">
                            <p>📍 {f.region}</p>
                            <p>📐 {f.area_hectares} ha · {f.soil_type}</p>
                            <p>💧 {f.irrigation_type}</p>
                            {f.primary_crops?.length > 0 && (
                              <p>🌾 {f.primary_crops.join(', ')}</p>
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
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DELETE FARMER CONFIRMATION MODAL ─────────────────────────────── */}
      {deleteConfirmFarmer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-200 w-full max-w-md p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Remove Farmer</h3>
                <p className="text-xs text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
              <p className="text-xs text-slate-700">
                You are about to permanently delete <span className="font-bold text-rose-700">{deleteConfirmFarmer.name || deleteConfirmFarmer.email}</span> and <span className="font-bold">all their data</span> including:
              </p>
              <ul className="mt-2 space-y-1 text-xs text-rose-600 font-medium">
                <li>• All yield prediction records</li>
                <li>• All registered farm parcels</li>
                <li>• Their user account from MongoDB</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmFarmer(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition"
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
                    fetchPendingUsers();
                  } catch (err) {
                    alert('Failed to delete farmer: ' + (err.response?.data?.detail || err.message));
                  } finally {
                    setDeletingFarmerId(null);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition disabled:opacity-60"
              >
                {deletingFarmerId === deleteConfirmFarmer.id ? '🗑️ Removing...' : '🗑️ Yes, Remove Permanently'}
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

              <div>
                <label className="text-xs text-slate-500">Primary Crops (comma separated)</label>
                <input
                  type="text"
                  value={Array.isArray(editFarm.primary_crops) ? editFarm.primary_crops.join(', ') : editFarm.primary_crops}
                  onChange={(e) => setEditFarm({ ...editFarm, primary_crops: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 mt-1 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition text-xs shadow-sm mt-2 flex items-center justify-center gap-1.5"
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
