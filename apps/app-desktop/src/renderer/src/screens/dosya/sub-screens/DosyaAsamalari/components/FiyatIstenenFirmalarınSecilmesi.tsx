import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  Building2,
  Calculator,
  CheckSquare,
  FileText,
  MoreVertical,
  Plus,
  Search,
  Square,
  Tag,
  Trash2,
  X,
} from "lucide-react";

const MIN_FIRMS = 2;
const MAX_FIRMS = 3;

export interface Firma {
  id: number;
  firma_no?: string;
  unvan: string;
  telefon?: string;
  faks?: string;
  email?: string;
  semt?: string;
  sehir?: string;
  isAdded?: boolean;
  temin_firma_id?: number;
  /** Eğer true ise belgede 'Sayın İlgili' yerine firma unvanı basılır */
  unvanKullan?: boolean;
  [key: string]: unknown;
}

export interface FirmaColumn {
  key: string;
  label: string;
  className?: string;
  render?: (firma: Firma) => React.ReactNode;
}

export interface FiyatIstenenFirmalarınSecilmesiProps {
  title?: string;
  /** Havuz firmaları (eklenmiş + eklenmemiş hepsi, isAdded bayrağıyla) */
  firms: Firma[];
  columns: FirmaColumn[];
  onFirmaEkle: (firma: Firma) => void;
  onFirmaCikar?: (firma: Firma) => void;
  /** Fiyat Girişi / Matrisi Açma */
  onFiyatGir?: () => void;
  /** Fiyat Piyasa Araştırma Formu açma */
  onFiyatPiyasaFormu?: (firma: Firma) => void;
  /** Birim Fiyat Araştırması açma */
  onBirimFiyatArastirmasi?: (firma: Firma) => void;
  /** Unvan Kullan toggle callback — per firma güncelleme */
  onUnvanKullanToggle?: (firma: Firma, value: boolean) => void;
  /** Rich Firma Seçme Modalini tetikleme callback */
  onOpenFirmaSecmeModali?: () => void;
  /** Ekstra Üst Bar Butonları / Popover (Örn. Tablo İşlemleri) */
  extraHeaderAction?: React.ReactNode;
}

/* ─── Firma Seçim Modali ─────────────────────────────────────────── */
interface FirmaEkleModaliProps {
  availableFirms: Firma[];
  addedCount: number;
  onConfirm: (firms: Firma[]) => void | Promise<void>;
  onClose: () => void;
}

