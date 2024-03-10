"use client";

import { type Address } from "@prisma/client";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Cross1Icon } from "@radix-ui/react-icons";
import { api } from "@/trpc/react";
import Loading from "./Loading";
import ServerError from "./ServerError";
import toast from "react-hot-toast";
import { errorHandler } from "@/utils/errorHandler";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type AddressListProps = {
  enableDeleting?: boolean;
} & (
  | {
      enableSelecting?: false;
    }
  | {
      enableSelecting: true;
      selectedAddress: Address | undefined;
      onSelectedAddressChange: (address: Address) => void;
    }
);

export default function AddressList(props: AddressListProps) {
  const addresses = api.address.all.useQuery();
  const deleteAddress = api.address.delete.useMutation({
    onMutate: ({ id }) => {
      setDeletingAddress(id);
    },
    onSuccess: async (data) => {
      if (typeof data === "string") {
        return toast.error(data);
      }
      await addresses.refetch();
      toast.success("Address deleted successfully");
    },
    onError: errorHandler,
    onSettled: () => {
      setDeletingAddress(undefined);
    },
  });
  const [deletingAddress, setDeletingAddress] = useState<string>();

  useEffect(() => {
    if (props.enableSelecting && addresses.data?.[0]) {
      props.onSelectedAddressChange(addresses.data?.[0]);
    }
  }, [props.enableSelecting, addresses.data]);

  if (addresses.isLoading) {
    return <Loading />;
  }
  if (addresses.isError) {
    return <ServerError message={addresses.error.message} />;
  }
  if (props.enableSelecting) {
    return (
      <RadioGroup
        value={props.selectedAddress?.id ?? ""}
        onValueChange={(addressId) => {
          const address = addresses.data.find((a) => a.id === addressId);
          if (address) {
            props.onSelectedAddressChange(address);
          }
        }}
        className="flex max-h-80 overflow-auto"
      >
        {addresses.data.map((address) => (
          <AddressCard
            address={address}
            key={address.id}
            onDelete={() => deleteAddress.mutate({ id: address.id })}
            isSelected={props.selectedAddress?.id === address.id}
            isDeleting={deletingAddress === address.id}
            enableDeleting={props.enableDeleting ?? false}
            enableSelecting
          />
        ))}
      </RadioGroup>
    );
  }
  return (
    <RadioGroup className="flex max-h-80 overflow-auto">
      {addresses.data.map((address) => (
        <AddressCard
          address={address}
          key={address.id}
          onDelete={() => deleteAddress.mutate({ id: address.id })}
          isDeleting={deletingAddress === address.id}
          enableDeleting={props.enableDeleting ?? false}
        />
      ))}
    </RadioGroup>
  );
}

export function AddressCard({
  address,
  onDelete: handleDelete,
  isDeleting,
  isSelected,
  enableDeleting,
  enableSelecting,
}: {
  address: Address;
  onDelete: () => void;
  isDeleting: boolean;
  isSelected?: boolean;
  enableDeleting: boolean;
  enableSelecting?: true;
}) {
  return (
    <Label className="h-32 w-full min-w-72 max-w-96 shrink-0 px-1">
      <div
        className={cn(
          "flex h-full w-full items-center justify-between gap-1 overflow-clip rounded-md border bg-gray-100 py-2 pe-4 ps-3",
          {
            "shadow-xl": isSelected,
            "shadow-md": !isSelected,
          },
        )}
      >
        {enableSelecting && (
          <div className="px-3">
            <RadioGroupItem value={address.id} />
          </div>
        )}
        <div className="flex flex-grow flex-col">
          {address.tag ? (
            <>
              <div className="pb-1 text-xl font-bold">{address.tag}</div>
              <div className="ps-2 text-sm">{address.addressLine1}</div>
            </>
          ) : (
            <div className="pb-1 text-xl font-bold">{address.addressLine1}</div>
          )}
          <div className="ps-2 text-sm">{address.addressLine2}</div>
          <div className="ps-2 text-sm">
            {address.city} {address.postalCode}
          </div>
          <div className="ps-2 text-sm">
            {address.state.replaceAll("_", " ")} {address.country}
          </div>
        </div>

        {enableDeleting && (
          <Button
            variant="ghost"
            size="sm"
            title="Delete"
            onClick={handleDelete}
            className="h-6 w-6 p-0"
          >
            {isDeleting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Cross1Icon className="text-red-600" />
            )}
          </Button>
        )}
      </div>
    </Label>
  );
}
