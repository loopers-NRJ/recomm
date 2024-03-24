"use client";
import Products from "@/components/products-area";
import type { RouterInputs } from "@/trpc/shared";
import React, { useState } from "react";
import SortDrawer from "./sort-drawer";
import FilterDrawer from "./filter-drawer";
import { api } from "@/trpc/react";
import { useClientselectedCity } from "@/store/ClientSelectedCity";
import { useRouter } from "next/navigation";

interface SearchParams {
  search?: string;
  sortBy: RouterInputs["product"]["all"]["sortBy"];
  sortOrder: RouterInputs["product"]["all"]["sortOrder"];
  model?: string;
  category?: string;
  brand?: string;
}

function MobileProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const [inputParams, setInputParams] = useState<SearchParams>(searchParams);
  const router = useRouter();

  const makeQuery = (params?: SearchParams) => {
    if (!params) return "/products";
    const query = new URLSearchParams();
    for (const key in params) {
      if (params[key as keyof typeof searchParams])
        query.append(key, params[key as keyof typeof searchParams]!);
    }
    return "/products?" + query.toString();
  };

  const onSortChange = (
    sortBy: SearchParams["sortBy"],
    sortOrder: SearchParams["sortOrder"],
  ) => {
    let newParams = undefined;
    setInputParams((inputParams) => {
      const res = { ...inputParams, sortBy, sortOrder };
      newParams = res;
      return res;
    });
    router.replace(makeQuery(newParams));
  };

  const onFilterChange = (
    model?: string,
    category?: string,
    brand?: string,
  ) => {
    let newParams = undefined;
    setInputParams((inputParams) => {
      const res = { ...inputParams, model, category, brand };
      newParams = res;
      return res;
    });
    router.replace(makeQuery(newParams));
  };

  const city = useClientselectedCity((selected) => selected.city?.value);
  const { data: models } = api.model.all.useQuery({ city });
  const { data: brands } = api.brand.all.useQuery({ city });
  const { data: categories } = api.category.all.useQuery({ city });

  const values = {
    models: models?.models ?? [],
    brands: brands?.brands ?? [],
    categories: categories?.categories ?? [],
  };

  return (
    <>
      <div className="mx-2 mb-4 flex items-center justify-between gap-2">
        <h1 className="my-4 text-xl font-semibold">Products</h1>
        <div className="icons grid grid-cols-2 gap-3">
          <SortDrawer params={inputParams} onSortChange={onSortChange} />
          {models && categories && brands && (
            <FilterDrawer
              params={inputParams}
              values={values}
              setFilter={onFilterChange}
            />
          )}
        </div>
      </div>
      <Products {...inputParams} />
    </>
  );
}

export default MobileProductsPage;
