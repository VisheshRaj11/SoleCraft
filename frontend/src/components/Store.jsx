import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Palette, ShoppingBag, Sparkles, MoveRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Store = () => {
  const navigate = useNavigate();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 100, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 100, damping: 30 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    x.set(clientX - innerWidth / 2);
    y.set(clientY - innerHeight / 2);
  };

  // Parallax movement for background SVGs
  const shoe1X = useTransform(mouseX, [-500, 500], [-50, 50]);
  const shoe1Y = useTransform(mouseY, [-500, 500], [-50, 50]);
  const shoe2X = useTransform(mouseX, [-500, 500], [80, -80]);
  const shoe2Y = useTransform(mouseY, [-500, 500], [80, -80]);

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans"
    >
      
      {/* --- HIGH VISIBILITY 3D BACKGROUND --- */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/20 blur-[120px] rounded-full mix-blend-screen" />

        {/* Floating Background Shoe 1 */}
        <motion.div 
          style={{ x: shoe1X, y: shoe1Y, rotate: -15 }}
          className="absolute bottom-10 left-10 text-blue-500/20"
        >
          <svg width="450" height="300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
             <path d="M3.5 13h15c.8 0 1.5.7 1.5 1.5v1c0 .8-.7 1.5-1.5 1.5H3.5c-.8 0-1.5-.7-1.5-1.5v-1c0-.8.7-1.5 1.5-1.5z" />
             <path d="M19 13c0-3.5-3-6-6.5-6H10c-3.5 0-7 2.5-7 6" />
             <path d="M11 7v2" /><path d="M15 7v2" />
          </svg>
        </motion.div>

        {/* Floating Background Shoe 2 */}
        <motion.div 
          style={{ x: shoe2X, y: shoe2Y, rotate: 15 }}
          className="absolute top-10 right-10 text-emerald-500/20"
        >
          <svg width="500" height="350" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
             <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
             <path d="M12 22V12" /><path d="M12 12l8.45-4.67" /><path d="M12 12L3.55 7.33" />
          </svg>
        </motion.div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="relative z-20 flex flex-col items-center w-full">
        
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 backdrop-blur-md text-[10px] tracking-[0.2em] font-bold text-zinc-400 mb-6 uppercase">
            <Sparkles size={14} className="text-blue-400" />
            <span>Digital Craftsmanship</span>
          </div>
          {/* REMOVED ITALIC HERE */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase">
            THE <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">STORE</span>
          </h1>
        </motion.header>

        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          
          {/* Customise Card */}
          <motion.div
            whileHover={{ y: -10 }}
            className="group relative rounded-[2.5rem] border border-zinc-800 bg-zinc-900/60 backdrop-blur-2xl p-10 flex flex-col transition-all hover:border-blue-500/50 shadow-2xl"
          >
            <div className="mb-6 h-14 w-14 flex items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Palette size={28} />
            </div>
            {/* REMOVED ITALIC HERE */}
            <h2 className="text-3xl font-bold mb-4 uppercase">Customise</h2>
            <p className="text-zinc-400 mb-8 font-medium leading-relaxed">Design a pair that tells your story. Total control over every material.</p>
            <button 
               onClick={() => navigate('/customise')}
               className="mt-auto flex items-center justify-between bg-zinc-100 text-zinc-950 px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-500 hover:text-white transition-all">
               Launch Lab <MoveRight size={18} />
            </button>
          </motion.div>

          {/* Ready Made Card */}
          <motion.div
            whileHover={{ y: -10 }}
            className="group relative rounded-[2.5rem] border border-zinc-800 bg-zinc-900/60 backdrop-blur-2xl p-10 flex flex-col transition-all hover:border-emerald-500/50 shadow-2xl"
          >
            <div className="mb-6 h-14 w-14 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShoppingBag size={28} />
            </div>
            {/* REMOVED ITALIC HERE */}
            <h2 className="text-3xl font-bold mb-4 uppercase">Ready Made</h2>
            <p className="text-zinc-400 mb-8 font-medium leading-relaxed">Precision-engineered for the street. Available for immediate shipping.</p>
            <button 
              onClick={() => navigate('/ready-made')}
              className="mt-auto flex items-center justify-between bg-zinc-100 text-zinc-950 px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-500 hover:text-white transition-all">
              Shop Drops <MoveRight size={18} />
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Store;