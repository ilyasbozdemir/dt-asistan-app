import React from "react";
import { EditableField } from "./EditableField";
import { useTemplateEdit } from "./TemplateEditContext";

export const EditableOlurPlaceholder: React.FC = () => {
  const { isEditing, onFieldChange } = useTemplateEdit();
  if (!isEditing || !onFieldChange) return null;

  return (
    <div
      onClick={() => onFieldChange("olurYazisi", true)}
      style={{
        marginTop: "30px",
        padding: "8px 16px",
        border: "1.5px dashed #94a3b8",
        borderRadius: "8px",
        textAlign: "center",
        color: "#475569",
        fontSize: "10pt",
        fontWeight: "bold",
        cursor: "pointer",
        backgroundColor: "#f8fafc",
        userSelect: "none",
      }}
      title="OLUR bloğunu belgeye eklemek için tıklayın"
    >
      <span style={{ marginRight: "6px" }}>☑</span>
      OLUR Bloğu Gizli (Göster ve Düzenle)
    </div>
  );
};

interface PersonelCardProps {
  adSoyad?: string | null;
  unvan?: string | null;
  telefon?: string | null;
  eposta?: string | null;
  align?: "left" | "center" | "right";
  marginTop?: number;
  marginBottom?: number;
  showContactInfo?: boolean;
}

