import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Plus, Search, Trash2, Users } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";

interface KomisyonOlusturModalProps {
  isOpen: boolean;
  onClose: () => void;
  komisyonId?: number | null;
}

// Hazır komisyon şablonları (initial roller)
const KOMISYON_SABLONLARI = {
  fiyat_arastirma: {
    label: "Fiyat Araştırma ve Yaklaşık Maliyet Tespit Komisyonu",
    roller: [
      "Harcama Yetkilisi",
      "Satın Alma Harcama Yetkilisi",
      "Gerçekleştirme Görevlisi",
      "Muhasebe Yetkilisi",
      "Fiyat Araştırma Görevlisi",
      "Fiyat Araştırma Görevlisi",
      "Fiyat Araştırma Görevlisi",
      "Fiyat Araştırma Görevlisi",
      "Fiyat Araştırma Görevlisi",
      "Fiyat Araştırma Görevlisi",
    ],
  },
  muayene_kabul: {
    label: "Muayene Kabul ve Tespit Komisyonu",
    roller: [
      "Komisyon Başkanı",
      "Üye",
      "Üye",
      "Üye",
      "Üye",
      "Üye",
      "Üye",
      "Üye",
      "Üye",
    ],
  },
} as const;

type KomisyonTipi = keyof typeof KOMISYON_SABLONLARI | "";

interface UyeRow {
  id: number;
  unvan: string; // Görev unvanı (sabit, readonly)
  gorevId: number | ""; // DB'deki gorev_id (unvana göre eşleştirilen)
  personelId: number | null;
  personelAdi: string; // UI'da görüntülemek için
  personelArama: string;
  asilMi: number;
}

