const AdmZip = require('adm-zip')
const Database = require('better-sqlite3')
const fs = require('fs')
const path = require('path')

const dbPath = './test.sqlite'
const zipPath = './test.zip'

// Create DB
const db = new Database(dbPath)
db.pragma('journal_mode = WAL')
db.exec('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)')
db.exec("INSERT INTO test (name) VALUES ('hello')")

// Try checkpoint
const info = db.pragma('wal_checkpoint(TRUNCATE)')
console.log('wal_checkpoint result:', info)

// Zip
const zip = new AdmZip()
zip.addLocalFolder('./')
zip.writeZip(zipPath)

const zip2 = new AdmZip(zipPath)
console.log(
  'Files in zip:',
  zip2.getEntries().map((e) => e.entryName)
)
