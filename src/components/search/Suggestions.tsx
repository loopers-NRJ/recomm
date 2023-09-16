import { useRouter } from "next/router";
import { FC, useEffect } from "react";

import { api } from "@/utils/api";
import { debounce } from "@/utils/helper";

interface SuggestionProps {
  searchKey: string | undefined;
}

const Suggestions: FC<SuggestionProps> = ({ searchKey }) => {
  const router = useRouter();
  const {
    data: suggestions,
    isLoading,
    refetch,
  } = api.search.all.useQuery({ search: searchKey });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (searchKey && searchKey.length > 2) {
      debounce(() => void refetch())();
    }
    return () => {
      clearTimeout(timer);
    };
  }, [refetch, searchKey]);

  if (isLoading)
    return (
      <div
        className={`suggestions absolute left-0 top-10 rounded-md border bg-white text-center md:w-[100px] lg:w-[300px]`}
      >
        Loading...
      </div>
    );
  if (suggestions instanceof Error)
    return (
      <div
        className={`suggestions absolute left-0 top-10 rounded-md border bg-white md:w-[100px] lg:w-[300px]`}
      >
        {suggestions.message}
      </div>
    );

  if (suggestions === undefined) {
    return (
      <div
        className={`suggestions absolute left-0 top-10 rounded-md border bg-white md:w-[100px] lg:w-[300px]`}
      >
        No Suggestions
      </div>
    );
  }

  const { categories, brands, models } = suggestions;

  return (
    <div
      className={`suggestions absolute left-0 top-10 w-full rounded-md border bg-white md:w-[100px] lg:w-[300px] ${
        categories.length === 0 && brands.length === 0 && models.length === 0
          ? `hidden`
          : `block`
      }`}
    >
      {categories.map((category) => (
        <div
          key={category.id}
          onClick={() => {
            void router.push(`/products/?category=${category.id}`);
          }}
          className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-200/50"
        >
          <span>{category.name}</span>
          <span className="text-slate-500">in Category</span>
        </div>
      ))}
      {brands.map((brand) => (
        <div
          key={brand.id}
          onClick={() => {
            void router.push(`/products/?brand=${brand.id}`);
          }}
          className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-200/50"
        >
          <span>{brand.name}</span>
          <span className="text-slate-500">in Brand</span>
        </div>
      ))}
      {models.map((modal) => (
        <div
          key={modal.id}
          onClick={() => {
            void router.push(`/products/?model=${modal.id}`);
          }}
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
