import { z } from "zod";

export const PiyasaFiyatArastirmaTutanagiSchema = z.object({
  solLogo: z.string().optional(),
  sagLogo: z.string().optional(),
  antetSatirlari: z.array(z.string()).optional(),
  kurumUst: z.string().optional(),
  kurumAdi: z.string().optional(),
  mudurluk: z.string().optional(),
  idareAdi: z.string().optional(),
  isAdi: z.string().optional(),
  dosyaTarihi: z.string().optional(),
  evrakSayisi: z.string().optional(),
  tarih: z.string().optional(),
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
        enUygunFirmaAdi: z.string().optional(),
        enDusukFiyat: z.union([z.number(), z.string()]).optional(),
        toplamBedel: z.union([z.number(), z.string()]).optional(),
        firmaTeklifleriDetay: z
          .array(
            z.object({
              birimFiyat: z.union([z.number(), z.string()]).optional(),
              tutar: z.union([z.number(), z.string()]).optional(),
            })
          )
          .optional(),
      })
    )
    .optional(),
  firmaToplamlariDetay: z
    .array(
      z.object({
        toplam: z.union([z.number(), z.string()]).optional(),
      })
    )
    .optional(),
  genelToplam: z.union([z.number(), z.string()]).optional(),
  aciklama: z.string().optional(),
  komisyon: z
    .array(
      z.object({
        adSoyad: z.string().optional(),
        unvan: z.string().optional(),
      })
    )
    .optional(),
  baskanAdi: z.string().optional(),
  baskanUnvan: z.string().optional(),
});

export type PiyasaFiyatArastirmaTutanagiData = z.infer<
  typeof PiyasaFiyatArastirmaTutanagiSchema
>;
