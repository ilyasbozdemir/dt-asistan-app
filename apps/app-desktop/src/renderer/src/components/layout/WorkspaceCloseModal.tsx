import React, { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import {
  AlertTriangle,
  CheckCircle2,
  CloudUpload,
  FileText,
  Loader2,
  Mail,
  Save,
} from "lucide-react";
import { cn } from "../../utils/cn";

interface WorkspaceCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  onConfirm: (
    type: "none" | "backup" | "email" | "server" | "gdrive",
  ) => Promise<void>;
}

export function WorkspaceCloseModal({
  isOpen,
  onClose,
  fileName,
  onConfirm,
}: WorkspaceCloseModalProps): React.JSX.Element {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const isMailConfigured = !!settings.smtp_host;
  const isGDriveConfigured = !!settings.gdriveAccessToken;
  const isServerConfigured = !!settings.sync_server_url;

  const defaultOption = isGDriveConfigured
    ? "gdrive"
    : isServerConfigured
    ? "server"
    : isMailConfigured
    ? "email"
    : "backup";

  const [selectedOption, setSelectedOption] = useState<
    "none" | "backup" | "email" | "server" | "gdrive"
  >(defaultOption);
  const [rememberPreference, setRememberPreference] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && window.electron?.ipcRenderer) {
      window.electron.ipcRenderer
        .invoke("db:get-settings")
        .then((s) => {
          if (s) {
            setSettings(s);
            if (s.closeActionPreference) {
              setSelectedOption(s.closeActionPreference as any);
            } else if (s.gdriveAccessToken) {
              setSelectedOption("gdrive");
            } else if (s.sync_server_url) {
              setSelectedOption("server");
            } else if (s.smtp_host) {
              setSelectedOption("email");
            } else {
              setSelectedOption("backup");
            }
            if (s.closeActionRemember === "true") {
              setRememberPreference(true);
            }
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      if (window.electron?.ipcRenderer) {
        await window.electron.ipcRenderer.invoke("db:save-settings", {
          closeActionPreference: selectedOption,
          closeActionRemember: rememberPreference ? "true" : "false",
        });
      }
      await onConfirm(selectedOption);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "İşlem gerçekleştirilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const hasAnyCloudConfigured = isGDriveConfigured || isServerConfigured;

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      title="Çalışma Dosyasını Kapat"
      description={`${fileName} dosyasını kapatmak üzeresiniz.`}
    >
      <div className="flex flex-col gap-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Cloud active notice */}
        {isGDriveConfigured
          ? (
            <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-300 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Google Drive Bulut Koruması Devrede</span>
              </div>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                Son 7 Sürüm Tutulur
              </span>
            </div>
          )
          : !hasAnyCloudConfigured
          ? (
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-300 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Veri Güvenliği Tavsiyesi</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                Bulut veya sunucu entegrasyonunuz henüz yoksa veri kaybı
                yaşamamak için{" "}
                <strong>"Bilgisayara Yerel Yedek Kaydet ve Kapat"</strong>{" "}
                seçeneğini seçebilir veya{" "}
                <strong>Google Drive / API Sunucu</strong>{" "}
                entegrasyonlarından birini aktifleştirebilirsiniz. 😊
              </p>
            </div>
          )
          : null}

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Kapatmadan önce veri kaybı veya dosya bozulması riskine karşı veri
          dosyanızın güncel bir yedek kopyasını almak ister misiniz?
        </p>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          {/* Option: Google Drive Cloud Backup (Only if configured) */}
          {isGDriveConfigured && (
            <button
              disabled={loading}
              onClick={() => setSelectedOption("gdrive")}
              className={cn(
                "flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ring-2 ring-emerald-500/20",
                selectedOption === "gdrive"
                  ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-900/20",
              )}
            >
              <div
                className={cn(
                  "p-2.5 rounded-xl shrink-0",
                  selectedOption === "gdrive"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
                )}
              >
                <CloudUpload className="w-5 h-5 text-emerald-100" />
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className={cn(
                    "text-xs font-bold flex items-center gap-1.5",
                    selectedOption === "gdrive"
                      ? "text-emerald-900 dark:text-emerald-300"
                      : "text-slate-800 dark:text-slate-200",
                  )}
                >
                  <span>Google Drive Bulut Yedeği Al ve Kapat</span>
                  <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold px-1.5 py-0.5 rounded">
                    ÖNERİLEN
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Çalışma dosyanızın (.dtal) son halini{" "}
                  <strong>TEMIN_360_YEDEKLER</strong>{" "}
                  klasörünüze yükler ve son 7 sürümü korur.
                </p>
              </div>
            </button>
          )}

          {/* Option: Server Backup (Only if configured) */}
          {isServerConfigured && (
            <button
              disabled={loading}
              onClick={() => setSelectedOption("server")}
              className={cn(
                "flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer",
                selectedOption === "server"
                  ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/10"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-900/20",
              )}
            >
              <div
                className={cn(
                  "p-2.5 rounded-xl shrink-0",
                  selectedOption === "server"
                    ? "bg-indigo-500 text-white shadow-md"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
                )}
              >
                <CloudUpload className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className={cn(
                    "text-xs font-bold",
                    selectedOption === "server"
                      ? "text-indigo-900 dark:text-indigo-300"
                      : "text-slate-800 dark:text-slate-200",
                  )}
                >
                  Web Sunucusuna Yedekle ve Kapat
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Çalışma dosyanızı (.dtal) güvenli web sunucusuna yükler ve
                  sürüm olarak saklar.
                </p>
              </div>
            </button>
          )}

          {/* Option: Email Backup (Only if configured) */}
          {isMailConfigured && (
            <button
              disabled={loading}
              onClick={() => setSelectedOption("email")}
              className={cn(
                "flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer",
                selectedOption === "email"
                  ? "border-blue-500 bg-blue-50/40 dark:bg-blue-950/10"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-900/20",
              )}
            >
              <div
                className={cn(
                  "p-2.5 rounded-xl shrink-0",
                  selectedOption === "email"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
                )}
              >
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className={cn(
                    "text-xs font-bold",
                    selectedOption === "email"
                      ? "text-blue-900 dark:text-blue-300"
                      : "text-slate-800 dark:text-slate-200",
                  )}
                >
                  E-Posta ile Yedekle ve Kapat
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Dosyayı SMTP sunucunuz üzerinden kayıtlı yedek e-posta
                  adresine ek olarak gönderir.
                </p>
              </div>
            </button>
          )}

          {/* Option: Local Backup (Always available) */}
          <button
            disabled={loading}
            onClick={() => setSelectedOption("backup")}
            className={cn(
              "flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer",
              selectedOption === "backup"
                ? "border-blue-500 bg-blue-50/40 dark:bg-blue-950/10"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-900/20",
            )}
          >
            <div
              className={cn(
                "p-2.5 rounded-xl shrink-0",
                selectedOption === "backup"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
              )}
            >
              <Save className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4
                className={cn(
                  "text-xs font-bold",
                  selectedOption === "backup"
                    ? "text-blue-900 dark:text-blue-300"
                    : "text-slate-800 dark:text-slate-200",
                )}
              >
                Bilgisayara Yerel Yedek Kaydet ve Kapat
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Çalışma dosyanızın (.dtal) bir kopyasını bilgisayarınızda
                seçeceğiniz bir klasöre kaydeder.
              </p>
            </div>
          </button>

          {/* Option: Direct Close (Always available) */}
          <button
            disabled={loading}
            onClick={() => setSelectedOption("none")}
            className={cn(
              "flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer",
              selectedOption === "none"
                ? "border-amber-500 bg-amber-50/40 dark:bg-amber-955/10"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-900/20",
            )}
          >
            <div
              className={cn(
                "p-2.5 rounded-xl shrink-0",
                selectedOption === "none"
                  ? "bg-amber-500 text-white shadow-md"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
              )}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4
                className={cn(
                  "text-xs font-bold",
                  selectedOption === "none"
                    ? "text-amber-900 dark:text-amber-300"
                    : "text-slate-800 dark:text-slate-200",
                )}
              >
                Yedeklemeden Doğrudan Kapat
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Dosyada yaptığınız değişiklikler kaydedilir ancak ek bir
                bulut/yerel yedek kopyası oluşturulmaz.
              </p>
            </div>
          </button>
        </div>

        {/* Remember Preference Checkbox */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-3 mt-1">
          <input
            id="remember-close-pref"
            type="checkbox"
            checked={rememberPreference}
            onChange={(e) => setRememberPreference(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label
            htmlFor="remember-close-pref"
            className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none leading-normal"
          >
            <span className="font-bold block text-slate-900 dark:text-slate-100">
              Bu tercihimi hatırla ve dosyayı her kapattığımda otomatik uygula
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
              İşaretlenirse sonraki kapatmalarda bu pencere tekrar sorulmaz,
              doğrudan seçtiğiniz işlem yapılır. (Ayarlar &gt; Senkronizasyon
              alanından dilediğiniz zaman değiştirebilirsiniz).
            </span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer disabled:opacity-50"
          >
            Vazgeç
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className={cn(
              "px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 min-w-[110px] justify-center",
              selectedOption === "gdrive"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : selectedOption === "none"
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-blue-600 hover:bg-blue-700",
            )}
          >
            {loading
              ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>İşleniyor...</span>
                </>
              )
              : <span>Onayla ve Kapat</span>}
          </button>
        </div>
      </div>
    </Modal>
  );
}
