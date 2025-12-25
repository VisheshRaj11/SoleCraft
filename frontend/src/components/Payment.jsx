import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ShieldCheck, CreditCard, ChevronLeft, PackageCheck, Truck } from 'lucide-react';

const Payment = ({ user, cartItems = [], onPaymentSuccess, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // --- CONVERSION & CALCULATION LOGIC ---
  const CONVERSION_RATE = 90; // 1 USD = 90 INR
  
  const { subtotal, shipping, tax, total } = useMemo(() => {
    // 1. Calculate base subtotal in USD from cart
    const subtotalUSD = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // 2. Convert to INR
    const subtotalINR = subtotalUSD * CONVERSION_RATE;
    
    // 3. Logic for Shipping (Free over ₹5000)
    const shippingINR = (subtotalINR > 5000 || subtotalINR === 0) ? 0 : 50;
    
    // 4. GST at 18%
    const taxINR = subtotalINR * 0.18;
    
    // 5. Final Integer Total for Razorpay
    const finalTotal = Math.round(subtotalINR + shippingINR + taxINR);

    return {
      subtotal: subtotalINR,
      shipping: shippingINR,
      tax: taxINR,
      total: finalTotal
    };
  }, [cartItems]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsLoading(true);
    const res = await loadRazorpay();

    if (!res) {
      alert('Razorpay SDK failed to load. Check your connection.');
      setIsLoading(false);
      return;
    }

    try {
      // Amount is sent in INR. The backend should multiply by 100 for paise.
      const orderResponse = await axios.post('/api/payment/create-order', {
        amount: total 
      });

      if (!orderResponse.data.success) throw new Error('Order creation failed');

      const { order } = orderResponse.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: order.amount, // This is already in paise from backend
        currency: "INR",
        name: "ShoeCreatify",
        description: `Payment for ${cartItems.length} items`,
        image: "/logo.png", 
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post('/api/payment/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.data.success) {
              setPaymentStatus('success');
              if (onPaymentSuccess) {
                onPaymentSuccess({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  amount: total,
                  currency: 'INR'
                });
              }
            }
          } catch (err) {
            alert('Verification failed');
          }
        },
        prefill: {
          name: user?.name || "Customer",
          email: user?.email || "",
        },
        theme: { color: "#2563eb" }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error('Payment Error:', error);
      alert('Could not initiate payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white py-12 px-4 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-3xl font-black tracking-tighter italic uppercase">Checkout</h1>
          </div>
          <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-bold tracking-widest uppercase">Encrypted</span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {paymentStatus === 'success' ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0a0a0a] border border-green-500/20 rounded-3xl p-10 text-center">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PackageCheck className="text-green-500" size={40} />
                  </div>
                  <h2 className="text-2xl font-black mb-2 uppercase italic">Payment Received</h2>
                  <p className="text-gray-500 mb-8">Your custom order is now in the crafting queue.</p>
                  <button onClick={onClose} className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all">
                    VIEW ORDER STATUS
                  </button>
                </motion.div>
              ) : (
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                      <CreditCard className="text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Secure Payment</h3>
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest">Global Gateway / Razorpay</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-black rounded-2xl border border-white/5">
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-1">Payable in INR</div>
                      <div className="text-4xl font-black text-white italic">₹{total.toLocaleString()}</div>
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={isLoading}
                      className="w-full py-5 bg-blue-600 text-white font-black text-lg rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 group"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      ) : (
                        <>COMPLETE PURCHASE <ShieldCheck size={20} /></>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Order Breakdown</h4>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal (Converted)</span>
                  <span className="font-bold">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className={shipping === 0 ? "text-green-500 font-bold" : "font-bold text-white"}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">GST (18%)</span>
                  <span className="font-bold">₹{tax.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                  <span className="text-gray-500 text-[10px] font-bold uppercase italic">Total Amount</span>
                  <span className="text-2xl font-black text-blue-500 italic">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
                <div className="flex items-center gap-3 text-[10px] text-gray-500 font-bold uppercase">
                  <Truck size={14} className="text-blue-500" />
                  <span>Verified Delivery</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-500 font-bold uppercase">
                  <ShieldCheck size={14} className="text-blue-500" />
                  <span>100% Secure Transaction</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;