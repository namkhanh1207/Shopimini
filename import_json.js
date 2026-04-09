const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Đường dẫn tới DB và File đầu vào
const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const jsonFile = process.argv[2];

if (!jsonFile) {
  console.error("❌ Vui lòng cung cấp đường dẫn tới file JSON!");
  console.log("👉 Cách sử dụng: node import_json.js <duong-dan-file.json>");
  process.exit(1);
}

const targetPath = path.resolve(jsonFile);
if (!fs.existsSync(targetPath)) {
  console.error(`❌ Không tìm thấy file JSON tại: ${targetPath}`);
  process.exit(1);
}

// Đọc dữ liệu JSON
let products = [];
try {
  const fileData = fs.readFileSync(targetPath, 'utf-8');
  products = JSON.parse(fileData);
  if (!Array.isArray(products)) {
    throw new Error("File JSON phải là một mảng (Array) các đối tượng Sản Phẩm.");
  }
} catch (e) {
  console.error("❌ Lỗi khi đọc file JSON:", e.message);
  process.exit(1);
}

// Kết nối DB
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Lỗi kết nối DB:", err.message);
    process.exit(1);
  }
});

// Tiến hành Import
db.serialize(() => {
  db.run("BEGIN TRANSACTION");
  
  const stmt = db.prepare(`
    INSERT INTO products (name, price, image, description, game, rarity, attributes, requiredLevel) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let count = 0;
  for (const item of products) {
    let attrsObj = item.attributes;
    if (typeof attrsObj === 'string') {
      attrsObj = attrsObj.split(',').map(s => s.trim()).filter(Boolean);
    }
    const attrs = attrsObj ? JSON.stringify(attrsObj) : JSON.stringify([]);
    
    stmt.run(
      item.name || "Sản phẩm không tên",
      item.price || 0,
      item.image || item.imageUrl || "",
      item.description || "Chưa có mô tả",
      item.game || "khong-ro",
      item.rarity || "Common",
      attrs,
      item.requiredLevel || null,
      (err) => {
        if (err) console.error("Lỗi khi thêm sản phẩm:", item.name, err.message);
        else count++;
      }
    );
  }

  stmt.finalize();
  db.run("COMMIT", (err) => {
    if (err) {
      console.error("❌ Lỗi import vào DB:", err.message);
    } else {
      console.log(`✅ Đã nhập thành công ${products.length} sản phẩm vào cơ sở dữ liệu!`);
    }
    db.close();
  });
});
