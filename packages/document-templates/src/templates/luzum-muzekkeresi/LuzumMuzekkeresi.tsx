import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { DocumentTable } from "../../document/DocumentTable";
import {
  ApprovalSignature,
  MetadataBlock,
  PersonelCard,
} from "../../document/ApprovalSignature";
import {
  DEFAULT_LIMITS,
  LANDSCAPE_LIMITS,
  paginateData,
} from "../../document/DynamicPaginatedTable";
import { LuzumMuzekkeresiType } from "./LuzumMuzekkeresi.schema";

interface LuzumMuzekkeresiProps {
  data?: Partial<LuzumMuzekkeresiType>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
  firstPageLimit?: number;
  middlePageLimit?: number;
  lastPageLimit?: number;
}

export function LuzumMuzekkeresi({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
  firstPageLimit,
  middlePageLimit,
  lastPageLimit,
}: LuzumMuzekkeresiProps) {
  const columns: any[] = [
    { key: "siraNo", label: "Sıra No", width: "8%", align: "center" },
    { key: "kodu", label: "Kodu", width: "12%", align: "left" },
    { key: "malzemeAdi", label: "Malzeme Adı", width: "25%", align: "left" },
    { key: "ozelligi", label: "Özelliği", width: "20%", align: "left" },
    { key: "birimi", label: "Birimi", width: "10%", align: "center" },
    { key: "kdvOrani", label: "KDV  Oranı %", width: "8%", align: "center" },
    { key: "miktar", label: "Miktar", width: "12%", align: "right" },
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
                  tarih={data.onayaSunulanTarih || data.tarih ||
                    data.dosyaTarihi}
                  dosyaKonusu={data.dosyaKonusu || "Lüzum Müzekkeresi"}
                  showBorder={false}
                />

                <div
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "12pt",
                    textTransform: "uppercase",
                    marginBottom: "20px",
                    pageBreakInside: "avoid",
                  }}
                >
                  {data.sunulacakMakamAdi}
                </div>

                <div
                  style={{
                    textAlign: "justify",
                    textIndent: "40px",
                    marginBottom: "12px",
                    fontSize: "12pt",
                    lineHeight: 1.5,
                  }}
                >
                  {data.ihtiyacYeri || "Müdürlüğümüzün"}{" "}
                  ihtiyacı olan aşağıda yazılı mal/hizmet kalemlerinin temin
                  edilmesi gerekmektedir.
                </div>

                <div
                  style={{
                    textAlign: "justify",
                    textIndent: "40px",
                    marginBottom: "20px",
                    fontSize: "12pt",
                    lineHeight: 1.5,
                  }}
                >
                  Söz konusu ihtiyacın 4734 sayılı Kanunun{" "}
                  {data.maddeNo || "22/d"}{" "}
                  maddesine göre temini için gereğini olurlarınıza arz ederim.
                </div>

                <PersonelCard
                  adSoyad={data.talepEdenPersonelAdi}
                  unvan={data.talepEdenPersonelUnvan}
                  align="right"
                  marginTop={20}
                  marginBottom={30}
                />
              </>
            )}

            <DocumentTable
              columns={columns}
              data={pageItems}
              emptyMessage="Kalem bulunamadı"
              striped={false}
            />

            {isLastPage && data.olurYazisi && (
              <div style={{ marginTop: "auto" }}>
                <ApprovalSignature
                  title={data.olurBaslik || "OLUR"}
                  date={data.onayTarihi || data.tarih || data.dosyaTarihi}
                  adSoyad={data.onaylayanPersonelAdi}
                  unvan={data.onaylayanPersonelUnvan}
                  showSpace={true}
                />
              </div>
            )}
          </DocumentLayout>
        );
      })}
    </>
  );
}
