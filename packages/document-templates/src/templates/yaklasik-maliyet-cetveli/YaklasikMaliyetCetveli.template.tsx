import React from "react";
import { EditableField } from "../../document/EditableField";
import { TableRowSplitDivider } from "../../document/TableRowSplitDivider";
import { YaklasikMaliyetCetveliData } from "./YaklasikMaliyetCetveli.schema";


interface Props {
  data?: Partial<YaklasikMaliyetCetveliData> & Record<string, any>;
}

export const YaklasikMaliyetCetveli: React.FC<Props> = ({ data }) => {
  const {
    solLogo,
    sagLogo,
    kurumAdi = "",
    mudurluk = "",
    isAdi = "",
    tarih = "",
    firmalar = [],
    ihtiyacKalemleri = [],
    firmaToplamlari = [],
    genelToplam = "",
    komisyon = [],
  } = data || {};

  const displayFirmalar = (firmalar && firmalar.length > 0)
    ? firmalar
    : (data?.firmaListesi && data.firmaListesi.length > 0)
    ? data.firmaListesi
    : [];

  const displayKomisyon = (komisyon && komisyon.length > 0)
    ? komisyon
    : (data?.fiyatKomisyonu && data.fiyatKomisyonu.length > 0)
    ? data.fiyatKomisyonu
    : (data?.gorevlendirilenler && data.gorevlendirilenler.length > 0)
    ? data.gorevlendirilenler
    : (data?.komisyonUyeleri && data.komisyonUyeleri.length > 0)
    ? data.komisyonUyeleri
    : [];

  const displayFirmaToplamlari = (firmaToplamlari && firmaToplamlari.length > 0)
    ? firmaToplamlari
    : (data?.firmaToplamlariDetay && data.firmaToplamlariDetay.length > 0)
    ? data.firmaToplamlariDetay
    : displayFirmalar.map((f: any) => ({
      toplam: f.total
        ? f.total.toLocaleString("tr-TR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        : "0,00",
    }));

  const firmalarColspan = Math.max(displayFirmalar.length, 1);

  return (
    <div
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: "10pt",
        lineHeight: 1.4,
        color: "#000",
        backgroundColor: "#fff",
        padding: "1.5cm 1.2cm",
        width: "100%",
        maxWidth: "29.7cm",
        minHeight: "21cm",
        boxSizing: "border-box",
        margin: "0 auto",
      }}
    >
      {/* ANTET */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "center",
          lineHeight: 1.3,
          marginBottom: "20px",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{ width: "90px", textAlign: "left", verticalAlign: "top" }}
            >
              {solLogo && (
                <img
                  src={solLogo}
                  alt="Sol Logo"
                  style={{
                    maxWidth: "80px",
                    maxHeight: "80px",
                    objectFit: "contain",
                  }}
                />
              )}
            </td>

            <td
              style={{
                textAlign: "center",
                verticalAlign: "top",
                padding: "5px",
              }}
            >
              <div style={{ fontWeight: "bold", fontSize: "12pt" }}>T.C.</div>
              <div style={{ fontWeight: "bold", fontSize: "12pt" }}>
                {kurumAdi || "BELEDİYE BAŞKANLIĞI"}
              </div>
              {mudurluk && (
                <div style={{ fontWeight: "bold", fontSize: "11pt" }}>
                  {mudurluk}
                </div>
              )}
            </td>

            <td
              style={{
                width: "90px",
                textAlign: "right",
                verticalAlign: "top",
              }}
            >
              {sagLogo && (
                <img
                  src={sagLogo}
                  alt="Sağ Logo"
                  style={{
                    maxWidth: "80px",
                    maxHeight: "80px",
                    objectFit: "contain",
                  }}
                />
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* BAŞLIK */}
      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          textDecoration: "underline",
          margin: "15px 0",
          fontSize: "12pt",
          textTransform: "uppercase",
        }}
      >
        YAKLAŞIK MALİYET HESAP CETVELİ
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "10px",
          fontSize: "10pt",
        }}
      >
        <tbody>
          <tr>
            <td style={{ textAlign: "left", width: "70%" }}>
              <strong>İşin Adı:</strong> {isAdi}
            </td>
            <td style={{ textAlign: "right", width: "30%" }}>
              <strong>Düzenleme Tarihi :</strong> {tarih}
            </td>
          </tr>
        </tbody>
      </table>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "10px",
          marginBottom: "15px",
          fontSize: "9pt",
        }}
      >
        <thead>
          <tr>
            <th
              colSpan={5}
              style={{
                border: "1px solid #000",
                padding: "6px 4px",
                textAlign: "center",
                fontWeight: "normal",
                backgroundColor: "#fff",
              }}
            >
              Talep Edilen Mal/Hizmet
            </th>
            <th
              colSpan={firmalarColspan}
              style={{
                border: "1px solid #000",
                padding: "6px 4px",
                textAlign: "center",
                fontWeight: "normal",
                backgroundColor: "#fff",
              }}
            >
              Alınan Fiyatlar
            </th>
            <th
              colSpan={2}
              style={{
                border: "1px solid #000",
                padding: "6px 4px",
                textAlign: "center",
                fontWeight: "normal",
                backgroundColor: "#fff",
              }}
            >
              Hesaplanan Maliyet
            </th>
          </tr>
          <tr>
            <th
              style={{
                border: "1px solid #000",
                padding: "6px 4px",
                width: "4%",
                textAlign: "center",
                fontWeight: "normal",
              }}
            >
              Sıra No
            </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "6px 4px",
                width: "25%",
                textAlign: "center",
                fontWeight: "normal",
              }}
            >
              Mal / Hizmet Adı
            </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "6px 4px",
                width: "15%",
                textAlign: "center",
                fontWeight: "normal",
              }}
            >
              Özelliği
            </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "6px 4px",
                width: "7%",
                textAlign: "center",
                fontWeight: "normal",
              }}
            >
              Birim
            </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "6px 4px",
                width: "7%",
                textAlign: "center",
                fontWeight: "normal",
              }}
            >
              Miktarı
            </th>
            {displayFirmalar.map((f: any, idx: number) => (
              <th
                key={idx}
                style={{
                  border: "1px solid #000",
                  padding: "6px 4px",
                  textAlign: "center",
                  fontWeight: "normal",
                  backgroundColor: "#fff",
                }}
              >
                {f.unvan || `Firma ${idx + 1}`}
              </th>
            ))}
            <th
              style={{
                border: "1px solid #000",
                padding: "6px 4px",
                width: "10%",
                textAlign: "center",
                fontWeight: "bold",
                backgroundColor: "#e0e0e0",
              }}
            >
              En Düşük<br />Birim Fiyat
            </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "6px 4px",
                width: "12%",
                textAlign: "center",
                fontWeight: "bold",
                backgroundColor: "#d6d6d6",
              }}
            >
              Toplam Maliyet
            </th>
          </tr>
        </thead>
        <tbody>
          {ihtiyacKalemleri.map((kalem, idx) => {
            const rowNum = idx + 1;
            return (
              <React.Fragment key={idx}>
                <tr>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "6px 4px",
                      textAlign: "center",
                    }}
                  >
                    {kalem.siraNo ?? rowNum}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "6px 4px",
                      textAlign: "left",
                    }}
                  >
                    {kalem.malzemeAdi}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "6px 4px",
                      textAlign: "left",
                    }}
                  >
                    {kalem.ozelligi}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "6px 4px",
                      textAlign: "center",
                    }}
                  >
                    {kalem.birimi}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "6px 4px",
                      textAlign: "center",
                    }}
                  >
                    {kalem.miktar}
                  </td>
                  {(kalem.firmaTeklifleri || []).map((ft, fIdx) => (
                    <td
                      key={fIdx}
                      style={{
                        border: "1px solid #000",
                        padding: "6px 4px",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ft.fiyat}
                    </td>
                  ))}
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "6px 4px",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                      backgroundColor: "#f0f0f0",
                      fontWeight: "bold",
                    }}
                  >
                    {kalem.enDusukFiyat}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "6px 4px",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                      backgroundColor: "#e6e6e6",
                      fontWeight: "bold",
                    }}
                  >
                    {kalem.toplamBedel}
                  </td>
                </tr>
                <TableRowSplitDivider
                  rowIndex={rowNum}
                  colSpan={7 + displayFirmalar.length}
                  currentSplitIndex={data?.firstPageLimit ? Number(data.firstPageLimit) : null}
                />
              </React.Fragment>
            );
          })}


          {ihtiyacKalemleri.length > 0 && (
            <tr style={{ fontWeight: "bold" }}>
              <td
                colSpan={5}
                style={{
                  border: "1px solid #000",
                  padding: "6px 4px",
                  textAlign: "right",
                }}
              >
                Toplam Tutar :
              </td>
              {firmaToplamlari.map((ft, idx) => (
                <td
                  key={idx}
                  style={{
                    border: "1px solid #000",
                    padding: "6px 4px",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ft.toplam}
                </td>
              ))}
              <td
                style={{
                  border: "1px solid #000",
                  padding: "6px 4px",
                  backgroundColor: "#f0f0f0",
                }}
              >
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "6px 4px",
                  textAlign: "right",
                  whiteSpace: "nowrap",
                  backgroundColor: "#e6e6e6",
                  fontWeight: "bold",
                }}
              >
                {genelToplam}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ fontSize: "9pt", marginBottom: "20px" }}>
        Para Birimi <b>TL.</b>
      </div>

      {/* KOMİSYON BÖLÜMÜ */}
      <div style={{ marginTop: "20px", pageBreakInside: "avoid" }}>
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            textDecoration: "underline",
            marginBottom: "10px",
            fontSize: "11pt",
          }}
        >
          Piyasa Fiyat Araştırma Görevlisi/Görevlileri
        </div>
        <div
          style={{
            textAlign: "justify",
            marginBottom: "20px",
            fontSize: "10pt",
            textIndent: "40px",
          }}
        >
          Yapılan fiyat araştırmasına göre, firmaların vermiş olduğu{" "}
          <EditableField
            name="hesaplamaEsasiText"
            value={data?.hesaplamaEsasiText ||
              (String(
                  data?.hesaplamaEsasi ||
                    data?.hesaplama_esasi ||
                    data?.yaklasikMaliyetEsasi ||
                    data?.yaklasik_maliyet_hesaplamasi ||
                    "",
                ).toLowerCase().includes("ortalama")
                ? "birim fiyatların ortalaması"
                : "en düşük fiyatlar")}
          />{" "}
          alınarak maliyet KDV hariç ({genelToplam}) TL olarak tespit
          edilmiştir.
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          {displayKomisyon.map((uye: any, idx: number) => (
            <div
              key={idx}
              style={{
                width: "22%",
                minWidth: "120px",
                padding: "5px",
                fontSize: "9.5pt",
                lineHeight: 1.4,
              }}
            >
              <div style={{ fontWeight: "bold" }}>
                {uye.adSoyad || uye.ad_soyad || uye.ad || "Görevli Üye"}
              </div>
              <div>{uye.unvan || uye.personel_unvan || ""}</div>
              {(uye.gorevi || uye.gorev) && (
                <div style={{ fontSize: "8.5pt", color: "#555" }}>
                  {uye.gorevi || uye.gorev}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* OLUR / ONAY BLOĞU */}
      {(data?.showOlurBlock ?? data?.olurGoster ?? true) && (
        <div style={{ marginTop: "35px", pageBreakInside: "avoid" }}>
          <div style={{ textAlign: "center", width: "260px", margin: "0 auto" }}>
            <div style={{ fontWeight: "bold", fontSize: "11pt", marginBottom: "5px" }}>
              <EditableField
                name="olurBaslik"
                value={data?.olurBaslik || "O L U R"}
              />
            </div>
            <div style={{ fontSize: "9.5pt", marginBottom: "15px" }}>
              <EditableField
                name="olurTarihi"
                value={data?.olurTarihi || data?.tarih || ""}
              />
            </div>
            <div style={{ fontWeight: "bold", fontSize: "10pt" }}>
              <EditableField
                name="baskanAdi"
                value={data?.baskanAdi || data?.onaylayanPersonelAdi || data?.onaylayan_ad_soyad || ""}
              />
            </div>
            <div style={{ fontSize: "9.5pt", color: "#333" }}>
              <EditableField
                name="baskanUnvan"
                value={data?.baskanUnvan || data?.onaylayanPersonelUnvan || data?.onaylayan_unvan || "Harcama Yetkilisi"}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
