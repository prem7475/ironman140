import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = ({ selectedCity }) => (
  <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden font-ironman">
    <div className="absolute inset-0 z-0">
      {/* Laptop / Desktop Background */}
      <img
        src="/PACEFORGE_PREM2.png"
        alt="PACEFORGE Hero Background Desktop"
        className="w-full h-full object-cover object-center filter contrast-[1.1] brightness-[0.7] hidden sm:block"
      />
      {/* Phone / Mobile Background */}
      <img
        src="/PACEFORGE_PREM_portrait.png"
        alt="PACEFORGE Hero Background Mobile"
        className="w-full h-full object-cover object-center filter contrast-[1.1] brightness-[0.7] block sm:hidden"
      />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] translate-y-1/2"></div>
    </div>

    <div className="container mx-auto px-6 relative z-10 text-center">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-block px-4 py-1.5 mb-6 rounded-md border border-white/10 bg-white/5 backdrop-blur-md">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Forge Your Legacy</span>
      </motion.div>
      <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-6xl md:text-8xl font-black italic uppercase leading-[0.85] tracking-tighter mb-6">
        ANYTHING IS <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">POSSIBLE.</span>
      </motion.h1>
      <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto text-gray-300 text-lg md:text-xl font-medium mb-12 uppercase tracking-wide">
         The ultimate athletic ecosystem in <span className="text-white">{selectedCity === 'Select City' ? 'India' : selectedCity}</span>. Join the elite community and push your boundaries.
      </motion.p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <Link to="/events" className="hero-button">Explore Events</Link>
        <Link to="/health" className="px-8 py-3 font-black uppercase tracking-widest border-2 border-white/10 rounded-md hover:bg-white hover:text-black transition-all">Training Portal</Link>
      </div>
    </div>
  </section>
);

export default Hero;
