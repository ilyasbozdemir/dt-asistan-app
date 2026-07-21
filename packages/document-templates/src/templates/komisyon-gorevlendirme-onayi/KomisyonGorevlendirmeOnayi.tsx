import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import { KomisyonGorevlendirmeOnayiType } from "./KomisyonGorevlendirmeOnayi.schema";

interface KomisyonGorevlendirmeOnayiProps {
  data?: Partial<KomisyonGorevlendirmeOnayiType> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
}

export function KomisyonGorevlendirmeOnayi({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
}: KomisyonGorevlendirmeOnayiProps) {
  const fiyatUyeleri = data.fiyatKomisyonu || [];
  const muayeneUyeleri = data.muayeneKomisyonu || [];

  const mainHeaderTitle =
    data.idareAdi ||
    data.sunulacakMakamAdi ||
    (data.antetSatirlari && data.antetSatirlari[1]) ||
    data.kurumAdi ||
    "KURUM BAŞKANLIĞINA";

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
        {/* Meta Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
            fontSize: "11pt",
          }}
        >
          <div>
            <table style={{ borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: "bold", paddingRight: "8px", whiteSpace: "nowrap" }}>
                    Sayı
                  </td>
                  <td>: <EditableField name="evrakSayisi" value={data.evrakSayisi} /></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: "bold", paddingRight: "8px", whiteSpace: "nowrap" }}>
                    Konu
                  </td>
                  <td>: <EditableField name="konu" value={data.konu || "Görevlendirme"} /></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <strong>Tarih:</strong> <EditableField name="tarih" value={data.tarih} />
          </div>
        </div>

        {/* Boxed Institution Header */}
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <div
            style={{
              display: "inline-block",
              padding: "4px 15px",
              fontWeight: "bold",
              fontSize: "11.5pt",
              textTransform: "uppercase",
            }}
          >
            <EditableField name="sunulacakMakamAdi" value={mainHeaderTitle} placeholder="KURUM BAŞKANLIĞINA" />
          </div>
        </div>

        {/* Body Paragraph */}
        <div
          style={{
            textAlign: "justify",
            textIndent: "35px",
            marginBottom: "15px",
            lineHeight: 1.5,
          }}
        >
          {data.kurumumuz || "Kurumumuz"} bünyesindeki{" "}
          <strong><EditableField name="isAdi" value={data.isAdi || data.isinAdi} placeholder="İşin Adı" /></strong> işine ait fiyat araştırması ile
          muayene ve kabulü yapmak üzere aşağıdaki personeller görevlendirilecek olup,
        </div>
        <div
          style={{
            textAlign: "justify",
            textIndent: "35px",
            marginBottom: "25px",
            lineHeight: 1.5,
          }}
        >
          Gereğini olurlarınıza arz ederim.
        </div>

        {/* Preparer Signature */}
        <div style={{ width: "100%", display: "flow-root", marginBottom: "25px" }}>
          <div
            style={{
              float: "right",
              textAlign: "center",
              width: "220px",
              fontSize: "10.5pt",
              lineHeight: 1.4,
            }}
          >
            <strong><EditableField name="hazirlayanPersonelAdi" value={data.hazirlayanPersonelAdi} placeholder="Hazırlayan Adı Soyadı" /></strong>
            <br />
            <EditableField name="hazirlayanPersonelUnvan" value={data.hazirlayanPersonelUnvan} placeholder="Hazırlayan Unvanı" />
          </div>
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

        {/* Approval / OLUR Section */}
        <div
          style={{
            marginTop: "25px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            pageBreakInside: "avoid",
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: "11.5pt", marginBottom: "4px" }}>
            OLUR
          </div>
          <div style={{ marginBottom: "8px", fontSize: "10.5pt" }}>
            <EditableField name="onayTarihi" value={data.onayTarihi || data.tarih} placeholder="GG.AA.YYYY" />
          </div>
          <div style={{ fontWeight: "bold", fontSize: "11pt" }}>
            <EditableField name="onaylayanPersonelAdi" value={data.baskanAdi || data.onaylayanPersonelAdi} placeholder="Onaylayan Adı Soyadı" />
          </div>
          <div style={{ fontSize: "10.5pt" }}>
            <EditableField name="onaylayanPersonelUnvan" value={data.baskanUnvan || data.onaylayanPersonelUnvan} placeholder="Onaylayan Unvanı" />
          </div>
        </div>
      </div>
    </DocumentLayout>
  );
}
