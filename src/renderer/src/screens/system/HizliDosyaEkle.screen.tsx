import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Edit3,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useQueryClient } from "@tanstack/react-query";

interface DosyaRow {
  _key: string;
  id: number | null; // null => yeni kayit, number => guncelleme
  dosya_no: string;
  dt_no: string;
  dosya_adi: string;
  aciklama: string;
  ihale_turu: string;
  ihale_sekli: string;
  ihale_tarihi: string;
  ihale_asamasi: string;
  _dirty: boolean; // kullanici degistirdi mi?
}

const IHALE_TURLERI = ["Mal", "Hizmet", "Yapim Isi", "Danismanlik"];
const IHALE_SEKILLERI = [
  "22/d",
  "22/a",
  "22/b",
  "22/c",
  "Ihale (4734)",
  "Diger",
];
const IHALE_ASAMALARI = [
  "Hazirlik",
  "Piyasa Arastirmasi",
  "Teklif Asamasi",
  "Sozlesme",
  "Kabul & Odeme",
  "Tamamlandi",
  "Iptal",
];

const mapTur = (t: string) => {
  if (t === "Hizmet") return "hizmet";
  if (t === "Yapim Isi") return "yapim_isi";
  if (t === "Danismanlik") return "danismanlik";
  return "mal";
};
const mapStatus = (a: string) => {
  if (a === "Tamamlandi") return "tamamlandi";
  if (a === "Iptal") return "iptal";
  return "devam_ediyor";
};
const reverseMapTur = (t: string) => {
  if (t === "hizmet") return "Hizmet";
  if (t === "yapim_isi") return "Yapim Isi";
  if (t === "danismanlik") return "Danismanlik";
  return "Mal";
};
const reverseMapStatus = (s: string) => {
  if (s === "tamamlandi") return "Tamamlandi";
  if (s === "iptal") return "Iptal";
  return "Hazirlik";
};

const emptyRow = (): DosyaRow => ({
  _key: Math.random().toString(36).slice(2),
  id: null,
  dosya_no: "",
  dt_no: "",
  dosya_adi: "",
  aciklama: "",
  ihale_turu: "Mal",
  ihale_sekli: "22/d",
  ihale_tarihi: "",
  ihale_asamasi: "Hazirlik",
  _dirty: false,
});

