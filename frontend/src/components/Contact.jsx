import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowRight, Mail, Phone, MapPin, Send, 
  CheckCircle, AlertCircle, ChevronRight,
  MessageSquare, Palette, Zap, ShoppingBag, Wrench, Star
} from 'lucide-react';

const Contact = () => {
  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    contactType: 'design'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const contactTypes = [
    { value: 'design', label: 'Design Help', icon: <Palette size={20} />, color: 'from-pink-500 to-rose-500' },
    { value: 'order', label: 'Order Issues', icon: <ShoppingBag size={20} />, color: 'from-emerald-500 to-green-500' },
    { value: 'support', label: 'Technical', icon: <Wrench size={20} />, color: 'from-purple-500 to-pink-500' },
    { value: 'feedback', label: 'Feedback', icon: <Star size={20} />, color: 'from-yellow-500 to-orange-500' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/contact/send', {
        ...formData,
        toEmail: 'ramkumar9219447537@gmail.com',
        replyTo: formData.email,
      });

      if (response.data.success) {
        setFormData({ name: '', email: '', subject: '', message: '', contactType: 'design' });
        setSubmitStatus('success');
        setTimeout(() => setSubmitStatus(null), 5000);
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openGoogleMaps = () => {
    window.open("https://goo.gl/maps/9UwvR8PJhN8tE8b49", '_blank');
  };

  const floatAnimation = {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  };

  return (
    <div className="bg-[#050505] text-white selection:bg-blue-500/30 min-h-screen overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#050505] z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-pink-900/10" />
        
        <motion.div
          style={{ opacity: opacityHero, scale: scaleHero }}
          className="relative z-20 text-center px-4 sm:px-6 max-w-5xl"
        >
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 md:mb-8">
            <span className="h-px w-8 sm:w-12 bg-white/30" />
            <span className="uppercase tracking-[0.2em] sm:tracking-[0.4em] text-[9px] sm:text-[10px] font-bold text-white/60">
              Connect With Creators
            </span>
            <span className="h-px w-8 sm:w-12 bg-white/30" />
          </div>

          <h1 className="mb-6 md:mb-8 leading-[1.1] md:leading-[0.9] tracking-tight">
            <span className="block text-4xl sm:text-6xl font-light bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
              Contact Us.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto px-4">
            Have questions about 3D shoe customization? Our design team is ready to help you build your vision.
          </p>
        </motion.div>
      </section>

      {/* MAIN CONTENT */}
      <section className="py-12 md:py-20 container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-16">
          
          {/* LEFT COLUMN - INFO CARDS */}
          <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/10 p-6 md:p-8"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 flex items-center">
                <MessageSquare className="mr-3 md:mr-4 text-blue-400" size={24} md:size={28} />
                Quick Contact
              </h2>
              
              <div className="space-y-4 md:space-y-6">
                {/* Email Card */}
                <a href="mailto:ramkumar9219447537@gmail.com" className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 p-5 md:p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
                  <motion.div animate={floatAnimation} className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
                  </motion.div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] uppercase tracking-widest text-white/50">Email</p>
                    <p className="text-base md:text-lg font-bold mt-1 truncate">ramkumar9219447537@gmail.com</p>
                  </div>
                  <ChevronRight className="hidden sm:block text-white/30 group-hover:text-blue-400 transition-colors" />
                </a>

                {/* WhatsApp Card */}
                <a href="https://wa.me/919219447537" target="_blank" rel="noopener noreferrer" className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 p-5 md:p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
                  <motion.div animate={floatAnimation} style={{ animationDelay: '0.5s' }} className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-green-500/20 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-widest text-white/50">WhatsApp</p>
                    <p className="text-base md:text-lg font-bold mt-1">+91 92194 47537</p>
                  </div>
                  <ArrowRight className="hidden sm:block text-white/30 group-hover:text-green-400 transition-colors" />
                </a>

                {/* Location Card */}
                <button onClick={openGoogleMaps} className="group w-full flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 p-5 md:p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left">
                  <motion.div animate={floatAnimation} style={{ animationDelay: '1s' }} className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-red-500/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 md:w-8 md:h-8 text-red-400" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-widest text-white/50">Studio Location</p>
                    <p className="text-base md:text-lg font-bold mt-1">LPU Campus, Punjab</p>
                  </div>
                  <ArrowRight className="hidden sm:block text-white/30 group-hover:text-red-400 transition-colors" />
                </button>
              </div>
            </motion.div>

            {/* FAQ SECTION - Moved into the side column for better layout flow on mobile */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 md:p-8"
            >
              <h3 className="text-xl md:text-2xl font-bold mb-6">Common Questions</h3>
              <div className="space-y-4">
                {[
                  { q: "Production time?", a: "Custom sneakers typically take 2-3 weeks to design and manufacture." },
                  { q: "LPU Discount?", a: "Yes, students get 20% off with a valid ID at our Block 32 studio." }
                ].map((faq, i) => (
                  <details key={i} className="group border-b border-white/10 pb-4">
                    <summary className="flex justify-between items-center cursor-pointer list-none font-semibold text-sm md:text-base group-hover:text-blue-400 transition-colors">
                      {faq.q} <span className="text-white/30 group-open:rotate-180 transition-transform">↓</span>
                    </summary>
                    <p className="mt-2 text-sm text-white/50 leading-relaxed">{faq.a}</p>
                  </details>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN - FORM */}
          <div className="order-1 lg:order-2">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/10 p-6 md:p-10 shadow-2xl"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Send Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                {/* Responsive Input Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">Your Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 transition-all outline-none" placeholder="Vishesh Raj" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 transition-all outline-none" placeholder="vishesh@example.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">Inquiry Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {contactTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, contactType: type.value }))}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${formData.contactType === type.value ? 'border-white bg-white/10' : 'border-white/5 bg-transparent hover:border-white/20'}`}
                      >
                        <span className="mb-1 text-blue-400">{type.icon}</span>
                        <span className="text-[9px] uppercase font-bold text-center leading-none">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">How can we help?</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} required rows="4" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 transition-all outline-none resize-none" placeholder="Tell us about your dream sneaker design..." />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 md:py-5 bg-white text-black font-black uppercase tracking-tighter hover:bg-gray-200 disabled:opacity-50 transition-all rounded-xl flex items-center justify-center gap-3 mt-4"
                >
                  {isSubmitting ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><Send size={18} /> Send Inquiry</>}
                </button>

                {submitStatus === 'success' && <p className="text-green-400 text-center text-sm font-bold flex items-center justify-center gap-2"><CheckCircle size={16}/> Sent Successfully!</p>}
                {submitStatus === 'error' && <p className="text-red-400 text-center text-sm font-bold flex items-center justify-center gap-2"><AlertCircle size={16}/> Failed to send. Please try again.</p>}
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MAP SECTION */}
      <section className="py-12 md:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden border border-white/10 grayscale hover:grayscale-0 transition-all duration-700 h-[300px] md:h-[450px]">
          <iframe
            title="Studio Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3410.72639912185!2d75.7027348753556!3d31.253110250165!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a5f5e9c489cf3%3A0x4049a5409d53c300!2sLovely%20Professional%20University!5e0!3m2!1sen!2sin!4v1700000000000"
            width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
          />
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-20 md:py-32 text-center px-4">
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-8">Ready to <span className="text-blue-500">Design?</span></h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/designer" className="px-10 py-5 bg-blue-600 rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition">Start Designing</Link>
          <a href="https://wa.me/919219447537" className="px-10 py-5 bg-white/5 border border-white/10 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition">Live Chat</a>
        </div>
      </section>
    </div>
  );
};

export default Contact;