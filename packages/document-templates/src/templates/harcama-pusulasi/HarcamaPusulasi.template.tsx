import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import { DateEditableField, PersonelCard } from "../../document/ApprovalSignature";
import { HarcamaPusulasiType } from "./HarcamaPusulasi.schema";

interface HarcamaPusulasiProps {
  data?: Partial<HarcamaPusulasiType> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
}

export function HarcamaPusulasi({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
}: HarcamaPusulasiProps) {
  const formattedTutar = data.tutar ? `${data.tutar} ₺` : "-";
  const formattedBirimFiyat = data.birimFiyat ? `${data.birimFiyat} ₺` : "-";

  return (
    <DocumentLayout
      data={data as any}
      hideFooter={false}
      pageSize={pageSize}
      orientation={orientation}
      pageNumber={1}
      totalPages={1}
    >
      <div style={{ width: "100%", fontSize: "10.5pt", color: "#000", fontFamily: "'Times New Roman', Times, serif" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #000",
            marginBottom: "12px",
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
                  fontSize: "13pt",
                  textTransform: "uppercase",
                  padding: "10px",
                  backgroundColor: "#fff",
                }}
              >
                HARCAMA PUSULASI
              </th>
            </tr>

            {/* Sayı and Tarih */}
            <tr>
              <td style={{ border: "1px solid #000", width: "50%", fontWeight: "bold", padding: "6px 8px" }}>
                Sayı: <EditableField name="evrakSayisi" value={data.evrakSayisi} placeholder="E-00000000-934.01-0001" />
              </td>
              <td style={{ border: "1px solid #000", width: "50%", fontWeight: "bold", textAlign: "right", padding: "6px 8px" }}>
                Tarih: <DateEditableField name="tarih" value={data.tarih} placeholder="GG.AA.YYYY" />
              </td>
            </tr>

            {/* Dairesi */}
            <tr>
              <td style={{ border: "1px solid #000", width: "30%", fontWeight: "bold", textTransform: "uppercase", padding: "6px 8px" }}>
                Dairesi
              </td>
              <td style={{ border: "1px solid #000", width: "70%", fontWeight: "bold", padding: "6px 8px" }}>
                {data.idareAdi || (data.antetSatirlari && data.antetSatirlari[1]) || "KURUM / BİRİM ADI"}
              </td>
            </tr>

            {/* Section Header */}
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
                SATIN ALINAN MAL VEYA HİZMETİN
              </td>
            </tr>

            {/* Çeşidi */}
            <tr>
              <td style={{ border: "1px solid #000", width: "30%", fontWeight: "bold", textTransform: "uppercase", padding: "6px 8px" }}>
                Çeşidi
              </td>
              <td style={{ border: "1px solid #000", width: "70%", padding: "6px 8px" }}>
                <EditableField name="alimTuru" value={data.alimTuru} placeholder="Alım Türü" />
                {" "}
                (<EditableField name="isAdi" value={data.isAdi} placeholder="İşin Adı" />)
              </td>
            </tr>

            {/* Miktarı */}
            <tr>
              <td style={{ border: "1px solid #000", width: "30%", fontWeight: "bold", textTransform: "uppercase", padding: "6px 8px" }}>
                Miktarı
              </td>
              <td style={{ border: "1px solid #000", width: "70%", padding: "6px 8px" }}>
                <EditableField name="miktar" value={data.miktar} placeholder="Miktar" />
              </td>
            </tr>

            {/* Birim Fiyat */}
            <tr>
              <td style={{ border: "1px solid #000", width: "30%", fontWeight: "bold", textTransform: "uppercase", padding: "6px 8px" }}>
                Birim Fiyatı
              </td>
              <td style={{ border: "1px solid #000", width: "70%", padding: "6px 8px" }}>
                <EditableField name="birimFiyat" value={data.birimFiyat ? String(data.birimFiyat) : ""} placeholder="Birim Fiyat" /> ₺
              </td>
            </tr>

            {/* Tutarı */}
            <tr>
              <td style={{ border: "1px solid #000", width: "30%", fontWeight: "bold", textTransform: "uppercase", padding: "6px 8px" }}>
                Tutarı
              </td>
              <td style={{ border: "1px solid #000", width: "70%", fontWeight: "bold", padding: "6px 8px" }}>
                <EditableField name="tutar" value={data.tutar ? String(data.tutar) : ""} placeholder="Tutar" /> ₺
              </td>
            </tr>

            {/* Yalnız (Yazı ile) */}
            <tr>
              <td
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  fontWeight: "bold",
                  fontStyle: "italic",
                  fontSize: "11pt",
                  padding: "10px",
                }}
              >
                Yalnız <EditableField name="tutarYazi" value={data.tutarYazi} placeholder="(yazı ile tutar)" /> TL.sıdır.
              </td>
            </tr>

            {/* Açıklama */}
            <tr>
              <td
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  padding: "8px 10px",
                  textAlign: "justify",
                }}
              >
                <strong>Açıklama:</strong>
                <div style={{ marginTop: "6px", textIndent: "20px" }}>
                  <EditableField
                    name="aciklama"
                    value={data.aciklama}
                    multiline
                    placeholder="Açıklama giriniz..."
                  />
                </div>
              </td>
            </tr>

            {/* Tarih and Signatures Inner Block */}
            <tr>
              <td colSpan={2} style={{ border: "1px solid #000", padding: "10px" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "15px",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          border: "1px solid #000",
                          textAlign: "center",
                          fontWeight: "bold",
                          backgroundColor: "#fff",
                          padding: "4px",
                          width: "50%",
                        }}
                      >
                        Malı Satan veya Hizmeti Yapanın
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          textAlign: "center",
                          fontWeight: "bold",
                          backgroundColor: "#fff",
                          padding: "4px",
                          width: "50%",
                        }}
                      >
                        Satın Almayı veya Hizmeti Yaptıranın
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", height: "120px", lineHeight: 1.5, padding: "10px", verticalAlign: "top" }}>
                        <div>
                          <strong>T.C. Kimlik No :</strong>{" "}
                          <EditableField name="saticiTcNo" value={data.saticiTcNo} placeholder="TC Kimlik No" />
                        </div>
                        <div style={{ marginTop: "4px" }}>
                          <strong>Adı Soyadı :</strong>{" "}
                          <EditableField name="saticiAdiSoyadi" value={data.saticiAdiSoyadi} placeholder="Satıcı Adı Soyadı" />
                        </div>
                        <div style={{ marginTop: "4px" }}>
                          <strong>Adresi :</strong>{" "}
                          <EditableField name="saticiAdres" value={data.saticiAdres} placeholder="Satıcı Adresi" />
                        </div>
                        <div style={{ marginTop: "15px", fontStyle: "italic", color: "#888" }}>(İmza)</div>
                      </td>
                      <td style={{ border: "1px solid #000", textAlign: "center", verticalAlign: "top", height: "120px", padding: "10px" }}>
                        <div style={{ marginBottom: "8px", fontWeight: "bold", fontSize: "9.5pt", color: "#555" }}>
                          Harcama Yetkilisi
                        </div>
                        <PersonelCard
                          adSoyad={data.onaylayanPersonelAdi}
                          unvan={data.onaylayanPersonelUnvan}
                          nameField="onaylayanPersonelAdi"
                          unvanField="onaylayanPersonelUnvan"
                          placeholderName="Onaylayan Adı Soyadı"
                          placeholderUnvan="Unvanı"
                          marginTop={5}
                          marginBottom={0}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ fontSize: "8.5pt", color: "#333", textAlign: "justify", marginTop: "15px", lineHeight: 1.35 }}>
                  <strong>Not:</strong> Bu belge, fatura veya fatura yerine geçen belgeleri düzenleme
                  zorunluluğu bulunmayan kişilerden yapılan iş, mal veya hizmet alımlarında düzenlenir.
                  Taksi ile yapılan seyahatlerde (şehir içi taksi ücretleri hariç) seyahat edilen
                  taksinin plaka numarası ile yolculuğun nereden nereye yapıldığı açıklama bölümünde
                  belirtilir.
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocumentLayout>
  );
}
