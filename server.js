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
  // Sort by admin-defined order, then by id as fallback
  sql += ' ORDER BY COALESCE(sort_order, id) ASC';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const products = rows.map((r) => {
      let extra = null;
      if (r.extra_json) {
        try { extra = JSON.parse(r.extra_json); } catch { extra = null; }
      }
      return {
        ...r,
        attributes: r.attributes ? JSON.parse(r.attributes) : [],
        extra,
      };
    });
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
  // Assign sort_order = max+1 so new items appear at end
  db.get('SELECT COALESCE(MAX(sort_order), 0) + 1 AS nextOrder FROM products', (err2, row2) => {
    const nextOrder = (row2 && !err2) ? row2.nextOrder : 9999;
    db.run(
      'INSERT INTO products (name, price, image, description, game, rarity, attributes, unlockDate, requiredLevel, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, price, image, description, game, rarity, attrStr, unlockDate || null, requiredLevel || null, nextOrder],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
      }
    );
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
  db.run(
    'UPDATE products SET name=?, price=?, image=?, description=?, game=?, rarity=?, attributes=?, unlockDate=?, requiredLevel=? WHERE id=?',
    [name, price, image, description, game, rarity, attrStr, unlockDate || null, requiredLevel || null, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// PATCH /api/admin/products/:id/order  — move a product up or down
// Body: { direction: 'up' | 'down' }
app.patch('/api/admin/products/:id/order', isAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const { direction } = req.body;  // 'up' or 'down'
  
  // Fetch all products ordered by sort_order
  db.all('SELECT id, sort_order FROM products ORDER BY COALESCE(sort_order, id) ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const idx = rows.findIndex(r => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });
    
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= rows.length) return res.json({ success: true, message: 'Already at boundary' });
    
    // Assign sequential sort_order values, then swap
    const ordered = rows.map((r, i) => ({ id: r.id, sort_order: i + 1 }));
    const tmp = ordered[idx].sort_order;
    ordered[idx].sort_order = ordered[swapIdx].sort_order;
    ordered[swapIdx].sort_order = tmp;
    
    // Bulk update
    const stmt = db.prepare('UPDATE products SET sort_order=? WHERE id=?');
    for (const item of ordered) stmt.run(item.sort_order, item.id);
    stmt.finalize((finalErr) => {
      if (finalErr) return res.status(500).json({ error: finalErr.message });
      res.json({ success: true });
    });
  });
});

app.get('/api/admin/orders', isAdmin, (req, res) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ orders: rows });
  });
});

// ════════════════════════════════════════
//  CUSTOMER AUTH
// ════════════════════════════════════════
const isCustomer = (req, res, next) => {
  if (req.session.customerId) return next();
  res.status(401).json({ error: 'Chưa đăng nhập' });
};

app.post('/api/customer/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Thiếu thông tin' });
  const hash = bcrypt.hashSync(password, 10);
  db.run('INSERT INTO customers (username, email, password_hash) VALUES (?,?,?)',
    [username, email, hash], function(err) {
      if (err) return res.status(400).json({ error: 'Username hoặc email đã tồn tại' });
      req.session.customerId = this.lastID;
      db.get('SELECT id,username,email,avatar_url,level,balance FROM customers WHERE id=?', [this.lastID], (e, row) => {
        res.json({ success: true, customer: row });
      });
    });
});

app.post('/api/customer/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM customers WHERE email=?', [email], (err, cust) => {
    if (err || !cust || !bcrypt.compareSync(password, cust.password_hash))
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    
    if (cust.is_banned) {
      return res.status(403).json({ error: 'Tài khoản của bạn đã bị cấm khỏi Vương Quốc.' });
    }

    req.session.customerId = cust.id;
    res.json({ success: true, customer: { id: cust.id, username: cust.username, email: cust.email, avatar_url: cust.avatar_url, level: cust.level, balance: cust.balance } });
  });
});

app.post('/api/customer/logout', (req, res) => {
  req.session.customerId = null;
  res.json({ success: true });
});

app.get('/api/customer/me', isCustomer, (req, res) => {
  db.get('SELECT id,username,email,avatar_url,level,balance,created_at FROM customers WHERE id=?',
    [req.session.customerId], (err, row) => {
      if (err || !row) return res.status(404).json({ error: 'Không tìm thấy' });
      res.json({ customer: row });
    });
});

app.put('/api/customer/me', isCustomer, (req, res) => {
  const { username, avatar_url } = req.body;
  db.run('UPDATE customers SET username=COALESCE(?,username), avatar_url=COALESCE(?,avatar_url) WHERE id=?',
    [username || null, avatar_url || null, req.session.customerId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT id,username,email,avatar_url,level,balance FROM customers WHERE id=?',
        [req.session.customerId], (e, row) => res.json({ success: true, customer: row }));
    });
});

