import React, { useEffect, useState } from 'react';
import { Calendar, ExternalLink, MapPin, Tag, ShieldCheck, Ticket } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useStore from '../store/useStore';
import { getFallbackRaceBySlug, getDistancePrice } from '../utils/fallbackRaces';
import { startCheckoutSession } from '../utils/checkoutSession';
import { getMockRegistrations } from '../utils/mockStorage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RaceDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const user = useStore(state => state.user);
  const [race, setRace] = useState(null);
  const [category, setCategory] = useState('');
  const [distance, setDistance] = useState('');
  const [error, setError] = useState('');
  const [existingReg, setExistingReg] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/races/${encodeURIComponent(slug)}`)
      .then(async response => {
        if (!response.ok) throw new Error('Race not found on backend');
        return response.json();
      })
      .then(data => {
        setRace(data);
        setCategory(data.category);
        setDistance(data.distances?.[0] || '');
      })
      .catch(() => {
        const fallback = getFallbackRaceBySlug(slug);
        setRace(fallback);
        setCategory(fallback.category);
        setDistance(fallback.distances?.[0] || '');
      });
  }, [slug]);

  // Check if user is already registered for this race
  useEffect(() => {
    if (!race || !user) return;
    const token = localStorage.getItem('paceforge_token');

    // Check backend registrations or local offline registrations
    fetch(`${API_URL}/registrations/my-races`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(list => {
        const found = list.find(r => (r.event?.title === race.title || r.event?._id === race._id) && r.category === category && r.status !== 'CANCELLED');
        if (found) setExistingReg(found);
      })
      .catch(() => {
        const localList = getMockRegistrations();
        const found = localList.find(r => (r.event?.title === race.title || r.event?._id === race._id) && r.category === category && r.status !== 'CANCELLED');
        if (found) setExistingReg(found);
      });
  }, [race, category, user]);

  const currentPrice = race ? getDistancePrice(race, distance) : 0;

  const register = async event => {
    event.preventDefault();
    if (!user) return navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    if (existingReg) {
      setError('You are already registered for this race category.');
      return;
    }

    const updatedRace = { ...race, price: currentPrice };
    startCheckoutSession(updatedRace, category, distance, currentPrice, user);
    navigate('/race-registration', { state: { race: updatedRace, category, distance, calculatedPrice: currentPrice } });
  };

  if (error) return <div className="pt-32 pb-20 container mx-auto px-6 text-center font-ironman"><h1 className="text-4xl font-black uppercase italic">{error}</h1><Link to="/races" className="hero-button inline-block mt-8">Back to Races</Link></div>;
  if (!race) return <div className="pt-32 pb-20 container mx-auto px-6 text-center text-gray-500 font-ironman">Loading race...</div>;

  return (
    <div className="pt-24 pb-12 container mx-auto px-6 font-ironman">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card overflow-hidden border-none">
          <div className="h-[350px] relative">
            <img src={race.imageUrl} alt={race.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex items-end p-8">
              <div>
                <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-md uppercase italic tracking-widest">{race.category}</span>
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none mt-3">{race.title}</h1>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 border-b border-white/5 pb-8">
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Date</p>
                <p className="font-bold text-sm flex items-center"><Calendar size={14} className="mr-2 text-primary" />{new Date(race.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">City</p>
                <p className="font-bold text-sm flex items-center"><MapPin size={14} className="mr-2 text-primary" />{race.location}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Selected Distance Fee</p>
                <p className="font-black text-2xl text-primary italic">₹{currentPrice.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Status</p>
                <p className="font-bold text-sm uppercase text-emerald-400">{race.status}</p>
              </div>
            </div>
            <h3 className="text-white text-xl font-black uppercase italic mb-4">Race Details</h3>
            <p className="leading-relaxed text-gray-400">{race.description}</p>
            <p className="text-gray-400 mt-6">
              <strong className="text-white">Venue:</strong> {race.venue}<br />
              <strong className="text-white">Organizer:</strong> {race.organizer}<br />
              <strong className="text-white">Available Distances:</strong> {race.distances?.join(' / ')}
            </p>
            {race.registrationUrl && (
              <a href={race.registrationUrl} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-2 mt-6 uppercase text-xs font-black">
                Official registration <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        <div className="glass-card p-8 border-t-4 border-t-primary h-fit">
          <h2 className="text-2xl font-black uppercase italic mb-6">Book Entry</h2>

          {existingReg ? (
            <div className="p-6 bg-primary/10 border border-primary/30 rounded-2xl text-center space-y-4">
              <ShieldCheck size={36} className="text-primary mx-auto" />
              <p className="text-primary text-xs font-black uppercase tracking-widest">
                You are already registered for this race!
              </p>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                Registration ID: <strong className="text-white">{existingReg.registrationId}</strong>
              </p>
              <Link to={`/my-races/${existingReg.registrationId}/ticket`} className="hero-button block w-full py-3 text-xs">
                <Ticket size={14} className="inline mr-2" /> View Digital Entry Pass
              </Link>
            </div>
          ) : (
            <form onSubmit={register} className="space-y-5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">
                Category
                <select value={category} onChange={event => setCategory(event.target.value)} className="input-hero mt-2">
                  <option value={race.category}>{race.category}</option>
                </select>
              </label>

              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">
                Select Race Distance
                <select value={distance} onChange={event => setDistance(event.target.value)} className="input-hero mt-2 py-3.5">
                  {(race.distances || []).map(item => (
                    <option key={item} value={item} className="bg-black text-white">
                      {item} — ₹{getDistancePrice(race, item).toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </label>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10 my-4">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
                  <Tag size={13} className="text-primary" /> Entry Fee ({distance || 'Standard'})
                </p>
                <p className="text-3xl font-black italic text-primary mt-1">₹{currentPrice.toLocaleString('en-IN')}</p>
              </div>

              <p className="text-gray-400 text-xs">
                Participant: <span className="text-white font-bold">{user?.name || 'Sign in to continue'}</span>
              </p>

              <button className="hero-button w-full py-4 text-xs">
                {user ? 'Confirm Booking & Reserve Slot' : 'Sign In to Book'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RaceDetail;
