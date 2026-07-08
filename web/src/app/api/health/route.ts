import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Doğrudan Temin Asistanı Senkronizasyon Sunucusu Aktif.'
  })
}
