export type ColumnFilterType = 'date-range' | 'select-multi';

export type Option = {
  label: string;
  value: string | number;
};

export type ColumnFilter = {
  key: string;
  type: ColumnFilterType;
  label: string;
  options?: Option[];
};

export type StatusTag<T = any> = {
  label: string;
  value: T;
  color?: string;
};

export type OrderSort<T = string> = { name: T; isDesc: string | boolean };
