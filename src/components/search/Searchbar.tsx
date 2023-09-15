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
        className="hidden w-full cursor-pointer md:block"
      >
        <Input
          type="text"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          placeholder="Search ..."
          className="mr-2 focus:outline-none focus:ring-0 md:w-[100px] lg:w-[300px]"
          // className=" border-none bg-transparent p-0 text-sm outline-none focus:text-black "
        />
      </form>
      <Suggestions searchKey={searchKey} />
    </div>
  );
};
export default Search;
