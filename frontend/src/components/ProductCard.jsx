import React from 'react';
import { motion } from 'framer-motion';
import { Info, Lock } from 'lucide-react';

const rarityColors = {
  Legendary: 'from-yellow-400 to-yellow-600 border-yellow-500',
  Epic: 'from-purple-500 to-purple-700 border-purple-500',
  Rare: 'from-cyan-400 to-blue-600 border-cyan-400',
  Common: 'from-gray-400 to-gray-600 border-gray-400'
};

export default function ProductCard({ product, onAddToCart, onInfoClick }) {
  const isLocked = product.requiredLevel && product.requiredLevel > 8; // User is Level 8 simulator
  
  return (
    <motion.div 
      className={`relative rounded-3xl overflow-hidden dml-card flex flex-col`}
      whileHover={!isLocked ? { scale: 1.05, filter: 'drop-shadow(0 0 15px rgba(0,255,255,0.4))' } : {}}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div className="absolute top-0 w-full flex justify-between px-3 py-3 z-20">
         <div className={`bg-gradient-to-r ${rarityColors[product.rarity]} px-3 py-1 rounded-full text-xs font-black tracking-widest text-white shadow-xl border border-white/40 uppercase relative overflow-hidden`}>
            <span className="relative z-10">{product.rarity || 'Common'}</span>
            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-20 transform -skew-x-12 translate-x-3"></div>
         </div>
         <button onClick={() => onInfoClick(product)} className="bg-black/50 hover:bg-black/80 rounded-full p-2 text-cyan-400 border border-cyan-400/30 transition">
            <Info size={16} />
         </button>
      </div>

      <div className="relative h-48 bg-gradient-to-b from-[#111520] to-[#1e2535] flex items-center justify-center p-4">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full blur-2xl opacity-30 ${rarityColors[product.rarity]}`}></div>
        
        <motion.img 
          src={product.image || 'https://picsum.photos/200/200?random=' + product.id} 
          className="max-h-full max-w-full z-10 drop-shadow-2xl rounded-lg"
          animate={!isLocked ? { y: [0, -10, 0] } : {}}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          alt={product.name}
        />
        
        {isLocked && (
          <div className="absolute flex flex-col items-center justify-center inset-0 backdrop-blur-sm bg-black/60 z-30 text-gray-300">
             <Lock size={36} className="mb-2 text-gray-500" />
             <span className="font-bold tracking-widest uppercase text-sm">Requires Lv. {product.requiredLevel}</span>
          </div>
        )}
      </div>

      <div className="relative -mt-6 z-20 flex justify-center w-full px-4">
         <div className="bg-[#0a0f1a] w-full text-center py-2 px-3 border border-gray-600 rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
            <h3 className="text-white font-bold truncate text-sm" style={{textShadow: '0 0 5px rgba(255,255,255,0.3)'}}>{product.name}</h3>
         </div>
      </div>

      <div className="flex-1 p-4 flex flex-col justify-between z-10 pt-6">
         <div className="flex space-x-2 mb-4 justify-center">
            {product.attributes && product.attributes.map((attr, idx) => (
                <div key={idx} className="w-8 h-8 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-xs shadow-md" title={attr}>
                  {attr === 'Weapon' ? '⚔️' : attr === 'Skin' ? '👕' : attr === 'Dragon' ? '🐉' : attr === 'Material' ? '📦' : '✨'}
                </div>
            ))}
         </div>
         
         <motion.button 
            disabled={isLocked}
            whileTap={!isLocked ? { scale: 0.9, rotate: -2 } : {}}
            onClick={() => onAddToCart(product)}
            className={`w-full py-3 rounded-xl font-black text-lg tracking-wide flex justify-center items-center shadow-lg transition ${isLocked ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-400 to-green-600 hover:from-emerald-300 hover:to-green-500 text-white'}`}
         >
            <span className="mr-2">💰</span> 
            {Number(product.price).toLocaleString()} 
         </motion.button>
      </div>

    </motion.div>
  );
}
