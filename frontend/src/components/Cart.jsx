import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import Payment from './Payment';
import axios from 'axios';
import { 
  ShoppingBag, 
  X, 
  Plus, 
  Minus, 
  Truck, 
  Shield, 
  ArrowLeft,
  ChevronRight,
  Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cart = ({ user }) => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal
  } = useCart();

  const [showPayment, setShowPayment] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const navigate = useNavigate();

  // Calculations (Subtotal assumes base price * 90 for INR conversion)
  const subtotal = getCartTotal() * 90;
  const shipping = subtotal > 5000 ? 0 : 50;
  const tax = subtotal * 0.12;
  const rawTotal = subtotal + shipping + tax;

  const handlePaymentSuccess = async (paymentData) => {
    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id || item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          // FIX: Ensure we send a valid image URL to the backend
          image: item.imageURL || item.image, 
          customization: item.customization
        })),
        totalAmount: getDiscountedTotal(),
        paymentStatus: 'completed'
      };

      const response = await axios.post('/api/orders', orderData);
      if (response.data.success) {
        clearCart();
        navigate('/order-success');
      }
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  const applyPromoCode = () => {
    const codes = { 'WELCOME10': 0.1, 'SAVE20': 0.2, 'FREESHIP': 'shipping' };
    const code = promoCode.toUpperCase();
    if (codes[code]) {
      setAppliedPromo({ code, discount: codes[code] });
    }
  };

  const getDiscountedTotal = () => {
    if (!appliedPromo) return rawTotal;
    if (appliedPromo.discount === 'shipping') return rawTotal - shipping;
    return rawTotal - (subtotal * appliedPromo.discount);
  };

  const renderCustomization = (custom) => {
    if (!custom) return null;
    if (typeof custom === 'string') return custom;
    return Object.entries(custom).map(([k, v]) => `${k}: ${v}`).join(', ');
  };

  if (showPayment) {
    return (
      <Payment
        user={user}
        cartItems={cartItems}
        onPaymentSuccess={handlePaymentSuccess}
        onClose={() => setShowPayment(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden pt-24">
      
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-black tracking-tighter uppercase">Your Bag</h1>
            </div>
            <p className="text-gray-500 font-medium">Review your items and proceed to secure checkout.</p>
          </div>
          
          {cartItems.length > 0 && (
            <button 
              onClick={clearCart}
              className="text-xs font-bold tracking-widest text-red-500 hover:text-red-400 flex items-center gap-2 uppercase border border-red-500/20 px-4 py-2 rounded-xl bg-red-500/5 transition-all"
            >
              <X size={14} /> Clear Cart
            </button>
          )}
        </header>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="popLayout">
              {cartItems.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-[#111] border border-white/5 rounded-3xl p-20 text-center"
                >
                  <Package className="w-16 h-16 text-gray-800 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold mb-2">Your bag is empty</h2>
                  <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
                  <button onClick={() => navigate('/ready-made')} className="bg-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-500 transition-all">
                    START SHOPPING
                  </button>
                </motion.div>
              ) : (
                cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="group bg-[#111] border border-white/5 rounded-3xl p-5 md:p-6 transition-all hover:border-white/10"
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* FIX: PRODUCT IMAGE SECTION HANDLING BOTH KEYS */}
                      <div className="relative w-full sm:w-32 h-40 sm:h-32 flex-shrink-0 bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/5">
                        { (item.imageURL || item.image) ? (
                          <img 
                            src={item.imageURL || item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            // Adding error handling for broken URLs
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Shoe'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-900">
                             👟
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black border border-white/10">
                          {item.quantity}X
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl font-bold tracking-tight uppercase">{item.name}</h3>
                            <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">
                                {item.brand || 'Custom Studio Edit'}
                            </p>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-red-500 transition-colors">
                            <X size={20} />
                          </button>
                        </div>

                        {item.customization && (
                          <div className="text-[10px] text-blue-400 bg-blue-500/5 border border-blue-500/10 rounded-lg p-2 mb-4 font-bold uppercase tracking-tight">
                            <span className="text-blue-200 mr-2">Config:</span>
                            {renderCustomization(item.customization)}
                          </div>
                        )}

                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center bg-black rounded-xl border border-white/5 p-1">
                            <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-2 hover:text-blue-500 transition-colors">
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:text-blue-500 transition-colors">
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="text-xl font-black text-white">₹{(item.price * item.quantity * 90).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            {cartItems.length > 0 && (
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-black tracking-widest uppercase">
                <ArrowLeft size={16} /> Continue Shopping
              </button>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-[#111] border border-white/5 rounded-3xl p-8">
                <h2 className="text-xl font-black mb-8 tracking-tighter uppercase">Order Summary</h2>
                
                <div className="space-y-4 text-xs font-bold uppercase tracking-widest mb-8">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="text-white">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-green-500" : "text-white"}>
                      {shipping === 0 ? "FREE" : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>GST (18%)</span>
                    <span className="text-white">₹{Math.round(tax).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Total</span>
                    <span className="text-3xl font-black text-blue-500">₹{Math.round(getDiscountedTotal()).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="PROMO CODE"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black focus:border-blue-500 outline-none transition-all uppercase"
                    />
                    <button onClick={applyPromoCode} className="bg-white text-black px-4 py-3 rounded-xl font-black text-[10px] hover:bg-blue-500 hover:text-white transition-all">
                      APPLY
                    </button>
                  </div>
                  <button 
                    disabled={cartItems.length === 0}
                    onClick={() => setShowPayment(true)}
                    className="w-full bg-blue-600 py-4 rounded-2xl font-black tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 disabled:bg-gray-800 disabled:text-gray-500 uppercase text-xs"
                  >
                    Checkout <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;