import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
import { FiLogOut, FiUser, FiSettings, FiArrowRight } from 'react-icons/fi';
import shoecreatifyLogo from '../assets/logo.png';

const Navbar = ({ user, onLogout, cartCount = 0 }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/designer', label: 'Studio', requiresAuth: true },
    { path: '/suggestion', label: 'CratMan', requiresAuth: true },
    { path: '/store', label: 'Store', requiresAuth: true },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
          isScrolled
            ? 'py-3 bg-black/40 backdrop-blur-2xl border-b border-white/10 shadow-2xl'
            : 'py-6 bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex justify-between items-center">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: -10, scale: 1.1 }}
              className="relative w-10 h-10 flex items-center justify-center bg-white rounded-xl overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <img
                src={shoecreatifyLogo}
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
            </motion.div>
            <span className="text-xl font-black tracking-tighter text-white uppercase hidden sm:block">
              ShoeCreatify
            </span>
          </Link>

          {/* DESKTOP NAV - Glass Pill */}
          <div className="hidden lg:flex items-center bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-md">
            {navItems.map((item) => {
              if (item.requiresAuth && !user) return null;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-6 py-2 text-[10px] uppercase tracking-[0.2em] font-black transition-all ${
                    active ? 'text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white rounded-full"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3">
            {/* CART */}
            <Link to="/cart" className="relative p-3 bg-white/5 text-white rounded-full border border-white/10 hover:bg-white hover:text-black transition-all duration-300">
              <FaShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[9px] flex items-center justify-center rounded-full font-black animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* DESKTOP USER */}
            <div className="hidden lg:block">
              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-3 p-1 pl-4 bg-white/5 text-white rounded-full border border-white/10 hover:border-white/30 transition-all">
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {user.firstName || 'Account'}
                    </span>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {user.firstName?.charAt(0) || 'U'}
                    </div>
                  </button>

                  {/* Dropdown glass */}
                  <div className="absolute right-0 mt-3 w-64 bg-[#111]/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0">
                    <div className="p-4 border-b border-white/5 text-xs text-gray-400 font-medium truncate">
                      {user.email}
                    </div>
                    <div className="p-1 space-y-1">
                      <DropdownLink to="/profile" icon={<FiUser />} label="Profile" />
                      <DropdownLink to="/settings" icon={<FiSettings />} label="Settings" />
                      <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                      >
                        <FiLogOut /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/login">
                  <button className="bg-white text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-200 transition-all">
                    Login
                  </button>
                </Link>
              )}
            </div>

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-3 bg-white/5 text-white rounded-full border border-white/10"
            >
              <FaBars />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* MOBILE MENU - High Fidelity Dark Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xl flex justify-end"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-sm bg-[#080808] border-l border-white/10 h-full flex flex-col shadow-2xl"
            >
              <div className="p-8 flex justify-between items-center border-b border-white/5">
                <span className="font-black text-xl tracking-tighter text-white uppercase italic">ShoeCreatify</span>
                <button 
                  onClick={() => setIsMenuOpen(false)} 
                  className="p-3 bg-white/5 text-white rounded-full border border-white/10"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-10 px-8 flex flex-col">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-8">Navigation</p>
                <div className="flex flex-col gap-4">
                  {navItems.map((item, i) => {
                    if (item.requiresAuth && !user) return null;
                    const active = isActive(item.path);
                    return (
                      <motion.div 
                        key={item.path} 
                        initial={{ x: 20, opacity: 0 }} 
                        animate={{ x: 0, opacity: 1 }} 
                        transition={{ delay: i * 0.1 }}
                      >
                        <Link
                          to={item.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center justify-between group p-4 rounded-2xl border transition-all duration-300 ${
                            active 
                            ? 'bg-white text-black border-white' 
                            : 'bg-white/5 text-gray-400 border-white/5'
                          }`}
                        >
                          <span className="text-xl font-black uppercase tracking-tighter">{item.label}</span>
                          <FiArrowRight className={`transition-transform group-hover:translate-x-1 ${active ? 'opacity-100' : 'opacity-0'}`} />
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-auto pt-10">
                  {user ? (
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-purple-600 text-white rounded-2xl flex items-center justify-center text-xl font-black">
                          {user.firstName?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-black text-sm uppercase text-white truncate">{user.firstName} {user.lastName}</p>
                          <p className="text-gray-500 text-[10px] truncate">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2">
                        <MobileMenuLink to="/profile" icon={<FiUser />} label="My Profile" onClick={() => setIsMenuOpen(false)} />
                        <button
                          onClick={() => { onLogout(); setIsMenuOpen(false); }}
                          className="flex items-center justify-center gap-3 p-4 text-red-400 bg-red-500/10 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-red-500/20"
                        >
                          <FiLogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Link 
                      to="/login" 
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full bg-white text-black text-center p-3 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl"
                    >
                      Login Account
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Sub-components with glass style
const MobileMenuLink = ({ to, icon, label, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] text-gray-300 border border-white/5 transition-all"
  >
    <span className="text-blue-500">{icon}</span>
    {label}
  </Link>
);

const DropdownLink = ({ to, icon, label }) => (
  <Link to={to} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
    <span className="text-blue-500">{icon}</span> {label}
  </Link>
);

export default Navbar;