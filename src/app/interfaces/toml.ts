export type TomlType = {
  metadata: {
    name: string;
    customer: string;
  };
  field: Field[];
  button: Button[];
};

type Field = {
  key: string;
  name: string;
  query: string;
  deps: string[];
  data?: unknown[];
  disabled?: string;
};

type Button = {
  key: string;
  name: string;
  query: string;
  deps: string[];
  data?: unknown[];
  disabled?: string;
};
