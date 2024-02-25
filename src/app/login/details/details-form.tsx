"use client"

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from '@/components/ui/form';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User } from '@prisma/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { states } from '@/types/prisma';
import { z } from 'zod';
import { useClientSelectedState } from '@/store/SelectedState';
import { api } from '@/trpc/react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface FormProps {
  userData?: User
}

const detailsFormSchema = z.object({
  fullName: z.string(),
  addressLine: z.string(),
  city: z.string(),
  state: z.enum(states),
  country: z.string(),
  postalCode: z.string(),
  phoneNumber: z.string(),
})

type DetailsFormValues = z.infer<typeof detailsFormSchema>


const DetailsForm = ({ userData }: FormProps) => {

  const { state } = useClientSelectedState()
  const router = useRouter()
  const createAddress = api.address.create.useMutation()

  const defaultValues = {
    fullName: userData?.name ?? "",
    addressLine: "",
    city: "",
    state: state,
    country: "",
    postalCode: "",
    phoneNumber: "",
  }

  const form = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsFormSchema),
    defaultValues,
    mode: "onChange",
  })

  const onSubmit = async (data: DetailsFormValues) => {
    const res = await createAddress.mutateAsync(data)
    if(typeof res === "string") toast.error(res)
    else{
      toast.success("Saved Successfully!")
      router.push("/")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name
                <FormControl>
                  <Input type='text' {...field} />
                </FormControl>
                <FormMessage />
              </FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="addressLine"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address
                <FormControl>
                  <Input type='text' {...field} />
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
              <FormLabel>City
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
              <FormLabel>State
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {states.map((state, i) => (
                      <SelectItem key={i} value={state}>{state.replace("_", " ")}</SelectItem>
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
              <FormLabel>Country
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
              <FormLabel>Postal Code
                <FormControl>
                  <Input type="number" {...field} />
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
              <FormLabel>Phone Number
                <FormControl>
                  <Input type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormLabel>
            </FormItem>
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  )
}

export default DetailsForm 
