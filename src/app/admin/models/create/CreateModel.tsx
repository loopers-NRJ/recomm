"use client";

import Container from "@/components/Container";
import BrandComboBox from "@/components/combobox/BrandComboBox";
import CategoryComboBox from "@/components/combobox/CategoryComboBox";
import ImagePicker from "@/components/common/ImagePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminSelectedState } from "@/store/SelectedState";
import type { Item } from "@/types/custom";
import {
  atomicQuestionTypeArray,
  multipleChoiceQuestionTypeArray,
} from "@/types/prisma";
import { api } from "@/trpc/react";
import { useImageUploader } from "@/utils/imageUpload";
import { modelSchema, type Image } from "@/utils/validation";
import type {
  AtomicQuestionType,
  MultipleChoiceQuestionType,
} from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { v4 as uuid } from "uuid";
import { type ZodIssue } from "zod";
import QuestionEditor from "./QuestionEditor";
import type { Question, MultipleChoiceQuestion } from "./types";
import toast from "react-hot-toast";
import { errorHandler } from "@/utils/errorHandler";
import PriceRangePicker from "./PriceRangePicker";

type Tab = "tab-1" | "tab-2";

const tab1Schema = modelSchema.pick({
  name: true,
  image: true,
  brandId: true,
  categoryId: true,
});

