import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Building2, Wallet, Ticket, ShoppingBag } from 'lucide-react';
import { FaCoins } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const FONT = '"Lilita One", cursive';
const HARD_SHADOW = '-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000,0px 3px 0 #000';

const INPUT = {
  width:'100%', padding:'10px 14px', borderRadius:10,
  border:'2px solid rgba(201,162,39,0.3)', background:'rgba(255,255,255,0.06)',
  color:'#e8dcc8', fontFamily:'"Nunito",sans-serif', fontWeight:700, fontSize:'0.9rem',
  outline:'none', boxSizing:'border-box', transition:'border-color 0.2s',
};
const focusBorder = e => e.target.style.borderColor = '#FFD700';
const blurBorder  = e => e.target.style.borderColor = 'rgba(201,162,39,0.3)';

const SECTION_TITLE = (text) => (
  <div style={{ fontFamily:FONT, color:'rgba(255,215,0,0.7)', fontSize:'0.8rem',
    textShadow:HARD_SHADOW, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>
    {text}
  </div>
);

const VN_BANKS = ['Vietcombank','Techcombank','VPBank','MB Bank','Agribank',
  'BIDV','VietinBank','Sacombank','ACB','TPBank','OCB','HDBank'];

// ────────────────── TABS ──────────────────
const TABS = [
  { id:'profile', icon:<User size={16}/>, label:'Hồ sơ' },
  { id:'bank',    icon:<Building2 size={16}/>, label:'Ngân hàng' },
  { id:'topup',   icon:<Wallet size={16}/>, label:'Nạp tiền' },
  { id:'voucher', icon:<Ticket size={16}/>, label:'Voucher' },
  { id:'orders',  icon:<ShoppingBag size={16}/>, label:'Đơn hàng' },
];

export default function AccountModal({ isOpen, onClose, initialTab = 'profile' }) {
  const { customer, updateProfile, logout, reload } = useAuth();
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    if (isOpen) setTab(initialTab || 'profile');
  }, [isOpen, initialTab]);

  if (!isOpen || !customer) return null;

  return (
    <AnimatePresence>
      <div style={{ position:'fixed', inset:0, zIndex:1050, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          style={{ position:'absolute', inset:0, background:'rgba(0,0,15,0.85)', backdropFilter:'blur(10px)' }}
          onClick={onClose} />

        <motion.div
          initial={{ scale:0.88, y:40, opacity:0 }}
          animate={{ scale:1, y:0, opacity:1 }}
          exit={{ scale:0.88, y:40, opacity:0 }}
          transition={{ type:'spring', stiffness:260, damping:24 }}
          style={{
            position:'relative', zIndex:10, width:'100%', maxWidth:640,
            maxHeight:'92vh', display:'flex', flexDirection:'column',
            background:'linear-gradient(175deg,#0e1728,#09111f)',
            border:'4px solid #C9A227', borderRadius:24,
            boxShadow:'0 0 0 2px rgba(255,215,0,0.12), 0 30px 80px rgba(0,0,0,0.8)',
            overflow:'hidden',
          }}
        >
          {/* Header */}
          <div style={{ padding:'14px 20px', borderBottom:'2px solid rgba(255,215,0,0.15)',
            display:'flex', alignItems:'center', gap:14, flexShrink:0,
            background:'linear-gradient(90deg,rgba(201,162,39,0.1),transparent)' }}>
            <img src={customer.avatar_url || `https://api.dicebear.com/8.x/bottts/svg?seed=${customer.id}`}
              alt="avatar" style={{ width:48, height:48, borderRadius:'50%', border:'3px solid #FFD700',
                objectFit:'cover', background:'#1a2030' }} />
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:FONT, fontSize:'1.15rem', color:'#FFD700', textShadow:HARD_SHADOW }}>{customer.username}</div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:'0.75rem', color:'rgba(200,200,200,0.55)', fontFamily:'"Nunito",sans-serif', fontWeight:700 }}>Lv.{customer.level}</span>
                <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.8rem', color:'#FFD700',
                  fontFamily:'"Nunito",sans-serif', fontWeight:700 }}>
                  <FaCoins size={13}/>{Number(customer.balance).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
            <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%',
              background:'linear-gradient(180deg,#FF5E5E,#CC0000)', border:'2px solid #800000',
              color:'#fff', cursor:'pointer', display:'grid', placeItems:'center' }}><X size={15} strokeWidth={3}/></button>
          </div>

          {/* Tab bar */}
          <div style={{ display:'flex', borderBottom:'2px solid rgba(255,215,0,0.1)', flexShrink:0,
            overflowX:'auto', background:'rgba(0,0,0,0.2)' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex:'0 0 auto', display:'flex', alignItems:'center', gap:6, padding:'11px 18px',
                border:'none', borderBottom: t.id===tab ? '3px solid #FFD700' : '3px solid transparent',
                background:'transparent', color: t.id===tab ? '#FFD700' : 'rgba(200,190,160,0.45)',
                fontFamily:FONT, fontSize:'0.82rem', cursor:'pointer', transition:'color 0.2s',
                textShadow: t.id===tab ? HARD_SHADOW : 'none', whiteSpace:'nowrap',
              }}>{t.icon}{t.label}</button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex:1, overflowY:'auto', minHeight:0 }} className="dml-scroll">
            {tab === 'profile' && <ProfileTab customer={customer} updateProfile={updateProfile} logout={logout} onClose={onClose}/>}
            {tab === 'bank'    && <BankTab />}
            {tab === 'topup'   && <TopupTab customer={customer} />}
            {tab === 'voucher' && <VoucherTab />}
            {tab === 'orders'  && <OrdersTab />}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────
