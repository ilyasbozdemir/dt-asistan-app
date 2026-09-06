import { z } from "zod";
import { BaseDocumentSchema } from "../../base.schema";

export const DogrudanTeminSozlesmesiKalemSchema = z.object({
  siraNo: z.union([z.string(), z.number()]).optional(),
  malzemeAdi: z.string().optional(),
  ozelligi: z.string().optional(),
  birimi: z.string().optional(),
  miktar: z.union([z.string(), z.number()]).optional(),
});

export const DogrudanTeminSozlesmesiSchema = BaseDocumentSchema.extend({
  isinAdi: z.string().optional(),
  yukleniciFirma: z.string().optional(),
  idareAdresi: z.string().optional(),
  idareTelefon: z.string().optional(),
  idareFaks: z.string().optional(),
  idareEposta: z.string().optional(),
  yukleniciAdresi: z.string().optional(),
  yukleniciIlce: z.string().optional(),
  yukleniciIl: z.string().optional(),
  yukleniciTelefon: z.string().optional(),
  yukleniciFaks: z.string().optional(),
  yukleniciEposta: z.string().optional(),
  kalemSayisi: z.union([z.string(), z.number()]).optional(),
  genelToplam: z.union([z.string(), z.number()]).optional(),
  sozlesmeSuresi: z.string().optional(),
  odemeYeri: z.string().optional(),
  odemeSartlari: z.string().optional(),
  avansSartlari: z.string().optional(),
  destekHizmetleri: z.string().optional(),
  iadeSartlari: z.string().optional(),
  gecikmeCezaOrani: z.string().optional(),
  digerHususlar: z.string().optional(),
  sozlesmeTarihi: z.string().optional(),
  baskanAdi: z.string().optional(),
  baskanUnvan: z.string().optional(),
  kurumIlce: z.string().optional(),
  ihtiyacKalemleri: z.array(DogrudanTeminSozlesmesiKalemSchema).optional(),
});

export type DogrudanTeminSozlesmesiType = z.infer<typeof DogrudanTeminSozlesmesiSchema>;
