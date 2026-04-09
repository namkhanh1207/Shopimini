import React from 'react';
import { motion } from 'framer-motion';

const FONT = '"Lilita One", cursive';
const HARD_SHADOW = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 3px 0 #000';

/*
 * Sidebar game entries.
 * icon: path relative to frontend/public/ folder (served as static asset by Vite).
 * To add your own PNG: copy the file to frontend/public/icons/ then set icon: '/icons/filename.png'
 * fallback: shown if icon file is missing (via.placeholder.com with abbreviation text)
 */
const GAMES = [
  { id: '',           label: 'Tất cả',      icon: '/icons/all.png',         abbr: 'ALL', bg: '0d4a42', fg: 'ffffff' },
  { id: 'lienquan',  label: 'Liên Quân',   icon: '/icons/lienquan.png',    abbr: 'LQ',  bg: '1a3a7a', fg: 'ffffff' },
  { id: 'lienminh',  label: 'Liên Minh',   icon: '/icons/lienminh.png',    abbr: 'LM',  bg: '2a1a5e', fg: 'c9b0ff' },
  { id: 'gunny',     label: 'Gunny 360',   icon: '/icons/gunny.png',       abbr: 'GN',  bg: '7a2a00', fg: 'ffcc00' },
  { id: 'soulknight',label: 'Soul Knight', icon: '/icons/soulknight.png',  abbr: 'SK',  bg: '1e3a1e', fg: '90ee90' },
  { id: 'pubg',      label: 'PUBG',        icon: '/icons/pubg.png',        abbr: 'PG',  bg: '2a1e0a', fg: 'f5c518' },
  { id: 'dragonmania',label:'Dragon Mania',icon: '/icons/dragonmania.png', abbr: 'DM',  bg: '4a1a00', fg: 'ff8c00' },
];

export default function Sidebar({ setFilterAttribute, activeAttribute, setGame, activeGame }) {
  return (
    <aside style={{
      width: 240,
      minHeight: '100%',
      flexShrink: 0,
      padding: '12px 0 16px 12px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 20,
    }}>
      {/* Section label */}
      <div style={{
        fontFamily: FONT,
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        color: 'rgba(255,215,0,0.5)',
        marginBottom: 10,
        paddingLeft: 12,
        textShadow: '0 1px 0 rgba(0,0,0,0.6)',
      }}>DANH MỤC</div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {GAMES.map((game) => {
          const isActive = (activeGame || '') === game.id;
          return (
            <motion.button
              key={game.id}
              onClick={() => setGame && setGame(game.id)}
              animate={isActive ? { x: 10, scale: 1.04 } : { x: 0, scale: 1 }}
              whileHover={!isActive ? { x: 4, scale: 1.01 } : {}}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '108%',
                padding: '9px 14px',
                borderRadius: '0 18px 18px 0',
                border: isActive ? '3px solid #FFD700' : '2px solid rgba(255,215,0,0.18)',
                borderLeft: 'none',
                background: isActive
                  ? 'linear-gradient(135deg, #f0b90b 0%, #c57900 100%)'
                  : 'rgba(0,0,0,0.38)',
                backdropFilter: 'blur(8px)',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: isActive
                  ? '-3px 6px 18px rgba(0,0,0,0.65), 0 0 22px rgba(255,180,0,0.35), inset 0 2px 0 rgba(255,255,255,0.4)'
                  : '0 2px 8px rgba(0,0,0,0.3)',
                position: 'relative',
                overflow: 'hidden',
                zIndex: isActive ? 10 : 5,
              }}
            >
              {/* Gold shine strip on active */}
              {isActive && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)',
                }} />
              )}

              {/*
               * Game icon image – 40×40px, border-radius 12px.
               * Reads from frontend/public/icons/{game}.png
               * onError fallback: shows text placeholder if PNG not yet added.
               * To replace: copy your PNG to frontend/public/icons/ with matching filename.
               */}
              <img
                src={game.icon}
                alt={game.label}
                style={{
                  width: 40, height: 40,
                  borderRadius: 12,
                  border: isActive ? '2px solid rgba(255,255,255,0.5)' : '2px solid rgba(255,215,0,0.2)',
                  boxShadow: '0 3px 6px rgba(0,0,0,0.5)',
                  flexShrink: 0,
                  objectFit: 'cover',
                }}
                onError={e => {
                  // Fallback to colored placeholder if icon file not found
                  e.target.onerror = null;
                  e.target.src = `https://via.placeholder.com/40/${game.bg}/${game.fg}?text=${game.abbr}`;
                }}
              />

              {/* Label */}
              <span style={{
                fontFamily: FONT,
                fontSize: '0.95rem',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                color: isActive ? '#1a1200' : 'rgba(220,210,185,0.95)',
                textShadow: isActive ? '0 1px 0 rgba(255,255,255,0.3)' : HARD_SHADOW,
              }}>{game.label}</span>

              {/* Arrow for active */}
              {isActive && (
                <div style={{
                  marginLeft: 'auto', flexShrink: 0,
                  width: 0, height: 0,
                  borderTop: '5px solid transparent',
                  borderBottom: '5px solid transparent',
                  borderLeft: '7px solid rgba(0,0,0,0.4)',
                }} />
              )}
            </motion.button>
          );
        })}
      </nav>
    </aside>
  );
}
