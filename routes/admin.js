const express = require('express');
const bcrypt = require('bcrypt');
const user = require('../models/user');
const product = require('../models/product');
const order = require('../models/order');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  const row = user.findByUsername(username);
  if (!row || row.role !== 'admin' || !bcrypt.compareSync(password, row.password)) {
    return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
  }
  req.session.adminUserId = row.id;
  res.json({ ok: true, user: { id: row.id, username: row.username, role: row.role } });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get('/session', requireAdmin, (req, res) => {
  const db = require('../db/database');
  const row = db
    .prepare('SELECT id, username, role FROM users WHERE id = ?')
    .get(req.session.adminUserId);
  if (!row || row.role !== 'admin') return res.status(401).json({ error: 'Phiên không hợp lệ' });
  res.json({ user: { id: row.id, username: row.username, role: row.role } });
});

router.use(requireAdmin);

router.get('/products', (req, res) => {
  res.json(product.list());
});

router.get('/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const p = product.findById(id);
  if (!p) return res.status(404).json({ error: 'Không tìm thấy' });
  res.json(p);
});

router.post('/products', (req, res) => {
  const { name, price, description, image_url, stock } = req.body;
  if (!name || price === undefined || price === null) {
    return res.status(400).json({ error: 'Thiếu tên hoặc giá' });
  }
  const p = product.create({ name, price, description, image_url, stock });
  res.status(201).json(p);
});

router.put('/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = product.findById(id);
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy' });
  const { name, price, description, image_url, stock } = req.body;
  if (!name || price === undefined || price === null) {
    return res.status(400).json({ error: 'Thiếu tên hoặc giá' });
  }
  res.json(product.update(id, { name, price, description, image_url, stock }));
});

router.delete('/products/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!product.findById(id)) return res.status(404).json({ error: 'Không tìm thấy' });
  try {
    product.remove(id);
    res.json({ ok: true });
  } catch (e) {
    if (e && e.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.status(409).json({ error: 'Không thể xóa: sản phẩm đã có trong đơn hàng' });
    }
    throw e;
  }
});

router.get('/orders', (req, res) => {
  res.json(order.listAll());
});

router.get('/orders/:id', (req, res) => {
  const id = Number(req.params.id);
  const o = order.findById(id);
  if (!o) return res.status(404).json({ error: 'Không tìm thấy' });
  res.json(o);
});

router.patch('/orders/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!order.findById(id)) return res.status(404).json({ error: 'Không tìm thấy' });
  const status = String(req.body.status || '').trim();
  if (!status) return res.status(400).json({ error: 'Thiếu trạng thái' });
  res.json(order.updateStatus(id, status));
});

module.exports = router;
