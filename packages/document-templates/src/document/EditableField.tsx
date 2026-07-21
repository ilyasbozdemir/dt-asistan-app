import React from "react";
import { useTemplateEdit } from "./TemplateEditContext";

export interface EditableFieldProps {
  name?: string;
  value?: string;
  onChange?: (newValue: string) => void;
  placeholder?: string;
  multiline?: boolean;
  style?: React.CSSProperties;
  className?: string;
  isEditing?: boolean;
}

export function EditableField({
  name,
  value = "",
  onChange,
  placeholder = "......",
  multiline = false,
  style = {},
  className = "",
  isEditing,
}: EditableFieldProps) {
  const context = useTemplateEdit();
  const activeEditing = isEditing !== undefined ? isEditing : context.isEditing;
  const activeOnChange =
    onChange ||
    (name && context.onFieldChange
      ? (val: string) => context.onFieldChange!(name, val)
      : undefined);

  if (!activeEditing || !activeOnChange) {
    return <span style={style} className={className}>{value || placeholder}</span>;
  }

  const baseStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    border: "1px solid #767676",
    borderRadius: "2px",
    padding: "2px 6px",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "inherit",
    fontWeight: "inherit",
    color: "#000000",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
    boxSizing: "border-box",
    ...style,
  };

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => activeOnChange(e.target.value)}
        placeholder={placeholder}
        rows={Math.max(2, (value || "").split("\n").length)}
        style={{
          ...baseStyle,
          width: "100%",
          resize: "vertical",
          display: "block",
          lineHeight: "1.4",
        }}
        className={className}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => activeOnChange(e.target.value)}
      placeholder={placeholder}
      style={{
        ...baseStyle,
        display: "inline-block",
        minWidth: "120px",
      }}
      className={className}
    />
  );
}
