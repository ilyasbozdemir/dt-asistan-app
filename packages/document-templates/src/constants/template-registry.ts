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
  {
    id: "harcama-pusulasi",
    name: "HarcamaPusulasi",
    category: "4-kabul-ve-odeme-islemleri",
    supportsOlur: false,
  },
  {
    id: "fiyat-arastirma-mektubu",
    name: "FiyatArastirmaMektubu",
    category: "2-piyasa-fiyat-arastirmasi",
    supportsOlur: false,
  },
  {
    id: "birim-fiyat-teklif-mektubu",
    name: "BirimFiyatTeklifMektubu",
    category: "2-piyasa-fiyat-arastirmasi",
    supportsOlur: false,
  },
  {
    id: "arastirma-mektubu",
    name: "ArastirmaMektubu",
    category: "2-piyasa-fiyat-arastirmasi",
    supportsOlur: false,
  },
  {
    id: "piyasa-fiyat-arastirma-tutanagi",
    name: "PiyasaFiyatArastirmaTutanagi",
    category: "2-piyasa-fiyat-arastirmasi",
    supportsOlur: true,
  },
  {
    id: "piyasa-fiyat-arastirma-gorevlendirmesi",
    name: "PiyasaFiyatArastirmaGorevlendirmesi",
    category: "2-piyasa-fiyat-arastirmasi",
    supportsOlur: false,
  },
  {
    id: "yaklasik-maliyet-cetveli",
    name: "YaklasikMaliyetCetveli",
    category: "2-piyasa-fiyat-arastirmasi",
    supportsOlur: false,
  },
];