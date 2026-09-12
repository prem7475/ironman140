import React from 'react';
import { motion } from 'framer-motion';

const AuthBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#050505] pointer-events-none select-none">
      {/* Laptop / Desktop Background Image (PACEFORGE_PREM2) */}
      <motion.div
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 z-0 hidden sm:block"
      >
        <img
          src="/PACEFORGE_PREM2.png"
          alt="PACEFORGE Athletic Collage Desktop"
          className="w-full h-full object-cover object-center filter contrast-[1.1] brightness-[0.85]"
          loading="eager"
        />
      </motion.div>

      {/* Phone / Mobile Background Image (PACEFORGE_PREM_portrait) */}
      <motion.div
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 z-0 block sm:hidden"
      >
        <img
          src="/PACEFORGE_PREM_portrait.png"
          alt="PACEFORGE Athletic Collage Mobile"
          className="w-full h-full object-cover object-center filter contrast-[1.1] brightness-[0.85]"
          loading="eager"
        />
      </motion.div>

      {/* Light Overlay Tint for Contrast & Vignette around Edges */}
      <div className="absolute inset-0 z-1 bg-black/35" />
      <div className="absolute inset-0 z-1 bg-gradient-to-t from-black/80 via-transparent to-black/60" />
      <div className="absolute inset-0 z-1 bg-gradient-to-r from-black/60 via-transparent to-black/60" />

      {/* Subtle Red Glow Spotlights on Edges */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[150px] z-2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[120px] z-2" />
    </div>
  );
};

export default AuthBackground;
