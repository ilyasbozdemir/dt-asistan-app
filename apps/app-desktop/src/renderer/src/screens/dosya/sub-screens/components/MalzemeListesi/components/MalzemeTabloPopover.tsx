import {
  Calculator,
  Check,
  ChevronDown,
  ClipboardList,
  FileCheck,
  FileText,
  Printer,
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
  // Onay İşlemleri
  onOnayBelgesi?: () => void;
}

export function MalzemeTabloPopover({
  onSelectAll,
  onDeleteSelected,
  onExcelImport,
  onKomisyonSettings,
  onGorevlendirmeOnayi,
  onGorevlendirmeOnayEki,
  onYaklasikMaliyetKomisyonu,
  onMuayeneKabulKomisyonu,
  onFiyatArastirmaKomisyonu,
  onPiyasaArastirmaGorevlendirmesi,
  onPiyasaArastirmaTutanagi,
  onYaklasikMaliyetHesapCetveli,
  onSonAlimCetveli,
  onOnayBelgesi,
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

      <DropdownMenuContent className="w-56" align="end">
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
          Excel'den İçe Aktar
        </DropdownMenuItem>

        {onKomisyonSettings && (
          <DropdownMenuItem onClick={onKomisyonSettings}>
            <Users className="w-3.5 h-3.5 text-slate-455 mr-2" />
            Komisyon Ayarları
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1">
          Yazdırma İşlemleri
        </DropdownMenuLabel>

        {/* KOMİSYON BELGELERİ ALT MENÜSÜ */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Users className="w-3.5 h-3.5 text-blue-500 mr-2" />
            Komisyon Belgeleri
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-60">
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
                  console.log("Yaklaşık Maliyet Tespit Komisyonu tıklandı"))}
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500 mr-2" />
              Yaklaşık Maliyet Tespit Kom.
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onMuayeneKabulKomisyonu || (() =>
                console.log("Muayene Kabul ve Tespit Komisyonu tıklandı"))}
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500 mr-2" />
              Muayene Kabul ve Tespit Kom.
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onFiyatArastirmaKomisyonu || (() =>
                console.log("Fiyat Araştırma ve Muayene Komisyonu tıklandı"))}
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
          <DropdownMenuSubContent className="w-60">
            <DropdownMenuItem
              onClick={onPiyasaArastirmaGorevlendirmesi || (() =>
                console.log("Piyasa Araştırma Görevlendirmesi tıklandı"))}
            >
              <ClipboardList className="w-3.5 h-3.5 text-indigo-500 mr-2" />
              Piyasa Arş. Görevlendirmesi
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onPiyasaArastirmaTutanagi || (() =>
                console.log("Piyasa Araştırma Tutanağı tıklandı"))}
            >
              <ClipboardList className="w-3.5 h-3.5 text-indigo-500 mr-2" />
              Piyasa Araştırma Tutanağı
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onYaklasikMaliyetHesapCetveli || (() =>
                console.log("Yaklaşık Maliyet Hesap Cetveli tıklandı"))}
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-500 mr-2" />
              Yaklaşık Maliyet Hesap Cetveli
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onSonAlimCetveli || (() =>
                console.log("Son Alım Cetveli tıklandı"))}
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-500 mr-2" />
              Son Alım Cetveli
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* ONAY BELGELERİ ALT MENÜSÜ */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FileCheck className="w-3.5 h-3.5 text-amber-500 mr-2" />
            Onay Belgeleri
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-60">
            <DropdownMenuItem
              onClick={onOnayBelgesi || (() =>
                console.log("Onay Belgesi tıklandı"))}
            >
              <FileCheck className="w-3.5 h-3.5 text-amber-500 mr-2" />
              Onay Belgesi
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
