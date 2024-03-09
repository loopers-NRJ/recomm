"use client"
import Products from '@/components/products-area';
import type { RouterInputs } from '@/trpc/shared';
import React, { useState } from 'react'
import SortDrawer from './sort-drawer';
import FilterDrawer from './filter-drawer';
import { api } from '@/trpc/react';
import { useClientSelectedState } from '@/store/SelectedState';
import { useRouter } from 'next/navigation';

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
      if (params[key as keyof typeof searchParams]) query.append(key, params[key as keyof typeof searchParams]!);
    }
    return "/products?" + query.toString();
  }

  const onSortChange = (sortBy: SearchParams["sortBy"], sortOrder: SearchParams["sortOrder"]) => {
    let newParams = undefined;
    setInputParams(inputParams => {
      const res = { ...inputParams, sortBy, sortOrder }
      newParams = res;
      return res;
    })
    router.replace(makeQuery(newParams));
  }

  const onFilterChange = (model?: string, category?: string, brand?: string) => {
    let newParams = undefined;
    setInputParams(inputParams => {
      const res = {...inputParams, model, category, brand }
      newParams = res;
      return res;
    })
    router.replace(makeQuery(newParams));
  }

  const { state } = useClientSelectedState();
  const {data: models} = api.model.all.useQuery({state});
  const {data: brands} = api.brand.all.useQuery({state});
  const { data: categories } = api.category.allWithoutPayload.useQuery({state});

  const values = { 
    models: models?.models ?? [],
    brands : brands?.brands ?? [],
    categories: categories?.categories ?? []
  };

  return (
    <>
      <div className="flex justify-between items-center gap-2 mx-2 mb-4">
        <h1 className="text-xl font-semibold my-4">Products</h1>
        <div className="icons grid grid-cols-2 gap-3">
          <SortDrawer params={inputParams} onSortChange={onSortChange} />
          {models && categories && brands && (
          <FilterDrawer params={inputParams} values={values} setFilter={onFilterChange} />)}
        </div>
      </div>
      <Products {...inputParams} />
    </>
  )
}

export default MobileProductsPage
