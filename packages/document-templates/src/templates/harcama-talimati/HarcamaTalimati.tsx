import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { HarcamaTalimatiType } from "./HarcamaTalimati.schema";

interface HarcamaTalimatiProps {
  data?: Partial<HarcamaTalimatiType> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
}

export function HarcamaTalimati({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
}: HarcamaTalimatiProps) {
  const renderArrayOrString = (val: any, fallback = "-") => {
    if (!val) return fallback;
    if (Array.isArray(val)) {
      if (val.length === 0) return fallback;
      return val.map((item, idx) => <div key={idx}>{String(item)}</div>);
    }
    return String(val);
  };

  const formattedYaklasikMaliyet = data.yaklasikMaliyet
    ? `${data.yaklasikMaliyet} ₺`
    : "-";

  return (
    <DocumentLayout
      data={data as any}
      hideFooter={false}
      pageSize={pageSize}
      orientation={orientation}
      pageNumber={1}
      totalPages={1}
    >
      <div style={{ width: "100%", fontSize: "10pt", color: "#000", fontFamily: "'Times New Roman', Times, serif" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #000",
            marginBottom: "10px",
          }}
        >
          <tbody>
            {/* Title */}
            <tr>
              <th
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "12pt",
                  textTransform: "uppercase",
                  padding: "8px",
                  backgroundColor: "#fff",
                }}
              >
                HARCAMA TALİMATI
              </th>
            </tr>

            {/* Sayı and Tarih */}
            <tr>
              <td style={{ border: "1px solid #000", width: "50%", fontWeight: "bold", padding: "6px 8px" }}>
                Sayı: {data.evrakSayisi || "-"}
              </td>
              <td style={{ border: "1px solid #000", width: "50%", fontWeight: "bold", textAlign: "right", padding: "6px 8px" }}>
                Tarih: {data.tarih || "-"}
              </td>
            </tr>

            {/* Harcama Talebinde Bulunan Birim */}
            <tr>
              <td colSpan={2} style={{ border: "1px solid #000", fontWeight: "bold", padding: "6px 8px 2px 8px" }}>
                Harcama Talebinde Bulunan Birim:
              </td>
            </tr>
            <tr>
              <td
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "11pt",
                  padding: "6px",
                  textTransform: "uppercase",
                }}
              >
                {data.idareAdi || (data.antetSatirlari && data.antetSatirlari[1]) || "KURUM / BİRİM ADI"}
              </td>
            </tr>

            {/* YAPILACAK HARCAMANIN */}
            <tr>
              <td
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  textAlign: "center",
                  fontWeight: "bold",
                  backgroundColor: "#fff",
                  fontSize: "10.5pt",
                  textTransform: "uppercase",
                  padding: "6px",
                }}
              >
                YAPILACAK HARCAMANIN
              </td>
            </tr>

            {/* Gerekçe ve hukuki dayanak */}
            <tr>
              <td style={{ border: "1px solid #000", width: "35%", fontWeight: "bold", textTransform: "uppercase", padding: "6px 8px" }}>
                Gerekçesi ve Hukuki Dayanağı
              </td>
              <td style={{ border: "1px solid #000", width: "65%", padding: "6px 8px" }}>
                {data.gerekce || "-"}
              </td>
            </tr>

            {/* Konusu / Nev'i / Niteliği */}
            <tr>
              <td style={{ border: "1px solid #000", width: "35%", fontWeight: "bold", textTransform: "uppercase", padding: "6px 8px" }}>
                Konusu / Nev'i / Niteliği
              </td>
              <td style={{ border: "1px solid #000", width: "65%", fontWeight: "bold", padding: "6px 8px" }}>
                {data.isAdi || "-"}
              </td>
            </tr>

            {/* Miktarı */}
            <tr>
              <td style={{ border: "1px solid #000", width: "35%", fontWeight: "bold", textTransform: "uppercase", padding: "6px 8px" }}>
                Miktarı
              </td>
              <td style={{ border: "1px solid #000", width: "65%", padding: "6px 8px" }}>
                {data.miktar || "-"}
              </td>
            </tr>

            {/* Gerçekleştirme Süresi */}
            <tr>
              <td style={{ border: "1px solid #000", width: "35%", fontWeight: "bold", textTransform: "uppercase", padding: "6px 8px" }}>
                Gerçekleştirme Süresi
              </td>
              <td style={{ border: "1px solid #000", width: "65%", padding: "6px 8px" }}>
                {data.sure || "-"}
              </td>
            </tr>

            {/* Gerçekleştirme Usulü */}
            <tr>
              <td style={{ border: "1px solid #000", width: "35%", fontWeight: "bold", textTransform: "uppercase", padding: "6px 8px" }}>
                Gerçekleştirme Usulü
              </td>
              <td style={{ border: "1px solid #000", width: "65%", padding: "6px 8px" }}>
                {data.teminSekli || "-"}
              </td>
            </tr>

            {/* Tutarı veya yaklaşık bedeli */}
            <tr>
              <td style={{ border: "1px solid #000", width: "35%", fontWeight: "bold", textTransform: "uppercase", padding: "6px 8px" }}>
                Tutarı veya Yaklaşık Bedeli
              </td>
              <td style={{ border: "1px solid #000", width: "65%", padding: "6px 8px" }}>
                {formattedYaklasikMaliyet}
              </td>
            </tr>

            {/* Kullanılabilir ödenek tutarı */}
            <tr>
              <td style={{ border: "1px solid #000", width: "35%", fontWeight: "bold", textTransform: "uppercase", padding: "6px 8px" }}>
                Kullanılabilir Ödenek Tutarı
              </td>
              <td style={{ border: "1px solid #000", width: "65%", padding: "6px 8px" }}>
                {data.odenekTutari || "-"}
              </td>
            </tr>

            {/* Ödeneğin bütçe tertibi */}
            <tr>
              <td style={{ border: "1px solid #000", width: "35%", fontWeight: "bold", textTransform: "uppercase", padding: "6px 8px" }}>
                Ödeneğin Bütçe Tertibi
              </td>
              <td style={{ border: "1px solid #000", width: "65%", padding: "6px 8px" }}>
                {renderArrayOrString(data.butceTertibi)}
              </td>
            </tr>

            {/* Gerçekleştirme görevlileri */}
            <tr>
              <td style={{ border: "1px solid #000", width: "35%", fontWeight: "bold", textTransform: "uppercase", padding: "6px 8px" }}>
                Gerçekleştirme Görevlileri
              </td>
              <td style={{ border: "1px solid #000", width: "65%", padding: "6px 8px" }}>
                {renderArrayOrString(
                  data.gerceklestirmeGorevlileri,
                  data.hazirlayanPersonelAdi
                    ? `${data.hazirlayanPersonelAdi} (${data.hazirlayanPersonelUnvan || ""})`
                    : "-"
                )}
              </td>
            </tr>

            {/* AÇIKLAMALAR */}
            <tr>
              <td
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  textAlign: "center",
                  fontWeight: "bold",
                  backgroundColor: "#fff",
                  fontSize: "10.5pt",
                  textTransform: "uppercase",
                  padding: "6px",
                }}
              >
                AÇIKLAMALAR
              </td>
            </tr>
            <tr>
              <td
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  minHeight: "80px",
                  fontSize: "10pt",
                  textAlign: "justify",
                  padding: "8px 10px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {data.aciklama || data.isinAciklamasi || data.isAdi || data.isinAdi || data.gerekce || "-"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ONAY BLOCK */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #000",
          }}
        >
          <tbody>
            <tr>
              <td
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  textAlign: "center",
                  fontWeight: "bold",
                  backgroundColor: "#fff",
                  fontSize: "10.5pt",
                  textTransform: "uppercase",
                  padding: "4px",
                }}
              >
                ONAY
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  borderBottom: "none",
                  width: "50%",
                  height: "60px",
                  verticalAlign: "top",
                  padding: "8px",
                  textAlign: "justify",
                }}
              >
                Yukarıda belirtilen harcamanın yaptırılması için harcama yetkilisi mutemedi{" "}
                <strong>{data.mutemetAdi || "......"}</strong>‘a, işin tutarı,{" "}
                <strong>{data.isTutari || data.yaklasikMaliyet || "......"} ₺</strong>, avans verilmesi hususu olurlarınıza arz olunur.
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  borderBottom: "none",
                  width: "50%",
                  height: "60px",
                  verticalAlign: "middle",
                  textAlign: "center",
                  padding: "8px",
                  fontWeight: "bold",
                  fontSize: "11pt",
                }}
              >
                OLUR
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  borderTop: "none",
                  width: "50%",
                  padding: "15px 10px",
                  textAlign: "center",
                  verticalAlign: "top",
                }}
              >
                <div>
                  Teklif Eden Yetkili<br />
                  {data.sunumTarihi || data.tarih || ""}<br /><br /><br />
                  <strong>{data.hazirlayanPersonelAdi || ""}</strong><br />
                  {data.hazirlayanPersonelUnvan || ""}
                </div>
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  borderTop: "none",
                  width: "50%",
                  padding: "15px 10px",
                  textAlign: "center",
                  verticalAlign: "top",
                }}
              >
                <div>
                  Harcama Yetkilisi<br />
                  {data.olurTarihi || data.onayTarihi || data.tarih || ""}<br /><br /><br />
                  <strong>{data.onaylayanPersonelAdi || ""}</strong><br />
                  {data.onaylayanPersonelUnvan || ""}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocumentLayout>
  );
}
