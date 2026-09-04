import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  RefreshCw,
  Search,
  Sparkles,
  User,
  Mail,
  MapPin,
  Headphones,
  ShieldCheck,
  Phone,
  Calendar
} from 'lucide-react';
import {
  getAdvisorStats,
  listAdvisorInquiries,
  getInquiryThread,
  replyToInquiry,
  updateInquiryStatus
} from '../api';

export default function AdvisorDashboard({ user }) {
  const [stats, setStats] = useState({
    total_inquiries: 0,
    pending_queries: 0,
    resolved_consultations: 0,
    active_cases: 0,
    avg_response_time: '14 mins',
    active_advisors: 4
  });
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState(null);
  const [activeThread, setActiveThread] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [replyText, setReplyText] = useState('');
  const [markResolved, setMarkResolved] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const [statsRes, inqRes] = await Promise.all([
        getAdvisorStats(),
        listAdvisorInquiries(statusFilter)
      ]);
      setStats(statsRes);
      setInquiries(inqRes.inquiries || []);

      if (!selectedInquiryId && inqRes.inquiries?.length > 0) {
        setSelectedInquiryId(inqRes.inquiries[0].id);
      }
    } catch (err) {
      console.error('Advisor dashboard load error:', err);
    } finally {
      if (!isBackground) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  useEffect(() => {
    if (!selectedInquiryId) return;
    const loadThread = async () => {
      try {
        const threadData = await getInquiryThread(selectedInquiryId);
        setActiveThread(threadData);
      } catch (err) {
        console.error('Thread load error:', err);
      }
    };
    loadThread();
    const threadInterval = setInterval(loadThread, 5000);
    return () => clearInterval(threadInterval);
  }, [selectedInquiryId]);

  const handleSendReply = async (e) => {
    e?.preventDefault();
    if (!replyText.trim() || !selectedInquiryId || sending) return;

    setSending(true);
    try {
      const res = await replyToInquiry({
        inquiry_id: selectedInquiryId,
        advisor_name: user?.name || 'AgriRisk Advisor',
        content: replyText.trim(),
        mark_resolved: markResolved
      });
      setActiveThread(res.inquiry);
      setReplyText('');
      setMarkResolved(false);
      fetchData(true);
    } catch (err) {
      console.error('Reply send error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!activeThread?.id) return;
    const newStatus = activeThread.status === 'resolved' ? 'pending' : 'resolved';
    try {
      const res = await updateInquiryStatus(activeThread.id, newStatus);
      setActiveThread(res.inquiry);
      fetchData(true);
    } catch (err) {
      console.error('Status toggle error:', err);
    }
  };

  const filteredInquiries = inquiries.filter(inq => {
    if (statusFilter !== 'all' && inq.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = inq.farmer_name?.toLowerCase().includes(q);
      const matchCrop = inq.crop?.toLowerCase().includes(q);
      const matchRegion = inq.region?.toLowerCase().includes(q);
      const matchContent = inq.messages?.some(m => m.content.toLowerCase().includes(q));
      return matchName || matchCrop || matchRegion || matchContent;
    }
    return true;
  });

  // Format member since date
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : 'Recently Joined';

  return (
    <div className="animate-fadeIn space-y-6">

      {/* ── TOP: Clean Advisor Profile & Quick Metrics Header ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">

        {/* Left: Advisor Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-xs shrink-0">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black text-slate-900 leading-tight">{user?.name || 'Advisor'}</h2>
              <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-200">
                Agricultural Advisor
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user?.email || 'advisor@yieldsense.ai'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {user?.region || 'Central Region'}
              </span>
              <span>•</span>
              <span className="text-slate-400">Member since {memberSince}</span>
            </div>
          </div>
        </div>

        {/* Right: 3 Simple Metric Cards (Avg Response Time Removed) */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center min-w-[110px]">
            <p className="text-[10px] font-bold uppercase text-slate-400">Total</p>
            <p className="text-xl font-black text-slate-800">{stats.total_inquiries}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-center min-w-[110px]">
            <p className="text-[10px] font-bold uppercase text-amber-700">Awaiting Reply</p>
            <p className="text-xl font-black text-amber-800">{stats.pending_queries}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-center min-w-[110px]">
            <p className="text-[10px] font-bold uppercase text-emerald-700">Resolved</p>
            <p className="text-xl font-black text-emerald-800">{stats.resolved_consultations}</p>
          </div>
        </div>

      </div>

      {/* ── Main 2-Column Chat Workspace ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

        {/* ── Left: Farmer Inquiry Queue ── */}
        <div className="xl:col-span-5 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[680px]">

          {/* Queue Header & Filters */}
          <div className="p-4 border-b border-slate-100 space-y-3 bg-sky-50/40 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-sky-600" />
                Farmer Queries ({filteredInquiries.length})
              </h3>

              <div className="flex items-center gap-1.5">
                {/* Status Filters */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl">
                  {['all', 'pending', 'resolved'].map(st => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg transition cursor-pointer ${statusFilter === st
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setRefreshing(true); fetchData(); }}
                  className="p-1.5 bg-white hover:bg-sky-50 border border-slate-200 text-sky-700 rounded-xl transition cursor-pointer"
                  title="Refresh"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search farmer, crop, region..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-200 transition"
              />
            </div>
          </div>

          {/* Inquiry List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
                <p className="text-xs font-semibold">Loading farmer queries...</p>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 opacity-60" />
                <p className="text-xs font-semibold">No queries yet</p>
                <p className="text-[10px] text-slate-400">Incoming farmer questions will appear here</p>
              </div>
            ) : (
              filteredInquiries.map(inq => {
                const isSelected = selectedInquiryId === inq.id;
                const isPending = inq.status === 'pending';
                const lastMsg = inq.messages?.[inq.messages.length - 1];

                return (
                  <div
                    key={inq.id}
                    onClick={() => setSelectedInquiryId(inq.id)}
                    className={`p-3 rounded-2xl transition cursor-pointer border ${isSelected
                        ? 'bg-sky-50/80 border-sky-400 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-sky-200'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                          <span className="font-black text-slate-900 text-xs block">{inq.farmer_name}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{inq.crop} • {inq.region}</span>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${isPending
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                      >
                        {inq.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-2">
                      {lastMsg?.content || 'Farmer submitted an inquiry...'}
                    </p>

                    <div className="flex items-center justify-end text-[10px] text-slate-400 font-medium pt-1.5 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(inq.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right: Consultation Console ── */}
        <div className="xl:col-span-7 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[680px]">

          {activeThread ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-100 bg-sky-50/40 shrink-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">{activeThread.farmer_name}</h3>
                        <span className="text-[10px] text-slate-500 font-medium">{activeThread.farmer_email}</span>
                      </div>
                    </div>
                    {/* Clean Tags without Emoji Icons */}
                    <div className="flex items-center flex-wrap gap-1.5 mt-2 text-[10px] font-semibold text-slate-600">
                      {activeThread.crop && <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">{activeThread.crop}</span>}
                      {activeThread.region && <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full">{activeThread.region}</span>}
                      {activeThread.season && <span className="bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded-full">{activeThread.season}</span>}
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={handleToggleStatus}
                      className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full border transition cursor-pointer flex items-center gap-1 shadow-2xs ${activeThread.status === 'pending'
                          ? 'bg-amber-100 hover:bg-emerald-100 text-amber-800 hover:text-emerald-800 border-amber-300 hover:border-emerald-300'
                          : 'bg-emerald-100 hover:bg-amber-100 text-emerald-800 hover:text-amber-800 border-emerald-300 hover:border-amber-300'
                        }`}
                      title="Click to toggle Pending / Resolved"
                    >
                      {activeThread.status === 'pending' ? '⏳ Pending (Click to Resolve)' : '✅ Resolved (Click to Reopen)'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Conversation Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 overscroll-contain bg-slate-50/30">
                {activeThread.messages?.map((msg, idx) => {
                  const isFarmer = msg.sender_role === 'farmer';
                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex flex-col ${isFarmer ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-bold text-slate-600">
                          {msg.sender_name}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${isFarmer
                            ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                            : 'bg-gradient-to-br from-sky-600 to-indigo-700 text-white rounded-tr-sm'
                          }`}
                      >
                        <p className="whitespace-pre-line font-medium">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-100 bg-white shrink-0 space-y-3">
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type your agronomic recommendation for this farmer..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition resize-none leading-relaxed"
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={markResolved}
                      onChange={e => setMarkResolved(e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
                    />
                    <span className="font-semibold">Mark as Resolved</span>
                  </label>

                  <button
                    type="submit"
                    disabled={!replyText.trim() || sending}
                    className="bg-gradient-to-r from-sky-600 to-indigo-700 hover:from-sky-500 hover:to-indigo-600 disabled:opacity-40 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sending ? 'Sending...' : 'Send Reply to Farmer'}</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-sky-50 border border-sky-200 flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-sky-400" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-700">No Query Selected</p>
                <p className="text-xs text-slate-400 mt-1">Select a farmer query from the left panel to view and reply</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
