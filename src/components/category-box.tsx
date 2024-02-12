"use client";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

interface CategoryBoxProps {
  icon: JSX.Element;
  label: string;
  id?: string;
}

const CategoryBox: React.FC<CategoryBoxProps> = ({ icon, label, id }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(name, value);

    return params.toString();
  };

  const selected =
    searchParams.get("category") === null && label === "All"
      ? true
      : searchParams.get("category") === id;

  return (
    <Link
      href={id ? `${pathname}?${createQueryString("category", id)}` : pathname}
      className={`
        flex cursor-pointer flex-col items-center justify-between gap-2 border-b-2 p-3 transition hover:text-neutral-800
        ${selected ? "border-b-neutral-800" : "border-transparent"}
        ${selected ? "text-neutral-800" : "text-neutral-500"}
      `}
    >
      {icon}
      <div className="text-sm font-medium">{label}</div>
    </Link>
  );
};

export default CategoryBox;
