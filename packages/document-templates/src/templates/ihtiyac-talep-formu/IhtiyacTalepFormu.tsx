import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { DocumentTable } from "../../document/DocumentTable";
import {
  ApprovalSignature,
  EditableOlurPlaceholder,
  MetadataBlock,
  PersonelCard,
} from "../../document/ApprovalSignature";
import { EditableField } from "../../document/EditableField";
import {
  DEFAULT_LIMITS,
  LANDSCAPE_LIMITS,
  paginateData,
} from "../../document/DynamicPaginatedTable";
import { IhtiyacTalepFormuType } from "./IhtiyacTalepFormu.schema";

interface IhtiyacTalepFormuProps {
  data?: Partial<IhtiyacTalepFormuType>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
  firstPageLimit?: number;
  middlePageLimit?: number;
  lastPageLimit?: number;
}

export function IhtiyacTalepFormu({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
  firstPageLimit,
  middlePageLimit,
  lastPageLimit,
}: IhtiyacTalepFormuProps) {
  const columns: any[] = [
    { key: "siraNo", label: "S. NO", width: "8%", align: "center" },
    { key: "malzemeAdi", label: "MALZEME/HİZMET ADI", width: "32%", align: "left" },
    { key: "ozelligi", label: "ÖZELLİĞİ", width: "25%", align: "left" },
    { key: "miktar", label: "MİKTAR", width: "10%", align: "right" },
    { key: "birimi", label: "BİRİM", width: "10%", align: "center" },
    { key: "kodu", label: "TAŞINIR KODU", width: "15%", align: "center" },
  ];

  const fLimit = firstPageLimit ?? (data as any).firstPageLimit;
  const mLimit = middlePageLimit ?? (data as any).middlePageLimit;
  const lLimit = lastPageLimit ?? (data as any).lastPageLimit;

  const limits = {
    firstPage: fLimit !== undefined && fLimit !== null
      ? Number(fLimit)
      : (orientation === "landscape"
        ? LANDSCAPE_LIMITS.firstPage
        : DEFAULT_LIMITS.firstPage),
    middle: mLimit !== undefined && mLimit !== null
      ? Number(mLimit)
      : (orientation === "landscape"
        ? LANDSCAPE_LIMITS.middle
        : DEFAULT_LIMITS.middle),
    lastPage: lLimit !== undefined && lLimit !== null
      ? Number(lLimit)
      : (orientation === "landscape"
        ? LANDSCAPE_LIMITS.lastPage
        : DEFAULT_LIMITS.lastPage),
  };
  const items = data.ihtiyacKalemleri || [];
  const pages = paginateData(items, limits);

  return (
    <>
      {pages.map((pageItems, pageIdx) => {
        const isFirstPage = pageIdx === 0;
        const isLastPage = pageIdx === pages.length - 1;

        return (
          <DocumentLayout
            key={pageIdx}
            data={data}
            hideFooter={false}
            pageSize={pageSize}
            orientation={orientation}
            pageNumber={pageIdx + 1}
            totalPages={pages.length}
            hideHeader={!isFirstPage}
          >
            {isFirstPage && (
              <>
                <MetadataBlock
                  evrakSayisi={data.evrakSayisi}
                  tarih={data.onayaSunulanTarih || data.tarih || data.dosyaTarihi}
                  dosyaKonusu={data.dosyaKonusu || "İhtiyaç Talep Formu"}
                  showBorder={false}
                />

                <div
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "13pt",
                    textTransform: "uppercase",
                    marginBottom: "16px",
                    pageBreakInside: "avoid",
                  }}
                >
                  İHTİYAÇ TALEP FORMU
                </div>

                <div
                  style={{
                    marginBottom: "12px",
                    fontWeight: "bold",
                    fontSize: "10pt",
                  }}
                >
                  TALEP EDEN BİRİM:{" "}
                  <EditableField
                    name="ihtiyacYeri"
                    value={data.ihtiyacYeri || (data as any).mudurluk || (data as any).kurum_adi}
                    placeholder="Birim Adı"
                  />
                </div>
              </>
            )}

            <DocumentTable
              columns={columns}
              data={pageItems}
              emptyMessage="Kalem bulunamadı"
              striped={false}
            />

            {isLastPage && (
              <div style={{ marginTop: "16px" }}>
                <div
                  style={{
                    fontSize: "9.5pt",
                    textAlign: "justify",
                    lineHeight: 1.4,
                    marginBottom: "16px",
                  }}
                >
                  Yukarıda istemi yapılan taleplerimizin önceki sarf edilen miktarlarla uyumlu ve ihtiyaçların fazla talep edilmediği, fazla talep edilmesinden kaynaklanan yasal sorumlulukların tarafımıza ait olduğunu hazırlamış olduğumuz talebe ait ekteki teknik şartnamelerin yürürlükteki kanunlara, yönetmeliklere uygun olduğunu ve rekabete engel teşkil etmediğini taahhüt ederiz.
                </div>

                <div
                  style={{
                    border: "1px solid #000",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    marginBottom: "16px",
                    fontSize: "9.5pt",
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    BİRİMİN TALEP GEREKÇESİ:
                  </div>
                  <EditableField
                    name="gerekce"
                    value={data.gerekce}
                    placeholder="Gerekçe yazınız..."
                    multiline
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "24px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "10pt", marginBottom: "4px" }}>
                      TALEBİ YAPAN
                    </div>
                    <PersonelCard
                      adSoyad={data.talepEdenPersonelAdi || data.hazirlayanPersonelAdi}
                      unvan={data.talepEdenPersonelUnvan || data.hazirlayanPersonelUnvan}
                      align="left"
                    />
                  </div>

                  <div>
                    {data.olurYazisi !== false ? (
                      <ApprovalSignature
                        title={data.olurBaslik || "ONAYLAYAN"}
                        date={data.onayTarihi || data.dosyaTarihi || data.tarih}
                        adSoyad={data.onaylayanPersonelAdi}
                        unvan={data.onaylayanPersonelUnvan}
                        showSpace={false}
                      />
                    ) : (
                      <EditableOlurPlaceholder />
                    )}
                  </div>
                </div>

                {data.altNotlar && (
                  <div style={{ marginTop: "16px", fontSize: "9pt", fontStyle: "italic" }}>
                    {data.altNotlar}
                  </div>
                )}
              </div>
            )}
          </DocumentLayout>
        );
      })}
    </>
  );
}
