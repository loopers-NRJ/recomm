import { SearchIcon } from "lucide-react";

const Search = () => {
  return (
    <div className="group flex cursor-pointer gap-1 rounded-full border p-2 text-slate-400 transition-colors duration-200 hover:bg-slate-200/50 md:min-w-[200px] md:border-slate-400 md:px-3 md:py-2">
      <input
        type="text"
        className="hidden w-full cursor-pointer border-none bg-transparent p-0 outline-none focus:text-black md:block"
        placeholder="Search"
      />
      <SearchIcon />
    </div>
  );
};
export default Search;
