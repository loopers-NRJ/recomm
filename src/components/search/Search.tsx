import { SearchIcon } from "lucide-react";
import { useState } from "react";
import Suggestions from "./Suggestions";
import { useRouter } from "next/router";

const Search = () => {
  const [searchKey, setSearchKey] = useState<string | undefined>(undefined);

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void router.push(`/search?q=${searchKey}`);
  };

  return (
    <div className="group relative flex cursor-pointer gap-1 rounded-full border p-2 text-slate-400 transition-colors duration-200 hover:bg-slate-200/50 md:min-w-[200px] md:border-slate-400 md:px-3 md:py-2">
      <form
        onSubmit={handleSubmit}
        className="hidden w-full cursor-pointer md:block"
      >
        <input
          type="text"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          placeholder="Search"
          className=" border-none bg-transparent p-0 text-sm outline-none focus:text-black "
        />
      </form>
      <SearchIcon />
      <Suggestions searchKey={searchKey} />
    </div>
  );
};
export default Search;