// TAB: PROFILE
// ─────────────────────────────────────────
function ProfileTab({ customer, updateProfile, logout, onClose }) {
  const [username, setUsername] = useState(customer.username);
  const [avatarUrl, setAvatarUrl] = useState(customer.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const levelPct = Math.min(((customer.level - 1) % 10) * 10 + 10, 100);

  const save = async () => {
    setSaving(true); setMsg('');
    try {
      await updateProfile({ username, avatar_url: avatarUrl });
      setMsg('✅ Đã lưu!');
    } catch(e) { setMsg('❌ Lỗi: ' + (e.response?.data?.error || e.message)); }
    finally { setSaving(false); }
  };

  const handleLogout = async () => { await logout(); onClose(); };

  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:18 }}>
      {/* Avatar */}
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        <img src={avatarUrl || `https://api.dicebear.com/8.x/bottts/svg?seed=${customer.id}`}
          alt="avatar" style={{ width:72, height:72, borderRadius:'50%', border:'3px solid #C9A227', objectFit:'cover', background:'#1a2030' }} />
        <div style={{ flex:1 }}>
          {SECTION_TITLE('URL Ảnh Avatar')}
          <input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)}
            placeholder="https://..." style={INPUT} onFocus={focusBorder} onBlur={blurBorder} />
          <div style={{ fontSize:'0.72rem', color:'rgba(160,160,160,0.5)', fontFamily:'"Nunito",sans-serif', marginTop:4 }}>
            Dán link ảnh bất kỳ (JPG/PNG/WebP)
          </div>
        </div>
      </div>

      {/* Username */}
      <div>
        {SECTION_TITLE('Tên Hiển Thị')}
        <input value={username} onChange={e => setUsername(e.target.value)} style={INPUT}
          onFocus={focusBorder} onBlur={blurBorder} />
      </div>

      {/* Level bar */}
      <div>
        {SECTION_TITLE(`Level ${customer.level}`)}
        <div style={{ background:'rgba(0,0,0,0.4)', borderRadius:999, height:18, border:'2px solid rgba(255,215,0,0.2)', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${levelPct}%`, borderRadius:999,
            background:'linear-gradient(90deg,#FFD700,#FF8C00)', transition:'width 0.5s',
            boxShadow:'inset 0 2px 0 rgba(255,255,255,0.4)' }}/>
        </div>
        <div style={{ fontSize:'0.72rem', color:'rgba(160,160,160,0.5)', fontFamily:'"Nunito",sans-serif', marginTop:4 }}>
          Level tăng dựa trên số đơn hàng và hoạt động
        </div>
      </div>

      {/* Info readonly */}
      <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'12px 16px', border:'1px solid rgba(255,215,0,0.1)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
          <span style={{ color:'rgba(200,190,160,0.5)', fontFamily:'"Nunito",sans-serif', fontWeight:700, fontSize:'0.8rem' }}>Email</span>
          <span style={{ color:'#e8dcc8', fontFamily:'"Nunito",sans-serif', fontWeight:700, fontSize:'0.8rem' }}>{customer.email}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span style={{ color:'rgba(200,190,160,0.5)', fontFamily:'"Nunito",sans-serif', fontWeight:700, fontSize:'0.8rem' }}>Số dư</span>
          <span style={{ color:'#FFD700', fontFamily:'"Nunito",sans-serif', fontWeight:900, fontSize:'0.85rem' }}>
            🪙 {Number(customer.balance).toLocaleString('vi-VN')} đ
          </span>
        </div>
      </div>

      {msg && <div style={{ color: msg.startsWith('✅') ? '#6AE030' : '#FF8080', fontFamily:'"Nunito",sans-serif', fontWeight:700, fontSize:'0.85rem' }}>{msg}</div>}

      <div style={{ display:'flex', gap:10 }}>
        <button onClick={save} disabled={saving} style={{
          flex:1, height:44, borderRadius:12, border:'3px solid #7a4400', borderBottom:'5px solid #5a3200',
          background: saving ? '#5a4010' : 'linear-gradient(180deg,#FFD700,#FF8C00)',
          color:'#1a0a00', fontFamily:FONT, fontSize:'0.95rem', cursor: saving ? 'not-allowed' : 'pointer',
          boxShadow:'inset 0 2px 0 rgba(255,255,255,0.4)',
        }}>{saving ? '⏳ Lưu...' : '💾 Lưu thay đổi'}</button>
        <button onClick={handleLogout} style={{
          height:44, padding:'0 18px', borderRadius:12, border:'2px solid rgba(255,80,80,0.4)',
          background:'rgba(255,50,50,0.1)', color:'#FF8080', fontFamily:FONT, fontSize:'0.9rem', cursor:'pointer',
        }}>🚪 Đăng xuất</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// TAB: BANK
// ─────────────────────────────────────────
function BankTab() {
  const [banks, setBanks] = useState([]);
  const [form, setForm]   = useState({ bank_name: VN_BANKS[0], account_number:'', account_name:'' });
  const [adding, setAdding] = useState(false);
  const [msg, setMsg]     = useState('');

  const load = useCallback(async () => {
    try { const r = await api.get('/customer/bank'); setBanks(r.data.banks || []); } catch{}
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault(); setAdding(true); setMsg('');
    try {
      await api.post('/customer/bank', form);
      setForm({ bank_name: VN_BANKS[0], account_number:'', account_name:'' });
      setMsg('✅ Đã thêm tài khoản ngân hàng!');
      load();
    } catch(err) { setMsg('❌ ' + (err.response?.data?.error || err.message)); }
    finally { setAdding(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('Xóa tài khoản ngân hàng này?')) return;
    await api.delete(`/customer/bank/${id}`);
    load();
  };

  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
      {SECTION_TITLE('Tài khoản đã liên kết')}
      {banks.length === 0 && (
        <div style={{ textAlign:'center', padding:'20px', color:'rgba(160,160,160,0.4)',
          fontFamily:'"Nunito",sans-serif', fontWeight:700, fontSize:'0.88rem' }}>
          🏦 Chưa có tài khoản ngân hàng nào
        </div>
      )}
      {banks.map(b => (
        <div key={b.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:12,
          background:'rgba(255,255,255,0.045)', border:'1px solid rgba(255,215,0,0.1)' }}>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:FONT, color:'#e8dcc8', fontSize:'0.9rem', textShadow:HARD_SHADOW }}>{b.bank_name}</div>
            <div style={{ fontFamily:'"Nunito",sans-serif', fontSize:'0.8rem', color:'rgba(200,190,160,0.6)', marginTop:2 }}>
              {b.account_number} · {b.account_name}
            </div>
          </div>
          <button onClick={() => remove(b.id)} style={{ color:'#FF6B6B', background:'none', border:'none', cursor:'pointer', fontSize:'1.2rem' }}>🗑</button>
        </div>
      ))}

      <div style={{ marginTop:8, borderTop:'1px solid rgba(255,215,0,0.1)', paddingTop:16 }}>
        {SECTION_TITLE('Thêm Tài Khoản Ngân Hàng')}
        <form onSubmit={add} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <select value={form.bank_name} onChange={e => setForm(f=>({...f, bank_name:e.target.value}))}
            style={{ ...INPUT, appearance:'none', cursor:'pointer' }}>
            {VN_BANKS.map(b => <option key={b} value={b} style={{ background:'#0e1728' }}>{b}</option>)}
          </select>
          <input placeholder="Số tài khoản" required value={form.account_number}
            onChange={e => setForm(f=>({...f, account_number:e.target.value}))}
            style={INPUT} onFocus={focusBorder} onBlur={blurBorder} />
          <input placeholder="Tên chủ tài khoản (in hoa)" required value={form.account_name}
            onChange={e => setForm(f=>({...f, account_name:e.target.value.toUpperCase()}))}
            style={INPUT} onFocus={focusBorder} onBlur={blurBorder} />
          {msg && <div style={{ color: msg.startsWith('✅') ? '#6AE030' : '#FF8080', fontFamily:'"Nunito",sans-serif', fontWeight:700, fontSize:'0.82rem' }}>{msg}</div>}
          <button type="submit" disabled={adding} style={{
            height:42, borderRadius:12, border:'3px solid #1a5a00', borderBottom:'5px solid #0a3a00',
            background: adding ? '#1a3a10' : 'linear-gradient(180deg,#6AE030,#279500)',
            color:'#fff', fontFamily:FONT, fontSize:'0.9rem', cursor: adding ? 'not-allowed' : 'pointer',
            textShadow:HARD_SHADOW, boxShadow:'inset 0 2px 0 rgba(255,255,255,0.3)',
          }}>+ Liên Kết Ngân Hàng</button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// TAB: TOP-UP
// ─────────────────────────────────────────
function TopupTab({ customer }) {
  const [amount, setAmount]   = useState('');
  const [method, setMethod]   = useState('bank');
  const [note, setNote]       = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState('');

  const PRESETS = [50000, 100000, 200000, 500000, 1000000];

  const loadHistory = useCallback(async () => {
    try { const r = await api.get('/customer/topup'); setHistory(r.data.history || []); } catch{}
  }, []);
  useEffect(() => { loadHistory(); }, [loadHistory]);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setMsg('');
    try {
      const r = await api.post('/customer/topup', { amount, method, note });
      setMsg('✅ ' + r.data.message);
      setAmount(''); setNote('');
      loadHistory();
    } catch(err) { setMsg('❌ ' + (err.response?.data?.error || err.message)); }
    finally { setLoading(false); }
  };

  const STATUS_COLOR = { pending:'#FFD700', approved:'#6AE030', rejected:'#FF6B6B' };
  const STATUS_LABEL = { pending:'⏳ Chờ duyệt', approved:'✅ Đã duyệt', rejected:'❌ Từ chối' };

  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.15)',
        borderRadius:12, padding:'12px 16px' }}>
        <span style={{ fontFamily:FONT, color:'rgba(255,215,0,0.7)', fontSize:'0.85rem', textShadow:HARD_SHADOW }}>SỐ DƯ HIỆN TẠI</span>
        <span style={{ fontFamily:FONT, fontSize:'1.3rem', color:'#FFD700', textShadow:HARD_SHADOW }}>
          🪙 {Number(customer.balance).toLocaleString('vi-VN')} đ
        </span>
      </div>

      {SECTION_TITLE('Yêu Cầu Nạp Tiền')}
      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {/* Preset amounts */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {PRESETS.map(p => (
            <button type="button" key={p} onClick={() => setAmount(String(p))} style={{
              padding:'6px 14px', borderRadius:999, border: amount==p ? '2px solid #FFD700' : '2px solid rgba(255,215,0,0.2)',
              background: amount==p ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.04)',
              color: amount==p ? '#FFD700' : 'rgba(200,190,160,0.55)',
              fontFamily:'"Nunito",sans-serif', fontWeight:700, fontSize:'0.78rem', cursor:'pointer',
            }}>{(p/1000).toFixed(0)}K</button>
          ))}
        </div>
        <input type="number" placeholder="Hoặc nhập số tiền..." value={amount}
          onChange={e => setAmount(e.target.value)} required min="10000"
          style={INPUT} onFocus={focusBorder} onBlur={blurBorder} />
        <select value={method} onChange={e => setMethod(e.target.value)}
          style={{ ...INPUT, appearance:'none', cursor:'pointer' }}>
          <option value="bank" style={{ background:'#0e1728' }}>🏦 Chuyển khoản ngân hàng</option>
          <option value="momo" style={{ background:'#0e1728' }}>💜 MoMo</option>
          <option value="zalopay" style={{ background:'#0e1728' }}>🔵 ZaloPay</option>
        </select>
        <input placeholder="Ghi chú (tên tài khoản, mã GD...)" value={note}
          onChange={e => setNote(e.target.value)} style={INPUT} onFocus={focusBorder} onBlur={blurBorder} />
        {msg && <div style={{ color: msg.startsWith('✅') ? '#6AE030' : '#FF8080', fontFamily:'"Nunito",sans-serif', fontWeight:700, fontSize:'0.82rem' }}>{msg}</div>}
        <button type="submit" disabled={loading} style={{
          height:44, borderRadius:12, border:'3px solid #1a5a00', borderBottom:'5px solid #0a3a00',
          background: loading ? '#1a3a10' : 'linear-gradient(180deg,#6AE030,#279500)',
          color:'#fff', fontFamily:FONT, fontSize:'0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
          textShadow:HARD_SHADOW, boxShadow:'inset 0 2px 0 rgba(255,255,255,0.3)',
        }}>💰 Gửi Yêu Cầu Nạp Tiền</button>
        <div style={{ fontSize:'0.72rem', color:'rgba(160,160,160,0.4)', fontFamily:'"Nunito",sans-serif', textAlign:'center' }}>
          Admin sẽ duyệt và cộng tiền vào tài khoản của bạn trong 1-24h
        </div>
      </form>

      {history.length > 0 && (
        <>
          <div style={{ borderTop:'1px solid rgba(255,215,0,0.1)', paddingTop:14 }}>
            {SECTION_TITLE('Lịch sử Nạp tiền')}
          </div>
          {history.map(h => (
            <div key={h.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'10px 14px', borderRadius:10, background:'rgba(255,255,255,0.04)',
              border:'1px solid rgba(255,215,0,0.08)' }}>
              <div>
                <div style={{ fontFamily:'"Nunito",sans-serif', fontWeight:900, color:'#FFD700', fontSize:'0.88rem' }}>
                  +{Number(h.amount).toLocaleString('vi-VN')} đ
                </div>
                <div style={{ fontSize:'0.72rem', color:'rgba(160,160,160,0.5)', fontFamily:'"Nunito",sans-serif' }}>
                  {h.method} · {new Date(h.created_at).toLocaleDateString('vi-VN')}
                </div>
              </div>
              <span style={{ fontFamily:'"Nunito",sans-serif', fontWeight:700, fontSize:'0.78rem', color:STATUS_COLOR[h.status] }}>
                {STATUS_LABEL[h.status]}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// TAB: VOUCHER
// ─────────────────────────────────────────
function VoucherTab() {
  const [code, setCode]     = useState('');
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError]   = useState('');

  const check = async (e) => {
    e.preventDefault(); setChecking(true); setError(''); setResult(null);
    try {
      const r = await api.post('/voucher/check', { code, order_total: 0 });
      setResult(r.data);
    } catch(err) { setError(err.response?.data?.error || 'Không hợp lệ'); }
    finally { setChecking(false); }
  };

  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
      {SECTION_TITLE('Kiểm Tra Voucher')}
      <form onSubmit={check} style={{ display:'flex', gap:10 }}>
        <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="Nhập mã voucher..." required
          style={{ ...INPUT, flex:1, fontFamily:FONT, letterSpacing:'0.1em', fontSize:'0.92rem' }}
          onFocus={focusBorder} onBlur={blurBorder} />
        <button type="submit" disabled={checking} style={{
          height:44, padding:'0 18px', borderRadius:12, border:'3px solid #1a5a00', borderBottom:'5px solid #0a3a00',
          background:'linear-gradient(180deg,#6AE030,#279500)', color:'#fff',
          fontFamily:FONT, fontSize:'0.9rem', cursor:'pointer', textShadow:HARD_SHADOW,
          whiteSpace:'nowrap', flexShrink:0,
        }}>Kiểm tra</button>
      </form>

      {error && <div style={{ background:'rgba(255,50,50,0.1)', border:'1px solid rgba(255,80,80,0.3)',
        borderRadius:10, padding:'12px 16px', color:'#FF8080', fontFamily:'"Nunito",sans-serif', fontWeight:700 }}>
        ⚠ {error}
      </div>}

      {result && (
        <div style={{ background:'rgba(100,200,80,0.08)', border:'2px solid rgba(100,200,80,0.3)',
          borderRadius:14, padding:'16px 20px' }}>
          <div style={{ fontFamily:FONT, color:'#6AE030', fontSize:'1.1rem', textShadow:HARD_SHADOW, marginBottom:8 }}>
            🎫 Voucher Hợp Lệ!
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {[
              ['Mã', result.voucher.code],
              ['Giảm', result.voucher.discount_type === 'percent'
                ? `${result.voucher.discount_value}%`
                : `${Number(result.voucher.discount_value).toLocaleString('vi-VN')}đ`],
              ['Đơn tối thiểu', `${Number(result.voucher.min_order).toLocaleString('vi-VN')}đ`],
              ['Còn lại', `${result.voucher.max_uses - result.voucher.used_count} lượt`],
              result.voucher.expires_at && ['Hết hạn', new Date(result.voucher.expires_at).toLocaleDateString('vi-VN')],
            ].filter(Boolean).map(([k, v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'rgba(200,190,160,0.6)', fontFamily:'"Nunito",sans-serif', fontWeight:700, fontSize:'0.82rem' }}>{k}</span>
                <span style={{ color:'#e8dcc8', fontFamily:'"Nunito",sans-serif', fontWeight:900, fontSize:'0.82rem' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding:'16px', borderRadius:12, background:'rgba(255,215,0,0.04)',
        border:'1px dashed rgba(255,215,0,0.15)', textAlign:'center' }}>
        <div style={{ fontFamily:FONT, color:'rgba(255,215,0,0.4)', fontSize:'0.85rem', textShadow:HARD_SHADOW }}>
          💡 Dùng mã voucher khi thanh toán trong giỏ hàng để được giảm giá
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// TAB: ORDERS
// ─────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/customer/orders')
      .then(r => setOrders(r.data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding:'3rem', textAlign:'center', fontFamily:FONT, color:'rgba(255,215,0,0.4)', fontSize:'1rem' }}>
      Đang tải đơn hàng...
    </div>
  );

  if (orders.length === 0) return (
    <div style={{ padding:'3rem', textAlign:'center' }}>
      <div style={{ fontSize:'3.5rem', marginBottom:12 }}>📦</div>
      <div style={{ fontFamily:FONT, color:'rgba(255,215,0,0.35)', fontSize:'1rem', textShadow:HARD_SHADOW }}>
        Chưa có đơn hàng nào
      </div>
    </div>
  );

  const METHOD_LABEL = { balance:'💰 Số dư', cod:'💵 COD', bank:'🏦 Ngân hàng' };

  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:12 }}>
      {orders.map(o => (
        <div key={o.id} style={{ borderRadius:14, overflow:'hidden',
          border:'1px solid rgba(255,215,0,0.12)', background:'rgba(255,255,255,0.03)' }}>
            <div style={{ padding:'10px 14px', background:'rgba(255,215,0,0.06)',
            display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontFamily:FONT, color:'rgba(255,215,0,0.7)', fontSize:'0.8rem', textShadow:HARD_SHADOW }}>
              ĐƠN #{o.id} · {new Date(o.created_at).toLocaleDateString('vi-VN')}
            </span>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {(() => {
                const diff = (new Date().getTime() - new Date(o.created_at).getTime()) / (1000 * 60 * 60);
                const isDelivered = diff >= 24;
                return (
                  <span style={{
                    padding:'2px 8px', borderRadius:6, fontSize:'0.65rem', fontFamily:FONT,
                    background: isDelivered ? 'rgba(106,224,48,0.15)' : 'rgba(255,215,0,0.15)',
                    border: `1px solid ${isDelivered ? '#6AE030' : '#FFD700'}`,
                    color: isDelivered ? '#6AE030' : '#FFD700',
                    textShadow: HARD_SHADOW
                  }}>
                    {isDelivered ? '✅ ĐÃ GIAO' : '🚚 ĐANG VẬN CHUYỂN'}
                  </span>
                );
              })()}
              <span style={{ fontFamily:'"Nunito",sans-serif', fontWeight:900, color:'#FFD700', fontSize:'0.85rem' }}>
                {Number(o.total_price).toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>
          <div style={{ padding:'10px 14px' }}>
            {o.product_names && (
              <div style={{ fontSize:'0.8rem', color:'rgba(200,190,160,0.7)',
                fontFamily:'"Nunito",sans-serif', fontWeight:700, marginBottom:6 }}>
                {o.product_names.split('||').slice(0,3).join(', ')}
                {o.product_names.split('||').length > 3 && '...'}
              </div>
            )}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <span style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:999, padding:'2px 10px', fontSize:'0.72rem', color:'rgba(200,200,200,0.55)',
                fontFamily:'"Nunito",sans-serif', fontWeight:700 }}>
                {METHOD_LABEL[o.payment_method] || '💵 COD'}
              </span>
              {o.discount_amount > 0 && (
                <span style={{ background:'rgba(100,200,80,0.1)', border:'1px solid rgba(100,200,80,0.25)',
                  borderRadius:999, padding:'2px 10px', fontSize:'0.72rem', color:'#6AE030',
                  fontFamily:'"Nunito",sans-serif', fontWeight:700 }}>
                  🎫 -{Number(o.discount_amount).toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
