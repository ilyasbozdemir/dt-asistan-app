import { z } from "zod";
import { BaseDocumentSchema } from "../../base.schema";

export const DogrudanTeminSonucOnayTeklifItemSchema = z.object({
  unvan: z.string().optional(),
  fiyat: z.union([z.string(), z.number()]).optional(),
  uygunMu: z.string().optional(),
  aciklama: z.string().optional(),
});

export const DogrudanTeminSonucOnayUygunItemSchema = z.object({
  unvan: z.string().optional(),
  adres: z.string().optional(),
  fiyat: z.union([z.string(), z.number()]).optional(),
});

export const DogrudanTeminSonucOnayBelgesiSchema = BaseDocumentSchema.extend({
  mudurluk: z.string().optional(),
  vmakamina: z.string().optional(),
  isAdi: z.string().optional(),
  isinAciklamasi: z.string().optional(),
  teminSekli: z.string().optional(),
  alimTuru: z.string().optional(),
  yaklasikMaliyet: z.union([z.string(), z.number()]).optional(),
  teklifler: z.array(DogrudanTeminSonucOnayTeklifItemSchema).optional(),
  uygunGorulenler: z.array(DogrudanTeminSonucOnayUygunItemSchema).optional(),
  vonayasunustarihi: z.string().optional(),
  hazirlayanPersonelAdi: z.string().optional(),
  hazirlayanPersonelUnvan: z.string().optional(),
  vonaytarihi: z.string().optional(),
  onaylayanPersonelAdi: z.string().optional(),
  onaylayanPersonelUnvan: z.string().optional(),
  baskanAdi: z.string().optional(),
  baskanUnvan: z.string().optional(),
  ekler: z.array(z.string()).optional(),
});

export type DogrudanTeminSonucOnayBelgesiType = z.infer<typeof DogrudanTeminSonucOnayBelgesiSchema>;
