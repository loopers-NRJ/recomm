"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AiFillPlusCircle } from "react-icons/ai";

export default function AddWish(): JSX.Element {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* Plus icon */}
        <AiFillPlusCircle className="fixed bottom-5 right-5 text-5xl" />
      </DialogTrigger>
      <DialogContent className="w-[350px] md:w-full">
        <DialogHeader>
          <DialogTitle>Edit Wish Details</DialogTitle>
          <DialogDescription>
            Enter details below to Add a Product Wish.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Input id="category" value="Mobile" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="brand" className="text-right">
              Brand
            </Label>
            <Input id="brand" value="Nothing" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">
              Model
            </Label>
            <Input id="model" value="Phone 1" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Add to List</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
