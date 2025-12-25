import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Download, RefreshCw, Box, Send, CloudUpload, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Suggestion = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleDownload = async () => {
    if (!image) return;
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ShoeCreatify-${Date.now()}.png`; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download image.");
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('http://localhost:5000/api/shoe/generate-shoe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.success) setImage(data.imageUrl);
    } catch (err) {
      console.error("Failed to generate shoe", err);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Save to Backend Logic ---
  const handleSaveToGallery = async () => {
    if (!image) return;
    setIsSaving(true);
    try {
      // 1. Fetch the AI image and convert to Blob
      const response = await fetch(image);
      const blob = await response.blob();
      
      // 2. Prepare FormData (Matches your multer setup)
      const formData = new FormData();
      formData.append('image', blob, `ai-shoe-${Date.now()}.png`);
      formData.append('name', prompt.split(' ').slice(0, 3).join(' ') || "AI Concept"); // Take first 3 words of prompt as name
      formData.append('price', Math.floor(Math.random() * (300 - 150 + 1) + 150)); // Random price between 150-300
      formData.append('rating', (Math.random() * (5 - 4) + 4).toFixed(1)); // Random rating between 4.0-5.0

      // 3. Post to your backend endpoint
      const res = await axios.post('http://localhost:5000/api/custom/save-design', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Save failed", err);
      alert("Error saving design to database.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500/30 pt-16">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-12">
        <header className="flex flex-col items-center mb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
            ShoeCreatify
          </h1>
          <p className="mt-4 text-neutral-400 max-w-md text-lg">
            Turn your imagination into premium AI concepts.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="p-8 rounded-3xl border border-white/10 bg-neutral-900/50 backdrop-blur-xl shadow-2xl">
              <label className="block text-sm font-medium text-neutral-400 mb-4 uppercase tracking-wider">
                Design Prompt
              </label>
              <textarea
                rows="4"
                className="w-full bg-neutral-800 border border-white/5 rounded-2xl p-4 text-white placeholder:text-neutral-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                placeholder="e.g. Cyberpunk high-top sneakers..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              <button
                onClick={handleGenerate}
                disabled={loading || !prompt}
                className="w-full mt-6 bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors disabled:opacity-50 group"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>Generate Design</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
              
              {/* NEW SAVE BUTTON */}
              <button
                onClick={handleSaveToGallery}
                disabled={isSaving || !image}
                className={`w-full mt-3 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border transition-all duration-300 ${
                  saveSuccess 
                  ? "bg-green-500/20 border-green-500 text-green-500" 
                  : "bg-indigo-600/10 border-indigo-500/50 text-indigo-400 hover:bg-indigo-600 hover:text-white"
                } disabled:opacity-50`}
              >
                {isSaving ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : saveSuccess ? (
                  <>
                    <span>Saved to Gallery</span>
                    <CheckCircle className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Save to Cloud</span>
                    <CloudUpload className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <Box className="w-5 h-5 mx-auto mb-2 text-indigo-400" />
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-tighter">AI Optimized</span>
               </div>
               <div 
                 onClick={handleDownload} 
                 className={`p-4 rounded-2xl bg-white/5 border border-white/5 text-center cursor-pointer transition-all ${!image ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-white/10'}`}
               >
                  <Download className="w-5 h-5 mx-auto mb-2 text-purple-400" />
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-tighter">HD Export</span>
               </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 aspect-square lg:aspect-video rounded-3xl border border-white/10 bg-neutral-900/50 backdrop-blur-sm overflow-hidden relative flex items-center justify-center shadow-2xl"
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" className="flex flex-col items-center gap-4">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin" />
                  </div>
                  <p className="text-neutral-400 animate-pulse font-medium tracking-wide">Synthesizing Design...</p>
                </motion.div>
              ) : image ? (
                <motion.div key="result" className="relative group w-full h-full p-8">
                  <img src={image} alt="AI Design" className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(79,70,229,0.3)]" />
                </motion.div>
              ) : (
                <motion.div key="placeholder" className="text-center p-12">
                  <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Box className="w-10 h-10 text-neutral-600" />
                  </div>
                  <p className="text-neutral-500 text-lg max-w-xs mx-auto">Enter a prompt to begin your design journey.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Suggestion;