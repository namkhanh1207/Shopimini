import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingCart, ChevronRight } from 'lucide-react';
import { FaCoins } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const FONT        = '"Lilita One", cursive';
const HARD_SHADOW = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 2px 0 #000';

const INPUT_STYLE = {
  width: '100%', padding: '11px 14px', borderRadius: 12,
  border: '2px solid rgba(201,162,39,0.3)', background: 'rgba(255,255,255,0.06)',
  color: '#e8dcc8', fontFamily: '"Nunito", sans-serif', fontWeight: 700,
  fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box',
};

export default function CartModal({ isOpen, onClose }) {
  const { customer, reload: reloadAuth } = useAuth();
  const [step, setStep]   = useState('cart');
  const [cart, setCart]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [placing, setPlacing]   = useState(false);
  const [form, setForm]   = useState({ name: '', email: '', address: '' });
  const [orderDone, setOrderDone] = useState(false);

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherResult, setVoucherResult] = useState(null);
  const [voucherError, setVoucherError]   = useState('');
  const [checkingVoucher, setCheckingVoucher] = useState(false);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const loadCart = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get('/cart'); setCart(r.data.cart || []); }
    catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadCart();
      setStep('cart'); setOrderDone(false);
      setVoucherCode(''); setVoucherResult(null); setVoucherError('');
      setPaymentMethod('cod');
      // Pre-fill form from customer
      if (customer) setForm(f => ({ ...f, name: customer.username, email: customer.email }));
    }
  }, [isOpen, loadCart, customer]);

  const updateQty = async (id, qty) => {
    await api.post('/cart/update', { productId: id, quantity: qty });
    loadCart();
    window.dispatchEvent(new Event('cart_updated'));
  };

  // Voucher check
  const checkVoucher = async () => {
    if (!voucherCode.trim()) return;
    setCheckingVoucher(true); setVoucherError(''); setVoucherResult(null);
    try {
      const r = await api.post('/voucher/check', { code: voucherCode, order_total: subtotal });
      setVoucherResult(r.data);
    } catch(err) { setVoucherError(err.response?.data?.error || 'Mã không hợp lệ'); }
    finally { setCheckingVoucher(false); }
  };

  const subtotal = cart.reduce((s, it) => s + it.price * it.quantity, 0);
  const discount = voucherResult?.discount || 0;
  const total    = subtotal - discount;

  const balanceOk = customer && customer.balance >= total;

  const handleCheckout = async () => {
    if (!form.name || !form.address) { alert('Vui lòng điền họ tên và địa chỉ!'); return; }
    if (paymentMethod === 'balance' && !customer) { alert('Phải đăng nhập để thanh toán bằng số dư!'); return; }
    if (paymentMethod === 'balance' && !balanceOk) { alert('Số dư không đủ!'); return; }
    setPlacing(true);
    try {
      await api.post('/checkout', {
        customer_name: form.name,
        customer_address: form.address,
        voucher_code: voucherResult ? voucherCode : undefined,
        payment_method: paymentMethod,
      });
      setOrderDone(true);
      window.dispatchEvent(new Event('cart_updated'));
      if (paymentMethod === 'balance') reloadAuth(); // refresh balance
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.error || err.message));
    } finally { setPlacing(false); }
  };

  const handleClose = () => { onClose(); setStep('cart'); setOrderDone(false); };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'absolute', inset:0, background:'rgba(0,0,15,0.82)', backdropFilter:'blur(8px)' }}
            onClick={handleClose} />

          <motion.div
            initial={{ scale:0.88, y:40, opacity:0 }}
            animate={{ scale:1, y:0, opacity:1 }}
            exit={{ scale:0.88, y:40, opacity:0 }}
            transition={{ type:'spring', stiffness:260, damping:24 }}
            style={{
              position:'relative', zIndex:10, width:'100%', maxWidth:580,
              background:'linear-gradient(175deg,#0e1728,#09111f)',
              border:'4px solid #C9A227', borderRadius:24,
              boxShadow:'0 0 0 2px rgba(255,215,0,0.12), 0 0 50px rgba(200,162,0,0.2), 0 30px 80px rgba(0,0,0,0.7)',
              maxHeight:'92vh', display:'flex', flexDirection:'column', overflow:'hidden',
            }}
          >
            {/* HEADER */}
            <div style={{
              padding:'14px 20px', borderBottom:'2px solid rgba(255,215,0,0.18)',
              display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0,
              background:'linear-gradient(90deg,rgba(201,162,39,0.12),transparent)',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <ShoppingCart size={22} color="#FFD700" strokeWidth={2.5}/>
                <span onClick={() => !orderDone && setStep('cart')} style={{
                  fontFamily:FONT, fontSize:'1.2rem', color: step==='cart' ? '#FFD700' : 'rgba(255,215,0,0.5)',
                  cursor: step!=='cart' && !orderDone ? 'pointer' : 'default', textShadow:HARD_SHADOW,
                }}>THE HOARD</span>
                {step === 'checkout' && (<>
                  <ChevronRight size={16} color="rgba(255,215,0,0.4)"/>
                  <span style={{ fontFamily:FONT, fontSize:'1.2rem', color:'#FFD700', textShadow:HARD_SHADOW }}>CHECKOUT</span>
                </>)}
              </div>
              <button onClick={handleClose} style={{
                width:34, height:34, borderRadius:'50%', background:'linear-gradient(180deg,#FF5E5E,#CC0000)',
                border:'2px solid #800000', color:'#fff', cursor:'pointer', display:'grid', placeItems:'center',
                boxShadow:'0 3px 0 #660000',
              }}><X size={16} strokeWidth={3}/></button>
            </div>

            {/* CONTENT */}
            <div style={{ flex:1, overflowY:'auto', minHeight:0 }} className="dml-scroll">

              {/* ORDER DONE */}
              {orderDone && (
                <div style={{ padding:'3rem 2rem', textAlign:'center' }}>
                  <div style={{ fontSize:'4rem', marginBottom:16 }}>🏆</div>
                  <h3 style={{ fontFamily:FONT, color:'#FFD700', fontSize:'1.6rem', textShadow:HARD_SHADOW, marginBottom:10 }}>ORDER COMPLETE!</h3>
                  <p style={{ color:'rgba(200,200,200,0.75)', fontFamily:'"Nunito",sans-serif', fontWeight:700, marginBottom:28 }}>
                    Đơn hàng đã được ghi nhận. Chúng tôi sẽ liên hệ sớm!
                  </p>
                  <button onClick={handleClose} className="btn-dml btn-dml-green"
                    style={{ height:48, fontSize:'1rem', borderRadius:14, padding:'0 28px' }}>
                    ✨ Tiếp tục mua sắm
                  </button>
                </div>
              )}

              {/* CART STEP */}
              {!orderDone && step === 'cart' && (
                <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:10 }}>
                  {loading && <div style={{ textAlign:'center', padding:'3rem', fontFamily:FONT, color:'#FFD700' }}>Loading...</div>}
                  {!loading && cart.length === 0 && (
                    <div style={{ textAlign:'center', padding:'3rem 1rem' }}>
                      <div style={{ fontSize:'4rem', marginBottom:12 }}>🪹</div>
                      <p style={{ fontFamily:FONT, color:'#8a7a62', fontSize:'1.1rem', textShadow:HARD_SHADOW }}>Giỏ hàng trống!</p>
                    </div>
                  )}
                  {!loading && cart.map(item => (
                    <motion.div key={item.id} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
                      style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(255,255,255,0.04)',
                        border:'1px solid rgba(255,215,0,0.12)', borderRadius:14, padding:'10px 12px' }}>
                      <img src={item.image || `https://picsum.photos/seed/${item.id}/80`} alt={item.name}
                        style={{ width:54, height:54, borderRadius:10, objectFit:'cover', border:'2px solid rgba(255,215,0,0.25)', background:'#0f111a' }}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:FONT, color:'#e8dcc8', fontSize:'0.88rem', textShadow:HARD_SHADOW,
                          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</div>
                        <div style={{ color:'#FFD700', fontWeight:800, fontSize:'0.8rem', fontFamily:'"Nunito",sans-serif' }}>
                          🪙 {Number(item.price).toLocaleString('vi-VN')} đ × {item.quantity}
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                        {[['−', item.quantity-1], ['+', item.quantity+1]].map(([lbl, qty], i) => (
                          <button key={i} onClick={() => updateQty(item.id, qty)} style={{
                            width:26, height:26, borderRadius:7,
                            background:'rgba(255,255,255,0.09)', border:'1px solid rgba(255,255,255,0.18)',
                            color:'#fff', fontWeight:900, cursor:'pointer', fontSize:'1.05rem',
                          }}>{lbl}</button>
                        ))}
                        <span style={{ color:'#fff', fontWeight:900, minWidth:18, textAlign:'center', fontSize:'0.85rem' }}>{item.quantity}</span>
                      </div>
                      <button onClick={() => updateQty(item.id, 0)} style={{ color:'#FF6B6B', background:'none', border:'none', cursor:'pointer', padding:4 }}>
                        <Trash2 size={17}/>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* CHECKOUT STEP */}
              {!orderDone && step === 'checkout' && (
                <div style={{ padding:'18px 20px', display:'flex', flexDirection:'column', gap:14 }}>
                  {/* Customer info */}
                  {[
                    { label:'Họ tên', key:'name', placeholder:'Dragon Master', type:'text' },
                    { label:'Email',  key:'email', placeholder:'hero@realm.vn', type:'email' },
                    { label:'Địa chỉ', key:'address', placeholder:'Số nhà, đường, tỉnh/thành...', type:'text' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontFamily:FONT, color:'rgba(255,215,0,0.7)', fontSize:'0.8rem', textShadow:HARD_SHADOW, display:'block', marginBottom:6 }}>{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={INPUT_STYLE}
                        onFocus={e => e.target.style.borderColor='#FFD700'}
                        onBlur={e  => e.target.style.borderColor='rgba(201,162,39,0.3)'}/>
                    </div>
                  ))}

                  {/* ══ VOUCHER ══ */}
                  <div>
                    <label style={{ fontFamily:FONT, color:'rgba(255,215,0,0.7)', fontSize:'0.8rem', textShadow:HARD_SHADOW, display:'block', marginBottom:6 }}>
                      🎫 Mã Voucher
                    </label>
                    <div style={{ display:'flex', gap:8 }}>
                      <input value={voucherCode} onChange={e => { setVoucherCode(e.target.value.toUpperCase()); setVoucherResult(null); setVoucherError(''); }}
                        placeholder="Nhập mã..." style={{ ...INPUT_STYLE, flex:1, fontFamily:FONT, letterSpacing:'0.1em' }}
                        onFocus={e => e.target.style.borderColor='#FFD700'}
                        onBlur={e  => e.target.style.borderColor='rgba(201,162,39,0.3)'}/>
                      <button onClick={checkVoucher} disabled={checkingVoucher || !voucherCode.trim()} style={{
                        padding:'0 16px', borderRadius:12, border:'2px solid rgba(100,200,80,0.5)', borderBottom:'4px solid rgba(60,140,40,0.6)',
                        background:'rgba(100,200,80,0.15)', color:'#6AE030', fontFamily:FONT, fontSize:'0.85rem',
                        cursor: checkingVoucher ? 'not-allowed' : 'pointer', whiteSpace:'nowrap', flexShrink:0,
                      }}>{checkingVoucher ? '...' : 'Áp dụng'}</button>
                    </div>
                    {voucherError && <div style={{ color:'#FF8080', fontFamily:'"Nunito",sans-serif', fontWeight:700, fontSize:'0.78rem', marginTop:4 }}>⚠ {voucherError}</div>}
                    {voucherResult && <div style={{ color:'#6AE030', fontFamily:'"Nunito",sans-serif', fontWeight:700, fontSize:'0.78rem', marginTop:4 }}>
                      ✅ Giảm {Number(discount).toLocaleString('vi-VN')}đ ({voucherResult.voucher.discount_type === 'percent' ? `${voucherResult.voucher.discount_value}%` : 'cố định'})
                    </div>}
                  </div>

                  {/* ══ PAYMENT METHOD ══ */}
                  <div>
                    <label style={{ fontFamily:FONT, color:'rgba(255,215,0,0.7)', fontSize:'0.8rem', textShadow:HARD_SHADOW, display:'block', marginBottom:8 }}>
                      💳 Phương Thức Thanh Toán
                    </label>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {[
                        { value:'cod',     label:'💵 Thanh toán khi nhận hàng (COD)', desc: 'Trả tiền mặt khi giao' },
                        { value:'balance', label:'💰 Số dư tài khoản', desc: customer
                          ? `Số dư: ${Number(customer.balance).toLocaleString('vi-VN')}đ${!balanceOk ? ' (Không đủ)' : ''}` 
                          : 'Cần đăng nhập để dùng' },
                      ].map(pm => (
                        <label key={pm.value} style={{
                          display:'flex', alignItems:'flex-start', gap:12, padding:'12px 14px', borderRadius:12, cursor:'pointer',
                          border: paymentMethod===pm.value ? '2px solid #FFD700' : '2px solid rgba(255,215,0,0.15)',
                          background: paymentMethod===pm.value ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.03)',
                          opacity: (pm.value==='balance' && !customer) ? 0.5 : 1,
                        }}>
                          <input type="radio" name="payment" value={pm.value} checked={paymentMethod===pm.value}
                            onChange={() => pm.value==='balance' && !customer ? null : setPaymentMethod(pm.value)}
                            disabled={pm.value==='balance' && !customer}
                            style={{ marginTop:3, accentColor:'#FFD700' }}/>
                          <div>
                            <div style={{ fontFamily:FONT, color:'#e8dcc8', fontSize:'0.88rem', textShadow: paymentMethod===pm.value ? HARD_SHADOW : 'none' }}>{pm.label}</div>
                            <div style={{ fontFamily:'"Nunito",sans-serif', fontSize:'0.75rem', color: (pm.value==='balance' && customer && !balanceOk) ? '#FF8080' : 'rgba(160,150,130,0.6)', marginTop:2 }}>{pm.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Order summary */}
                  <div style={{ padding:'12px 14px', borderRadius:12, background:'rgba(255,215,0,0.05)', border:'1px solid rgba(255,215,0,0.15)' }}>
                    <div style={{ fontFamily:FONT, color:'rgba(255,215,0,0.6)', fontSize:'0.75rem', marginBottom:6, textShadow:HARD_SHADOW }}>ORDER SUMMARY</div>
                    {cart.map(it => (
                      <div key={it.id} style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ color:'rgba(220,210,185,0.8)', fontFamily:'"Nunito",sans-serif', fontWeight:700, fontSize:'0.82rem' }}>{it.name} ×{it.quantity}</span>
                        <span style={{ color:'#FFD700', fontFamily:'"Nunito",sans-serif', fontWeight:900, fontSize:'0.82rem' }}>{(it.price*it.quantity).toLocaleString('vi-VN')}đ</span>
                      </div>
                    ))}
                    {discount > 0 && (
                      <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, paddingTop:6, borderTop:'1px dashed rgba(100,200,80,0.3)' }}>
                        <span style={{ color:'#6AE030', fontFamily:'"Nunito",sans-serif', fontWeight:700, fontSize:'0.82rem' }}>🎫 Giảm giá voucher</span>
                        <span style={{ color:'#6AE030', fontFamily:'"Nunito",sans-serif', fontWeight:900, fontSize:'0.82rem' }}>-{discount.toLocaleString('vi-VN')}đ</span>
                      </div>
                    )}
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, paddingTop:8, borderTop:'1px solid rgba(255,215,0,0.2)' }}>
                      <span style={{ fontFamily:FONT, color:'rgba(255,215,0,0.8)', fontSize:'0.9rem', textShadow:HARD_SHADOW }}>TỔNG THANH TOÁN</span>
                      <span style={{ fontFamily:FONT, fontSize:'1rem', color:'#FFD700', textShadow:HARD_SHADOW }}>{total.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            {!orderDone && (
              <div style={{ padding:'14px 18px', borderTop:'2px solid rgba(255,215,0,0.15)', flexShrink:0 }}>
                {step === 'cart' && cart.length > 0 && (
                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                      <span style={{ fontFamily:'"Nunito",sans-serif', fontWeight:800, color:'rgba(180,170,150,0.8)', fontSize:'0.9rem' }}>Tổng cộng</span>
                      <span style={{ fontFamily:FONT, fontSize:'1.3rem', color:'#FFD700', textShadow:HARD_SHADOW }}>🪙 {subtotal.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <button onClick={() => setStep('checkout')} style={{
                      width:'100%', height:52, borderRadius:16,
                      border:'3px solid #7a4400', borderBottom:'6px solid #7a4400',
                      background:'linear-gradient(90deg,#FFC107 0%,#FF8C00 30%,#FFD700 55%,#FFA000 80%,#FF8C00 100%)',
                      backgroundSize:'200% auto', color:'#1a0a00', fontFamily:FONT, fontSize:'1.1rem', cursor:'pointer',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                      textShadow:'0 1px 0 rgba(255,255,255,0.4)', boxShadow:'inset 0 3px 0 rgba(255,255,255,0.45)',
                      animation:'shimmer 2s linear infinite',
                    }}>✨ Tiến hành thanh toán ➜</button>
                  </div>
                )}
                {step === 'checkout' && (
                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={() => setStep('cart')} style={{
                      height:52, padding:'0 18px', borderRadius:16,
                      border:'2px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.07)',
                      color:'rgba(200,200,200,0.8)', fontFamily:FONT, fontSize:'0.9rem', cursor:'pointer',
                    }}>← Quay lại</button>
                    <button onClick={handleCheckout} disabled={placing || (paymentMethod==='balance' && !balanceOk)} style={{
                      flex:1, height:52, borderRadius:16,
                      border:'4px solid #106300', borderBottom:'6px solid #074200',
                      background: (placing || (paymentMethod==='balance' && !balanceOk)) ? '#3a6b30' : 'linear-gradient(180deg,#6AE030,#279500)',
                      color:'#fff', fontFamily:FONT, fontSize:'1.05rem',
                      cursor: (placing || (paymentMethod==='balance' && !balanceOk)) ? 'not-allowed' : 'pointer',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                      boxShadow:'inset 0 3px 0 rgba(255,255,255,0.4)', textShadow:HARD_SHADOW,
                    }}>
                      <FaCoins size={18} color="#FFD700" style={{ marginRight:6 }}/>
                      {placing ? 'Đang xử lý...' : `Đặt hàng – ${total.toLocaleString('vi-VN')}đ`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
