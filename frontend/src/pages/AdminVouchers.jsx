import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

const FONT = '"Lilita One", cursive';
const HARD_SHADOW = '-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000,0px 3px 0 #000';

const INPUT = {
  padding: '10px 14px', borderRadius: 10,
  border: '2px solid rgba(201,162,39,0.3)', background: 'rgba(255,255,255,0.06)',
  color: '#e8dcc8', fontFamily: '"Nunito",sans-serif', fontWeight: 700, fontSize: '0.9rem',
  outline: 'none', boxSizing: 'border-box',
};

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [form, setForm] = useState({
    code: '', discount_type: 'percent', discount_value: '',
    min_order: '', max_uses: '100', expires_at: '',
  });
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    try { const r = await api.get('/admin/vouchers'); setVouchers(r.data.vouchers || []); }
    catch(e) { console.error(e); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault(); setAdding(true); setMsg('');
    try {
      await api.post('/admin/vouchers', form);
      setMsg('✅ Đã tạo voucher!');
      setForm({ code:'', discount_type:'percent', discount_value:'', min_order:'', max_uses:'100', expires_at:'' });
      load();
    } catch(err) { setMsg('❌ ' + (err.response?.data?.error || err.message)); }
    finally { setAdding(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('Xóa voucher này?')) return;
    await api.delete(`/admin/vouchers/${id}`);
    load();
  };

  const TYPE_LABEL = { percent:'%', fixed:'Cố định (đ)' };
  const fmt = (n) => Number(n).toLocaleString('vi-VN');

  return (
    <div style={{ minHeight:'100vh', background:'#10131e', color:'#e8dcc8', padding:'28px 32px', fontFamily:'"Nunito",sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h2 style={{ fontFamily:FONT, color:'#FFD700', textShadow:HARD_SHADOW, margin:0, fontSize:'1.5rem' }}>
          🎫 Quản Lý Voucher
        </h2>
        <span style={{ color:'rgba(160,160,160,0.5)', fontSize:'0.85rem' }}>{vouchers.length} voucher</span>
      </div>

      {/* Create form */}
      <div style={{ background:'#111520', border:'1px solid rgba(255,215,0,0.15)', borderRadius:16, padding:'20px 24px', marginBottom:28 }}>
        <div style={{ fontFamily:FONT, color:'rgba(255,215,0,0.7)', fontSize:'0.88rem', textShadow:HARD_SHADOW, marginBottom:16 }}>
          TẠO VOUCHER MỚI
        </div>
        <form onSubmit={submit}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12, marginBottom:12 }}>
            <div>
              <label style={{ fontSize:'0.75rem', color:'rgba(200,190,160,0.5)', display:'block', marginBottom:4 }}>Mã Code *</label>
              <input value={form.code} onChange={e => setForm(f => ({...f, code:e.target.value.toUpperCase()}))}
                required placeholder="SALE20" style={{ ...INPUT, width:'100%', fontFamily:FONT, letterSpacing:'0.1em' }}/>
            </div>
            <div>
              <label style={{ fontSize:'0.75rem', color:'rgba(200,190,160,0.5)', display:'block', marginBottom:4 }}>Loại giảm *</label>
              <select value={form.discount_type} onChange={e => setForm(f=>({...f,discount_type:e.target.value}))}
                style={{ ...INPUT, width:'100%', appearance:'none', cursor:'pointer' }}>
                <option value="percent" style={{ background:'#111520' }}>Phần trăm (%)</option>
                <option value="fixed"   style={{ background:'#111520' }}>Cố định (đ)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:'0.75rem', color:'rgba(200,190,160,0.5)', display:'block', marginBottom:4 }}>
                Giá trị * {form.discount_type === 'percent' ? '(%)' : '(đ)'}
              </label>
              <input type="number" value={form.discount_value} onChange={e => setForm(f=>({...f,discount_value:e.target.value}))}
                required min="0" style={{ ...INPUT, width:'100%' }} placeholder={form.discount_type==='percent'?'20':'50000'}/>
            </div>
            <div>
              <label style={{ fontSize:'0.75rem', color:'rgba(200,190,160,0.5)', display:'block', marginBottom:4 }}>Đơn tối thiểu (đ)</label>
              <input type="number" value={form.min_order} onChange={e => setForm(f=>({...f,min_order:e.target.value}))}
                min="0" style={{ ...INPUT, width:'100%' }} placeholder="0"/>
            </div>
            <div>
              <label style={{ fontSize:'0.75rem', color:'rgba(200,190,160,0.5)', display:'block', marginBottom:4 }}>Số lượt dùng tối đa</label>
              <input type="number" value={form.max_uses} onChange={e => setForm(f=>({...f,max_uses:e.target.value}))}
                min="1" style={{ ...INPUT, width:'100%' }}/>
            </div>
            <div>
              <label style={{ fontSize:'0.75rem', color:'rgba(200,190,160,0.5)', display:'block', marginBottom:4 }}>Hết hạn (tuỳ chọn)</label>
              <input type="date" value={form.expires_at} onChange={e => setForm(f=>({...f,expires_at:e.target.value}))}
                style={{ ...INPUT, width:'100%', colorScheme:'dark' }}/>
            </div>
          </div>
          {msg && <div style={{ marginBottom:10, color:msg.startsWith('✅')?'#6AE030':'#FF8080', fontWeight:700, fontSize:'0.85rem' }}>{msg}</div>}
          <button type="submit" disabled={adding} style={{
            padding:'10px 28px', borderRadius:12, border:'3px solid #1a5a00', borderBottom:'5px solid #0a3a00',
            background: adding ? '#1a3a10' : 'linear-gradient(180deg,#6AE030,#279500)',
            color:'#fff', fontFamily:FONT, fontSize:'0.95rem', cursor: adding ? 'not-allowed' : 'pointer',
            textShadow:HARD_SHADOW, boxShadow:'inset 0 2px 0 rgba(255,255,255,0.3)',
          }}>➕ Tạo Voucher</button>
        </form>
      </div>

      {/* Table */}
      <div style={{ background:'#111520', border:'1px solid rgba(255,215,0,0.1)', borderRadius:16, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.85rem' }}>
          <thead>
            <tr style={{ background:'#1a1f2e', fontSize:'0.75rem', textTransform:'uppercase',
              letterSpacing:'0.05em', color:'#6a7a8a' }}>
              {['Mã Code','Loại','Giá trị','Đơn tối thiểu','Đã dùng / Tối đa','Hết hạn','Xoá'].map(h => (
                <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontWeight:700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vouchers.length === 0 && (
              <tr><td colSpan={7} style={{ padding:'3rem', textAlign:'center', color:'rgba(160,160,160,0.4)' }}>
                Chưa có voucher nào
              </td></tr>
            )}
            {vouchers.map(v => {
              const expired = v.expires_at && new Date(v.expires_at) < new Date();
              const full    = v.used_count >= v.max_uses;
              const statusColor = expired || full ? '#FF8080' : '#6AE030';
              return (
                <tr key={v.id} style={{ borderTop:'1px solid rgba(255,255,255,0.04)',
                  opacity: expired || full ? 0.55 : 1 }}>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ fontFamily:FONT, color:'#FFD700', textShadow:HARD_SHADOW,
                      background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.2)',
                      padding:'3px 12px', borderRadius:999, letterSpacing:'0.08em' }}>{v.code}</span>
                  </td>
                  <td style={{ padding:'12px 16px', color:'rgba(200,190,160,0.7)' }}>{TYPE_LABEL[v.discount_type]}</td>
                  <td style={{ padding:'12px 16px', color:'#6AE030', fontWeight:700 }}>
                    {v.discount_type==='percent' ? `${v.discount_value}%` : `${fmt(v.discount_value)}đ`}
                  </td>
                  <td style={{ padding:'12px 16px', color:'rgba(200,190,160,0.6)' }}>
                    {v.min_order > 0 ? `${fmt(v.min_order)}đ` : '—'}
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ color: statusColor, fontWeight:700 }}>{v.used_count}</span>
                    <span style={{ color:'rgba(160,160,160,0.4)' }}> / {v.max_uses}</span>
                  </td>
                  <td style={{ padding:'12px 16px', color: expired ? '#FF8080' : 'rgba(200,190,160,0.6)', fontSize:'0.8rem' }}>
                    {v.expires_at ? new Date(v.expires_at).toLocaleDateString('vi-VN') : '∞ Không hạn'}
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <button onClick={() => remove(v.id)} style={{
                      background:'rgba(255,50,50,0.1)', border:'1px solid rgba(255,80,80,0.3)',
                      color:'#FF8080', borderRadius:8, padding:'4px 12px', cursor:'pointer',
                      fontFamily:'"Nunito",sans-serif', fontWeight:700, fontSize:'0.8rem',
                    }}>🗑 Xóa</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
