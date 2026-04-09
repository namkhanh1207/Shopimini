import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const FONT = '"Lilita One", cursive';
const HARD_SHADOW = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 2px 0 #000';

const RARITY_COLOR = {
  Legendary: '#FFD700', Epic: '#BB00FF', Rare: '#0077FF', Common: '#8AABB5',
};

export default function ItemInfoModal({ isOpen, onClose, product }) {
  const [activeTab, setActiveTab] = useState('INFO');

  if (!product) return null;

  const rarity      = product.rarity || 'Common';
  const rarityColor = RARITY_COLOR[rarity] || '#8AABB5';

  // Parse description – "stats - passives - active" separated by " - "
  const parts        = (product.description || '').split(' - ');
  const statsPart    = parts[0] || '';
  const passivesPart = parts[1] || '';
  const activePart   = parts[2] || '';

  // Parse stats array if available
  let statsArr = [];
  try { statsArr = typeof product.stats === 'string' ? JSON.parse(product.stats) : (product.stats || []); }
  catch { statsArr = []; }
  let passivesArr = [];
  try { passivesArr = typeof product.passives === 'string' ? JSON.parse(product.passives) : (product.passives || []); }
  catch { passivesArr = []; }

  const imgSrc = product.image || `https://picsum.photos/seed/${product.id}/300/300`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,15,0.82)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            initial={{ scale: 0.85, y: 40, opacity: 0 }}
            animate={{ scale: 1,    y: 0,  opacity: 1 }}
            exit={{   scale: 0.85, y: 40,  opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            style={{
              position: 'relative', zIndex: 10,
              width: '100%', maxWidth: 680,
              background: 'linear-gradient(160deg, #0e1728 0%, #09111f 100%)',
              border: `4px solid ${rarityColor}`,
              borderRadius: 24,
              boxShadow: `0 0 0 2px rgba(255,255,255,0.08), 0 0 40px ${rarityColor}55, 0 30px 80px rgba(0,0,0,0.7)`,
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              maxHeight: '90vh',
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: 12, right: 12, zIndex: 20,
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(180deg, #FF5E5E, #CC0000)',
                border: '2px solid #800000', color: '#fff',
                display: 'grid', placeItems: 'center', cursor: 'pointer',
                boxShadow: '0 4px 0 #660000',
                fontFamily: FONT, fontSize: 16,
              }}
            ><X size={16} strokeWidth={3} /></button>

            {/* ── TOP HALF: Image + Name ── */}
            <div style={{
              display: 'flex', gap: 20, padding: '24px 24px 16px',
              alignItems: 'flex-start',
            }}>
              {/* Product image — left column */}
              <div style={{
                width: 160, height: 160, flexShrink: 0,
                borderRadius: 16,
                border: `3px solid ${rarityColor}`,
                background: 'radial-gradient(circle at 50% 30%, #2a2e45, #0f111a)',
                overflow: 'hidden',
                boxShadow: `0 0 20px ${rarityColor}44, 0 8px 20px rgba(0,0,0,0.5)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <img
                  src={imgSrc}
                  alt={product.name}
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: 'center',
                    mixBlendMode: 'screen',
                  }}
                  onError={e => { e.target.src = `https://picsum.photos/seed/${product.id}/300/300`; }}
                />
              </div>

              {/* Right: name, game, rarity badge */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Rarity pill */}
                <div style={{
                  display: 'inline-block',
                  padding: '3px 14px',
                  borderRadius: 999,
                  border: `2px solid ${rarityColor}`,
                  color: rarityColor,
                  fontFamily: FONT,
                  fontSize: '0.8rem',
                  textShadow: HARD_SHADOW,
                  marginBottom: 8,
                  background: `${rarityColor}22`,
                  letterSpacing: '0.06em',
                }}>{rarity.toUpperCase()}</div>

                {/* Item name */}
                <h2 style={{
                  margin: '0 0 6px',
                  fontFamily: FONT,
                  fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
                  color: '#fff',
                  textShadow: HARD_SHADOW,
                  lineHeight: 1.2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  paddingRight: 40,  /* avoid clipping under X button */
                }}>{product.name}</h2>

                {/* Game source */}
                <p style={{
                  margin: '0 0 12px',
                  fontFamily: '"Nunito", sans-serif',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  color: 'rgba(200,200,200,0.65)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}>{product.game || '—'}</p>

                {/* Price */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '6px 14px',
                  background: 'rgba(255,215,0,0.1)',
                  border: '2px solid rgba(255,215,0,0.35)',
                  borderRadius: 12,
                }}>
                  <span style={{ fontSize: '1.1rem' }}>🪙</span>
                  <span style={{ fontFamily: FONT, color: '#FFD700', textShadow: HARD_SHADOW, fontSize: '1.05rem' }}>
                    {Number(product.price || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>

            {/* ── TABS BAR ── */}
            <div style={{
              display: 'flex',
              borderTop: '2px solid rgba(255,255,255,0.07)',
              borderBottom: '2px solid rgba(255,255,255,0.07)',
              background: 'rgba(0,0,0,0.3)',
              flexShrink: 0,
            }}>
              {['INFO', 'STATS'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    border: 'none',
                    background: activeTab === tab
                      ? `linear-gradient(180deg, ${rarityColor}33, transparent)`
                      : 'transparent',
                    borderBottom: activeTab === tab ? `3px solid ${rarityColor}` : '3px solid transparent',
                    color: activeTab === tab ? rarityColor : 'rgba(200,200,200,0.5)',
                    fontFamily: FONT,
                    fontSize: '1rem',
                    textShadow: HARD_SHADOW,
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                    transition: 'color 0.15s, border-color 0.15s',
                  }}
                >{tab}</button>
              ))}
            </div>

            {/* ── TAB CONTENT ── */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '20px 24px',
            }} className="dml-scroll">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: activeTab === 'INFO' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {/* ─ INFO tab ─ */}
                  {activeTab === 'INFO' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {product.description ? (
                        <p style={{
                          fontFamily: '"Nunito", sans-serif', fontWeight: 700,
                          color: 'rgba(220,210,185,0.9)', lineHeight: 1.65, fontSize: '0.92rem',
                        }}>{product.description}</p>
                      ) : (
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: '"Nunito",sans-serif', fontStyle: 'italic' }}>
                          No description available.
                        </p>
                      )}

                      {/* Active skill if present */}
                      {(activePart || product.activeSkill) && (
                        <div style={{
                          padding: '12px 14px', borderRadius: 12,
                          background: 'rgba(255,150,0,0.12)', border: '1px solid rgba(255,150,0,0.3)',
                        }}>
                          <div style={{ fontFamily: FONT, color: '#FFA500', fontSize: '0.85rem', marginBottom: 6, textShadow: HARD_SHADOW }}>
                            ⚡ ACTIVE SKILL
                          </div>
                          <p style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 700, color: 'rgba(220,210,185,0.9)', fontSize: '0.88rem', margin: 0 }}>
                            {activePart || product.activeSkill}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─ STATS tab ─ */}
                  {activeTab === 'STATS' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Stats list */}
                      {(statsArr.length > 0 || statsPart) && (
                        <section>
                          <h4 style={{
                            fontFamily: FONT, color: rarityColor, textShadow: HARD_SHADOW,
                            fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em',
                            marginBottom: 10, paddingBottom: 6,
                            borderBottom: `1px solid ${rarityColor}44`,
                          }}>📊 Base Stats</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {statsArr.length > 0
                              ? statsArr.map((s, i) => <StatRow key={i} text={s} color={rarityColor} />)
                              : statsPart.split('|').map((s, i) => <StatRow key={i} text={s.trim()} color={rarityColor} />)
                            }
                          </div>
                        </section>
                      )}

                      {/* Passives */}
                      {(passivesArr.length > 0 || passivesPart) && (
                        <section style={{ marginTop: 6 }}>
                          <h4 style={{
                            fontFamily: FONT, color: '#CC88FF', textShadow: HARD_SHADOW,
                            fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em',
                            marginBottom: 10, paddingBottom: 6,
                            borderBottom: '1px solid rgba(200,136,255,0.25)',
                          }}>✦ Passives</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {passivesArr.length > 0
                              ? passivesArr.map((p, i) => <PassiveRow key={i} text={p} />)
                              : passivesPart.split('.').filter(Boolean).map((p, i) => <PassiveRow key={i} text={p.trim()} />)
                            }
                          </div>
                        </section>
                      )}

                      {/* Fallback if nothing */}
                      {!statsArr.length && !statsPart && !passivesArr.length && !passivesPart && (
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: '"Nunito",sans-serif', fontStyle: 'italic' }}>
                          No stats data available.
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ── Sub-components ── */
function StatRow({ text, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '7px 12px', borderRadius: 10,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <span style={{ color, fontSize: '0.85rem', flexShrink: 0 }}>▸</span>
      <span style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, color: 'rgba(220,210,185,0.95)', fontSize: '0.88rem' }}>{text}</span>
    </div>
  );
}

function PassiveRow({ text }) {
  if (!text) return null;
  const colonIdx = text.indexOf(':');
  const label  = colonIdx > -1 ? text.slice(0, colonIdx) : '';
  const detail = colonIdx > -1 ? text.slice(colonIdx + 1).trim() : text;
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 12,
      background: 'rgba(148,100,255,0.08)',
      border: '1px solid rgba(148,100,255,0.2)',
    }}>
      {label && (
        <div style={{
          fontFamily: '"Lilita One", cursive', color: '#CC88FF', fontSize: '0.82rem',
          textShadow: HARD_SHADOW, marginBottom: 4,
        }}>{label}</div>
      )}
      <p style={{ margin: 0, fontFamily: '"Nunito", sans-serif', fontWeight: 700, color: 'rgba(210,200,180,0.9)', fontSize: '0.85rem', lineHeight: 1.55 }}>{detail}</p>
    </div>
  );
}
