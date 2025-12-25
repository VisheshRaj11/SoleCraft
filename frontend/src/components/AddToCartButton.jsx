import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, CheckCircle2 } from 'lucide-react'; // Using Lucide for consistency

const AddToCartButton = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product);
    
    setTimeout(() => {
      setIsAdding(false);
    }, 1500);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`w-full relative flex items-center justify-center gap-2 
        py-3.5 md:py-4 px-4 
        rounded-2xl md:rounded-xl
        text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] 
        transition-all duration-300 shadow-lg
        ${
          isAdding
            ? 'bg-green-500 text-white shadow-green-500/20'
            : 'bg-white text-black hover:bg-gray-100'
        } ${isAdding ? 'cursor-default' : 'cursor-pointer'}`}
    >
      {isAdding ? (
        <motion.div 
          initial={{ y: 10, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          className="flex items-center gap-2"
        >
          <CheckCircle2 size={16} strokeWidth={3} />
          <span>Added to Bag</span>
        </motion.div>
      ) : (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <ShoppingCart size={14} strokeWidth={3} />
            <span>Add to Cart</span>
          </div>
          <span className="opacity-40 font-mono text-[9px] md:text-[10px]">
            ${product.price}
          </span>
        </div>
      )}

      {/* Subtle shine effect on hover */}
      {!isAdding && (
        <div className="absolute inset-0 rounded-2xl md:rounded-xl overflow-hidden pointer-events-none">
          <motion.div 
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-black/5 to-transparent skew-x-12"
          />
        </div>
      )}
    </motion.button>
  );
};

export default AddToCartButton;