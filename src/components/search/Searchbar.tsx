import { useRouter } from "next/router";
import { useState } from "react";

import { Input } from "../ui/input";
import Suggestions from "./Suggestions";
import { BiSearch } from "react-icons/bi";

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
        <BiSearch className="h-6 w-6 md:hidden" />
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
