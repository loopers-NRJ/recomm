"use client";

import DetailsForm from "@/app/login/details/details-form";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { usePathname } from "next/navigation";

function AddAddressButton() {
  const pathname = usePathname();
  return (
    <Drawer>
      <DrawerTrigger className="my-5 w-full" asChild>
        <Button size="lg" className="bg-sky-500 focus:bg-sky-600">
          Add Address
        </Button>
      </DrawerTrigger>
      <DrawerContent className="p-5">
        <DetailsForm addressOnly callbackUrl={pathname} />
      </DrawerContent>
    </Drawer>
  );
}

export default AddAddressButton;
