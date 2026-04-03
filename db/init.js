const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');
const dbPath = path.join(dataDir, 'database.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

db.close();
console.log('Database initialized at', dbPath);
