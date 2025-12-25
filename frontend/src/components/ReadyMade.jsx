// pages/ReadyMade.jsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { MoveLeft, Search, Star, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AddToCartButton from '../components/AddToCartButton';

const ReadyMade = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const imageRefs = useRef([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/brands');
        const data = response.data.brand || response.data;
        
        // Group items by brand name
        const groupedByBrand = data.reduce((acc, shoe) => {
          const brandName = shoe.brand;
          if (!acc[brandName]) acc[brandName] = { company: brandName, shoes: [] };
          acc[brandName].shoes.push({
            ...shoe,
            rating: (4 + Math.random()).toFixed(1),
          });
          return acc;
        }, {});

        setBrands(Object.values(groupedByBrand));
      } catch (error) {
        console.error("API Error:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter functionality
  const filteredBrands = useMemo(() => {
    if (!searchQuery) return brands;
    return brands.map(brand => ({
      ...brand,
      shoes: brand.shoes.filter(shoe => 
        shoe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shoe.brand.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(brand => brand.shoes.length > 0);
  }, [searchQuery, brands]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-x-hidden pt-16">
      
      {/* Background Lighting Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Responsive Sticky Header */}
      <nav className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <MoveLeft size={20} />
            </button>
            <h1 className="text-xl font-black tracking-tighter">
              READY<span className="text-blue-500">MADE.</span>
            </h1>
          </div>

          <div className="relative group w-full sm:max-w-xs md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search brand or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-blue-500/50 transition-all text-sm"
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <AnimatePresence mode="wait">
          {filteredBrands.length === 0 ? (
            <div className="text-center py-40 text-gray-500">No matching results found.</div>
          ) : (
            <div className="space-y-24">
              {filteredBrands.map((brand) => (
                <section key={brand.company}>
                  <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">{brand.company}</h2>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-500/40 to-transparent"></div>
                  </div>

                  {/* Fluid Grid System */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {brand.shoes.map((shoe) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        key={shoe.id}
                        className="group relative flex flex-col bg-[#111111] border border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all duration-500"
                      >
                        {/* Image Holder */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-[#1a1a1a]">
                          <img 
                            loading="lazy"
                            src={shoe.imageURL} 
                            alt={shoe.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          
                          <div className="absolute top-4 left-4">
                            {shoe.items_left <= 3 && (
                              <span className="bg-red-500 text-[10px] font-bold px-2.5 py-1 rounded-full">
                                {shoe.items_left} LEFT
                              </span>
                            )}
                          </div>

                          {!shoe.is_in_inventory && (
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-[2px]">
                              <span className="text-xs font-black tracking-widest border-2 border-red-500 text-red-500 px-4 py-2 rotate-[-10deg]">
                                SOLD OUT
                              </span>
                            </div>
                          )}

                          <button className="absolute top-4 right-4 p-2.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Heart size={18} />
                          </button>
                        </div>

                        {/* Info Holder */}
                        <div className="p-6 flex flex-col flex-1">
                          <div className="mb-2">
                            <h3 className="text-lg font-bold leading-tight line-clamp-1">{shoe.name}</h3>
                            <div className="flex items-center gap-1 text-yellow-500 mt-1">
                              <Star size={14} fill="currentColor" />
                              <span className="text-xs font-bold text-gray-400">{shoe.rating}</span>
                            </div>
                          </div>
                          
                          <p className="text-gray-500 text-xs uppercase tracking-widest mb-6">
                            {shoe.category} • {shoe.gender}
                          </p>

                          <div className="mt-auto">
                            <AddToCartButton product={shoe} />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ReadyMade;