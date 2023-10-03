import { Loader2 } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

import ComboBox from "@/components/common/ComboBox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAdminModal from "@/hooks/useAdminModel";
import { FetchItems, Item, Question, questionTypes } from "@/types/custom";
import { api } from "@/utils/api";
import { useImageUploader } from "@/utils/imageUpload";
import { Image, modelSchema } from "@/utils/validation";

import ImagePicker from "../../common/ImagePicker";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import AdminPageModal from "../AdminPageModel";

import type { AdminVariantInput as VariantOptions } from "@/types/admin";
export interface CreateModelProps {
  onCreate: () => void;
}

type Tab = "tab-1" | "tab-2";
interface FormError {
  image?: string[] | undefined;
  name?: string[] | undefined;
  categoryId?: string[] | undefined;
  brandId?: string[] | undefined;
  variants?: string[] | undefined;
}

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

  const [formError, setFormError] = useState<FormError>();
  // TODO:
  const [variantOptions] = useState<VariantOptions[]>([]);

  const { close: closeModel } = useAdminModal();

  const [additionalQuestions, setAdditionalQuestions] = useState<Question[]>(
    []
  );

  useEffect(() => {
    if (modelName.trim() !== "" && formError?.name) {
      formError.name = undefined;
    }
  }, [formError, modelName]);

  useEffect(() => {
    if (formError?.image && image) {
      formError.image = undefined;
    }
  }, [formError, image]);

  useEffect(() => {
    if (formError?.brandId && selectedBrand) {
      formError.brandId = undefined;
    }
  }, [formError, selectedBrand]);

  useEffect(() => {
    if (formError?.categoryId && selectedCategory) {
      formError.categoryId = undefined;
    }
  }, [formError, selectedCategory]);

  const uploadImage = async () => {
    const result = await uploader.upload(imageFiles);
    if (result instanceof Error) {
      return setError(result.message);
    }
    setImage(result[0]);
  };

  const createModel = async () => {
    console.log("create model");

    const validationresult = modelSchema.safeParse({
      name: modelName,
      image,
      brandId: selectedBrand?.id,
      categoryId: selectedCategory?.id,
      variantOptions,
    });

    if (!validationresult.success) {
      return setFormError(validationresult.error.flatten().fieldErrors);
    }

    const result = await createModelApi.mutateAsync(validationresult.data);
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
        return setFormError(result.error.flatten().fieldErrors);
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
                  className={`my-2 ${formError?.name ? "border-red-500" : ""}`}
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
                  requiredError={!!formError?.brandId}
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
                  requiredError={!!formError?.categoryId}
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
              {/* <AdminVariantPicker
                variantOptions={variantOptions}
                setVariants={setVarientOptions}
              />

              <Button
                variant="ghost"
                onClick={() =>
                  setVarientOptions([
                    ...variantOptions,
                    { id: uuid(), name: "", values: [], search: "" },
                  ])
                }
              >
                Add new Variant
              </Button> */}

              {additionalQuestions.map((additionalQuestion) => (
                <QuestionEditor
                  key={additionalQuestion.id}
                  question={additionalQuestion}
                  setQuestion={(question) => {
                    const index = additionalQuestions.findIndex(
                      (q) => q.id === question.id
                    );
                    additionalQuestions[index] = question;
                    setAdditionalQuestions([...additionalQuestions]);
                  }}
                />
              ))}

              <Button
                variant="ghost"
                onClick={() =>
                  setAdditionalQuestions([
                    ...additionalQuestions,
                    {
                      id: uuid(),
                      question: "",
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

export const QuestionEditor: FC<{
  question: Question;
  setQuestion: (updated: Question) => void;
}> = ({ question, setQuestion }) => {
  // create UI based on the question type
  return (
    <div className="flex gap-2">
      {/* type specific component */}
      {question.type === "Text" && (
        <div className="w-3/4">
          <Label>
            {question.question}
            <Input
              value={question.question}
              onChange={(e) =>
                setQuestion({ ...question, question: e.target.value })
              }
              placeholder="Enter your Question"
            />
          </Label>
        </div>
      )}

      {question.type === "Paragraph" && (
        <div className="w-3/4">
          <Label>
            {question.question}
            <textarea
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={question.question}
              onChange={(e) =>
                setQuestion({ ...question, question: e.target.value })
              }
              placeholder="Enter your Question"
            />
          </Label>
        </div>
      )}

      <select
        className="inline-flex w-1/4 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        onChange={() => {
          // change the question based on the selected option
        }}
      >
        {questionTypes.map((questionType) => (
          <option value={questionType} key={questionType}>
            {questionType}
          </option>
        ))}
      </select>
    </div>
  );
};
