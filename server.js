const path = require('path');
const express = require('express');
const session = require('express-session');

require('./db/database');
require('./db/seed').ensureSeed();

const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;
const viewsRoot = path.join(__dirname, 'views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    name: 'shopimini.sid',
    secret: process.env.SESSION_SECRET || 'shopimini-dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    },
  })
);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', shopRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(viewsRoot, 'index.html'));
});
app.get('/cart', (req, res) => {
  res.sendFile(path.join(viewsRoot, 'cart.html'));
});
app.get('/checkout', (req, res) => {
  res.sendFile(path.join(viewsRoot, 'checkout.html'));
});
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(viewsRoot, 'admin', 'login.html'));
});
app.get('/admin/products', (req, res) => {
  res.sendFile(path.join(viewsRoot, 'admin', 'products.html'));
});
app.get('/admin/orders', (req, res) => {
  res.sendFile(path.join(viewsRoot, 'admin', 'orders.html'));
});

app.listen(PORT, () => {
  console.log(`ShopIMini: http://localhost:${PORT}`);
});
