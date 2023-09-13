"use client";

import { useEffect, useState } from "react";
import { IconType } from "react-icons/lib/esm/iconBase";

import { api } from "@/utils/api";

import Container from "../Container";
import CategoryBox from "./CategoryBox";

interface Icon {
  label: string;
  icon: IconType;
  description: string;
}
const Categories = () => {
  const { data } = api.category.getCategories.useQuery({});
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
          description: "This property is close to the beach!",
        },
        {
          label: "Clothing",
          icon: PiDressBold,
          description: "This property is has windmills!",
        },
        {
          label: "Furniture",
          icon: MdOutlineChair,
          description: "This property is modern!",
        },
        {
          label: "Beauty",
          icon: PiEyeClosedBold,
          description: "This property is in the countryside!",
        },
        {
          label: "Sports",
          icon: MdSportsSoccer,
          description: "This is property has a beautiful pool!",
        },
        {
          label: "Toys",
          icon: TbHorseToy,
          description: "This property is on an island!",
        },
        {
          label: "Groceries",
          icon: MdOutlineLocalGroceryStore,
          description: "This property is near a lake!",
        },
        {
          label: "Jewelry",
          icon: MdOutlineDiamond,
          description: "This property has skiing activies!",
        },
        {
          label: "Health",
          icon: LuStethoscope,
          description: "This property is an ancient castle!",
        },
        {
          label: "Pets",
          icon: LuDog,
          description: "This property is in a spooky cave!",
        },
        {
          label: "Decor",
          icon: BiHomeHeart,
          description: "This property offers camping activities!",
        },
        {
          label: "Tools",
          icon: TbTool,
          description: "This property is in arctic environment!",
        },
      ]);
      setCategoryLoading(false);
    };

    void importIcons();
  }, []);

  if (data instanceof Error) return <div>Error</div>;
  if (data === undefined) return <div>Loading...</div>;
  // TODO: improve the loading
  if (categoryLoading) return <div>Loading...</div>;

  return (
    <Container>
      <div
        className="
          flex
          flex-row 
          items-center 
          justify-between 
          overflow-x-auto
          pt-4
        "
      >
        {/* <CategoryBox label="All" icon={BiHome} /> */}
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