// ════════════════════════════════════════
//  BANK ACCOUNTS
// ════════════════════════════════════════
app.get('/api/customer/bank', isCustomer, (req, res) => {
  db.all('SELECT * FROM bank_accounts WHERE customer_id=? ORDER BY created_at DESC',
    [req.session.customerId], (err, rows) => res.json({ banks: rows || [] }));
});

app.post('/api/customer/bank', isCustomer, (req, res) => {
  const { bank_name, account_number, account_name } = req.body;
  if (!bank_name || !account_number || !account_name) return res.status(400).json({ error: 'Thiếu thông tin' });
  db.run('INSERT INTO bank_accounts (customer_id, bank_name, account_number, account_name) VALUES (?,?,?,?)',
    [req.session.customerId, bank_name, account_number, account_name], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    });
});

app.delete('/api/customer/bank/:id', isCustomer, (req, res) => {
  db.run('DELETE FROM bank_accounts WHERE id=? AND customer_id=?',
    [req.params.id, req.session.customerId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
});

// ════════════════════════════════════════
//  TOP-UP (Admin approves)
// ════════════════════════════════════════
app.post('/api/customer/topup', isCustomer, (req, res) => {
  const { amount, method, note } = req.body;
  const amt = parseFloat(amount);
  if (!amt || amt <= 0) return res.status(400).json({ error: 'Số tiền không hợp lệ' });
  db.run('INSERT INTO topup_history (customer_id, amount, method, note, status) VALUES (?,?,?,?,?)',
    [req.session.customerId, amt, method || 'bank', note || '', 'pending'], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Yêu cầu nạp tiền đã gửi, chờ admin duyệt.' });
    });
});

app.get('/api/customer/topup', isCustomer, (req, res) => {
  db.all('SELECT * FROM topup_history WHERE customer_id=? ORDER BY created_at DESC LIMIT 20',
    [req.session.customerId], (err, rows) => res.json({ history: rows || [] }));
});

// ════════════════════════════════════════
//  CUSTOMER ORDERS
// ════════════════════════════════════════
app.get('/api/customer/orders', isCustomer, (req, res) => {
  db.all(`SELECT o.*, GROUP_CONCAT(p.name, '||') as product_names
          FROM orders o
          LEFT JOIN order_items oi ON oi.order_id = o.id
          LEFT JOIN products p ON p.id = oi.product_id
          WHERE o.customer_id = ?
          GROUP BY o.id ORDER BY o.created_at DESC`,
    [req.session.customerId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ orders: rows || [] });
    });
});

// ════════════════════════════════════════
//  VOUCHER
// ════════════════════════════════════════
app.post('/api/voucher/check', (req, res) => {
  const { code, order_total } = req.body;
  db.get('SELECT * FROM vouchers WHERE code=?', [code?.toUpperCase()], (err, v) => {
    if (err || !v) return res.status(404).json({ error: 'Mã voucher không tồn tại' });
    if (v.expires_at && new Date(v.expires_at) < new Date()) return res.status(400).json({ error: 'Voucher đã hết hạn' });
    if (v.used_count >= v.max_uses) return res.status(400).json({ error: 'Voucher đã hết lượt dùng' });
    const total = parseFloat(order_total) || 0;
    if (total < v.min_order) return res.status(400).json({ error: `Đơn tối thiểu ${v.min_order.toLocaleString('vi-VN')}đ` });
    const discount = v.discount_type === 'percent'
      ? Math.round(total * v.discount_value / 100)
      : Math.min(v.discount_value, total);
    res.json({ valid: true, voucher: v, discount });
  });
});

