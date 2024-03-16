"use client";

import PricingInfoSection from "./PricingInfoSection";
import { useLayoutEffect, useState } from "react";
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
import AddressList from "@/components/common/AddressList";
import { CouponCodeButton } from "../CouponCodeButton";
import { type Coupon, CouponType } from "@prisma/client";

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
    selectedAddress,
    // reset,
  } = usePostingState();
  const [priceToPay, setPriceToPay] = useState(selectedCategory?.price ?? 0);
  const router = useRouter();
  const productApi = api.product.create.useMutation({
    onError: errorHandler,
    onSuccess: (data) => {
      if (typeof data === "string") {
        toast.error(data);
        return;
      }
      // reset();
      router.push(`/products/${data.slug}`);
    },
  });

  const uploader = useImageUploader();

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
      addressId: selectedAddress?.id,
    });
  };

  if (!modelDetails) {
    return redirect("/sell");
  }

  const handleSuccess = (coupon: Coupon) => {
    if (coupon.type === CouponType.fixed) {
      setPriceToPay(priceToPay - coupon.discount);
    } else {
      setPriceToPay(priceToPay - (priceToPay / 100) * coupon.discount);
    }
  };

  return (
    <Container className="flex w-full flex-col items-center justify-center gap-16 pb-40">
      <AddressPicker />
      <PricingInfoSection model={modelDetails} />
      {selectedCategory && (
        <section className="flex w-full max-w-2xl flex-col">
          <CouponCodeButton
            onSuccess={handleSuccess}
            onRemove={() => setPriceToPay(selectedCategory.price)}
            selectedCategoryId={selectedCategory.id}
          />
        </section>
      )}
      <Button
        onClick={() => void handleSubmit()}
        disabled={
          productApi.isLoading ||
          uploader.isLoading ||
          !price ||
          priceToPay !== 0
        }
      >
        {productApi.isLoading || uploader.isLoading ? (
          <Loading color="white" size={24} />
        ) : priceToPay !== 0 ? (
          `You have to pay ${priceToPay} Rs`
        ) : (
          "Sell it"
        )}
      </Button>
    </Container>
  );
}

function AddressPicker() {
  const [selectedAddress, setSelectedAddress] = usePostingState((state) => [
    state.selectedAddress,
    state.setSelectedAddress,
  ]);
  return (
    <section className="flex max-h-72 w-full max-w-2xl flex-col overflow-scroll">
      <h1 className="my-4 text-center text-2xl font-bold">Address Section</h1>
      <AddressList
        enableSelecting
        selectedAddress={selectedAddress}
        onSelectedAddressChange={setSelectedAddress}
      />
    </section>
  );
}
