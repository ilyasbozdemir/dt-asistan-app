import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Building2,
  ChevronDown,
  ChevronRight,
  Copy,
  DollarSign,
  FileText,
  HelpCircle,
  Info,
  Loader2,
  Save,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { TeminDosyasi, useDosyalarHooks } from "./dosyalar.hooks";
import { useTabStore } from "../../store/tabStore";
import { useSettingsStore } from "../../store/settingsStore";
import { cn } from "../../utils/cn";
import {
  AIFilledValues,
  AIFormFillModal,
} from "../../components/ui/AIFormFillModal";
import { AITextGeneratorModal } from "../../components/ui/AITextGeneratorModal";
import { logActivity } from "../../utils/logger";
import { EskiDosyaKopyalaModal } from "./components/EskiDosyaKopyalaModal";
import { useKikLimitDonemleri } from "../system/kik-limitleri.hooks";
import { GenelBilgilerTab } from "./tabs/GenelBilgilerTab";
import { IhtiyacListesiTab } from "./tabs/IhtiyacListesiTab";
import { TeknikSartnameTab } from "./tabs/TeknikSartnameTab";

interface DBBirim {
  id: number;
  birim_adi: string;
  antet_ek_satir?: string;
  sunum_makami?: string;
  ihtiyac_yeri_eki?: string;
  e_butce?: string;
}

interface DBPersonel {
  id: number;
  ad_soyad: string;
  unvan?: string;
  birim?: string;
  harcama_yetkilisi_mi?: number;
}

interface DBKodSozlugu {
  id: number;
  tur: string;
  kod: string;
  aciklama?: string;
}

