import React, { useMemo } from "react";
import {
  BookOpen,
  Building2,
  Calculator,
  Check,
  ChevronDown,
  ClipboardList,
  Download,
  FileCheck,
  FileSignature,
  FileSpreadsheet,
  FileText,
  FolderPlus,
  Layers,
  Send,
  ShieldAlert,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../../../../../../components/ui/DropdownMenu";

export interface PopoverItemConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColorClass?: string;
  itemClassName?: string;
  onClick?: () => void;
  steps?: number[];
}

export interface PopoverCategoryConfig {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColorClass?: string;
  steps?: number[];
  items: PopoverItemConfig[];
}

export interface MalzemeTabloPopoverProps {
  step?: number;
  onSelectAll?: () => void;
  onDeleteSelected?: () => void;
  onExcelImport?: () => void;
  onKomisyonSettings?: () => void;
  onIstekliFirmaSettings?: () => void;
  onDownloadTemplate?: () => void;
  onExportToLibrary?: () => void;
  // Talep & Başlangıç Belgeleri
  onIhtiyacListesi?: () => void;
  onIhtiyacTalepFormu?: () => void;
  onLuzumMuzekkeresi?: () => void;
  onLuzumMuzekkeresiOnayEki?: () => void;
  onLuzumMuzekkeresiTeslimTesellum?: () => void;
  onHarcamaTalimati?: () => void;
  onHarcamaPusulasi?: () => void;
  // Komisyon İşlemleri
  onGorevlendirmeOnayi?: () => void;
  onGorevlendirmeOnayEki?: () => void;
  onYaklasikMaliyetKomisyonu?: () => void;
  onMuayeneKabulKomisyonu?: () => void;
  onFiyatArastirmaKomisyonu?: () => void;
  // Fiyat Araştırma İşlemleri
  onPiyasaArastirmaGorevlendirmesi?: () => void;
  onPiyasaArastirmaTutanagi?: () => void;
  onYaklasikMaliyetHesapCetveli?: () => void;
  onSonAlimCetveli?: () => void;
  onPiyasaSonucCetveli?: () => void;
  // İstekli Firmalar & Teklif Belgeleri
  onTeklifIstemeMektubu?: () => void;
  onTeklifMektubuDagitim?: () => void;
  onTeklifMektubuKarma?: () => void;
  onFirmalarTeklifCetveli?: () => void;
  onYasaklilikSorgulama?: () => void;
  // Onay İşlemleri
  onOnayBelgesi?: () => void;
  disableDocumentGuidance?: boolean;
}

