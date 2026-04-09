import React, { useState, useEffect } from 'react';
import { ShoppingCart, AlertTriangle } from 'lucide-react';
import { FaCoins } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Link } from 'react-router-dom';

const FONT = '"Lilita One", cursive';
const HARD_SHADOW = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 3px 0 #000';

export default function Header({ onOpenCart, onOpenLogin, onOpenAccount, onOpenOrders }) {
  const { customer } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const refreshBadge = async () => {
    try {
      const res = await api.get('/cart');
      setCartCount((res.data.cart || []).reduce((s, it) => s + it.quantity, 0));
    } catch { setCartCount(0); }
  };

  useEffect(() => {
    refreshBadge();
    const h = () => refreshBadge();
    window.addEventListener('cart_updated', h);
    return () => window.removeEventListener('cart_updated', h);
  }, []);

  const avatar = customer?.avatar_url || `https://api.dicebear.com/8.x/bottts/svg?seed=${customer?.id ?? 'guest'}`;

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 200,
      padding: '10px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'linear-gradient(180deg, rgba(5,10,25,0.96) 0%, rgba(10,18,40,0.92) 100%)',
      backdropFilter: 'blur(16px)',
      borderBottom: '2px solid rgba(201,162,39,0.35)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
    }}>
      {/* Left – Avatar + Level / Login button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 160 }}>
        {customer ? (
          // Logged in: avatar + name + balance chip
          <button onClick={onOpenAccount} style={{
            display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer', padding:0,
          }}>
            <div style={{ position: 'relative' }}>
              <img src={avatar} alt="Avatar" style={{
                width: 46, height: 46, borderRadius: '50%',
                border: '3px solid #FFD700', objectFit: 'cover',
                boxShadow: '0 0 0 2px rgba(255,215,0,0.3), 0 6px 12px rgba(0,0,0,0.5)',
                background: '#1a2030',
              }} />
              <div style={{
                position: 'absolute', bottom: -6, right: -10,
                background: 'linear-gradient(180deg, #0099FF, #0055CC)',
                border: '2px solid #fff', color: '#fff',
                fontFamily: FONT, fontSize: '0.6rem', padding: '2px 6px',
                borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                textShadow: HARD_SHADOW, whiteSpace: 'nowrap',
              }}>Lv {customer.level}</div>
            </div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontFamily:FONT, fontSize:'0.82rem', color:'#FFD700', textShadow:HARD_SHADOW, lineHeight:1.2 }}>
                {customer.username}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                <FaCoins size={11} color="#FFD700"/>
                <span style={{ fontFamily:'"Nunito",sans-serif', fontWeight:700, color:'rgba(255,215,0,0.8)', fontSize:'0.72rem' }}>
                  {Number(customer.balance).toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </button>
        ) : (
          // Not logged in: Login button
          <button onClick={onOpenLogin} style={{
            display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:12,
            border:'2px solid #C9A227', borderBottom:'4px solid #7a5a00',
            background:'linear-gradient(180deg,rgba(201,162,39,0.2),rgba(150,120,20,0.3))',
            color:'#FFD700', fontFamily:FONT, fontSize:'0.9rem', cursor:'pointer',
            textShadow:HARD_SHADOW,
            boxShadow:'inset 0 2px 0 rgba(255,255,255,0.15)',
          }}>
            🗝 Đăng nhập
          </button>
        )}
      </div>

      {/* Center – Logo */}
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
        <h1 style={{
          margin: 0, fontFamily: FONT,
          fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', color: '#fff', textTransform: 'uppercase',
          letterSpacing: '0.05em', lineHeight: 1,
          textShadow: '-2px -2px 0 #C9A227, 2px -2px 0 #C9A227, -2px 2px 0 #C9A227, 2px 2px 0 #C9A227, 0 5px 0 rgba(0,0,0,0.6)',
        }}>SHOP</h1>
        <p style={{ margin: 0, fontSize: '0.58rem', color: 'rgba(200,220,255,0.65)',
          letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 800,
          fontFamily: '"Nunito", sans-serif' }}>ShopiMini · Cửa hàng vật phẩm</p>
      </div>

      {/* Right – Wallet + Cart */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 160, justifyContent:'flex-end' }}>
        {/* Balance chip (always shown, shows 0 if not logged in) */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
          border: '2px solid rgba(255,215,0,0.45)', borderRadius: 999,
          padding: '5px 12px 5px 8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>
          <FaCoins size={20} color="#FFD700" style={{ flexShrink: 0, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.6))' }} />
          <span style={{ fontFamily: FONT, color: '#FFD700', fontSize: '0.95rem', textShadow: HARD_SHADOW }}>
            {customer ? Number(customer.balance).toLocaleString('vi-VN') : 0} đ
          </span>
          {/* + nạp tiền button */}
          <button onClick={customer ? onOpenAccount : onOpenLogin} style={{
            width: 22, height: 22, marginLeft: 2,
            background: 'linear-gradient(180deg, #6AE030, #279500)',
            border: '2px solid #106300', borderRadius: 6, cursor: 'pointer',
            color: '#fff', fontWeight: 900, lineHeight: 1,
            boxShadow: '0 2px 0 #074200', display: 'grid', placeItems: 'center', fontSize: '1rem',
          }}>+</button>
        </div>

        {/* Track Orders Button */}
        {customer && (
          <button onClick={onOpenOrders} style={{
            position: 'relative', width: 48, height: 48,
            background: 'linear-gradient(180deg, rgba(50,50,70,0.6), rgba(20,20,40,0.8))',
            border: '2px solid rgba(201,162,39,0.45)', borderBottom: '4px solid rgba(0,0,0,0.6)',
            borderRadius: 14, cursor: 'pointer', display: 'grid', placeItems: 'center',
            color: '#FFD700', transition: 'all 0.1s',
          }}
            onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.3)'}
            onMouseOut={e  => e.currentTarget.style.filter = ''}
            title="Track My Orders"
          >
            <span style={{ fontSize: '1.4rem' }}>📦</span>
          </button>
        )}

        {/* Cart Button */}
        <button onClick={onOpenCart} style={{
          position: 'relative', width: 48, height: 48,
          background: 'linear-gradient(180deg, rgba(201,162,39,0.35), rgba(150,120,20,0.45))',
          border: '2px solid rgba(201,162,39,0.65)', borderBottom: '4px solid rgba(100,80,0,0.7)',
          borderRadius: 14, cursor: 'pointer', display: 'grid', placeItems: 'center',
          color: '#FFD700', transition: 'transform 0.1s, filter 0.1s',
        }}
          onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.3)'}
          onMouseOut={e  => e.currentTarget.style.filter = ''}
          onMouseDown={e => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.borderBottomWidth = '1px'; }}
          onMouseUp={e   => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderBottomWidth = '4px'; }}
          title="Open Cart"
        >
          <ShoppingCart size={22} strokeWidth={2.5} />
          {cartCount > 0 && (
            <div style={{
              position: 'absolute', top: -7, right: -7,
              minWidth: 20, height: 20, borderRadius: 999,
              background: '#E63946', border: '2px solid #fff',
              color: '#fff', fontFamily: FONT, fontSize: '0.65rem',
              display: 'grid', placeItems: 'center', padding: '0 4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.4)', textShadow: HARD_SHADOW,
            }}>{cartCount}</div>
          )}
        </button>

        {/* Hidden Admin Button */}
        <Link to="/admin" style={{
          display:'grid', placeItems:'center', width: 38, height: 38, borderRadius: 12,
          background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)',
          color: '#ff4444', transition: 'all 0.2s', marginLeft: 4,
          textDecoration: 'none'
        }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,0,0,0.25)'; e.currentTarget.style.color = '#ff2222'; e.currentTarget.style.borderColor = 'rgba(255,0,0,0.5)'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,0,0,0.1)'; e.currentTarget.style.color = '#ff4444'; e.currentTarget.style.borderColor = 'rgba(255,0,0,0.2)'; }}
          title="Warning: Vault Bị Phong Ấn"
        >
          <AlertTriangle size={18} strokeWidth={2.5} />
        </Link>
      </div>
    </header>
  );
}
