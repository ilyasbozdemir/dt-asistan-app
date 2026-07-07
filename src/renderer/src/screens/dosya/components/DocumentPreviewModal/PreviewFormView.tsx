import React from "react";

interface PreviewFormViewProps {
  formFields: string[];
  mergedContext: any;
  overrideData: Record<string, any>;
  placeholders: any[];
  activePersonnelFields: string[];
  personelListesi: any[];
  PERSONNEL_FIELDS: Record<
    string,
    { adiKey: string; unvanKey: string; etiket: string }
  >;
  handleFormChange: (key: string, value: any) => void;
  handlePersonelSelect: (field: any, selectedPersonel: any) => void;
  handlePersonelClear: (field: any) => void;
}

export const PreviewFormView: React.FC<PreviewFormViewProps> = ({
  formFields,
  mergedContext,
  overrideData,
  placeholders,
  activePersonnelFields,
  personelListesi,
  PERSONNEL_FIELDS,
  handleFormChange,
  handlePersonelSelect,
  handlePersonelClear,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {formFields.map((key) => {
        const originalValue = mergedContext[key];
        const value = overrideData[key] !== undefined
          ? overrideData[key]
          : originalValue;
        const type = typeof originalValue as string;

        const schemaDef = placeholders.find((p) => p.anahtar === key) || null;
        const label = schemaDef
          ? schemaDef.etiket
          : key === "kurumIci"
          ? "Kurum İçi mi?"
          : key === "olurYazisi"
          ? "Olur Yazısı Gösterilsin mi?"
          : key === "isinAciklamasi"
          ? "İşin Açıklaması"
          : key === "gerekce"
          ? "Gerekçe"
          : key === "aciklama"
          ? "Açıklama"
          : key === "altNotlar"
          ? "Alt Notlar"
          : key;
        const effectiveType = (key === "kurumIci" || key === "olurYazisi")
          ? "boolean"
          : schemaDef?.veri_tipi === "date"
          ? "date"
          : schemaDef?.veri_tipi === "boolean"
          ? "boolean"
          : schemaDef?.veri_tipi === "number"
          ? "number"
          : type;

        if (effectiveType === "date") {
          let dateVal = value || "";
          if (typeof value === "string" && value.includes(".")) {
            const parts = value.split(".");
            if (parts.length === 3) {
              dateVal = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
          }

          return (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {label}
                </label>
                {schemaDef?.aciklama && (
                  <span className="text-xs text-slate-500">
                    {schemaDef.aciklama}
                  </span>
                )}
              </div>
              <input
                type="date"
                title={label}
                placeholder={label}
                value={dateVal}
                onChange={(e) => {
                  const d = e.target.value;
                  if (!d) {
                    handleFormChange(key, "");
                    return;
                  }
                  const parts = d.split("-");
                  if (parts.length === 3) {
                    handleFormChange(
                      key,
                      `${parts[2]}.${parts[1]}.${parts[0]}`,
                    );
                  } else {
                    handleFormChange(key, d);
                  }
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          );
        }

        if (effectiveType === "boolean") {
          const isChecked = value === true || value === "true" || value === 1 ||
            value === "1";
          const displayAciklama = schemaDef?.aciklama || (
            key === "kurumIci"
              ? "İşaretlenirse 'Kurum İçi', kaldırılırsa 'Kurum Dışı' olarak ayarlanır."
              : undefined
          );
          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {label}
                </label>
                {displayAciklama && (
                  <span className="text-xs text-slate-500">
                    {displayAciklama}
                  </span>
                )}
              </div>
              <input
                type="checkbox"
                title={label}
                checked={isChecked}
                onChange={(e) => handleFormChange(key, e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          );
        }

        if (type === "number") {
          return (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {label}
                </label>
                {schemaDef?.aciklama && (
                  <span className="text-xs text-slate-500">
                    {schemaDef.aciklama}
                  </span>
                )}
              </div>
              <input
                type="number"
                title={label}
                placeholder={label}
                value={value || 0}
                onChange={(e) => handleFormChange(key, Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          );
        }

        if (
          Array.isArray(originalValue) &&
          originalValue.every((v) => typeof v === "string")
        ) {
          return (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {label}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    (Liste - Her satır bir eleman)
                  </span>
                </label>
                {schemaDef?.aciklama && (
                  <span className="text-xs text-slate-500">
                    {schemaDef.aciklama}
                  </span>
                )}
              </div>
              <textarea
                title={label}
                placeholder={label}
                value={Array.isArray(value) ? value.join("\n") : value}
                onChange={(e) => {
                  handleFormChange(key, e.target.value.split("\n"));
                }}
                className="w-full p-2.5 min-h-[100px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-y"
              />
            </div>
          );
        }

        if (
          Array.isArray(originalValue) &&
          originalValue.length > 0 &&
          typeof originalValue[0] === "object" &&
          originalValue[0] !== null
        ) {
          const items = Array.isArray(value) ? value : [];
          const sampleItem = originalValue[0];
          const fields = Object.keys(sampleItem);

          const handleCellChange = (
            rowIdx: number,
            field: string,
            val: any,
          ) => {
            const newItems = items.map((item, idx) => {
              if (idx === rowIdx) {
                return { ...item, [field]: val };
              }
              return item;
            });
            handleFormChange(key, newItems);
          };

          const handleAddRow = () => {
            const newItem = { ...sampleItem };
            for (const f of fields) {
              newItem[f] = typeof sampleItem[f] === "number" ? 0 : "";
            }
            handleFormChange(key, [...items, newItem]);
          };

          const handleRemoveRow = (rowIdx: number) => {
            const isConfirmed = window.confirm(
              "Bu satırı silmek istediğinize emin misiniz?",
            );
            if (isConfirmed) {
              const newItems = items.filter((_, idx) => idx !== rowIdx);
              handleFormChange(key, newItems);
            }
          };

          return (
            <div
              key={key}
              className="flex flex-col gap-3 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {label}
                  </label>
                  {schemaDef?.aciklama && (
                    <span className="text-xs text-slate-500">
                      {schemaDef.aciklama}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="px-3 py-1.5 text-xs font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl transition-colors border border-blue-200 dark:border-blue-800/30 cursor-pointer"
                >
                  + Satır Ekle
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-250 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950">
                <table className="w-full text-left text-xs table-auto border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-850">
                    <tr>
                      {fields.map((f) => (
                        <th
                          key={f}
                          className="p-2.5 border-r border-slate-200 dark:border-slate-800 last:border-r-0 uppercase tracking-wider text-[9px]"
                        >
                          {f
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        </th>
                      ))}
                      <th className="p-2.5 w-16 text-center">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {items.map((item, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="hover:bg-slate-55/40 dark:hover:bg-slate-900/40"
                      >
                        {fields.map((f) => {
                          const val = item[f] !== undefined ? item[f] : "";
                          const isNum = typeof sampleItem[f] === "number";
                          return (
                            <td
                              key={f}
                              className="p-1 border-r border-slate-200 dark:border-slate-850 last:border-r-0"
                            >
                              <input
                                type={isNum ? "number" : "text"}
                                value={val}
                                onChange={(e) =>
                                  handleCellChange(
                                    rowIdx,
                                    f,
                                    isNum
                                      ? Number(e.target.value)
                                      : e.target.value,
                                  )}
                                className="w-full p-1.5 border-0 bg-transparent text-xs text-slate-800 dark:text-slate-250 focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded-lg"
                              />
                            </td>
                          );
                        })}
                        <td className="p-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(rowIdx)}
                            className="px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td
                          colSpan={fields.length + 1}
                          className="p-6 text-center text-slate-400 dark:text-slate-500 italic bg-slate-50/20"
                        >
                          Henüz hiçbir satır eklenmemiş.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        if (Array.isArray(originalValue) || type === "object") {
          return (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {label}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    ({Array.isArray(originalValue) ? "Dizi" : "Nesne"})
                  </span>
                </label>
                {schemaDef?.aciklama && (
                  <span className="text-xs text-slate-500">
                    {schemaDef.aciklama}
                  </span>
                )}
              </div>
              <textarea
                title={label}
                placeholder={label}
                value={typeof value === "object"
                  ? JSON.stringify(value, null, 2)
                  : value}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(
                      e.target.value ||
                        (Array.isArray(originalValue) ? "[]" : "{}"),
                    );
                    handleFormChange(key, parsed);
                  } catch (err) {
                    handleFormChange(key, e.target.value);
                  }
                }}
                className="w-full p-2.5 h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
              />
            </div>
          );
        }

        // Schema tip uzun_metin desteği (dialog modal'da tip === 'uzun_metin' kontrolü vardı)
        if (
          schemaDef?.tip === "uzun_metin" ||
          key === "isinAciklamasi" ||
          key === "gerekce" ||
          key === "aciklama" ||
          key === "altNotlar"
        ) {
          return (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {label}
                </label>
                {schemaDef?.aciklama && (
                  <span className="text-xs text-slate-500">
                    {schemaDef.aciklama}
                  </span>
                )}
              </div>
              <textarea
                title={label}
                placeholder={label}
                value={value || ""}
                onChange={(e) => handleFormChange(key, e.target.value)}
                className="w-full p-2.5 min-h-[80px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-y"
              />
            </div>
          );
        }

        return (
          <div key={key} className="flex flex-col gap-1.5">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {label}
              </label>
              {schemaDef?.aciklama && (
                <span className="text-xs text-slate-500">
                  {schemaDef.aciklama}
                </span>
              )}
            </div>
            <input
              type="text"
              title={label}
              placeholder={label}
              value={value || ""}
              onChange={(e) => handleFormChange(key, e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
        );
      })}
      {formFields.length === 0 && activePersonnelFields.length === 0 && (
        <div className="text-center text-sm text-slate-500 mt-10">
          Bu şablonda otomatik algılanan bir değişken bulunamadı.
        </div>
      )}

      {/* PERSONEL SEÇİM ALANI */}
      {activePersonnelFields.length > 0 && personelListesi.length > 0 && (
        <div className="mt-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Yetkili Personel Seçimi
          </p>
          {activePersonnelFields.map((key) => {
            const field = PERSONNEL_FIELDS[key];
            const currentValue = overrideData[field.adiKey] ??
              mergedContext[field.adiKey] ?? "";

            return (
              <div key={key} className="flex flex-col gap-1.5 mb-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {field.etiket}
                </label>
                <select
                  aria-label={field.etiket}
                  value={currentValue}
                  onChange={(e) => {
                    const selectedPersonel = personelListesi.find(
                      (p) => p.ad_soyad === e.target.value,
                    );
                    if (selectedPersonel) {
                      handlePersonelSelect(field, selectedPersonel);
                    } else if (e.target.value === "") {
                      handlePersonelClear(field);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer"
                >
                  <option value="">— Dosyadan gelen değer —</option>
                  {personelListesi.map((p) => (
                    <option key={p.id} value={p.ad_soyad}>
                      {p.ad_soyad}
                      {p.unvan ? ` — ${p.unvan}` : ""}
                    </option>
                  ))}
                </select>
                {currentValue && (
                  <span className="text-[10px] text-slate-400">
                    Seçili: {currentValue} — {overrideData[field.unvanKey] ??
                      mergedContext[field.unvanKey] ?? ""}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
