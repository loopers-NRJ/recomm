"use client";
import { FC } from "react";

import { api } from "@/utils/api";

import Container from "../Container";
import CategoryBox from "./CategoryBox";
import LoadingCategories from "./LoadingCategories";
import Image from "next/image";

const Categories: FC = () => {
  const categoriesApi = api.category.getFeaturedCategories.useQuery({});
  if (categoriesApi.isLoading || categoriesApi.data === undefined) {
    return <LoadingCategories />;
  }
  const { categories } = categoriesApi.data;
  return (
    <Container>
      <div className="flex flex-row items-center justify-start transition-opacity">
        {categories.map((item) => (
          <CategoryBox
            key={item.category.id}
            label={item.category.name}
            icon={
              <Image
                src={item.image.url}
                alt="Category Icon"
                width={45}
                height={45}
                className="h-10 w-10"
              />
            }
            id={item.category.id}
          />
        ))}
      </div>
    </Container>
  );
};

export default Categories;
