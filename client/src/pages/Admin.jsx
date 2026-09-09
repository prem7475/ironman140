import React, { useEffect, useState } from 'react';
import {
  ArrowRight, DollarSign, Lock, LogOut, Mail, ShieldCheck,
  Trash2, Users, UserCheck, UserX, CalendarDays, Plus, Search,
  Trophy, ChevronRight, UserPlus, X, Edit3, Eye, ShieldAlert,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import { adminService, authService, eventService } from '../services/api';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'N/A');

const initialAddUserForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  nationality: 'Indian',
  membershipStatus: 'ACTIVE'
};

const initialRaceForm = {
  title: '',
  slug: '',
  date: '',
  location: 'Mumbai',
  venue: '',
  category: 'Marathon',
  organizer: 'PACEFORGE Official',
  price: '1200',
  description: 'Official PACEFORGE athletic endurance race event.',
  imageUrl: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=800'
};

const Admin = () => {
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);
  const logout = useStore(state => state.logout);

  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [dashboard, setDashboard] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [price, setPrice] = useState('4999');
  const [tab, setTab] = useState('users'); // 'users' | 'races' | 'registrations'
  const [userQuery, setUserQuery] = useState('');

  // Modals & UI States
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserForm, setAddUserForm] = useState(initialAddUserForm);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  const [showRaceModal, setShowRaceModal] = useState(false);
  const [editingRaceId, setEditingRaceId] = useState(null);
  const [raceForm, setRaceForm] = useState(initialRaceForm);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, regRes, eventsRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getRegistrations(),
        eventService.getEvents()
      ]);
      setDashboard(dashRes.data);
      setRegistrations(regRes.data);
      setEvents(eventsRes.data);
      if (dashRes.data?.users?.length) {
        const activeUser = dashRes.data.users.find(u => u.membershipStatus === 'ACTIVE');
        if (activeUser) setPrice(String(activeUser.membershipPrice ?? 4999));
      }
    } catch {
      // Local mock fallback for static preview / Netlify when backend API is offline
      const mockUsers = [
        { _id: 'm-1', name: 'Prem Narayani', email: 'prem@example.com', phone: '+91 9876543210', nationality: 'Indian', membershipStatus: 'ACTIVE', createdAt: new Date().toISOString() },
        { _id: 'm-2', name: 'Alex Rivera', email: 'alex@forge.com', phone: '+1 5550192834', nationality: 'American', membershipStatus: 'FREE', createdAt: new Date(Date.now() - 864000000).toISOString() },
        { _id: 'm-3', name: 'Rohan Sharma', email: 'rohan@pace.com', phone: '+91 9123456789', nationality: 'Indian', membershipStatus: 'ACTIVE', createdAt: new Date(Date.now() - 1728000000).toISOString() }
      ];
      setDashboard({
        stats: { totalUsers: mockUsers.length, paidMembers: 2, freeUsers: 1, registrations: 5 },
        users: mockUsers
      });
      setRegistrations([
        { _id: 'reg-1', user: { name: 'Prem Narayani', email: 'prem@example.com' }, event: { title: 'Mumbai Midnight Marathon' }, category: 'Marathon', amount: 1200, status: 'CONFIRMED', registrationDate: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN' && localStorage.getItem('paceforge_token')) {
      loadAdminData();
    }
  }, [user]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authService.login(credentials);
      if (response.data.user.role !== 'ADMIN') {
        throw new Error('Access denied: This account lacks administrator privileges.');
      }
      localStorage.setItem('paceforge_token', response.data.token);
      setUser(response.data.user);
    } catch (err) {
      if (!err.response) {
        // Offline admin fallback
        const adminUser = {
          id: 'admin-master',
          name: 'PaceForge Master Admin',
          email: credentials.email || 'admin@paceforge.com',
          role: 'ADMIN'
        };
        localStorage.setItem('paceforge_token', 'paceforge-admin-mock-token');
        setUser(adminUser);
        return;
      }
      setError(err.response?.data?.msg || err.message || 'Admin authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // User Management Handlers
  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      await adminService.createUser(addUserForm);
      setNotice(`User ${addUserForm.name} created successfully.`);
      setShowAddUserModal(false);
      setAddUserForm(initialAddUserForm);
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.msg || 'Unable to create user.');
    }
  };

  const handleUpdateMembership = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'FREE' : 'ACTIVE';
    setError('');
    setNotice('');
    try {
      await adminService.updateUser(userId, { membershipStatus: newStatus });
      setNotice(`Membership status set to ${newStatus}.`);
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.msg || 'Unable to update membership status.');
    }
  };

  const handleRemoveUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${name}"?`)) return;
    setError('');
    setNotice('');
    try {
      await adminService.deleteUser(userId);
      setNotice(`User ${name} deleted.`);
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.msg || 'Unable to delete user.');
    }
  };

  // Race Management Handlers
  const handleOpenAddRace = () => {
    setEditingRaceId(null);
    setRaceForm(initialRaceForm);
    setShowRaceModal(true);
  };

  const handleOpenEditRace = (race) => {
    setEditingRaceId(race._id);
    setRaceForm({
      title: race.title || '',
      slug: race.slug || '',
      date: race.date ? new Date(race.date).toISOString().slice(0, 16) : '',
      location: race.location || 'Mumbai',
      venue: race.venue || '',
      category: race.category || 'Marathon',
      organizer: race.organizer || 'PACEFORGE Official',
      price: String(race.price || 0),
      description: race.description || '',
      imageUrl: race.imageUrl || ''
    });
    setShowRaceModal(true);
  };

  const handleSaveRace = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    const slug = raceForm.slug || raceForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const payload = {
      ...raceForm,
      slug,
      date: new Date(raceForm.date).toISOString(),
      price: Number(raceForm.price || 0),
      venue: raceForm.venue || raceForm.location
    };

    try {
      if (editingRaceId) {
        await adminService.updateEvent(editingRaceId, payload);
        setNotice(`Race "${raceForm.title}" updated.`);
      } else {
        await adminService.createEvent(payload);
        setNotice(`Race "${raceForm.title}" created successfully.`);
      }
      setShowRaceModal(false);
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.msg || 'Unable to save race event.');
    }
  };

  const handleDeleteRace = async (raceId, title) => {
    if (!window.confirm(`Delete race "${title}"?`)) return;
    setError('');
    setNotice('');
    try {
      await adminService.deleteEvent(raceId);
      setNotice(`Race "${title}" deleted.`);
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.msg || 'Unable to delete race.');
    }
  };

  const handleSaveMembershipPrice = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateSettings({ membershipPrice: Number(price) });
      setNotice('Annual membership price updated.');
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.msg || 'Unable to update membership price.');
    }
  };

  // Unauthenticated Admin Login Screen
  if (user?.role !== 'ADMIN' || !localStorage.getItem('paceforge_token')) {
    return (
      <div className="pt-28 pb-16 min-h-screen flex items-center justify-center px-4 relative overflow-hidden font-ironman">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(225,6,0,0.18),transparent_45%),#050505]" />
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg relative z-10">
          <div className="glass-card p-8 md:p-14 border-none shadow-2xl">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                <ShieldCheck size={28} className="text-white" />
              </div>
              <div>
                <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">PaceForge Control</p>
                <h1 className="text-3xl font-black uppercase italic tracking-tighter">Admin Login</h1>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-md text-primary text-[11px] font-black uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-6">
              <button
                type="button"
                onClick={() => setCredentials({ email: 'admin@paceforge.com', password: 'adminpassword123' })}
                className="w-full py-2.5 bg-white/5 border border-white/10 hover:border-primary/40 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary transition-all flex items-center justify-center gap-2"
              >
                <Zap size={14} /> Auto-Fill Demo Admin Credentials
              </button>

              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">
                Admin Email
                <div className="relative mt-2">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input
                    type="email"
                    required
                    className="input-hero pl-12 py-4"
                    placeholder="admin@paceforge.com"
                    value={credentials.email}
                    onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                  />
                </div>
              </label>

              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">
                Password
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input
                    type="password"
                    required
                    className="input-hero pl-12 py-4"
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                  />
                </div>
              </label>

              <button disabled={loading} className="hero-button w-full py-4 text-sm disabled:opacity-50">
                {loading ? 'Authenticating...' : (
                  <span className="flex items-center justify-center">
                    Enter Control Room <ArrowRight className="ml-2" size={18} />
                  </span>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // Dashboard Stats & Lists
  const stats = dashboard?.stats || { totalUsers: 0, paidMembers: 0, freeUsers: 0, registrations: 0 };
  const allUsers = dashboard?.users || [];
  const filteredUsers = allUsers.filter(u => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q) ||
      (u.nationality || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="pt-28 pb-16 min-h-screen px-4 md:px-8 max-w-7xl mx-auto font-ironman">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10">
        <div>
          <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">PaceForge Master Control</p>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
            Admin <span className="text-primary">Dashboard</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-colors bg-white/5"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </div>

      {/* Notices */}
      {error && (
        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary text-[11px] font-black uppercase tracking-widest">
          {error}
        </div>
      )}
      {notice && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-[11px] font-black uppercase tracking-widest flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-emerald-400 hover:text-white"><X size={14} /></button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          [Users, 'Total Athletes', stats.totalUsers],
          [UserCheck, 'Premium Members', stats.paidMembers],
          [UserX, 'Free Tier', stats.freeUsers],
          [CalendarDays, 'Registrations', stats.registrations]
        ].map(([Icon, label, value]) => (
          <div key={label} className="glass-card p-6 border-none">
            <Icon className="text-primary mb-4" size={24} />
            <p className="text-4xl font-black italic">{value}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Settings Bar */}
      <div className="glass-card p-6 md:p-8 mb-8 border-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Global Pricing Control</p>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Annual Forger Membership</h2>
          </div>
          <form onSubmit={handleSaveMembershipPrice} className="flex gap-2">
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
              <input
                type="number"
                min="0"
                required
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="input-hero pl-9 py-3 w-40"
              />
            </div>
            <button className="hero-button px-5 py-3 text-[10px]">Update Price</button>
          </form>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-4 border-b border-white/10 mb-8 pb-1">
        <button
          onClick={() => setTab('users')}
          className={`pb-3 text-xs font-black uppercase tracking-widest transition-all ${
            tab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-white'
          }`}
        >
          Athletes ({filteredUsers.length})
        </button>
        <button
          onClick={() => setTab('races')}
          className={`pb-3 text-xs font-black uppercase tracking-widest transition-all ${
            tab === 'races' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-white'
          }`}
        >
          Race Control ({events.length})
        </button>
        <button
          onClick={() => setTab('registrations')}
          className={`pb-3 text-xs font-black uppercase tracking-widest transition-all ${
            tab === 'registrations' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-white'
          }`}
        >
          Bookings ({registrations.length})
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {tab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                value={userQuery}
                onChange={e => setUserQuery(e.target.value)}
                placeholder="SEARCH ATHLETES BY NAME, EMAIL, PHONE..."
                className="input-hero pl-11 py-3 text-xs"
              />
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="hero-button py-3 px-6 text-[10px] flex items-center gap-2 w-full md:w-auto justify-center"
            >
              <UserPlus size={16} /> Add Athlete Account
            </button>
          </div>

          <div className="space-y-3">
            {filteredUsers.map(member => (
              <div key={member._id} className="glass-card p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-none">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-black uppercase italic text-lg">{member.name}</p>
                    <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                      member.membershipStatus === 'ACTIVE' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-gray-400 border border-white/10'
                    }`}>
                      {member.membershipStatus === 'ACTIVE' ? 'Premium Forger' : 'Free Account'}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-2 mt-3 text-xs text-gray-400">
                    <p>Email: <strong className="text-white">{member.email}</strong></p>
                    <p>Phone: <strong className="text-white">{member.phone || 'N/A'}</strong></p>
                    <p>Nationality: <strong className="text-white">{member.nationality || 'N/A'}</strong></p>
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">
                    Joined: {formatDate(member.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedUserDetail(member)}
                    className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                  >
                    <Eye size={14} /> Details
                  </button>

                  <button
                    onClick={() => handleUpdateMembership(member._id, member.membershipStatus)}
                    className={`px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      member.membershipStatus === 'ACTIVE'
                        ? 'border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white'
                        : 'border-primary/40 text-primary hover:bg-primary hover:text-white'
                    }`}
                  >
                    {member.membershipStatus === 'ACTIVE' ? 'Downgrade to Free' : 'Upgrade Premium'}
                  </button>

                  <button
                    onClick={() => handleRemoveUser(member._id, member.name)}
                    className="p-2 bg-white/5 border border-white/10 hover:border-primary hover:bg-primary/20 text-gray-400 hover:text-primary rounded-xl transition-all"
                    title="Remove user"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <p className="text-gray-500 uppercase tracking-widest text-sm py-8 text-center">No athletes match your filter.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RACE / EVENT MANAGEMENT */}
      {tab === 'races' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Event & Race Control</h2>
            <button onClick={handleOpenAddRace} className="hero-button py-3 px-6 text-[10px] flex items-center gap-2">
              <Plus size={16} /> Create New Race
            </button>
          </div>

          <div className="grid gap-4">
            {events.map(item => (
              <div key={item._id} className="glass-card p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-none">
                <div className="flex items-start gap-4">
                  <img src={item.imageUrl} alt={item.title} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-primary/20 text-primary text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase italic tracking-widest">
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-500 uppercase font-black">{item.status}</span>
                    </div>
                    <h3 className="text-xl font-black uppercase italic mt-1">{item.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {item.location} ({item.venue}) · Fee: <strong className="text-white">₹{item.price || 0}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenEditRace(item)}
                    className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-primary hover:border-primary text-gray-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRace(item._id, item.title)}
                    className="p-2.5 bg-white/5 border border-white/10 hover:border-primary hover:bg-primary/20 text-gray-400 hover:text-primary rounded-xl transition-all"
                    title="Delete race"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {events.length === 0 && (
              <p className="text-gray-500 text-sm uppercase tracking-widest py-8 text-center">No races created yet.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: REGISTRATIONS */}
      {tab === 'registrations' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Race Registrations & Bookings</h2>
          {registrations.map(registration => (
            <div key={registration._id} className="glass-card p-6 border-none">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <p className="font-black uppercase italic text-lg">{registration.user?.name || registration.participant?.name || 'Athlete'}</p>
                  <p className="text-xs text-gray-400">{registration.user?.email || registration.participant?.email}</p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg w-fit">
                  {registration.status}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400">
                <div><p className="text-[9px] font-black uppercase text-gray-500">Race Event</p><p className="font-bold text-white mt-1">{registration.event?.title || 'Race'}</p></div>
                <div><p className="text-[9px] font-black uppercase text-gray-500">Category / Distance</p><p className="font-bold text-white mt-1">{registration.category} ({registration.distance || '21 KM'})</p></div>
                <div><p className="text-[9px] font-black uppercase text-gray-500">Registration ID</p><p className="font-bold text-primary mt-1">{registration.registrationId}</p></div>
                <div><p className="text-[9px] font-black uppercase text-gray-500">Fee Paid</p><p className="font-bold text-white mt-1">₹{registration.amount || 0}</p></div>
              </div>
            </div>
          ))}

          {registrations.length === 0 && (
            <p className="text-gray-500 text-sm uppercase tracking-widest py-8 text-center">No race bookings found.</p>
          )}
        </div>
      )}

      {/* MODAL 1: ADD ATHLETE */}
      <AnimatePresence>
        {showAddUserModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card max-w-lg w-full p-8 relative border-white/15">
              <button onClick={() => setShowAddUserModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white"><X size={20} /></button>
              <h3 className="text-2xl font-black uppercase italic mb-6">Add Athlete Account</h3>
              <form onSubmit={handleAddUser} className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Full Name<input type="text" required value={addUserForm.name} onChange={e => setAddUserForm({ ...addUserForm, name: e.target.value })} className="input-hero mt-1 py-3" placeholder="JOHN DOE" /></label>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Email Address<input type="email" required value={addUserForm.email} onChange={e => setAddUserForm({ ...addUserForm, email: e.target.value })} className="input-hero mt-1 py-3" placeholder="ATHLETE@PACEFORGE.COM" /></label>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Password<input type="password" required value={addUserForm.password} onChange={e => setAddUserForm({ ...addUserForm, password: e.target.value })} className="input-hero mt-1 py-3" placeholder="••••••••" /></label>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Phone Number<input type="tel" value={addUserForm.phone} onChange={e => setAddUserForm({ ...addUserForm, phone: e.target.value })} className="input-hero mt-1 py-3" placeholder="+91 9876543210" /></label>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Membership Tier<select value={addUserForm.membershipStatus} onChange={e => setAddUserForm({ ...addUserForm, membershipStatus: e.target.value })} className="input-hero mt-1 py-3"><option value="ACTIVE" className="bg-black">ACTIVE (PREMIUM FORGER)</option><option value="FREE" className="bg-black">FREE TIER</option></select></label>
                <button className="hero-button w-full mt-4 py-4 text-xs">Create Athlete Account</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: USER DETAILS DRAWER */}
      <AnimatePresence>
        {selectedUserDetail && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card max-w-xl w-full p-8 relative border-white/15">
              <button onClick={() => setSelectedUserDetail(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white"><X size={20} /></button>
              <h3 className="text-2xl font-black uppercase italic mb-1">{selectedUserDetail.name}</h3>
              <p className="text-xs text-primary font-black uppercase tracking-widest mb-6">Athlete Profile Intel</p>

              <div className="space-y-4 text-xs text-gray-300">
                <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl">
                  <div><p className="text-[9px] text-gray-500 uppercase tracking-widest">Email</p><p className="font-bold text-white mt-1">{selectedUserDetail.email}</p></div>
                  <div><p className="text-[9px] text-gray-500 uppercase tracking-widest">Phone</p><p className="font-bold text-white mt-1">{selectedUserDetail.phone || 'N/A'}</p></div>
                  <div><p className="text-[9px] text-gray-500 uppercase tracking-widest">Nationality</p><p className="font-bold text-white mt-1">{selectedUserDetail.nationality || 'N/A'}</p></div>
                  <div><p className="text-[9px] text-gray-500 uppercase tracking-widest">Membership Status</p><p className="font-bold text-primary mt-1">{selectedUserDetail.membershipStatus}</p></div>
                </div>

                <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-1.5"><ShieldAlert size={14} /> Security & Privacy Notice</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider leading-relaxed">Individual athlete wallet balances and transaction records are encrypted and hidden from administrative view for user privacy.</p>
                </div>
              </div>

              <button onClick={() => setSelectedUserDetail(null)} className="hero-button w-full mt-6 py-3 text-xs">Close Profile</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 3: CREATE / EDIT RACE */}
      <AnimatePresence>
        {showRaceModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card max-w-2xl w-full p-8 relative border-white/15 max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowRaceModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white"><X size={20} /></button>
              <h3 className="text-2xl font-black uppercase italic mb-6">{editingRaceId ? 'Edit Race Event' : 'Create New Race'}</h3>

              <form onSubmit={handleSaveRace} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Race Title<input type="text" required value={raceForm.title} onChange={e => setRaceForm({ ...raceForm, title: e.target.value })} className="input-hero mt-1 py-3" placeholder="MUMBAI MIDNIGHT MARATHON" /></label>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">URL Slug<input type="text" value={raceForm.slug} onChange={e => setRaceForm({ ...raceForm, slug: e.target.value })} className="input-hero mt-1 py-3" placeholder="mumbai-midnight-marathon" /></label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Date & Time<input type="datetime-local" required value={raceForm.date} onChange={e => setRaceForm({ ...raceForm, date: e.target.value })} className="input-hero mt-1 py-3" /></label>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Entry Fee (INR)<input type="number" min="0" required value={raceForm.price} onChange={e => setRaceForm({ ...raceForm, price: e.target.value })} className="input-hero mt-1 py-3" placeholder="1200" /></label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">City Location<input type="text" required value={raceForm.location} onChange={e => setRaceForm({ ...raceForm, location: e.target.value })} className="input-hero mt-1 py-3" placeholder="Mumbai" /></label>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Venue Arena<input type="text" value={raceForm.venue} onChange={e => setRaceForm({ ...raceForm, venue: e.target.value })} className="input-hero mt-1 py-3" placeholder="Bandra Fort Arena" /></label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Category<select value={raceForm.category} onChange={e => setRaceForm({ ...raceForm, category: e.target.value })} className="input-hero mt-1 py-3">{['Marathon', 'Cycling', 'Swimming', 'Triathlon', 'Duathlon', 'IRONMAN', 'HYROX', 'Devils Circuit'].map(c => <option key={c} value={c} className="bg-black">{c}</option>)}</select></label>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Organizer<input type="text" value={raceForm.organizer} onChange={e => setRaceForm({ ...raceForm, organizer: e.target.value })} className="input-hero mt-1 py-3" placeholder="PACEFORGE Official" /></label>
                </div>

                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Banner Image URL<input type="url" value={raceForm.imageUrl} onChange={e => setRaceForm({ ...raceForm, imageUrl: e.target.value })} className="input-hero mt-1 py-3" placeholder="https://images.unsplash.com/..." /></label>

                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Description<textarea value={raceForm.description} onChange={e => setRaceForm({ ...raceForm, description: e.target.value })} className="input-hero mt-1 py-3 h-24" placeholder="Race overview and intel..."></textarea></label>

                <button className="hero-button w-full mt-4 py-4 text-xs">{editingRaceId ? 'Save Race Changes' : 'Create Race Event'}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
