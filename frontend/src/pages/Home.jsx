import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import FilterBar from '../components/FilterBar';
import ProductCard from '../components/ProductCard';
import ItemInfoModal from '../components/ItemInfoModal';
import CartModal from '../components/CartModal';
import CustomerLoginModal from '../components/CustomerLoginModal';
import AccountModal from '../components/AccountModal';
import api from '../api';

const SCROLL_AMOUNT = 300; // px per arrow click

const NAV_BTN = (dir, onClick, disabled) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      position: 'absolute', top: '50%', transform: 'translateY(-50%)',
      [dir === 'left' ? 'left' : 'right']: -18,
      zIndex: 30,
      width: 44, height: 64,
      background: disabled
        ? 'rgba(0,0,0,0.25)'
        : 'linear-gradient(180deg,rgba(201,162,39,0.5),rgba(150,120,20,0.6))',
      border: '2px solid rgba(201,162,39,0.55)',
      borderRadius: 14,
      color: disabled ? 'rgba(255,215,0,0.15)' : '#FFD700',
      cursor: disabled ? 'default' : 'pointer',
      display: 'grid', placeItems: 'center',
      boxShadow: disabled ? 'none' : '0 4px 16px rgba(0,0,0,0.5)',
      transition: 'all 0.18s',
      backdropFilter: 'blur(6px)',
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'linear-gradient(180deg,rgba(201,162,39,0.75),rgba(180,140,10,0.85))'; }}
    onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = 'linear-gradient(180deg,rgba(201,162,39,0.5),rgba(150,120,20,0.6))'; }}
  >
    {dir === 'left' ? <ChevronLeft size={26} strokeWidth={3}/> : <ChevronRight size={26} strokeWidth={3}/>}
  </button>
);

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters]   = useState({ game: '', rarity: '', name: '', attribute: '' });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen]           = useState(false);
  const [isLoginOpen, setIsLoginOpen]         = useState(false);
  const [isAccountOpen, setIsAccountOpen]     = useState(false);
  const [accountModalTab, setAccountModalTab] = useState('profile');

  // Carousel ref + scroll state
  const carouselRef = useRef(null);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  // Mouse-wheel → horizontal scroll
  const handleWheel = useCallback((e) => {
    const el = carouselRef.current;
    if (!el) return;
    // Only intercept vertical wheel on the carousel area
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
      updateScrollButtons();
    }
  }, [updateScrollButtons]);

  const scrollBy = (dir) => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'right' ? SCROLL_AMOUNT : -SCROLL_AMOUNT, behavior: 'smooth' });
    setTimeout(updateScrollButtons, 400);
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('scroll', updateScrollButtons);
    updateScrollButtons();
    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('scroll', updateScrollButtons);
    };
  }, [handleWheel, updateScrollButtons, products]);

  useEffect(() => { fetchProducts(); }, [filters]);

  const fetchProducts = async () => {
    try {
      const params = {};
      if (filters.game)      params.game      = filters.game;
      if (filters.rarity)    params.rarity    = filters.rarity;
      if (filters.attribute) params.attribute = filters.attribute;
      const res = await api.get('/products', { params });
      let list = res.data.products || [];
      if (filters.name) {
        const q = filters.name.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(q));
      }
      setProducts(list);
    } catch (err) { console.error(err); }
  };

  const handleAddToCart = async (product) => {
    if (!window.confirm(`Bạn có muốn thêm "${product.name}" vào giỏ hàng không?`)) return;
    try {
      const res = await api.post('/cart/add', { productId: product.id, quantity: 1 });
      if (res.data.success) window.dispatchEvent(new Event('cart_updated'));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Header */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenAccount={() => { setAccountModalTab('profile'); setIsAccountOpen(true); }}
        onOpenOrders={() => { setAccountModalTab('orders'); setIsAccountOpen(true); }}
      />

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* Sidebar */}
        <Sidebar
          setFilterAttribute={(attr) => setFilters(prev => ({ ...prev, attribute: attr }))}
          activeAttribute={filters.attribute}
          setGame={(game) => setFilters(prev => ({ ...prev, game }))}
          activeGame={filters.game}
        />

        {/* Main */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '20px 20px 16px', minHeight: 0 }}>

          <FilterBar filters={filters} setFilters={setFilters} />

          {/* Carousel wrapper with arrow buttons */}
          <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', alignItems: 'stretch' }}>

            {/* Left arrow */}
            {NAV_BTN('left', () => scrollBy('left'), !canScrollLeft)}

            {/* Card rail */}
            <div
              ref={carouselRef}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pt-6"
              style={{
                flex: 1,
                gap: 24,
                paddingLeft: 30,
                paddingRight: 30,
                paddingBottom: 40,
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                alignItems: 'flex-start',
              }}
            >
              {products.length === 0 ? (
                <div style={{
                  flex: '1 1 100%', textAlign: 'center', padding: '4rem 2rem',
                  fontFamily: '"Lilita One", cursive', fontSize: '1.3rem',
                  color: 'rgba(255,215,0,0.35)',
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: 12 }}>🐉</div>
                  No treasures found in this realm...
                </div>
              ) : products.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={handleAddToCart}
                  onInfoClick={(prod) => { setSelectedProduct(prod); setIsItemModalOpen(true); }}
                  onTrackOrder={() => { setAccountModalTab('orders'); setIsAccountOpen(true); }}
                />
              ))}
            </div>

            {/* Right arrow */}
            {NAV_BTN('right', () => scrollBy('right'), !canScrollRight)}
          </div>
        </main>
      </div>

      {/* Modals */}
      <ItemInfoModal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} product={selectedProduct}/>
      <CartModal     isOpen={isCartOpen}      onClose={() => setIsCartOpen(false)}/>
      <CustomerLoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)}/>
      <AccountModal      isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} initialTab={accountModalTab} />
    </div>
  );
}
