export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return ''

  // Escape HTML characters
  let html = markdown.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Bold: **text** or __text__ -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>')

  // Italic: *text* or _text_ -> <em>text</em>
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/_(.*?)_/g, '<em>$1</em>')

  // Bullet Lists
  const lines = html.split('\n')
  let inList = false
  const processedLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        processedLines.push('<ul>')
        inList = true
      }
      processedLines.push(`<li>${trimmed.substring(2)}</li>`)
    } else {
      if (inList) {
        processedLines.push('</ul>')
        inList = false
      }
      processedLines.push(line)
    }
  }
  if (inList) {
    processedLines.push('</ul>')
  }

  html = processedLines.join('\n')

  // Line breaks: \n -> <br /> (except for list elements)
  html = html
    .split('\n')
    .map((l) => {
      const trimmed = l.trim()
      if (
        trimmed.startsWith('<ul>') ||
        trimmed.startsWith('</ul>') ||
        trimmed.startsWith('<li>') ||
        trimmed === ''
      ) {
        return l
      }
      return l + '<br />'
    })
    .join('\n')

  return html
}
