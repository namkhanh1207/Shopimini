const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'shoppimini_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// ===== CUSTOMER API ROUTES =====

app.get('/api/products', (req, res) => {
  const { game, rarity, attribute } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  let params = [];
  if (game) {
    sql += ' AND game = ?';
    params.push(game);
  }
  if (rarity && rarity !== 'All') {
    sql += ' AND rarity = ?';
    params.push(rarity);
  }
  if (attribute && attribute !== 'All') {
    sql += ' AND attributes LIKE ?';
    params.push(`%${attribute}%`);
  }
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Parse attributes to array for frontend
    const products = rows.map(r => ({
       ...r,
       attributes: r.attributes ? JSON.parse(r.attributes) : []
    }));
    res.json({ products });
  });
});

app.get('/api/game-info/:gameKey', (req, res) => {
  db.get('SELECT * FROM game_info WHERE game_key = ?', [req.params.gameKey], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Không tìm thấy thông tin game" });
    res.json(row);
  });
});

app.get('/api/cart', (req, res) => {
  if (!req.session.cart) req.session.cart = [];
  res.json({ cart: req.session.cart });
});

app.post('/api/cart/add', (req, res) => {
  const { productId, quantity } = req.body;
  if (!req.session.cart) req.session.cart = [];
  
  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    
    const existingItem = req.session.cart.find(item => item.id == productId);
    if (existingItem) {
      existingItem.quantity += parseInt(quantity);
    } else {
      req.session.cart.push({
        id: product.id, name: product.name, price: product.price,
        image: product.image, quantity: parseInt(quantity)
      });
    }
    res.json({ success: true, cart: req.session.cart });
  });
});

app.post('/api/cart/update', (req, res) => {
  const { productId, quantity } = req.body;
  if (!req.session.cart) return res.json({ success: false });
  
  const itemIndex = req.session.cart.findIndex(item => item.id == productId);
  if (itemIndex > -1) {
    if (quantity <= 0) req.session.cart.splice(itemIndex, 1);
    else req.session.cart[itemIndex].quantity = parseInt(quantity);
  }
  res.json({ success: true, cart: req.session.cart });
});

app.post('/api/checkout', (req, res) => {
  const { customer_name, customer_address } = req.body;
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.status(400).json({ error: "Giỏ hàng rỗng" });
  
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  db.run('INSERT INTO orders (customer_name, customer_address, total_price) VALUES (?, ?, ?)',
    [customer_name, customer_address, totalPrice], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      const orderId = this.lastID;
      
      const placeholders = cart.map(() => '(?, ?, ?, ?)').join(',');
      const values = [];
      cart.forEach(item => values.push(orderId, item.id, item.quantity, item.price));
      
      db.run(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ${placeholders}`, values, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        req.session.cart = []; // Làm sạch giỏ
        res.json({ success: true, orderId });
      });
  });
});

// ===== ADMIN API ROUTES =====
// Dùng middleware kiểm tra đăng nhập
const isAdmin = (req, res, next) => {
  if (req.session.adminId) return next();
  res.status(401).json({ error: "Unauthorized" });
};

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Sai định danh" });
    }
    req.session.adminId = user.id;
    res.json({ success: true });
  });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/admin/check', (req, res) => {
  res.json({ loggedIn: !!req.session.adminId });
});

app.post('/api/admin/products', isAdmin, (req, res) => {
  const { name, price, image, description, game, rarity, attributes, unlockDate, requiredLevel } = req.body;
  const attrStr = attributes ? JSON.stringify(attributes) : '[]';
  db.run('INSERT INTO products (name, price, image, description, game, rarity, attributes, unlockDate, requiredLevel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [name, price, image, description, game, rarity, attrStr, unlockDate || null, requiredLevel || null], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
  });
});

app.delete('/api/admin/products/:id', isAdmin, (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.put('/api/admin/products/:id', isAdmin, (req, res) => {
  const { name, price, image, description, game, rarity, attributes, unlockDate, requiredLevel } = req.body;
  const attrStr = attributes ? JSON.stringify(attributes) : '[]';
  db.run('UPDATE products SET name=?, price=?, image=?, description=?, game=?, rarity=?, attributes=?, unlockDate=?, requiredLevel=? WHERE id=?',
    [name, price, image, description, game, rarity, attrStr, unlockDate || null, requiredLevel || null, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
  });
});

app.get('/api/admin/orders', isAdmin, (req, res) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ orders: rows });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