export const PersonelCard: React.FC<PersonelCardProps> = ({
  adSoyad,
  unvan,
  telefon,
  eposta,
  align = "center",
  marginTop = 20,
  marginBottom = 20,
  showContactInfo = false,
}) => {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        pageBreakInside: "avoid",
        justifyContent: align === "center"
          ? "center"
          : align === "right"
          ? "flex-end"
          : "flex-start",
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
      }}
    >
      <div
        style={{
          textAlign: "center",
          minWidth: "250px",
          lineHeight: 1.8,
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: "11pt" }}>
          <EditableField
            name="hazirlayanPersonelAdi"
            value={adSoyad || ""}
            placeholder="Hazırlayan Adı Soyadı"
          />
        </div>
        <div style={{ fontSize: "11pt" }}>
          <EditableField
            name="hazirlayanPersonelUnvan"
            value={unvan || ""}
            placeholder="Hazırlayan Unvanı"
          />
        </div>
        {showContactInfo && (
          <>
            {telefon && (
              <div style={{ fontSize: "10pt", color: "#666" }}>
                Tel: {telefon}
              </div>
            )}
            {eposta && (
              <div style={{ fontSize: "10pt", color: "#666" }}>
                E-posta: {eposta}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface ApprovalSignatureProps {
  title?: string;
  date?: string | null;
  adSoyad?: string | null;
  unvan?: string | null;
  showSpace?: boolean;
  marginTop?: number;
  align?: "left" | "center" | "right";
}

export const ApprovalSignature: React.FC<ApprovalSignatureProps> = ({
  title = "OLUR",
  date,
  adSoyad,
  unvan,
  showSpace = true,
  marginTop = 40,
  align = "center",
}) => {
  const { isEditing, onFieldChange } = useTemplateEdit();

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        pageBreakInside: "avoid",
        justifyContent: align === "center"
          ? "center"
          : align === "right"
          ? "flex-end"
          : "flex-start",
        marginTop: `${marginTop}px`,
      }}
    >
      <div
        style={{
          textAlign: "center",
          minWidth: "250px",
          lineHeight: 1.5,
          position: "relative",
        }}
      >
        <div
          style={{ fontWeight: "bold", fontSize: "12pt", marginBottom: "4px" }}
        >
          <EditableField name="olurBaslik" value={title} placeholder="OLUR" />
        </div>

        <div style={{ fontSize: "11pt", marginBottom: "8px" }}>
          <EditableField
            name="onayTarihi"
            value={date || ""}
            placeholder="GG.AA.YYYY"
          />
        </div>

        {showSpace && (
          <div
            style={{ minHeight: "30px", marginBottom: "4px" }}
          />
        )}

        <div
          style={{ fontSize: "11pt", fontWeight: "bold", marginTop: "4px" }}
        >
          <EditableField
            name="onaylayanPersonelAdi"
            value={adSoyad || ""}
            placeholder="Onaylayan Adı Soyadı"
          />
        </div>

        <div style={{ fontSize: "11pt" }}>
          <EditableField
            name="onaylayanPersonelUnvan"
            value={unvan || ""}
            placeholder="Onaylayan Unvanı"
          />
        </div>
      </div>
    </div>
  );
};

interface CommissionMember {
  adSoyad: string;
  unvan: string;
  gorevi?: string;
}

interface CommissionListProps {
  members: CommissionMember[];
  title?: string;
  marginTop?: number;
}

export const CommissionList: React.FC<CommissionListProps> = ({
  members,
  title = "Komisyon Üyeleri",
  marginTop = 30,
}) => {
  if (!members || members.length === 0) return null;

  return (
    <div style={{ marginTop: `${marginTop}px`, pageBreakInside: "avoid" }}>
      <div
        style={{ fontWeight: "bold", fontSize: "12pt", marginBottom: "15px" }}
      >
        {title}
      </div>

      {members.map((member, idx) => (
        <div key={idx} style={{ marginBottom: "12px", lineHeight: 1.6 }}>
          <div style={{ fontSize: "11pt" }}>
            <strong>{member.adSoyad}</strong>
          </div>
          <div style={{ fontSize: "10pt" }}>{member.unvan}</div>
          {member.gorevi && (
            <div style={{ fontSize: "10pt", color: "#666" }}>
              ({member.gorevi})
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

interface MetadataBlockProps {
  evrakSayisi?: string;
  tarih?: string;
  onayaSunulanTarih?: string;
  dosyaKonusu?: string;
  showBorder?: boolean;
}

export const MetadataBlock: React.FC<MetadataBlockProps> = ({
  evrakSayisi,
  tarih,
  onayaSunulanTarih,
  dosyaKonusu,
  showBorder = false,
}) => {
  const displayTarih = onayaSunulanTarih || tarih;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "20px",
        paddingBottom: showBorder ? "10px" : 0,
        borderBottom: showBorder ? `1px solid #ccc` : "none",
        pageBreakInside: "avoid",
      }}
    >
      <div style={{ maxWidth: "50%" }}>
        <table
          style={{
            border: "none",
            padding: 0,
            margin: 0,
            fontSize: "11pt",
            borderSpacing: 0,
          }}
        >
          <tbody>
            {evrakSayisi !== undefined && (
              <tr>
                <td style={{ verticalAlign: "top", padding: 0, width: "45px" }}>
                  <strong>Sayı</strong>
                </td>
                <td style={{ verticalAlign: "top", padding: "0 5px 0 0" }}>
                  <strong>:</strong>
                </td>
                <td style={{ verticalAlign: "top", padding: 0 }}>
                  <EditableField name="evrakSayisi" value={evrakSayisi} />
                </td>
              </tr>
            )}
            {dosyaKonusu !== undefined && (
              <tr>
                <td style={{ verticalAlign: "top", padding: 0, width: "45px" }}>
                  <strong>Konu</strong>
                </td>
                <td style={{ verticalAlign: "top", padding: "0 5px 0 0" }}>
                  <strong>:</strong>
                </td>
                <td
                  style={{
                    verticalAlign: "top",
                    padding: 0,
                    textAlign: "justify",
                  }}
                >
                  <EditableField name="dosyaKonusu" value={dosyaKonusu} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {displayTarih !== undefined && (
        <div style={{ fontSize: "11pt", textAlign: "right" }}>
          <strong>Tarih:</strong>{" "}
          <EditableField name="onayaSunulanTarih" value={displayTarih} />
        </div>
      )}
    </div>
  );
};
