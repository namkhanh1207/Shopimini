import React, { useState, useEffect } from 'react';
import api from '../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Users, Clock } from 'lucide-react';

const FONT = '"Lilita One", cursive';
const HARD_SHADOW = '-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000,0px 3px 0 #000';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(e => console.error(e));
  }, []);

  if (!stats) return <div style={{ color:'#e8dcc8', padding:40, fontFamily:FONT, fontSize:'1.5rem', textShadow:HARD_SHADOW }}>Đang tải dữ liệu Vương Quốc...</div>;

  const STAT_CARDS = [
    { title: 'Tổng Doanh Thu', value: `${(stats.totalRevenue || 0).toLocaleString('vi-VN')} đ`, icon: <DollarSign size={28} color="#FFD700" />, bg: 'linear-gradient(135deg,rgba(255,215,0,0.1) 0%,rgba(200,150,0,0.2) 100%)', border: 'rgba(255,215,0,0.4)', text: '#FFD700' },
    { title: 'Đơn Hàng', value: stats.totalOrders || 0, icon: <ShoppingBag size={28} color="#00D4FF" />, bg: 'linear-gradient(135deg,rgba(0,212,255,0.1) 0%,rgba(0,100,200,0.2) 100%)', border: 'rgba(0,212,255,0.4)', text: '#00D4FF' },
    { title: 'Người Chơi', value: stats.totalCustomers || 0, icon: <Users size={28} color="#6AE030" />, bg: 'linear-gradient(135deg,rgba(106,224,48,0.1) 0%,rgba(40,150,0,0.2) 100%)', border: 'rgba(106,224,48,0.4)', text: '#6AE030' },
    { title: 'Chờ Duyệt Nạp Tiền', value: stats.pendingTopups || 0, icon: <Clock size={28} color="#FF5E5E" />, bg: 'linear-gradient(135deg,rgba(255,94,94,0.1) 0%,rgba(200,0,0,0.2) 100%)', border: 'rgba(255,94,94,0.4)', text: '#FF5E5E' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'#10131e', color:'#e8dcc8', padding:'28px 32px', fontFamily:'"Nunito",sans-serif' }}>
      <h2 style={{ fontFamily:FONT, color:'#FFD700', textShadow:HARD_SHADOW, margin:0, fontSize:'1.8rem', letterSpacing:'0.05em' }}>
        🔮 TỔNG QUAN VƯƠNG QUỐC
      </h2>
      <p style={{ color:'rgba(160,160,160,0.6)', marginTop:6, marginBottom:28, fontWeight:700 }}>
        Dữ liệu thống kê doanh thu và hoạt động
      </p>

      {/* Grid Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:20, marginBottom:32 }}>
        {STAT_CARDS.map((c, i) => (
          <div key={i} style={{
            background: c.bg, border:`2px solid ${c.border}`, borderRadius:16, padding:'20px 24px',
            display:'flex', alignItems:'center', gap:16, boxShadow:'0 8px 24px rgba(0,0,0,0.4), inset 0 2px 20px rgba(255,255,255,0.03)'
          }}>
            <div style={{ padding:12, borderRadius:'50%', background:'rgba(0,0,0,0.4)', border:`1px solid ${c.border}`, display:'grid', placeItems:'center' }}>
              {c.icon}
            </div>
            <div>
              <div style={{ fontSize:'0.85rem', color:'rgba(220,220,200,0.6)', textTransform:'uppercase', fontWeight:800, letterSpacing:'0.05em', marginBottom:4 }}>
                {c.title}
              </div>
              <div style={{ fontFamily:FONT, fontSize:'1.6rem', color:c.text, textShadow:HARD_SHADOW }}>
                {c.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background:'#111520', border:'2px solid rgba(255,215,0,0.15)', borderRadius:20, padding:'24px 32px', boxShadow:'0 10px 30px rgba(0,0,0,0.5)' }}>
        <h3 style={{ fontFamily:FONT, color:'#00D4FF', fontSize:'1.3rem', textShadow:HARD_SHADOW, marginTop:0, marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
          📈 Biểu Đồ Doanh Thu 30 Ngày Tới
        </h3>
        {stats.chartData && stats.chartData.length > 0 ? (
          <div style={{ width:'100%', height:350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(200,200,180,0.4)" tick={{fill:'rgba(200,200,180,0.6)', fontSize:12}} tickMargin={10} axisLine={{stroke:'rgba(255,255,255,0.1)'}} />
                <YAxis stroke="rgba(200,200,180,0.4)" tick={{fill:'rgba(200,200,180,0.6)', fontSize:12}} axisLine={false} tickLine={false} tickFormatter={(val) => `${(val/1000)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor:'rgba(10,15,30,0.95)', border:'1px solid rgba(0,212,255,0.4)', borderRadius:12, fontFamily:FONT, color:'#FFD700', boxShadow:'0 4px 20px rgba(0,0,0,0.8)' }}
                  itemStyle={{ color:'#00D4FF' }} labelStyle={{ color:'rgba(255,255,255,0.5)', fontFamily:'"Nunito",sans-serif', fontSize:'0.8rem', marginBottom:8 }}
                  formatter={(value) => [Number(value).toLocaleString('vi-VN') + ' đ', 'Doanh thu']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#00D4FF" strokeWidth={4} dot={{ fill:'#00D4FF', stroke:'#111520', strokeWidth:3, r:6 }} activeDot={{ r:8, fill:'#FFD700', stroke:'#111520' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ textAlign:'center', padding:40, color:'rgba(160,160,160,0.4)', fontWeight:700 }}>
            Chưa có dữ liệu giao dịch trong 30 ngày qua.
          </div>
        )}
      </div>
    </div>
  );
}
