"use client"

import AddressList from "@/components/common/AddressList"
import DetailsForm from "@/app/login/details/details-form";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { usePathname } from "next/navigation";

export default function AddressEditArea() {
     return (
          <section>
               <header className="flex justify-between items-center mb-5 mt-8 px-2 w-full">
                    <span className="text-xl leading-none font-bold">Addresses</span>
                    <AddAddressButton />
               </header>
               <AddressList enableUpdate enableDeleting />
          </section>
     )
}

export function AddAddressButton() {
     const pathname = usePathname();
     return (
          <Drawer>
               <DrawerTrigger asChild>
                    <Button size="sm" className="bg-sky-500 focus:bg-sky-600">New</Button>
               </DrawerTrigger>
               <DrawerContent className="p-5">
                    <DetailsForm addressOnly callbackUrl={pathname} />
               </DrawerContent>
          </Drawer>
     );
}
