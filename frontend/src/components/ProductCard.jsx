import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaCoins } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

/* ──────────────────────────────────────────────
   Hard-black text-shadow formula (game UI style)
   ──────────────────────────────────────────────*/
const HARD_SHADOW = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 3px 0 #000';
const FONT = '"Lilita One", cursive';

/* Rarity config */
const RARITY_CFG = {
  Legendary: {
    border: '#FFD700',
    shadow: '0 14px 0 #7a5a00, 0 0 35px rgba(255,215,0,0.65), 0 20px 40px rgba(0,0,0,0.55)',
    badgeBg: 'linear-gradient(160deg, #FFEA44, #FFA800, #9A6200)',
    ribbonBg: 'linear-gradient(180deg, #FFE038 0%, #FFA500 55%, #FF6600 100%)',
    glow: 'rgba(255,200,0,0.35)',
    letter: 'L',
  },
  Epic: {
    border: '#BB00FF',
    shadow: '0 14px 0 #5c0080, 0 0 30px rgba(187,0,255,0.55), 0 20px 40px rgba(0,0,0,0.55)',
    badgeBg: 'linear-gradient(160deg, #E090FF, #AA00FF, #5E0099)',
    ribbonBg: 'linear-gradient(180deg, #CC44FF 0%, #8800CC 55%, #6600AA 100%)',
    glow: 'rgba(187,0,255,0.3)',
    letter: 'E',
  },
  Rare: {
    border: '#0077FF',
    shadow: '0 14px 0 #003f99, 0 0 28px rgba(0,119,255,0.5), 0 20px 40px rgba(0,0,0,0.55)',
    badgeBg: 'linear-gradient(160deg, #7EDBFF, #0077FF, #003B9E)',
    ribbonBg: 'linear-gradient(180deg, #44AAFF 0%, #0066CC 55%, #004499 100%)',
    glow: 'rgba(0,120,255,0.3)',
    letter: 'R',
  },
  Common: {
    border: '#8AABB5',
    shadow: '0 10px 0 #3e5a62, 0 18px 30px rgba(0,0,0,0.5)',
    badgeBg: 'linear-gradient(160deg, #C8D6DC, #7A9099, #3E5560)',
    ribbonBg: 'linear-gradient(180deg, #9AB8C2 0%, #5A7880 55%, #3E5560 100%)',
    glow: 'rgba(100,150,160,0.2)',
    letter: 'C',
  },
};

const ELEMENT_PNG = {
  'Vũ khí':           '/badges/physical.png',
  'Vật lý':           '/badges/physical.png',
  Physical:            '/badges/physical.png',
  Weapon:              '/badges/physical.png',
  'Phép thuật':        '/badges/magic.png',
  Magic:               '/badges/magic.png',
  'Phòng thủ':         '/badges/defense.png',
  Defense:             '/badges/defense.png',
  'Hỗ trợ':           '/badges/support.png',
  Support:             '/badges/support.png',
  'Trợ thủ':          '/badges/support.png',
  'Tốc đánh':          '/badges/attack.png',
  Fast:                '/badges/attack.png',
  'Hút máu':           '/badges/lifesteal.png',
  Lifesteal:           '/badges/lifesteal.png',
  'Thiêu đốt':         '/badges/fire.png',
  Fire:                '/badges/fire.png',
  Ice:                 '/badges/ice.png',
  Mana:                '/badges/mana.png',
  'Máu':               '/badges/hp.png',
  HP:                  '/badges/hp.png',
  'Tốc chạy':          '/badges/speed.png',
  'Phản sát thương':   '/badges/reflect.png',
  Light:               '/badges/reflect.png',
  'Tầm nhìn':          '/badges/vision.png',
  'Đất':               '/badges/earth.png',
  'Lá chắn':           '/badges/shield.png',
  'Hồi phục':          '/badges/heal.png',
  'Giải khống':        '/badges/cc_break.png',
  'Kháng phép':        '/badges/anti_magic.png',
  Skin:                '/badges/skin.png',
  Dragon:              '/badges/dragon.png',
  Material:            '/badges/material.png',
  Explosive:           '/badges/explosive.png',
};

