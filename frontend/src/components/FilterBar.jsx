import React from 'react';
import { Search } from 'lucide-react';

const FONT = '"Lilita One", cursive';

/* Shared pill input/select styles */
const pillBase = {
  padding: '9px 16px',
  borderRadius: 30,
  border: '2px solid #C9A227',
  background: '#1e2a3a',
  color: '#e8dcc8',
  fontFamily: FONT,
  fontSize: '0.9rem',
  outline: 'none',
  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.45)',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  /* Custom gold dropdown arrow */
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23C9A227' d='M6 8L0 0h12z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  backgroundSize: '11px 7px',
  paddingRight: 36,
  appearance: 'none',
  WebkitAppearance: 'none',
  cursor: 'pointer',
};

/* Focus / blur handlers for gold glow */
const onFocus = e => {
  e.target.style.borderColor = '#FFD700';
  e.target.style.boxShadow = '0 0 0 3px rgba(255,215,0,0.18), inset 0 2px 6px rgba(0,0,0,0.45)';
};
const onBlur = e => {
  e.target.style.borderColor = '#C9A227';
  e.target.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.45)';
};

const OPT = { background: '#1e2a3a' }; // option bg

export default function FilterBar({ filters, setFilters }) {
  const set = (key, val) => setFilters({ ...filters, [key]: val });

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10,
      marginBottom: 16, padding: '10px 14px',
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(14px)',
      borderRadius: 30, border: '2px solid rgba(201,162,39,0.28)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 28px rgba(0,0,0,0.45)',
    }}>

      {/* ── Search by name ── */}
      <div style={{ flex: '1 1 180px', minWidth: 160, position: 'relative' }}>
        <Search size={16} color="rgba(255,215,0,0.5)"
          style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Tìm tên sản phẩm..."
          value={filters.name || ''}
          onChange={e => set('name', e.target.value)}
          onFocus={onFocus} onBlur={onBlur}
          style={{ ...pillBase, width: '100%', paddingLeft: 42,
                   backgroundImage: 'none', paddingRight: 16, cursor: 'text' }}
        />
      </div>

      {/* ── Filter by Rarity ── */}
      <select value={filters.rarity || ''} onChange={e => set('rarity', e.target.value)}
        onFocus={onFocus} onBlur={onBlur} style={pillBase}>
        <option value="" style={OPT}>ALL Rarity</option>
        <option value="Legendary" style={OPT}>⭐ Legendary</option>
        <option value="Epic"      style={OPT}>💜 Epic</option>
        <option value="Rare"      style={OPT}>💙 Rare</option>
        <option value="Common"    style={OPT}>⬜ Common</option>
      </select>

      {/* ── Filter by Element (NEW) ── */}
      <select value={filters.attribute || ''} onChange={e => set('attribute', e.target.value)}
        onFocus={onFocus} onBlur={onBlur} style={pillBase}>
        <option value="" style={OPT}>All Elements</option>
        {/* Vietnamese */}
        <option value="Vũ khí"          style={OPT}>🗡 Vũ khí</option>
        <option value="Vật lý"          style={OPT}>⚒ Vật lý</option>
        <option value="Phép thuật"       style={OPT}>🔮 Phép thuật</option>
        <option value="Phòng thủ"        style={OPT}>🛡 Phòng thủ</option>
        <option value="Hỗ trợ"          style={OPT}>💚 Hỗ trợ</option>
        <option value="Tốc đánh"         style={OPT}>⚡ Tốc đánh</option>
        <option value="Hút máu"          style={OPT}>🩸 Hút máu</option>
        <option value="Thiêu đốt"        style={OPT}>🔥 Thiêu đốt</option>
        <option value="Tốc chạy"         style={OPT}>👟 Tốc chạy</option>
        <option value="Phản sát thương"  style={OPT}>✨ Phản sát thương</option>
        <option value="Lá chắn"          style={OPT}>💠 Lá chắn</option>
        <option value="Hồi phục"         style={OPT}>🍎 Hồi phục</option>
        <option value="Giải khống"       style={OPT}>🔓 Giải khống</option>
        <option value="Kháng phép"       style={OPT}>🧿 Kháng phép</option>
        {/* English */}
        <option value="Weapon"    style={OPT}>⚔ Weapon</option>
        <option value="Physical"  style={OPT}>💪 Physical</option>
        <option value="Magic"     style={OPT}>✦ Magic</option>
        <option value="Defense"   style={OPT}>🛡 Defense</option>
        <option value="Support"   style={OPT}>💚 Support</option>
        <option value="Fast"      style={OPT}>⚡ Fast</option>
        <option value="Lifesteal" style={OPT}>🩸 Lifesteal</option>
        <option value="Fire"      style={OPT}>🔥 Fire</option>
        <option value="Ice"       style={OPT}>❄ Ice</option>
        <option value="Explosive" style={OPT}>💥 Explosive</option>
        <option value="Light"     style={OPT}>☀ Light</option>
        <option value="Dragon"    style={OPT}>🐉 Dragon</option>
        <option value="Skin"      style={OPT}>👕 Skin</option>
        <option value="Material"  style={OPT}>📦 Material</option>
      </select>

      {/* ── Clear button (shown only when any filter active) ── */}
      {(filters.name || filters.rarity || filters.attribute) && (
        <button
          onClick={() => setFilters({ game: filters.game || '', name: '', rarity: '', attribute: '' })}
          style={{
            padding: '9px 14px', borderRadius: 30,
            border: '2px solid rgba(255,80,80,0.4)',
            background: 'rgba(255,80,80,0.1)', color: 'rgba(255,120,120,0.9)',
            fontFamily: FONT, fontSize: '0.85rem', cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseOver={e => e.target.style.background='rgba(255,80,80,0.22)'}
          onMouseOut={e => e.target.style.background='rgba(255,80,80,0.1)'}
        >✕ Xóa lọc</button>
      )}
    </div>
  );
}
