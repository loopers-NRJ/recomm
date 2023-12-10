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
import { productSchema } from "@/utils/validation";
// import { useImageUploader } from "@/utils/imageUpload";

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

  const [selectedBrand, setSelectedBrand] = useState<OptionalItem>();

  const [selectedModel, setSelectedModel] = useState<OptionalItem>();

  const [atomicAnswers, setAtomicAnswers] = useState<AtomicAnswer[]>([]);

  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState<
    MultipleChoiceAnswer[]
  >([]);

  const [price, setPrice] = useState("");

  const [bidEndTime, setBidEndTime] = useState<Date>();

  const [images, setImages] = useState<File[]>([]);

  // const { isLoading, upload } = useImageUploader();

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
    // const uploadedImage = await upload(images);
    // if (uploadedImage instanceof Error) {
    //   return console.error(uploadedImage.message);
    // }
    const result = productSchema.safeParse({
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
      const errors = result.error.flatten();
      console.log(errors);
    }
    // console.log({
    //   categoryId: selectedCategory?.id,
    //   brandId: selectedBrand?.id,
    //   modelId: selectedModel?.id,
    //   atomicAnswers,
    //   multipleChoiceAnswers,
    //   price: Number(price),
    //   bidDuration,
    // });
  };

  if (categoryApi.isError) {
    return <p className="text-red-500">Something went wrong!</p>;
  }
  if (categoryApi.isLoading || !categoryApi.data) {
    return <Loading />;
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
        />

        {!selectedCategory?.id ||
        !selectedBrand?.id ||
        !selectedModel?.id ? null : !modelApi.data ||
          modelApi.isLoading ||
          modelApi.data.atomicQuestions.length !== atomicAnswers.length ||
          modelApi.data.multipleChoiceQuestions.length !==
            multipleChoiceAnswers.length ? (
          <div className="flex flex-col items-center gap-4">
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
            />

            <ImageUploadSection
              images={images}
              setImages={setImages}
              maxImages={20}
              model={modelApi.data}
            />

            <PricingInfoSection
              price={price}
              setPrice={setPrice}
              onBidDurationChange={setBidEndTime}
              model={modelApi.data}
            />
          </>
        )}

        <Button onClick={() => void handleSubmit()}>Post</Button>
      </div>
    </Container>
  );
}
