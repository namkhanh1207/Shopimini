const bcrypt = require('bcrypt');
const db = require('./database');

function ensureSeed() {
  const hash = bcrypt.hashSync('admin', 10);
  const admin = db.prepare('SELECT id, password FROM users WHERE username = ?').get('admin');
  if (!admin) {
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(
      'admin',
      hash,
      'admin'
    );
  } else {
    let ok = false;
    try {
      ok = bcrypt.compareSync('admin', admin.password);
    } catch {
      ok = false;
    }
    if (!ok) {
      db.prepare('UPDATE users SET password = ?, role = ? WHERE id = ?').run(hash, 'admin', admin.id);
    }
  }

  const { c } = db.prepare('SELECT COUNT(*) AS c FROM products').get();
  if (c === 0) {
    const ins = db.prepare(
      `INSERT INTO products (name, price, description, image_url, stock) VALUES (?, ?, ?, ?, ?)`
    );
    const rows = [
      [
        'Áo thun ShopIMini',
        199000,
        'Cotton 100%, form regular.',
        'https://picsum.photos/seed/shopimini-shirt/400/400',
        50,
      ],
      [
        'Túi tote canvas',
        149000,
        'Đựng laptop 13", khóa nam châm.',
        'https://picsum.photos/seed/shopimini-tote/400/400',
        30,
      ],
      [
        'Nón bucket unisex',
        129000,
        'Chống nắng, gấp gọn.',
        'https://picsum.photos/seed/shopimini-hat/400/400',
        40,
      ],
    ];
    const tx = db.transaction((list) => {
      for (const r of list) ins.run(...r);
    });
    tx(rows);
  }
}

module.exports = { ensureSeed };
