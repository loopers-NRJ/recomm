"use client";

import { usePostingState } from "@/app/sell/PostingState";
import Container from "../../components/Container";
import Loading from "../../components/common/Loading";
import AdditionalInfoSection from "./AdditionalInfoSection";
import BasicInfoSection from "./BasicInfoSection";
import ImageUploadSection from "./ImageUploadSection";
import { api } from "@/trpc/react";
import { errorHandler } from "@/utils/errorHandler";
import { AtomicQuestionType, MultipleChoiceQuestionType } from "@prisma/client";
import { notFound, useRouter } from "next/navigation";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/button";
import {
  type ProductFormError,
  type ProductSchemaKeys,
  productSchema,
} from "@/utils/validation";
import { z } from "zod";
import { type AtomicAnswer } from "./AtomicQuestion";
import { type MultipleChoiceAnswer } from "./MultipleChoiceQuestion";

export const validatePostingPage1Inputs = ({
  title,
  description,
  categoryId,
  brandId,
  modelId,
  atomicAnswers,
  multipleChoiceAnswers,
  images,
}: {
  title: string;
  description: string;
  categoryId?: string;
  brandId?: string;
  modelId?: string;
  atomicAnswers: AtomicAnswer[];
  multipleChoiceAnswers: MultipleChoiceAnswer[];
  images: File[];
}) => {
  const result = productSchema
    .omit({
      images: true,
      price: true,
      couponCode: true,
      bidDuration: true,
    })
    .extend({
      images: z
        .array(z.instanceof(File))
        .min(1, { message: "Oops! you need to upload at least 1 images" }),
    })
    .safeParse({
      title,
      description,
      categoryId,
      brandId,
      modelId,
      atomicAnswers,
      multipleChoiceAnswers,
      images,
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
    return { data: undefined, errors };
  } else {
    return { data: result.data, errors: undefined };
  }
};

export default function PostingForm({
  selectedCategorySlug,
}: {
  selectedCategorySlug: string;
}) {
  const categoryApi = api.category.bySlug.useQuery(
    {
      categorySlug: selectedCategorySlug,
    },
    {
      onError: errorHandler,
      onSuccess(data) {
        if (data === "Category not found") {
          return notFound();
        }
        setSelectedCategory(data);
      },
    },
  );

  const {
    title,
    description,
    selectedModel,
    selectedBrand,
    atomicAnswers,
    setAtomicAnswers,
    multipleChoiceAnswers,
    setMultipleChoiceAnswers,
    formError,
    setModelDetails,
    setSelectedCategory,
    images,
    setFormError,
  } = usePostingState();

  // const { isLoading, upload } = useImageUploader();
  const router = useRouter();

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
        setModelDetails(data);
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
        <AdditionalInfoSection model={modelApi.data} />
        <ImageUploadSection model={modelApi.data} />
      </>
    );
  }, [
    selectedModel?.id,
    modelApi.data,
    modelApi.isLoading,
    modelApi.isError,
    atomicAnswers,
    multipleChoiceAnswers,
  ]);

  if (categoryApi.isError || modelApi.isError || formError.serverError) {
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
        <BasicInfoSection />

        {getAdditionalSection()}

        {modelApi.data && typeof modelApi.data !== "string" && (
          <Button
            className="mt-4"
            onClick={() => {
              if (!modelApi.data || typeof modelApi.data === "string") return;
              const result = validatePostingPage1Inputs({
                title,
                description,
                categoryId: selectedCategory.id,
                brandId: selectedBrand?.id,
                modelId: modelApi.data.id,
                atomicAnswers,
                multipleChoiceAnswers,
                images,
              });
              if (result.errors) setFormError(result.errors);
              else router.push(`/sell/pricing`);
            }}
          >
            Enter Pricing
          </Button>
        )}
      </div>
    </Container>
  );
}
