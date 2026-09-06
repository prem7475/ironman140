import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, ShieldCheck, Trophy, ArrowRight, Activity } from 'lucide-react';
import useStore from '../store/useStore';
import { getMockRegistrations } from '../utils/mockStorage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MyRaces = () => {
  const user = useStore(state => state.user);
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('paceforge_token');
    fetch(`${API_URL}/registrations`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async response => {
        if (!response.ok) throw new Error('Unable to load registrations from backend');
        return response.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setRegistrations(data);
        } else {
          setRegistrations(getMockRegistrations());
        }
      })
      .catch(() => {
        setRegistrations(getMockRegistrations());
      });
  }, []);

  const activeBookings = registrations.filter(r => r.status !== 'CANCELLED');
  const now = new Date();
  const upcomingRaces = activeBookings.filter(r => new Date(r.event?.date || Date.now()) >= now);
  const pastRaces = activeBookings.filter(r => new Date(r.event?.date || Date.now()) < now);

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 font-ironman max-w-6xl">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Athlete History & Passports</span>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">My <span className="text-primary">Races</span></h1>
        </div>
        <Link to="/races" className="hero-button text-xs py-3 px-6 inline-flex items-center gap-2">
          <Trophy size={15} /> Book New Race
        </Link>
      </div>

      <div className="space-y-10">
        {/* Active Bookings */}
        <section>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
              <Ticket size={20} />
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Active <span className="text-primary">Race Passes</span></h2>
          </div>

          <div className="space-y-4">
            {activeBookings.length === 0 ? (
              <div className="glass-card p-8 text-center border-none">
                <p className="text-gray-500 uppercase tracking-widest text-sm font-black mb-4">No active race passes found for {user?.name || 'this account'}.</p>
                <Link to="/races" className="hero-button inline-block text-xs py-3 px-6">Explore Upcoming Races</Link>
              </div>
            ) : (
              activeBookings.map(registration => (
                <div key={registration.registrationId} className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-none bg-gradient-to-br from-white/5 to-transparent">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-md">
                        {registration.status}
                      </span>
                      <span className="text-primary text-[10px] font-black uppercase tracking-widest">
                        {registration.category} ({registration.distance || '21 KM'})
                      </span>
                    </div>

                    <h3 className="text-2xl font-black uppercase italic mt-3 text-white">{registration.event?.title}</h3>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
                      <p className="flex items-center"><Calendar size={13} className="mr-1.5 text-primary" /> {registration.event?.date && new Date(registration.event.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                      <p className="flex items-center"><ShieldCheck size={13} className="mr-1.5 text-primary" /> BIB: {registration.bibNumber || 'Assigned at Expo'}</p>
                      <p className="text-primary font-black">ID: {registration.registrationId}</p>
                    </div>
                  </div>

                  <Link to={`/my-races/${registration.registrationId}/ticket`} className="hero-button text-center text-xs py-3 px-8 shrink-0">
                    View Digital Entry Pass
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MyRaces;