const ELEMENT_EMOJI = {
  'Vũ khí': '🗡️', 'Vật lý': '⚒️', 'Tốc đánh': '⚡', 'Phép thuật': '🔮',
  'Hỗ trợ': '💚', 'Phòng thủ': '🛡️', 'Kháng phép': '🧿', 'Hút máu': '🩸',
  'Thiêu đốt': '🔥', 'Tốc chạy': '👟', 'Phản sát thương': '✨', 'Mana': '💧',
  'Máu': '❤️', 'Trợ thủ': '🕊️', 'Đất': '⛰️', 'Giải khống': '🔓',
  'Lá chắn': '💠', 'Hồi phục': '🍎', 'Tầm nhìn': '👁️',
  Weapon: '🗡️', Skin: '👕', Dragon: '🐉', Material: '📦',
  Magic: '🔮', Fire: '🔥', Ice: '❄️', Lifesteal: '🩸',
  Explosive: '💥', Physical: '⚒️', Fast: '⚡', Light: '✨',
};

export default function ProductCard({ product, onAddToCart, onInfoClick }) {
  const { customer } = useAuth();
  const [buyHover, setBuyHover] = useState(false);

  const userLevel = customer ? Number(customer.level || 1) : 1;
  const isLocked = product.requiredLevel && Number(product.requiredLevel) > userLevel;
  const isLimited = product.rarity === 'Legendary';

  let attrs = [];
  try { attrs = typeof product.attributes === 'string' ? JSON.parse(product.attributes) : (product.attributes || []); }
  catch { attrs = []; }
  if (!Array.isArray(attrs)) attrs = [];
  const top3 = attrs.slice(0, 3);

  const rarity = product.rarity || 'Common';
  const cfg = RARITY_CFG[rarity] || RARITY_CFG.Common;

  const handleBuyClick = useCallback((e) => {
    if (isLocked) return;
    const btn = e.currentTarget;
    const circle = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    Object.assign(circle.style, {
      position: 'absolute', width: '20px', height: '20px', borderRadius: '50%',
      background: 'rgba(255,255,255,0.6)', pointerEvents: 'none',
      left: `${e.clientX - rect.left - 10}px`, top: `${e.clientY - rect.top - 10}px`,
      animation: 'ripple 0.6s ease-out forwards',
    });
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
    onAddToCart(product);
  }, [isLocked, onAddToCart, product]);

  const imgSrc = product.image || `https://picsum.photos/seed/${product.id + 10}/400/300`;

  return (
    <motion.article
      className="card-dml w-80 snap-center"
      style={{
        position: 'relative',
        minHeight: 380,
        border: `8px solid ${cfg.border}`,
        boxShadow: cfg.shadow,
        borderRadius: 20,
        overflow: 'visible',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
      }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, type: 'spring', stiffness: 180 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 12, zIndex: 50, pointerEvents: 'none',
        boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.35), inset 0 3px 0 rgba(255,255,255,0.5)',
      }} />

      <div className="w-full h-48 rounded-t-xl" style={{
        position: 'relative',
        flexShrink: 0,
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 30%, #2a2e45 0%, #1a1d33 45%, #0f111a 100%)',
        borderBottom: `4px solid rgba(0,0,0,0.55)`,
      }}>
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: 60,
          background: `radial-gradient(ellipse at center, ${cfg.glow}, transparent 70%)`,
          borderRadius: '50%', zIndex: 2, pointerEvents: 'none',
        }} />

        <div style={{
          position: 'absolute', top: 0, left: 0, zIndex: 10,
          width: 44, height: 52,
          display: 'grid', placeItems: 'center',
          background: cfg.badgeBg,
          borderRadius: '0 0 16px 0',
          boxShadow: '3px 3px 10px rgba(0,0,0,0.7), inset 0 2px 0 rgba(255,255,255,0.45)',
          fontFamily: FONT,
          fontSize: '1.3rem',
          color: '#fff',
          textShadow: HARD_SHADOW,
        }}>{cfg.letter}</div>

        <button
          onClick={() => onInfoClick(product)}
          style={{
            position: 'absolute', top: 12, right: 12, zIndex: 5,
            width: 34, height: 34,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 35%, #FFB830, #FF7800 50%, #CC4400)',
            border: '2px solid rgba(255,255,255,0.55)',
            color: '#fff',
            fontFamily: FONT,
            fontSize: 16,
            fontStyle: 'italic',
            cursor: 'pointer',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 -2px 0 rgba(255,255,255,0.35) inset, 0 4px 0 #7a3200, 0 6px 10px rgba(0,0,0,0.4)',
            textShadow: HARD_SHADOW,
          }}
          title="Item Details"
        >i</button>

        {isLimited && (
          <div style={{
            position: 'absolute', top: -8, right: -8, zIndex: 6,
            background: 'linear-gradient(135deg, #FF4500, #FF8C00)',
            border: '2px solid #FFD700',
            borderRadius: 20,
            padding: '3px 10px',
            fontSize: '0.62rem',
            fontFamily: FONT,
            color: '#fff',
            textShadow: HARD_SHADOW,
            boxShadow: '0 3px 8px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap',
          }}>🔥 Limited</div>
        )}

        <img
          src={imgSrc}
          alt={product.name}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            zIndex: 3,
            mixBlendMode: 'screen',
            animation: 'float 3s ease-in-out infinite',
          }}
          onError={e => { e.target.src = `https://picsum.photos/seed/${product.id}/400/300`; }}
        />

        {isLocked && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 12,
            background: 'rgba(0,0,0,0.72)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.9))' }}>🔒</span>
          </div>
        )}
      </div>

      <div style={{
        position: 'absolute', top: 175, zIndex: 15,
        width: '105%',
        left: '-2.5%',
        height: 52,
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: cfg.ribbonBg,
        clipPath: 'polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%)',
        borderTop: '3px solid rgba(0,0,0,0.4)',
        borderBottom: '3px solid rgba(0,0,0,0.4)',
        boxShadow: '0 8px 0 rgba(0,0,0,0.35), inset 0 3px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.25)',
      }}>
        <span style={{
          fontFamily: FONT,
          fontSize: '1.05rem',
          color: '#fff',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          textShadow: HARD_SHADOW,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '82%',
          display: 'block',
        }}>{product.name}</span>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '30px 12px 12px',
        background: 'linear-gradient(175deg, #1a1d2e 0%, #12152a 60%, #0c0f1e 100%)',
        borderRadius: '0 0 12px 12px',
        borderTop: '2px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
          {(top3.length ? top3 : ['Physical']).map((attr, i) => (
            <ElementBadge key={i} attr={typeof attr === 'string' ? attr : 'Physical'} />
          ))}
        </div>

        {isLocked ? (
          <div style={{
            width: '100%', minHeight: 48,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            borderRadius: '0 0 10px 10px',
            border: '3px solid #38474F',
            borderBottom: '6px solid #222C30',
            background: 'linear-gradient(180deg, #8E9BA6 0%, #6A757F 50%, #536068 100%)',
            cursor: 'not-allowed',
            fontFamily: FONT,
            fontSize: '0.9rem',
            color: '#C5D0D6',
            textShadow: HARD_SHADOW,
          }}>
            🔒 REQUIRES LV {product.requiredLevel}
          </div>
        ) : (
          <motion.button
            onMouseEnter={() => setBuyHover(true)}
            onMouseLeave={() => setBuyHover(false)}
            whileTap={{ y: 4 }}
            onClick={handleBuyClick}
            style={{
              width: '100%',
              minHeight: 48,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              borderRadius: '0 0 10px 10px',
              border: '3px solid #106300',
              borderBottom: buyHover ? '2px solid #074200' : '6px solid #074200',
              background: 'linear-gradient(180deg, #6AE030 0%, #3DBF00 50%, #279500 100%)',
              cursor: 'pointer',
              fontFamily: FONT,
              fontSize: '1.1rem',
              color: '#fff',
              textShadow: HARD_SHADOW,
              boxShadow: 'inset 0 3px 0 rgba(255,255,255,0.4)',
              transform: buyHover ? 'translateY(2px)' : 'translateY(0)',
              transition: 'all 0.08s',
              position: 'relative',
              overflow: 'hidden',
              lineHeight: 1,
            }}
          >
            <FaCoins size={20} color="#FFD700" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.7))' }} />
            <span>{Number(product.price || 0).toLocaleString('vi-VN')} đ</span>
          </motion.button>
        )}
      </div>
    </motion.article>
  );
}

function ElementBadge({ attr }) {
  const pngSrc  = ELEMENT_PNG[attr];
  const emoji   = ELEMENT_EMOJI[attr] || '✨';
  const [usePng, setUsePng] = React.useState(!!pngSrc);

  if (!pngSrc && !emoji) return null;

  return (
    <div title={attr} style={{
      width: 40, height: 40,
      borderRadius: 12,
      background: 'linear-gradient(145deg, #e8e8e8 0%, #c0c0c0 45%, #8a8a8a 100%)',
      border: '2.5px solid #C9A227',
      display: 'grid', placeItems: 'center',
      flexShrink: 0,
      boxShadow: '0 4px 8px rgba(0,0,0,0.55), inset 0 2px 0 rgba(255,255,255,0.7), inset 0 -2px 0 rgba(0,0,0,0.2)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {pngSrc && usePng ? (
        <img
          src={pngSrc}
          alt={attr}
          style={{ width: 28, height: 28, objectFit: 'contain', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))' }}
          onError={() => setUsePng(false)}
        />
      ) : (
        <span style={{ fontSize: '1.15rem', lineHeight: 1 }}>{emoji}</span>
      )}
    </div>
  );
}
