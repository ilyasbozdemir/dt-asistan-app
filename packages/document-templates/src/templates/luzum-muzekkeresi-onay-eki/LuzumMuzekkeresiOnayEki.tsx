import React from "react";
import { DocumentLayout } from "../../document/DocumentLayout";
import { DocumentTable } from "../../document/DocumentTable";
import { paginateData } from "../../document/DynamicPaginatedTable";
import { LuzumMuzekkeresiOnayEkiType } from "./LuzumMuzekkeresiOnayEki.schema";

interface LuzumMuzekkeresiOnayEkiProps {
  data?: Partial<LuzumMuzekkeresiOnayEkiType>;
  pageSize?: "A4" | "A3";
  orientation?: "portrait" | "landscape";
  firstPageLimit?: number;
  middlePageLimit?: number;
  lastPageLimit?: number;
}

function getKurumName(
  kurumAdi?: string | null,
  altKurumTipi?: string | null,
): string {
  if (!altKurumTipi || altKurumTipi === "diger") {
    return kurumAdi || "";
  }

  const map: Record<string, string> = {
    belediye: "Belediyemiz",
    mudurluk: "Müdürlüğümüz",
    bakanlik: "Bakanlığımız",
    valilik: "Valiliğimiz",
    kaymakamlik: "Kaymakamlığımız",
    universite: "Üniversitemiz",
    il_ozel: "İl Özel İdaremiz",
    koy: "Muhtarlığımız",
    sgk: "Müdürlüğümüz",
    kurul: "Kurulumuz",
  };

  return map[altKurumTipi] || kurumAdi || "";
}

export function LuzumMuzekkeresiOnayEki({
  data = {},
  pageSize = "A4",
  orientation = "portrait",
  firstPageLimit,
  middlePageLimit,
  lastPageLimit,
}: LuzumMuzekkeresiOnayEkiProps) {
  const columns: any[] = [
    { key: "kodu", label: "Kodu", width: "15%", align: "left" },
    { key: "malzemeAdi", label: "Malzeme Adı", width: "35%", align: "left" },
    { key: "ozelligi", label: "Özelliği", width: "25%", align: "left" },
    { key: "birimi", label: "Birimi", width: "10%", align: "center" },
    { key: "kdvOrani", label: "KDV Oranı", width: "10%", align: "center" },
    { key: "miktar", label: "Miktar", width: "10%", align: "right" },
  ];

  const limits = {
    firstPage: firstPageLimit ?? 15,
    middle: middlePageLimit ?? 18,
    lastPage: lastPageLimit ?? 12,
  };

  const items = (data.ihtiyacKalemleri || []).map((item: any, idx: number) => ({
    ...item,
    siraNo: item.siraNo || idx + 1,
  }));

  const pages = paginateData(items, limits);

  return (
    <>
      {pages.map((pageItems, pageIdx) => {
        const isFirstPage = pageIdx === 0;
        const isLastPage = pageIdx === pages.length - 1;

        return (
          <DocumentLayout
            key={pageIdx}
            data={data}
            hideFooter={false}
            pageSize={pageSize}
            orientation={orientation}
            pageNumber={pageIdx + 1}
            totalPages={pages.length}
            hideHeader={!isFirstPage}
          >
            {isFirstPage && (
              <>
                <div
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "12pt",
                    textTransform: "uppercase",
                    margin: "10px 0 20px 0",
                  }}
                >
                  {data.dosyaKonusu || "Lüzum Müzekkeresi"}
                </div>

                <div
                  style={{
                    textAlign: "right",
                    marginBottom: "20px",
                    fontWeight: "bold",
                    fontSize: "11pt",
                  }}
                >
                  EK: {data.ekNo || "1"}
                </div>

                <div
                  style={{
                    textAlign: "justify",
                    textIndent: "40px",
                    marginBottom: "20px",
                    fontSize: "11pt",
                    lineHeight: 1.5,
                  }}
                >
                  {getKurumName(data.kurumAdi, data.altKurumTipi) ||
                    "[Kurum Adı]"}{" "}
                  için aşağıda müfredatı ve evsafı yazılı malzemelere ihtiyaç
                  görüldüğünden satın alınması arz olunur.
                </div>
              </>
            )}

            <DocumentTable
              columns={columns}
              data={pageItems}
              emptyMessage="Kalem bulunamadı"
              striped={false}
            />

            {isLastPage && (
              <div
                style={{
                  marginLeft: "auto",
                  width: "180px",
                  textAlign: "center",
                  marginTop: "30px",
                  marginBottom: "20px",
                  lineHeight: 1.3,
                  fontSize: "11pt",
                  pageBreakInside: "avoid",
                }}
              >
                {data.dosyaTarihi ||
                  data.tarih ||
                  new Date().toLocaleDateString("tr-TR")}
                <br />
                <br />
                {data.talepEdenPersonelAdi || ""}
                <br />
                {data.talepEdenPersonelUnvan || ""}
              </div>
            )}
          </DocumentLayout>
        );
      })}
    </>
  );
}
