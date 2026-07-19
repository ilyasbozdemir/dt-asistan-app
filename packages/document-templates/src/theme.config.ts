/**
 * GLOBAL_THEME: Tüm şablonlarda tutarlılık sağlayan merkezi tema
 */

export const GLOBAL_THEME = {
  typography: {
    fontFamily: "'Times New Roman', Times, serif",
    baseFontSize: '12pt',
    lineHeight: 1.5,
    fontSize: {
      xs: '8pt',
      sm: '10pt',
      base: '12pt',
      lg: '14pt',
      xl: '16pt',
      '2xl': '18pt'
    },
    fontWeight: {
      normal: 400,
      semibold: 600,
      bold: 700
    }
  },
  colors: {
    text: '#000',
    textLight: '#333',
    textMuted: '#666',
    border: '#333',
    borderLight: '#999',
    headerBg: '#f2f2f2',
    accentLine: '#c00',
    white: '#fff',
    black: '#000'
  },
  page: {
    format: 'A4',
    width: '21cm',
    height: '29.7cm',
    margins: {
      top: 1.5,
      right: 1.5,
      bottom: 1.5,
      left: 1.5
    },
    printableHeight: 890
  },
  table: {
    borderCollapse: 'collapse',
    fontSize: '10pt',
    cellPadding: '6px',
    headerBgColor: '#f2f2f2',
    headerFontWeight: 'bold',
    headerTextAlign: 'center',
    borderColor: '#333',
    borderWidth: '1px'
  },
  spacing: {
    headerHeight: '80px',
    footerHeight: '60px',
    approvalSpacing: '40px',
    marginBottom: '20px',
    marginTop: '20px',
    titleMargin: '20px 0'
  },
  summary: {
    description: 'Tüm şablonlarda tutarlı görünüm.',
    lastUpdated: new Date().toISOString()
  }
}
