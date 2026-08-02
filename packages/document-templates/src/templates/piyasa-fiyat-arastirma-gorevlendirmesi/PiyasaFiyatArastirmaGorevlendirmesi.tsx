import React from "react";
import { PiyasaFiyatArastirmaGorevlendirmesiData } from "./PiyasaFiyatArastirmaGorevlendirmesi.schema";

interface Props {
  data: PiyasaFiyatArastirmaGorevlendirmesiData;
}

export const PiyasaFiyatArastirmaGorevlendirmesi: React.FC<Props> = ({ data }) => {
  const {
    solLogo,
    antetSatir1,
    antetSatir2,
    antetSatir3,
    antetSatirlari = [],
    kurumAdi = "",
    dosyaTarihi = "",
    evrakSayisi = "",
    dosyaKonusu = "",
    onaylayanPersonelAdi = "",
    onaylayanPersonelUnvan = "",
    gorevliler = [],
    kurumIci = false,
    kurumAdres = "",
    kurumTelefon = "",
  } = data || {};

  return (
    <div
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: "12pt",
        lineHeight: 1.5,
        color: "#000",
        backgroundColor: "#fff",
        padding: "2cm 1.5cm 2.5cm 1.5cm",
        width: "100%",
        maxWidth: "21cm",
        minHeight: "29.7cm",
        boxSizing: "border-box",
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* HEADER */}
      <div style={{ textAlign: "center", lineHeight: 1.3, marginBottom: "20px", textTransform: "uppercase", fontWeight: "bold", position: "relative" }}>
        {solLogo && (
          <img
            src={solLogo}
            alt="Logo"
            style={{ width: "60px", position: "absolute", left: 0, top: 0 }}
          />
        )}
        T.C.<br />
        {antetSatirlari.length > 0 ? (
          antetSatirlari.map((s, idx) => <div key={idx}>{s}</div>)
        ) : (
          <>
            {antetSatir1 && <div><strong>{antetSatir1}</strong></div>}
            {antetSatir2 && <div>{antetSatir2}</div>}
            {antetSatir3 && <div>{antetSatir3}</div>}
            {!antetSatir1 && <div><strong>{kurumAdi}</strong></div>}
          </>
        )}
      </div>

      {/* BAŞLIK */}
      <div style={{ textAlign: "center", fontWeight: "bold", textDecoration: "underline", margin: "20px 0", fontSize: "12pt" }}>
        GÖREVLENDİRME YAZISI
      </div>

      {/* İÇERİK */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ textAlign: "justify" }}>
          <strong>İlgi:</strong> {dosyaTarihi} tarihli ve {evrakSayisi} sayılı onay belgesi.
        </div>

        <div style={{ textIndent: "1.25cm", textAlign: "justify", marginTop: "15px", marginBottom: "15px" }}>
          Kurumumuzun ihtiyacı olan <strong>{dosyaKonusu}</strong> işi için 4734 sayılı Kamu İhale Kanununun 22. maddesinin (d) bendi uyarınca Doğrudan Temin usulü ile piyasa fiyat araştırması yapmak üzere aşağıda ismi belirtilen personeller görevlendirilmiştir.
        </div>

        <div style={{ textIndent: "1.25cm", textAlign: "justify", marginTop: "15px", marginBottom: "15px" }}>
          Gereğini rica ederim.
        </div>
      </div>

      {/* İMZA */}
      <div style={{ textAlign: "right", marginBottom: "40px" }}>
        {onaylayanPersonelAdi}<br />
        {onaylayanPersonelUnvan}<br />
        Harcama Yetkilisi
      </div>

      {/* GÖREVLİLER */}
      <div style={{ fontWeight: "bold", marginBottom: "10px" }}>Görevli Personeller:</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {gorevliler.length > 0 ? (
            gorevliler.map((g, idx) => (
              <tr key={idx}>
                <td style={{ padding: "5px 0" }}>
                  {idx + 1}. {g.adi} ({g.unvani})
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={{ padding: "5px 0" }}>Personel bilgisi girilmemiş.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* FOOTER */}
      {!kurumIci && (
        <div style={{ position: "absolute", bottom: "1.5cm", left: "1.5cm", right: "1.5cm", fontSize: "8pt" }}>
          İletişim: {kurumAdres} | Tel: {kurumTelefon}
        </div>
      )}
    </div>
  );
};
