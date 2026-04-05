import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameInfoModal({ isOpen, onClose, gameInfo }) {
  if (!isOpen || !gameInfo) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="bg-gradient-to-br from-[#1a1f2e] to-[#0a0f1a] border border-cyan-500 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        >
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
             <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
               {gameInfo.game_name}
             </h2>
             <button onClick={onClose} className="text-gray-400 hover:text-white bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center">×</button>
          </div>
          <div className="p-6">
             <p className="text-gray-300 mb-6">{gameInfo.description}</p>
             <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-gray-700 relative shadow-inner">
               {gameInfo.video_url ? (
                 <iframe 
                   src={gameInfo.video_url} 
                   className="w-full h-full"
                   allowFullScreen 
                   title="game trailer"
                 ></iframe>
               ) : (
                 <div className="flex items-center justify-center h-full text-gray-500">No Video Available</div>
               )}
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
