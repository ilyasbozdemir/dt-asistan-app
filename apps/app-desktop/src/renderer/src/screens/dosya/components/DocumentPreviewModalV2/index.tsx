import React, { useEffect, useRef, useState } from 'react';
import { renderToString } from 'react-dom/server';
import {
  ChevronUp,
  Download,
  Eye,
  FileText,
  Printer,
  RefreshCw,
  X,
} from 'lucide-react';
import { useWorkspaceStore } from '../../../../store/workspaceStore';
import {
  IhtiyacListesiType,
  TEMPLATE_REGISTRY,
  TemplateComponentType,
  TemplateResolver,
} from '@dt-asistan/document-templates';
import * as Templates from '@dt-asistan/document-templates';
import { IhtiyacListesiMapping } from '../../../../constants/mappings/ihtiyac-listesi.mapping';
import { cn } from '../../../../utils/cn';

interface DocumentPreviewModalV2Props {
  isOpen: boolean;
  documentId: string | null;
  onClose: () => void;
}

interface Personel {
  id: number;
  ad_soyad: string;
  unvan?: string;
  telefon?: string;
  eposta?: string;
}

const V2_TEMPLATES_MAP: Record<string, TemplateComponentType> = {
  IhtiyacListesi: Templates.IhtiyacListesi as TemplateComponentType,
};

class TemplateErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Template rendering error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function DocumentPreviewModalV2({
  isOpen,
  documentId,
  onClose,
}: DocumentPreviewModalV2Props): React.JSX.Element | null {
  const { activeDosyaId } = useWorkspaceStore();
  const [formData, setFormData] = useState<Partial<IhtiyacListesiType>>({});
  const [personelListesi, setPersonelListesi] = useState<Personel[]>([]);
  const [previewScale, setPreviewScale] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Find template config in registry
  const activeTemplateConf = TEMPLATE_REGISTRY.find((t) => t.id === documentId);

  const ActiveComponent = activeTemplateConf ? V2_TEMPLATES_MAP[activeTemplateConf.name] : null;

  // 2. Fetch data from DB & personnel list on open
  useEffect(() => {
    if (!isOpen || !activeDosyaId) return;

    const loadInitialData = async (): Promise<void> => {
      try {
        // Fetch personnel list for signature dropdowns
        const personelRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          'SELECT id, ad_soyad, unvan, telefon, eposta FROM TANIM_Personel WHERE aktif_mi = 1 ORDER BY ad_soyad ASC'
        );
        if (personelRes.success) {
          setPersonelListesi(personelRes.data);
        }

        // Setup TemplateResolver
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryExecutor = async (sql: string, params: any[]): Promise<any[]> => {
          const res = await window.electron.ipcRenderer.invoke('db:query', sql, params);
          if (res && res.success) {
            return res.data;
          }
          return [];
        };

        const resolver = new TemplateResolver(queryExecutor);
        
        // Resolve using the pre-defined mapping
        const resolved = await resolver.resolve(IhtiyacListesiMapping, activeDosyaId);

        // Fetch or load saved snapshot values if exists
        const snapshotRes = await window.electron.ipcRenderer.invoke(
          'db:query',
          "SELECT veri_json FROM DATA_DosyaSablonVeri WHERE temin_dosya_id = ? AND sablon_id = (SELECT id FROM TANIM_Sablon WHERE dosya_adi = 'ihtiyac-listesi.html' LIMIT 1)",
          [activeDosyaId]
        );

        let finalData = { ...resolved };
        if (snapshotRes.success && snapshotRes.data.length > 0) {
          try {
            const savedData = JSON.parse(snapshotRes.data[0].veri_json);
            finalData = { ...finalData, ...savedData };
          } catch (e) {
            console.error('Failed to parse saved snapshot JSON', e);
          }
        }

        setFormData(finalData);
      } catch (err) {
        console.error('Error loading V2 template data:', err);
      }
    };

    loadInitialData();
  }, [isOpen, activeDosyaId, documentId]);

  // 3. Document scaling logic based on preview container size
  useEffect(() => {
    if (!previewContainerRef.current || !isOpen) return;

    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      const A4_WIDTH = 800; // Base layout width
      const PADDING = 32;
      const availableWidth = width - PADDING;

      if (availableWidth < A4_WIDTH) {
        setPreviewScale(availableWidth / A4_WIDTH);
      } else {
        setPreviewScale(1);
      }
    });

    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, [isOpen, documentId]);

  // 4. Dropdown closing logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDownloadOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  // 5. Generate compiled HTML string containing current CSS stylesheets
  const getCompiledHtml = (): string => {
    if (!ActiveComponent) return '';
    const bodyHtml = renderToString(<ActiveComponent data={formData} />);
    const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
      .map((el) => el.outerHTML)
      .join('\n');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${activeTemplateConf?.name || 'Belge'}</title>
          ${styles}
          <style>
            body {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .document-container {
              box-shadow: none !important;
              margin: 0 !important;
            }
          </style>
        </head>
        <body>
          ${bodyHtml}
        </body>
      </html>
    `;
  };

  // 6. Action handlers
  const handlePrint = async (): Promise<void> => {
    setIsPrinting(true);
    try {
      const html = getCompiledHtml();
      await window.electron.ipcRenderer.invoke('print-html', html, {
        silent: false,
      });
    } catch (error) {
      console.error('Yazdırma hatası:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePdf = async (): Promise<void> => {
    setIsPrinting(true);
    try {
      const html = getCompiledHtml();
      const titleForFile = activeTemplateConf?.name || 'Belge';
      await window.electron.ipcRenderer.invoke(
        'export-pdf',
        html,
        null,
        titleForFile
      );
    } catch (error) {
      console.error('PDF kaydetme hatası:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleOpenPdfInNewTab = async (): Promise<void> => {
    setIsPrinting(true);
    try {
      const html = getCompiledHtml();
      await window.electron.ipcRenderer.invoke('open-pdf-external', html);
    } catch (error) {
      console.error('PDF önizleme hatası:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleRefreshFromDb = async (): Promise<void> => {
    const isConfirmed = window.confirm(
      'Şablonu veritabanındaki güncel verilerle yenilemek istediğinize emin misiniz? Yaptığınız manuel değişiklikler silinecektir.'
    );
    if (!isConfirmed || !activeDosyaId) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queryExecutor = async (sql: string, params: any[]): Promise<any[]> => {
        const res = await window.electron.ipcRenderer.invoke('db:query', sql, params);
        if (res && res.success) {
          return res.data;
        }
        return [];
      };

      const resolver = new TemplateResolver(queryExecutor);
      const resolved = await resolver.resolve(IhtiyacListesiMapping, activeDosyaId);

      setFormData(resolved);
    } catch (e) {
      console.error('Failed to refresh template resolution:', e);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-[95vw] h-[95vh] rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                {activeTemplateConf?.name.replace(/([A-Z])/g, ' $1').trim() || 'Belge Düzenleyici'}
                <span className="text-[9px] px-2 py-0.5 rounded bg-blue-50 text-blue-655 dark:bg-blue-900/40 dark:text-blue-400 font-extrabold uppercase tracking-wider">
                  Akıllı Belge
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                İhtiyaçlarınızı doğru ve eksiksiz şekilde belgelemek, satın alma sürecinizin başarısı için en önemli adımdır. Aşağıdaki alanlardan belgenizi anlık düzenleyebilirsiniz.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel: Form editor */}
          <div className="w-96 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between">
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
              {/* Notice Banner */}
              <div className="p-4 bg-blue-55 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-blue-800 dark:text-blue-400 rounded-2xl text-xs flex flex-col gap-2 shadow-2xs leading-relaxed">
                <span className="font-extrabold flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                  ℹ️ Belge Verileri Hakkında
                </span>
                <p>
                  Bu belge üzerindeki tüm veriler, süreç adımlarından ve aktif dosya kayıtlarından otomatik olarak okunmaktadır.
                </p>
                <p className="font-semibold text-blue-700 dark:text-blue-300">
                  Değişiklik yapmak veya yeni veri eklemek için lütfen ilgili dosya düzenleme / malzeme yönetimi ekranlarına gidiniz.
                </p>
              </div>

              {/* Resolved Variables List */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Belge İçeriği Önizlemesi
                </label>
                
                <div className="border border-slate-250 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950/40 divide-y divide-slate-100 dark:divide-slate-850 overflow-hidden">
                  {Object.keys(formData)
                    .filter((key) => {
                      const EXCLUDED_KEYS = new Set([
                        'antetSatirlari',
                        'ihtiyacKalemleri',
                        'hazirlayanPersonelAdi',
                        'hazirlayanPersonelUnvan',
                        'onaylayanPersonelAdi',
                        'onaylayanPersonelUnvan',
                        'solLogo',
                        'sagLogo',
                      ]);
                      return !EXCLUDED_KEYS.has(key);
                    })
                    .map((key) => {
                      const val = formData[key];
                      const label = {
                        evrakSayisi: 'Sayı / Evrak Numarası',
                        dosyaKonusu: 'Dosya Konusu / Başlık',
                        maddeNo: 'Kanun Maddesi',
                        tarih: 'Belge Tarihi',
                        sunulacakMakamAdi: 'Sunulacak Makam',
                        ihtiyacYeri: 'İhtiyaç Yeri / Birim',
                        isinAciklamasi: 'İşin Açıklaması',
                        kurumAdres: 'Kurum Adresi',
                        kurumTelefon: 'Kurum Telefonu',
                        kurumWeb: 'Kurum Web Adresi',
                        kurumEposta: 'Kurum E-Posta Adresi',
                        kurumKep: 'Kurum KEP Adresi',
                        olurBaslik: 'Onay Başlığı',
                        olurYazisi: 'Olur Yazısı Eklensin mi?',
                        kurumIci: 'Kurum İçi Belge mi?',
                        firstPageLimit: '1. Sayfa Satır Sayısı',
                        middlePageLimit: 'Ara Sayfa Satır Sayısı',
                        lastPageLimit: 'Son Sayfa Satır Sayısı',
                      }[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

                      let displayVal = '';
                      if (typeof val === 'boolean') {
                        displayVal = val ? 'Evet' : 'Hayır';
                      } else if (typeof val === 'number') {
                        displayVal = String(val);
                      } else {
                        displayVal = String(val || '—');
                      }

                      return (
                        <div key={key} className="p-3 text-xs flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                            {label}
                          </span>
                          <span className="text-slate-700 dark:text-slate-200 font-semibold truncate" title={displayVal}>
                            {displayVal}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Live A4 PDF Layout Preview */}
          <div
            ref={previewContainerRef}
            className="flex-1 bg-slate-200/50 dark:bg-slate-950 flex justify-center items-start overflow-y-auto shadow-inner border-l border-slate-200 dark:border-slate-800 h-full py-8 custom-scrollbar"
          >
            <div
              className="bg-white shadow-2xl origin-top transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${previewScale})`,
                width: '800px',
                minHeight: '1131px',
              }}
            >
              {ActiveComponent ? (
                <TemplateErrorBoundary
                  fallback={
                    <div className="p-8 text-center text-red-500 font-semibold bg-red-50 dark:bg-red-950/20 border border-red-250 dark:border-red-900 rounded-xl m-4">
                      ⚠️ Belge şablonu çizilirken bir hata oluştu. Değişkenleri kontrol edip tekrar deneyiniz.
                    </div>
                  }
                >
                  <ActiveComponent data={formData} />
                </TemplateErrorBoundary>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 mt-32">
                  <FileText className="w-12 h-12 mb-3 opacity-20" />
                  <p className="font-medium">Şablon Yüklenemedi veya Seçilmedi</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all text-sm cursor-pointer"
          >
            İptal
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefreshFromDb}
              disabled={isPrinting}
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Güncel Verileri Al</span>
            </button>

            {/* Dışa Aktar / İndir dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDownloadOpen((v) => !v)}
                disabled={isPrinting}
                className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Dışa Aktar / İndir</span>
                <ChevronUp
                  className={cn('w-3.5 h-3.5 transition-transform', downloadOpen && 'rotate-180')}
                />
              </button>

              {downloadOpen && (
                <div className="absolute bottom-full mb-1 right-0 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50">
                  <button
                    onClick={async () => {
                      setDownloadOpen(false);
                      await handlePdf();
                    }}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between cursor-pointer animate-in fade-in duration-100"
                  >
                    <span>PDF Olarak Kaydet</span>
                    <span className="text-[10px] text-slate-400">.pdf</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleOpenPdfInNewTab}
              disabled={isPrinting}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 text-sm border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Tarayıcıda PDF Olarak Aç"
            >
              <span>Tarayıcıda Aç</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm shadow-blue-600/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Yazdır
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentPreviewModalV2;
