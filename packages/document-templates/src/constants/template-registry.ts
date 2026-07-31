import { TemplateType } from "../types";

export const TEMPLATE_REGISTRY: TemplateType[] = [
  {
    id: "ihtiyac-listesi",
    name: "IhtiyacListesi",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    supportsOlur: false,
  },
  {
    id: "ihtiyac-talep-formu",
    name: "IhtiyacTalepFormu",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    supportsOlur: false,
  },
  {
    id: "luzum-muzekkeresi",
    name: "LuzumMuzekkeresi",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    supportsOlur: true,
  },
  {
    id: "luzum-muzekkeresi-onay-eki",
    name: "LuzumMuzekkeresiOnayEki",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    supportsOlur: false,
  },
  {
    id: "luzum-muzekkeresi-teslim-tesellum",
    name: "LuzumMuzekkeresiTeslimTesellum",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    supportsOlur: false,
  },
  {
    id: "harcama-talimati",
    name: "HarcamaTalimati",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    supportsOlur: true,
  },
  {
    id: "komisyon-gorevlendirme-onayi",
    name: "KomisyonGorevlendirmeOnayi",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    supportsOlur: true,
  },
  {
    id: "komisyon-gorevlendirme-onayi-eki",
    name: "KomisyonGorevlendirmeOnayiEki",
    category: "1-ihtiyac-tespiti-ve-baslangic",
    supportsOlur: false,
  },
];