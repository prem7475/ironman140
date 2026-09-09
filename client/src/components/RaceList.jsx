import React, { useEffect, useState } from 'react';
import { Calendar, ChevronRight, MapPin, Search, Users, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import DriftWall from './DriftWall';
import { getFallbackRaces } from '../utils/fallbackRaces';
import { useSocket } from '../hooks/useSocket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const formatRacePrice = race => race.priceVerified && race.price !== null ? `₹${Number(race.price).toLocaleString('en-IN')}` : 'Official price';
export const categories = ['All', 'Marathon', 'Cycling', 'Swimming', 'Triathlon', 'Duathlon', 'IRONMAN', 'HYROX', 'Devils Circuit'];

const RaceList = ({ category = 'All' }) => {
  const selectedCity = useStore(state => state.selectedCity);
  const searchQuery = useStore(state => state.searchQuery);
  const [races, setRaces] = useState([]);
  const [activeCategory, setActiveCategory] = useState(category);

  const { socket, connected } = useSocket();

  useEffect(() => {
    setActiveCategory(category);
    const endpoint = category === 'All' ? `${API_URL}/races` : `${API_URL}/races/category/${encodeURIComponent(category)}`;
    fetch(endpoint)
      .then(async response => {
        if (!response.ok) throw new Error('Unable to load races from backend');
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) return data;
        throw new Error('No backend races found');
      })
      .then(setRaces)
      .catch(() => {
        const fallbacks = getFallbackRaces();
        const filteredFallbacks = category === 'All'
          ? fallbacks
          : fallbacks.filter(r => r.category.toLowerCase() === category.toLowerCase());
        setRaces(filteredFallbacks);
      });
  }, [category]);

  // Listen for Real-Time WebSocket Events
  useEffect(() => {
    if (!socket) return;

    socket.on('race_created', (newRace) => {
      setRaces(prev => [newRace, ...prev.filter(r => r._id !== newRace._id)]);
    });

    socket.on('race_updated', (updatedRace) => {
      setRaces(prev => prev.map(r => r._id === updatedRace._id ? updatedRace : r));
    });

    socket.on('race_deleted', ({ id }) => {
      setRaces(prev => prev.filter(r => r._id !== id));
    });

    return () => {
      socket.off('race_created');
      socket.off('race_updated');
      socket.off('race_deleted');
    };
  }, [socket]);

  const city = selectedCity === 'Select City' || selectedCity === 'Detecting...' || selectedCity === 'All Cities' ? '' : selectedCity === 'Bangalore' ? 'Bengaluru' : selectedCity;
  const query = searchQuery.trim().toLowerCase();
  const filtered = races.filter(race => (!city || race.location === city) && (!query || [race.title, race.location, race.category, race.organizer].some(value => String(value || '').toLowerCase().includes(query))));
  const wallItems = filtered.map(race => ({ image: race.imageUrl, title: race.title }));

  return (
    <div className="pt-24 pb-12 container mx-auto px-6 font-ironman">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Event Dashboard</span>
            {connected && (
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                <Radio size={12} /> WebSockets Live
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mt-1">
            Forge Your <span className="text-primary">Race</span>
          </h1>
          <div className="h-1.5 w-24 bg-primary mt-3 rounded-full" />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(item => (
            <Link
              key={item}
              to={item === 'All' ? '/races' : `/races/${item.toLowerCase().replaceAll(' ', '-')}`}
              onClick={() => setActiveCategory(item)}
              className={`px-4 py-2 rounded-md text-[9px] font-black uppercase tracking-widest transition-all border ${
                activeCategory === item ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
              }`}
            >
              {item}
            </Link>
          ))}
        </div>
      </div>

      {category !== 'All' && wallItems.length > 0 && (
        <div className="h-[320px] md:h-[420px] mb-10">
          <DriftWall items={wallItems} columns={5} tileWidth={190} tileHeight={126} gap={16} tilt={10} turn={-7} overlayColor="#080505" />
        </div>
      )}

      <div className="grid gap-8">
        {filtered.map(race => (
          <Link
            key={race._id}
            to={`/races/${race.category.toLowerCase().replaceAll(' ', '-')}/${race.slug}`}
            className="glass-card flex flex-col lg:flex-row group overflow-hidden border-none"
          >
            <div className="lg:w-2/5 h-[250px] lg:h-auto overflow-hidden">
              <img src={race.imageUrl} alt={race.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
            </div>
            <div className="p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-white/5 border border-white/10 text-white text-[10px] font-black px-3 py-1 rounded-md uppercase italic tracking-widest">{race.category}</span>
                  <span className="text-primary font-black uppercase italic tracking-widest text-[11px]">{race.status}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black uppercase italic mb-4 leading-tight group-hover:text-primary transition-colors">{race.title}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <div className="flex items-center"><Calendar size={14} className="mr-2 text-primary" />{new Date(race.date).toLocaleDateString('en-IN')}</div>
                  <div className="flex items-center"><MapPin size={14} className="mr-2 text-primary" />{race.location}</div>
                  <div className="flex items-center"><Users size={14} className="mr-2 text-primary" />{race.organizer}</div>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                <div>
                  <span className="text-[9px] font-black text-gray-500 uppercase mb-1 block">Entry Fee</span>
                  <div className="text-2xl font-black italic text-white">{formatRacePrice(race)}</div>
                </div>
                <span className="hero-button py-2.5 px-6">Register <ChevronRight size={18} className="inline ml-2" /></span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-gray-500 text-sm uppercase tracking-widest mt-8 flex items-center gap-2">
          <Search size={16} /> No races match the current filters.
        </div>
      )}
    </div>
  );
};

export default RaceList;
