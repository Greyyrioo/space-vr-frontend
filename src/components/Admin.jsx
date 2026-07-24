import React, { useState, useEffect } from 'react';
import { adminLogin, adminLogout, getAdminBookings, confirmBooking, cancelBooking, getAdminTickets, replyTicket } from '../api';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('svr_admin_token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard Data State
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'tickets'
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [replyText, setReplyText] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'bookings') {
        const res = await getAdminBookings();
        if (res?.data?.success) setBookings(res.data.bookings || []);
      } else {
        const res = await getAdminTickets();
        if (res?.data?.success) setTickets(res.data.tickets || []);
      }
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await adminLogin({ username, password });
      if (res?.data?.success) {
        localStorage.setItem('svr_admin_token', res.data.token || 'logged_in');
        setIsAuthenticated(true);
      } else {
        setLoginError(res?.data?.error || 'Invalid credentials.');
      }
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Invalid credentials.');
    }
  };

  const handleLogout = async () => {
    try { await adminLogout(); } catch (e) {}
    localStorage.removeItem('svr_admin_token');
    setIsAuthenticated(false);
  };

  const handleConfirm = async (refId) => {
    setActionLoading(refId);
    try {
      const res = await confirmBooking(refId);
      if (res?.data?.success) fetchDashboardData();
    } catch (err) {
      alert('Failed to confirm booking.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (refId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setActionLoading(refId);
    try {
      const res = await cancelBooking(refId);
      if (res?.data?.success) fetchDashboardData();
    } catch (err) {
      alert('Failed to cancel booking.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendReply = async (ticketId) => {
    const text = replyText[ticketId];
    if (!text) return;
    setActionLoading(ticketId);
    try {
      const res = await replyTicket(ticketId, text);
      if (res?.data?.success) {
        setReplyText((prev) => ({ ...prev, [ticketId]: '' }));
        fetchDashboardData();
      }
    } catch (err) {
      alert('Failed to send reply.');
    } finally {
      setActionLoading(null);
    }
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center text-white mb-2">Space VR Admin</h2>
        <p className="text-xs text-center text-slate-400 mb-6">Enter your management credentials to proceed.</p>

        {loginError && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs text-center">
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition duration-200"
          >
            Sign In to Dashboard
          </button>
        </form>
      </div>
    );
  }

  // --- DASHBOARD SCREEN ---
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-xl font-bold text-white">Space VR Control Center</h2>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'bookings' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
          >
            Bookings Management
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'tickets' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
          >
            Support Tickets
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-300 rounded-xl text-xs font-medium transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading dashboard telemetry...</div>
      ) : activeTab === 'bookings' ? (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Incoming Sessions ({bookings.length})</h3>
            <button onClick={fetchDashboardData} className="text-xs text-cyan-400 hover:underline">Refresh List</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Zone / Time</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-500">No session bookings found.</td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.ref_id || b.id} className="hover:bg-slate-950/50">
                      <td className="p-3 font-mono text-cyan-400 font-bold">{b.ref_id || 'N/A'}</td>
                      <td className="p-3">
                        <p className="font-semibold text-white">{b.customer_name || 'Guest'}</p>
                        <p className="text-[10px] text-slate-400">{b.phone}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-white">{b.zone_name || b.zone_id}</p>
                        <p className="text-[10px] text-slate-400">{b.session_date} | {b.time_slot}</p>
                      </td>
                      <td className="p-3 font-bold text-white">₦{b.total_cost?.toLocaleString() || 0}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.status === 'confirmed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                          b.status === 'awaiting_verification' ? 'bg-amber-950 text-amber-400 border border-amber-500/30' :
                          b.status === 'cancelled' ? 'bg-red-950 text-red-400 border border-red-500/30' :
                          'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
                        }`}>
                          {b.status ? b.status.replace('_', ' ') : 'pending'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {b.status !== 'confirmed' && b.status !== 'cancelled' && (
                          <button
                            onClick={() => handleConfirm(b.ref_id)}
                            disabled={actionLoading === b.ref_id}
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-[10px] transition"
                          >
                            Approve
                          </button>
                        )}
                        {b.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancel(b.ref_id)}
                            disabled={actionLoading === b.ref_id}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-red-950 text-red-400 rounded text-[10px] transition"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Support Tickets View */
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Support Tickets ({tickets.length})</h3>
            <button onClick={fetchDashboardData} className="text-xs text-cyan-400 hover:underline">Refresh Tickets</button>
          </div>

          <div className="space-y-4">
            {tickets.length === 0 ? (
              <p className="p-6 text-center text-slate-500 text-xs">No active support tickets.</p>
            ) : (
              tickets.map((t) => (
                <div key={t.ticket_id || t.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-mono text-cyan-400 font-bold">#{t.ticket_id || 'N/A'}</span>
                      <p className="font-semibold text-white mt-1">{t.subject}</p>
                      <p className="text-[10px] text-slate-400">{t.customer_email} • {t.created_at}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.status === 'open' ? 'bg-amber-950 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                      {t.status || 'open'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg">{t.message}</p>

                  {t.reply && (
                    <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-lg text-xs text-cyan-200">
                      <span className="font-bold block text-[10px] text-cyan-400 uppercase">Admin Reply:</span>
                      {t.reply}
                    </div>
                  )}

                  {t.status === 'open' && (
                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="text"
                        placeholder="Type response..."
                        value={replyText[t.ticket_id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [t.ticket_id]: e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        onClick={() => handleSendReply(t.ticket_id)}
                        disabled={actionLoading === t.ticket_id}
                        className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition"
                      >
                        Reply
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