export default function CreateModel() {
  const [tab, changeTab] = useState<Tab>("tab-1");

  const createModelApi = api.model.create.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      router.push("/admin/tables/models");
    },
    onError: errorHandler,
  });

  const [modelName, setModelName] = useState("");
  // file object to store the file to upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // image object returned from server after uploading the image
  const [image, setImage] = useState<Image>();

  const [priceRange, setPriceRange] = useState<[string, string]>(["", ""]);

  const [selectedBrand, setSelectedBrand] = useState<Item>();

  const [selectedCategory, setSelectedCategory] = useState<Item>();

  const uploader = useImageUploader();
  const [error, setError] = useState<string>();

  const [formError, setFormError] = useState<ZodIssue[]>();

  const [additionalQuestions, setAdditionalQuestions] = useState<Question[]>(
    [],
  );

  const router = useRouter();

  const selectedState = useAdminSelectedState((selected) => selected.state);

  const getAtomicQuestionIndex = (id: string) => {
    let count = 0;
    for (const question of additionalQuestions) {
      if (question.id === id) {
        return count;
      }
      if (
        atomicQuestionTypeArray.includes(question.type as AtomicQuestionType)
      ) {
        count += 1;
      }
    }
    return -1;
  };

  const getMultipleChoiceQuestionIndex = (id: string) => {
    let count = 0;
    for (const question of additionalQuestions) {
      if (question.id === id) {
        return count;
      }
      if (
        multipleChoiceQuestionTypeArray.includes(
          question.type as MultipleChoiceQuestionType,
        )
      ) {
        count += 1;
      }
    }
    return -1;
  };

  const uploadImage = async () => {
    const result = await uploader.upload(imageFiles);
    if (result instanceof Error) {
      return setError(result.message);
    }
    setImage(result[0]);
  };

  const createModel = async () => {
    // split the the questions into atomic and multiple choice questions
    const atomicQuestions = additionalQuestions.filter((question) =>
      atomicQuestionTypeArray.includes(question.type as AtomicQuestionType),
    );
    const multipleChoiceQuestions = additionalQuestions.filter((question) =>
      multipleChoiceQuestionTypeArray.includes(
        question.type as MultipleChoiceQuestionType,
      ),
    ) as MultipleChoiceQuestion[];

    const modelValidationResult = modelSchema.safeParse({
      name: modelName,
      image,
      priceRange: priceRange.map((p) => +p),
      brandId: selectedBrand?.id,
      categoryId: selectedCategory?.id,
      atomicQuestions,
      multipleChoiceQuestions,
      state: selectedState,
    });

    if (!modelValidationResult.success) {
      return setFormError(modelValidationResult.error.errors);
    }

    createModelApi.mutate(modelValidationResult.data);
  };

  const handleChangeTab = (tab: Tab) => {
    if (tab === "tab-2") {
      const result = tab1Schema.safeParse({
        name: modelName,
        categoryId: selectedCategory?.id,
        brandId: selectedBrand?.id,
        image,
      });
      if (!result.success) {
        return setFormError(result.error.errors);
      }
    }
    setFormError(undefined);

    changeTab(tab);
  };

  const handleSetQuestion = useCallback(
    (question: Question) => {
      const index = additionalQuestions.findIndex((q) => q.id === question.id);
      additionalQuestions[index] = question;
      setAdditionalQuestions([...additionalQuestions]);
    },
    [additionalQuestions],
  );

  return (
    <Container className="flex justify-center">
      <Tabs
        defaultValue="tab-1"
        value={tab}
        className="h-full w-full md:h-fit md:w-5/6 lg:h-fit lg:w-4/6 xl:w-4/6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tab-1" onClick={() => handleChangeTab("tab-1")}>
            Stage 01
          </TabsTrigger>
          <TabsTrigger value="tab-2" onClick={() => handleChangeTab("tab-2")}>
            Stage 02
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab-1">
          <section className="flex flex-col gap-4 p-4">
            <Label className="my-4">
              Model Name
              <Input
                className={`my-2 ${
                  formError?.find((e) => e.path[0] === "name")
                    ? "border-red-500"
                    : ""
                }`}
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
              />
            </Label>

            <BrandComboBox
              selected={selectedBrand}
              onSelect={setSelectedBrand}
              error={formError?.find((e) => e.path[0] === "brandId")?.message}
            />
            <CategoryComboBox
              selected={selectedCategory}
              onSelect={setSelectedCategory}
              requiredError={
                !!formError?.find((e) => e.path[0] === "categoryId")
              }
            />

            <Label className="my-4 flex w-full items-center justify-between">
              <span>Price Range</span>
              <PriceRangePicker
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                requiredError={
                  !!formError?.find((e) => e.path[0] === "priceRange")
                }
              />
            </Label>

            <div className="flex items-end justify-between gap-8">
              <ImagePicker
                setImages={setImageFiles}
                maxImages={1}
                images={imageFiles}
              />
              {imageFiles.length > 0 && image === undefined ? (
                <Button
                  onClick={() => void uploadImage()}
                  disabled={uploader.isLoading}
                >
                  Upload Image
                </Button>
              ) : (
                <Button
                  onClick={() => handleChangeTab("tab-2")}
                  disabled={createModelApi.isLoading}
                >
                  Next
                </Button>
              )}
            </div>
          </section>

          <div>{error}</div>
        </TabsContent>

        <TabsContent value="tab-2">
          <section className="flex flex-col gap-4 p-4">
            {additionalQuestions.map((question) => (
              <QuestionEditor
                key={question.id}
                question={question}
                setQuestion={handleSetQuestion}
                deleteQuestion={() => {
                  const index = additionalQuestions.findIndex(
                    (q) => q.id === question.id,
                  );
                  additionalQuestions.splice(index, 1);
                  setAdditionalQuestions([...additionalQuestions]);
                }}
                changeQuestionType={(newType) => {
                  const index = additionalQuestions.findIndex(
                    (q) => q.id === question.id,
                  );
                  if (
                    multipleChoiceQuestionTypeArray.includes(
                      newType as MultipleChoiceQuestionType,
                    )
                  ) {
                    (
                      additionalQuestions[index] as MultipleChoiceQuestion
                    ).choices = [];
                  }
                  additionalQuestions[index]!.type = newType;
                  setAdditionalQuestions([...additionalQuestions]);
                }}
                error={formError?.find((e) =>
                  atomicQuestionTypeArray.includes(
                    question.type as AtomicQuestionType,
                  )
                    ? e.path[1] === getAtomicQuestionIndex(question.id)
                    : e.path[1] === getMultipleChoiceQuestionIndex(question.id),
                )}
              />
            ))}
            <Button
              variant="ghost"
              onClick={() =>
                setAdditionalQuestions([
                  ...additionalQuestions,
                  {
                    id: uuid(),
                    questionContent: "",
                    type: "Text",
                    required: true,
                  },
                ])
              }
            >
              Add Additional Questions
            </Button>

            {/* form to get additional questions */}

            <div className="flex w-full gap-3">
              <Button
                onClick={() => handleChangeTab("tab-1")}
                className="w-full"
              >
                Back
              </Button>
              <Button
                onClick={() => void createModel()}
                disabled={modelName.trim() === "" || createModelApi.isLoading}
                className="w-full"
              >
                Create Model
              </Button>
            </div>

            {uploader.isLoading && (
              <div className="flex flex-col items-center justify-center rounded-lg border p-2">
                Uploading image...
                <Loader2 className="animate-spin" />
              </div>
            )}
            {createModelApi.isLoading && (
              <div className="flex flex-col items-center justify-center rounded-lg border p-2">
                Creating Model {modelName} ...
                <Loader2 className="animate-spin" />
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-500 p-2 text-red-500">
                {error}
              </div>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </Container>
  );
}
