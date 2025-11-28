import React from "react";
import { Bike, Home, ArrowRight } from "lucide-react";

// CHECK YOUR PATH: Ensure this file actually exists in this folder structure
import metashopLogo from "../../asset/Metashop_logo.svg"; 

interface LandingScreenProps {
  onModeSelect: (mode: "object" | "scene") => void;
}

const LandingScreen = ({ onModeSelect }: LandingScreenProps) => {
  return (
    // FIX: Use h-[100dvh] instead of h-screen. 
    // This fits the mobile viewport perfectly (dynamic viewport height) so no scrolling occurs.
    <div className="relative w-full h-[100dvh] bg-black text-white overflow-hidden font-sans select-none touch-none">
      
      {/* --- Background Ambience --- */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#050505] to-black pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-overlay pointer-events-none"></div>

      {/* --- Main Layout: Always Horizontal Split --- */}
      <div className="relative z-10 w-full h-full flex flex-row">
        
        {/* === LEFT SIDE: OBJECT === */}
        <button
          onClick={() => onModeSelect("object")}
          className="group relative flex-1 h-full flex flex-col items-center justify-center border-r border-white/10 active:bg-white/[0.05] transition-all duration-300 focus:outline-none"
        >
          {/* Hover Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Content Wrapper 
              FIX: Added 'pr-8 sm:pr-0' to push content slightly LEFT on mobile 
              so it doesn't get covered by the center logo. 
          */}
          <div className="relative z-10 flex flex-col items-center text-center pr-8 sm:pr-0">
            <div className="mb-3 p-3 rounded-full bg-neutral-900/50 border border-white/10 group-hover:border-emerald-500/50 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300 group-hover:scale-110">
              <Bike className="w-6 h-6 sm:w-10 sm:h-10 text-neutral-400 group-hover:text-emerald-400 transition-colors" />
            </div>
            
            <h2 className="text-sm sm:text-2xl font-bold tracking-widest text-white">OBJECT</h2>
            <span className="text-[10px] text-neutral-500 mt-1 block sm:hidden">Small Items</span>
            
            <div className="hidden sm:flex mt-4 items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-500 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <span>Enter Mode</span> <ArrowRight size={12} />
            </div>
          </div>
        </button>

        {/* === RIGHT SIDE: SCENE === */}
        <button
          onClick={() => onModeSelect("scene")}
          className="group relative flex-1 h-full flex flex-col items-center justify-center border-l border-white/10 active:bg-white/[0.05] transition-all duration-300 focus:outline-none"
        >
          {/* Hover Gradient */}
          <div className="absolute inset-0 bg-gradient-to-l from-cyan-900/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Content Wrapper 
              FIX: Added 'pl-8 sm:pl-0' to push content slightly RIGHT on mobile.
          */}
          <div className="relative z-10 flex flex-col items-center text-center pl-8 sm:pl-0">
            <div className="mb-3 p-3 rounded-full bg-neutral-900/50 border border-white/10 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-300 group-hover:scale-110">
              <Home className="w-6 h-6 sm:w-10 sm:h-10 text-neutral-400 group-hover:text-cyan-400 transition-colors" />
            </div>
            
            <h2 className="text-sm sm:text-2xl font-bold tracking-widest text-white">SCENE</h2>
            <span className="text-[10px] text-neutral-500 mt-1 block sm:hidden">Environments</span>

            <div className="hidden sm:flex mt-4 items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-500 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <span>Enter Mode</span> <ArrowRight size={12} />
            </div>
          </div>
        </button>

      </div>

      {/* === CENTER LOGO === */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center pointer-events-none">
        
        {/* Logo Circle */}
        <div className="relative bg-black border border-white/20 p-2 sm:p-5 rounded-full shadow-[0_0_50px_rgba(0,0,0,0.8)]">
           <img 
             src={metashopLogo} 
             alt="Metashop" 
             className="w-8 h-8 sm:w-16 sm:h-16 object-contain invert"
           />
        </div>

        {/* Title under logo - hidden on very small screens to save space */}
        <div className="mt-3 text-center hidden sm:block">
          <h1 className="text-2xl font-black tracking-tighter text-white">
            METASHOP
          </h1>
        </div>
      </div>

    </div>
  );
};

export default LandingScreen;