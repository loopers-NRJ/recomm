import { api } from "@/utils/api";
import Container from "../Container";
import { useState } from "react";
import { OptionalItem } from "@/types/custom";
import Loading from "../common/Loading";
import { AtomicQuestionType, MultipleChoiceQuestionType } from "@prisma/client";

import { Button } from "../ui/button";
import { AtomicAnswer } from "./AtomicQuestion";
import { MultipleChoiceAnswer } from "./MultipleChoiceQuestion";
import BasicInfoSection from "./BasicInfoSection";
import AdditionalInfoSection from "./AdditionalInfoSection";
import ImageUploadSection from "./ImageUploadSection";
import PricingInfoSection from "./PricingInfoSection";
import { ProductFormError, productSchema } from "@/utils/validation";
import { ZodIssue } from "zod";
import { useRouter } from "next/router";
import { useImageUploader } from "@/utils/imageUpload";

export default function PostingForm({
  selectedCategorySlug,
}: {
  selectedCategorySlug: string;
}) {
  const categoryApi = api.category.getCategoryBySlug.useQuery({
    categorySlug: selectedCategorySlug,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [bidEndTime, setBidEndTime] = useState<Date>();
  const [images, setImages] = useState<File[]>([]);

  const [selectedBrand, setSelectedBrand] = useState<OptionalItem>();
  const [selectedModel, setSelectedModel] = useState<OptionalItem>();

  const [atomicAnswers, setAtomicAnswers] = useState<AtomicAnswer[]>([]);
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState<
    MultipleChoiceAnswer[]
  >([]);

  const [formError, setFormError] = useState<
    ProductFormError & {
      serverError?: string;
    }
  >({
    title: undefined,
    description: undefined,
    price: undefined,
    categoryId: undefined,
    brandId: undefined,
    modelId: undefined,
    closedAt: undefined,
    atomicAnswers: undefined,
    multipleChoiceAnswers: undefined,
    images: undefined,
  });

  const { isLoading, upload } = useImageUploader();
  const router = useRouter();
  const productApi = api.product.createProduct.useMutation({
    async onSuccess(data) {
      await router.push(`/${data.sellerId}/listings`);
    },
  });

  const modelApi = api.model.getModelById.useQuery(
    {
      modelId: selectedModel?.id,
    },
    {
      onSuccess(data) {
        if (!data) return;

        setAtomicAnswers(
          data.atomicQuestions.map((question) => {
            if (
              question.type === AtomicQuestionType.Text ||
              question.type === AtomicQuestionType.Paragraph
            ) {
              return {
                questionId: question.id,
                type: question.type,
                answerContent: "",
              };
            } else if (question.type === AtomicQuestionType.Number) {
              return {
                questionId: question.id,
                type: question.type,
                answerContent: 0,
              };
            }
            return {
              questionId: question.id,
              type: question.type,
              answerContent: new Date(),
            };
          })
        );

        setMultipleChoiceAnswers(
          data.multipleChoiceQuestions.map((question) => {
            if (question.type === MultipleChoiceQuestionType.Checkbox) {
              return {
                questionId: question.id,
                type: MultipleChoiceQuestionType.Checkbox,
                valueIds: [],
              };
            }
            return {
              questionId: question.id,
              type: question.type,
              valueId: "",
            };
          })
        );
      },
    }
  );

  const handleSubmit = async () => {
    const result = productSchema.omit({ images: true }).safeParse({
      title,
      description,
      price: Number(price),
      categoryId: selectedCategory.id,
      brandId: selectedBrand?.id,
      modelId: selectedModel?.id,
      closedAt: bidEndTime,
      atomicAnswers,
      multipleChoiceAnswers,
    });
    if (!result.success) {
      const errors = result.error.issues.reduceRight<
        Record<string | number, ZodIssue>
      >((acc, issue) => {
        if (issue.path[0]) {
          acc[issue.path[0] as string] = issue;
        }
        return acc;
      }, {});
      return setFormError(errors as ProductFormError);
    }
    const uploadedImages = await upload(images);
    if (uploadedImages instanceof Error) {
      return setFormError({
        ...formError,
        serverError: uploadedImages.message,
      });
    }

    productApi.mutate({
      ...result.data,
      images: uploadedImages,
    });
  };

  if (
    categoryApi.isError ||
    modelApi.isError ||
    productApi.isError ||
    formError.serverError
  ) {
    return (
      <Container className="py-20 text-center">
        Oops, Something went wrong. Try again.
      </Container>
    );
  }
  if (categoryApi.isLoading || !categoryApi.data) {
    return <Loading className="min-h-[12rem]" />;
  }

  const selectedCategory = categoryApi.data;
  return (
    <Container className="flex flex-col items-center justify-center pb-40">
      <h1 className="my-4 text-center text-2xl font-bold">
        Post your {selectedCategory.name}
      </h1>

      <div className="flex w-full max-w-2xl flex-col">
        <BasicInfoSection
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          selectedCategory={selectedCategory}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          formError={formError}
        />

        {!selectedCategory?.id ||
        !selectedBrand?.id ||
        !selectedModel?.id ? null : !modelApi.data ||
          modelApi.isLoading ||
          modelApi.data.atomicQuestions.length !== atomicAnswers.length ||
          modelApi.data.multipleChoiceQuestions.length !==
            multipleChoiceAnswers.length ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <Loading />
            Loading Details...
          </div>
        ) : modelApi.isError ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-red-500">Something went wrong!</p>
          </div>
        ) : (
          <>
            <AdditionalInfoSection
              model={modelApi.data}
              atomicAnswers={atomicAnswers}
              setAtomicAnswers={setAtomicAnswers}
              multipleChoiceAnswers={multipleChoiceAnswers}
              setMultipleChoiceAnswers={setMultipleChoiceAnswers}
              formError={formError}
            />

            <ImageUploadSection
              images={images}
              setImages={setImages}
              maxImages={10}
              model={modelApi.data}
              formError={formError}
            />

            <PricingInfoSection
              price={price}
              setPrice={setPrice}
              onBidDurationChange={setBidEndTime}
              model={modelApi.data}
            />
          </>
        )}

        <Button
          onClick={() => void handleSubmit()}
          disabled={productApi.isLoading || isLoading}
        >
          Post
        </Button>
      </div>
    </Container>
  );
}
