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
    { key: "siraNo", label: "S.No", width: "6%", align: "center" },
    { key: "kodu", label: "Kodu", width: "12%", align: "left" },
    { key: "malzemeAdi", label: "Malzeme Adı", width: "30%", align: "left" },
    { key: "ozelligi", label: "Özelliği", width: "20%", align: "left" },
    { key: "birimi", label: "Birimi", width: "10%", align: "center" },
    {
      key: "kdvOrani",
      label: "KDV Oranı (%)",
      width: "12%",
      align: "center",
      render: (
        val: any,
      ) => (val !== undefined && val !== null ? `%${val}` : "-"),
    },
    { key: "miktar", label: "Miktar", width: "10%", align: "center" },
  ];

  const limits = {
    firstPage: firstPageLimit ?? 10,
    middle: middlePageLimit ?? 15,
    lastPage: lastPageLimit ?? 8,
  };

  const items = (data.ihtiyacKalemleri || []).map((item: any, idx: number) => ({
    ...item,
    siraNo: item.siraNo || idx + 1,
  }));

  const pages = paginateData(items, limits);

  // If there are 5 or fewer items, render as dual half-page copies on a single A4 page
  if (items.length <= 5) {
    return (
      <DocumentLayout
        data={data}
        hideHeader={true}
        hideFooter={true}
        pageSize={pageSize}
        orientation={orientation}
      >
        <HalfPageCopy data={data} columns={columns} items={items} />
        <CutLine />
        <HalfPageCopy data={data} columns={columns} items={items} />
      </DocumentLayout>
    );
  }

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
                    textAlign: "right",
                    fontSize: "9.5pt",
                    marginBottom: "10px",
                    fontWeight: "bold",
                  }}
                >
                  Tarih:{" "}
                  {(data as any).tarih || data.dosyaTarihi || (data as any).onayaSunulanTarih ||
                    "..../..../20...."}
                </div>

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

                <table
                  style={{
                    width: "100%",
                    marginBottom: "15px",
                    fontSize: "10pt",
                    borderCollapse: "collapse",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          fontWeight: "bold",
                          width: "120px",
                          padding: "4px 0",
                          verticalAlign: "top",
                        }}
                      >
                        İşin Adı:
                      </td>
                      <td
                        colSpan={3}
                        style={{ padding: "4px 0", verticalAlign: "top" }}
                      >
                        {data.isinAdi || "-"}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          fontWeight: "bold",
                          width: "120px",
                          padding: "4px 0",
                          verticalAlign: "top",
                        }}
                      >
                        İşin Değeri:
                      </td>
                      <td
                        style={{
                          width: "40%",
                          padding: "4px 0",
                          verticalAlign: "top",
                        }}
                      >
                        {data.isinDegeri || "-"}
                      </td>
                      <td
                        style={{
                          fontWeight: "bold",
                          width: "100px",
                          padding: "4px 0",
                          textAlign: "right",
                          paddingRight: "10px",
                          verticalAlign: "top",
                        }}
                      >
                        Dosya No:
                      </td>
                      <td style={{ padding: "4px 0", verticalAlign: "top" }}>
                        {data.dosyaNumarasi || "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div
                  style={{
                    textAlign: "justify",
                    textIndent: "40px",
                    marginBottom: "20px",
                    fontSize: "11pt",
                    lineHeight: 1.5,
                  }}
                >
                  {data.kurumumuz || "Müdürlüğümüz"} bünyesinde gerçekleştirilen
                  {" "}
                  <strong>{data.isinAdi || "Doğrudan Temin"}</strong>{" "}
                  dosyası kapsamında alınan, aşağıda listede cinsi ve miktarı
                  belirtilen malzemeler, teslim eden firma yetkilisi/personeli
                  tarafından getirilerek ilgili komisyon/yetkililerce tam,
                  sağlam ve çalışır vaziyette teslim alınmıştır.
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
                  {data.teslimEdenler && data.teslimEdenler.length > 0
                    ? (
                      data.teslimEdenler.map((person: any, idx: number) => (
                        <PersonelCard
                          key={idx}
                          adSoyad={person.adSoyad}
                          unvan={person.unvan}
                          align="center"
                          marginBottom={16}
                        />
                      ))
                    )
                    : null}
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
                  {data.teslimAlanlar && data.teslimAlanlar.length > 0
                    ? (
                      data.teslimAlanlar.map((person: any, idx: number) => (
                        <PersonelCard
                          key={idx}
                          adSoyad={person.adSoyad}
                          unvan={person.unvan}
                          align="center"
                          marginBottom={16}
                        />
                      ))
                    )
                    : null}
                </div>
              </div>
            )}
          </DocumentLayout>
        );
      })}
    </>
  );
}

