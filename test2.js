const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('test.sqlite');
db.pragma('journal_mode = WAL');
db.exec('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY)');
db.exec('INSERT INTO test (id) VALUES (1)');

try {
  const content = fs.readFileSync('test.sqlite-wal');
  console.log('Read WAL successfully, size:', content.length);
} catch (e) {
  console.log('Failed to read WAL:', e.message);
}