export function KomisyonOlusturModal({
  isOpen,
  onClose,
  komisyonId,
}: KomisyonOlusturModalProps): React.JSX.Element | null {
  const queryClient = useQueryClient();
  const [ad, setAd] = useState("");
  const [seciliTip, setSeciliTip] = useState<KomisyonTipi>("");
  const [uyeler, setUyeler] = useState<UyeRow[]>([]);
  const [seciliSablonlar, setSeciliSablonlar] = useState<number[]>([]);
  const [aramaAcik, setAramaAcik] = useState<number | null>(null); // hangi satırın araması açık

  // DB'deki görevler (unvan eşleştirmesi için)
  const { data: gorevler = [] } = useQuery({
    queryKey: ["komisyon_gorevleri"],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT * FROM TANIM_KomisyonGorevi WHERE aktif_mi = 1 ORDER BY id ASC",
      );
      if (!res.success) throw new Error(res.error);
      return res.data as { id: number; ad: string }[];
    },
    enabled: isOpen,
  });

  // Personel listesi (arama için)
  const { data: tumPersonel = [] } = useQuery({
    queryKey: ["personel_listesi_modal"],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT id, ad, soyad, unvan FROM TANIM_Personel WHERE aktif_mi = 1 ORDER BY ad ASC",
      );
      if (!res.success) throw new Error(res.error);
      return res.data as {
        id: number;
        ad: string;
        soyad: string;
        unvan: string;
      }[];
    },
    enabled: isOpen,
  });

  // Şablon seçenekleri
  const { data: tumSablonlar = [] } = useQuery({
    queryKey: ["komisyon_sablon_secenekleri"],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT * FROM TANIM_Sablon WHERE aktif_mi = 1 ORDER BY ad ASC",
      );
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: isOpen,
  });

  // Edit modunda mevcut komisyonu çek
  useQuery({
    queryKey: ["komisyon_detay", komisyonId],
    queryFn: async () => {
      if (!komisyonId) return null;

      const res = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT * FROM TANIM_Komisyon WHERE id = ?",
        [komisyonId],
      );
      if (!res.success || !res.data[0]) {
        throw new Error(res.error || "Komisyon bulunamadı");
      }
      setAd(res.data[0].ad);

      const membersRes = await window.electron.ipcRenderer.invoke(
        "db:query",
        `SELECT ku.*, kg.ad as gorev_ad,
          COALESCE(p.ad || ' ' || p.soyad, '') as personel_adi,
          ku.personel_id
         FROM TANIM_KomisyonUye ku
         LEFT JOIN TANIM_KomisyonGorevi kg ON kg.id = ku.gorev_id
         LEFT JOIN TANIM_Personel p ON p.id = ku.personel_id
         WHERE ku.komisyon_id = ?`,
        [komisyonId],
      );
      if (membersRes.success && membersRes.data) {
        setUyeler(
          membersRes.data.map((m: any) => ({
            id: Date.now() + Math.random(),
            unvan: m.gorev_ad || "",
            gorevId: m.gorev_id,
            personelId: m.personel_id || null,
            personelAdi: m.personel_adi || "",
            personelArama: "",
            asilMi: m.asil_mi,
          })),
        );
      }

      const sablonRes = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT * FROM TANIM_Komisyon_Sablon WHERE komisyon_id = ?",
        [komisyonId],
      );
      if (sablonRes.success && sablonRes.data) {
        setSeciliSablonlar(sablonRes.data.map((s: any) => s.sablon_id));
      }

      return res.data[0];
    },
    enabled: !!komisyonId && isOpen,
  });

  // Komisyon tipi seçilince hazır kadroyu yükle
  const handleTipSec = (tip: KomisyonTipi) => {
    setSeciliTip(tip);
    if (!tip) {
      setUyeler([]);
      return;
    }
    const sablon = KOMISYON_SABLONLARI[tip];
    setAd(sablon.label);
    setUyeler(
      sablon.roller.map((unvan, i) => {
        // DB'deki görevle eşleştirmeyi dene (ad benzerliği)
        const eslesen = gorevler.find(
          (g) =>
            g.ad.toLowerCase().includes(unvan.toLowerCase()) ||
            unvan.toLowerCase().includes(g.ad.toLowerCase()),
        );
        return {
          id: Date.now() + i,
          unvan,
          gorevId: eslesen?.id ?? "",
          personelId: null,
          personelAdi: "",
          personelArama: "",
          asilMi: 1,
        };
      }),
    );
  };

  // El ile satır ekle
  const handleAddUye = () => {
    setUyeler([
      ...uyeler,
      {
        id: Date.now(),
        unvan: "",
        gorevId: "",
        personelId: null,
        personelAdi: "",
        personelArama: "",
        asilMi: 1,
      },
    ]);
  };

  const handleRemoveUye = (id: number) => {
    setUyeler(uyeler.filter((u) => u.id !== id));
  };

  const handleUyeChange = (id: number, field: string, value: any) => {
    setUyeler(uyeler.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  };

  // Personel seçilince satıra ata
  const handlePersonelSec = (
    uyeId: number,
    personel: { id: number; ad: string; soyad: string; unvan: string },
  ) => {
    setUyeler(
      uyeler.map((u) =>
        u.id === uyeId
          ? {
            ...u,
            personelId: personel.id,
            personelAdi: `${personel.ad} ${personel.soyad}`,
            personelArama: "",
          }
          : u
      ),
    );
    setAramaAcik(null);
  };

  // Unvan değişince DB göreviyle eşleştir
  const handleUnvanChange = (id: number, unvan: string) => {
    const eslesen = gorevler.find(
      (g) =>
        g.ad.toLowerCase().includes(unvan.toLowerCase()) ||
        unvan.toLowerCase().includes(g.ad.toLowerCase()),
    );
    setUyeler(
      uyeler.map((u) =>
        u.id === id ? { ...u, unvan, gorevId: eslesen?.id ?? "" } : u
      ),
    );
  };

  const handleSablonToggle = (sablonId: number) => {
    setSeciliSablonlar((prev) =>
      prev.includes(sablonId)
        ? prev.filter((id) => id !== sablonId)
        : [...prev, sablonId]
    );
  };

  const handleClose = () => {
    onClose();
    setAd("");
    setSeciliTip("");
    setUyeler([]);
    setSeciliSablonlar([]);
    setAramaAcik(null);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!ad) throw new Error("Lütfen komisyon adı giriniz.");

      // gorevId eksik satırlar için DB'de yoksa gorev kaydı oluşturabiliriz veya hata ver
      const eksikGorevler = uyeler.filter((u) => !u.gorevId && u.unvan);
      if (eksikGorevler.length > 0) {
        // Eksik görevler için DB'ye ekle
        for (const u of eksikGorevler) {
          const gRes = await window.electron.ipcRenderer.invoke(
            "db:query",
            "INSERT INTO TANIM_KomisyonGorevi (ad, aktif_mi) VALUES (?, 1)",
            [u.unvan],
          );
          if (gRes.success) {
            u.gorevId = gRes.lastInsertRowid;
          }
        }
      }

      if (komisyonId) {
        const updateRes = await window.electron.ipcRenderer.invoke(
          "db:transaction",
          [
            {
              sql: "UPDATE TANIM_Komisyon SET ad = ? WHERE id = ?",
              params: [ad, komisyonId],
            },
            {
              sql: "DELETE FROM TANIM_KomisyonUye WHERE komisyon_id = ?",
              params: [komisyonId],
            },
            {
              sql: "DELETE FROM TANIM_Komisyon_Sablon WHERE komisyon_id = ?",
              params: [komisyonId],
            },
          ],
        );
        if (!updateRes.success) throw new Error(updateRes.error);

        const uyeQueries = uyeler.map((u) => ({
          sql:
            "INSERT INTO TANIM_KomisyonUye (komisyon_id, gorev_id, personel_id, asil_mi) VALUES (?, ?, ?, ?)",
          params: [
            komisyonId,
            u.gorevId || null,
            u.personelId || null,
            u.asilMi,
          ],
        }));
        if (uyeQueries.length > 0) {
          const uyeRes = await window.electron.ipcRenderer.invoke(
            "db:transaction",
            uyeQueries,
          );
          if (!uyeRes.success) throw new Error(uyeRes.error);
        }

        const sablonQueries = seciliSablonlar.map((sId) => ({
          sql:
            "INSERT INTO TANIM_Komisyon_Sablon (komisyon_id, sablon_id) VALUES (?, ?)",
          params: [komisyonId, sId],
        }));
        if (sablonQueries.length > 0) {
          const sR = await window.electron.ipcRenderer.invoke(
            "db:transaction",
            sablonQueries,
          );
          if (!sR.success) throw new Error(sR.error);
        }

        return komisyonId;
      } else {
        const res = await window.electron.ipcRenderer.invoke("db:transaction", [
          { sql: "INSERT INTO TANIM_Komisyon (ad) VALUES (?)", params: [ad] },
        ]);
        if (!res.success) throw new Error(res.error);
        const newId = res.lastInsertRowid;

        const uyeQueries = uyeler.map((u) => ({
          sql:
            "INSERT INTO TANIM_KomisyonUye (komisyon_id, gorev_id, personel_id, asil_mi) VALUES (?, ?, ?, ?)",
          params: [newId, u.gorevId || null, u.personelId || null, u.asilMi],
        }));
        if (uyeQueries.length > 0) {
          const uyeRes = await window.electron.ipcRenderer.invoke(
            "db:transaction",
            uyeQueries,
          );
          if (!uyeRes.success) throw new Error(uyeRes.error);
        }

        const sablonQueries = seciliSablonlar.map((sId) => ({
          sql:
            "INSERT INTO TANIM_Komisyon_Sablon (komisyon_id, sablon_id) VALUES (?, ?)",
          params: [newId, sId],
        }));
        if (sablonQueries.length > 0) {
          const sR = await window.electron.ipcRenderer.invoke(
            "db:transaction",
            sablonQueries,
          );
          if (!sR.success) throw new Error(sR.error);
        }

        return newId;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["komisyonlar"] });
      handleClose();
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={komisyonId ? "Komisyonu Düzenle" : "Yeni Komisyon Oluştur"}
      description="Komisyonun kadro ve kontenjanlarını belirleyin."
      className="max-w-5xl"
    >
      <div className="space-y-6" onClick={() => setAramaAcik(null)}>
        {saveMutation.isError && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {saveMutation.error?.message}
          </div>
        )}

        {/* Komisyon Tipi Seçimi (sadece yeni komisyon oluştururken) */}
        {!komisyonId && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Komisyon Tipi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.entries(KOMISYON_SABLONLARI) as [
                KomisyonTipi,
                typeof KOMISYON_SABLONLARI[keyof typeof KOMISYON_SABLONLARI],
              ][]).map(([tip, sablon]) => (
                <button
                  key={tip}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTipSec(tip);
                  }}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    seciliTip === tip
                      ? "border-blue-500 bg-blue-50/60 dark:bg-blue-900/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700"
                  }`}
                >
                  <Users
                    className={`w-5 h-5 mt-0.5 shrink-0 ${
                      seciliTip === tip ? "text-blue-500" : "text-slate-400"
                    }`}
                  />
                  <div>
                    <div
                      className={`text-sm font-bold ${
                        seciliTip === tip
                          ? "text-blue-700 dark:text-blue-400"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {sablon.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {sablon.roller.length} pozisyon
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Komisyon Adı */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Komisyon Adı
          </label>
          <Input
            type="text"
            placeholder="Örn: Bilişim Sistemleri Fiyat Araştırma Komisyonu"
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Komisyon Rolleri Tablosu */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Komisyon Kadrosu
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personel ataması isteğe bağlı — şimdi veya sonra yapılabilir.
              </p>
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleAddUye();
              }}
              variant="outline"
              className="gap-2 text-sm border-dashed"
            >
              <Plus className="w-4 h-4" /> Satır Ekle
            </Button>
          </div>

          {uyeler.length === 0
            ? (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 border-dashed">
                <Users className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  Yukarıdan bir komisyon tipi seçin ya da "Satır Ekle" ile
                  manuel kadro oluşturun.
                </p>
              </div>
            )
            : (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-center w-10">#</th>
                      <th className="px-4 py-3 text-left">
                        Komisyondaki Görevi
                      </th>
                      <th className="px-4 py-3 text-left">Personel</th>
                      <th className="px-4 py-3 text-center w-24">Durum</th>
                      <th className="px-4 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {uyeler.map((uye, index) => {
                      // Personel aramasına göre filtreleme
                      const filtreliPersonel =
                        uye.personelArama.trim().length > 0
                          ? tumPersonel.filter((p) =>
                            `${p.ad} ${p.soyad} ${p.unvan}`.toLowerCase()
                              .includes(uye.personelArama.toLowerCase())
                          ).slice(0, 8)
                          : [];

                      return (
                        <tr
                          key={uye.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10"
                        >
                          {/* Sıra */}
                          <td className="px-4 py-2.5 text-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold">
                              {index + 1}
                            </span>
                          </td>

                          {/* Görev Unvanı */}
                          <td className="px-4 py-2.5">
                            <input
                              type="text"
                              value={uye.unvan}
                              onChange={(e) =>
                                handleUnvanChange(uye.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="Görev unvanı..."
                              className="w-full bg-transparent border-0 border-b border-dashed border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm py-0.5 focus:outline-none focus:border-blue-400 placeholder:text-slate-400"
                            />
                          </td>

                          {/* Personel Seçimi - Arama */}
                          <td className="px-4 py-2.5">
                            <div
                              className="relative"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {uye.personelId
                                ? (
                                  <div className="flex items-center gap-2">
                                    <span className="flex-1 text-sm text-slate-800 dark:text-slate-200 font-medium">
                                      {uye.personelAdi}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUyeChange(
                                          uye.id,
                                          "personelId",
                                          null,
                                        )}
                                      className="text-slate-400 hover:text-red-500 transition-colors text-xs"
                                      title="Personeli kaldır"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )
                                : (
                                  <>
                                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
                                      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <input
                                        type="text"
                                        value={uye.personelArama}
                                        onChange={(e) => {
                                          handleUyeChange(
                                            uye.id,
                                            "personelArama",
                                            e.target.value,
                                          );
                                          setAramaAcik(uye.id);
                                        }}
                                        onFocus={() => setAramaAcik(uye.id)}
                                        placeholder="Personel ara..."
                                        className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none placeholder:text-slate-400 min-w-0"
                                      />
                                    </div>
                                    {aramaAcik === uye.id &&
                                      filtreliPersonel.length > 0 && (
                                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                                        {filtreliPersonel.map((p) => (
                                          <button
                                            key={p.id}
                                            type="button"
                                            onClick={() =>
                                              handlePersonelSec(uye.id, p)}
                                            className="w-full flex flex-col items-start px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-left transition-colors"
                                          >
                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                              {p.ad} {p.soyad}
                                            </span>
                                            {p.unvan && (
                                              <span className="text-xs text-slate-500">
                                                {p.unvan}
                                              </span>
                                            )}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                    {aramaAcik === uye.id &&
                                      uye.personelArama.trim().length > 0 &&
                                      filtreliPersonel.length === 0 && (
                                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 px-3 py-2 text-sm text-slate-400">
                                        Personel bulunamadı.
                                      </div>
                                    )}
                                  </>
                                )}
                            </div>
                          </td>

                          {/* Asil/Yedek */}
                          <td className="px-4 py-2.5 text-center">
                            <select
                              value={uye.asilMi}
                              onChange={(e) =>
                                handleUyeChange(
                                  uye.id,
                                  "asilMi",
                                  Number(e.target.value),
                                )}
                              className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white"
                            >
                              <option value={1}>Asil</option>
                              <option value={0}>Yedek</option>
                            </select>
                          </td>

                          {/* Sil */}
                          <td className="px-4 py-2.5 text-center">
                            <button
                              onClick={() => handleRemoveUye(uye.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
        </div>

        {/* Şablonlar */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Belge ve Şablonlar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bu komisyonun üretebileceği belgeleri seçin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {tumSablonlar.map((sablon: any) => (
              <label
                key={sablon.id}
                className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                  seciliSablonlar.includes(sablon.id)
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-500/50"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    checked={seciliSablonlar.includes(sablon.id)}
                    onChange={() => handleSablonToggle(sablon.id)}
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {sablon.ad}
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-1">
                    {sablon.aciklama || "Şablon"}
                  </div>
                </div>
              </label>
            ))}
            {tumSablonlar.length === 0 && (
              <div className="col-span-full text-sm text-slate-500 text-center py-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                Sistemde tanımlı şablon bulunamadı.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={saveMutation.isPending}
          >
            İptal
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending
              ? "Kaydediliyor..."
              : komisyonId
              ? "Güncelle"
              : "Kaydet"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
