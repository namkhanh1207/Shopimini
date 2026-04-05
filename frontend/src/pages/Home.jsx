import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import FilterBar from '../components/FilterBar';
import ProductCard from '../components/ProductCard';
import GameInfoModal from '../components/GameInfoModal';
import api from '../api';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ game: '', rarity: '', attribute: '' });
  const [gameInfo, setGameInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products', { params: filters });
      setProducts(res.data.products);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectGame = async (gameKey) => {
    if(!gameKey) return;
    try {
      const res = await api.get(`/game-info/${gameKey}`);
      setGameInfo(res.data);
      setIsModalOpen(true);
    } catch(err) {
       console.error("Game info not found for", gameKey);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const res = await api.post('/cart/add', { productId: product.id, quantity: 1 });
      if(res.data.success) {
         window.dispatchEvent(new Event('cart_updated')); // Simple global event for badge text update
      }
    } catch(err) {
      console.error(err);
      alert('You must be running the backend on port 3000 to add items.');
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar setFilterAttribute={(attr) => setFilters(prev => ({...prev, attribute: attr}))} />
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <FilterBar filters={filters} setFilters={setFilters} onSelectGame={handleSelectGame} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
            {products.map(p => (
              <ProductCard 
                key={p.id} 
                product={p} 
                onAddToCart={handleAddToCart}
                onInfoClick={() => {
                   if(p.game) handleSelectGame(p.game);
                }} 
              />
            ))}
          </div>
          {products.length === 0 && (
             <div className="text-center text-gray-500 mt-20 text-xl font-bold">No magical items found in this realm.</div>
          )}
        </main>
      </div>
      <GameInfoModal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         gameInfo={gameInfo} 
      />
    </div>
  );
}
