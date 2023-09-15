export interface Item {
  id: string;
  name: string;
}

export type FetchItems = (input: unknown) => {
  data: Item[] | Error | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

export type OptionalItem = Item | undefined;