// ════════════════════════════════════════
//  UPDATE CHECKOUT (replace old one)
// ════════════════════════════════════════
// Remove old checkout and replace
app.post('/api/checkout', (req, res) => {
  const { customer_name, customer_address, voucher_code, payment_method } = req.body;
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.status(400).json({ error: 'Giỏ hàng rỗng' });

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Validate voucher
  const applyVoucher = (callback) => {
    if (!voucher_code) return callback(null, 0);
    db.get('SELECT * FROM vouchers WHERE code=?', [voucher_code.toUpperCase()], (err, v) => {
      if (err || !v || v.used_count >= v.max_uses) return callback(null, 0);
      if (v.expires_at && new Date(v.expires_at) < new Date()) return callback(null, 0);
      const discount = v.discount_type === 'percent'
        ? Math.round(subtotal * v.discount_value / 100)
        : Math.min(v.discount_value, subtotal);
      callback(v, discount);
    });
  };

  applyVoucher((voucher, discount) => {
    const totalPrice = subtotal - discount;
    const customerId = req.session.customerId || null;
    const method = payment_method || 'cod';

    const finalize = () => {
      db.run(`INSERT INTO orders (customer_name, customer_address, total_price, customer_id, voucher_code, discount_amount, payment_method) VALUES (?,?,?,?,?,?,?)`,
        [customer_name, customer_address, totalPrice, customerId, voucher_code || null, discount, method],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          const orderId = this.lastID;
          const placeholders = cart.map(() => '(?,?,?,?)').join(',');
          const values = [];
          cart.forEach(item => values.push(orderId, item.id, item.quantity, item.price));
          db.run(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ${placeholders}`, values, function(err2) {
            if (err2) return res.status(500).json({ error: err2.message });
            // Mark voucher as used
            if (voucher) db.run('UPDATE vouchers SET used_count=used_count+1 WHERE id=?', [voucher.id]);
            
            // Level up: 1 level per unit bought
            if (customerId) {
              const totalQty = cart.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
              console.log(`[Checkout] User ${customerId} bought ${totalQty} items. Updating level...`);
              db.run('UPDATE customers SET level = COALESCE(level, 1) + ? WHERE id = ?', [totalQty, customerId], (err3) => {
                if (err3) console.error('[Checkout] Level update error:', err3);
                else console.log(`[Checkout] User ${customerId} level updated successfully.`);
                req.session.cart = [];
                res.json({ success: true, orderId, totalPrice, discount });
              });
            } else {
              req.session.cart = [];
              res.json({ success: true, orderId, totalPrice, discount });
            }
          });
        });
    };

    if (method === 'balance') {
      if (!customerId) return res.status(401).json({ error: 'Phải đăng nhập để thanh toán bằng số dư' });
      db.get('SELECT balance FROM customers WHERE id=?', [customerId], (err, cust) => {
        if (err || !cust) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
        if (cust.balance < totalPrice) return res.status(400).json({ error: 'Số dư không đủ' });
        db.run('UPDATE customers SET balance=balance-? WHERE id=?', [totalPrice, customerId], (e) => {
          if (e) return res.status(500).json({ error: e.message });
          finalize();
        });
      });
    } else {
      finalize();
    }
  });
});

// ════════════════════════════════════════
//  ADMIN – VOUCHER MANAGEMENT
// ════════════════════════════════════════
app.get('/api/admin/vouchers', isAdmin, (req, res) => {
  db.all('SELECT * FROM vouchers ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ vouchers: rows });
  });
});

app.post('/api/admin/vouchers', isAdmin, (req, res) => {
  const { code, discount_type, discount_value, min_order, max_uses, expires_at } = req.body;
  if (!code || !discount_value) return res.status(400).json({ error: 'Thiếu thông tin' });
  db.run('INSERT INTO vouchers (code,discount_type,discount_value,min_order,max_uses,expires_at) VALUES (?,?,?,?,?,?)',
    [code.toUpperCase(), discount_type || 'percent', discount_value, min_order || 0, max_uses || 100, expires_at || null],
    function(err) {
      if (err) return res.status(400).json({ error: 'Code đã tồn tại' });
      res.json({ success: true, id: this.lastID });
    });
});

app.delete('/api/admin/vouchers/:id', isAdmin, (req, res) => {
  db.run('DELETE FROM vouchers WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ════════════════════════════════════════
//  ADMIN – TOP-UP APPROVAL
// ════════════════════════════════════════
app.get('/api/admin/topup', isAdmin, (req, res) => {
  db.all(`SELECT t.*, c.username, c.email FROM topup_history t
          JOIN customers c ON c.id=t.customer_id
          ORDER BY t.created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ requests: rows || [] });
  });
});

app.patch('/api/admin/topup/:id/approve', isAdmin, (req, res) => {
  db.get('SELECT * FROM topup_history WHERE id=?', [req.params.id], (err, t) => {
    if (err || !t) return res.status(404).json({ error: 'Không tìm thấy' });
    if (t.status !== 'pending') return res.status(400).json({ error: 'Đã xử lý rồi' });
    db.run('UPDATE topup_history SET status=\'approved\', approved_at=CURRENT_TIMESTAMP WHERE id=?', [t.id], (e) => {
      if (e) return res.status(500).json({ error: e.message });
      const levelBonus = Math.floor((Number(t.amount) || 0) / 500000);
      console.log(`[Topup] Approving ${t.amount} for user ${t.customer_id}. Level bonus: ${levelBonus}`);
      db.run('UPDATE customers SET balance=COALESCE(balance, 0) + ?, level = COALESCE(level, 1) + ? WHERE id=?', 
        [Number(t.amount) || 0, levelBonus, t.customer_id], 
        (err2) => {
          if (err2) {
            console.error('[Topup] Level update error:', err2);
            return res.status(500).json({ error: err2.message });
          }
          console.log(`[Topup] User ${t.customer_id} level and balance updated successfully.`);
          res.json({ success: true });
        });
    });
  });
});

app.patch('/api/admin/topup/:id/reject', isAdmin, (req, res) => {
  db.run('UPDATE topup_history SET status=\'rejected\' WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ════════════════════════════════════════
//  ADMIN – CUSTOMERS
// ════════════════════════════════════════
app.get('/api/admin/customers', isAdmin, (req, res) => {
  db.all(`
    SELECT c.*, 
           COUNT(o.id) as order_count,
           SUM(o.total_price) as total_spent
    FROM customers c
    LEFT JOIN orders o ON c.id = o.customer_id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ customers: rows || [] });
  });
});

app.patch('/api/admin/customers/:id/balance', isAdmin, (req, res) => {
  const { amount } = req.body; 
  // amount can be positive (add) or negative (deduct)
  const amt = parseFloat(amount);
  if (isNaN(amt)) return res.status(400).json({ error: 'Số tiền không hợp lệ' });
  
  db.run('UPDATE customers SET balance = balance + ? WHERE id = ?', [amt, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: `Thành công cộng/trừ ${amt}đ` });
  });
});

app.patch('/api/admin/customers/:id/level', isAdmin, (req, res) => {
  const { level } = req.body;
  const lvl = parseInt(level);
  if (isNaN(lvl) || lvl < 1) return res.status(400).json({ error: 'Level không hợp lệ' });
  
  db.run('UPDATE customers SET level = ? WHERE id = ?', [lvl, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: `Đã cập nhật level lên ${lvl}` });
  });
});

app.patch('/api/admin/customers/:id/ban', isAdmin, (req, res) => {
  db.get('SELECT is_banned FROM customers WHERE id = ?', [req.params.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Không tìm thấy người chơi' });
    const newStatus = row.is_banned ? 0 : 1;
    db.run('UPDATE customers SET is_banned = ? WHERE id = ?', [newStatus, req.params.id], function(err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ success: true, is_banned: !!newStatus });
    });
  });
});

app.delete('/api/admin/customers/:id', isAdmin, (req, res) => {
  const customerId = req.params.id;
  
  // Xử lý tuần tự để xóa các dữ liệu liên quan trước khi xóa customer (do FBK)
  db.serialize(() => {
    // 1. Ngắt kết nối đơn hàng (giữ lại record cho kế toán)
    db.run('UPDATE orders SET customer_id = NULL WHERE customer_id = ?', [customerId]);
    // 2. Xóa các dữ liệu phụ thuộc khác
    db.run('DELETE FROM bank_accounts WHERE customer_id = ?', [customerId]);
    db.run('DELETE FROM topup_history WHERE customer_id = ?', [customerId]);
    // 3. Xóa chính customer
    db.run('DELETE FROM customers WHERE id = ?', [customerId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Đã xóa cư dân khỏi vương quốc' });
    });
  });
});

// ════════════════════════════════════════
//  ADMIN – STATS DASHBOARD
// ════════════════════════════════════════
app.get('/api/admin/stats', isAdmin, (req, res) => {
  const stats = {};
  
  // Total Revenue
  db.get("SELECT SUM(total_price) as rev FROM orders", [], (err, row) => {
    stats.totalRevenue = row ? row.rev || 0 : 0;
    
    // Total Orders
    db.get("SELECT COUNT(id) as cnt FROM orders", [], (err, row2) => {
      stats.totalOrders = row2 ? row2.cnt || 0 : 0;
      
      // Total Customers
      db.get("SELECT COUNT(id) as cnt FROM customers", [], (err, row3) => {
        stats.totalCustomers = row3 ? row3.cnt || 0 : 0;
        
        // Pending Topups
        db.get("SELECT COUNT(id) as cnt FROM topup_history WHERE status='pending'", [], (err, row4) => {
          stats.pendingTopups = row4 ? row4.cnt || 0 : 0;
          
          // Chart Data: Group Revenue by Date (last 30 days)
          db.all(`
            SELECT date(created_at) as date, SUM(total_price) as revenue 
            FROM orders 
            GROUP BY date(created_at)
            ORDER BY date(created_at) ASC 
            LIMIT 30
          `, [], (err, chartRows) => {
            stats.chartData = chartRows || [];
            res.json(stats);
          });
        });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
