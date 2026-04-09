import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { Check, X } from 'lucide-react';

const FONT = '"Lilita One", cursive';
const HARD_SHADOW = '-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000,0px 2px 0 #000';

export default function AdminTopup() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  const load = useCallback(async () => {
    try { const r = await api.get('/admin/topup'); setRequests(r.data.requests || []); }
    catch(e) { console.error(e); }
  }, []);
  
  useEffect(() => { load(); }, [load]);

  const handleAction = async (id, actionType) => {
    if (!window.confirm(`Xác nhận ${actionType === 'approve' ? 'DUYỆT' : 'TỪ CHỐI'} yêu cầu nạp tiền này?`)) return;
    try {
      await api.patch(`/admin/topup/${id}/${actionType}`);
      load();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.error || err.message));
    }
  };

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);

  const STATUS_COLOR = { pending: '#FFD700', approved: '#6AE030', rejected: '#FF5E5E' };
  const STATUS_BG    = { pending: 'rgba(255,215,0,0.1)', approved: 'rgba(106,224,48,0.1)', rejected: 'rgba(255,94,94,0.1)' };
  const STATUS_LABEL = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Đã hủy' };

  return (
    <div style={{ minHeight:'100vh', background:'#10131e', color:'#e8dcc8', padding:'28px 32px', fontFamily:'"Nunito",sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24 }}>
        <div>
          <h2 style={{ fontFamily:FONT, color:'#FFD700', textShadow:HARD_SHADOW, margin:0, fontSize:'1.6rem', letterSpacing:'0.05em' }}>
            💰 QUẢN LÝ NẠP TIỀN
          </h2>
          <div style={{ color:'rgba(160,160,160,0.6)', marginTop:4, fontWeight:700 }}>
            {requests.length} yêu cầu gửi đến vương quốc
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div style={{ display:'flex', gap:8, background:'rgba(255,255,255,0.05)', padding:'4px', borderRadius:14, border:'1px solid rgba(255,215,0,0.15)' }}>
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding:'8px 16px', border:'none', borderRadius:10, cursor:'pointer',
              fontFamily:FONT, letterSpacing:'0.05em', transition:'all 0.2s',
              background: filter === f ? (f === 'pending'?'#FFD700':f==='approved'?'#6AE030':f==='rejected'?'#FF5E5E':'rgba(255,215,0,0.5)') : 'transparent',
              color: filter === f ? '#10131e' : 'rgba(200,200,200,0.5)',
            }}>
              {f === 'all' ? 'Tất cả' : STATUS_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background:'#111520', border:'1px solid rgba(255,215,0,0.15)', borderRadius:16, overflow:'hidden', boxShadow:'0 10px 30px rgba(0,0,0,0.4)' }}>
        <div className="dml-scroll" style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.85rem' }}>
            <thead>
              <tr style={{ background:'#1a1f2e', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em', color:'#6a7a8a' }}>
                <th style={{ padding:'14px 20px', textAlign:'left', fontWeight:800 }}>ID</th>
                <th style={{ padding:'14px 20px', textAlign:'left', fontWeight:800 }}>Người dùng</th>
                <th style={{ padding:'14px 20px', textAlign:'right', fontWeight:800 }}>Số tiền (đ)</th>
                <th style={{ padding:'14px 20px', textAlign:'left', fontWeight:800 }}>Mã GD / Ghi chú</th>
                <th style={{ padding:'14px 20px', textAlign:'center', fontWeight:800 }}>Thời gian</th>
                <th style={{ padding:'14px 20px', textAlign:'center', fontWeight:800 }}>Trạng thái</th>
                <th style={{ padding:'14px 20px', textAlign:'center', fontWeight:800 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding:'4rem', textAlign:'center', color:'rgba(160,160,160,0.4)' }}>Không có yêu cầu nào</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} style={{ borderTop:'1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding:'14px 20px', color:'rgba(160,160,160,0.6)' }}>#{r.id}</td>
                  <td style={{ padding:'14px 20px' }}>
                    <div style={{ fontFamily:FONT, color:'#e8dcc8', fontSize:'0.95rem', letterSpacing:'0.05em' }}>{r.username}</div>
                    <div style={{ color:'rgba(160,160,160,0.5)', fontSize:'0.75rem' }}>{r.email}</div>
                  </td>
                  <td style={{ padding:'14px 20px', textAlign:'right', color:'#FFD700', fontFamily:FONT, fontSize:'1.05rem', textShadow:HARD_SHADOW }}>
                    +{Number(r.amount).toLocaleString('vi-VN')}
                  </td>
                  <td style={{ padding:'14px 20px' }}>
                    <div style={{ display:'inline-block', padding:'2px 8px', background:'rgba(255,255,255,0.05)', borderRadius:6, color:'rgba(200,200,180,0.7)', fontSize:'0.75rem', fontWeight:800, marginBottom:4 }}>
                      {r.method.toUpperCase()}
                    </div>
                    {r.note && <div style={{ color:'#e8dcc8', fontSize:'0.85rem' }}>{r.note}</div>}
                  </td>
                  <td style={{ padding:'14px 20px', textAlign:'center', color:'rgba(160,160,160,0.5)' }}>
                    {new Date(r.created_at).toLocaleString('vi-VN')}
                  </td>
                  <td style={{ padding:'14px 20px', textAlign:'center' }}>
                    <div style={{ 
                      display:'inline-block', padding:'4px 12px', borderRadius:20, 
                      background:STATUS_BG[r.status], border:`1px solid ${STATUS_COLOR[r.status]}40`,
                      color:STATUS_COLOR[r.status], fontFamily:'"Nunito",sans-serif', fontWeight:800, fontSize:'0.78rem' 
                    }}>
                      {STATUS_LABEL[r.status]}
                    </div>
                  </td>
                  <td style={{ padding:'14px 20px', textAlign:'center' }}>
                    {r.status === 'pending' ? (
                      <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
                        <button onClick={() => handleAction(r.id, 'approve')} title="Duyệt" style={{
                          background:'linear-gradient(180deg,#6AE030,#279500)', border:'2px solid #1a5a00',
                          color:'#fff', width:34, height:34, borderRadius:8, cursor:'pointer', display:'grid', placeItems:'center'
                        }}><Check size={18} strokeWidth={3}/></button>
                        <button onClick={() => handleAction(r.id, 'reject')} title="Từ chối" style={{
                          background:'linear-gradient(180deg,#FF5E5E,#CC0000)', border:'2px solid #800000',
                          color:'#fff', width:34, height:34, borderRadius:8, cursor:'pointer', display:'grid', placeItems:'center'
                        }}><X size={18} strokeWidth={3}/></button>
                      </div>
                    ) : (
                      <span style={{ color:'rgba(160,160,160,0.3)', fontSize:'0.8rem' }}>Đã xử lý</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
