"use client";

import { FC } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brand, Category, Model } from "@prisma/client";

interface Props {
  array: Category[] | Brand[] | Model[];
  isLoading: boolean;
  isError: boolean;
  placeholder?: string;
}

const Selector: FC<Props> = ({ array, isLoading, isError, placeholder }) => {
  return (
    <Select>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder ?? ""} />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem value="" disabled>
            Loading...
          </SelectItem>
        ) : isError ? (
          <SelectItem value="" disabled>
            No data found
          </SelectItem>
        ) : (
          array?.map((data) => (
            <SelectItem key={data.id} value={data.name}>
              {data.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};
export default Selector;
