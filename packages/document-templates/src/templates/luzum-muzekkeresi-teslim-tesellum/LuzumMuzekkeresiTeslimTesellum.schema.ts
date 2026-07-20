import { z } from "zod";
import { BaseTemplateSchema } from "../../base.schema";

export const LuzumMuzekkeresiTeslimTesellumSchema = BaseTemplateSchema.extend({
  isinAdi: z.string().optional(),
  isinDegeri: z.string().optional(),
  dosyaNumarasi: z.string().optional(),
  kurumumuz: z.string().optional(),
  dosyaTarihi: z.string().optional(),
  ihtiyacKalemleri: z
    .array(
      z.object({
        siraNo: z.number().optional(),
        kodu: z.string().optional(),
        malzemeAdi: z.string().optional(),
        ozelligi: z.string().optional(),
        birimi: z.string().optional(),
        kdvOrani: z.union([z.string(), z.number()]).optional(),
        miktar: z.number().optional(),
      })
    )
    .optional(),
  teslimAlanlar: z
    .array(
      z.object({
        adSoyad: z.string().optional(),
        unvan: z.string().optional(),
      })
    )
    .optional(),
  teslimEdenler: z
    .array(
      z.object({
        adSoyad: z.string().optional(),
        unvan: z.string().optional(),
      })
    )
    .optional(),
});

export type LuzumMuzekkeresiTeslimTesellumType = z.infer<
  typeof LuzumMuzekkeresiTeslimTesellumSchema
>;
