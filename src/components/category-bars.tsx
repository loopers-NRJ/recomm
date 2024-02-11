"use client";
import { type ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/trpc/react";
import { useClientSelectedState } from "@/store/SelectedState";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

function createQueryString(
  searchParams: ReadonlyURLSearchParams,
  name: string,
  value: string,
) {
  const params = new URLSearchParams(searchParams);
  params.set(name, value);
  return params.toString();
}

const DesktopCategoryBar = () => {
  return <div>Desktop</div>;
};

const MobileCategoryBar = () => {
  const searchParams = useSearchParams();
  const selectedState = useClientSelectedState((selected) => selected.state);
  const catergoriesQuery = api.category.featured.useQuery({
    state: selectedState,
  });

  const [expanded, setExpanded] = useState(false);

  const list = api.category.allWithoutPayload.useQuery({
    parentId: undefined,
    state: selectedState,
  });
  return (
    <div className="mb-5 grid min-h-[200px] grid-cols-4 grid-rows-2 gap-2">
      {catergoriesQuery.data?.categories.map(({ category, image }) => {
        const url =
          "/products/?" +
          createQueryString(searchParams, "category", category.id);
        return (
          <CategoryBox
            key={category.id}
            label={category.name}
            link={url}
            image={image.url}
          />
        );
      })}
      <div
        onClick={() => setExpanded(true)}
        className="flex h-full w-full items-center justify-center rounded-xl border text-sm font-bold"
      >
        See All
      </div>
      <aside
        className={`selection-box ${
          !expanded && "hidden"
        } fixed left-0 top-0 z-[99] h-screen w-screen bg-white`}
      >
        <h1 className="flex">
          <ArrowLeft onClick={() => setExpanded(false)} />
          Categories
        </h1>
        <ul>
          {list.data?.categories.map((ele) =>
            ele.parentCategoryId == null ? (
              <h1 key={ele.id}>{ele.name}</h1>
            ) : null,
          )}
        </ul>
      </aside>
    </div>
  );
};

interface CategoryBoxProps {
  image: string;
  label: string;
  link: string;
}

const CategoryBox: React.FC<CategoryBoxProps> = ({ image, label, link }) => {
  return (
    <Link
      href={link}
      className="flex h-full w-full flex-col items-center justify-center rounded-xl border bg-white shadow-md"
    >
      <Image src={image} width={30} height={30} alt={label} className="m-2" />
      <label className="text-sm font-medium">{label}</label>
    </Link>
  );
};

export { DesktopCategoryBar, MobileCategoryBar };
