import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, ArrowRight, Minus, Plus, CreditCard, CheckCircle2, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useStore();
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderRef, setOrderRef] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 5000 ? 0 : 250;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    const ref = `PF-ORDER-${Date.now().toString(36).toUpperCase()}`;
    setOrderRef(ref);
    setShowOrderSuccess(true);
    clearCart();
  };

  if (cart.length === 0 && !showOrderSuccess) {
    return (
      <div className="pt-32 pb-20 container mx-auto px-6 text-center font-ironman">
        <div className="max-w-md mx-auto space-y-8">
          <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center text-gray-500 mx-auto border border-white/10">
            <ShoppingBag size={48} />
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Your Bag is <span className="text-primary">Empty</span></h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Looks like you haven't added any gear yet.</p>
          <Link to="/shop" className="hero-button inline-block w-full text-xs">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 font-ironman">
      <div className="mb-12">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-3 block">Checkout</span>
        <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">Your <span className="text-primary">Gear</span> Bag</h1>
        <div className="h-1.5 w-32 bg-primary mt-4 rounded-full"></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 flex items-center space-x-6 border-none"
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-white/10">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] font-black uppercase text-primary tracking-widest mb-1">{item.category}</p>
                    <h3 className="text-xl font-black uppercase italic text-white leading-none">{item.name}</h3>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-500 hover:text-primary transition-colors p-1"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex justify-between items-center mt-6">
                  <div className="flex items-center space-x-4 bg-black/40 rounded-lg p-1.5 border border-white/5">
                    <span className="text-xs font-black italic px-2">Qty: {item.quantity}</span>
                  </div>
                  <p className="text-xl font-black italic text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </motion.div>
          ))}
          <button
            onClick={clearCart}
            className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-colors flex items-center ml-4"
          >
            Clear All Items
          </button>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-10 border-none bg-gradient-to-br from-white/5 to-transparent">
            <h3 className="text-2xl font-black uppercase italic mb-8">Summary</h3>
            <div className="space-y-4 text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-8 mb-8">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span className="text-white">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
            </div>
            <div className="flex justify-between items-baseline mb-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total</span>
              <span className="text-4xl font-black italic text-primary">₹{total.toLocaleString('en-IN')}</span>
            </div>
            <button onClick={handleCheckout} className="hero-button w-full flex items-center justify-center space-x-3 group text-xs py-4">
              <CreditCard size={18} />
              <span>Checkout Gear Order</span>
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="p-6 bg-primary/10 rounded-xl border border-primary/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary text-center">
              Athlete Exclusive: Free shipping on orders over ₹5,000
            </p>
          </div>
        </div>
      </div>

      {/* Order Success Popup */}
      <AnimatePresence>
        {showOrderSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card max-w-lg p-10 text-center relative border-primary/20 shadow-2xl">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                <CheckCircle2 className="text-primary" size={40} />
              </div>
              <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter">Order <span className="text-primary">Confirmed</span></h3>
              <p className="text-xs text-primary font-black uppercase tracking-widest mb-6">Ref: {orderRef}</p>
              <p className="text-gray-300 text-xs font-bold uppercase tracking-wider leading-relaxed mb-8">Your official PACEFORGE gear order has been confirmed and dispatched to your primary address.</p>
              <button onClick={() => setShowOrderSuccess(false)} className="hero-button w-full py-4 text-xs">Continue Shopping</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;
