import Container from "../Container";
import Loading from "../common/Loading";
import { Button } from "../ui/button";
import AdditionalInfoSection from "./AdditionalInfoSection";
import { type AtomicAnswer } from "./AtomicQuestion";
import BasicInfoSection from "./BasicInfoSection";
import ImageUploadSection from "./ImageUploadSection";
import { type MultipleChoiceAnswer } from "./MultipleChoiceQuestion";
import PricingInfoSection from "./PricingInfoSection";
import { api } from "@/trpc/react";
import { type OptionalItem } from "@/types/custom";
import { errorHandler } from "@/utils/errorHandler";
import { useImageUploader } from "@/utils/imageUpload";
import {
  type ProductFormError,
  type ProductSchemaKeys,
  productSchema,
} from "@/utils/validation";
import { AtomicQuestionType, MultipleChoiceQuestionType } from "@prisma/client";
import { notFound, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { makeIssue } from "zod";

export default function PostingForm({
  selectedCategorySlug,
}: {
  selectedCategorySlug: string;
}) {
  const categoryApi = api.category.bySlug.useQuery({
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
  >({});

  const { isLoading, upload } = useImageUploader();
  const router = useRouter();
  const productApi = api.product.create.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      toast.success("Product created successfully");
      router.push(`/user/${result.sellerId}/listings`);
    },
    onError: errorHandler,
  });

  const modelApi = api.model.byId.useQuery(
    {
      modelId: selectedModel?.id,
    },
    {
      onSuccess(data) {
        if (!selectedModel?.id) return;
        if (!data || data === "Model not found")
          return toast.error("Model not found");
        if (
          data.atomicQuestions.length === atomicAnswers.length &&
          data.multipleChoiceQuestions.length === multipleChoiceAnswers.length
        )
          return;

        setAtomicAnswers(
          data.atomicQuestions.map((question) => {
            if (
              question.type === AtomicQuestionType.Text ||
              question.type === AtomicQuestionType.Paragraph
            ) {
              if (question.required) {
                return {
                  questionId: question.id,
                  type: question.type,
                  required: question.required,
                  answerContent: "",
                };
              } else {
                return {
                  questionId: question.id,
                  type: question.type,
                  required: question.required,
                  answerContent: undefined,
                };
              }
            } else if (question.type === AtomicQuestionType.Number) {
              if (question.required) {
                return {
                  questionId: question.id,
                  type: question.type,
                  required: question.required,
                  answerContent: 0,
                };
              } else {
                return {
                  questionId: question.id,
                  type: question.type,
                  required: question.required,
                  answerContent: undefined,
                };
              }
            }
            if (question.required) {
              return {
                questionId: question.id,
                type: question.type,
                required: question.required,
                answerContent: new Date(),
              };
            }
            return {
              questionId: question.id,
              required: question.required,
              type: question.type,
              answerContent: undefined,
            };
          }),
        );

        setMultipleChoiceAnswers(
          data.multipleChoiceQuestions.map((question) => {
            if (question.type === MultipleChoiceQuestionType.Checkbox) {
              return {
                questionId: question.id,
                required: question.required,
                type: MultipleChoiceQuestionType.Checkbox,
                valueIds: [],
              };
            }
            if (question.required) {
              return {
                questionId: question.id,
                required: question.required,
                type: question.type,
                valueId: "",
              };
            }
            return {
              questionId: question.id,
              required: question.required,
              type: question.type,
              valueId: undefined,
            };
          }),
        );
      },
    },
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
      const errors = result.error.issues.reduceRight<ProductFormError>(
        (acc, issue) => {
          if (
            issue.path[0] === "atomicAnswers" ||
            issue.path[0] === "multipleChoiceAnswers"
          ) {
            const atomicAnswerErrors = acc[issue.path[0]];
            if (atomicAnswerErrors) {
              atomicAnswerErrors[issue.path[1] as number] = issue;
            } else {
              acc[issue.path[0]] = [];
              acc[issue.path[0]]![issue.path[1] as number] = issue;
            }
          } else if (issue.path[0]) {
            acc[issue.path[0] as ProductSchemaKeys] = issue;
          }
          return acc;
        },
        {},
      );
      if (images.length < 1) {
        errors.images = makeIssue({
          path: ["images"],
          errorMaps: [],
          issueData: {
            code: "custom",
            message: "Oops! you need to upload at least 5 images",
          },
          data: {
            code: "custom",
            message: "Oops! you need to upload at least 5 images",
          },
        });
      }
      return setFormError(errors);
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

  const getAdditionalSection = useCallback(() => {
    if (!selectedModel?.id) {
      return;
    }
    if (!modelApi.data || modelApi.isLoading) {
      return (
        <div className="flex flex-col items-center gap-4 py-4">
          <Loading />
          Loading Details...
        </div>
      );
    }
    if (modelApi.data === "Model not found") {
      toast.error("Model not found");
      return;
    }
    if (
      modelApi.data.atomicQuestions.length !== atomicAnswers.length ||
      modelApi.data.multipleChoiceQuestions.length !==
        multipleChoiceAnswers.length
    ) {
      return (
        <div className="flex flex-col items-center gap-4 py-4">
          <Loading />
          Loading Details...
        </div>
      );
    }
    if (modelApi.isError) {
      return (
        <div className="flex flex-col items-center gap-4">
          <p className="text-red-500">Something went wrong!</p>
        </div>
      );
    }
    return (
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
          formError={formError}
        />
      </>
    );
  }, [
    selectedModel?.id,
    modelApi.data,
    modelApi.isLoading,
    modelApi.isError,
    atomicAnswers,
    multipleChoiceAnswers,
    images,
    price,
    bidEndTime,
    formError,
  ]);

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

  if (categoryApi.data === "Category not found") {
    return notFound();
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

        {getAdditionalSection()}

        <Button
          onClick={() => void handleSubmit()}
          disabled={productApi.isLoading || isLoading || modelApi.isLoading}
        >
          {productApi.isLoading || isLoading || modelApi.isLoading ? (
            <Loading color="white" size={24} />
          ) : (
            "Post"
          )}
        </Button>
      </div>
    </Container>
  );
}
