import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import {
  ApprovalSignature,
  DateEditableField,
  EditableOlurPlaceholder,
} from "../../document/ApprovalSignature";
import { PiyasaFiyatArastirmaTutanagiData } from "./PiyasaFiyatArastirmaTutanagi.schema";

interface Props {
  data?: Partial<PiyasaFiyatArastirmaTutanagiData> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
}

export const PiyasaFiyatArastirmaTutanagi: React.FC<Props> = ({
  data = {},
  pageSize = "A4",
  orientation = "landscape",
}) => {
  const {
    idareAdi,
    kurumAdi,
    dosyaTarihi = "",
    evrakSayisi = "",
    tarih = "",
    firmalar = [],
    ihtiyacKalemleri = [],
    firmaToplamlariDetay = [],
    genelToplam = "",
    aciklama,
    komisyon = [],
    baskanAdi = "",
    baskanUnvan = "",
  } = data || {};

  const isAdi = data?.isAdi || data?.isinAdi || data?.dosyaKonusu ||
    data?.konu || "";

  const turLower = String(
    data?.alimTuru || data?.tur || data?.ihale_tipi || "",
  ).toLowerCase();
  const isBasligi = turLower.includes("hizmet")
    ? "Alınan Hizmetin Adı, Niteliği:"
    : turLower.includes("yapı") || turLower.includes("yapim")
    ? "Yapılan İşin Adı, Niteliği:"
    : turLower.includes("mal")
    ? "Alınan Malın Adı, Niteliği:"
    : "Yapılan İş / Mal / Hizmetin Adı, Niteliği:";

  // Tablo 2: Alım Yapılması Uygun Görülen Kişiler için en düşük teklifi veren firmanın dinamik tespiti
  const processedKalemler = (ihtiyacKalemleri || []).map((kalem) => {
    let enUygunFirmaAdi = kalem.enUygunFirmaAdi || "";
    let enDusukFiyat = kalem.enDusukFiyat;
    let kalemToplamBedel = kalem.toplamBedel;

    if (
      !enUygunFirmaAdi &&
      kalem.firmaTeklifleriDetay &&
      kalem.firmaTeklifleriDetay.length > 0
    ) {
      let minTutar = Infinity;
      let minIdx = -1;

      kalem.firmaTeklifleriDetay.forEach((tf, idx) => {
        const valStr = String(tf.birimFiyat || tf.tutar || "");
        const numPrice = typeof tf.birimFiyat === "number"
          ? tf.birimFiyat
          : parseFloat(valStr.replace(/[^0-9.,]/g, "").replace(",", "."));

        if (!isNaN(numPrice) && numPrice > 0 && numPrice < minTutar) {
          minTutar = numPrice;
          minIdx = idx;
        }
      });

      if (minIdx !== -1 && firmalar[minIdx]) {
        enUygunFirmaAdi = firmalar[minIdx].unvan || `Firma ${minIdx + 1}`;
        const tf = kalem.firmaTeklifleriDetay[minIdx];
        if (!enDusukFiyat) enDusukFiyat = tf.birimFiyat;
        if (!kalemToplamBedel) kalemToplamBedel = tf.tutar;
      }
    }

    return {
      ...kalem,
      enUygunFirmaAdi: enUygunFirmaAdi || "-",
      enDusukFiyat: enDusukFiyat ?? "-",
      toplamBedel: kalemToplamBedel ?? "-",
    };
  });

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
          fontFamily: "'Times New Roman', Times, serif",
          fontSize: "9.5pt",
          color: "#000",
          lineHeight: 1.35,
          width: "100%",
        }}
      >
        {/* BAŞLIK VE META BİLGİLER */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            textDecoration: "underline",
            marginBottom: "12px",
            fontSize: "11.5pt",
            textTransform: "uppercase",
          }}
        >
          PİYASA FİYAT ARAŞTIRMA TUTANAĞI
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "10px",
            fontSize: "9.5pt",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  textAlign: "left",
                  width: "70%",
                  verticalAlign: "top",
                }}
              >
                <strong>İdarenin Adı:</strong>{" "}
                <EditableField
                  name="idareAdi"
                  value={idareAdi || kurumAdi || ""}
                  placeholder="İdare Adı"
                />
                <br />
                <strong>{isBasligi}</strong>{" "}
                <EditableField
                  name="isAdi"
                  value={isAdi}
                  placeholder="İşin Adı"
                />
                <br />
                <strong>
                  Onay Belgesi Tarihi:
                </strong>{" "}
                <DateEditableField name="dosyaTarihi" value={dosyaTarihi} />
                <br />
                <strong>
                  Sayı:
                </strong>{" "}
                <EditableField name="evrakSayisi" value={evrakSayisi} />
              </td>
              <td
                style={{
                  textAlign: "right",
                  width: "30%",
                  verticalAlign: "top",
                }}
              >
                <strong>Düzenleme Tarihi:</strong>{" "}
                <DateEditableField name="tarih" value={tarih} />
              </td>
            </tr>
          </tbody>
        </table>

        {/* TABLO 1: FİYAT TEKLİFLERİ */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            margin: "10px 0 5px 0",
            fontSize: "9.5pt",
            textTransform: "uppercase",
            backgroundColor: "#f2f2f2",
            border: "1px solid #000",
            padding: "3px 0",
          }}
        >
          GERÇEK / TÜZEL KİŞİLERİN FİYAT TEKLİFLERİ
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "8px",
            fontSize: "8.5pt",
          }}
        >
          <thead>
            <tr>
              <th
                rowSpan={2}
                style={{
                  border: "1px solid #000",
                  padding: "4px",
                  width: "4%",
                  textAlign: "center",
                  backgroundColor: "#f2f2f2",
                  fontWeight: "bold",
                }}
              >
                Sıra No
              </th>
              <th
                rowSpan={2}
                style={{
                  border: "1px solid #000",
                  padding: "4px",
                  width: "20%",
                  textAlign: "center",
                  backgroundColor: "#f2f2f2",
                  fontWeight: "bold",
                }}
              >
                Mal / Hizmet / Yapım İşi
              </th>
              <th
                rowSpan={2}
                style={{
                  border: "1px solid #000",
                  padding: "4px",
                  width: "22%",
                  textAlign: "center",
                  backgroundColor: "#f2f2f2",
                  fontWeight: "bold",
                }}
              >
                Özelliği
              </th>
              <th
                rowSpan={2}
                style={{
                  border: "1px solid #000",
                  padding: "4px",
                  width: "6%",
                  textAlign: "center",
                  backgroundColor: "#f2f2f2",
                  fontWeight: "bold",
                }}
              >
                Birim
              </th>
              <th
                rowSpan={2}
                style={{
                  border: "1px solid #000",
                  padding: "4px",
                  width: "6%",
                  textAlign: "center",
                  backgroundColor: "#f2f2f2",
                  fontWeight: "bold",
                }}
              >
                Miktar
              </th>
              {firmalar.map((f, idx) => (
                <th
                  key={idx}
                  colSpan={2}
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "center",
                    backgroundColor: "#f2f2f2",
                    fontWeight: "bold",
                  }}
                >
                  {f.unvan || `Firma ${idx + 1}`}
                </th>
              ))}
            </tr>
            <tr>
              {firmalar.map((_, idx) => (
                <React.Fragment key={idx}>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "4px",
                      textAlign: "center",
                      backgroundColor: "#f2f2f2",
                      fontWeight: "bold",
                    }}
                  >
                    B.Fiyat
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "4px",
                      textAlign: "center",
                      backgroundColor: "#f2f2f2",
                      fontWeight: "bold",
                    }}
                  >
                    Tutar
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {ihtiyacKalemleri.map((kalem, idx) => (
              <tr key={idx}>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "center",
                  }}
                >
                  {kalem.siraNo ?? idx + 1}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "left",
                  }}
                >
                  {kalem.malzemeAdi}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "left",
                  }}
                >
                  {kalem.ozelligi}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "center",
                  }}
                >
                  {kalem.birimi}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "center",
                  }}
                >
                  {kalem.miktar}
                </td>
                {(kalem.firmaTeklifleriDetay || []).map((tf, fIdx) => (
                  <React.Fragment key={fIdx}>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tf.birimFiyat}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tf.tutar}
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            ))}

            {ihtiyacKalemleri.length > 0 && (
              <tr style={{ fontWeight: "bold", backgroundColor: "#fafafa" }}>
                <td
                  colSpan={5}
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "right",
                  }}
                >
                  Toplam Tutar :
                </td>
                {firmaToplamlariDetay.map((ft, idx) => (
                  <React.Fragment key={idx}>
                    <td style={{ border: "1px solid #000", padding: "4px" }}>
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ft.toplam}
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            )}
          </tbody>
        </table>

        {/* TABLO 2: UYGUN GÖRÜLEN KİŞİLER */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            margin: "10px 0 5px 0",
            fontSize: "9.5pt",
            textTransform: "uppercase",
            backgroundColor: "#f2f2f2",
            border: "1px solid #000",
            padding: "3px 0",
          }}
        >
          ALIM YAPILMASI UYGUN GÖRÜLEN GERÇEK / TÜZEL KİŞİLER
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "8px",
            fontSize: "8.5pt",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px",
                  width: "4%",
                  textAlign: "center",
                  backgroundColor: "#f2f2f2",
                  fontWeight: "bold",
                }}
              >
                Sıra No
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px",
                  width: "20%",
                  textAlign: "center",
                  backgroundColor: "#f2f2f2",
                  fontWeight: "bold",
                }}
              >
                Mal / Hizmet / Yapım İşi
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px",
                  width: "22%",
                  textAlign: "center",
                  backgroundColor: "#f2f2f2",
                  fontWeight: "bold",
                }}
              >
                Özelliği
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px",
                  width: "6%",
                  textAlign: "center",
                  backgroundColor: "#f2f2f2",
                  fontWeight: "bold",
                }}
              >
                Birim
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px",
                  width: "6%",
                  textAlign: "center",
                  backgroundColor: "#f2f2f2",
                  fontWeight: "bold",
                }}
              >
                Miktar
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px",
                  width: "25%",
                  textAlign: "center",
                  backgroundColor: "#f2f2f2",
                  fontWeight: "bold",
                }}
              >
                Gerçek/Tüzel Kişinin Adı-Adresi
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px",
                  width: "8%",
                  textAlign: "center",
                  backgroundColor: "#f2f2f2",
                  fontWeight: "bold",
                }}
              >
                Teklif Fiyatı
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "4px",
                  width: "9%",
                  textAlign: "center",
                  backgroundColor: "#f2f2f2",
                  fontWeight: "bold",
                }}
              >
                Tutarı
              </th>
            </tr>
          </thead>
          <tbody>
            {processedKalemler.map((kalem, idx) => (
              <tr key={idx}>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "center",
                  }}
                >
                  {kalem.siraNo ?? idx + 1}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "left",
                  }}
                >
                  {kalem.malzemeAdi}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "left",
                  }}
                >
                  {kalem.ozelligi}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "center",
                  }}
                >
                  {kalem.birimi}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "center",
                  }}
                >
                  {kalem.miktar}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "left",
                  }}
                >
                  {kalem.enUygunFirmaAdi}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  {kalem.enDusukFiyat}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  {kalem.toplamBedel}
                </td>
              </tr>
            ))}

            {processedKalemler.length > 0 && (
              <tr style={{ fontWeight: "bold", backgroundColor: "#fafafa" }}>
                <td
                  colSpan={6}
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "right",
                  }}
                >
                  Toplam Tutar :
                </td>
                <td style={{ border: "1px solid #000", padding: "4px" }}></td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  {genelToplam}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ fontSize: "8.5pt", marginBottom: "8px" }}>
          Para Birimi TL.
        </div>

        <div
          style={{
            fontSize: "9pt",
            textAlign: "justify",
            textIndent: "40px",
            marginTop: "10px",
          }}
        >
          4734 sayılı Kamu İhale Kanununun 22/d* maddesi uyarınca yapılacak
          alımlara ilişkin yapılan piyasa araştırmasında gerçek/tüzel kişilerce
          teklif edilen fiyatlar tarafımızca değerlendirilerek yukarıda adı ve
          adresi belirtilen gerçek/tüzel kişilerden alım yapılması uygun
          görülmüştür.
        </div>

        {aciklama && (
          <div
            style={{
              border: "1px solid #000",
              padding: "8px",
              minHeight: "80px",
              marginTop: "10px",
              fontSize: "9pt",
              boxSizing: "border-box",
              whiteSpace: "pre-wrap",
            }}
          >
            <strong>Açıklama:</strong>{" "}
            <EditableField name="aciklama" value={aciklama} multiline />
          </div>
        )}

        {/* GÖREVLİLER */}
        <div
          style={{
            marginTop: "15px",
            textAlign: "center",
            pageBreakInside: "avoid",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              fontSize: "9.5pt",
              marginBottom: "15px",
            }}
          >
            Piyasa Fiyat Araştırması Görevlisi / Görevlileri
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              flexWrap: "wrap",
              textAlign: "center",
            }}
          >
            {komisyon.map((uye, idx) => (
              <div
                key={idx}
                style={{
                  width: "22%",
                  minWidth: "120px",
                  padding: "5px",
                  fontSize: "9pt",
                  lineHeight: 1.35,
                }}
              >
                <span
                  style={{ fontWeight: "bold", textTransform: "uppercase" }}
                >
                  <EditableField
                    name={`komisyon.${idx}.adSoyad`}
                    value={uye.adSoyad || ""}
                    placeholder="Adı Soyadı"
                  />
                </span>
                <br />
                <span>
                  <EditableField
                    name={`komisyon.${idx}.unvan`}
                    value={uye.unvan || ""}
                    placeholder="Unvanı"
                  />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* HARCAMA YETKİLİSİ ONAYI (OLUR) */}
        {data.olurYazisi !== false
          ? (
            <ApprovalSignature
              title="OLUR"
              date={dosyaTarihi || tarih}
              dateField="dosyaTarihi"
              adSoyad={baskanAdi}
              unvan={baskanUnvan}
              nameField="baskanAdi"
              unvanField="baskanUnvan"
              showSpace={true}
              marginTop={25}
            />
          )
          : <EditableOlurPlaceholder />}
      </div>
    </DocumentLayout>
  );
};
