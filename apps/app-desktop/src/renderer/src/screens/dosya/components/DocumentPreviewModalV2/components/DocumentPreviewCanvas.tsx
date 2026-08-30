import React from "react";
import { FileText } from "lucide-react";
import {
  IhtiyacListesiType,
  TemplateComponentType,
  TemplateEditProvider,
} from "@hakim-pro-app/document-templates";
import { TemplateErrorBoundary } from "../TemplateErrorBoundary";
import { Personel } from "../types";

interface DocumentPreviewCanvasProps {
  previewContainerRef: React.RefObject<HTMLDivElement | null>;
  previewScale: number;
  orientation: "portrait" | "landscape";
  ActiveComponent: TemplateComponentType | null;
  isEditingMode: boolean;
  formData: Partial<IhtiyacListesiType>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<IhtiyacListesiType>>>;
  personelListesi: Personel[];
  firmaListesi: any[];
  localShowLogoLeft: boolean;
  localShowLogoRight: boolean;
}

export function DocumentPreviewCanvas({
  previewContainerRef,
  previewScale,
  orientation,
  ActiveComponent,
  isEditingMode,
  formData,
  setFormData,
  personelListesi,
  firmaListesi,
  localShowLogoLeft,
  localShowLogoRight,
}: DocumentPreviewCanvasProps): React.JSX.Element {
  return (
    <div
      ref={previewContainerRef}
      className="flex-1 bg-slate-200/50 dark:bg-slate-955 flex justify-center items-start overflow-y-auto shadow-inner border-l border-slate-200 dark:border-slate-800 h-full py-8 custom-scrollbar min-h-0 min-w-0"
    >
      <div
        className="bg-white shadow-2xl origin-top transition-transform duration-200 ease-out shrink-0"
        style={{
          transform: `scale(${previewScale})`,
          width: orientation === "landscape" ? "1131px" : "800px",
          minHeight: orientation === "landscape" ? "800px" : "1131px",
        }}
      >
        {ActiveComponent ? (
          <TemplateErrorBoundary
            fallback={
              <div className="p-8 text-center text-red-500 font-semibold bg-red-50 dark:bg-red-950/20 border border-red-250 dark:border-red-900 rounded-xl m-4">
                ⚠️ Belge şablonu çizilirken bir hata oluştu. Değişkenleri
                kontrol edip tekrar deneyiniz.
              </div>
            }
          >
            <TemplateEditProvider
              isEditing={isEditingMode}
              onFieldChange={(key, val) =>
                setFormData((prev) => ({ ...prev, [key]: val }))}
              personelListesi={personelListesi}
              firmaListesi={firmaListesi}
            >
              {React.createElement(ActiveComponent, {
                data: {
                  ...formData,
                  personelListesi:
                    (formData as any).personelListesi || personelListesi,
                  firmaListesi:
                    (formData as any).firmaListesi || firmaListesi,
                  tarih:
                    formData.tarih || formData.onayaSunulanTarih || "",
                  onayTarihi:
                    formData.onayTarihi || formData.dosyaTarihi || "",
                  solLogo: localShowLogoLeft ? formData.solLogo : null,
                  sagLogo: localShowLogoRight ? formData.sagLogo : null,
                  olurYazisi: formData.olurYazisi !== false,
                  orientation,
                },
                orientation,
              })}
            </TemplateEditProvider>
          </TemplateErrorBoundary>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 mt-32">
            <FileText className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium">Şablon Yüklenemedi veya Seçilmedi</p>
          </div>
        )}
      </div>
    </div>
  );
}
