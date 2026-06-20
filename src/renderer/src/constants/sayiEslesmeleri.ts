const birler = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
const onlar = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];

export const SAYI_YAZI_MAP: Record<number | string, string> = {};

for (let i = 1; i <= 100; i++) {
  if (i === 100) {
    SAYI_YAZI_MAP[i] = '100 (yüz)';
    continue;
  }
  const onlarBasamagi = Math.floor(i / 10);
  const birlerBasamagi = i % 10;
  const kelime = (onlar[onlarBasamagi] + (birlerBasamagi ? ' ' + birler[birlerBasamagi] : '')).trim();
  SAYI_YAZI_MAP[i] = `${i} (${kelime})`;
}
