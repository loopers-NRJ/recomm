import FilterDrawer from "./filter-drawer";
import SortDrawer from "./sort-drawer";

const FilterBarMobile = () => {
  return (
    <div className="flex justify-between items-center gap-2 mx-2 mb-4">
      <h1 className="text-xl font-semibold my-4">Products</h1>
      <div className="icons grid grid-cols-2 gap-3">
        <SortDrawer />
        <FilterDrawer />
      </div>
    </div>
  )
};

export default FilterBarMobile;
