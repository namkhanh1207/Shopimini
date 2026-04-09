const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening DB', err);
    process.exit(1);
  }
  
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('admin127', salt);
  
  db.run('UPDATE users SET password = ? WHERE username = ?', [hash, 'admin'], function(err) {
    if (err) {
      console.error('Error updating admin password', err);
    } else {
      console.log('Admin password updated to admin127 successfully (Rows updated: ' + this.changes + ')');
    }
    db.close();
  });
});
