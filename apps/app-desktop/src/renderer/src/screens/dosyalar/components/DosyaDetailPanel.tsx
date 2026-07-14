import React from "react";
import { cn } from "../../../utils/cn";
import {
  FileText,
  Sparkles,
  MoreVertical,
  Edit,
  ExternalLink,
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  Trash2,
  Building2,
  BookOpen,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { DurumBadge } from "./Badges";
import { DetailField, DetailRow } from "./DetailHelpers";

export function DosyaDetailPanel({
  selectedDosya,
  isMenuOpen,
  setIsMenuOpen,
  navigate,
  isWindowMode,
  handleOpenInNewWindow,
  handleUpdateStatus,
  handleEkapGonder,
  handleKilidiAc,
  updateDosya,
  logActivity,
  handleDelete,
  handleHardDelete,
  getDosyaNoLabel,
  formatMoney,
  formatDate,
  setActiveDosyaId,
  handleOpenAI,
  setSelectedFileForAI,
  setShowAIModal,
}: {
  selectedDosya: any;
  isMenuOpen: boolean;
  setIsMenuOpen: (val: boolean) => void;
  navigate: any;
  isWindowMode: boolean;
  handleOpenInNewWindow: () => void;
  handleUpdateStatus: (id: number, status: string) => Promise<void>;
  handleEkapGonder: (id: number) => void;
  handleKilidiAc: (id: number) => Promise<void>;
  updateDosya: (data: any) => Promise<void>;
  logActivity: (title: string, desc: string, type: string) => Promise<void>;
  handleDelete: (id: number) => Promise<void>;
  handleHardDelete: (id: number) => Promise<void>;
  getDosyaNoLabel: (d: any) => string;
  formatMoney: (val: number) => string;
  formatDate: (val: string | null | undefined) => string;
  setActiveDosyaId: (id: number | null) => void;
  handleOpenAI: (dosya: any) => void;
  setSelectedFileForAI: (data: any) => void;
  setShowAIModal: (val: boolean) => void;
}) {
  if (!selectedDosya) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800/80">
          <FileText size={28} className="text-slate-400" />
        </div>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350">
          Dosya Seçilmedi
        </h3>
        <p className="text-[11px] text-slate-500 max-w-xs mt-1.5 mb-6">
          İşlem yapmak, detaylarını incelemek veya düzenlemek istediğiniz doğrudan
          temin dosyasını soldaki listeden seçin. Veya genel süreçler hakkında Yapay
          Zeka'ya danışın.
        </p>
        <button
          onClick={() => {
            setSelectedFileForAI({
              konu: "Genel Mevzuat Danışmanlığı",
              yaklasik_maliyet: 0,
              temin_no: "Belirtilmemiş",
            });
            setShowAIModal(true);
          }}
          className="px-6 py-3 bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-500/20 flex items-center gap-2 cursor-pointer"
        >
          <Sparkles size={16} />
          Yapay Zeka'ya Danış
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Detay Panel Başlığı */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20">
        <div className="flex flex-col gap-2 mb-2">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest break-words leading-tight">
              {selectedDosya.is_deleted === 1
                ? "SİLİNMİŞ DOSYA"
                : selectedDosya.is_ekap_sent === 1
                ? "EKAP'A GÖNDERİLDİ"
                : selectedDosya.status === "tamamlandi"
                ? "TAMAMLANMIŞ DOSYA"
                : "AKTİF DOĞRUDAN TEMİN DOSYASI"}
            </span>
            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <MoreVertical size={16} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 py-1.5 flex flex-col text-xs font-semibold shadow-xl">
                  {selectedDosya.is_deleted !== 1 &&
                    selectedDosya.is_ekap_sent !== 1 && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          navigate({
                            to: `/dosyalar/yeni?id=${selectedDosya.id}`,
                          });
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Edit size={14} className="text-slate-400" />
                        Düzenle
                      </button>
                    )}

                  {!isWindowMode && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleOpenInNewWindow();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ExternalLink size={14} className="text-slate-400" />
                      Yeni Pencerede Aç
                    </button>
                  )}

                  {selectedDosya.is_deleted !== 1 &&
                    selectedDosya.is_ekap_sent !== 1 &&
                    selectedDosya.status !== "tamamlandi" && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          if ((selectedDosya.durum_asama_id || 1) < 5) {
                            alert(
                              "Dosya süreçleri tamamlanmadan (5. aşamaya gelmeden) tamamlandı olarak işaretlenemez.",
                            );
                            return;
                          }
                          handleUpdateStatus(selectedDosya.id, "tamamlandi");
                        }}
                        disabled={(selectedDosya.durum_asama_id || 1) < 5}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        Tamamlandı İşaretle
                      </button>
                    )}

                  {selectedDosya.is_deleted !== 1 &&
                    selectedDosya.is_ekap_sent !== 1 &&
                    selectedDosya.status === "tamamlandi" && (
                      <>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            handleUpdateStatus(
                              selectedDosya.id,
                              "devam_ediyor",
                            );
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Clock size={14} className="text-blue-500" />
                          Aktife Al
                        </button>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            if ((selectedDosya.durum_asama_id || 1) < 5) {
                              alert(
                                "Dosya süreçleri tamamlanmadan (5. aşamaya gelmeden) EKAP kilitlemesi yapılamaz.",
                              );
                              return;
                            }
                            handleEkapGonder(selectedDosya.id);
                          }}
                          disabled={(selectedDosya.durum_asama_id || 1) < 5}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Lock size={14} className="text-amber-500" />
                          Kilitle (EKAP)
                        </button>
                      </>
                    )}

                  {selectedDosya.is_deleted !== 1 &&
                    selectedDosya.is_ekap_sent === 1 && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleKilidiAc(selectedDosya.id);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Unlock size={14} className="text-amber-500" />
                        Kilidi Aç
                      </button>
                    )}

                  {selectedDosya.is_deleted === 1 && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleUpdateStatus(
                          selectedDosya.id,
                          "devam_ediyor",
                        ).then(() => {
                          updateDosya({
                            id: selectedDosya.id,
                            is_deleted: 0,
                          });
                          logActivity(
                            "Dosya Geri Alındı",
                            `${
                              selectedDosya.temin_no || "NO BELİRSİZ"
                            } numaralı silinmiş dosya geri alındı.`,
                            "info",
                          );
                        });
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-blue-600 dark:text-blue-400 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Edit size={14} />
                      Silinmişi Geri Al
                    </button>
                  )}

                  {selectedDosya.is_deleted !== 1 &&
                    selectedDosya.is_ekap_sent !== 1 && (
                      <>
                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            handleDelete(selectedDosya.id);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                          Arşivle / Sil
                        </button>
                      </>
                    )}

                  {import.meta.env.DEV && (
                    <>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleHardDelete(selectedDosya.id);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                        Kalıcı Sil (Dev Mode)
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="shrink-0 mt-0.5 flex flex-wrap items-center gap-2">
            {selectedDosya.is_ekap_sent === 1 && (
              <span className="bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800 text-[9px] font-bold">
                EKAP İKN: {selectedDosya.ekap_no || "-"}
              </span>
            )}
            <DurumBadge
              durumAsamaId={selectedDosya.durum_asama_id}
              isDeleted={selectedDosya.is_deleted}
              status={selectedDosya.status}
            />
          </div>
        </div>
        <h2
          className="text-sm font-bold text-slate-850 dark:text-white leading-snug line-clamp-3"
          title={selectedDosya.konu}
        >
          {selectedDosya.konu}
          {selectedDosya.tekrar_no && selectedDosya.tekrar_no > 1 ? (
            <span className="ml-1.5 text-[10px] font-black text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">
              #{selectedDosya.tekrar_no}
            </span>
          ) : null}
        </h2>
        {selectedDosya.temin_no && (
          <span className="mt-1.5 inline-block text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm">
            {getDosyaNoLabel(selectedDosya)}
          </span>
        )}
      </div>

      {/* Detay İçeriği */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
        {/* Birim */}
        <div className="flex items-center gap-2 p-2.5 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl">
          <Building2 size={14} className="text-blue-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-[9px] text-blue-400 font-semibold uppercase tracking-wide">
              Birim / Müdürlük
            </p>
            <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300 truncate">
              {selectedDosya.birim_adi || "Birim Seçilmemiş"}
            </p>
          </div>
        </div>

        {/* Tür + Madde */}
        <div className="grid grid-cols-2 gap-2">
          <DetailField
            icon={<FileText size={11} />}
            label="Tür"
            value={
              selectedDosya.tur === "mal"
                ? "Mal Alımı"
                : selectedDosya.tur === "hizmet"
                ? "Hizmet Alımı"
                : selectedDosya.tur === "yapim_isi"
                ? "Yapım İşi"
                : "Danışmanlık"
            }
          />
          <DetailField
            icon={<BookOpen size={11} />}
            label="DT Maddesi"
            value={selectedDosya.ihale_sekli || "-"}
          />
        </div>

        {/* Maliyet */}
        <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
          <p className="text-[9px] text-emerald-500 font-semibold uppercase tracking-wide mb-0.5">
            Yaklaşık Maliyet
          </p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            ₺ {formatMoney(selectedDosya.yaklasik_maliyet || 0)}
          </p>
          {selectedDosya.kdv && (
            <p className="text-[9px] text-emerald-500/70 font-semibold mt-0.5">
              +%{selectedDosya.kdv} KDV dahil edilmemiş
            </p>
          )}
        </div>

        {/* Bütçe Bilgileri */}
        <div className="space-y-1.5">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            Bütçe & Muhasebe
          </p>
          <div className="space-y-1">
            <DetailRow
              label="Bütçe Tipi"
              value={selectedDosya.butce_tipi || "-"}
            />
            <DetailRow
              label="Bütçe Yılı"
              value={selectedDosya.butce_yili?.toString() || "-"}
            />
            {selectedDosya.butce_kodu && (
              <DetailRow
                label="Bütçe Kodu"
                value={selectedDosya.butce_kodu}
                mono
              />
            )}
            {selectedDosya.ekonomik_kod && (
              <DetailRow
                label="Ekonomik Kod"
                value={selectedDosya.ekonomik_kod}
                mono
              />
            )}
            {selectedDosya.e_butce && (
              <DetailRow
                label="Kurumsal Kod"
                value={selectedDosya.e_butce}
                mono
              />
            )}
          </div>
        </div>

        {/* İhale Bilgileri */}
        <div className="space-y-1.5">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            İhale & Sözleşme
          </p>
          <div className="space-y-1">
            <DetailRow
              label="Sözleşme Türü"
              value={selectedDosya.teklif_sozlesme_turu || "-"}
            />

            {selectedDosya.son_teklif_verme_tarihi && (
              <DetailRow
                label="Son Teklif Tarihi"
                value={new Date(
                  selectedDosya.son_teklif_verme_tarihi,
                ).toLocaleString("tr-TR")}
              />
            )}
            {selectedDosya.teslim_tarihi && (
              <DetailRow
                label="Teslim Tarihi"
                value={formatDate(selectedDosya.teslim_tarihi)}
              />
            )}
          </div>
        </div>

        {/* İşin Tanımı */}
        {selectedDosya.isin_aciklamasi && (
          <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-xl">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              İşin Tanımı / Kapsamı
            </p>
            <p className="text-[10px] text-slate-600 dark:text-slate-350 leading-relaxed line-clamp-4">
              {selectedDosya.isin_aciklamasi}
            </p>
          </div>
        )}

        {/* Notlar */}
        {selectedDosya.notlar && (
          <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl">
            <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <AlertCircle size={10} /> Notlar
            </p>
            <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed">
              {selectedDosya.notlar}
            </p>
          </div>
        )}
      </div>

      {/* Aksiyon Butonları */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        {selectedDosya.is_deleted !== 1 && (
          <button
            onClick={() => {
              setActiveDosyaId(selectedDosya.id);
              navigate({ to: "/dosya" });
            }}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
          >
            <FolderOpen size={14} />
            Dosyayı Aç
          </button>
        )}

        {/* YAPAY ZEKA ASİSTANI BUTONU */}
        <Button
          asChild
          desc={`${
            selectedDosya.temin_no || "Dosya"
          } Yapay Zeka Asistanı (Buton Tıklaması)`}
        >
          <button
            onClick={() => handleOpenAI(selectedDosya)}
            className="w-full px-4 py-2.5 bg-accent-100 hover:bg-accent-200 text-bg-100 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <Sparkles size={14} />
            Yapay Zeka Asistanı
          </button>
        </Button>
      </div>
    </>
  );
}
