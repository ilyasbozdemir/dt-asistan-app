import React, { useState } from "react";
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
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
    backgroundColor: isFocused ? "#ffffff" : isHovered ? "#f8fafc" : "transparent",
    border: "none",
    borderBottom: isFocused
      ? "2px solid #2563eb"
      : isHovered
      ? "1.5px dashed #475569"
      : "1px dashed #94a3b8",
    borderRadius: "0",
    padding: "0 2px",
    margin: "0",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "inherit",
    fontWeight: "inherit",
    color: "#000000",
    verticalAlign: "baseline",
    transition: "background-color 0.15s ease, border-color 0.15s ease",
    boxSizing: "border-box",
    ...style,
  };

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => activeOnChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        placeholder={placeholder}
        rows={Math.max(2, (value || "").split("\n").length)}
        style={{
          ...baseStyle,
          width: "100%",
          resize: "vertical",
          display: "block",
          lineHeight: "1.4",
          border: isFocused ? "1px solid #2563eb" : "1px dashed #cbd5e1",
          borderRadius: "3px",
          padding: "4px 6px",
        }}
        className={className}
      />
    );
  }

  // Calculate dynamic inline width so input fits text naturally without breaking sentence flow
  const charLength = Math.max((value || "").length, (placeholder || "").length, 4);
  const calculatedWidth = `${Math.min(Math.max(charLength * 9 + 10, 50), 600)}px`;

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => activeOnChange(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      placeholder={placeholder}
      style={{
        ...baseStyle,
        display: "inline-block",
        width: style.width || calculatedWidth,
      }}
      className={className}
    />
  );
}
