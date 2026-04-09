const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all('SELECT * FROM topup_history', [], (err, rows) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('--- Topup History ---');
  console.table(rows);
  db.close();
});
