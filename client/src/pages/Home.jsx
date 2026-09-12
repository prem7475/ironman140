import React, { useState, useMemo, useRef } from 'react';
import useStore from '../store/useStore';
import { ALL_EVENTS } from '../constants';

// Sub-components
import Hero from '../components/Home/Hero';
import NewsIntel from '../components/Home/NewsIntel';
import CategoryFilters from '../components/Home/CategoryFilters';
import FeaturedEvents from '../components/Home/FeaturedEvents';
import OnlineConnect from '../components/Home/OnlineConnect';
import TrainingInfo from '../components/Home/TrainingInfo';
import Community from '../components/Home/Community';
import ScrollExpand from '../components/ScrollExpand';

const Home = () => {
  const { selectedCity } = useStore();

  // State for Filters
  const [activeFilter, setActiveFilter] = useState('All');
  const scrollContainerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // State for News
  const newsScrollRef = useRef(null);
  const [newsScrollPos, setNewsScrollPos] = useState(0);

  // State for Online Connect
  const [activeLobby, setActiveLobby] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lobbyData, setLobbyData] = useState({ name: '', email: '' });

  // Filter Logic
  const filteredEvents = useMemo(() => {
    let base = ALL_EVENTS;
    if (activeFilter !== 'All') {
      base = base.filter(e => e.category === activeFilter);
    }
    const city = selectedCity === 'Select City' || selectedCity === 'Detecting...' ? null : selectedCity;
    if (city) {
      const cityMatches = base.filter(e => e.location === city);
      return cityMatches.length > 0 ? cityMatches : base;
    }
    return base;
  }, [activeFilter, selectedCity]);

  const onlineEvents = useMemo(() => ALL_EVENTS.filter(e => e.type === 'Online').slice(0, 3), []);

  // Handlers
  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'right' ? scrollLeft + clientWidth / 2 : scrollLeft - clientWidth / 2;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const updateScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setScrollPosition(scrollLeft / (scrollWidth - clientWidth));
    }
  };

  const handleNewsScroll = (direction) => {
    if (newsScrollRef.current) {
      const { scrollLeft, clientWidth } = newsScrollRef.current;
      const scrollTo = direction === 'right' ? scrollLeft + clientWidth / 1.5 : scrollLeft - clientWidth / 1.5;
      newsScrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const updateNewsScrollPosition = () => {
    if (newsScrollRef.current) {
      const { scrollLeft } = newsScrollRef.current;
      setNewsScrollPos(scrollLeft);
    }
  };

  const handleJoinSession = (e) => {
    e.preventDefault();
    setShowSuccess(true);
    setActiveLobby(null);
    setLobbyData({ name: '', email: '' });
  };

  return (
    <div className="pt-20 font-ironman">
      <Hero selectedCity={selectedCity} />
      <div className="px-6 md:px-10 py-12">
        <ScrollExpand
          src="/PACEFORGE_PREM2_landscape.png"
          mobileSrc="/PACEFORGE_PREM_middle_portrait.png"
          alt="PaceForge Better Than Yesterday"
          title="Find your finish line"
        >
          <p className="text-sm md:text-base font-bold uppercase tracking-[0.2em] text-white/80">
            Real races. Serious preparation. One place to go further.
          </p>
        </ScrollExpand>
      </div>

      <NewsIntel
        newsScrollRef={newsScrollRef}
        handleNewsScroll={handleNewsScroll}
        newsScrollPos={newsScrollPos}
        updateNewsScrollPosition={updateNewsScrollPosition}
      />

      <CategoryFilters
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        scrollContainerRef={scrollContainerRef}
        handleScroll={handleScroll}
        updateScrollPosition={updateScrollPosition}
        scrollPosition={scrollPosition}
      />

      <FeaturedEvents
        selectedCity={selectedCity}
        filteredEvents={filteredEvents}
      />

      <OnlineConnect
        onlineEvents={onlineEvents}
        activeLobby={activeLobby}
        setActiveLobby={setActiveLobby}
        lobbyData={lobbyData}
        setLobbyData={setLobbyData}
        handleJoinSession={handleJoinSession}
        showSuccess={showSuccess}
        setShowSuccess={setShowSuccess}
      />

      <TrainingInfo />

      <Community />
    </div>
  );
};

export default Home;
