import { z } from "zod";

export const PiyasaFiyatArastirmaGorevlendirmesiSchema = z.object({
  solLogo: z.string().optional(),
  antetSatir1: z.string().optional(),
  antetSatir2: z.string().optional(),
  antetSatir3: z.string().optional(),
  antetSatirlari: z.array(z.string()).optional(),
  kurumAdi: z.string().optional(),
  dosyaTarihi: z.string().optional(),
  evrakSayisi: z.string().optional(),
  dosyaKonusu: z.string().optional(),
  onaylayanPersonelAdi: z.string().optional(),
  onaylayanPersonelUnvan: z.string().optional(),
  gorevliler: z
    .array(
      z.object({
        adi: z.string().optional(),
        unvani: z.string().optional(),
      })
    )
    .optional(),
  kurumIci: z.boolean().optional(),
  kurumAdres: z.string().optional(),
  kurumTelefon: z.string().optional(),
});

export type PiyasaFiyatArastirmaGorevlendirmesiData = z.infer<
  typeof PiyasaFiyatArastirmaGorevlendirmesiSchema
>;
