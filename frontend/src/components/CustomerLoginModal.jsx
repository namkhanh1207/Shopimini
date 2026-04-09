import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FONT = '"Lilita One", cursive';
const HARD_SHADOW = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 3px 0 #000';

const INPUT = {
  width: '100%', padding: '12px 16px', borderRadius: 12,
  border: '2px solid rgba(201,162,39,0.3)', background: 'rgba(255,255,255,0.06)',
  color: '#e8dcc8', fontFamily: '"Nunito", sans-serif', fontWeight: 700,
  fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const LABEL = { display: 'block', fontFamily: FONT, color: 'rgba(255,215,0,0.75)',
  fontSize: '0.8rem', textShadow: HARD_SHADOW, marginBottom: 6 };

export default function CustomerLoginModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [tab, setTab]       = useState('login'); // 'login' | 'register'
  const [form, setForm]     = useState({ username: '', email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.username, form.email, form.password);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
    } finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:1100, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'absolute', inset:0, background:'rgba(0,0,15,0.85)', backdropFilter:'blur(10px)' }}
            onClick={onClose} />

          <motion.div
            initial={{ scale:0.88, y:40, opacity:0 }}
            animate={{ scale:1, y:0, opacity:1 }}
            exit={{ scale:0.88, y:40, opacity:0 }}
            transition={{ type:'spring', stiffness:260, damping:24 }}
            style={{
              position:'relative', zIndex:10, width:'100%', maxWidth:420,
              background:'linear-gradient(175deg,#0e1728,#09111f)',
              border:'4px solid #C9A227', borderRadius:24,
              boxShadow:'0 0 0 2px rgba(255,215,0,0.12), 0 30px 80px rgba(0,0,0,0.8)',
              overflow:'hidden',
            }}
          >
            {/* Header */}
            <div style={{ padding:'18px 22px 12px', borderBottom:'2px solid rgba(255,215,0,0.15)',
              display:'flex', alignItems:'center', justifyContent:'space-between',
              background:'linear-gradient(90deg,rgba(201,162,39,0.12),transparent)' }}>
              <span style={{ fontFamily:FONT, fontSize:'1.4rem', color:'#FFD700', textShadow:HARD_SHADOW }}>
                {tab === 'login' ? '🗝 Đăng Nhập' : '⚔ Đăng Ký'}
              </span>
              <button onClick={onClose} style={{
                width:32, height:32, borderRadius:'50%', background:'linear-gradient(180deg,#FF5E5E,#CC0000)',
                border:'2px solid #800000', color:'#fff', cursor:'pointer', display:'grid', placeItems:'center',
              }}><X size={15} strokeWidth={3}/></button>
            </div>

            {/* Tab switcher */}
            <div style={{ display:'flex', margin:'16px 22px 0', borderRadius:12,
              background:'rgba(255,255,255,0.05)', border:'2px solid rgba(255,215,0,0.1)', overflow:'hidden' }}>
              {['login','register'].map(t => (
                <button key={t} onClick={() => { setTab(t); setError(''); }}
                  style={{
                    flex:1, padding:'9px 0', border:'none', cursor:'pointer',
                    fontFamily:FONT, fontSize:'0.9rem', textShadow: t===tab ? HARD_SHADOW : 'none',
                    background: t===tab ? 'linear-gradient(180deg,#C9A227,#9a7a1a)' : 'transparent',
                    color: t===tab ? '#1a0a00' : 'rgba(220,200,160,0.5)',
                    transition:'all 0.22s',
                  }}>
                  {t === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding:'16px 22px 22px', display:'flex', flexDirection:'column', gap:14 }}>
              {tab === 'register' && (
                <div>
                  <label style={LABEL}>Tên hiển thị</label>
                  <input value={form.username} onChange={e => set('username', e.target.value)}
                    placeholder="Hero của bạn..." required style={INPUT}
                    onFocus={e => e.target.style.borderColor='#FFD700'}
                    onBlur={e => e.target.style.borderColor='rgba(201,162,39,0.3)'} />
                </div>
              )}
              <div>
                <label style={LABEL}>Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="hero@realm.vn" required style={INPUT}
                  onFocus={e => e.target.style.borderColor='#FFD700'}
                  onBlur={e => e.target.style.borderColor='rgba(201,162,39,0.3)'} />
              </div>
              <div>
                <label style={LABEL}>Mật khẩu</label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="••••••••" required minLength={6} style={INPUT}
                  onFocus={e => e.target.style.borderColor='#FFD700'}
                  onBlur={e => e.target.style.borderColor='rgba(201,162,39,0.3)'} />
              </div>

              {error && (
                <div style={{ background:'rgba(255,50,50,0.15)', border:'1px solid rgba(255,80,80,0.4)',
                  borderRadius:10, padding:'10px 14px', color:'#FF8080',
                  fontFamily:'"Nunito",sans-serif', fontWeight:700, fontSize:'0.85rem' }}>
                  ⚠ {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width:'100%', height:50, marginTop:4, borderRadius:14,
                border:'3px solid #7a4400', borderBottom:'6px solid #5a3200',
                background: loading ? '#5a4010' : 'linear-gradient(90deg,#FFC107 0%,#FF8C00 40%,#FFD700 70%,#FF8C00 100%)',
                backgroundSize:'200% auto',
                color:'#1a0a00', fontFamily:FONT, fontSize:'1.05rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow:'inset 0 3px 0 rgba(255,255,255,0.45)',
                textShadow:'0 1px 0 rgba(255,255,255,0.4)',
                animation: loading ? 'none' : 'shimmer 2s linear infinite',
              }}>
                {loading ? '⏳ Đang xử lý...' : (tab === 'login' ? '🗝 Vào Vương Quốc!' : '⚔ Bắt Đầu Hành Trình!')}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
