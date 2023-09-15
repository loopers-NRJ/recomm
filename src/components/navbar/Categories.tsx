"use client";

import { useEffect, useState } from "react";
import { BiHome, BiSolidCar } from "react-icons/bi";
import { IconType } from "react-icons/lib/esm/iconBase";

import { api } from "@/utils/api";

import Container from "../Container";
import { toast } from "../ui/use-toast";
import CategoryBox from "./CategoryBox";
import LoadingCategories from "./LoadingCategories";

interface Icon {
  label: string;
  icon: IconType;
}
const Categories = () => {
  const { data, isLoading } = api.category.getCategories.useQuery({});
  const [categories, setCategories] = useState<Icon[]>([]);
  const [categoryLoading, setCategoryLoading] = useState<boolean>(true);
  useEffect(() => {
    const importIcons = async () => {
      const { BiHomeHeart } = await import("react-icons/bi");
      const { LuDog, LuStethoscope } = await import("react-icons/lu");
      const {
        MdDevices,
        MdOutlineChair,
        MdOutlineDiamond,
        MdOutlineLocalGroceryStore,
        MdSportsSoccer,
      } = await import("react-icons/md");
      const { PiDressBold, PiEyeClosedBold } = await import("react-icons/pi");
      const { TbHorseToy, TbTool } = await import("react-icons/tb");
      setCategories([
        {
          label: "Electronics",
          icon: MdDevices,
        },
        {
          label: "Automobiles",
          icon: BiSolidCar,
        },
        {
          label: "Clothing",
          icon: PiDressBold,
        },
        {
          label: "Furniture",
          icon: MdOutlineChair,
        },
        {
          label: "Beauty",
          icon: PiEyeClosedBold,
        },
        {
          label: "Sports",
          icon: MdSportsSoccer,
        },
        {
          label: "Toys",
          icon: TbHorseToy,
        },
        {
          label: "Groceries",
          icon: MdOutlineLocalGroceryStore,
        },
        {
          label: "Jewelry",
          icon: MdOutlineDiamond,
        },
        {
          label: "Health",
          icon: LuStethoscope,
        },
        {
          label: "Pets",
          icon: LuDog,
        },
        {
          label: "Decor",
          icon: BiHomeHeart,
        },
        {
          label: "Tools",
          icon: TbTool,
        },
      ]);
      setCategoryLoading(false);
    };

    void importIcons();
  }, []);

  if (data instanceof Error) {
    return toast({
      title: "Error",
      description: data.message,
      variant: "destructive",
    });
  }

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
      <div className="flex flex-row items-center justify-between overflow-x-auto pt-4">
        <CategoryBox label="All" icon={BiHome} />
        {categories.map((item, i) => (
          <CategoryBox
            key={item.label}
            label={item.label}
            icon={item.icon}
            id={
              data instanceof Error || data === undefined
                ? undefined
                : data[i]?.id
            }
          />
        ))}
      </div>
    </Container>
  );
};

export default Categories;
