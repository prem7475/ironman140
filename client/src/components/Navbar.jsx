import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { User as UserIcon, LogIn, MapPin, ChevronDown, LogOut, Search, ShoppingBag, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { CITIES } from '../constants';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const searchRef = useRef(null);
  const { user, logout, selectedCity, setSelectedCity, cart, searchQuery, setSearchQuery } = useStore();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Events', path: '/events' },
    ...(user?.role === 'ADMIN' ? [{ name: 'Admin Races', path: '/admin/events' }] : []),
    { name: 'Training', path: '/health' },
    { name: 'Wallet', path: user ? '/wallet' : '/login?redirect=/wallet' },
    ...(user?.membershipStatus !== 'ACTIVE' ? [{ name: 'Become a Forger', path: '/membership' }] : []),
    { name: 'Results', path: user ? '/profile' : '/login?redirect=/profile' },
    { name: 'Shop', path: '/shop' },
  ];

  // Track scroll position to convert Navbar into floating landscape notch
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle outside click for search bar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchBar(false);
      }
    };
    if (showSearchBar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearchBar]);

  const handleLocationDetect = () => {
    setSelectedCity('Detecting...');
    setTimeout(() => {
      setSelectedCity('Mumbai');
      setShowCityDropdown(false);
    }, 1200);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowMobileMenu(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSearchBar(false);
  };

  return (
    <header
      className={`fixed left-0 w-full z-[100] transition-all duration-500 font-ironman ${
        scrolled ? 'top-3 px-3 sm:px-6' : 'top-0 px-0'
      }`}
    >
      <div
        className={`mx-auto transition-all duration-500 relative ${
          scrolled
            ? 'max-w-7xl rounded-full bg-black/60 backdrop-blur-2xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(225,6,0,0.2)] before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:pointer-events-none'
            : 'w-full bg-black/80 backdrop-blur-xl border-b border-white/10'
        }`}
      >
        {/* Top Accent Line (When at top of page) */}
        {!scrolled && <div className="bg-primary h-1 w-full"></div>}

        <div
          className={`container mx-auto flex justify-between items-center transition-all duration-500 ${
            scrolled ? 'h-14 sm:h-16 px-4 sm:px-8' : 'h-20 px-6'
          }`}
        >
          {/* Logo Brand */}
          <Link
            to="/"
            className="flex items-center space-x-3 group shrink-0 z-10"
            onClick={() => setShowMobileMenu(false)}
          >
            <img
              src="/logo.png"
              alt="PaceForge Logo"
              className="h-8 sm:h-10 w-auto group-hover:scale-110 transition-transform duration-300"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic">
              PACE<span className="text-primary">FORGE</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center space-x-7 z-10">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `nav-link text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${
                    isActive ? 'text-primary active' : 'text-gray-200 hover:text-primary'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3 sm:space-x-5 z-10">
            {/* City Selector */}
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 hover:border-primary/50 transition-all text-white"
              >
                <MapPin size={12} className="text-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest">{selectedCity}</span>
                <ChevronDown size={10} className={`transition-transform duration-300 ${showCityDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showCityDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full mt-2 right-0 w-48 bg-black/90 backdrop-blur-2xl border border-white/15 rounded-2xl overflow-hidden shadow-2xl z-[120]"
                  >
                    <button
                      type="button"
                      onClick={handleLocationDetect}
                      className="w-full text-left px-4 py-2.5 text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-colors flex items-center space-x-2 text-white"
                    >
                      <MapPin size={10} />
                      <span>Auto Detect</span>
                    </button>
                    <div className="border-t border-white/10 my-1"></div>
                    {CITIES.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => { setSelectedCity(city); setShowCityDropdown(false); }}
                        className="w-full text-left px-4 py-2 text-[9px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
                      >
                        {city}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search Toggle */}
            <button
              type="button"
              aria-label="Search"
              onClick={() => setShowSearchBar(!showSearchBar)}
              className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <Search size={18} />
            </button>

            {/* Cart Button */}
            <Link
              to="/cart"
              id="cart-icon"
              className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors relative"
            >
              <ShoppingBag size={18} />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-[8px] font-black flex items-center justify-center rounded-full text-white shadow-md">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </Link>

            {/* User Profile / Login (Desktop) */}
            <div className="hidden xl:block">
              {user ? (
                <div className="flex items-center space-x-3 border-l border-white/15 pl-4">
                  <Link to="/profile" className="flex items-center space-x-2 group">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center group-hover:scale-105 transition-all shadow-lg shadow-primary/30 overflow-hidden border border-white/10">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={16} className="text-white" />
                      )}
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Sign Out"
                    className="text-gray-400 hover:text-primary transition-colors p-1"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] bg-white text-black px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-all shadow-md"
                >
                  <LogIn size={13} />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              aria-label="Toggle navigation menu"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="xl:hidden flex items-center justify-center p-2 sm:p-2.5 rounded-full text-white hover:bg-white/10 active:scale-95 transition-all focus:outline-none shrink-0"
            >
              {showMobileMenu ? <X size={22} className="text-primary" /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Floating Search Overlay Bar */}
        <AnimatePresence>
          {showSearchBar && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="absolute top-full left-0 w-full mt-2 bg-black/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl z-[110] overflow-hidden"
            >
              <div className="p-4 sm:p-6" ref={searchRef}>
                <form onSubmit={handleSearch} className="w-full relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="SEARCH FOR EVENTS, TRAINING, OR GEAR..."
                    className="w-full bg-white/5 border border-white/15 focus:border-primary py-3.5 pl-12 pr-10 text-base sm:text-xl font-black uppercase italic outline-none transition-all rounded-xl text-white placeholder:text-gray-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  )}
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Dropdown Menu Overlay */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`absolute left-0 right-0 z-[120] overflow-hidden ${
                scrolled
                  ? 'top-full mt-3 mx-auto w-full max-w-lg bg-black/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)]'
                  : 'top-full w-full bg-black/95 backdrop-blur-2xl border-b border-white/10 p-6 shadow-2xl'
              }`}
            >
              <div className="flex flex-col space-y-6 max-h-[75vh] overflow-y-auto scrollbar-hide">
                {/* Mobile Nav Links */}
                <div className="flex flex-col space-y-4">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setShowMobileMenu(false)}
                      className={({ isActive }) =>
                        `text-xl sm:text-2xl font-black uppercase italic tracking-widest transition-colors py-1 ${
                          isActive ? 'text-primary' : 'text-gray-200 hover:text-primary'
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </div>

                <div className="h-px bg-white/10 my-2"></div>

                {/* Mobile City Selector: Auto Detect + Clean Dropdown */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Current Base</p>
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={handleLocationDetect}
                      className="w-full flex items-center justify-center space-x-2 bg-primary/10 border border-primary/25 py-3.5 rounded-xl text-primary font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all"
                    >
                      <MapPin size={14} />
                      <span>Auto Detect Location</span>
                    </button>

                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                      <select
                        value={selectedCity}
                        onChange={(e) => {
                          setSelectedCity(e.target.value);
                          setShowMobileMenu(false);
                        }}
                        className="w-full bg-black/60 border border-white/15 rounded-xl pl-11 pr-10 py-3.5 text-xs font-black uppercase tracking-widest text-white appearance-none cursor-pointer focus:border-primary transition-all"
                      >
                        <option value="Select City" className="bg-black text-white" disabled>Select Location</option>
                        {CITIES.map((city) => (
                          <option key={city} value={city} className="bg-black text-white">{city}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-white/10 my-2"></div>

                {/* Mobile User Actions */}
                <div>
                  {user ? (
                    <div className="space-y-3">
                      <Link
                        to="/profile"
                        onClick={() => setShowMobileMenu(false)}
                        className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-primary/40 transition-all"
                      >
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-md overflow-hidden border border-white/10">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon size={20} className="text-white" />
                          )}
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-black uppercase italic leading-none text-white truncate">{user.name}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-primary mt-1">View Athlete Profile</p>
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full py-3.5 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-primary transition-colors flex items-center justify-center space-x-2 bg-white/5 rounded-xl border border-white/10"
                      >
                        <LogOut size={15} />
                        <span>Terminate Session</span>
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setShowMobileMenu(false)}
                      className="hero-button w-full flex items-center justify-center py-4 text-sm rounded-2xl"
                    >
                      <LogIn size={16} className="mr-2" />
                      Sign In to Forge
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Navbar;
