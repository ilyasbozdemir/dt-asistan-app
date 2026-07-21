import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { KomisyonGorevlendirmeOnayiEkiType } from "./KomisyonGorevlendirmeOnayiEki.schema";

interface KomisyonGorevlendirmeOnayiEkiProps {
  data?: Partial<KomisyonGorevlendirmeOnayiEkiType> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
}

export function KomisyonGorevlendirmeOnayiEki({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
}: KomisyonGorevlendirmeOnayiEkiProps) {
  const fiyatUyeleri = data.fiyatKomisyonu || [];
  const muayeneUyeleri = data.muayeneKomisyonu || [];

  return (
    <DocumentLayout
      data={data as any}
      hideFooter={false}
      pageSize={pageSize}
      orientation={orientation}
      pageNumber={1}
      totalPages={1}
    >
      <div
        style={{
          width: "100%",
          fontSize: "11pt",
          color: "#000",
          fontFamily: "'Times New Roman', Times, serif",
          lineHeight: 1.5,
        }}
      >
        {/* Ek No */}
        <div style={{ textAlign: "right", marginBottom: "15px" }}>
          <strong>EK: {data.ekNo || "1"}</strong>
        </div>

        {/* Body Paragraph */}
        <div
          style={{
            textAlign: "justify",
            textIndent: "35px",
            marginBottom: "25px",
            lineHeight: 1.5,
          }}
        >
          {data.kurumumuz || "Kurumumuz"} birimlerinde kullanılmak üzere ekteki lüzum müzakeresinde sunulan{" "}
          <strong>{data.alimTuru || data.isAdi || data.isinAdi || "malzeme/hizmet alımı"}</strong> için 4734 Sayılı Kamu İhale Kanununa göre görevlendirilen kişilerin listesidir.
        </div>

        {/* Table 1: PİYASA ARAŞTIRMA VE SATINALMA KOMİSYONU */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            backgroundColor: "#f2f2f2",
            border: "1px solid #000",
            padding: "5px",
            fontSize: "10pt",
            textTransform: "uppercase",
            marginTop: "10px",
          }}
        >
          PİYASA ARAŞTIRMA VE SATINALMA KOMİSYONU
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
            fontSize: "10pt",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontWeight: "bold",
                  backgroundColor: "#f9f9f9",
                  width: "35%",
                  textAlign: "left",
                }}
              >
                Komisyondaki Sıfatı/Ünvanı
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontWeight: "bold",
                  backgroundColor: "#f9f9f9",
                  width: "40%",
                  textAlign: "left",
                }}
              >
                Adı, Soyadı
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontWeight: "bold",
                  backgroundColor: "#f9f9f9",
                  width: "25%",
                  textAlign: "left",
                }}
              >
                Pozisyonu
              </th>
            </tr>
          </thead>
          <tbody>
            {fiyatUyeleri.length > 0 ? (
              fiyatUyeleri.map((u, idx) => (
                <tr key={idx}>
                  <td style={{ border: "1px solid #000", padding: "5px 8px" }}>
                    {u.gorevi || "Üye"}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "5px 8px", fontWeight: "bold" }}>
                    {u.adSoyad}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "5px 8px" }}>
                    {u.unvan}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  style={{
                    border: "1px solid #000",
                    padding: "6px 8px",
                    textAlign: "center",
                    fontStyle: "italic",
                  }}
                >
                  Komisyon üyesi bulunmamaktadır.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Table 2: MUAYENE KABUL VE TESLİM ALMA KOMİSYONU */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            backgroundColor: "#f2f2f2",
            border: "1px solid #000",
            padding: "5px",
            fontSize: "10pt",
            textTransform: "uppercase",
          }}
        >
          MUAYENE KABUL VE TESLİM ALMA KOMİSYONU
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
            fontSize: "10pt",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontWeight: "bold",
                  backgroundColor: "#f9f9f9",
                  width: "35%",
                  textAlign: "left",
                }}
              >
                Komisyondaki Sıfatı/Ünvanı
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontWeight: "bold",
                  backgroundColor: "#f9f9f9",
                  width: "40%",
                  textAlign: "left",
                }}
              >
                Adı, Soyadı
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontWeight: "bold",
                  backgroundColor: "#f9f9f9",
                  width: "25%",
                  textAlign: "left",
                }}
              >
                Pozisyonu
              </th>
            </tr>
          </thead>
          <tbody>
            {muayeneUyeleri.length > 0 ? (
              muayeneUyeleri.map((u, idx) => (
                <tr key={idx}>
                  <td style={{ border: "1px solid #000", padding: "5px 8px" }}>
                    {u.gorevi || "Üye"}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "5px 8px", fontWeight: "bold" }}>
                    {u.adSoyad}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "5px 8px" }}>
                    {u.unvan}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  style={{
                    border: "1px solid #000",
                    padding: "6px 8px",
                    textAlign: "center",
                    fontStyle: "italic",
                  }}
                >
                  Komisyon üyesi bulunmamaktadır.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Preparer Signature */}
        <div style={{ width: "100%", display: "flow-root", marginTop: "20px" }}>
          <div
            style={{
              float: "right",
              textAlign: "center",
              width: "220px",
              fontSize: "10.5pt",
              lineHeight: 1.4,
            }}
          >
            <strong>{data.hazirlayanPersonelAdi || ""}</strong>
            <br />
            {data.hazirlayanPersonelUnvan || ""}
          </div>
        </div>
      </div>
    </DocumentLayout>
  );
}
