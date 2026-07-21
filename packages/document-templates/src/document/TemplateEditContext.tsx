import React, { createContext, useContext } from "react";

export interface TemplateEditContextType {
  isEditing?: boolean;
  onFieldChange?: (key: string, value: any) => void;
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
}: TemplateEditProviderProps) {
  return (
    <TemplateEditContext.Provider value={{ isEditing, onFieldChange }}>
      {children}
    </TemplateEditContext.Provider>
  );
}
