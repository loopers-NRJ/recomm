import { Loader2 } from "lucide-react";
import { FC, useState } from "react";
import { v4 as uuid } from "uuid";

import ComboBox from "@/components/common/ComboBox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAdminModal from "@/hooks/useAdminModel";
import {
  FetchItems,
  Item,
  MultipleChoiceQuestion,
  Question,
} from "@/types/custom";
import { api } from "@/utils/api";
import { useImageUploader } from "@/utils/imageUpload";
import { Image, modelSchema } from "@/utils/validation";

import ImagePicker from "../../common/ImagePicker";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import AdminPageModal from "../AdminPageModel";

import { AtomicQuestionType, MultipleChoiceQuestionType } from "@prisma/client";
import {
  AtomicQuestionTypeArray,
  MultipleChoiceQuestionTypeArray,
} from "@/types/prisma";
import QuestionEditor from "./QuestionEditor";

import { ZodIssue } from "zod";

export interface CreateModelProps {
  onCreate: () => void;
}

type Tab = "tab-1" | "tab-2";

const tab1Schema = modelSchema.pick({
  name: true,
  image: true,
  brandId: true,
  categoryId: true,
});

export const CreateModel: FC<CreateModelProps> = ({ onCreate }) => {
  const [tab, changeTab] = useState<Tab>("tab-1");

  const createModelApi = api.model.createModel.useMutation();

  const [modelName, setModelName] = useState("");
  // file object to store the file to upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // image object returned from server after uploading the image
  const [image, setImage] = useState<Image>();

  // category
  const [brand, setBrand] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<Item>();

  // brand
  const [category, setCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Item>();

  const uploader = useImageUploader();
  const [error, setError] = useState<string>();

  const [formError, setFormError] = useState<ZodIssue[]>();

  const { close: closeModel } = useAdminModal();

  const [additionalQuestions, setAdditionalQuestions] = useState<Question[]>(
    []
  );

  const getAtomicQuestionIndex = (id: string) => {
    let count = 0;
    for (const question of additionalQuestions) {
      if (question.id === id) {
        return count;
      }
      if (
        AtomicQuestionTypeArray.includes(question.type as AtomicQuestionType)
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
        MultipleChoiceQuestionTypeArray.includes(
          question.type as MultipleChoiceQuestionType
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
      AtomicQuestionTypeArray.includes(question.type as AtomicQuestionType)
    );
    const multipleChoiceQuestions = additionalQuestions.filter((question) =>
      MultipleChoiceQuestionTypeArray.includes(
        question.type as MultipleChoiceQuestionType
      )
    ) as MultipleChoiceQuestion[];

    const modelValidationResult = modelSchema.safeParse({
      name: modelName,
      image,
      brandId: selectedBrand?.id,
      categoryId: selectedCategory?.id,
      atomicQuestions,
      multipleChoiceQuestions,
    });

    if (!modelValidationResult.success) {
      return setFormError(modelValidationResult.error.errors);
    }

    const result = await createModelApi.mutateAsync(modelValidationResult.data);
    if (result instanceof Error) {
      return setError(result.message);
    }

    closeModel();
    onCreate();
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

  return (
    <>
      <AdminPageModal className="lg:h-5/6">
        <Tabs defaultValue="tab-1" value={tab} className="h-full w-full">
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

              <Label className="flex items-center justify-between">
                Brand
                <ComboBox
                  label="Brand"
                  fetchItems={api.search.brands.useQuery as FetchItems}
                  value={brand}
                  onChange={setBrand}
                  selected={selectedBrand}
                  onSelect={setSelectedBrand}
                  requiredError={
                    !!formError?.find((e) => e.path[0] === "brandId")
                  }
                />
              </Label>

              <Label className="flex items-center justify-between">
                Category
                <ComboBox
                  label="Category"
                  fetchItems={api.search.category.useQuery as FetchItems}
                  value={category}
                  onChange={setCategory}
                  selected={selectedCategory}
                  onSelect={setSelectedCategory}
                  requiredError={
                    !!formError?.find((e) => e.path[0] === "categoryId")
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
                  setQuestion={(question) => {
                    const index = additionalQuestions.findIndex(
                      (q) => q.id === question.id
                    );
                    additionalQuestions[index] = question;
                    setAdditionalQuestions([...additionalQuestions]);
                  }}
                  changeQuestionType={(newType) => {
                    const index = additionalQuestions.findIndex(
                      (q) => q.id === question.id
                    );
                    if (
                      MultipleChoiceQuestionTypeArray.includes(
                        newType as MultipleChoiceQuestionType
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
                    AtomicQuestionTypeArray.includes(
                      question.type as AtomicQuestionType
                    )
                      ? e.path[1] === getAtomicQuestionIndex(question.id)
                      : e.path[1] ===
                        getMultipleChoiceQuestionIndex(question.id)
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
      </AdminPageModal>
    </>
  );
};
