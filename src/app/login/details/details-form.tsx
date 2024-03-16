"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Address, User } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { states } from "@/types/prisma";
import { z } from "zod";
import { useClientSelectedState } from "@/store/SelectedState";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { addressSchema } from "@/utils/validation";
import { errorHandler } from "@/utils/errorHandler";
import { TRPCClientError } from "@trpc/client";

interface FormProps {
  userData?: User;
  callbackUrl?: string;
  addressOnly?: boolean;
  afterSave?: () => void;
  edit?: boolean,
  address?: Address
}

const detailsFormSchema = addressSchema.extend({
  fullName: z.string().trim().optional(),
  phoneNumber: z.string().trim().optional(),
});

type DetailsFormValues = z.infer<typeof detailsFormSchema>;

const DetailsForm = ({
  userData,
  address,
  edit,
  callbackUrl,
  addressOnly = false,
  afterSave,
}: FormProps) => {
  const { state } = useClientSelectedState();
  const router = useRouter();
  const createAddress = api.address.create.useMutation();
  const updateUserMobile = api.user.update.useMutation();
  const updateAddress = api.address.update.useMutation();

  const defaultValues = {
    tag: address?.tag ?? "",
    fullName: userData?.name ?? "",
    addressLine1: address?.addressLine1 ?? "",
    addressLine2: address?.addressLine2 ?? "",
    city: address?.city ?? "",
    state: address?.state ?? state,
    country: address?.country ?? "",
    postalCode: address?.postalCode ?? "",
    phoneNumber: userData?.mobile ?? "",
  };

  const form = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      if (addressOnly && !edit) {
        const result = await createAddress.mutateAsync(data);
        if (typeof result === "string") return toast.error(result);
      } else if (addressOnly && edit) {
        const result = await updateAddress.mutateAsync({ id: address?.id!, ...data }); // eslint-disable-line
        if (typeof result === "string") return toast.error(result);
      } else {
        const [result1, result2] = await Promise.all([
          createAddress.mutateAsync(data),
          updateUserMobile.mutateAsync({
            name: data.fullName,
            mobile: data.phoneNumber,
          }),
        ]);
        if (typeof result1 === "string") return toast.error(result1);
        if (typeof result2 === "string") return toast.error(result2);
      }
      toast.success("Saved Successfully!");
      if (callbackUrl) {
        if (afterSave) return afterSave();
        router.refresh();
        return router.push(callbackUrl);
      }
      return router.push("/");
    } catch (error) {
      if (error instanceof TRPCClientError) {
        errorHandler(error);
      }
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {!addressOnly && (
          <>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Full Name
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone Number
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormLabel>
                </FormItem>
              )}
            />
          </>
        )}
        <FormField
          control={form.control}
          name="tag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Tag (Home, Work, etc)
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="addressLine1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Address Line 1
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="addressLine2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Address Line 2
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                City
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                State
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {states.map((state, i) => (
                      <SelectItem key={i} value={state}>
                        {state.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Country
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Postal Code
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormLabel>
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" className="w-full">{edit ? "Update" : "Save"}</Button>
      </form>
    </Form>
  );
};

export default DetailsForm;
