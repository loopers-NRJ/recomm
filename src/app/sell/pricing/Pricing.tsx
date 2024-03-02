"use client";

import PricingInfoSection from "./PricingInfoSection";
import { useLayoutEffect } from "react";
import { usePostingState } from "../PostingState";
import { redirect, useRouter } from "next/navigation";
import { validatePostingPage1Inputs } from "@/app/sell/PostingForm";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { errorHandler } from "@/utils/errorHandler";
import toast from "react-hot-toast";
import { useImageUploader } from "@/utils/imageUpload";
import Loading from "@/components/common/Loading";

export default function Pricing() {
  const {
    title,
    description,
    selectedCategory,
    selectedBrand,
    selectedModel,
    atomicAnswers,
    multipleChoiceAnswers,
    images,
    setFormError,
    modelDetails,
    price,
    // bidDuration,
    couponCode,
    formError,
  } = usePostingState();
  const router = useRouter();
  const productApi = api.product.create.useMutation({
    onError: errorHandler,
    onSuccess: (data) => {
      if (typeof data === "string") {
        toast.error(data);
        return;
      }
      router.push(`/products/${data.slug}`);
    },
  });

  useLayoutEffect(() => {
    const result = validatePostingPage1Inputs({
      title,
      description,
      categoryId: selectedCategory?.id,
      brandId: selectedBrand?.id,
      modelId: selectedModel?.id,
      atomicAnswers,
      multipleChoiceAnswers,
      images,
    });
    if (result.errors) {
      setFormError(result.errors);
      if (selectedCategory) {
        redirect(`/sell?category=${selectedCategory.slug}`);
      } else {
        redirect("/sell");
      }
    }
  }, []);

  const handleSubmit = async () => {
    if (productApi.isLoading) return;
    const categoryId = selectedCategory?.id;
    const brandId = selectedBrand?.id;
    const modelId = selectedModel?.id;
    const result = validatePostingPage1Inputs({
      title,
      description,
      categoryId,
      brandId,
      modelId,
      atomicAnswers,
      multipleChoiceAnswers,
      images,
    });
    if (result.errors) {
      setFormError(result.errors);
      if (selectedCategory) {
        return redirect(`/sell?category=${selectedCategory.slug}`);
      } else {
        return redirect("/sell");
      }
    }
    const uploadedImages = await uploader.upload(images);
    if (uploadedImages instanceof Error) {
      setFormError({
        ...formError,
        serverError: uploadedImages.message,
      });
      return redirect("/sell");
    }

    productApi.mutate({
      ...result.data,
      images: uploadedImages,
      price: Number(price),
      couponCode,
      // bidDuration,
    });
  };

  const uploader = useImageUploader();
  if (!modelDetails) {
    return redirect("/sell");
  }
  return (
    <Container className="flex flex-col items-center justify-center pb-40">
      <PricingInfoSection model={modelDetails} />
      <Button
        onClick={() => void handleSubmit()}
        disabled={productApi.isLoading || uploader.isLoading || !price}
      >
        {productApi.isLoading || uploader.isLoading ? (
          <Loading color="white" size={24} />
        ) : (
          "Post"
        )}
      </Button>
    </Container>
  );
}