export default function HizliDosyaEkleScreen(): React.JSX.Element {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<DosyaRow[]>([
    emptyRow(),
    emptyRow(),
    emptyRow(),
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<
    { inserted: number; updated: number; errors: string[] } | null
  >(null);
  const [loadLimit, setLoadLimit] = useState(50);
  const tableRef = useRef<HTMLDivElement>(null);

  const updateRow = (key: string, field: keyof DosyaRow, value: string) => {
    setRows((prev) =>
      prev.map((
        r,
      ) => (r._key === key ? { ...r, [field]: value, _dirty: true } : r))
    );
  };

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow()]);
    setTimeout(() => {
      tableRef.current?.scrollTo({
        top: tableRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  };

  const removeRow = (key: string) => {
    setRows((
      prev,
    ) => (prev.length > 1 ? prev.filter((r) => r._key !== key) : prev));
  };

  const loadExisting = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await window.electron.ipcRenderer.invoke(
        "db:query",
        `SELECT id, temin_no, ekap_no, konu, isin_aciklamasi, ihale_tipi, ihale_sekli, dosya_acilis_tarihi, status, tur
         FROM DATA_TeminDosyasi
         WHERE is_deleted = 0
         ORDER BY COALESCE(dosya_acilis_tarihi, created_at) DESC, id DESC
         LIMIT ?`,
        [loadLimit],
      );
      if (res.success) {
        const loaded: DosyaRow[] = res.data.map((d: any) => ({
          _key: Math.random().toString(36).slice(2),
          id: d.id,
          dosya_no: d.temin_no || "",
          dt_no: d.ekap_no || "",
          dosya_adi: d.konu || "",
          aciklama: d.isin_aciklamasi || "",
          ihale_turu: reverseMapTur(d.tur || "mal"),
          ihale_sekli: d.ihale_sekli || "22/d",
          ihale_tarihi: d.dosya_acilis_tarihi || "",
          ihale_asamasi: reverseMapStatus(d.status || "devam_ediyor"),
          _dirty: false,
        }));
        setRows(loaded);
        setResult(null);
      } else {
        alert("Kayitlar yuklenemedi: " + res.error);
      }
    } catch (err: unknown) {
      alert("Hata: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [loadLimit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadExisting();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadExisting]);

  const handleSave = async () => {
    const toProcess = rows.filter((r) => r.dosya_adi.trim() !== "" && r._dirty);
    const toInsert = toProcess.filter((r) => r.id === null);
    const toUpdate = toProcess.filter((r) => r.id !== null);

    if (toProcess.length === 0) {
      alert("Degistirilmis veya doldurulmus satir yok.");
      return;
    }

    setIsSaving(true);
    setResult(null);
    let insertCount = 0;
    let updateCount = 0;
    const errors: string[] = [];

    for (const row of toInsert) {
      try {
        const res = await window.electron.ipcRenderer.invoke(
          "db:run",
          `INSERT INTO DATA_TeminDosyasi
            (temin_no, ekap_no, konu, isin_aciklamasi, ihale_tipi, ihale_sekli, dosya_acilis_tarihi, status, tur, is_deleted)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
          [
            row.dosya_no || null,
            row.dt_no || null,
            row.dosya_adi.trim(),
            row.aciklama || null,
            row.ihale_turu || "Mal",
            row.ihale_sekli || null,
            row.ihale_tarihi || null,
            mapStatus(row.ihale_asamasi),
            mapTur(row.ihale_turu),
          ],
        );
        if (res.success) {
          insertCount++;
        } else {
          errors.push(`EKLE "${row.dosya_adi}" - ${res.error}`);
        }
      } catch (err: unknown) {
        errors.push(
          `EKLE "${row.dosya_adi}" - ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }

    for (const row of toUpdate) {
      try {
        const res = await window.electron.ipcRenderer.invoke(
          "db:run",
          `UPDATE DATA_TeminDosyasi SET
            temin_no = ?, ekap_no = ?, konu = ?, isin_aciklamasi = ?,
            ihale_tipi = ?, ihale_sekli = ?, dosya_acilis_tarihi = ?,
            status = ?, tur = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            row.dosya_no || null,
            row.dt_no || null,
            row.dosya_adi.trim(),
            row.aciklama || null,
            row.ihale_turu || "Mal",
            row.ihale_sekli || null,
            row.ihale_tarihi || null,
            mapStatus(row.ihale_asamasi),
            mapTur(row.ihale_turu),
            row.id,
          ],
        );
        if (res.success) {
          updateCount++;
          setRows((prev) =>
            prev.map((r) => (r._key === row._key ? { ...r, _dirty: false } : r))
          );
        } else {
          errors.push(`GUNCELLE "${row.dosya_adi}" - ${res.error}`);
        }
      } catch (err: unknown) {
        errors.push(
          `GUNCELLE "${row.dosya_adi}" - ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }

    setResult({ inserted: insertCount, updated: updateCount, errors });
    setIsSaving(false);

    if (insertCount > 0) {
      queryClient.invalidateQueries({ queryKey: ["dosyalar"] });
      // Basariyla eklenen yeni satirlari temizle
      const erroredNames = new Set(
        errors
          .filter((e) => e.startsWith("EKLE"))
          .map((e) => e.split('"')[1]),
      );
      setRows((prev) =>
        prev.filter(
          (r) =>
            r.id !== null || r.dosya_adi.trim() === "" ||
            erroredNames.has(r.dosya_adi.trim()),
        )
      );
    }
    if (updateCount > 0) {
      queryClient.invalidateQueries({ queryKey: ["dosyalar"] });
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const lines = text.trim().split("\n").filter(Boolean);
      const newRows: DosyaRow[] = lines.map((line) => {
        const c = line.split("\t");
        return {
          _key: Math.random().toString(36).slice(2),
          id: null,
          dosya_no: c[0]?.trim() || "",
          dt_no: c[1]?.trim() || "",
          dosya_adi: c[2]?.trim() || "",
          aciklama: c[3]?.trim() || "",
          ihale_turu: c[4]?.trim() || "Mal",
          ihale_sekli: c[5]?.trim() || "22/d",
          ihale_tarihi: c[6]?.trim() || "",
          ihale_asamasi: c[7]?.trim() || "Hazirlik",
          _dirty: true,
        };
      });
      if (newRows.length > 0) {
        setRows((prev) => {
          const allEmpty = prev.every((r) =>
            r.dosya_adi === "" && r.id === null
          );
          return allEmpty ? newRows : [...prev, ...newRows];
        });
      }
    } catch {
      alert("Pano okuma basarisiz.");
    }
  };

  const newCount =
    rows.filter((r) => r.dosya_adi.trim() !== "" && r.id === null && r._dirty)
      .length;
  const updateCount =
    rows.filter((r) => r.dosya_adi.trim() !== "" && r.id !== null && r._dirty)
      .length;
  const totalDirty = newCount + updateCount;

  const cell =
    "w-full h-8 px-2 text-sm bg-transparent border border-transparent focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 rounded-lg outline-none transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-700";
  const sel =
    "w-full h-8 pl-2 pr-6 text-sm bg-transparent border border-transparent focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 rounded-lg outline-none transition-colors appearance-none cursor-pointer";

  return (
    <div className="flex flex-col gap-5 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Edit3 className="w-7 h-7 text-blue-600" />
            Hizli Dosya Ekle / Guncelle
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Yeni kayit ekleyin veya mevcut dosyalari yukleyip toplu duzenleyin.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mevcut kayitlari yukle */}
          <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <select
              title="Kac kayit yuklensin"
              value={loadLimit}
              onChange={(e) => setLoadLimit(Number(e.target.value))}
              className="h-9 pl-3 pr-1 text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none border-r border-slate-200 dark:border-slate-700"
            >
              {[25, 50, 100, 200, 500].map((n) => (
                <option key={n} value={n}>Son {n}</option>
              ))}
            </select>
            <button
              type="button"
              disabled={isLoading}
              onClick={loadExisting}
              className="flex items-center gap-1.5 h-9 px-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              {isLoading ? "Yukleniyor..." : "Mevcut Dosyalari Yukle"}
            </button>
          </div>

          <Button
            variant="outline"
            className="gap-2 text-sm rounded-xl h-9 px-4"
            onClick={handlePaste}
          >
            <ClipboardList className="w-4 h-4" /> Panodan Yapistir
          </Button>
          <Button
            variant="outline"
            className="gap-2 text-sm rounded-xl h-9 px-4"
            onClick={addRow}
          >
            <Plus className="w-4 h-4" /> Satir Ekle
          </Button>
          <Button
            className="gap-2 text-sm rounded-xl h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-60"
            onClick={handleSave}
            disabled={isSaving || totalDirty === 0}
          >
            <Save className="w-4 h-4" />
            {isSaving
              ? "Kaydediliyor..."
              : totalDirty === 0
              ? "Degisiklik Yok"
              : `${newCount > 0 ? `${newCount} Ekle` : ""}${
                newCount > 0 && updateCount > 0 ? " + " : ""
              }${updateCount > 0 ? `${updateCount} Guncelle` : ""}`}
          </Button>
        </div>
      </div>

      {/* Sonuc */}
      {result && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
            result.errors.length === 0
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
              : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
          }`}
        >
          {result.errors.length === 0
            ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
          <div>
            <p className="font-semibold">
              {result.inserted > 0 && `${result.inserted} yeni dosya eklendi. `}
              {result.updated > 0 && `${result.updated} dosya guncellendi.`}
              {result.errors.length > 0 &&
                ` ${result.errors.length} hatali kayit.`}
            </p>
            {result.errors.map((e, i) => (
              <p key={i} className="text-xs mt-0.5 opacity-80">• {e}</p>
            ))}
          </div>
        </div>
      )}

      {/* Ipucu */}
      <p className="text-xs text-slate-400 dark:text-slate-500 -mb-2">
        Sarı zemin = degistirilmis satir • Mavi ID = mevcut kayit (guncelleme) •
        Beyaz = yeni kayit (ekleme) &nbsp;·&nbsp; Excel sutun sirasi:{" "}
        <strong>
          Dosya No | DT No | Dosya Adi | Aciklama | Ihale Turu | Sekli | Tarih |
          Asama
        </strong>
      </p>

      {/* Tablo */}
      <div
        ref={tableRef}
        className="flex-1 overflow-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <table className="w-full text-sm border-collapse min-w-[1050px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="w-16 px-3 py-3 text-center">ID</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">
                Dosya No
              </th>
              <th className="px-3 py-3 text-left whitespace-nowrap">D.T. No</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">
                Dosya Adi *
              </th>
              <th className="px-3 py-3 text-left whitespace-nowrap">
                Aciklama
              </th>
              <th className="px-3 py-3 text-left whitespace-nowrap">
                Ihale Turu
              </th>
              <th className="px-3 py-3 text-left whitespace-nowrap">
                Ihale Sekli
              </th>
              <th className="px-3 py-3 text-left whitespace-nowrap">
                Ihale Tarihi
              </th>
              <th className="px-3 py-3 text-left whitespace-nowrap">
                Ihale Asamasi
              </th>
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {rows.map((row) => (
              <tr
                key={row._key}
                className={`group transition-colors ${
                  row._dirty && row.dosya_adi.trim()
                    ? "bg-amber-50/60 dark:bg-amber-900/10 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    : row.id !== null
                    ? "bg-white dark:bg-slate-900 hover:bg-blue-50/20 dark:hover:bg-blue-900/10"
                    : "bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                {/* ID */}
                <td className="px-3 py-1.5 text-center">
                  {row.id !== null
                    ? (
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                        #{row.id}
                      </span>
                    )
                    : (
                      <span className="text-xs text-slate-300 dark:text-slate-700">
                        YENi
                      </span>
                    )}
                </td>

                <td className="px-2 py-1.5">
                  <input
                    type="text"
                    value={row.dosya_no}
                    onChange={(e) =>
                      updateRow(row._key, "dosya_no", e.target.value)}
                    placeholder="2025/001"
                    className={`${cell} min-w-[90px]`}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="text"
                    value={row.dt_no}
                    onChange={(e) =>
                      updateRow(row._key, "dt_no", e.target.value)}
                    placeholder="DT-001"
                    className={`${cell} min-w-[80px]`}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="text"
                    value={row.dosya_adi}
                    onChange={(e) =>
                      updateRow(row._key, "dosya_adi", e.target.value)}
                    placeholder="Kirtasiye Alimi..."
                    className={`${cell} min-w-[200px]`}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="text"
                    value={row.aciklama}
                    onChange={(e) =>
                      updateRow(row._key, "aciklama", e.target.value)}
                    placeholder="Opsiyonel..."
                    className={`${cell} min-w-[130px]`}
                  />
                </td>

                <td className="px-2 py-1.5">
                  <div className="relative min-w-[100px]">
                    <select
                      title="Ihale turu"
                      value={row.ihale_turu}
                      onChange={(e) =>
                        updateRow(row._key, "ihale_turu", e.target.value)}
                      className={sel}
                    >
                      {IHALE_TURLERI.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
                </td>
                <td className="px-2 py-1.5">
                  <div className="relative min-w-[85px]">
                    <select
                      title="Ihale sekli"
                      value={row.ihale_sekli}
                      onChange={(e) =>
                        updateRow(row._key, "ihale_sekli", e.target.value)}
                      className={sel}
                    >
                      {IHALE_SEKILLERI.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="date"
                    value={row.ihale_tarihi}
                    onChange={(e) =>
                      updateRow(row._key, "ihale_tarihi", e.target.value)}
                    className={`${cell} min-w-[130px]`}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <div className="relative min-w-[120px]">
                    <select
                      title="Ihale asamasi"
                      value={row.ihale_asamasi}
                      onChange={(e) =>
                        updateRow(row._key, "ihale_asamasi", e.target.value)}
                      className={sel}
                    >
                      {IHALE_ASAMALARI.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
                </td>
                <td className="px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => removeRow(row._key)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addRow}
        className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-sm text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        <Plus className="w-4 h-4" /> Yeni Satir Ekle
      </button>
    </div>
  );
}
