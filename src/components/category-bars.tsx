"use client";

import {
  type ReadonlyURLSearchParams,
  useSearchParams,
  useRouter,
} from "next/navigation";
import Link from "next/link";
import { api } from "@/trpc/react";
import { useClientSelectedState } from "@/store/SelectedState";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { $Enums } from "@prisma/client";
import LoadingFeatured from "./loading/LoadingFeatured";

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
  return <div> Desktop </div>;
};

const MobileCategoryBar = () => {
  const searchParams = useSearchParams();
  const selectedState = useClientSelectedState((selected) => selected.state);

  const [expanded, setExpanded] = useState(false);

  const catergoriesQuery = api.category.featured.useQuery({
    state: selectedState,
  });

  if (catergoriesQuery.isLoading) {
    return <LoadingFeatured />;
  }

  return (
    <>
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { duration: 0.5, staggerChildren: 0.03 },
          },
        }}
        initial="hidden"
        animate="show"
        className="mb-5 grid min-h-[200px] grid-cols-4 grid-rows-2 gap-2"
      >
        {catergoriesQuery.data?.categories.map(({ category, image }) => {
          const url =
            "/products/?" +
            createQueryString(searchParams, "category", category.slug);
          return (
            <motion.div key={category.id} variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} >
              <CategoryBox
                label={category.name}
                link={url}
                image={image.url}
              />
            </motion.div>
          );
        })}
        <motion.div
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
          onClick={() => setExpanded(true)}
          className="flex h-full w-full items-center justify-center rounded-xl border text-sm font-bold"
        >
          See All
        </motion.div>
      </motion.div>
      <SeeAll state={selectedState} searchParams={searchParams} expanded={expanded} setExpanded={(val) => setExpanded(val)} />
    </>
  );
};

export function SeeAll(
  {
    state,
    searchParams,
    expanded,
    setExpanded
  }: {
    state: $Enums.State,
    searchParams: ReadonlyURLSearchParams,
    expanded: boolean,
    setExpanded: (expanded: boolean) => void
  }) {

  const router = useRouter();
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [parentSlug, setParentSlug] = useState<string | undefined>(undefined);

  const list = api.category.all.useQuery({
    parentId: parentId,
    state
  });

  return <aside className={`selection-box ${!expanded && "hidden"} fixed left-0 top-0 z-[99] h-screen w-screen bg-white`}>
    <h1 className="flex items-center text-xl font-bold">
      <ArrowLeft
        onClick={() => {
          setExpanded(false);
          setParentId(undefined);
          setParentSlug(undefined);
        }}
        className="m-5"
      />
      Categories
    </h1>
    <ul className="my-3 flex h-full w-full flex-col justify-start gap-3 overflow-scroll px-5">
      {list.error && <div>Error</div>}
      {list.isLoading && <Loader2 />}
      {list.data?.categories.length == 0
        ? parentSlug &&
        void router.push(
          "/products?" +
          createQueryString(searchParams, "category", parentSlug),
        )
        : list.data?.categories.map((category, i) => (
          <li key={i} className="text-md rounded-lg border p-3 font-medium" >
            {category.parentCategoryId == null ? (
              <span
                className="flex w-full justify-between"
                key={category.id}
                onClick={() => {
                  setParentId(category.id);
                  setParentSlug(category.slug);
                }}
              >
                {category.name}
                <ArrowRight />
              </span>
            ) : parentId == category.parentCategoryId ? (
              <Link
                className="flex w-full justify-between"
                key={category.id}
                href={"/products?" + createQueryString(searchParams, "category", category.slug)}
              >
                {category.name}
                <ArrowRight />
              </Link>
            ) : null}
          </li>
        ))}
    </ul>
  </aside>
}

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
      <Image src={image} width={50} height={50} alt={label} className="m-1" />
      <label className="text-xs font-medium text-center w-full px-2">{label}</label>
    </Link>
  );
};

export { DesktopCategoryBar, MobileCategoryBar };
