"use client";

import { type Address } from "@prisma/client";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { api } from "@/trpc/react";
import Loading from "./Loading";
import ServerError from "./ServerError";
import toast from "react-hot-toast";
import { errorHandler } from "@/utils/errorHandler";
import { Loader2, Trash2 } from "lucide-react";
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
        className="flex flex-col"
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
    <div className="flex flex-col">
      {addresses.data.map((address) => (
        <AddressCard
          address={address}
          key={address.id}
          onDelete={() => deleteAddress.mutate({ id: address.id })}
          isDeleting={deletingAddress === address.id}
          enableDeleting={props.enableDeleting ?? false}
        />
      ))}
    </div>
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
    <div className="flex items-center justify-between p-5 border rounded-lg bg-white mb-1 shadow-md" >
      <Label className="flex items-center w-full">
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

      </Label>
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
            <Trash2 className="text-red-600" />
          )}
        </Button>
      )}
    </div>
  );
}
