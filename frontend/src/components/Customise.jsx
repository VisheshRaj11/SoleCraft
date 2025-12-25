import React, { useEffect, useState, useMemo } from 'react';
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { MoveLeft, Search, Star, Heart, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AddToCartButton from '../components/AddToCartButton';

const CustomiseGallery = () => {
  const [shoes, setShoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShoes = async () => {
      try {
        const response = await axios.get('/api/custom/get-shoes');
        const data = response.data.success ? response.data.data : response.data;
        setShoes(data);
      } catch (error) {
        console.error("API Error:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchShoes();
  }, []);

  const filteredShoes = useMemo(() => {
    return shoes.filter(shoe => 
      shoe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, shoes]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-x-hidden pt-16">
      
      {/* BACKGROUND ORBS - Responsive Blur/Size */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-600/10 blur-[80px] md:blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-600/10 blur-[80px] md:blur-[120px] rounded-full"></div>
      </div>

      {/* STICKY NAV - Responsive Flex Layout */}
      <nav className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
            >
              <MoveLeft size={20} />
            </button>
            <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase">
              CUSTOM<span className="text-blue-500">GALLERY.</span>
            </h1>
          </div>

          <div className="relative group w-full sm:max-w-xs md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search designs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-blue-500/50 transition-all text-sm"
            />
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {filteredShoes.length === 0 ? (
            <div className="text-center py-40 text-gray-500 font-bold uppercase tracking-widest text-xs">
              No matching creations found.
            </div>
          ) : (
            <div className="space-y-16 md:space-y-24">
              <section>
                {/* SECTION HEADER */}
                <div className="flex items-center gap-4 mb-6 md:mb-10">
                  <h2 className="text-xl md:text-3xl font-black tracking-tighter uppercase">User Designs</h2>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-500/40 to-transparent"></div>
                </div>

                {/* FLUID GRID SYSTEM 
                    - Mobile: 1 Col
                    - XS: 2 Cols
                    - LG: 3 Cols
                    - XL: 4 Cols
                */}
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                  {filteredShoes.map((shoe) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      key={shoe._id || shoe.id}
                      className="group relative flex flex-col bg-[#111111] border border-white/5 rounded-[2rem] md:rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all duration-500"
                    >
                      {/* IMAGE HOLDER - Fixed Aspect Ratio */}
                      <div className="relative aspect-[4/5] overflow-hidden bg-[#1a1a1a]">
                        <img 
                          loading="lazy"
                          src={shoe.image} 
                          alt={shoe.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        
                        <div className="absolute top-3 left-3 md:top-4 md:left-4">
                           <span className="bg-blue-600 text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">
                             COLLECTOR
                           </span>
                        </div>

                        <button className="absolute top-3 right-3 md:top-4 md:right-4 p-2.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:text-red-500 transition-colors sm:opacity-0 group-hover:opacity-100">
                          <Heart size={18} />
                        </button>
                      </div>

                      {/* INFO SECTION */}
                      <div className="p-5 md:p-6 flex flex-col flex-1">
                        <div className="mb-2">
                          <h3 className="text-base md:text-lg font-bold leading-tight line-clamp-1 uppercase tracking-tight">
                            {shoe.name}
                          </h3>
                          <div className="flex items-center gap-1 text-yellow-500 mt-1">
                            <Star size={12} fill="currentColor" />
                            <span className="text-[10px] md:text-xs font-bold text-gray-500">
                              {shoe.rating || "5.0"}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-6">
                          Studio Custom • Limited
                        </p>

                        <div className="mt-auto">
                          <AddToCartButton product={shoe} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* FLOATING ACTION BUTTON - Responsive Positioning */}
      <motion.button
        onClick={() => navigate('/designer')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[90] bg-white text-black px-6 md:px-8 py-4 md:py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-3 border border-white/20 active:bg-gray-200"
      >
        <Palette className="w-4 h-4" />
        <span className="hidden xs:inline">Create New</span>
        <span className="xs:hidden">Design</span>
      </motion.button>
    </div>
  );
};

export default CustomiseGallery;