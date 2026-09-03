import React from "react";
import { ChevronLeft, Edit3, FileText, Sliders } from "lucide-react";
import { IhtiyacListesiType } from "@hakim-pro-app/document-templates";

interface DocumentPreviewSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isEditingMode: boolean;
  setIsEditingMode: (editing: boolean) => void;
  orientation: "portrait" | "landscape";
  setOrientation: (orientation: "portrait" | "landscape") => void;
  formData: Partial<IhtiyacListesiType>;
  setFormData: React.Dispatch<
    React.SetStateAction<Partial<IhtiyacListesiType>>
  >;
  localShowLogoLeft: boolean;
  setLocalShowLogoLeft: (show: boolean) => void;
  localShowLogoRight: boolean;
  setLocalShowLogoRight: (show: boolean) => void;
}

export function DocumentPreviewSidebar({
  sidebarOpen,
  setSidebarOpen,
  isEditingMode,
  setIsEditingMode,
  orientation,
  setOrientation,
  formData,
  setFormData,
  localShowLogoLeft,
  setLocalShowLogoLeft,
  localShowLogoRight,
  setLocalShowLogoRight,
}: DocumentPreviewSidebarProps): React.JSX.Element {
  return (
    <div
      className={`bg-slate-50 dark:bg-slate-900/50 transition-all duration-200 flex flex-col shrink-0 h-full overflow-hidden ${
        sidebarOpen
          ? "w-72 border-r border-slate-200 dark:border-slate-800 opacity-100"
          : "w-0 border-0 opacity-0 pointer-events-none hidden"
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
            Belge Ayarları
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition-colors cursor-pointer"
          title="Paneli Kapat"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar min-h-0">
        <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 rounded-xl text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
          💡 <strong>Canlı Düzenleme:</strong>{" "}
          Belge üzerindeki metin, sayı, tarih ve imza alanlarını sağdaki A4
          sayfasında doğrudan tıklayarak düzenleyebilirsiniz.
        </div>

        {/* Toggles & Settings */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Görünüm & Düzenleme Kontrolleri
          </span>

          {/* Metin Düzenleme Modu */}
          <label className="flex items-center justify-between p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 rounded-xl cursor-pointer hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                  Belge Düzenleme Modu
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  {isEditingMode
                    ? "Canlı düzenleme açık"
                    : "Önizleme modu (Sabit Metin)"}
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isEditingMode}
              onChange={(e) => setIsEditingMode(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
          </label>

          {/* Sayfa Yönü (Dikey / Yatay) */}
          <div className="p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">
              Sayfa Yönü (Düzen)
            </span>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
              <button
                type="button"
                onClick={() => setOrientation("portrait")}
                className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  orientation === "portrait"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Dikey</span>
              </button>
              <button
                type="button"
                onClick={() => setOrientation("landscape")}
                className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  orientation === "landscape"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <FileText className="w-3.5 h-3.5 rotate-90" />
                <span>Yatay</span>
              </button>
            </div>
          </div>

          {/* Sayfa Bölme & İmza Dengeleme (Yetim İmza Önleme) */}
          <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span>📄 Sayfa Bölme & İmza Dengesi</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Tabloyu istediğiniz satırdan 2. sayfaya bölebilir, imzanın tek başına kalmasını önleyebilirsiniz.
            </p>

            {/* Satırdan Bölme Ayarı */}
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  1. Sayfada Kalacak Satır:
                </span>
                <strong className="text-blue-600 dark:text-blue-400 font-mono text-xs">
                  {formData.firstPageLimit ? `${formData.firstPageLimit}. Satırdan Sonra Böl` : "Otomatik"}
                </strong>
              </div>

              {/* Hızlı Satır Seçim Butonları */}
              <div className="flex items-center gap-1">
                {[3, 5, 7, 10, 15].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() =>
                      setFormData((prev: any) => ({
                        ...prev,
                        firstPageLimit: count,
                      }))}
                    className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer border ${
                      formData.firstPageLimit === count
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {count}. Satır
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev: any) => ({
                      ...prev,
                      firstPageLimit: Math.max(
                        1,
                        (prev.firstPageLimit ?? 10) - 1,
                      ),
                    }))}
                  className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                  title="1. sayfadan satır azalt (İkinci sayfaya aktar)"
                >
                  -
                </button>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={formData.firstPageLimit ?? 10}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      firstPageLimit: Number(e.target.value),
                    }))}
                  className="flex-1 accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev: any) => ({
                      ...prev,
                      firstPageLimit: (prev.firstPageLimit ?? 10) + 1,
                    }))}
                  className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                  title="1. sayfaya satır ekle"
                >
                  +
                </button>
              </div>
            </div>


            {/* Newline / Boşluk Satırı Ekleme */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  Ekstra Boş Satır (Newline):
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  {Math.round(((formData as any).ekstraBosluk || 0) / 24)} Satır
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev: any) => ({
                      ...prev,
                      ekstraBosluk: Math.max(0, (prev.ekstraBosluk || 0) - 24),
                    }))}
                  className="flex-1 py-1 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  - Satır Sil
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev: any) => ({
                      ...prev,
                      ekstraBosluk: (prev.ekstraBosluk || 0) + 24,
                    }))}
                  className="flex-1 py-1 px-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  + Satır Ekle
                </button>
                {((formData as any).ekstraBosluk || 0) > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev: any) => ({
                        ...prev,
                        ekstraBosluk: 0,
                      }))}
                    className="py-1 px-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-xs font-bold cursor-pointer"
                    title="Boşluğu Sıfırla"
                  >
                    Sıfırla
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* OLUR Bloğu Toggle */}
          <label className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-slate-300 transition-colors">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              OLUR Bloğunu Göster
            </span>
            <input
              type="checkbox"
              checked={formData.olurYazisi !== false}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  olurYazisi: e.target.checked,
                }))}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
          </label>

          {/* Sol Amblem */}
          <label className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-slate-300 transition-colors">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Sol Amblem / Logo
            </span>
            <input
              type="checkbox"
              checked={localShowLogoLeft}
              onChange={(e) => setLocalShowLogoLeft(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
          </label>

          {/* Sağ Amblem */}
          <label className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-slate-300 transition-colors">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Sağ Amblem / Logo
            </span>
            <input
              type="checkbox"
              checked={localShowLogoRight}
              onChange={(e) => setLocalShowLogoRight(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
