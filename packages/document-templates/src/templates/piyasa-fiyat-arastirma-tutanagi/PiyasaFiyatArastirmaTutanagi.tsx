import React from "react";
import { PiyasaFiyatArastirmaTutanagiData } from "./PiyasaFiyatArastirmaTutanagi.schema";

interface Props {
  data: PiyasaFiyatArastirmaTutanagiData;
}

export const PiyasaFiyatArastirmaTutanagi: React.FC<Props> = ({ data }) => {
  const {
    solLogo,
    sagLogo,
    antetSatirlari = [],
    kurumUst,
    kurumAdi,
    mudurluk,
    idareAdi,
    isAdi = "",
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

  return (
    <div
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: "9.5pt",
        color: "#000",
        lineHeight: 1.35,
        backgroundColor: "#fff",
        padding: "1.2cm 1cm",
        width: "100%",
        maxWidth: "29.7cm",
        minHeight: "21cm",
        boxSizing: "border-box",
        margin: "0 auto",
      }}
    >
      {/* ANTET */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px", minHeight: "80px" }}>
        <tbody>
          <tr>
            <td style={{ width: "90px", textAlign: "left", verticalAlign: "top" }}>
              {solLogo && (
                <img
                  src={solLogo}
                  alt="Sol Logo"
                  style={{ maxWidth: "80px", maxHeight: "80px", objectFit: "contain" }}
                />
              )}
            </td>

            <td style={{ textAlign: "center", verticalAlign: "top", lineHeight: 1.3 }}>
              {antetSatirlari.length > 0 ? (
                antetSatirlari.map((satir, idx) => (
                  <div key={idx} style={{ fontWeight: "bold", fontSize: "12pt" }}>
                    {satir}
                  </div>
                ))
              ) : (
                <>
                  {kurumUst && <div style={{ fontWeight: "bold", fontSize: "12pt" }}>{kurumUst}</div>}
                  {kurumAdi && <div style={{ fontWeight: "bold", fontSize: "12pt" }}>{kurumAdi}</div>}
                  {mudurluk && <div style={{ fontWeight: "bold", fontSize: "12pt" }}>{mudurluk}</div>}
                </>
              )}
            </td>

            <td style={{ width: "90px", textAlign: "right", verticalAlign: "top" }}>
              {sagLogo && (
                <img
                  src={sagLogo}
                  alt="Sağ Logo"
                  style={{ maxWidth: "80px", maxHeight: "80px", objectFit: "contain" }}
                />
              )}
            </td>
          </tr>
        </tbody>
      </table>

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

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px", fontSize: "9.5pt" }}>
        <tbody>
          <tr>
            <td style={{ textAlign: "left", width: "70%", verticalAlign: "top" }}>
              <strong>İdarenin Adı:</strong> {idareAdi || kurumAdi || ""}<br />
              <strong>Yapılan İş / Mal / Hizmetin Adı, Niteliği:</strong> {isAdi}<br />
              <strong>Onay Belgesi / Görevlendirme Onayı Tarih ve No su:</strong> {dosyaTarihi} - {evrakSayisi}
            </td>
            <td style={{ textAlign: "right", width: "30%", verticalAlign: "top" }}>
              <strong>Düzenleme Tarihi:</strong> {tarih}
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

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px", fontSize: "8.5pt" }}>
        <thead>
          <tr>
            <th rowSpan={2} style={{ border: "1px solid #000", padding: "4px", width: "4%", textAlign: "center", backgroundColor: "#f2f2f2", fontWeight: "bold" }}>
              Sıra No
            </th>
            <th rowSpan={2} style={{ border: "1px solid #000", padding: "4px", width: "20%", textAlign: "center", backgroundColor: "#f2f2f2", fontWeight: "bold" }}>
              Mal / Hizmet / Yapım İşi
            </th>
            <th rowSpan={2} style={{ border: "1px solid #000", padding: "4px", width: "22%", textAlign: "center", backgroundColor: "#f2f2f2", fontWeight: "bold" }}>
              Özelliği
            </th>
            <th rowSpan={2} style={{ border: "1px solid #000", padding: "4px", width: "6%", textAlign: "center", backgroundColor: "#f2f2f2", fontWeight: "bold" }}>
              Birim
            </th>
            <th rowSpan={2} style={{ border: "1px solid #000", padding: "4px", width: "6%", textAlign: "center", backgroundColor: "#f2f2f2", fontWeight: "bold" }}>
              Miktar
            </th>
            {firmalar.map((f, idx) => (
              <th
                key={idx}
                colSpan={2}
                style={{ border: "1px solid #000", padding: "4px", textAlign: "center", backgroundColor: "#f2f2f2", fontWeight: "bold" }}
              >
                {f.unvan || `Firma ${idx + 1}`}
              </th>
            ))}
          </tr>
          <tr>
            {firmalar.map((_, idx) => (
              <React.Fragment key={idx}>
                <th style={{ border: "1px solid #000", padding: "4px", textAlign: "center", backgroundColor: "#f2f2f2", fontWeight: "bold" }}>B.Fiyat</th>
                <th style={{ border: "1px solid #000", padding: "4px", textAlign: "center", backgroundColor: "#f2f2f2", fontWeight: "bold" }}>Tutar</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {ihtiyacKalemleri.map((kalem, idx) => (
            <tr key={idx}>
              <td style={{ border: "1px solid #000", padding: "4px", textAlign: "center" }}>{kalem.siraNo ?? idx + 1}</td>
              <td style={{ border: "1px solid #000", padding: "4px", textAlign: "left" }}>{kalem.malzemeAdi}</td>
              <td style={{ border: "1px solid #000", padding: "4px", textAlign: "left" }}>{kalem.ozelligi}</td>
              <td style={{ border: "1px solid #000", padding: "4px", textAlign: "center" }}>{kalem.birimi}</td>
              <td style={{ border: "1px solid #000", padding: "4px", textAlign: "center" }}>{kalem.miktar}</td>
              {(kalem.firmaTeklifleriDetay || []).map((tf, fIdx) => (
                <React.Fragment key={fIdx}>
                  <td style={{ border: "1px solid #000", padding: "4px", textAlign: "right", whiteSpace: "nowrap" }}>{tf.birimFiyat}</td>
                  <td style={{ border: "1px solid #000", padding: "4px", textAlign: "right", whiteSpace: "nowrap" }}>{tf.tutar}</td>
                </React.Fragment>
              ))}
            </tr>
          ))}

          {ihtiyacKalemleri.length > 0 && (
            <tr style={{ fontWeight: "bold", backgroundColor: "#fafafa" }}>
              <td colSpan={5} style={{ border: "1px solid #000", padding: "4px", textAlign: "right" }}>
                Toplam Tutar :
              </td>
              {firmaToplamlariDetay.map((ft, idx) => (
                <React.Fragment key={idx}>
                  <td style={{ border: "1px solid #000", padding: "4px" }}></td>
                  <td style={{ border: "1px solid #000", padding: "4px", textAlign: "right", whiteSpace: "nowrap" }}>{ft.toplam}</td>
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

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px", fontSize: "8.5pt" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #000", padding: "4px", width: "4%", textAlign: "center", backgroundColor: "#f2f2f2", fontWeight: "bold" }}>Sıra No</th>
            <th style={{ border: "1px solid #000", padding: "4px", width: "20%", textAlign: "center", backgroundColor: "#f2f2f2", fontWeight: "bold" }}>Mal / Hizmet / Yapım İşi</th>
            <th style={{ border: "1px solid #000", padding: "4px", width: "22%", textAlign: "center", backgroundColor: "#f2f2f2", fontWeight: "bold" }}>Özelliği</th>
            <th style={{ border: "1px solid #000", padding: "4px", width: "6%", textAlign: "center", backgroundColor: "#f2f2f2", fontWeight: "bold" }}>Birim</th>
            <th style={{ border: "1px solid #000", padding: "4px", width: "6%", textAlign: "center", backgroundColor: "#f2f2f2", fontWeight: "bold" }}>Miktar</th>
            <th style={{ border: "1px solid #000", padding: "4px", width: "25%", textAlign: "center", backgroundColor: "#f2f2f2", fontWeight: "bold" }}>Gerçek/Tüzel Kişinin Adı-Adresi</th>
            <th style={{ border: "1px solid #000", padding: "4px", width: "8%", textAlign: "center", backgroundColor: "#f2f2f2", fontWeight: "bold" }}>Teklif Fiyatı</th>
            <th style={{ border: "1px solid #000", padding: "4px", width: "9%", textAlign: "center", backgroundColor: "#f2f2f2", fontWeight: "bold" }}>Tutarı</th>
          </tr>
        </thead>
        <tbody>
          {ihtiyacKalemleri.map((kalem, idx) => (
            <tr key={idx}>
              <td style={{ border: "1px solid #000", padding: "4px", textAlign: "center" }}>{kalem.siraNo ?? idx + 1}</td>
              <td style={{ border: "1px solid #000", padding: "4px", textAlign: "left" }}>{kalem.malzemeAdi}</td>
              <td style={{ border: "1px solid #000", padding: "4px", textAlign: "left" }}>{kalem.ozelligi}</td>
              <td style={{ border: "1px solid #000", padding: "4px", textAlign: "center" }}>{kalem.birimi}</td>
              <td style={{ border: "1px solid #000", padding: "4px", textAlign: "center" }}>{kalem.miktar}</td>
              <td style={{ border: "1px solid #000", padding: "4px", textAlign: "left" }}>{kalem.enUygunFirmaAdi}</td>
              <td style={{ border: "1px solid #000", padding: "4px", textAlign: "right", whiteSpace: "nowrap" }}>{kalem.enDusukFiyat}</td>
              <td style={{ border: "1px solid #000", padding: "4px", textAlign: "right", whiteSpace: "nowrap" }}>{kalem.toplamBedel}</td>
            </tr>
          ))}

          {ihtiyacKalemleri.length > 0 && (
            <tr style={{ fontWeight: "bold", backgroundColor: "#fafafa" }}>
              <td colSpan={6} style={{ border: "1px solid #000", padding: "4px", textAlign: "right" }}>
                Toplam Tutar :
              </td>
              <td style={{ border: "1px solid #000", padding: "4px" }}></td>
              <td style={{ border: "1px solid #000", padding: "4px", textAlign: "right", whiteSpace: "nowrap" }}>{genelToplam}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ fontSize: "8.5pt", marginBottom: "8px" }}>Para Birimi TL.</div>

      <div style={{ fontSize: "9pt", textAlign: "justify", textIndent: "40px", marginTop: "10px" }}>
        4734 sayılı Kamu İhale Kanununun 22/d* maddesi uyarınca yapılacak alımlara ilişkin yapılan piyasa araştırmasında gerçek/tüzel kişilerce teklif edilen fiyatlar tarafımızca değerlendirilerek yukarıda adı ve adresi belirtilen gerçek/tüzel kişilerden alım yapılması uygun görülmüştür.
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
          <strong>Açıklama:</strong> {aciklama}
        </div>
      )}

      {/* GÖREVLİLER */}
      <div style={{ marginTop: "15px", textAlign: "center", pageBreakInside: "avoid" }}>
        <div style={{ fontWeight: "bold", fontSize: "9.5pt", marginBottom: "15px" }}>
          Piyasa Fiyat Araştırması Görevlisi / Görevlileri
        </div>

        <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", textAlign: "center" }}>
          {komisyon.map((uye, idx) => (
            <div key={idx} style={{ width: "22%", minWidth: "120px", padding: "5px", fontSize: "9pt", lineHeight: 1.35 }}>
              <span style={{ fontWeight: "bold", textTransform: "uppercase" }}>{uye.adSoyad}</span><br />
              <span>{uye.unvan}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HARCAMA YETKİLİSİ ONAYI (OLUR) */}
      <div style={{ marginTop: "25px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", pageBreakInside: "avoid" }}>
        <div style={{ fontWeight: "bold", fontSize: "11pt", marginBottom: "5px" }}>OLUR</div>
        <div style={{ fontSize: "9pt", marginBottom: "3px" }}>{dosyaTarihi}</div>
        <div style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "10.5pt", marginTop: "5px" }}>
          {baskanAdi}
        </div>
        <div style={{ fontSize: "10pt" }}>{baskanUnvan}</div>
      </div>
    </div>
  );
};
