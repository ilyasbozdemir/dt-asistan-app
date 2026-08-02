import { z } from "zod";

export const YaklasikMaliyetCetveliSchema = z.object({
  solLogo: z.string().optional(),
  sagLogo: z.string().optional(),
  kurumAdi: z.string().optional(),
  mudurluk: z.string().optional(),
  isAdi: z.string().optional(),
  tarih: z.string().optional(),
  firmalarColspan: z.number().optional(),
  firmalar: z
    .array(
      z.object({
        unvan: z.string().optional(),
      })
    )
    .optional(),
  ihtiyacKalemleri: z
    .array(
      z.object({
        siraNo: z.number().optional(),
        malzemeAdi: z.string().optional(),
        ozelligi: z.string().optional(),
        birimi: z.string().optional(),
        miktar: z.union([z.number(), z.string()]).optional(),
        firmaTeklifleri: z
          .array(
            z.object({
              fiyat: z.union([z.number(), z.string()]).optional(),
            })
          )
          .optional(),
        enDusukFiyat: z.union([z.number(), z.string()]).optional(),
        toplamBedel: z.union([z.number(), z.string()]).optional(),
      })
    )
    .optional(),
  firmaToplamlari: z
    .array(
      z.object({
        toplam: z.union([z.number(), z.string()]).optional(),
      })
    )
    .optional(),
  genelToplam: z.union([z.number(), z.string()]).optional(),
  komisyon: z
    .array(
      z.object({
        adSoyad: z.string().optional(),
        unvan: z.string().optional(),
        gorevi: z.string().optional(),
      })
    )
    .optional(),
});

export type YaklasikMaliyetCetveliData = z.infer<
  typeof YaklasikMaliyetCetveliSchema
>;
