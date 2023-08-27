/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Model, type Category, Brand } from "@prisma/client";
// import ImageUpload from "@/components/inputs/ImageUpload";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { api } from "@/utils/api";
import { useEffect, useState } from "react";
import Selector from "./Selector";

const PostListingModal = () => {
  const { data: categoryData, isLoading: loadingCategory } =
    api.category.getCategories.useQuery({});
  const { data: brandData, isLoading: loadingBrand } =
    api.brand.getBrands.useQuery({});
  const { data: modelData, isLoading: loadingModel } =
    api.model.getModels.useQuery({});

  const [categoryID, setCategoryID] = useState<string | null>(null);
  const [brandID, setBrandID] = useState<string | null>(null);
  const [modelID, setModelID] = useState<string | null>(null);

  const [brands, setBrands] = useState<Brand[]>(brandData as Brand[]);
  const [models, setModels] = useState<Model[]>(modelData as Model[]);

  // const [images, setImages] = useState<string[] | null>(null);

  const formSchema = z.object({
    category: z.string().min(1, {
      message: "Please select a category.",
    }),
    brand: z.string().min(1, {
      message: "Please select a brand.",
    }),
    model: z.string().min(1, {
      message: "Please select a model.",
    }),
  });
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      brand: "",
      model: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // This will be type-safe and validated.
    console.log(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit);
        }}
        className="flex h-full w-full flex-col space-y-8 md:h-auto lg:h-auto"
      >
        <FormField
          control={form.control}
          name="category"
          render={() => (
            <FormItem>
              <FormLabel>Product Category</FormLabel>
              <FormControl>
                <Selector
                  array={categoryData as Category[]}
                  isLoading={loadingCategory}
                  isError={categoryData === null}
                ></Selector>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="brand"
          render={() => (
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <Selector
                  array={brandData as Brand[]}
                  isLoading={loadingBrand}
                  isError={brandData === null}
                ></Selector>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="model"
          render={() => (
            <FormItem>
              <FormLabel>Choose Model</FormLabel>
              <FormControl>
                <Selector
                  array={models}
                  isLoading={loadingModel}
                  isError={models === null}
                  placeholder="Model"
                ></Selector>
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default PostListingModal;
