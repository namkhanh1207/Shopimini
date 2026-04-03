const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'database.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

const hasProductsTable = db
  .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'products'`)
  .get();
if (!hasProductsTable) {
  db.exec(fs.readFileSync(schemaPath, 'utf8'));
}

function tableColumnSet(table) {
  try {
    return new Set(db.prepare(`PRAGMA table_info(${table})`).all().map((r) => r.name));
  } catch {
    return new Set();
  }
}

function migrateLegacy() {
  let cols = tableColumnSet('products');
  if (!cols.size) return;

  if (!cols.has('created_at')) {
    db.exec(`ALTER TABLE products ADD COLUMN created_at TEXT`);
    db.exec(`UPDATE products SET created_at = datetime('now') WHERE created_at IS NULL`);
  }

  cols = tableColumnSet('products');
  if (!cols.has('image_url') && cols.has('image')) {
    db.exec(`ALTER TABLE products ADD COLUMN image_url TEXT`);
    db.exec(`UPDATE products SET image_url = image WHERE image_url IS NULL OR trim(image_url) = ''`);
  }

  cols = tableColumnSet('products');
  if (!cols.has('stock')) {
    db.exec(`ALTER TABLE products ADD COLUMN stock INTEGER NOT NULL DEFAULT 100`);
  }

  let ucols = tableColumnSet('users');
  if (ucols.size && !ucols.has('role')) {
    db.exec(`ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'customer'`);
    db.exec(`UPDATE users SET role = 'admin' WHERE lower(username) = 'admin'`);
  }

  let ocols = tableColumnSet('orders');
  if (ocols.size) {
    if (!ocols.has('total') && ocols.has('total_price')) {
      db.exec(`ALTER TABLE orders ADD COLUMN total REAL NOT NULL DEFAULT 0`);
      db.exec(`UPDATE orders SET total = total_price`);
    } else if (!ocols.has('total')) {
      db.exec(`ALTER TABLE orders ADD COLUMN total REAL NOT NULL DEFAULT 0`);
    }
    ocols = tableColumnSet('orders');
    if (!ocols.has('status')) {
      db.exec(`ALTER TABLE orders ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'`);
    }
  }
}

migrateLegacy();

module.exports = db;
