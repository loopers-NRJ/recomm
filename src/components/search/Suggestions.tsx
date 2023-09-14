import { api } from "@/utils/api";
import { FC, useEffect } from "react";

interface SuggestionProps {
  searchKey: string | undefined;
}

const Suggestions: FC<SuggestionProps> = ({ searchKey }) => {
  console.log(searchKey);

  const {
    data: suggestions,
    isLoading,
    refetch,
  } = api.search.all.useQuery({ search: searchKey });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (searchKey && searchKey.length > 2) {
      timer = setTimeout(() => {
        void refetch();
      }, 500);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [searchKey]);

  if (isLoading)
    return (
      <div
        className={`suggestions absolute left-0 top-10 w-full border bg-white`}
      >
        Loading...
      </div>
    );
  if (suggestions instanceof Error)
    return (
      <div
        className={`suggestions absolute left-0 top-10 w-full border bg-white`}
      >
        {suggestions.message}
      </div>
    );

  const { categories, brands, models } = suggestions!;

  console.log(suggestions);

  return (
    <div
      className={`suggestions absolute left-0 top-10 w-full border bg-white ${
        categories === undefined ||
        brands === undefined ||
        models === undefined ||
        (categories.length === 0 && brands.length === 0 && models.length === 0)
          ? `hidden`
          : `block`
      }`}
    >
      {categories?.map((category) => (
        <div
          key={category.id}
          className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-200/50"
        >
          <span>{category.name}</span>
          <span className="text-slate-500">in Category</span>
        </div>
      ))}
      {brands?.map((brand) => (
        <div
          key={brand.id}
          className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-200/50"
        >
          <span>{brand.name}</span>
          <span className="text-slate-500">in Brand</span>
        </div>
      ))}
      {models?.map((modal) => (
        <div
          key={modal.id}
          className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-200/50"
        >
          <span>{modal.name}</span>
          <span className="text-slate-500">in Modal</span>
        </div>
      ))}
    </div>
  );
};
export default Suggestions;
