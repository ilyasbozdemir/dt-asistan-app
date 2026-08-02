import { z } from "zod";

export const ArastirmaMektubuSchema = z.object({
  evrakSayisi: z.string().optional(),
  detsisNo: z.string().optional(),
  dosyaNumarasi: z.string().optional(),
  dosyaKonusu: z.string().optional(),
  dosyaTarihi: z.string().optional(),
  sayinIlgili: z.string().optional(),
  aciklamaMetni: z.string().optional(),
  gorevlendirilenler: z.array(z.object({
    komisyonGorevi: z.string(),
    adSoyad: z.string(),
    unvan: z.string(),
  })).optional(),
  ihtiyacKalemleri: z.array(z.object({
    siraNo: z.number(),
    malzemeAdi: z.string(),
    ozelligi: z.string().optional(),
    birimi: z.string().optional(),
    miktar: z.number(),
    birimFiyat: z.number().optional(),
    tutar: z.number().optional(),
  })).optional(),
});

export type ArastirmaMektubuType = z.infer<typeof ArastirmaMektubuSchema>;
