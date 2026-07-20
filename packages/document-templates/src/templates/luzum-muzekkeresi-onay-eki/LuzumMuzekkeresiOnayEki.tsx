import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { DocumentTable } from "../../document/DocumentTable";
import { PersonelCard } from "../../document/ApprovalSignature";
import { paginateData } from "../../document/DynamicPaginatedTable";
import { LuzumMuzekkeresiOnayEkiType } from "./LuzumMuzekkeresiOnayEki.schema";

interface LuzumMuzekkeresiOnayEkiProps {
  data?: Partial<LuzumMuzekkeresiOnayEkiType>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
  firstPageLimit?: number;
  middlePageLimit?: number;
  lastPageLimit?: number;
}

export function LuzumMuzekkeresiOnayEki({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
  firstPageLimit,
  middlePageLimit,
  lastPageLimit,
}: LuzumMuzekkeresiOnayEkiProps) {
  const columns: any[] = [
    { key: "siraNo", label: "Sıra No", width: "8%", align: "center" },
    { key: "kodu", label: "Kodu / Barkodu", width: "15%", align: "left" },
    {
      key: "malzemeAdi",
      label: "Malzeme/Hizmet Kalemi",
      width: "35%",
      align: "left",
    },
    {
      key: "ozelligi",
      label: "Açıklama / Özellikleri",
      width: "22%",
      align: "left",
    },
    { key: "birimi", label: "Birimi", width: "10%", align: "center" },
    { key: "miktar", label: "Miktar", width: "10%", align: "right" },
  ];

  const limits = {
    firstPage: firstPageLimit ?? 15,
    middle: middlePageLimit ?? 18,
    lastPage: lastPageLimit ?? 12,
  };

  const items = (data.ihtiyacKalemleri || []).map((item: any, idx: number) => ({
    ...item,
    siraNo: item.siraNo || idx + 1,
  }));

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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "20px",
                }}
              >
                <div style={{ fontSize: "11pt", fontWeight: "bold" }}>
                  EK NO: {data.ekNo || "1"}
                </div>
                <div
                  style={{
                    fontSize: "12pt",
                    fontWeight: "bold",
                    textAlign: "center",
                    flex: 1,
                    marginRight: "40px",
                  }}
                >
                  İHTİYAÇ LİSTESİ
                </div>
              </div>
            )}

            <DocumentTable
              columns={columns}
              data={pageItems}
              emptyMessage="Kalem bulunamadı"
              striped={false}
            />

            {isLastPage && (
              <div
                style={{
                  marginTop: "30px",
                  display: "flex",
                  justifyContent: "flex-end",
                  pageBreakInside: "avoid",
                }}
              >
                <PersonelCard
                  adSoyad={data.talepEdenPersonelAdi}
                  unvan={data.talepEdenPersonelUnvan}
                  align="right"
                />
              </div>
            )}
          </DocumentLayout>
        );
      })}
    </>
  );
}