// 1. Half-page copy component for dual layout mode
function HalfPageCopy(
  { data, columns, items }: { data: any; columns: any[]; items: any[] },
) {
  return (
    <div
      style={{
        height: "12.8cm",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        boxSizing: "border-box",
      }}
    >
      {/* Header / Antet */}
      <div
        style={{
          display: "table",
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            display: "table-cell",
            width: "70px",
            textAlign: "left",
            verticalAlign: "top",
          }}
        >
          {data.solLogo && (
            <img
              src={data.solLogo}
              alt="Sol Logo"
              style={{
                maxWidth: "60px",
                maxHeight: "60px",
                objectFit: "contain",
              }}
            />
          )}
        </div>
        <div
          style={{
            display: "table-cell",
            textAlign: "center",
            verticalAlign: "top",
            lineHeight: "1.2",
          }}
        >
          {data.antetSatirlari && data.antetSatirlari.length > 0
            ? (
              data.antetSatirlari.map((satir: string, idx: number) => (
                <div key={idx} style={{ fontWeight: "bold", fontSize: "10pt" }}>
                  {satir}
                </div>
              ))
            )
            : (
              <div style={{ fontWeight: "bold", fontSize: "10pt" }}>
                TESLİM TESELLÜM BELGESİ
              </div>
            )}
        </div>
        <div
          style={{
            display: "table-cell",
            width: "70px",
            textAlign: "right",
            verticalAlign: "top",
          }}
        >
          {data.sagLogo && (
            <img
              src={data.sagLogo}
              alt="Sağ Logo"
              style={{
                maxWidth: "60px",
                maxHeight: "60px",
                objectFit: "contain",
              }}
            />
          )}
        </div>
      </div>

      {/* Tarih */}
      <div
        style={{
          textAlign: "right",
          fontSize: "9.5pt",
          marginBottom: "5px",
          fontWeight: "bold",
        }}
      >
        Tarih:{" "}
        {(data as any).tarih || data.dosyaTarihi || (data as any).onayaSunulanTarih ||
          "..../..../20...."}
      </div>

      {/* Info Table */}
      <table
        style={{
          width: "100%",
          marginBottom: "6px",
          fontSize: "9.5pt",
          borderCollapse: "collapse",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                fontWeight: "bold",
                width: "90px",
                padding: "2px 0",
                verticalAlign: "top",
              }}
            >
              İşin Adı:
            </td>
            <td colSpan={3} style={{ padding: "2px 0", verticalAlign: "top" }}>
              {data.isinAdi || "-"}
            </td>
          </tr>
          <tr>
            <td
              style={{
                fontWeight: "bold",
                width: "90px",
                padding: "2px 0",
                verticalAlign: "top",
              }}
            >
              İşin Değeri:
            </td>
            <td
              style={{ width: "40%", padding: "2px 0", verticalAlign: "top" }}
            >
              {data.isinDegeri || "-"}
            </td>
            <td
              style={{
                fontWeight: "bold",
                width: "80px",
                textAlign: "right",
                paddingRight: "10px",
                padding: "2px 0",
                verticalAlign: "top",
              }}
            >
              Dosya No:
            </td>
            <td style={{ padding: "2px 0", verticalAlign: "top" }}>
              {data.dosyaNumarasi || "-"}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Metin */}
      <div
        style={{
          textAlign: "justify",
          textIndent: "20px",
          marginBottom: "8px",
          fontSize: "10pt",
          lineHeight: "1.3",
        }}
      >
        {data.kurumumuz || "Müdürlüğümüz"}{" "}
        tarafından ihtiyaç duyulan ve alımı yapılan aşağıda belirtilen
        malzemeler teslim edilmiştir.
      </div>

      {/* Tablo */}
      <div style={{ fontSize: "9pt" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "8px",
          }}
        >
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  style={{
                    border: "1px solid #333",
                    padding: "4px 6px",
                    fontWeight: "bold",
                    backgroundColor: "#f2f2f2",
                    fontSize: "9pt",
                    width: col.width,
                    textAlign: col.align || "center",
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0
              ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{
                      textAlign: "center",
                      padding: "8px",
                      border: "1px solid #333",
                    }}
                  >
                    Kalem bulunamadı
                  </td>
                </tr>
              )
              : (
                items.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {columns.map((col) => {
                      const value = row[col.key];
                      const rendered = col.render
                        ? col.render(value, row, rowIdx)
                        : (value !== undefined && value !== null
                          ? String(value)
                          : "-");
                      return (
                        <td
                          key={String(col.key)}
                          style={{
                            border: "1px solid #333",
                            padding: "4px 6px",
                            textAlign: col.align || "left",
                            fontSize: "9pt",
                          }}
                        >
                          {rendered}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
          </tbody>
        </table>
      </div>

      {/* Signatures */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "auto",
          fontSize: "9.5pt",
        }}
      >
        <div style={{ width: "48%", textAlign: "center" }}>
          <div
            style={{
              fontWeight: "bold",
              textDecoration: "underline",
              marginBottom: "6px",
            }}
          >
            TESLİM ALAN
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              gap: "10px",
            }}
          >
            {data.teslimAlanlar && data.teslimAlanlar.length > 0
              ? (
                data.teslimAlanlar.map((person: any, idx: number) => (
                  <div
                    key={idx}
                    style={{ flex: 1, textAlign: "center", lineHeight: "1.2" }}
                  >
                    <strong>{person.adSoyad}</strong>
                    <br />
                    {person.unvan}
                    <br />
                    (İmza)
                  </div>
                ))
              )
              : null}
          </div>
        </div>
        <div style={{ width: "48%", textAlign: "center" }}>
          <div
            style={{
              fontWeight: "bold",
              textDecoration: "underline",
              marginBottom: "6px",
            }}
          >
            TESLİM EDEN
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              gap: "10px",
            }}
          >
            {data.teslimEdenler && data.teslimEdenler.length > 0
              ? (
                data.teslimEdenler.map((person: any, idx: number) => (
                  <div
                    key={idx}
                    style={{ flex: 1, textAlign: "center", lineHeight: "1.2" }}
                  >
                    <strong>{person.adSoyad}</strong>
                    <br />
                    {person.unvan}
                    <br />
                    (İmza)
                  </div>
                ))
              )
              : null}
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. Dashed separator line component
function CutLine() {
  return (
    <div
      style={{
        borderTop: "1px dashed #888",
        textAlign: "center",
        fontSize: "8pt",
        color: "#666",
        margin: "12px 0",
        userSelect: "none",
      }}
    />
  );
}
