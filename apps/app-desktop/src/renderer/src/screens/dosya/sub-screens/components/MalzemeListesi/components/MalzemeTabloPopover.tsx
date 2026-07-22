import React from "react";
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

export interface MalzemeTabloPopoverProps {
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

export function MalzemeTabloPopover({
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
}: MalzemeTabloPopoverProps): React.JSX.Element {
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
        <DropdownMenuLabel className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1">
          Tablo İşlemleri
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={onSelectAll || (() => console.log("Tümünü Seç tıklandı"))}
        >
          <Check className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500 mr-2" />
          Tümünü Seç
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onDeleteSelected ||
            (() => console.log("Seçilenleri Sil tıklandı"))}
          className="text-red-655 focus:text-red-655 dark:focus:text-red-400"
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" />
          Seçilenleri Sil
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onExcelImport ||
            (() => console.log("Excel'den İçe Aktar tıklandı"))}
        >
          <FileText className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500 mr-2" />
          Excel&#39;den İçe Aktar
        </DropdownMenuItem>

        {onDownloadTemplate && (
          <DropdownMenuItem onClick={onDownloadTemplate}>
            <Download className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500 mr-2" />
            Excel Şablonunu İndir
          </DropdownMenuItem>
        )}

        {onExportToLibrary && (
          <DropdownMenuItem onClick={onExportToLibrary}>
            <BookOpen className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500 mr-2" />
            Genel Kütüphaneye Aktar
          </DropdownMenuItem>
        )}

        {onKomisyonSettings && (
          <DropdownMenuItem onClick={onKomisyonSettings}>
            <Users className="w-3.5 h-3.5 text-blue-500 mr-2" />
            Komisyon Ayarları
          </DropdownMenuItem>
        )}

        {onIstekliFirmaSettings && (
          <DropdownMenuItem onClick={onIstekliFirmaSettings}>
            <Building2 className="w-3.5 h-3.5 text-purple-500 mr-2" />
            İstekli Firma Ayarları
          </DropdownMenuItem>
        )}

        {!disableDocumentGuidance && (
          <>
            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1">
              Yazdırma & Şablon Belgeleri
            </DropdownMenuLabel>

            {/* TALEP & BAŞLANGIÇ BELGELERİ ALT MENÜSÜ */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FolderPlus className="w-3.5 h-3.5 text-teal-500 mr-2" />
                Talep & Başlangıç Belgeleri
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-64">
                {onIhtiyacListesi && (
                  <DropdownMenuItem onClick={onIhtiyacListesi}>
                    <FileText className="w-3.5 h-3.5 text-teal-500 mr-2" />
                    İhtiyaç Listesi
                  </DropdownMenuItem>
                )}

                {onIhtiyacTalepFormu && (
                  <DropdownMenuItem onClick={onIhtiyacTalepFormu}>
                    <FileText className="w-3.5 h-3.5 text-teal-500 mr-2" />
                    İhtiyaç Talep Formu
                  </DropdownMenuItem>
                )}

                {onLuzumMuzekkeresi && (
                  <DropdownMenuItem onClick={onLuzumMuzekkeresi}>
                    <FileText className="w-3.5 h-3.5 text-teal-600 mr-2" />
                    Lüzum Müzekkeresi
                  </DropdownMenuItem>
                )}

                {onLuzumMuzekkeresiOnayEki && (
                  <DropdownMenuItem onClick={onLuzumMuzekkeresiOnayEki}>
                    <FileText className="w-3.5 h-3.5 text-teal-600 mr-2" />
                    Lüzum Müzekkeresi Onay Eki
                  </DropdownMenuItem>
                )}

                {onLuzumMuzekkeresiTeslimTesellum && (
                  <DropdownMenuItem onClick={onLuzumMuzekkeresiTeslimTesellum}>
                    <FileText className="w-3.5 h-3.5 text-teal-600 mr-2" />
                    Lüzum Müz. Teslim Tesellüm
                  </DropdownMenuItem>
                )}

                {onHarcamaTalimati && (
                  <DropdownMenuItem onClick={onHarcamaTalimati}>
                    <FileText className="w-3.5 h-3.5 text-teal-700 mr-2" />
                    Harcama Talimatı
                  </DropdownMenuItem>
                )}

                {onHarcamaPusulasi && (
                  <DropdownMenuItem onClick={onHarcamaPusulasi}>
                    <FileText className="w-3.5 h-3.5 text-teal-700 mr-2" />
                    Harcama Pusulası
                  </DropdownMenuItem>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* KOMİSYON BELGELERİ ALT MENÜSÜ */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Users className="w-3.5 h-3.5 text-blue-500 mr-2" />
                Komisyon Belgeleri
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-64">
                <DropdownMenuItem
                  onClick={onGorevlendirmeOnayi ||
                    (() => console.log("Görevlendirme Onayı tıklandı"))}
                >
                  <FileCheck className="w-3.5 h-3.5 text-blue-500 mr-2" />
                  Görevlendirme Onayı
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={onGorevlendirmeOnayEki ||
                    (() => console.log("Görevlendirme Onay Eki tıklandı"))}
                >
                  <FileText className="w-3.5 h-3.5 text-blue-500 mr-2" />
                  Görevlendirme Onay Eki
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={onYaklasikMaliyetKomisyonu ||
                    (() =>
                      console.log(
                        "Yaklaşık Maliyet Tespit Komisyonu tıklandı",
                      ))}
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500 mr-2" />
                  Yaklaşık Maliyet Tespit Kom.
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={onMuayeneKabulKomisyonu ||
                    (() =>
                      console.log(
                        "Muayene Kabul ve Tespit Komisyonu tıklandı",
                      ))}
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500 mr-2" />
                  Muayene Kabul ve Tespit Kom.
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={onFiyatArastirmaKomisyonu ||
                    (() =>
                      console.log(
                        "Fiyat Araştırma ve Muayene Komisyonu tıklandı",
                      ))}
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500 mr-2" />
                  Fiyat Araştırma ve Muayene Kom.
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* FİYAT ARAŞTIRMA BELGELERİ ALT MENÜSÜ */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ClipboardList className="w-3.5 h-3.5 text-indigo-500 mr-2" />
                Fiyat Araştırma Belgeleri
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-64">
                <DropdownMenuItem
                  onClick={onPiyasaArastirmaGorevlendirmesi ||
                    (() =>
                      console.log("Piyasa Araştırma Görevlendirmesi tıklandı"))}
                >
                  <ClipboardList className="w-3.5 h-3.5 text-indigo-500 mr-2" />
                  Piyasa Arş. Görevlendirmesi
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={onPiyasaArastirmaTutanagi ||
                    (() => console.log("Piyasa Araştırma Tutanağı tıklandı"))}
                >
                  <ClipboardList className="w-3.5 h-3.5 text-indigo-500 mr-2" />
                  Piyasa Araştırma Tutanağı
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={onYaklasikMaliyetHesapCetveli ||
                    (() =>
                      console.log("Yaklaşık Maliyet Hesap Cetveli tıklandı"))}
                >
                  <Calculator className="w-3.5 h-3.5 text-emerald-500 mr-2" />
                  Yaklaşık Maliyet Hesap Cetveli
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={onSonAlimCetveli ||
                    (() => console.log("Son Alım Cetveli tıklandı"))}
                >
                  <Calculator className="w-3.5 h-3.5 text-emerald-500 mr-2" />
                  Son Alım Cetveli
                </DropdownMenuItem>

                {onPiyasaSonucCetveli && (
                  <DropdownMenuItem onClick={onPiyasaSonucCetveli}>
                    <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-500 mr-2" />
                    Piyasa Arş. Sonuc Cetveli
                  </DropdownMenuItem>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* İSTEKLİ FİRMALAR & TEKLİF BELGELERİ ALT MENÜSÜ */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Building2 className="w-3.5 h-3.5 text-purple-500 mr-2" />
                İstekli Firmalar & Teklifler
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-64">
                <DropdownMenuItem
                  onClick={onTeklifIstemeMektubu ||
                    (() => console.log("Teklif İsteme Mektubu tıklandı"))}
                >
                  <Send className="w-3.5 h-3.5 text-purple-500 mr-2" />
                  Teklif İsteme Mektubu / Fiyat Formu
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={onTeklifMektubuDagitim ||
                    (() => console.log("Teklif Mektubu Dağıtım tıklandı"))}
                >
                  <FileSignature className="w-3.5 h-3.5 text-violet-500 mr-2" />
                  Teklif Mektubu (Dağıtım)
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={onTeklifMektubuKarma ||
                    (() =>
                      console.log("Teklif Mektubu Dağıtım Karma tıklandı"))}
                >
                  <Layers className="w-3.5 h-3.5 text-fuchsia-500 mr-2" />
                  Teklif Mektubu (Dağıtım Karma)
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={onFirmalarTeklifCetveli ||
                    (() => console.log("Firmalara Teklif Cetveli tıklandı"))}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-500 mr-2" />
                  Firmalara Teklif Cetveli
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={onYasaklilikSorgulama ||
                    (() => console.log("EKAP Yasaklılık Sorgulama tıklandı"))}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500 mr-2" />
                  EKAP Yasaklılık Sorgulama
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
