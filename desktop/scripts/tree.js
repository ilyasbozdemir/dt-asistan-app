const fs = require('fs')
const path = require('path')

function printTree(dir, depth = 0, isLast = false, prefix = '') {
  const files = fs.readdirSync(dir)
  files.forEach((file, index) => {
    const isFileLast = index === files.length - 1
    const filePath = path.join(dir, file)
    const stats = fs.statSync(filePath)

    const branch = isFileLast ? '└── ' : '├── '
    const nextPrefix = prefix + (isFileLast ? '    ' : '│   ')

    if (stats.isDirectory()) {
      console.log(`${prefix}${branch}📁 ${file}/`)
      printTree(filePath, depth + 1, isFileLast, nextPrefix)
    } else {
      console.log(`${prefix}${branch}📄 ${file}`)
    }
  })
}

console.log('📁 src/')
printTree(path.join(__dirname, '../src'))
