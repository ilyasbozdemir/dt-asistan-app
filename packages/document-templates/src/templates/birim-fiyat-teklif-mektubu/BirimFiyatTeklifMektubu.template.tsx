import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { EditableField } from "../../document/EditableField";
import { DateEditableField } from "../../document/ApprovalSignature";
import { TableRowSplitDivider } from "../../document/TableRowSplitDivider";
import { BirimFiyatTeklifMektubuType } from "./BirimFiyatTeklifMektubu.schema";


interface BirimFiyatTeklifMektubuProps {
  data?: Partial<BirimFiyatTeklifMektubuType> & Record<string, any>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
}

export function BirimFiyatTeklifMektubu({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
}: BirimFiyatTeklifMektubuProps) {
  const items = data.ihtiyacKalemleri || [];

  return (
    <DocumentLayout
      data={data as any}
      hideFooter={false}
      pageSize={pageSize}
      orientation={orientation}
      pageNumber={1}
      totalPages={1}
    >
      <div style={{ width: "100%", fontSize: "11pt", color: "#000", fontFamily: "'Times New Roman', Times, serif", lineHeight: 1.4 }}>
        <div style={{ textAlign: "right", fontWeight: "bold", marginBottom: "10px" }}>
          <DateEditableField name="dosyaTarihi" value={data.dosyaTarihi || data.tarih} placeholder="GG.AA.YYYY" />
        </div>

        <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "12pt", margin: "10px 0", textTransform: "uppercase" }}>
          BİRİM FİYAT TEKLİF MEKTUBU
        </div>

        <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "11pt", marginBottom: "10px" }}>
          {data.hitap || data.idareAdi || "KURUM / MAKAM ADI"}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px", fontSize: "10pt" }}>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #000", padding: "5px 8px", fontWeight: "bold", width: "35%" }}>İhalenin Adı / İşin Adı</td>
              <td style={{ border: "1px solid #000", padding: "5px 8px", width: "65%" }}>
                <EditableField name="isinAdi" value={data.isinAdi} placeholder="İşin Adı" />
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "5px 8px", fontWeight: "bold" }}>Teklif sahibinin adı ve soyadı / ünvanı</td>
              <td style={{ border: "1px solid #000", padding: "5px 8px" }}>
                <EditableField name="teklifSahibi" value={data.teklifSahibi} placeholder="Teklif Sahibi" />
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "5px 8px", fontWeight: "bold" }}>Uyruğu</td>
              <td style={{ border: "1px solid #000", padding: "5px 8px" }}>
                <EditableField name="uyrugu" value={data.uyrugu || "T.C."} placeholder="Uyruğu" />
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "5px 8px", fontWeight: "bold" }}>TC kimlik numarası (gerçek kişi ise)</td>
              <td style={{ border: "1px solid #000", padding: "5px 8px" }}>
                <EditableField name="tcKimlikNo" value={data.tcKimlikNo} placeholder="TC Kimlik No" />
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "5px 8px", fontWeight: "bold" }}>Tüzel kişi ise, tüm ortakların Adı Soyadı ve T.C. Kimlik numaraları</td>
              <td style={{ border: "1px solid #000", padding: "5px 8px" }}>
                <EditableField name="ortaklarinTcNo" value={data.ortaklarinTcNo} placeholder="Ortakların TC Kimlik No" />
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "5px 8px", fontWeight: "bold" }}>Vergi Kimlik Numarası</td>
              <td style={{ border: "1px solid #000", padding: "5px 8px" }}>
                <EditableField name="vergiNo" value={data.vergiNo} placeholder="Vergi Kimlik No" />
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "5px 8px", fontWeight: "bold" }}>Tebligat adresi</td>
              <td style={{ border: "1px solid #000", padding: "5px 8px" }}>
                <EditableField name="tebligatAdresi" value={data.tebligatAdresi} placeholder="Tebligat Adresi" />
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "5px 8px", fontWeight: "bold" }}>Telefon ve Faks numarası</td>
              <td style={{ border: "1px solid #000", padding: "5px 8px" }}>
                <EditableField name="telefonFaks" value={data.telefonFaks} placeholder="Telefon / Faks" />
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "5px 8px", fontWeight: "bold" }}>Elektronik posta adresi</td>
              <td style={{ border: "1px solid #000", padding: "5px 8px" }}>
                <EditableField name="eposta" value={data.eposta} placeholder="E-Posta" />
              </td>
            </tr>
          </tbody>
        </table>

        {/* AÇIKLAMA / TAAHHÜT METNİ */}
        <div style={{ border: "1px solid #000", padding: "8px", fontSize: "10pt", textAlign: "justify", lineHeight: 1.4, marginTop: "10px" }}>
          {data.aciklama ? (
            <div style={{ whiteSpace: "pre-wrap" }}>{data.aciklama}</div>
          ) : (
            <div style={{ whiteSpace: "pre-wrap" }}>
              1. Teklifimiz teklif verme tarihine kadar geçerlidir.
              <br />
              2. Teklifimize Damga Vergisi, Resim Harç, Pul ve Ulaştırma Giderleri dahildir.
              <br />
              3. İhale konusu iş için sermayesinin %50'sinden fazlasına sahip olduğumuz başka bir tüzel kişinin bu işe ayrı bir teklif vermediğini beyan ediyoruz.
              <br />
              4. Aldığınız herhangi bir teklifi veya en düşük teklifi seçmek zorunda olmadığınızı kabul ediyoruz.
              <br />
              5. İhale konusu işle ilgili olmak üzere idarenizce yapılacak/yaptırılacak diğer işlerde idarenizin çıkarlarına aykırı düşecek hiçbir eylem ve oluşum içerisinde olmayacağımızı taahhüt ediyoruz.
              <br />
              6. Bu alıma ilişkin malzeme kalemlerine kısmi teklif verilmemiştir.
              <br />
              7. 4734 Sayılı Kamu İhale Kanununun 4.maddesindeki "Yerli İstekli" tanımı gereğince yerli istekli durumundayız.
              <br />
              8. İhale konusu işin tamamını Teklif Mektubumuzun ekindeki Birim Fiyat Teklif Cetvelinde belirtilen her bir iş kalemi için teklif ettiğimiz birim fiyatları üzerinden KDV HARİÇ bedel karşılığında kabul ve taahhüt ederiz.
            </div>
          )}
        </div>

        {/* FİRMA YETKİLİSİ İMZA ALANI */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "15px", marginBottom: "15px" }}>
          <div style={{ fontStyle: "italic", color: "#333", fontSize: "11pt" }}>Para Birimi: Türk Lirası (TL)</div>
          <div style={{ textAlign: "center", width: "250px", fontSize: "11pt", lineHeight: 1.5, marginLeft: "auto" }}>
            <DateEditableField name="tarih" value={data.tarih || data.dosyaTarihi} placeholder="……/……/20…" />
            <br />
            <br />
            Kaşe - İmza
          </div>
        </div>

        {/* BİRİM FİYAT TEKLİF CETVELİ TABLOSU */}
        <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "12pt", marginTop: "25px", marginBottom: "10px" }}>
          BİRİM FİYAT TEKLİF CETVELİ
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px", fontSize: "10pt" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #000", padding: "6px", width: "8%", textAlign: "center", fontWeight: "bold" }}>Sıra No</th>
              <th style={{ border: "1px solid #000", padding: "6px", width: "37%", textAlign: "left", fontWeight: "bold" }}>Mal/Hizmet Kaleminin Adı ve Kısa Açıklaması</th>
              <th style={{ border: "1px solid #000", padding: "6px", width: "20%", textAlign: "left", fontWeight: "bold" }}>Özelliği</th>
              <th style={{ border: "1px solid #000", padding: "6px", width: "10%", textAlign: "center", fontWeight: "bold" }}>Birimi</th>
              <th style={{ border: "1px solid #000", padding: "6px", width: "10%", textAlign: "center", fontWeight: "bold" }}>Miktarı</th>
              <th style={{ border: "1px solid #000", padding: "6px", width: "15%", textAlign: "center", fontWeight: "bold" }}>Birim Fiyatı (TL)</th>
              <th style={{ border: "1px solid #000", padding: "6px", width: "15%", textAlign: "center", fontWeight: "bold" }}>Tutarı (TL)</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, idx) => {
                const rowNum = idx + 1;
                return (
                  <React.Fragment key={idx}>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>{item.siraNo || rowNum}</td>
                      <td style={{ border: "1px solid #000", padding: "6px" }}>{item.malzemeAdi}</td>
                      <td style={{ border: "1px solid #000", padding: "6px" }}>{item.ozelligi || "-"}</td>
                      <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>{item.birimi || "-"}</td>
                      <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right" }}>{item.miktar}</td>
                      <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right" }}>{item.birimFiyat ? `${item.birimFiyat} ₺` : ""}</td>
                      <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right" }}>{item.tutar ? `${item.tutar} ₺` : ""}</td>
                    </tr>
                    <TableRowSplitDivider
                      rowIndex={rowNum}
                      colSpan={7}
                      currentSplitIndex={data.firstPageLimit ? Number(data.firstPageLimit) : null}
                    />
                  </React.Fragment>
                );
              })
            ) : (

              <tr>
                <td colSpan={7} style={{ border: "1px solid #000", padding: "8px", textAlign: "center", fontStyle: "italic" }}>
                  Kalem bulunamadı
                </td>
              </tr>
            )}
            <tr>
              <td colSpan={5} style={{ border: "none", textAlign: "left", padding: "8px 0", fontStyle: "italic" }}>Para birimi: TL</td>
              <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center", fontWeight: "bold" }}>Toplam</td>
              <td style={{ border: "1px solid #000", padding: "6px", height: "35px" }} />
            </tr>
          </tbody>
        </table>
      </div>
    </DocumentLayout>
  );
}
