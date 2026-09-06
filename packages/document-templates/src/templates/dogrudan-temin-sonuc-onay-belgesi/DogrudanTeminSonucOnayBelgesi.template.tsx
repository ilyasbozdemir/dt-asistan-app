import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import { DogrudanTeminSonucOnayBelgesiType } from "./DogrudanTeminSonucOnayBelgesi.schema";

interface DogrudanTeminSonucOnayBelgesiProps {
  data?: Partial<DogrudanTeminSonucOnayBelgesiType> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
}

export function DogrudanTeminSonucOnayBelgesi({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
}: DogrudanTeminSonucOnayBelgesiProps) {
  const teklifler = data.teklifler || [];
  const uygunGorulenler = data.uygunGorulenler || [];
  const idareAdi =
    data.idareAdi ||
    data.kurumAdi ||
    (data.antetSatirlari && data.antetSatirlari[1]) ||
    "İDARE ADI";
  const vmakamina =
    data.vmakamina ||
    data.makam ||
    "HARCAMA YETKİLİSİ MAKAMINA";

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
          fontSize: "10.5pt",
          color: "#000",
          fontFamily: "'Times New Roman', Times, serif",
          lineHeight: 1.4,
        }}
      >
        {/* MAIN TITLE */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "12.5pt",
            marginBottom: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          DOĞRUDAN TEMİN SONUÇ ONAY BELGESİ
        </div>

        {/* FIRST TABLE (İdare Bilgileri) */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "8px",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontSize: "9.5pt",
                  width: "38%",
                  fontWeight: "bold",
                }}
              >
                ALIMI YAPAN İDARENİN ADI
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontSize: "9.5pt",
                  width: "62%",
                }}
              >
                <EditableField name="idareAdi" value={idareAdi} placeholder="İdare Adı" />
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontSize: "9.5pt",
                  fontWeight: "bold",
                }}
              >
                BELGE TARİH VE SAYISI
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontSize: "9.5pt",
                }}
              >
                <EditableField
                  name="dosyaTarihi"
                  value={data.dosyaTarihi || data.tarih}
                  placeholder="GG.AA.YYYY"
                />
                {" \u00A0\u00A0\u00A0\u00A0 - \u00A0\u00A0\u00A0\u00A0 "}
                <EditableField
                  name="evrakSayisi"
                  value={data.evrakSayisi}
                  placeholder="Evrak Sayısı"
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* CENTERED IDARE / MAKAM BOX */}
        <div
          style={{
            border: "1px solid #000",
            textAlign: "center",
            fontWeight: "bold",
            padding: "5px",
            margin: "8px 0",
            textTransform: "uppercase",
            fontSize: "10pt",
          }}
        >
          <EditableField name="vmakamina" value={vmakamina} placeholder="Makam Adı" />
        </div>

        {/* SECOND SECTION: BILGILER */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "10pt",
            margin: "12px 0 6px 0",
            textTransform: "uppercase",
          }}
        >
          DOĞRUDAN TEMİN İLE İLGİLİ BİLGİLER
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "8px",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontSize: "9.5pt",
                  width: "38%",
                  fontWeight: "bold",
                }}
              >
                İşin Adı
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontSize: "9.5pt",
                  fontWeight: "bold",
                }}
              >
                <EditableField
                  name="isAdi"
                  value={data.isAdi || data.dosyaKonusu}
                  placeholder="İşin Adı"
                />
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontSize: "9.5pt",
                  fontWeight: "bold",
                }}
              >
                Temin Şekli
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontSize: "9.5pt",
                }}
              >
                <EditableField
                  name="teminSekli"
                  value={data.teminSekli || "4734 Sayılı K.İ.K. Madde 22/d"}
                  placeholder="Temin Usulü"
                />
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontSize: "9.5pt",
                  fontWeight: "bold",
                }}
              >
                İşin Türü
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontSize: "9.5pt",
                }}
              >
                <EditableField
                  name="alimTuru"
                  value={data.alimTuru || data.teklifSozlesmeTuru || "Mal Alımı"}
                  placeholder="Alım Türü"
                />
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontSize: "9.5pt",
                  fontWeight: "bold",
                }}
              >
                Yaklaşık Maliyet
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  fontSize: "9.5pt",
                  fontWeight: "bold",
                }}
              >
                <EditableField
                  name="yaklasikMaliyet"
                  value={data.yaklasikMaliyet ? `${data.yaklasikMaliyet} ₺` : "-"}
                  placeholder="0,00 ₺"
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* THIRD SECTION: DIĞER AÇIKLAMALAR */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "10pt",
            margin: "12px 0 6px 0",
            textTransform: "uppercase",
          }}
        >
          DOĞRUDAN TEMİN İLE İLGİLİ DİĞER AÇIKLAMALAR
        </div>
        <div
          style={{
            border: "1px solid #000",
            minHeight: "50px",
            padding: "6px 8px",
            fontSize: "9.5pt",
            textAlign: "justify",
            marginBottom: "10px",
          }}
        >
          <EditableField
            name="isinAciklamasi"
            value={
              data.isinAciklamasi ||
              "Yukarıda belirtilen ihtiyacın karşılanması amacıyla 4734 sayılı Kamu İhale Kanununun 22/d maddesi uyarınca piyasa fiyat araştırması yapılmış ve en uygun teklifi veren istekli üzerine alım yapılması kararlaştırılmıştır."
            }
            placeholder="Açıklama giriniz..."
            multiline
          />
        </div>

        {/* FOURTH SECTION: TEKLİF VEREN FİRMALAR */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "10pt",
            margin: "12px 0 6px 0",
            textTransform: "uppercase",
          }}
        >
          TEKLİF VEREN GERÇEK / TÜZEL KİŞİLER
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "10px",
            fontSize: "9pt",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={{ border: "1px solid #000", padding: "5px 6px", textAlign: "left", width: "45%" }}>
                Gerçek/Tüzel Kişinin Adı/Unvanı
              </th>
              <th style={{ border: "1px solid #000", padding: "5px 6px", textAlign: "right", width: "20%" }}>
                Teklif Ettiği Fiyat (₺)
              </th>
              <th style={{ border: "1px solid #000", padding: "5px 6px", textAlign: "center", width: "18%" }}>
                Fiyat Araştırmasında Dikkate Alındı mı
              </th>
              <th style={{ border: "1px solid #000", padding: "5px 6px", textAlign: "center", width: "17%" }}>
                Açıklama
              </th>
            </tr>
          </thead>
          <tbody>
            {teklifler.length > 0 ? (
              teklifler.map((t: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ border: "1px solid #000", padding: "4px 6px" }}>{t.unvan || "-"}</td>
                  <td style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right", fontWeight: "bold" }}>
                    {t.fiyat ? `${t.fiyat} ₺` : "-"}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "center" }}>
                    {t.uygunMu || "Evet"}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "center" }}>
                    {t.aciklama || (idx === 0 ? "En Avantajlı Teklif" : "Geçerli Teklif")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ border: "1px solid #000", padding: "6px", textAlign: "center", color: "#666" }}>
                  Teklif bilgisi bulunmamaktadır.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* FIFTH SECTION: ALIM YAPILMASI UYGUN GÖRÜLEN FİRMALAR */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "10pt",
            margin: "12px 0 6px 0",
            textTransform: "uppercase",
          }}
        >
          ALIM YAPILMASI UYGUN GÖRÜLEN GERÇEK / TÜZEL KİŞİLER
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "12px",
            fontSize: "9pt",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={{ border: "1px solid #000", padding: "5px 6px", textAlign: "left", width: "45%" }}>
                Gerçek/Tüzel Kişinin Adı
              </th>
              <th style={{ border: "1px solid #000", padding: "5px 6px", textAlign: "left", width: "35%" }}>
                Gerçek/Tüzel Kişinin Adresi
              </th>
              <th style={{ border: "1px solid #000", padding: "5px 6px", textAlign: "right", width: "20%" }}>
                Teklif Ettiği Fiyat (₺)
              </th>
            </tr>
          </thead>
          <tbody>
            {uygunGorulenler.length > 0 ? (
              uygunGorulenler.map((u: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ border: "1px solid #000", padding: "4px 6px", fontWeight: "bold" }}>
                    {u.unvan || data.yukleniciFirma || "-"}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
                    {u.adres || data.yukleniciAdresi || "-"}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right", fontWeight: "bold" }}>
                    {u.fiyat ? `${u.fiyat} ₺` : data.genelToplam ? `${data.genelToplam} ₺` : "-"}
                  </td>
                </tr>
              ))
            ) : data.yukleniciFirma ? (
              <tr>
                <td style={{ border: "1px solid #000", padding: "4px 6px", fontWeight: "bold" }}>
                  {data.yukleniciFirma}
                </td>
                <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
                  {data.yukleniciAdresi || "-"}
                </td>
                <td style={{ border: "1px solid #000", padding: "4px 6px", textAlign: "right", fontWeight: "bold" }}>
                  {data.genelToplam ? `${data.genelToplam} ₺` : "-"}
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={3} style={{ border: "1px solid #000", padding: "6px", textAlign: "center", color: "#666" }}>
                  Alım yapılması uygun görülen kişi bulunmamaktadır.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* SIXTH SECTION: ONAY */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "10pt",
            margin: "14px 0 6px 0",
            textTransform: "uppercase",
          }}
        >
          ONAY
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #000",
            pageBreakInside: "avoid",
          }}
        >
          <tbody>
            <tr>
              {/* LEFT COLUMN (Arz Eden) */}
              <td
                style={{
                  border: "1px solid #000",
                  padding: "10px",
                  width: "50%",
                  verticalAlign: "top",
                  textAlign: "center",
                  fontSize: "9.5pt",
                }}
              >
                <div
                  style={{
                    textAlign: "justify",
                    marginBottom: "20px",
                    textIndent: "15px",
                    lineHeight: 1.35,
                  }}
                >
                  Belirtilen işin, yukarıda alım yapılması uygun görülen gerçek/tüzel kişilerden
                  doğrudan temin yoluyla satın alınması hususunda onaylarınızı arz ederim.
                </div>
                <div style={{ marginTop: "25px", textAlign: "center" }}>
                  <div>{data.vonayasunustarihi || data.dosyaTarihi || data.tarih || ""}</div>
                  <div style={{ marginTop: "20px", fontWeight: "bold" }}>
                    <EditableField
                      name="hazirlayanPersonelAdi"
                      value={data.hazirlayanPersonelAdi || data.piyasaGorevlisi1Adi}
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div style={{ fontSize: "9pt", color: "#333" }}>
                    <EditableField
                      name="hazirlayanPersonelUnvan"
                      value={data.hazirlayanPersonelUnvan || data.piyasaGorevlisi1Unvani || "Görevli"}
                      placeholder="Ünvan"
                    />
                  </div>
                </div>
              </td>

              {/* RIGHT COLUMN (Onaylayan) */}
              <td
                style={{
                  border: "1px solid #000",
                  padding: "10px",
                  width: "50%",
                  verticalAlign: "top",
                  textAlign: "center",
                  fontSize: "9.5pt",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "20px" }}>UYGUNDUR</div>
                <div style={{ marginTop: "25px", textAlign: "center" }}>
                  <div>{data.vonaytarihi || data.dosyaTarihi || data.tarih || ""}</div>
                  <div style={{ marginTop: "20px", fontWeight: "bold" }}>
                    <EditableField
                      name="onaylayanPersonelAdi"
                      value={data.onaylayanPersonelAdi || data.baskanAdi}
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div style={{ fontSize: "9pt", color: "#333" }}>
                    <EditableField
                      name="onaylayanPersonelUnvan"
                      value={data.onaylayanPersonelUnvan || data.baskanUnvan || "Harcama Yetkilisi"}
                      placeholder="Ünvan"
                    />
                  </div>
                  <div style={{ fontSize: "8.5pt", color: "#555", marginTop: "2px" }}>
                    Harcama Yetkilisi
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocumentLayout>
  );
}
