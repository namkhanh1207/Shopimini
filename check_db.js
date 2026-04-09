const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Connecting to:', dbPath);

db.all('SELECT id, username, level, balance FROM customers', [], (err, rows) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('--- Customers List ---');
  console.table(rows);
  db.close();
});