export default function YeniDosyaScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { dosyalar, addDosya, updateDosya } = useDosyalarHooks();
  const { updateTabLabel } = useTabStore();
  const { institutionName, limitType } = useSettingsStore();
  const { donemTanimsizMi, donemler } = useKikLimitDonemleri();

  const [isDescLoading, setIsDescLoading] = useState(false);
  const [showKonuSuggestions, setShowKonuSuggestions] = useState(false);

  // Get query params
  const searchParams = new URLSearchParams(window.location.search);
  const editIdStr = searchParams.get("id");
  const editId = editIdStr ? parseInt(editIdStr, 10) : null;
  const isEdit = editId !== null && !isNaN(editId);

  // Title & Tab title
  useEffect(() => {
    document.title = isEdit
      ? "İhale Dosyası Düzenle - DT"
      : "Yeni İhale Dosyası Ekle - DT";
    const currentHref = routerState.location.href;
    updateTabLabel(
      currentHref,
      isEdit ? "DT Dosyasını Düzenle" : "Yeni DT Dosyası Ekle",
    );
  }, [isEdit, routerState.location.href, updateTabLabel]);

  // DB Collections state
  const [birimler, setBirimler] = useState<DBBirim[]>([]);
  const [personeller, setPersoneller] = useState<DBPersonel[]>([]);
  const [kodSozlugu, setKodSozlugu] = useState<DBKodSozlugu[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // Form State
  const [formData, setFormData] = useState<Partial<TeminDosyasi>>({
    temin_no: "",
    dosya_acilis_tarihi: new Date().toISOString().split("T")[0],
    butce_yili: new Date().getFullYear(),
    butce_tipi: "Genel Bütçe",
    konu: "",
    isin_aciklamasi: "",
    birim_id: null,
    antet_ek_satir: "",
    sunulacak_makam: "",
    ihtiyac_yeri: "",
    e_butce: "",
    fonksiyonel_kod: "",
    muhasebe_birimi: "",
    harcama_birimi: "",
    finansman_kodu: "1",
    ekonomik_kod: "",
    ihale_tipi: "Doğrudan Temin",
    tur: "mal",
    ihale_sekli: limitType === "buyuksehir" ? "22/d*" : "22/d**",
    teklif_sozlesme_turu: "Birim Fiyat",
    alt_yuklenici_olacak_mi: 0,
    kismi_teklif_verilecek_mi: 0,
    fiyat_farki_dayanagi: "Fiyat Farkı Ödenmeyecek",
    yatirim_proje_no: "",
    avans_verilecek_mi: 0,
    yillara_yaygin: 0,
    sozlesme_yapilacak_mi: 0,
    yaklasik_maliyet_hesaplamasi: "",
    kdv: "20",
    hesaplama_esasi: "",
    komisyon_takdiri: "Sadece araştırma fiyatları dikkate alınacak",
    tibbi_cihaz_alimi_mi: 0,
    irtibat_yetkilisi_id: null,
    talep_eden_personel_id: null,
    sunan_personel_id: null,
    son_teklif_verme_tarihi: new Date().toISOString().split("T")[0] + " 10:00",
    teslim_tarihi: "",
    yaklasik_maliyet: 0,
    butce_kodu: "",
    notlar: "",
  });

  const currentLimit = React.useMemo(() => {
    if (!donemler || donemler.length === 0) return null;
    const year = formData.butce_yili?.toString() ||
      new Date().getFullYear().toString();
    const donem = donemler.find((d) => d.donem_kodu.startsWith(year)) ||
      donemler[0];
    return limitType === "buyuksehir"
      ? donem.buyuksehir_limit
      : donem.diger_limit;
  }, [donemler, formData.butce_yili, limitType]);

  const isLimitExceeded = React.useMemo(() => {
    if (!currentLimit || !formData.yaklasik_maliyet) return false;
    return formData.yaklasik_maliyet > currentLimit;
  }, [currentLimit, formData.yaklasik_maliyet]);

  // Load Database values
  useEffect(() => {
    async function loadData() {
      setLoadingDb(true);
      try {
        const resBirim = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT * FROM TANIM_Birim WHERE aktif_mi = 1",
        );
        const resPers = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT * FROM TANIM_Personel WHERE aktif_mi = 1",
        );
        const resKod = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT * FROM TANIM_KodSozlugu WHERE aktif_mi = 1",
        );
        const resRoller = await window.electron.ipcRenderer.invoke(
          "db:query",
          "SELECT * FROM TANIM_Roller",
        );

        if (resBirim.success) setBirimler(resBirim.data);
        if (resPers.success) setPersoneller(resPers.data);
        if (resKod.success) setKodSozlugu(resKod.data);

        const roller = resRoller.success ? resRoller.data : [];

        // Load existing document if in Edit Mode
        if (isEdit) {
          const resDoc = await window.electron.ipcRenderer.invoke(
            "db:query",
            "SELECT * FROM DATA_TeminDosyasi WHERE id = ?",
            [editId],
          );
          if (resDoc.success && resDoc.data.length > 0) {
            const doc = resDoc.data[0];
            // Format dates for html input tags
            const formatForInput = (val: any) => {
              if (!val) return "";
              return val.includes("T") ? val.split("T")[0] : val;
            };
            setFormData({
              ...doc,
              dosya_acilis_tarihi: formatForInput(doc.dosya_acilis_tarihi),
              son_teklif_verme_tarihi: doc.son_teklif_verme_tarihi
                ? doc.son_teklif_verme_tarihi.replace(" ", "T")
                : "",
              teslim_tarihi: formatForInput(doc.teslim_tarihi),
            });
          }
        } else {
          // Yeni dosya ise varsayılan rolleri otomatik ata
          setFormData((prev) => ({
            ...prev,
            irtibat_yetkilisi_id: roller.find((r: any) =>
              r.rol_kodu === "ilgili_personel"
            )?.varsayilan_personel_id ||
              prev.irtibat_yetkilisi_id,
            onay_personel_id: roller.find(
              (r: any) =>
                r.rol_kodu === "harcama_yetkilisi" ||
                r.rol_kodu === "onaylayan",
            )?.varsayilan_personel_id || prev.onay_personel_id,
            hazirlayan_personel_id: roller.find((r: any) =>
              r.rol_kodu === "hazirlayan"
            )?.varsayilan_personel_id ||
              prev.hazirlayan_personel_id,
            talep_eden_personel_id: roller.find((r: any) =>
              r.rol_kodu === "talep_eden"
            )?.varsayilan_personel_id ||
              prev.talep_eden_personel_id,
            sunan_personel_id: roller.find((r: any) =>
              r.rol_kodu === "sunan_personel"
            )?.varsayilan_personel_id ||
              prev.sunan_personel_id,
          }));
        }
      } catch (err) {
        console.error("Veritabanı yüklenirken hata oluştu:", err);
      } finally {
        setLoadingDb(false);
      }
    }
    loadData();
  }, [isEdit, editId]);

  // Yıla göre sıradaki Doğrudan Temin Numarasını Hesaplama
  const getNextTeminNo = (year: number) => {
    const yearStr = year.toString();
    const yearDosyalar = dosyalar.filter(
      (d) =>
        d.temin_no &&
        (d.temin_no.startsWith(`${yearStr}/`) ||
          d.temin_no.startsWith(`DT${yearStr}/`)),
    );

    let maxSeq = 0;
    yearDosyalar.forEach((d) => {
      const no = d.temin_no!;
      const parts = no.split("/");
      const seqStr = parts[parts.length - 1];

      if (seqStr) {
        const seq = parseInt(seqStr, 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });

    return `${yearStr}/${maxSeq + 1}`;
  };

  // Otomatik Temin Numarası (2026/1) Oluşturma
  useEffect(() => {
    if (!isEdit && !formData.temin_no && !loadingDb) {
      const year = formData.dosya_acilis_tarihi
        ? new Date(formData.dosya_acilis_tarihi).getFullYear()
        : new Date().getFullYear();
      setFormData((prev) => ({
        ...prev,
        temin_no: getNextTeminNo(year),
      }));
    }
  }, [
    isEdit,
    formData.temin_no,
    loadingDb,
    dosyalar,
    formData.dosya_acilis_tarihi,
  ]);

  // Active Tab (Stepper)
  const [activeTab, setActiveTab] = useState<"genel" | "ihtiyac" | "teknik">(
    "genel",
  );

  // Kopyalama (Şablon) State
  const [showKopyalaModal, setShowKopyalaModal] = useState(false);

  const handleCopyDosya = (eskiDosya: TeminDosyasi) => {
    setFormData({
      ...formData,
      // %80 dolu gelsin (kalemler hariç)
      konu: eskiDosya.konu,
      isin_aciklamasi: eskiDosya.isin_aciklamasi,
      birim_id: eskiDosya.birim_id,
      antet_ek_satir: eskiDosya.antet_ek_satir,
      sunulacak_makam: eskiDosya.sunulacak_makam,
      ihtiyac_yeri: eskiDosya.ihtiyac_yeri,
      e_butce: eskiDosya.e_butce,
      fonksiyonel_kod: eskiDosya.fonksiyonel_kod,
      muhasebe_birimi: eskiDosya.muhasebe_birimi,
      harcama_birimi: eskiDosya.harcama_birimi,
      finansman_kodu: eskiDosya.finansman_kodu,
      ekonomik_kod: eskiDosya.ekonomik_kod,
      ihale_tipi: eskiDosya.ihale_tipi,
      tur: eskiDosya.tur,
      // ihale_sekli: eskiDosya.ihale_sekli, // Kopya yerine ayarlardan geleni koruyalım (isteğe bağlı)
      ihale_sekli: eskiDosya.ihale_sekli,
      teklif_sozlesme_turu: eskiDosya.teklif_sozlesme_turu,
      alt_yuklenici_olacak_mi: eskiDosya.alt_yuklenici_olacak_mi,
      kismi_teklif_verilecek_mi: eskiDosya.kismi_teklif_verilecek_mi,
      fiyat_farki_dayanagi: eskiDosya.fiyat_farki_dayanagi,
      yatirim_proje_no: eskiDosya.yatirim_proje_no,
      avans_verilecek_mi: eskiDosya.avans_verilecek_mi,
      yillara_yaygin: eskiDosya.yillara_yaygin,
      sozlesme_yapilacak_mi: eskiDosya.sozlesme_yapilacak_mi,
      yaklasik_maliyet_hesaplamasi: eskiDosya.yaklasik_maliyet_hesaplamasi,
      kdv: eskiDosya.kdv,
      hesaplama_esasi: eskiDosya.hesaplama_esasi,
      komisyon_takdiri: eskiDosya.komisyon_takdiri,
      tibbi_cihaz_alimi_mi: eskiDosya.tibbi_cihaz_alimi_mi,
      yaklasik_maliyet: eskiDosya.yaklasik_maliyet,
      butce_kodu: eskiDosya.butce_kodu,
      irtibat_yetkilisi_id: eskiDosya.irtibat_yetkilisi_id,
      hazirlayan_personel_id: eskiDosya.hazirlayan_personel_id,
      onay_personel_id: eskiDosya.onay_personel_id,
      notlar: eskiDosya.notlar,

      // Sıfırlanan / Güncellenen alanlar
      temin_no: "",
      dosya_acilis_tarihi: new Date().toISOString().split("T")[0],
      son_teklif_verme_tarihi: "",
      teslim_tarihi: "",
    });
    setShowKopyalaModal(false);
    alert(
      `"${eskiDosya.konu}" başlıklı dosyadan veriler başarıyla kopyalandı. Lütfen yeni dosya numarasını ve tarihlerini kontrol edin.`,
    );
  };

  // Search states for custom select/autocomplete dropdowns
  const [showBirimSearch, setShowBirimSearch] = useState(false);
  const [birimSearchQuery, setBirimSearchQuery] = useState("");
  const [showPersonelSearch, setShowPersonelSearch] = useState<
    "irtibat" | "hazirlayan" | "onay" | "talep_eden" | "sunan" | null
  >(null);
  const [personelSearchQuery, setPersonelSearchQuery] = useState("");

  // Filtered lists
  const filteredBirimler = birimler.filter((b) =>
    b.birim_adi.toLowerCase().includes(birimSearchQuery.toLowerCase())
  );

  const filteredPersoneller = personeller.filter(
    (p) =>
      p.ad_soyad.toLowerCase().includes(personelSearchQuery.toLowerCase()) ||
      (p.unvan || "").toLowerCase().includes(personelSearchQuery.toLowerCase()),
  );

  // Copy Konu (İşin Adı) to Açıklama
  const handleCopyKonuToAciklama = () => {
    setFormData((prev) => ({
      ...prev,
      isin_aciklamasi: prev.konu,
    }));
  };

  // AI Form Fill Modal
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);

  // Reusable AI Text Generator Modal
  const [textGenConfig, setTextGenConfig] = useState<{
    isOpen: boolean;
    title: string;
    fieldName: string;
    targetField: keyof TeminDosyasi;
    systemInstruction?: string;
  }>({
    isOpen: false,
    title: "",
    fieldName: "",
    targetField: "isin_aciklamasi",
  });

  // AI Kalem Asistanı State
  const [aiKalemConfig, setAiKalemConfig] = useState<{
    isOpen: boolean;
  }>({ isOpen: false });

  const openTextGenerator = (
    targetField: keyof TeminDosyasi,
    title: string,
    fieldName: string,
    systemInstruction?: string,
  ) => {
    setTextGenConfig({
      isOpen: true,
      title,
      fieldName,
      targetField,
      systemInstruction,
    });
  };

  const getAIFormContext = () => {
    const selectedBirim = birimler.find((b) => b.id === formData.birim_id);
    return {
      formTitle: "Yeni Doğrudan Temin İhale Dosyası",
      kurumBilgisi: {
        birimAdi: selectedBirim?.birim_adi,
        sunulacakMakam: formData.sunulacak_makam || selectedBirim?.sunum_makami,
        antetEkSatir: formData.antet_ek_satir || selectedBirim?.antet_ek_satir,
        ihtiyacYeri: formData.ihtiyac_yeri || selectedBirim?.ihtiyac_yeri_eki,
        kurumAdi: institutionName !== "Kurum Adı Bulunamadı"
          ? institutionName
          : "Kurum",
      },
      mevcutDegerler: {
        konu: formData.konu,
        temin_no: formData.temin_no,
        sunulacak_makam: formData.sunulacak_makam,
        birim: selectedBirim?.birim_adi,
        butce_yili: formData.butce_yili,
      },
      doldurulacakAlanlar: [
        {
          alan: "konu",
          etiket: "İhale / Dosya Konusu",
          tip: "text" as const,
          zorunlu: true,
          ornekDeger: "Fen İşleri Kırtasiye Malzemesi Alımı",
        },
        {
          alan: "isin_aciklamasi",
          etiket: "İşin Açıklaması / Kapsamı",
          tip: "textarea" as const,
        },
        {
          alan: "temin_no",
          etiket: "Doğrudan Temin Numarası",
          tip: "text" as const,
          ornekDeger: "2026/DT-001",
        },
        {
          alan: "dosya_acilis_tarihi",
          etiket: "Dosya Açılış Tarihi",
          tip: "date" as const,
        },
        { alan: "butce_yili", etiket: "Bütçe Yılı", tip: "number" as const },
        { alan: "butce_tipi", etiket: "Bütçe Tipi", tip: "text" as const },
        {
          alan: "sunulacak_makam",
          etiket: "Evrakın Sunulacağı Makam",
          tip: "text" as const,
          ornekDeger: "BAŞKANLIK MAKAMINA",
        },
        { alan: "ihtiyac_yeri", etiket: "İhtiyaç Yeri", tip: "text" as const },
        {
          alan: "antet_ek_satir",
          etiket: "Antet Ek Satır",
          tip: "text" as const,
        },
        { alan: "e_butce", etiket: "e-Bütçe Kodu", tip: "text" as const },
        {
          alan: "fonksiyonel_kod",
          etiket: "Fonksiyonel Kod",
          tip: "text" as const,
        },
        {
          alan: "muhasebe_birimi",
          etiket: "Muhasebe Birimi Kodu",
          tip: "text" as const,
        },
        {
          alan: "harcama_birimi",
          etiket: "Harcama Birimi Kodu",
          tip: "text" as const,
        },
        {
          alan: "finansman_kodu",
          etiket: "Finansman Kodu",
          tip: "text" as const,
        },
        { alan: "ekonomik_kod", etiket: "Ekonomik Kod", tip: "text" as const },
        { alan: "ihale_tipi", etiket: "İhale Tipi", tip: "text" as const },
        {
          alan: "tur",
          etiket: "Tür (mal/hizmet/yapim/danismanlik)",
          tip: "text" as const,
        },
        {
          alan: "ihale_sekli",
          etiket: "İhale Şekli (22/d* vb.)",
          tip: "text" as const,
        },
        {
          alan: "teklif_sozlesme_turu",
          etiket: "Teklif/Sözleşme Türü",
          tip: "text" as const,
        },
        {
          alan: "alt_yuklenici_olacak_mi",
          etiket: "Alt Yüklenici (0/1)",
          tip: "number" as const,
        },
        {
          alan: "kismi_teklif_verilecek_mi",
          etiket: "Kısmi Teklif (0/1)",
          tip: "number" as const,
        },
        {
          alan: "fiyat_farki_dayanagi",
          etiket: "Fiyat Farkı Dayanağı",
          tip: "text" as const,
        },
        {
          alan: "yatirim_proje_no",
          etiket: "Yatırım Proje No",
          tip: "text" as const,
        },
        {
          alan: "avans_verilecek_mi",
          etiket: "Avans Verilecek (0/1)",
          tip: "number" as const,
        },
        {
          alan: "yillara_yaygin",
          etiket: "Yıllara Yaygın Hizmet (0/1)",
          tip: "number" as const,
        },
        {
          alan: "sozlesme_yapilacak_mi",
          etiket: "Sözleşme Yapılacak mı (0/1)",
          tip: "number" as const,
        },
        {
          alan: "yaklasik_maliyet_hesaplamasi",
          etiket: "Yaklaşık Maliyet Hesaplama Yöntemi",
          tip: "text" as const,
        },
        { alan: "kdv", etiket: "KDV Oranı (%)", tip: "text" as const },
        {
          alan: "hesaplama_esasi",
          etiket: "Hesaplama Esası",
          tip: "text" as const,
        },
        {
          alan: "komisyon_takdiri",
          etiket: "Hesaplama Yöntemi / Dayanağı",
          tip: "text" as const,
        },
        {
          alan: "tibbi_cihaz_alimi_mi",
          etiket: "Tıbbi Cihaz Alımı (0/1)",
          tip: "number" as const,
        },
        {
          alan: "son_teklif_verme_tarihi",
          etiket: "Son Teklif Verme Tarihi",
          tip: "date" as const,
        },
        {
          alan: "teslim_tarihi",
          etiket: "Teslim Tarihi",
          tip: "date" as const,
        },
        {
          alan: "yaklasik_maliyet",
          etiket: "Yaklaşık Maliyet (₺)",
          tip: "number" as const,
        },
        { alan: "butce_kodu", etiket: "Bütçe Kodu", tip: "text" as const },
        { alan: "temin_tarihi", etiket: "Temin Tarihi", tip: "date" as const },
        { alan: "notlar", etiket: "Notlar", tip: "textarea" as const },
      ],
    };
  };

  const handleAIApply = (values: AIFilledValues) => {
    // Dynamically map all fields from the returned AI JSON into formData.
    // Parse numeric fields properly if they come as string and are defined in TeminDosyasi as numbers.
    const numericFields = [
      "butce_yili",
      "yaklasik_maliyet",
      "alt_yuklenici_olacak_mi",
      "kismi_teklif_verilecek_mi",
      "avans_verilecek_mi",
      "tibbi_cihaz_alimi_mi",
    ];

    setFormData((prev) => {
      const updated: any = { ...prev };
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          if (numericFields.includes(key)) {
            updated[key] = Number(values[key]) || 0;
          } else {
            updated[key] = String(values[key]);
          }
        }
      });
      return updated;
    });
  };
  const handleAiDescGenerate = async () => {
    if (!formData.konu?.trim()) {
      alert("Lütfen önce dosya konusunu (İşin Adı) giriniz.");
      return;
    }

    setIsDescLoading(true);
    try {
      const prompt =
        `Şu kamu alım işi/ihalesi için sadece 1-2 cümlelik, çok kısa ve öz bir "İşin Kapsamı ve Tanımı" metni oluştur. İhale/İş Adı: "${formData.konu}". Metin kurumsal bir dilde olmalı, ancak ASLA başlık (örn: 1. İşin konusu vb.), madde imi veya uzun paragraflar KULLANMA. İdare adını anonim olarak "İdaremiz" veya "Kurumumuz" şeklinde belirt, gerçek isim verme. Sadece doğrudan açıklamayı düz metin olarak ver.`;

      const res = await window.api.aiGenerate({
        prompt,
        enableDatabaseAccess: false,
      });
      if (res.success && res.data) {
        setFormData((prev) => ({
          ...prev,
          isin_aciklamasi: res.data?.trim() || "",
        }));
      } else {
        alert(
          "Yapay zeka yanıt üretemedi: " + (res.error || "Bilinmeyen hata"),
        );
      }
    } catch (err: any) {
      alert("Bir hata oluştu: " + err.message);
    } finally {
      setIsDescLoading(false);
    }
  };

  const handleAiFormValidation = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    openTextGenerator(
      "notlar",
      "AI Form Tutarsızlık Kontrolü",
      "Form Analiz Sonucu (İsterseniz Notlara Ekleyebilirsiniz)",
      `Sen bir Kamu İhale ve Muhasebe Uzmanısın. Kullanıcı bir Doğrudan Temin ihale dosyası oluşturuyor ancak kaydetmeden önce sana kontrol ettirmek istedi.\n\nAşağıdaki form verilerini ihale mevzuatı (özellikle 22/d vb.), muhasebe kuralları (fonksiyonel kod, ekonomik kod uyumu) ve mantıksal tutarlılık açısından incele:\n\n${dataStr}\n\nEğer KDV, bütçe, ihale şekli, teslim tarihi gibi alanlarda bir hata, eksiklik veya mevzuata aykırılık görüyorsan kullanıcıyı uyar. Her şey normalse tebrik et.`,
    );
  };

  const handleAiFullFormGenerate = () => {
    setShowAIModal(true);
  };

  // Handle Birim Selection and autofill antet fields
  const handleSelectBirim = (birim: any) => {
    setFormData((prev) => ({
      ...prev,
      birim_id: birim.id,
      antet_ek_satir: birim.antet_ek_satir || prev.antet_ek_satir,
      sunulacak_makam: birim.sunum_makami || prev.sunulacak_makam,
      ihtiyac_yeri: birim.ihtiyac_yeri_eki || prev.ihtiyac_yeri,
      e_butce: birim.e_butce || prev.e_butce,
    }));
    setShowBirimSearch(false);
    setBirimSearchQuery("");
  };

  // Handle Form Submission
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.konu?.trim()) {
      alert("Lütfen dosya konusunu (İşin Adı) giriniz.");
      return;
    }

    const normalizeTr = (s: string) => s.trim().toLocaleLowerCase("tr-TR");
    let baseKonu = formData.konu?.trim() || "";

    // Eğer konu sonunda zaten (2) gibi bir ifade varsa, sadece asıl konuyu alalım
    const baseMatch = baseKonu.match(/^(.*?)\s*\(\d+\)$/);
    if (baseMatch) {
      baseKonu = baseMatch[1].trim();
    }

    const targetKonu = normalizeTr(baseKonu);

    // Aynı ismin türevlerini kullanan diğer dosyaları (sadece aynı yıl içinde) bul
    const currentYear = formData.butce_yili ||
      (formData.dosya_acilis_tarihi
        ? new Date(formData.dosya_acilis_tarihi).getFullYear()
        : new Date().getFullYear());
    const matches = dosyalar.filter((d) => {
      if (isEdit && d.id === editId) return false;
      const dYear = d.butce_yili ||
        (d.dosya_acilis_tarihi
          ? new Date(d.dosya_acilis_tarihi).getFullYear()
          : 0);
      if (dYear !== currentYear) return false;

      const dBase = (d.konu || "")
        .trim()
        .replace(/\s*\(\d+\)$/, "")
        .trim();
      return normalizeTr(dBase) === targetKonu;
    });

    let finalKonu = formData.konu?.trim() || "";
    let nextTekrarNo = 1;

    if (matches.length > 0 && !isEdit) {
      const maxNo = Math.max(
        ...matches.map((d) => {
          const m = (d.konu || "").match(/\s*\((\d+)\)$/);
          const textualNo = m ? parseInt(m[1], 10) : 1;
          return Math.max(d.tekrar_no || 1, textualNo);
        }),
      );
      nextTekrarNo = maxNo + 1;
      finalKonu = `${baseKonu} (${nextTekrarNo})`;
    }

    const payload = {
      ...formData,
      konu: finalKonu,
      tekrar_no: nextTekrarNo,
    };

    try {
      if (isEdit) {
        await updateDosya({ ...payload, id: editId! });
        await logActivity(
          "Dosya Güncellendi",
          `${payload.konu || "İsimsiz"} isimli dosya güncellendi.`,
          "info",
        );
        alert("İhale dosyası başarıyla güncellendi.");
      } else {
        await addDosya(payload);
        await logActivity(
          "Yeni Dosya Eklendi",
          `${
            payload.konu || "İsimsiz"
          } konusuyla yeni bir temin dosyası oluşturuldu.`,
          "success",
        );
        alert("Yeni ihale dosyası başarıyla eklendi.");
      }
      navigate({ to: "/dosyalar" });
    } catch (error) {
      console.error(error);
      alert("Kaydetme sırasında bir hata oluştu: " + (error as Error).message);
    }
  };

  // Descriptions for Ihale Sekli (22/d*, 22/d**)
  const getIhaleSekliExplanation = (sekil: string | null | undefined) => {
    switch (sekil) {
      case "22/d*":
        return "Büyükşehir belediyesi sınırları içindeki doğrudan temin limiti.";
      case "22/d**":
        return "Diğer belediyeler ve idareler için doğrudan temin limiti.";
      case "22/a":
        return "İhtiyacın sadece gerçek veya tüzel tek kişi tarafından karşılanabilmesi.";
      case "22/b":
        return "Özel bir hakka sahip gerçek veya tüzel tek kişinin olması.";
      case "22/c":
        return "Mevcut mal, ekipman, teknoloji veya hizmetlerle uyumun sağlanması için yapılacak alımlar.";
      default:
        return "Doğrudan temin mevzuat maddesi.";
    }
  };

  // Turkish lowercase normalization helper
  const normalizeTr = (str: string) =>
    (str || "").trim().toLocaleLowerCase("tr-TR");

  // Calculate frequencies of previous subjects (Sık Kullanılanlar)
  const konuFrequencies = dosyalar.reduce(
    (acc, d) => {
      if (d.konu) {
        const k = d.konu.trim();
        acc[k] = (acc[k] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  // Sort by frequency descending
  const sortedKonular = Object.entries(konuFrequencies)
    .sort((a, b) => b[1] - a[1])
    .map((e) => e[0]);

  const matchedSuggestions = formData.konu
    ? sortedKonular
      .filter(
        (k) =>
          normalizeTr(k).includes(normalizeTr(formData.konu || "")) &&
          normalizeTr(k) !== normalizeTr(formData.konu || ""),
      )
      .slice(0, 8)
    : sortedKonular.slice(0, 8); // Show top 8 frequent items if empty

  const exactMatchCount = formData.konu
    ? dosyalar.filter((d) => {
      const dYear = d.butce_yili || (d.dosya_acilis_tarihi
        ? new Date(d.dosya_acilis_tarihi).getFullYear()
        : 0);
      const currentYear = formData.butce_yili || (formData.dosya_acilis_tarihi
        ? new Date(formData.dosya_acilis_tarihi).getFullYear()
        : new Date().getFullYear());
      return (
        dYear === currentYear &&
        normalizeTr(d.konu) === normalizeTr(formData.konu || "") &&
        (!isEdit || d.id !== editId)
      );
    }).length
    : 0;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* HEADER */}
      <div className="flex-none p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dosyalar"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-850 dark:text-white flex items-center gap-2">
              <FileText className="text-blue-600" size={24} />
              {isEdit
                ? "İhale Dosyası Detaylarını Düzenle"
                : "Yeni Doğrudan Temin İhale Dosyası"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tüm idari, mali, hukuki ve komisyon alanlarını bu panel üzerinden
              yönetin.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Eski Dosyadan Kopyala Butonu */}
          {!isEdit && (
            <button
              type="button"
              onClick={() => setShowKopyalaModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
              title="Geçmişteki bir alımı seçerek formun %80'ini otomatik doldurun"
            >
              <Copy size={14} />
              Mevcut Dosyalardan Kopyala
            </button>
          )}

          {/* YAPAY ZEKA MENÜSÜ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAiMenu(!showAiMenu)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={14} />
              Yapay Zeka
              <ChevronDown
                size={14}
                className={cn(
                  "transition-transform",
                  showAiMenu ? "rotate-180" : "",
                )}
              />
              <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border border-white/20 shadow-sm animate-pulse">
                BETA
              </span>
            </button>

            {showAiMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-[100] overflow-hidden flex flex-col py-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowAiMenu(false);
                    handleAiFormValidation();
                  }}
                  className="px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Bot size={14} className="text-teal-500" />
                  Hata ve Tutarsızlık Kontrolü
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setShowAiMenu(false);
                    handleAiFullFormGenerate();
                  }}
                  className="px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Sparkles size={14} className="text-indigo-500" />
                  Metinden Dosya Üret
                </button>
              </div>
            )}
          </div>

          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={() => {
                const currentYear = new Date().getFullYear();
                setFormData({
                  temin_no: getNextTeminNo(currentYear),
                  dosya_acilis_tarihi: `${currentYear}-06-03`,
                  butce_yili: currentYear,
                  butce_tipi: "Genel Bütçe",
                  konu:
                    "Park Bahçeler Müdürlüğü Elektrik Kablosu ve Aydınlatma Armatürü Alımı",
                  isin_aciklamasi:
                    "X Belediyesi Park Bahçeler Müdürlüğü tarafından yeşil alanlar ve çocuk oyun parklarının aydınlatılmasında kullanılmak üzere elektrik kablosu ve aydınlatma armatürü alımı işi.",
                  birim_id: birimler[0]?.id || null,
                  antet_ek_satir: "Fen İşleri Dairesi Başkanlığı",
                  sunulacak_makam: "BAŞKANLIK MAKAMINA",
                  ihtiyac_yeri: "X Belediyesi Merkez Şantiyesi",
                  e_butce: "46.00.00.01",
                  fonksiyonel_kod: "01.3.9.00",
                  muhasebe_birimi: "30.06.01",
                  harcama_birimi: "30.11.01",
                  finansman_kodu: "5",
                  ekonomik_kod: "03.2.1.01",
                  butce_kodu: "",
                  ihale_tipi: "Doğrudan Temin",
                  tur: "mal",
                  ihale_sekli: "22/d*",
                  teklif_sozlesme_turu: "Birim Fiyat",
                  alt_yuklenici_olacak_mi: 0,
                  kismi_teklif_verilecek_mi: 0,
                  fiyat_farki_dayanagi: "Fiyat Farkı Ödenmeyecek",
                  yatirim_proje_no: "",
                  avans_verilecek_mi: 0,
                  yillara_yaygin: 0,
                  sozlesme_yapilacak_mi: 0,
                  yaklasik_maliyet_hesaplamasi: "Piyasa Fiyat Araştırması",
                  kdv: "20",
                  hesaplama_esasi: "",
                  komisyon_takdiri:
                    "Sadece araştırma fiyatları dikkate alınacak",
                  tibbi_cihaz_alimi_mi: 0,
                  irtibat_yetkilisi_id: personeller[0]?.id || null,
                  onay_personel_id: personeller.find((p) =>
                    p.harcama_yetkilisi_mi === 1
                  )?.id ||
                    personeller[1]?.id ||
                    null,
                  hazirlayan_personel_id: personeller[0]?.id || null,
                  son_teklif_verme_tarihi: "2026-06-10T14:00",
                  teslim_tarihi: "2026-06-30",
                  yaklasik_maliyet: 145005,
                });
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-605 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Test Verisi Doldur
            </button>
          )}
          <Link
            to="/dosyalar"
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            İptal
          </Link>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center gap-2 cursor-pointer"
          >
            <Save size={16} />
            {isEdit ? "Dosyayı Güncelle" : "Dosyayı Kaydet"}
          </button>
        </div>
      </div>

      {/* STEPPER UI */}
      <div className="flex-none bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-12 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex justify-between">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 rounded-full z-0">
            </div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => setActiveTab("genel")}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 transition-all",
                  activeTab === "genel" || activeTab === "ihtiyac" ||
                    activeTab === "teknik"
                    ? "bg-blue-600 border-blue-100 dark:border-blue-900/30 text-white shadow-lg shadow-blue-500/20"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400",
                )}
              >
                1
              </button>
              <span
                className={cn(
                  "mt-2 text-[11px] font-bold uppercase tracking-wider",
                  activeTab === "genel"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400",
                )}
              >
                Genel Bilgiler
              </span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => setActiveTab("ihtiyac")}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 transition-all",
                  activeTab === "ihtiyac" || activeTab === "teknik"
                    ? "bg-blue-500 border-blue-100 dark:border-blue-900/30 text-white shadow-lg shadow-blue-500/20"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400",
                )}
              >
                2
              </button>
              <span
                className={cn(
                  "mt-2 text-[11px] font-bold uppercase tracking-wider",
                  activeTab === "ihtiyac"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400",
                )}
              >
                İhtiyaç Listesi
              </span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => setActiveTab("teknik")}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 transition-all",
                  activeTab === "teknik"
                    ? "bg-blue-600 border-blue-100 dark:border-blue-900/30 text-white shadow-lg shadow-blue-500/20"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400",
                )}
              >
                3
              </button>
              <span
                className={cn(
                  "mt-2 text-[11px] font-bold uppercase tracking-wider",
                  activeTab === "teknik"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400",
                )}
              >
                Teknik Şart. & Ekler
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FORM BODY */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <form
          onSubmit={handleSave}
          className="max-w-5xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6"
        >
          {loadingDb
            ? (
              <div className="p-8 text-center text-sm text-slate-500 italic">
                Bilgiler yükleniyor...
              </div>
            )
            : (
              <>
                {donemTanimsizMi(formData.dosya_acilis_tarihi || undefined) && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl mb-6 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-lg">
                        <HelpCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-red-800 dark:text-red-300">
                          Kritik Hata: 22/d Limit Dönemi Bulunamadı!
                        </h3>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                          Sistemde, seçtiğiniz "Dosya Açılış Tarihi" ({formData
                            .dosya_acilis_tarihi}) ile eşleşen bir Doğrudan
                          Temin Limit Dönemi bulunamadı. Lütfen{" "}
                          <strong>
                            Sistem Ayarları &gt; Mevzuat ve Parametreler
                          </strong>{" "}
                          bölümünden ilgili tarihe ait limiti ekleyiniz. Limit
                          olmadan bu dosyaya tahmini bedel kontrolü yapılamaz.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 1: GENEL BİLGİLER */}
                {activeTab === "genel" && (
                  <GenelBilgilerTab
                    formData={formData}
                    setFormData={setFormData}
                    isEdit={isEdit}
                    birimler={birimler}
                    personeller={personeller}
                    kodSozlugu={kodSozlugu}
                    dosyalar={dosyalar}
                    isDescLoading={isDescLoading}
                    showKonuSuggestions={showKonuSuggestions}
                    setShowKonuSuggestions={setShowKonuSuggestions}
                    exactMatchCount={exactMatchCount}
                    matchedSuggestions={matchedSuggestions}
                    handleAiDescGenerate={handleAiDescGenerate}
                    handleCopyKonuToAciklama={handleCopyKonuToAciklama}
                    openTextGenerator={openTextGenerator}
                    showBirimSearch={showBirimSearch}
                    setShowBirimSearch={setShowBirimSearch}
                    birimSearchQuery={birimSearchQuery}
                    setBirimSearchQuery={setBirimSearchQuery}
                    filteredBirimler={filteredBirimler}
                    handleSelectBirim={handleSelectBirim}
                    showPersonelSearch={showPersonelSearch}
                    setShowPersonelSearch={setShowPersonelSearch}
                    personelSearchQuery={personelSearchQuery}
                    setPersonelSearchQuery={setPersonelSearchQuery}
                    filteredPersoneller={filteredPersoneller}
                  />
                )}

                {/* TAB 2: İHTİYAÇ LİSTESİ */}
                {activeTab === "ihtiyac" && (
                  <IhtiyacListesiTab
                    formData={formData}
                    setFormData={setFormData}
                    isEdit={isEdit}
                    birimler={birimler}
                    personeller={personeller}
                    kodSozlugu={kodSozlugu}
                    dosyalar={dosyalar}
                  />
                )}

                {/* TAB 3: TEKNİK ŞARTNAME & EKLER */}
                {activeTab === "teknik" && (
                  <TeknikSartnameTab
                    formData={formData}
                    setFormData={setFormData}
                    isEdit={isEdit}
                    birimler={birimler}
                    personeller={personeller}
                    kodSozlugu={kodSozlugu}
                    dosyalar={dosyalar}
                  />
                )}
              </>
            )}
          {/* TAB CONTINUATION ACTION BUTTONS */}
          <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-5 mt-6">
            <div className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider">
              {isEdit ? `Dosya ID: #${editId}` : "Yeni Kayıt Yapılıyor"}
            </div>

            <div className="flex gap-3">
              {activeTab !== "genel" && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === "ihtiyac") setActiveTab("genel");
                    if (activeTab === "teknik") {
                      setActiveTab("ihtiyac");
                    }
                  }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-transparent rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Geri Git
                </button>
              )}

              {activeTab !== "teknik"
                ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === "genel") setActiveTab("ihtiyac");
                      else if (activeTab === "ihtiyac") setActiveTab("teknik");
                    }}
                    className="px-4 py-2 bg-slate-800 dark:bg-slate-100 hover:bg-slate-900 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                  >
                    Sonraki Adım
                    <ChevronRight size={14} />
                  </button>
                )
                : (
                  <button
                    onClick={handleSave}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                  >
                    <Save size={16} />
                    {isEdit
                      ? "Tüm Dosyayı Güncelle"
                      : "Dosyayı Kaydet ve Bitir"}
                  </button>
                )}
            </div>
          </div>
        </form>
      </div>

      {/* AI Form Fill Modal */}
      <AIFormFillModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        context={getAIFormContext()}
        onApply={handleAIApply}
      />

      {/* AI Text Generator Modal */}
      <AITextGeneratorModal
        isOpen={textGenConfig.isOpen}
        onClose={() => setTextGenConfig((prev) => ({ ...prev, isOpen: false }))}
        title={textGenConfig.title}
        fieldName={textGenConfig.fieldName}
        initialSubject={formData.konu}
        systemInstruction={textGenConfig.systemInstruction}
        onApply={(text) => {
          setFormData((prev) => ({
            ...prev,
            [textGenConfig.targetField]: text,
          }));
        }}
      />

      {/* AI Kalem Asistanı Modal */}
      <AITextGeneratorModal
        isOpen={aiKalemConfig.isOpen}
        onClose={() => setAiKalemConfig({ isOpen: false })}
        title="Yapay Zeka ile Kalem Tanımlama"
        fieldName="Kalem (OKAS ve Ortak Alımlar Sözlüğü)"
        initialSubject={formData.konu}
        mode="json"
        expectedJsonFormat={'{ "kalemAdi": "Örn: A4 Fotokopi Kağıdı 80gr", "miktari": 50, "birimi": "Paket", "okasKodu": "Örn: 30197630-1" }'}
        systemInstruction={`Sen bir kamu ihale ve doğrudan temin uzmanısın. Kullanıcı bir mal, hizmet veya yapım işi için listeye kalem eklemek istiyor. 
Kullanıcının girdiği genel tanıma ve alımın konusuna (${
          formData.konu || formData.tur
        }) bakarak:
1. En uygun, resmi, şartnameye uygun "Kalem Adı"nı belirle.
2. Bu kalem için EKAP sisteminde kullanılan en uygun "OKAS Kodunu" (Ortak Alımlar Sözlüğü CPV kodu) veya Taşınır/Taşınmaz mal kodunu bul. Bulamazsan uygun bir üst kategori OKAS kodu tahmin et.
3. Uygun miktar ve ölçü birimi (Adet, Paket, Kg, Ton, Ay, Gün, m2 vb.) öner.
Yanıtını SADECE JSON formatında ver.`}
        onApply={(data) => {
          console.log("AI Kalem Verisi:", data);
          alert(
            `Yapay Zeka şu kalemi buldu:\n\nAdı: ${data.kalemAdi}\nOKAS Kodu: ${data.okasKodu}\nMiktar: ${data.miktari} ${data.birimi}\n\nNot: Kalem listesi altyapısı tamamlandığında bu kalem otomatik olarak listeye eklenecektir.`,
          );
        }}
      />

      {/* Eski Dosya Kopyala Modal */}
      <EskiDosyaKopyalaModal
        isOpen={showKopyalaModal}
        onClose={() => setShowKopyalaModal(false)}
        dosyalar={dosyalar}
        onSelect={handleCopyDosya}
      />
    </div>
  );
}
