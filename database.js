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
      // Bật hỗ trợ Foreign Keys cho SQLite
      db.run(`PRAGMA foreign_keys = ON`);

      // 1. Tạo bảng Sản phẩm
      db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        image TEXT,
        description TEXT,
        game TEXT,
        rarity TEXT,
        attributes TEXT,
        unlockDate TEXT,
        requiredLevel INTEGER
      )`);

      // Migration: add sort_order column if it doesn't exist yet (SQLite safe pattern)
      db.run(`ALTER TABLE products ADD COLUMN sort_order INTEGER`, () => {
        db.run(`UPDATE products SET sort_order = id WHERE sort_order IS NULL`);
      });

      // ── Khách hàng (customers) ──
      db.run(`CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        avatar_url TEXT DEFAULT '',
        level INTEGER DEFAULT 1,
        balance REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Migration: add is_banned column to customers if it doesn't exist
      db.run(`ALTER TABLE customers ADD COLUMN is_banned INTEGER DEFAULT 0`, () => {});

      // ── Tài khoản ngân hàng liên kết ──
      db.run(`CREATE TABLE IF NOT EXISTS bank_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        bank_name TEXT NOT NULL,
        account_number TEXT NOT NULL,
        account_name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )`);

      // ── Voucher ──
      db.run(`CREATE TABLE IF NOT EXISTS vouchers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        discount_type TEXT NOT NULL DEFAULT 'percent',
        discount_value REAL NOT NULL,
        min_order REAL DEFAULT 0,
        max_uses INTEGER DEFAULT 100,
        used_count INTEGER DEFAULT 0,
        expires_at TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // ── Lịch sử nạp tiền (admin duyệt) ──
      db.run(`CREATE TABLE IF NOT EXISTS topup_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        method TEXT DEFAULT 'bank',
        note TEXT DEFAULT '',
        status TEXT DEFAULT 'pending',
        approved_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )`);

      // ── Migrations: thêm cột mới vào orders ──
      ['customer_id INTEGER', 'voucher_code TEXT', 'discount_amount REAL DEFAULT 0', 'payment_method TEXT DEFAULT \'cod\''].forEach(col => {
        db.run(`ALTER TABLE orders ADD COLUMN ${col}`, () => {});
      });

      // 1.5 Tạo bảng Thông tin Game
      db.run(`CREATE TABLE IF NOT EXISTS game_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_key TEXT UNIQUE NOT NULL,
        game_name TEXT NOT NULL,
        video_url TEXT,
        description TEXT,
        image_thumbnail TEXT
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
      const hash = bcrypt.hashSync('admin127', salt);
      insertUser.run('admin', hash);
      insertUser.finalize();

      // Thêm sản phẩm mẫu ban đầu nếu bảng rỗng
      db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (row && row.count === 0) {
          const stmt = db.prepare('INSERT INTO products (name, price, image, description, game, rarity, attributes, unlockDate, requiredLevel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
          
          // Liên Quân
          stmt.run('Trang phục Nakroth Siêu Việt', 450000, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500', 'Skin giới hạn, hiệu ứng Siêu Việt neon.', 'lienquan', 'Legendary', JSON.stringify(['Skin', 'Neon', 'Assassin']), null, 15);
          stmt.run('Kiếm Truy Hồn', 120000, 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500', 'Vũ khí cho sát thủ.', 'lienquan', 'Rare', JSON.stringify(['Weapon', 'Physical']), null, 10);
          
          // Liên Minh
          stmt.run('Trang phục Ahri Thách Đấu', 350000, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500', 'Skin rực rỡ mang màu sắc Thách Đấu.', 'lienminh', 'Epic', JSON.stringify(['Skin', 'Magic']), null, 20);
          stmt.run('Huyết Kiếm', 250000, 'https://images.unsplash.com/photo-1589406569106-96ec1d15db18?w=500', 'Vũ khí mạnh mẽ với khả năng hút máu.', 'lienminh', 'Epic', JSON.stringify(['Weapon', 'Physical', 'Lifesteal']), null, 1);
          
          // Gunny 360
          stmt.run('Vũ khí Wow VIP', 500000, 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500', 'Khẩu súng đạn siêu sát thương.', 'gunny', 'Legendary', JSON.stringify(['Weapon', 'Explosive']), null, 30);
          stmt.run('Đá Cường Hóa 5', 50000, 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500', 'Nguyên liệu cường hóa vũ khí.', 'gunny', 'Common', JSON.stringify(['Material']), null, 5);
          
          // Soul Knight
          stmt.run('Vũ khí Groundwater', 200000, 'https://images.unsplash.com/photo-1505705694340-019e1e335916?w=500', 'Súng bắn cực nhanh 10 hit/s.', 'soulknight', 'Rare', JSON.stringify(['Weapon', 'Fast']), null, null);
          stmt.run('Magic Bow', 300000, 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=500', 'Cung tên ma thuật tự động truy kích.', 'soulknight', 'Epic', JSON.stringify(['Weapon', 'Magic', 'Ranged']), null, null);
          
          // PUBG
          stmt.run('M416 Glacier', 999000, 'https://images.unsplash.com/photo-1588607147754-05bf68c92a2a?w=500', 'Súng có hiệu ứng đóng băng độc quyền.', 'pubg', 'Legendary', JSON.stringify(['Weapon', 'Ice']), null, 1);
          stmt.run('Cái Chảo Huyền Thoại', 80000, 'https://images.unsplash.com/photo-1598048145816-29177a5ea79c?w=500', 'Chảo dùng để cản đạn.', 'pubg', 'Common', JSON.stringify(['Weapon', 'Defense']), null, null);
          
          // Dragon Mania
          stmt.run('Rồng Ánh Sáng Thần Thánh', 950000, 'https://images.unsplash.com/photo-1569255866175-6809ec0dcfa2?w=500', 'Mang hào quang rực rỡ và sức mạnh nguyên tố ánh sáng.', 'dragonmania', 'Legendary', JSON.stringify(['Dragon', 'Light']), '2026-12-31T00:00:00Z', 40);
          stmt.run('Mảnh Rồng Lửa', 120000, 'https://images.unsplash.com/photo-1606558234383-e028b12f6cd9?w=500', 'Mảnh ghép để triệu hồi Rồng Lửa.', 'dragonmania', 'Rare', JSON.stringify(['Material', 'Fire']), null, 10);

          stmt.finalize();
          console.log('Seeded 12 dummy products for 6 games.');

          // Seed game info
          const stmtInfo = db.prepare('INSERT OR IGNORE INTO game_info (game_key, game_name, video_url, description, image_thumbnail) VALUES (?, ?, ?, ?, ?)');
          stmtInfo.run('lienquan', 'Liên Quân Mobile', 'https://www.youtube.com/embed/bXv4Jk9N7wQ', 'Trang phục Liên Quân giúp tăng vẻ đẹp và hiệu ứng kỹ năng.', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200');
          stmtInfo.run('lienminh', 'Liên Minh Huyền Thoại', 'https://www.youtube.com/embed/vzHrjOMfHPY', 'Sở hữu trang phục siêu hiếm, nâng tầm đẳng cấp.', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200');
          stmtInfo.run('gunny', 'Gunny 360', 'https://www.youtube.com/embed/uR1k03cZ6X0', 'Vũ khí Wow VIP cường hóa full sao, tăng sát thương cực lớn.', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=200');
          stmtInfo.run('soulknight', 'Soul Knight', 'https://www.youtube.com/embed/uR1k03cZ6X0', 'Khám phá hầm ngục với những vũ khí cực phẩm.', 'https://images.unsplash.com/photo-1505705694340-019e1e335916?w=200');
          stmtInfo.run('pubg', 'PUBG', 'https://www.youtube.com/embed/uR1k03cZ6X0', 'Set thời trang đặc biệt giúp ngụy trang và sinh tồn.', 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=200');
          stmtInfo.run('dragonmania', 'Dragon Mania Legends', 'https://www.youtube.com/embed/uR1k03cZ6X0', 'Rồng đặc biệt mang đến sức mạnh nguyên tố vô song.', 'https://images.unsplash.com/photo-1569255866175-6809ec0dcfa2?w=200');
          stmtInfo.finalize();
        }
        seedLienQuanEquipment(db);
      });
    });
  }
});

function seedLienQuanEquipment(db) {
  const lqPath = path.join(__dirname, 'data', 'lienquan_equipment.json');
  if (!fs.existsSync(lqPath)) return;

  db.all('PRAGMA table_info(products)', (err, cols) => {
    if (err || !cols) return;
    const names = new Set(cols.map((c) => c.name));
    const alters = [];
    if (!names.has('catalog_key')) alters.push('ALTER TABLE products ADD COLUMN catalog_key TEXT');
    if (!names.has('currency_type')) alters.push('ALTER TABLE products ADD COLUMN currency_type TEXT');
    if (!names.has('game_price')) alters.push('ALTER TABLE products ADD COLUMN game_price REAL');
    if (!names.has('extra_json')) alters.push('ALTER TABLE products ADD COLUMN extra_json TEXT');

    function runAlters(i) {
      if (i >= alters.length) return afterAlters();
      db.run(alters[i], () => runAlters(i + 1));
    }

    function afterAlters() {
      db.run(
        'CREATE UNIQUE INDEX IF NOT EXISTS idx_products_catalog_key ON products(catalog_key) WHERE catalog_key IS NOT NULL',
        () => {
          db.get(
            "SELECT COUNT(*) AS c FROM products WHERE game = 'lienquan' AND catalog_key IS NOT NULL",
            (e2, row) => {
              if (e2 || !row || row.c >= 25) return;

              let items;
              try {
                items = JSON.parse(fs.readFileSync(lqPath, 'utf8'));
              } catch (parseErr) {
                console.error('lienquan_equipment.json:', parseErr.message);
                return;
              }

              db.run("DELETE FROM products WHERE game = 'lienquan'", (delErr) => {
                if (delErr) console.error(delErr);
                const ins = db.prepare(
                  `INSERT INTO products (name, price, image, description, game, rarity, attributes, unlockDate, requiredLevel, catalog_key, currency_type, game_price, extra_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
                );
                for (const item of items) {
                  const vnd =
                    item.currencyType === 'Gem'
                      ? Math.round(item.price * 900)
                      : Math.round(item.price * 120);
                  const img = `/images/lienquan/${item.imagePlaceholder}`;
                  const desc =
                    item.passives && item.passives.length ? item.passives[0] : `Trang bị ${item.name}`;
                  let req = null;
                  if (item.unlockCondition && /level\s*\d+/i.test(item.unlockCondition)) {
                    const m = item.unlockCondition.match(/(\d+)/);
                    if (m) req = parseInt(m[1], 10);
                  }
                  const extra = JSON.stringify({
                    stats: item.stats,
                    passives: item.passives,
                    activeSkill: item.activeSkill,
                    unlockCondition: item.unlockCondition,
                  });
                  ins.run(
                    item.name,
                    vnd,
                    img,
                    desc,
                    'lienquan',
                    item.rarity,
                    JSON.stringify(item.elements),
                    null,
                    req,
                    item.id,
                    item.currencyType,
                    item.price,
                    extra
                  );
                }
                ins.finalize();
                console.log(`Seeded ${items.length} Liên Quân trang bị từ lienquan_equipment.json`);
              });
            }
          );
        }
      );
    }

    runAlters(0);
  });
}

module.exports = db;
