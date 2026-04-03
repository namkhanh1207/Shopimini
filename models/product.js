const db = require('../db/database');

function normalize(row) {
  if (!row) return row;
  const image_url = row.image_url || row.image || null;
  const stock = row.stock != null ? row.stock : 0;
  return { ...row, image_url, stock };
}

function list() {
  return db.prepare('SELECT * FROM products ORDER BY datetime(created_at) DESC').all().map(normalize);
}

function findById(id) {
  return normalize(db.prepare('SELECT * FROM products WHERE id = ?').get(id));
}

function create({ name, price, description, image_url, stock }) {
  const info = db
    .prepare(
      `INSERT INTO products (name, price, description, image_url, stock) VALUES (?, ?, ?, ?, ?)`
    )
    .run(String(name), Number(price), description ?? null, image_url ?? null, Number(stock) || 0);
  return findById(info.lastInsertRowid);
}

function update(id, { name, price, description, image_url, stock }) {
  db.prepare(
    `UPDATE products SET name = ?, price = ?, description = ?, image_url = ?, stock = ? WHERE id = ?`
  ).run(
    String(name),
    Number(price),
    description ?? null,
    image_url ?? null,
    Number(stock) || 0,
    id
  );
  return findById(id);
}

function remove(id) {
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
}

module.exports = { list, findById, create, update, remove };
