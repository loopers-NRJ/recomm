"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useCallback } from "react";
// import { useCallback } from "react";
import { IconType } from "react-icons";

interface CategoryBoxProps {
  icon: IconType;
  label: string;
  id?: string;
}

const CategoryBox: React.FC<CategoryBoxProps> = ({ icon: Icon, label, id }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  console.log(pathname);

  const selected =
    searchParams.get("category") === null && id === undefined
      ? true
      : searchParams.get("category") === id;

  return (
    <div
      onClick={() => {
        router
          .push(
            id ? `${pathname}?${createQueryString("category", id)}` : pathname
          )
          .catch((err) => console.log(err));
      }}
      className={`
        flex cursor-pointer flex-col items-center justify-center gap-2 border-b-2 p-3 transition hover:text-neutral-800
        ${selected ? "border-b-neutral-800" : "border-transparent"}
        ${selected ? "text-neutral-800" : "text-neutral-500"}
      `}
    >
      <Icon size={26} />
      <div className="text-sm font-medium">{label}</div>
    </div>
  );
};

export default CategoryBox;
