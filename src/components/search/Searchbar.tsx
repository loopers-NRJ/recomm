import { useRouter } from "next/router";
import { useState } from "react";

import { Input } from "../ui/input";
import Suggestions from "./Suggestions";

const Search = () => {
  const [searchKey, setSearchKey] = useState<string>("");

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void router.push(`/products?search=${searchKey}`);
  };

  return (
    <div className="group relative flex cursor-pointer text-slate-400 transition-colors duration-200">
      <form
        onSubmit={handleSubmit}
        className="group flex w-full cursor-pointer items-center justify-center"
      >
        <div className="h-6 w-6 md:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
          >
            <path
              fillRule="evenodd"
              d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <Input
          type="text"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          placeholder="Search ..."
          className="mr-2 hidden focus:outline-none focus:ring-0 md:block md:w-[100px] lg:w-[300px]"
        />
      </form>
      <Suggestions searchKey={searchKey} />
    </div>
  );
};
export default Search;
