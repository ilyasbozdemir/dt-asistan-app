import React, { createContext, useContext } from "react";

export interface TemplateEditContextType {
  isEditing?: boolean;
  onFieldChange?: (key: string, value: any) => void;
  personelListesi?: any[];
  firmaListesi?: any[];
}

export const TemplateEditContext = createContext<TemplateEditContextType>({
  isEditing: true,
});

export const useTemplateEdit = () => useContext(TemplateEditContext);

export interface TemplateEditProviderProps extends TemplateEditContextType {
  children: React.ReactNode;
}

export function TemplateEditProvider({
  children,
  isEditing = true,
  onFieldChange,
  personelListesi,
  firmaListesi,
}: TemplateEditProviderProps) {
  return (
    <TemplateEditContext.Provider
      value={{ isEditing, onFieldChange, personelListesi, firmaListesi }}
    >
      {children}
    </TemplateEditContext.Provider>
  );
}
