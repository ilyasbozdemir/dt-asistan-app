import React from "react";
import { BaseTemplate } from "../base.schema";

interface DocumentFooterProps {
  data?: Partial<BaseTemplate>;
}

export const DocumentFooter: React.FC<DocumentFooterProps> = ({ data }) => {
  if (!data || data.kurumIci) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom: "1.5cm",
        left: "1.5cm",
        right: "1.5cm",
        paddingTop: "10px",
        borderTop: `2px solid ${data.solLogo ? "#c00" : "#999"}`,
        fontSize: "8pt",
        color: "#333",
        lineHeight: 1.2,
      }}
    >
      <div style={{ display: "table", width: "100%" }}>
        {/* SOL KOLON - KURUM BİLGİSİ */}
        <div
          style={{
            display: "table-cell",
            verticalAlign: "top",
            width: "50%",
          }}
        >
          {data.kurumAdres && (
            <div>
              <strong>Adres:</strong> {data.kurumAdres}
            </div>
          )}
          {data.kurumWeb && (
            <div>
              <strong>Web:</strong> {data.kurumWeb}
            </div>
          )}
          {data.kurumEposta && (
            <div>
              <strong>E-Posta:</strong> {data.kurumEposta}
            </div>
          )}
          {data.kurumKep && (
            <div>
              <strong>KEP:</strong> {data.kurumKep}
            </div>
          )}
        </div>

        {/* SAĞ KOLON - İLETİŞİ KİŞİSİ */}
        <div
          style={{
            display: "table-cell",
            textAlign: "right",
            verticalAlign: "top",
            width: "50%",
          }}
        >
          {data.hazirlayanPersonelAdi && (
            <div>
              <strong>Bilgi İçin:</strong> {data.hazirlayanPersonelAdi}
            </div>
          )}
          {data.hazirlayanPersonelUnvan && (
            <div>{data.hazirlayanPersonelUnvan}</div>
          )}
          {data.hazirlayanTelefon && (
            <div>
              <strong>Telefon:</strong> {data.hazirlayanTelefon}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
