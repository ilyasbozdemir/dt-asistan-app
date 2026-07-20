import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { DocumentTable } from "../../document/DocumentTable";
import { PersonelCard } from "../../document/ApprovalSignature";
import { paginateData } from "../../document/DynamicPaginatedTable";
import { LuzumMuzekkeresiTeslimTesellumType } from "./LuzumMuzekkeresiTeslimTesellum.schema";

interface LuzumMuzekkeresiTeslimTesellumProps {
  data?: Partial<LuzumMuzekkeresiTeslimTesellumType>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
  firstPageLimit?: number;
  middlePageLimit?: number;
  lastPageLimit?: number;
}

export function LuzumMuzekkeresiTeslimTesellum({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
  firstPageLimit,
  middlePageLimit,
  lastPageLimit,
}: LuzumMuzekkeresiTeslimTesellumProps) {
  const columns: any[] = [
    { key: "siraNo", label: "Sıra No", width: "8%", align: "center" },
    { key: "kodu", label: "Malzeme Kodu", width: "15%", align: "left" },
    { key: "malzemeAdi", label: "Malzeme Adı", width: "40%", align: "left" },
    { key: "birimi", label: "Birimi", width: "12%", align: "center" },
    { key: "miktar", label: "Miktar", width: "12%", align: "right" },
  ];

  const limits = {
    firstPage: firstPageLimit ?? 14,
    middle: middlePageLimit ?? 18,
    lastPage: lastPageLimit ?? 10,
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
              <>
                <div
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "14pt",
                    textDecoration: "underline",
                    marginBottom: "20px",
                  }}
                >
                  TESLİM TESELLÜM BELGESİ
                </div>

                <div
                  style={{
                    textAlign: "justify",
                    textIndent: "40px",
                    marginBottom: "20px",
                    fontSize: "11pt",
                    lineHeight: 1.5,
                  }}
                >
                  {data.kurumumuz || "Müdürlüğümüz"} bünyesinde gerçekleştirilen{" "}
                  <strong>{data.isinAdi || "Doğrudan Temin"}</strong> dosyası
                  kapsamında alınan, aşağıda listede cinsi ve miktarı belirtilen
                  malzemeler, teslim eden firma yetkilisi/personeli tarafından
                  getirilerek ilgili komisyon/yetkililerce tam, sağlam ve
                  çalışır vaziyette teslim alınmıştır.
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
              <div
                style={{
                  marginTop: "40px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "40px",
                  pageBreakInside: "avoid",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "11pt",
                      borderBottom: "1px solid #ccc",
                      paddingBottom: "4px",
                      marginBottom: "12px",
                      textAlign: "center",
                    }}
                  >
                    TESLİM EDENLER
                  </div>
                  {data.teslimEdenler && data.teslimEdenler.length > 0 ? (
                    data.teslimEdenler.map((person: any, idx: number) => (
                      <PersonelCard
                        key={idx}
                        adSoyad={person.adSoyad}
                        unvan={person.unvan}
                        align="center"
                        marginBottom={16}
                      />
                    ))
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        fontStyle: "italic",
                        fontSize: "10pt",
                        color: "#666",
                      }}
                    >
                      Firma Yetkilisi / Temsilcisi
                      <div style={{ marginTop: "24px" }}>(İmza)</div>
                    </div>
                  )}
                </div>

                <div>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "11pt",
                      borderBottom: "1px solid #ccc",
                      paddingBottom: "4px",
                      marginBottom: "12px",
                      textAlign: "center",
                    }}
                  >
                    TESLİM ALANLAR
                  </div>
                  {data.teslimAlanlar && data.teslimAlanlar.length > 0 ? (
                    data.teslimAlanlar.map((person: any, idx: number) => (
                      <PersonelCard
                        key={idx}
                        adSoyad={person.adSoyad}
                        unvan={person.unvan}
                        align="center"
                        marginBottom={16}
                      />
                    ))
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        fontStyle: "italic",
                        fontSize: "10pt",
                        color: "#666",
                      }}
                    >
                      Depo Yetkilisi / Muayene Komisyonu
                      <div style={{ marginTop: "24px" }}>(İmza)</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DocumentLayout>
        );
      })}
    </>
  );
}
