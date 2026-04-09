import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';

const FONT = '"Lilita One", cursive';
const HARD_SHADOW = '-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000,0px 3px 0 #000';

const INPUT = {
  padding: '10px 14px', borderRadius: 10,
  border: '2px solid rgba(201,162,39,0.3)', background: 'rgba(255,255,255,0.06)',
  color: '#e8dcc8', fontFamily: '"Nunito",sans-serif', fontWeight: 700, fontSize: '0.9rem',
  outline: 'none', boxSizing: 'border-box',
};

const SUBMIT_BTN = (submitting) => ({
  width:'100%', height:44, borderRadius:12, border:'3px solid #7a4400', borderBottom:'5px solid #5a3200',
  background: submitting ? '#5a4010' : 'linear-gradient(90deg,#FFC107 0%,#FF8C00 100%)',
  color:'#1a0a00', fontFamily:FONT, fontSize:'1.05rem', cursor: submitting ? 'not-allowed' : 'pointer'
});

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  
  // Modals
  const [modalType, setModalType] = useState(null); // 'balance', 'level', 'delete'
  const [editUser, setEditUser] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editLevel, setEditLevel] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try { const r = await api.get('/admin/customers'); setCustomers(r.data.customers || []); }
    catch(e) { console.error(e); }
  }, []);
  
  useEffect(() => { load(); }, [load]);

  const handleEditBalance = async (e) => {
    e.preventDefault();
    if (!editUser || !editAmount) return;
    setSubmitting(true);
    try {
      await api.patch(`/admin/customers/${editUser.id}/balance`, { amount: editAmount });
      setModalType(null);
      setEditUser(null);
      setEditAmount('');
      load();
    } catch(err) {
      alert('Lỗi: ' + (err.response?.data?.error || err.message));
    } finally { setSubmitting(false); }
  };

  const handleEditLevel = async (e) => {
    e.preventDefault();
    if (!editUser || !editLevel) return;
    setSubmitting(true);
    try {
      await api.patch(`/admin/customers/${editUser.id}/level`, { level: editLevel });
      setModalType(null);
      setEditUser(null);
      setEditLevel('');
      load();
    } catch(err) {
      alert('Lỗi: ' + (err.response?.data?.error || err.message));
    } finally { setSubmitting(false); }
  };

  const handleToggleBan = async (user) => {
    if (!window.confirm(`Bạn có chắc muốn ${user.is_banned ? 'Bỏ Cấm' : 'Cấm'} cư dân ${user.username} không?`)) return;
    try {
      await api.patch(`/admin/customers/${user.id}/ban`);
      load();
    } catch(err) {
      alert('Lỗi: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteUser = async () => {
    if (!editUser) return;
    setSubmitting(true);
    try {
      await api.delete(`/admin/customers/${editUser.id}`);
      setModalType(null);
      setEditUser(null);
      load();
    } catch(err) {
      alert('Lỗi: ' + (err.response?.data?.error || err.message));
    } finally { setSubmitting(false); }
  };

  const filtered = customers.filter(c => 
    c.username.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight:'100vh', background:'#10131e', color:'#e8dcc8', padding:'28px 32px', fontFamily:'"Nunito",sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24 }}>
        <div>
          <h2 style={{ fontFamily:FONT, color:'#FFD700', textShadow:HARD_SHADOW, margin:0, fontSize:'1.6rem', letterSpacing:'0.05em' }}>
            👥 QUẢN LÝ NGƯỜI CHƠI
          </h2>
          <div style={{ color:'rgba(160,160,160,0.6)', marginTop:4, fontWeight:700 }}>
            {customers.length} cư dân trong vương quốc
          </div>
        </div>
        
        <div style={{ position:'relative', width:300 }}>
          <Search size={18} color="rgba(255,215,0,0.5)" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm tên hoặc email..." 
            style={{ ...INPUT, width:'100%', paddingLeft:40 }} 
            onFocus={e => e.target.style.borderColor='#FFD700'} onBlur={e => e.target.style.borderColor='rgba(201,162,39,0.3)'}/>
        </div>
      </div>

      <div style={{ background:'#111520', border:'1px solid rgba(255,215,0,0.15)', borderRadius:16, overflow:'hidden', boxShadow:'0 10px 30px rgba(0,0,0,0.4)' }}>
        <div className="dml-scroll" style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.85rem' }}>
            <thead>
              <tr style={{ background:'#1a1f2e', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em', color:'#6a7a8a' }}>
                <th style={{ padding:'14px 20px', textAlign:'left', fontWeight:800 }}>Người chơi</th>
                <th style={{ padding:'14px 20px', textAlign:'left', fontWeight:800 }}>Level</th>
                <th style={{ padding:'14px 20px', textAlign:'right', fontWeight:800 }}>Số dư</th>
                <th style={{ padding:'14px 20px', textAlign:'center', fontWeight:800 }}>Đơn hàng</th>
                <th style={{ padding:'14px 20px', textAlign:'right', fontWeight:800 }}>Tổng nạp/chi</th>
                <th style={{ padding:'14px 20px', textAlign:'center', fontWeight:800 }}>Ngày gia nhập</th>
                <th style={{ padding:'14px 20px', textAlign:'center', fontWeight:800 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding:'4rem', textAlign:'center', color:'rgba(160,160,160,0.4)' }}>Không tìm thấy kết quả</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} style={{ 
                  borderTop:'1px solid rgba(255,255,255,0.04)',
                  opacity: c.is_banned ? 0.5 : 1,
                  background: c.is_banned ? 'rgba(255,0,0,0.02)' : 'transparent'
                }}>
                  <td style={{ padding:'14px 20px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <img src={c.avatar_url || `https://api.dicebear.com/8.x/bottts/svg?seed=${c.id}`} alt="ava" 
                        style={{ width:40, height:40, borderRadius:'50%', border:'2px solid rgba(255,215,0,0.4)', background:'#1a2030', objectFit:'cover' }}/>
                      <div>
                        <div style={{ fontFamily:FONT, color:'#e8dcc8', fontSize:'0.95rem', letterSpacing:'0.05em', display:'flex', alignItems:'center', gap:6 }}>
                          {c.username}
                          {c.is_banned && <span style={{ fontSize:'0.6rem', background:'#FF5E5E', color:'#fff', padding:'2px 6px', borderRadius:4, fontFamily:'sans-serif', fontWeight:900 }}>BỊ CẤM</span>}
                        </div>
                        <div style={{ color:'rgba(160,160,160,0.6)', fontSize:'0.75rem' }}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'14px 20px', color:'#00D4FF', fontWeight:900 }}>Lv.{c.level}</td>
                  <td style={{ padding:'14px 20px', textAlign:'right', color:'#FFD700', fontFamily:FONT, letterSpacing:'0.05em' }}>
                    🪙 {Number(c.balance).toLocaleString('vi-VN')} đ
                  </td>
                  <td style={{ padding:'14px 20px', textAlign:'center', color:'rgba(220,220,200,0.8)', fontWeight:800 }}>
                    {c.order_count || 0}
                  </td>
                  <td style={{ padding:'14px 20px', textAlign:'right', color:'#6AE030', fontWeight:800 }}>
                    {Number(c.total_spent || 0).toLocaleString('vi-VN')} đ
                  </td>
                  <td style={{ padding:'14px 20px', textAlign:'center', color:'rgba(160,160,160,0.5)' }}>
                    {new Date(c.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td style={{ padding:'14px 20px', textAlign:'center' }}>
                    <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
                      <button title="Chỉnh level" onClick={() => { setEditUser(c); setEditLevel(c.level); setModalType('level'); }} style={{
                        background:'rgba(0,212,255,0.1)', border:'1px solid rgba(0,212,255,0.4)', borderRadius:8, color:'#00D4FF', padding:'6px 10px',
                        cursor:'pointer', fontWeight:800, fontSize:'0.75rem'
                      }}>🆙</button>
                      
                      <button title="Biến động số dư" onClick={() => { setEditUser(c); setEditAmount(''); setModalType('balance'); }} style={{
                        background:'rgba(255,215,0,0.1)', border:'1px solid rgba(255,215,0,0.4)', borderRadius:8, color:'#FFD700', padding:'6px 10px',
                        cursor:'pointer', fontWeight:800, fontSize:'0.75rem'
                      }}>✨</button>

                      <button title={c.is_banned ? "Bỏ cấm" : "Cấm truy cập"} onClick={() => handleToggleBan(c)} style={{
                        background: c.is_banned ? 'rgba(106,224,48,0.1)' : 'rgba(255,94,94,0.1)', 
                        border: c.is_banned ? '1px solid #6AE030' : '1px solid #FF5E5E', 
                        borderRadius:8, color: c.is_banned ? '#6AE030' : '#FF5E5E', padding:'6px 10px',
                        cursor:'pointer', fontWeight:800, fontSize:'0.75rem'
                      }}>{c.is_banned ? '🔓' : '🚫'}</button>

                      <button title="Trục xuất" onClick={() => { setEditUser(c); setModalType('delete'); }} style={{
                        background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:8, color:'#fff', padding:'6px 10px',
                        cursor:'pointer', fontWeight:800, fontSize:'0.75rem'
                      }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {modalType && (
          <div style={{ position:'fixed', inset:0, zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ position:'absolute', inset:0, background:'rgba(0,0,15,0.85)', backdropFilter:'blur(5px)' }}
              onClick={() => setModalType(null)} />
              
            <motion.div initial={{ scale:0.9, y:20, opacity:0 }} animate={{ scale:1, y:0, opacity:1 }} exit={{ scale:0.9, y:20, opacity:0 }}
              style={{ position:'relative', background:'#111520', border:'3px solid #C9A227', borderRadius:20, padding:'24px 28px',
                width:'100%', maxWidth:400, boxShadow:'0 20px 60px rgba(0,0,0,0.8)' }}>
                
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <h3 style={{ margin:0, fontFamily:FONT, color:'#FFD700', fontSize:'1.3rem', textShadow:HARD_SHADOW }}>
                  {modalType === 'balance' && '💰 BIẾN ĐỘNG SỐ DƯ'}
                  {modalType === 'level' && '🆙 ĐIỀU CHỈNH LEVEL'}
                  {modalType === 'delete' && '⚠️ TRỤC XUẤT CƯ DÂN'}
                </h3>
                <button onClick={() => setModalType(null)} style={{ background:'none', border:'none', color:'#FF5E5E', cursor:'pointer' }}><X/></button>
              </div>

              <div style={{ marginBottom:16, padding:'12px', background:'rgba(255,255,255,0.05)', borderRadius:12, border:'1px dashed rgba(255,215,0,0.2)' }}>
                <div style={{ color:'rgba(200,200,200,0.6)', fontSize:'0.8rem', marginBottom:4 }}>Tài khoản đang chọn:</div>
                <div style={{ color:'#e8dcc8', fontFamily:FONT, fontSize:'1.1rem', letterSpacing:'0.05em' }}>{editUser.username}</div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
                  <span style={{ color:'rgba(160,160,160,0.6)', fontSize:'0.8rem' }}>Số dư hiện tại:</span>
                  <span style={{ color:'#FFD700', fontWeight:800 }}>🪙 {Number(editUser.balance).toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              {modalType === 'balance' && (
                <form onSubmit={handleEditBalance}>
                  <label style={{ display:'block', color:'rgba(255,215,0,0.7)', fontSize:'0.85rem', fontWeight:800, marginBottom:8 }}>
                    Số tiền biến động (đ)
                  </label>
                  <input type="number" required value={editAmount} onChange={e=>setEditAmount(e.target.value)}
                    placeholder="VD: 50000 hoặc -50000" style={{ ...INPUT, width:'100%', marginBottom:8 }}/>
                  <div style={{ color:'rgba(160,160,160,0.5)', fontSize:'0.75rem', marginBottom:20 }}>
                    Nhập số dương để <b>Cộng</b> thêm tiền, nhập số âm (có dấu -) để <b>Trừ</b> tiền.
                  </div>
                  <button type="submit" disabled={submitting} style={SUBMIT_BTN(submitting)}>
                    {submitting ? 'Đang xử lý...' : '⚡ THỰC THI'}
                  </button>
                </form>
              )}

              {modalType === 'level' && (
                <form onSubmit={handleEditLevel}>
                  <label style={{ display:'block', color:'rgba(255,215,0,0.7)', fontSize:'0.85rem', fontWeight:800, marginBottom:8 }}>
                    Level mới của cư dân
                  </label>
                  <input type="number" min="1" required value={editLevel} onChange={e=>setEditLevel(e.target.value)}
                    style={{ ...INPUT, width:'100%', marginBottom:20 }}/>
                  <button type="submit" disabled={submitting} style={SUBMIT_BTN(submitting)}>
                    {submitting ? 'Đang cập nhật...' : '🆙 CẬP NHẬT TRÌNH ĐỘ'}
                  </button>
                </form>
              )}

              {modalType === 'delete' && (
                <div>
                  <div style={{ color:'rgba(230,230,230,0.8)', marginBottom:24, lineHeight:1.6 }}>
                    Bạn có chắc chắn muốn <b>TRỤC XUẤT</b> cư dân <b>{editUser.username}</b> vĩnh viễn khỏi vương quốc? 
                    Hành động này không thể hoàn tác và sẽ xóa sạch hồ sơ của họ.
                  </div>
                  <div style={{ display:'flex', gap:12 }}>
                    <button onClick={() => setModalType(null)} style={{ flex:1, height:44, borderRadius:12, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', cursor:'pointer', fontWeight:800 }}>HỦY</button>
                    <button onClick={handleDeleteUser} disabled={submitting} style={{
                      flex:2, height:44, borderRadius:12, background:'linear-gradient(90deg,#FF5E5E 0%,#D00000 100%)', border:'3px solid #720000', borderBottom:'5px solid #4a0000',
                      color:'#fff', fontFamily:FONT, fontSize:'1.05rem', cursor: submitting ? 'not-allowed' : 'pointer'
                    }}>
                      {submitting ? 'Đang trục xuất...' : '🪓 XÁC NHẬN TRỤC XUẤT'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
