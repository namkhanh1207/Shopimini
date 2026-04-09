const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('--- Orders ---');
db.all('SELECT * FROM orders', [], (err, rows) => {
  if (err) console.error(err);
  else console.table(rows);
  
  console.log('--- Order Items ---');
  db.all('SELECT * FROM order_items', [], (err2, rows2) => {
    if (err2) console.error(err2);
    else console.table(rows2);
    db.close();
  });
});
