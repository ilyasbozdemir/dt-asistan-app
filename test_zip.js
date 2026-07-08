const AdmZip = require('adm-zip')
const fs = require('fs')

fs.writeFileSync('temp_test/test.sqlite', 'data')
fs.writeFileSync('temp_test/test.sqlite-wal', 'wal_data')

const zip = new AdmZip()
zip.addLocalFolder('temp_test')
console.log(zip.getEntries().map((e) => e.entryName))
