"use client";
import { FC, useEffect, useState } from "react";

import { api } from "@/utils/api";

import Container from "../Container";
import CategoryBox from "./CategoryBox";
import LoadingCategories from "./LoadingCategories";

interface Icon {
  label: string;
  icon: JSX.Element;
}

// const HomeIcon = (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     viewBox="0 0 24 24"
//     fill="currentColor"
//     className="h-6 w-6"
//   >
//     <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
//     <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
//   </svg>
// );

const CarIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="25"
    height="25"
    viewBox="0 0 24 24"
    id="car"
  >
    <path fill="none" d="M0 0h24v24H0V0z"></path>
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01l-1.97 5.67c-.07.21-.11.43-.11.66v7.16c0 .83.67 1.5 1.5 1.5S6 20.33 6 19.5V19h12v.5c0 .82.67 1.5 1.5 1.5.82 0 1.5-.67 1.5-1.5v-7.16c0-.22-.04-.45-.11-.66l-1.97-5.67zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.27-3.82c.14-.4.52-.68.95-.68h9.56c.43 0 .81.28.95.68L19 11H5z"></path>
  </svg>
);

const Categories: FC = () => {
  const { data, isLoading } = api.category.getCategories.useQuery({});
  const [categories, setCategories] = useState<Icon[]>([]);
  const [categoryLoading, setCategoryLoading] = useState<boolean>(true);

  useEffect(() => {
    const importIcons = async () => {
      setCategories([
        {
          label: "Electronics",
          icon: CarIcon,
        },
        {
          label: "Automobiles",
          icon: CarIcon,
        },
        {
          label: "Clothing",
          icon: CarIcon,
        },
        {
          label: "Furniture",
          icon: CarIcon,
        },
        {
          label: "Beauty",
          icon: CarIcon,
        },
        {
          label: "Sports",
          icon: CarIcon,
        },
        {
          label: "Toys",
          icon: CarIcon,
        },
        {
          label: "Jewelry",
          icon: CarIcon,
        },
        {
          label: "Books",
          icon: CarIcon,
        },
        {
          label: "Pets",
          icon: CarIcon,
        },
        {
          label: "Kitchen",
          icon: CarIcon,
        },
        {
          label: "Luxury",
          icon: CarIcon,
        },
      ]);
      setCategoryLoading(false);
    };

    void importIcons();
  }, []);

  // if (isError) {
  //   switch (error.data?.code) {
  //     case "BAD_REQUEST":
  //       return toast({
  //         title: "Error",
  //         description: error.message,
  //         variant: "destructive",
  //       });
  //     case "UNAUTHORIZED":
  //       return toast({
  //         title: "Error",
  //         description: error.message,
  //         variant: "destructive",
  //       });
  //   }
  //   return toast({
  //     title: "Error",
  //     description: "Something went wrong",
  //     variant: "destructive",
  //   });
  // }

  if (isLoading || data === undefined || categoryLoading) {
    return <LoadingCategories />;
  }

  return (
    <Container>
      <div className="flex flex-row items-center justify-between overflow-x-auto transition-opacity">
        {/* <CategoryBox label="All" icon={HomeIcon} /> */}
        {categories.map((item) => (
          <CategoryBox
            key={item.label}
            label={item.label}
            icon={item.icon}
            id={undefined}
          />
        ))}
      </div>
    </Container>
  );
};

export default Categories;
