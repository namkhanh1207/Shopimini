const express = require('express');
const product = require('../models/product');
const order = require('../models/order');

const router = express.Router();

function cartMap(req) {
  if (!req.session.cart || typeof req.session.cart !== 'object') {
    req.session.cart = {};
  }
  return req.session.cart;
}

router.get('/products', (req, res) => {
  res.json(product.list());
});

router.get('/cart', (req, res) => {
  const cart = cartMap(req);
  const items = [];
  let total = 0;
  for (const [key, rawQty] of Object.entries(cart)) {
    const qty = Number(rawQty);
    if (!Number.isFinite(qty) || qty < 1) continue;
    const pid = Number(key);
    const p = product.findById(pid);
    if (!p) continue;
    const lineTotal = p.price * qty;
    total += lineTotal;
    items.push({
      product: {
        id: p.id,
        name: p.name,
        price: p.price,
        image_url: p.image_url,
        stock: p.stock,
      },
      quantity: qty,
      lineTotal,
    });
  }
  res.json({ items, total });
});

router.post('/cart', (req, res) => {
  const productId = Number(req.body.productId);
  const addQty = Math.max(1, parseInt(req.body.quantity, 10) || 1);
  const p = product.findById(productId);
  if (!p) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
  const cart = cartMap(req);
  const key = String(productId);
  const current = Number(cart[key]) || 0;
  const next = current + addQty;
  if (next > p.stock) return res.status(400).json({ error: 'Không đủ tồn kho' });
  cart[key] = next;
  res.json({ ok: true });
});

router.patch('/cart/:productId', (req, res) => {
  const productId = Number(req.params.productId);
  const quantity = parseInt(req.body.quantity, 10);
  const p = product.findById(productId);
  if (!p) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
  const cart = cartMap(req);
  const key = String(productId);
  if (!Number.isFinite(quantity) || quantity < 1) {
    delete cart[key];
    return res.json({ ok: true });
  }
  if (quantity > p.stock) return res.status(400).json({ error: 'Không đủ tồn kho' });
  cart[key] = quantity;
  res.json({ ok: true });
});

router.delete('/cart/:productId', (req, res) => {
  const cart = cartMap(req);
  delete cart[String(req.params.productId)];
  res.json({ ok: true });
});

router.post('/checkout', (req, res) => {
  const customerName = String(req.body.customerName || '').trim();
  const customerAddress = String(req.body.customerAddress || '').trim();
  if (!customerName || !customerAddress) {
    return res.status(400).json({ error: 'Vui lòng nhập tên và địa chỉ' });
  }
  const cart = cartMap(req);
  const lines = Object.entries(cart)
    .map(([k, v]) => ({ productId: Number(k), quantity: Number(v) }))
    .filter((l) => Number.isFinite(l.productId) && Number.isFinite(l.quantity) && l.quantity > 0);
  if (lines.length === 0) return res.status(400).json({ error: 'Giỏ hàng trống' });
  try {
    const orderId = order.createFromCart(lines, customerName, customerAddress);
    req.session.cart = {};
    res.json({ ok: true, orderId });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Thanh toán thất bại' });
  }
});

module.exports = router;
