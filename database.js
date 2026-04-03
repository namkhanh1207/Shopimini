const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục "data" tồn tại để lưu file database
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database', err);
  } else {
    console.log('Connected to SQLite database.');
    db.serialize(() => {
      // 1. Tạo bảng Sản phẩm
      db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        image TEXT,
        description TEXT
      )`);

      // 2. Tạo bảng Quản trị viên (Users)
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )`);

      // 3. Tạo bảng Đơn hàng
      db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_address TEXT NOT NULL,
        total_price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // 4. Tạo bảng Chi tiết đơn hàng (các sản phẩm trong 1 đơn)
      db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        price REAL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`);

      // Khởi tạo tài khoản "admin" (mật khẩu "admin123") nếu chưa có
      const insertUser = db.prepare('INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)');
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync('admin123', salt);
      insertUser.run('admin', hash);
      insertUser.finalize();

      // Thêm một số sản phẩm mẫu ban đầu nếu bảng rỗng
      db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (row && row.count === 0) {
          const stmt = db.prepare('INSERT INTO products (name, price, image, description) VALUES (?, ?, ?, ?)');
          stmt.run('Áo thun phong cách hiện đại', 250000, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80', 'Áo thun cotton mềm mịn, kiểu dáng thời trang.');
          stmt.run('Giày Thể Thao Năng Động', 850000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80', 'Mẫu giày sneaker êm chân, phù hợp dạo phố.');
          stmt.run('Ba Lô Đa Năng', 450000, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80', 'Ba lô nhiều ngăn, thích hợp đi học và du lịch.');
          stmt.finalize();
          console.log('Seeded initial dummy products.');
        }
      });
    });
  }
});

module.exports = db;
