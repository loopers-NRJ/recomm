"use client"
import { type ReadonlyURLSearchParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/trpc/react"
import { useClientSelectedState } from "@/store/SelectedState"
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

function createQueryString(searchParams: ReadonlyURLSearchParams, name: string, value: string) {
  const params = new URLSearchParams(searchParams);
  params.set(name, value);
  return params.toString();
};

const DesktopCategoryBar = () => {
  return <div> Desktop </div>
}

const MobileCategoryBar = () => {
  const searchParams = useSearchParams();
  const selectedState = useClientSelectedState((selected) => selected.state);
  const router = useRouter();
  const catergoriesQuery = api.category.featured.useQuery({
    state: selectedState,
  });

  const [expanded, setExpanded] = useState(false);
  const [parentId, setParentId] = useState<string | undefined>(undefined);

  const list = api.category.allWithoutPayload.useQuery({
    parentId: parentId,
    state: selectedState
  })

  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-2 mb-5 min-h-[200px]">
      {catergoriesQuery.data?.categories.map(({ category, image }) => {
        const url = "/products/?" + createQueryString(searchParams, "category", category.id);
        return <CategoryBox key={category.id} label={category.name} link={url} image={image.url} />
      })}
      <div onClick={() => setExpanded(true)} className="flex justify-center items-center border rounded-xl w-full h-full font-bold text-sm">
        See All
      </div>
      <aside
        className={`selection-box ${!expanded && "hidden"} fixed top-0 left-0 h-screen w-screen z-[99] bg-white`}
      >
        <h1 className="flex">
          <ArrowLeft onClick={() => {
            setExpanded(false)
            setParentId(undefined)
          }} />
          Categories
        </h1>
        <ul>
          {list.error && <div>Error</div>}
          {list.isLoading && <Loader2 />}
          {list.data?.categories.length == 0 ?
            parentId && void router.push("/products?" + createQueryString(searchParams, "category", parentId))
            : list.data?.categories.map(category => {
              if (category.parentCategoryId == null) {
                return <li key={category.id} onClick={() => setParentId(category.id)}>{category.name}</li>
              } else if (parentId == category.parentCategoryId) {
                const url = "/products?" + createQueryString(searchParams, "category", category.id);
                return <Link key={category.id} href={url}><li>{category.name}</li></Link>
              }
            })}
        </ul>
      </aside>
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