export function MalzemeTabloPopover(
  props: MalzemeTabloPopoverProps,
): React.JSX.Element | null {
  const {
    step,
    onSelectAll,
    onDeleteSelected,
    onExcelImport,
    onKomisyonSettings,
    onIstekliFirmaSettings,
    onDownloadTemplate,
    onExportToLibrary,
    onIhtiyacListesi,
    onIhtiyacTalepFormu,
    onLuzumMuzekkeresi,
    onLuzumMuzekkeresiOnayEki,
    onLuzumMuzekkeresiTeslimTesellum,
    onHarcamaTalimati,
    onHarcamaPusulasi,
    onGorevlendirmeOnayi,
    onGorevlendirmeOnayEki,
    onYaklasikMaliyetKomisyonu,
    onMuayeneKabulKomisyonu,
    onFiyatArastirmaKomisyonu,
    onPiyasaArastirmaGorevlendirmesi,
    onPiyasaArastirmaTutanagi,
    onYaklasikMaliyetHesapCetveli,
    onSonAlimCetveli,
    onPiyasaSonucCetveli,
    onTeklifIstemeMektubu,
    onTeklifMektubuDagitim,
    onTeklifMektubuKarma,
    onFirmalarTeklifCetveli,
    onYasaklilikSorgulama,
    onOnayBelgesi,
    disableDocumentGuidance,
  } = props;

  const tableActionItems = useMemo(() => {
    const rawItems: PopoverItemConfig[] = [
      {
        id: "selectAll",
        label: "Tümünü Seç",
        icon: Check,
        iconColorClass: "text-slate-450 dark:text-slate-500",
        onClick: onSelectAll,
      },
      {
        id: "deleteSelected",
        label: "Seçilenleri Sil",
        icon: Trash2,
        itemClassName:
          "text-red-655 focus:text-red-655 dark:focus:text-red-400",
        onClick: onDeleteSelected,
      },
      {
        id: "excelImport",
        label: "Excel'den İçe Aktar",
        icon: FileText,
        iconColorClass: "text-slate-450 dark:text-slate-500",
        onClick: onExcelImport,
      },
      {
        id: "downloadTemplate",
        label: "Excel Şablonunu İndir",
        icon: Download,
        iconColorClass: "text-slate-450 dark:text-slate-500",
        onClick: onDownloadTemplate,
      },
      {
        id: "exportToLibrary",
        label: "Genel Kütüphaneye Aktar",
        icon: BookOpen,
        iconColorClass: "text-slate-450 dark:text-slate-500",
        onClick: onExportToLibrary,
      },
      {
        id: "komisyonSettings",
        label: "Komisyon Ayarları",
        icon: Users,
        iconColorClass: "text-blue-500",
        onClick: onKomisyonSettings,
      },
      {
        id: "istekliFirmaSettings",
        label: "İstekli Firma Ayarları",
        icon: Building2,
        iconColorClass: "text-purple-500",
        onClick: onIstekliFirmaSettings,
      },
    ];
    return rawItems.filter((item) => Boolean(item.onClick));
  }, [
    onSelectAll,
    onDeleteSelected,
    onExcelImport,
    onDownloadTemplate,
    onExportToLibrary,
    onKomisyonSettings,
    onIstekliFirmaSettings,
  ]);

  const documentCategories = useMemo(() => {
    if (!disableDocumentGuidance) return [];

    const rawCategories: PopoverCategoryConfig[] = [
      {
        id: "talepBaslangic",
        title: "Talep & Başlangıç Belgeleri",
        icon: FolderPlus,
        iconColorClass: "text-teal-500",
        steps: [1],
        items: [
          {
            id: "ihtiyacListesi",
            label: "İhtiyaç Listesi",
            icon: FileText,
            iconColorClass: "text-teal-500",
            onClick: onIhtiyacListesi,
            steps: [1],
          },
          {
            id: "ihtiyacTalepFormu",
            label: "İhtiyaç Talep Formu",
            icon: FileText,
            iconColorClass: "text-teal-500",
            onClick: onIhtiyacTalepFormu,
            steps: [1],
          },
          {
            id: "luzumMuzekkeresi",
            label: "Lüzum Müzekkeresi",
            icon: FileText,
            iconColorClass: "text-teal-600",
            onClick: onLuzumMuzekkeresi,
            steps: [1],
          },
          {
            id: "luzumMuzekkeresiOnayEki",
            label: "Lüzum Müzekkeresi Onay Eki",
            icon: FileText,
            iconColorClass: "text-teal-600",
            onClick: onLuzumMuzekkeresiOnayEki,
            steps: [1],
          },
          {
            id: "luzumMuzekkeresiTeslimTesellum",
            label: "Lüzum Müz. Teslim Tesellüm",
            icon: FileText,
            iconColorClass: "text-teal-600",
            onClick: onLuzumMuzekkeresiTeslimTesellum,
            steps: [1],
          },
          {
            id: "harcamaTalimati",
            label: "Harcama Talimatı",
            icon: FileText,
            iconColorClass: "text-teal-700",
            onClick: onHarcamaTalimati,
            steps: [1],
          },
          {
            id: "harcamaPusulasi",
            label: "Harcama Pusulası",
            icon: FileText,
            iconColorClass: "text-teal-700",
            onClick: onHarcamaPusulasi,
            steps: [1],
          },
        ],
      },
      {
        id: "komisyon",
        title: "Komisyon Belgeleri",
        icon: Users,
        iconColorClass: "text-blue-500",
        steps: [1, 2],
        items: [
          {
            id: "gorevlendirmeOnayi",
            label: "Görevlendirme Onayı",
            icon: FileCheck,
            iconColorClass: "text-blue-500",
            onClick: onGorevlendirmeOnayi,
            steps: [1, 2],
          },
          {
            id: "gorevlendirmeOnayEki",
            label: "Görevlendirme Onay Eki",
            icon: FileText,
            iconColorClass: "text-blue-500",
            onClick: onGorevlendirmeOnayEki,
            steps: [1, 2],
          },
          {
            id: "yaklasikMaliyetKomisyonu",
            label: "Yaklaşık Maliyet Tespit Kom.",
            icon: UserCheck,
            iconColorClass: "text-slate-450 dark:text-slate-500",
            onClick: onYaklasikMaliyetKomisyonu,
            steps: [1],
          },
          {
            id: "muayeneKabulKomisyonu",
            label: "Muayene Kabul ve Tespit Kom.",
            icon: UserCheck,
            iconColorClass: "text-slate-450 dark:text-slate-500",
            onClick: onMuayeneKabulKomisyonu,
            steps: [4],
          },
          {
            id: "fiyatArastirmaKomisyonu",
            label: "Fiyat Araştırma ve Muayene Kom.",
            icon: UserCheck,
            iconColorClass: "text-slate-450 dark:text-slate-500",
            onClick: onFiyatArastirmaKomisyonu,
            steps: [2],
          },
        ],
      },
      {
        id: "fiyatArastirma",
        title: "Fiyat Araştırma Belgeleri",
        icon: ClipboardList,
        iconColorClass: "text-indigo-500",
        steps: [2],
        items: [
          {
            id: "piyasaArastirmaGorevlendirmesi",
            label: "Piyasa Arş. Görevlendirmesi",
            icon: ClipboardList,
            iconColorClass: "text-indigo-500",
            onClick: onPiyasaArastirmaGorevlendirmesi,
            steps: [2],
          },
          {
            id: "piyasaArastirmaTutanagi",
            label: "Piyasa Araştırma Tutanağı",
            icon: ClipboardList,
            iconColorClass: "text-indigo-500",
            onClick: onPiyasaArastirmaTutanagi,
            steps: [2],
          },
          {
            id: "yaklasikMaliyetHesapCetveli",
            label: "Yaklaşık Maliyet Hesap Cetveli",
            icon: Calculator,
            iconColorClass: "text-emerald-500",
            onClick: onYaklasikMaliyetHesapCetveli,
            steps: [2],
          },
          {
            id: "sonAlimCetveli",
            label: "Son Alım Cetveli",
            icon: Calculator,
            iconColorClass: "text-emerald-500",
            onClick: onSonAlimCetveli,
            steps: [1, 2],
          },
          {
            id: "piyasaSonucCetveli",
            label: "Piyasa Arş. Sonuc Cetveli",
            icon: FileSpreadsheet,
            iconColorClass: "text-cyan-500",
            onClick: onPiyasaSonucCetveli,
            steps: [2],
          },
        ],
      },
      {
        id: "istekliFirmalar",
        title: "İstekli Firmalar & Teklif Belgeleri",
        icon: Building2,
        iconColorClass: "text-purple-500",
        steps: [2],
        items: [
          {
            id: "teklifIstemeMektubu",
            label: "Teklif İsteme Mektubu / Fiyat Formu",
            icon: Send,
            iconColorClass: "text-purple-500",
            onClick: onTeklifIstemeMektubu,
            steps: [2],
          },
          {
            id: "teklifMektubuDagitim",
            label: "Teklif Mektubu (Dağıtım)",
            icon: FileSignature,
            iconColorClass: "text-violet-500",
            onClick: onTeklifMektubuDagitim,
            steps: [2],
          },
          {
            id: "teklifMektubuKarma",
            label: "Teklif Mektubu (Dağıtım Karma)",
            icon: Layers,
            iconColorClass: "text-fuchsia-500",
            onClick: onTeklifMektubuKarma,
            steps: [2],
          },
          {
            id: "firmalarTeklifCetveli",
            label: "Firmalara Teklif Cetveli",
            icon: FileSpreadsheet,
            iconColorClass: "text-indigo-500",
            onClick: onFirmalarTeklifCetveli,
            steps: [2],
          },
          {
            id: "yasaklilikSorgulama",
            label: "EKAP Yasaklılık Sorgulama",
            icon: ShieldAlert,
            iconColorClass: "text-rose-500",
            onClick: onYasaklilikSorgulama,
            steps: [2],
          },
        ],
      },
      {
        id: "onayBelgeleri",
        title: "Onay Belgeleri",
        icon: FileCheck,
        iconColorClass: "text-amber-500",
        steps: [1, 2],
        items: [
          {
            id: "onayBelgesi",
            label: "Doğrudan Temin Onay Belgesi",
            icon: FileCheck,
            iconColorClass: "text-amber-500",
            onClick: onOnayBelgesi,
            steps: [2],
          },
        ],
      },
    ];

    return rawCategories
      .map((cat) => {
        const activeItems = cat.items.filter((item) => {
          if (!item.onClick) return false;
          if (step && item.steps && !item.steps.includes(step)) return false;
          return true;
        });

        if (step && cat.steps && !cat.steps.includes(step)) {
          return { ...cat, items: [] };
        }

        return { ...cat, items: activeItems };
      })
      .filter((cat) => cat.items.length > 0);
  }, [
    disableDocumentGuidance,
    step,
    onIhtiyacListesi,
    onIhtiyacTalepFormu,
    onLuzumMuzekkeresi,
    onLuzumMuzekkeresiOnayEki,
    onLuzumMuzekkeresiTeslimTesellum,
    onHarcamaTalimati,
    onHarcamaPusulasi,
    onGorevlendirmeOnayi,
    onGorevlendirmeOnayEki,
    onYaklasikMaliyetKomisyonu,
    onMuayeneKabulKomisyonu,
    onFiyatArastirmaKomisyonu,
    onPiyasaArastirmaGorevlendirmesi,
    onPiyasaArastirmaTutanagi,
    onYaklasikMaliyetHesapCetveli,
    onSonAlimCetveli,
    onPiyasaSonucCetveli,
    onTeklifIstemeMektubu,
    onTeklifMektubuDagitim,
    onTeklifMektubuKarma,
    onFirmalarTeklifCetveli,
    onYasaklilikSorgulama,
    onOnayBelgesi,
  ]);

  const hasTableActions = tableActionItems.length > 0;
  const hasDocumentCategories = documentCategories.length > 0;

  if (!hasTableActions && !hasDocumentCategories) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer h-8"
        >
          <ClipboardList className="w-3.5 h-3.5 text-slate-500" />
          İşlemler
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end">
        {hasTableActions && (
          <>
            <DropdownMenuLabel className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1">
              Tablo İşlemleri
            </DropdownMenuLabel>
            {tableActionItems.map((item) => {
              const ItemIcon = item.icon;
              return (
                <DropdownMenuItem
                  key={item.id}
                  onClick={item.onClick}
                  className={item.itemClassName}
                >
                  <ItemIcon
                    className={`w-3.5 h-3.5 mr-2 ${item.iconColorClass || ""}`}
                  />
                  {item.label}
                </DropdownMenuItem>
              );
            })}
          </>
        )}

        {hasDocumentCategories && (
          <>
            {hasTableActions && <DropdownMenuSeparator />}

            <DropdownMenuLabel className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1">
              Yazdırma & Şablon Belgeleri
            </DropdownMenuLabel>

            {documentCategories.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <DropdownMenuSub key={cat.id}>
                  <DropdownMenuSubTrigger>
                    <CatIcon
                      className={`w-3.5 h-3.5 mr-2 ${cat.iconColorClass || ""}`}
                    />
                    {cat.title}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-64">
                    {cat.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <DropdownMenuItem key={item.id} onClick={item.onClick}>
                          <ItemIcon
                            className={`w-3.5 h-3.5 mr-2 ${
                              item.iconColorClass || ""
                            }`}
                          />
                          {item.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              );
            })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