function FirmaEkleModali(
  { availableFirms, addedCount, onConfirm, onClose }: FirmaEkleModaliProps,
) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const remaining = MAX_FIRMS - addedCount;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return availableFirms;
    return availableFirms.filter(
      (f) =>
        String(f.unvan ?? "")
          .toLowerCase()
          .includes(q) ||
        String(f.vergi_no ?? "")
          .toLowerCase()
          .includes(q) ||
        String(f.sehir ?? "")
          .toLowerCase()
          .includes(q) ||
        String(f.telefon ?? "")
          .toLowerCase()
          .includes(q),
    );
  }, [availableFirms, query]);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size < remaining) next.add(id);
      }
      return next;
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const firmsToAdd = availableFirms.filter((f) => selected.has(f.id));
      await onConfirm(firmsToAdd);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh] border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              İstekli Firma Ekle
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Havuzdan firma seçin — en fazla{" "}
              <span className="font-bold text-amber-500">{MAX_FIRMS}</span>{" "}
              firma eklenebilir
              {remaining < MAX_FIRMS && (
                <span className="ml-1 text-slate-500">
                  (mevcut: {addedCount}, {remaining} ekleyebilirsiniz)
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {remaining === 0 && (
          <div className="mx-5 mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Maksimum {MAX_FIRMS}{" "}
            firma eklenebilir. Daha fazla eklemek için önce bir firmayı çıkarın.
          </div>
        )}

        <div className="p-4 pb-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Firma ara (Unvan, VKN, Şehir)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {filtered.length === 0
            ? (
              <p className="py-8 text-center text-xs text-slate-400">
                Eşleşen firma bulunamadı.
              </p>
            )
            : (
              filtered.map((firma) => {
                const isSelected = selected.has(firma.id);
                const isDisabled = !isSelected && selected.size >= remaining;
                return (
                  <button
                    key={firma.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => toggle(firma.id)}
                    className={[
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer",
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                        : isDisabled
                        ? "bg-slate-50 dark:bg-slate-800/40 border-slate-150 dark:border-slate-800 opacity-50 cursor-not-allowed"
                        : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10",
                    ].join(" ")}
                  >
                    <span
                      className={isSelected
                        ? "text-blue-500"
                        : "text-slate-400"}
                    >
                      {isSelected
                        ? <CheckSquare className="w-4 h-4" />
                        : <Square className="w-4 h-4" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {firma.unvan}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {[firma.vergi_no, firma.sehir, firma.telefon].filter(
                          Boolean,
                        ).join(" · ")}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            {selected.size > 0
              ? (
                <span>
                  <span className="font-bold text-blue-600">
                    {selected.size}
                  </span>{" "}
                  firma seçildi
                </span>
              )
              : (
                "Eklenecek firmaları işaretleyin"
              )}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selected.size === 0 || isSubmitting}
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer border-0"
            >
              {isSubmitting ? "Ekleniyor..." : `Ekle (${selected.size})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Satır Kebap Menüsü ─────────────────────────────────────────── */
interface RowMenuProps {
  firma: Firma;
  onFirmaCikar?: (firma: Firma) => void;
  onFiyatGir?: () => void;
  onFiyatPiyasaFormu?: (firma: Firma) => void;
  onBirimFiyatArastirmasi?: (firma: Firma) => void;
  onUnvanKullanToggle?: (firma: Firma, value: boolean) => void;
}

function RowMenu({
  firma,
  onFirmaCikar,
  onFiyatGir,
  onFiyatPiyasaFormu,
  onBirimFiyatArastirmasi,
  onUnvanKullanToggle,
}: RowMenuProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );

  const updateCoords = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 240;
      let left = rect.right - menuWidth;
      if (left < 10) left = 10;
      let top = rect.bottom + 4;
      if (top + 260 > window.innerHeight) {
        top = Math.max(10, rect.top - 260 - 4);
      }
      setCoords({ top, left });
    }
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    updateCoords();
    window.addEventListener("resize", updateCoords);
    window.addEventListener("scroll", updateCoords, true);
    return () => {
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords, true);
    };
  }, [open, updateCoords]);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unvanKullan = Boolean(firma.unvanKullan);

  const handleItem = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer border-0"
        title="İşlemler"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
            className="fixed z-[9999] w-60 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-100"
          >
            {/* Fiyat Girişi */}
            {onFiyatGir && (
              <button
                type="button"
                onClick={() => handleItem(onFiyatGir)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-emerald-500 shrink-0" />
                Teklif / Fiyat Gir
              </button>
            )}

            {/* Belge İndirme / Görüntüleme Mektupları */}
            {onFiyatPiyasaFormu && (
              <button
                type="button"
                onClick={() => handleItem(() => onFiyatPiyasaFormu(firma))}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                Fiyat Araştırma Formu
              </button>
            )}

            {onBirimFiyatArastirmasi && (
              <button
                type="button"
                onClick={() => handleItem(() => onBirimFiyatArastirmasi(firma))}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                Birim Fiyat Araştırma Mektubu
              </button>
            )}

            {onFirmaCikar && (
              <>
                <hr className="my-1 border-slate-100 dark:border-slate-800" />
                <button
                  type="button"
                  onClick={() => handleItem(() => onFirmaCikar(firma))}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  Listeden Çıkar
                </button>
              </>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

/* ─── Ana Bileşen ────────────────────────────────────────────────── */
export function FiyatIstenenFirmalarınSecilmesi({
  title = "Fiyat İstenen Firmaların Seçilmesi",
  firms,
  columns,
  onFirmaEkle,
  onFirmaCikar,
  onFiyatGir,
  onFiyatPiyasaFormu,
  onBirimFiyatArastirmasi,
  onUnvanKullanToggle,
  onOpenFirmaSecmeModali,
  extraHeaderAction,
}: FiyatIstenenFirmalarınSecilmesiProps): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Duplicate ID'leri filtrele — allPoolFirms'den kaynaklanan çakışmaları önle
  const addedFirms = useMemo(() => {
    const seen = new Set<number>();
    return firms.filter((f) => {
      if (!f.isAdded) return false;
      const key = f.temin_firma_id ?? f.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [firms]);

  const availableFirms = useMemo(() => {
    const seen = new Set<number>();
    return firms.filter((f) => {
      if (f.isAdded || seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
  }, [firms]);

  const canAdd = addedFirms.length <= MAX_FIRMS;

  const handleConfirm = async (selected: Firma[]) => {
    for (const f of selected) {
      await onFirmaEkle(f);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      {isModalOpen && (
        <FirmaEkleModali
          availableFirms={availableFirms}
          addedCount={addedFirms.length}
          onConfirm={handleConfirm}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <div className="space-y-0 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-xs overflow-hidden">
        {/* Üst Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Fiyat teklifi istenecek firmalar — en az{" "}
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {MIN_FIRMS}
                </span>{" "}
                en fazla{" "}
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {MAX_FIRMS}
                </span>{" "}
                firma eklenebilir.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {addedFirms.length > 0 && (
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {addedFirms.length} / {MAX_FIRMS}
              </span>
            )}

            {addedFirms.length > 0 && onFiyatGir && (
              <button
                type="button"
                onClick={onFiyatGir}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all cursor-pointer border-0 shadow-sm hover:shadow"
                title="Piyasa fiyat araştırması teklif fiyatlarını gir"
              >
                <Calculator className="w-3.5 h-3.5" />
                Fiyat Gir
              </button>
            )}

            <button
              type="button"
              disabled={!canAdd || availableFirms.length === 0}
              onClick={() => {
                if (onOpenFirmaSecmeModali) {
                  onOpenFirmaSecmeModali();
                } else {
                  setIsModalOpen(true);
                }
              }}
              title={!canAdd
                ? `Maksimum ${MAX_FIRMS} firma eklenebilir`
                : "Firma ekle"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-bold transition-colors cursor-pointer border-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Firma Ekle
            </button>

            {extraHeaderAction}
          </div>
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap ${
                      column.className ?? ""
                    }`}
                  >
                    {column.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-14">
                  İşlem
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {addedFirms.length === 0
                ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-4 py-10 text-center text-xs text-slate-400"
                    >
                      Henüz firma eklenmedi.{" "}
                      {availableFirms.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(true)}
                          className="text-blue-500 hover:underline font-semibold cursor-pointer bg-transparent border-0 p-0"
                        >
                          Firma ekle
                        </button>
                      )}
                    </td>
                  </tr>
                )
                : (
                  addedFirms.map((firma, idx) => (
                    <tr
                      key={firma.temin_firma_id
                        ? `temin-${firma.temin_firma_id}`
                        : `firm-${firma.id}-${idx}`}
                      className="group hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`px-4 py-3 text-xs text-slate-700 dark:text-slate-300 ${
                            column.className ?? ""
                          }`}
                        >
                          {column.render
                            ? column.render(firma)
                            : String(firma[column.key] ?? "-")}
                        </td>
                      ))}

                      {/* ⋮ Kebap Menüsü */}
                      <td className="px-3 py-2 text-right">
                        <RowMenu
                          firma={firma}
                          onFirmaCikar={onFirmaCikar}
                          onFiyatGir={onFiyatGir}
                          onFiyatPiyasaFormu={onFiyatPiyasaFormu}
                          onBirimFiyatArastirmasi={onBirimFiyatArastirmasi}
                          onUnvanKullanToggle={onUnvanKullanToggle}
                        />
                      </td>
                    </tr>
                  ))
                )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
