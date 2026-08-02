import { z } from "zod";

export const BirimFiyatTeklifMektubuSchema = z.object({
  idareAdi: z.string().optional(),
  isinAdi: z.string().optional(),
  hitap: z.string().optional(),
  teklifSahibi: z.string().optional(),
  uyrugu: z.string().optional(),
  tcKimlikNo: z.string().optional(),
  ortaklarinTcNo: z.string().optional(),
  vergiNo: z.string().optional(),
  tebligatAdresi: z.string().optional(),
  telefonFaks: z.string().optional(),
  eposta: z.string().optional(),
  aciklama: z.string().optional(),
  dosyaTarihi: z.string().optional(),
  sonTeklifVermeTarihi: z.string().optional(),
  sonTeklifVermeSaati: z.string().optional(),
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

export type BirimFiyatTeklifMektubuType = z.infer<typeof BirimFiyatTeklifMektubuSchema>;
