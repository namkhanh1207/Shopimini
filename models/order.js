const db = require('../db/database');
const product = require('./product');

function orderColumns() {
  return new Set(db.prepare(`PRAGMA table_info(orders)`).all().map((r) => r.name));
}

const insertOrder = (() => {
  const cols = orderColumns();
  const fields = ['customer_name', 'customer_address'];
  if (cols.has('total')) fields.push('total');
  if (cols.has('total_price')) fields.push('total_price');
  if (cols.has('status')) fields.push('status');
  const sql = `INSERT INTO orders (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;
  const stmt = db.prepare(sql);
  return (name, address, totalAmt) => {
    const values = [name, address];
    if (cols.has('total')) values.push(totalAmt);
    if (cols.has('total_price')) values.push(totalAmt);
    if (cols.has('status')) values.push('pending');
    return stmt.run(...values);
  };
})();

function normalizeOrderRow(row) {
  if (!row) return row;
  const total = row.total != null ? row.total : row.total_price;
  return { ...row, total };
}

function createFromCart(lines, customerName, customerAddress) {
  const insertItem = db.prepare(
    `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`
  );
  const updateStock = db.prepare(`UPDATE products SET stock = stock - ? WHERE id = ?`);

  const tx = db.transaction((cartLines, name, address) => {
    let total = 0;
    const resolved = [];
    for (const line of cartLines) {
      const p = product.findById(line.productId);
      if (!p) throw new Error('Sản phẩm không tồn tại');
      if (p.stock < line.quantity) throw new Error(`Không đủ tồn kho: ${p.name}`);
      total += p.price * line.quantity;
      resolved.push({ p, quantity: line.quantity });
    }
    const { lastInsertRowid: orderId } = insertOrder(name, address, total);
    for (const { p, quantity } of resolved) {
      insertItem.run(orderId, p.id, quantity, p.price);
      const r = updateStock.run(quantity, p.id);
      if (r.changes === 0) throw new Error('Cập nhật tồn kho thất bại');
    }
    return orderId;
  });

  return tx(lines, customerName, customerAddress);
}

function listAll() {
  return db
    .prepare(
      `SELECT o.*,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
       FROM orders o
       ORDER BY datetime(o.created_at) DESC`
    )
    .all()
    .map(normalizeOrderRow);
}

function findById(id) {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!row) return null;
  const items = db
    .prepare(
      `SELECT oi.*, p.name AS product_name
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`
    )
    .all(id);
  return { ...normalizeOrderRow(row), items };
}

function updateStatus(id, status) {
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(String(status), id);
  return normalizeOrderRow(db.prepare('SELECT * FROM orders WHERE id = ?').get(id));
}

module.exports = { createFromCart, listAll, findById, updateStatus };
