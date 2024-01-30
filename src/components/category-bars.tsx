"use client"
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/trpc/react"
import { useClientSelectedState } from "@/store/SelectedState"
import Image from "next/image";

function createQueryString(searchParams: ReadonlyURLSearchParams, name: string, value: string) {
  const params = new URLSearchParams(searchParams);
  params.set(name, value);
  return params.toString();
};

const DesktopCategoryBar = () => {

  return (
    <div>
      Desktop
    </div>
  )
}

const MobileCategoryBar = () => {
  const searchParams = useSearchParams();
  const selectedState = useClientSelectedState((selected) => selected.state);
  const catergoriesQuery = api.category.featured.useQuery({
    state: selectedState,
  });

  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-2 mb-5 min-h-[200px]">
      {catergoriesQuery.data?.categories.map(({ category, image }) => {
        const url = "/products/?" + createQueryString(searchParams, "category", category.id);
        return <CategoryBox key={category.id} label={category.name} link={url} image={image.url} />
      })}
      <Link href="/products/"></Link>
    </div>
  )
}


interface CategoryBoxProps {
  image: string;
  label: string;
  link: string;
}

const CategoryBox: React.FC<CategoryBoxProps> = ({ image, label, link }) => {
  return (
      <Link href={link} className="flex flex-col justify-center items-center bg-white border rounded-xl shadow-md w-full h-full">
        <Image src={image} width={30} height={30} alt={label} className="m-2" />
        <label className="text-sm font-medium">{label}</label>
      </Link>
  );
};

export { DesktopCategoryBar, MobileCategoryBar }
