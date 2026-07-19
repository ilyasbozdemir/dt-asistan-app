import React from 'react';

export type TemplateType = {
  id: string;
  name: string;
  category: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TemplateComponentProps<T = any> {
  data: T;
  onChange?: (data: Partial<T>) => void;
}

export type TemplateComponentType = React.ComponentType<TemplateComponentProps>;
