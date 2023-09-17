import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostingModalStore } from "@/hooks/usePostingModal";
import { FetchItems, OptionalItem } from "@/types/item";
import { api } from "@/utils/api";
import { useImageUploader } from "@/utils/imageUpload";
import { productSchema, validateVariant } from "@/utils/validation";

import { Input } from "../ui/input";
import { toast } from "../ui/use-toast";
import BidDurationPicker from "./BidDurationPicker";
import ComboBox from "./ComboBox";
import ImagePicker from "./ImagePicker";
import { VariantSelector } from "./VariantSelector";

interface FormError {
  categoryId?: string[] | undefined;
  brandId?: string[] | undefined;
  modelId?: string[] | undefined;
  title?: string[] | undefined;
  description?: string[] | undefined;
  images?: string[] | undefined;
  price?: string[] | undefined;
  closedAt?: string[] | undefined;
  variantId?: string[] | undefined;
}

interface PostingTabsProps {
  setShowModal: (bool: boolean) => void;
  postingModal: PostingModalStore;
}

// interface SelectedVariant {
//   optionId: string;
//   valueId: string;
// }

type Tab = "tab-1" | "tab-2" | "tab-3";

const tab1Schema = productSchema.pick({
  categoryId: true,
  brandId: true,
  modelId: true,
});

const tab2Schema = productSchema.pick({
  title: true,
  description: true,
});

export const PostingTabs: FC<PostingTabsProps> = ({
  setShowModal,
  postingModal,
}) => {
  const [searchCategory, setSearchCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<OptionalItem>();

  const [searchBrand, setSearchBrand] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<OptionalItem>();

  const [searchModel, setSearchModel] = useState("");
  const [selectedModel, setSelectedModel] = useState<OptionalItem>();

  const modelApi = api.model.getModelByIdOrNull.useQuery({
    modelId: selectedModel?.id,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [currentTab, changeTab] = useState<Tab>("tab-1");

  const [formError, setFormError] = useState<FormError>();
  const router = useRouter();
  const session = useSession();
  const userId = session.data?.user.id;

  const uploadProduct = api.product.createProduct.useMutation();
  const imageUploader = useImageUploader();

  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});

  // reset the selected brand and model when the category is changed
  useEffect(() => {
    setSelectedBrand(undefined);
    setSelectedModel(undefined);
  }, [selectedCategory]);

  // reset the selected model when the brand is changed
  useEffect(() => {
    setSelectedModel(undefined);
  }, [selectedBrand]);

  // reset the selected variants when the model is changed
  useEffect(() => {
    setSelectedVariants({});
  }, [selectedModel]);

  const handleSubmit = async () => {
    if (images.length === 0) {
      return setFormError({ images: ["Please select at least one image"] });
    }

    const variantOptions = Object.entries(selectedVariants).map(
      ([optionId, valueId]) => ({ optionId, valueId })
    );

    const result = productSchema.omit({ images: true }).safeParse({
      title,
      price: +price,
      description,
      modelId: selectedModel?.id,
      brandId: selectedBrand?.id,
      categoryId: selectedCategory?.id,
      variantOptions,
      endDate,
    });
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      return setFormError(fields);
    }
    const imagesUrls = await imageUploader.upload(images);
    if (imagesUrls instanceof Error) {
      return toast({
        title: "Error",
        description: "cannot upload images",
        variant: "destructive",
      });
    }
    const imageValidation = productSchema
      .pick({ images: true })
      .safeParse({ images: imagesUrls });
    if (!imageValidation.success) {
      return toast({
        title: "Error",
        description: "cannot upload images",
        variant: "destructive",
      });
    }
    try {
      const product = await uploadProduct.mutateAsync({
        ...result.data,
        images: imageValidation.data.images,
      });
      if (product instanceof Error) {
        toast({
          title: "Error",
          description: product.message,
          variant: "destructive",
        });
      }
      onClose();
      void router.push(`/${userId}/listings`);
    } catch (error) {
      toast({
        title: "Error",
        description: "cannot upload product",
        variant: "destructive",
      });
    }
  };

  const onClose = () => {
    setShowModal(false);
    setTimeout(() => {
      postingModal.onClose();
    }, 300);
  };

  const handleChangeTab = (tab: Tab) => {
    if (tab === "tab-2" && currentTab === "tab-1") {
      // convert the selectedVariants object to array
      const variantOptions = Object.entries(selectedVariants).map(
        ([optionId, valueId]) => ({ optionId, valueId })
      );
      const result = tab1Schema.safeParse({
        categoryId: selectedCategory?.id,
        brandId: selectedBrand?.id,
        modelId: selectedModel?.id,
      });

      if (!result.success) {
        return setFormError(result.error.flatten().fieldErrors);
      }

      if (!modelApi.data || modelApi.data instanceof Error) {
        return setFormError((prev) => ({
          ...prev,
          modelId: ["Please select a model"],
        }));
      }

      const error = validateVariant(
        modelApi.data.variantOptions,
        variantOptions
      );

      if (error !== true) {
        return setFormError((prev) => ({ ...prev, variantId: [error.id] }));
      }
    }

    if (tab === "tab-3" && currentTab === "tab-2") {
      const result = tab2Schema.safeParse({
        title,
        description,
      });
      if (!result.success) {
        return setFormError(result.error.flatten().fieldErrors);
      }
      if (images.length === 0) {
        return setFormError({ images: ["Please select at least one image"] });
      }
    }

    setFormError(undefined);
    changeTab(tab);
  };

  return (
    <Tabs defaultValue="tab-1" value={currentTab} className="h-full w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger
          value="tab-1"
          onClick={() => handleChangeTab("tab-1")}
          disabled={uploadProduct.isLoading || imageUploader.isLoading}
        >
          Stage 01
        </TabsTrigger>
        <TabsTrigger
          value="tab-2"
          onClick={() => handleChangeTab("tab-2")}
          disabled={uploadProduct.isLoading || imageUploader.isLoading}
        >
          Stage 02
        </TabsTrigger>
        <TabsTrigger
          value="tab-3"
          onClick={() => handleChangeTab("tab-3")}
          disabled={uploadProduct.isLoading || imageUploader.isLoading}
        >
          Stage 03
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tab-1">
        <Card className="border-none">
          <CardHeader>
            <CardTitle>Choose Product Details</CardTitle>
            <CardDescription>
              Make changes to your posting here. Click next when you are done.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2">
            <div className="flex h-full flex-col justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label>Category</Label>
                  <ComboBox
                    label="Category"
                    selected={selectedCategory}
                    onSelect={(category) => setSelectedCategory(category)}
                    value={searchCategory}
                    onChange={setSearchCategory}
                    fetchItems={api.search.category.useQuery as FetchItems}
                    fetchInput={{ search: searchCategory }}
                    requiredError={!!formError?.categoryId}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Brand</Label>
                  <ComboBox
                    label="Brand"
                    selected={selectedBrand}
                    onSelect={(brand) => setSelectedBrand(brand)}
                    value={searchBrand}
                    onChange={setSearchBrand}
                    fetchItems={api.search.brands.useQuery as FetchItems}
                    fetchInput={{
                      categoryId: selectedCategory?.id,
                      search: searchBrand,
                    }}
                    requiredError={!!formError?.brandId}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Model</Label>
                  <ComboBox
                    label="Model"
                    selected={selectedModel}
                    onSelect={(model) => setSelectedModel(model)}
                    value={searchModel}
                    onChange={setSearchModel}
                    fetchItems={api.search.models.useQuery as FetchItems}
                    fetchInput={{
                      brandId: selectedBrand?.id,
                      search: searchModel,
                    }}
                    requiredError={!!formError?.modelId}
                  />
                </div>

                {modelApi.isLoading ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="text-primary-500 h-8 w-8 animate-spin" />
                  </div>
                ) : !modelApi.data ? null : modelApi.data instanceof Error ? (
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-red-500">{modelApi.data.message}</p>
                  </div>
                ) : (
                  modelApi.data.variantOptions.map((option) => (
                    <VariantSelector
                      key={option.id}
                      option={option}
                      selectedVariantId={selectedVariants[option.id]}
                      setSelectedVariantId={(optionId, valueId) => {
                        if (formError?.variantId?.[0] === option.id) {
                          setFormError((prev) => {
                            return { ...prev, variantId: undefined };
                          });
                        }
                        setSelectedVariants((prev) => {
                          return { ...prev, [optionId]: valueId };
                        });
                      }}
                      requiredError={formError?.variantId?.[0] === option.id}
                    />
                  ))
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handleChangeTab("tab-2")}>
              Next
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="tab-2">
        <Card className="border-none">
          <CardHeader>
            <CardTitle>Choose Price</CardTitle>
            <CardDescription>
              Change your product pricing here and click post.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex  flex-col gap-3">
            <Label className="flex flex-col gap-3">
              Title
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                className={`${formError?.title ? "border-red-500 " : ""}`}
                placeholder="Enter title..."
                required
              />
            </Label>
            <Label className="flex flex-col gap-3">
              Description
              <Input
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
                className={`${formError?.description ? "border-red-500" : ""}`}
                placeholder="Enter description..."
                required
              />
            </Label>

            <Label className="flex flex-col gap-3">
              Images
              <ImagePicker
                setImages={setImages}
                images={images}
                requiredError={!!formError?.images}
              />
            </Label>
          </CardContent>
          <CardFooter className="flex-col gap-12">
            <div className="flex w-full gap-3">
              <Button
                className="w-full"
                onClick={() => handleChangeTab("tab-1")}
              >
                Back
              </Button>
              <Button
                className="w-full"
                onClick={() => handleChangeTab("tab-3")}
              >
                Next
              </Button>
            </div>
            {(uploadProduct.isLoading || imageUploader.isLoading) && (
              <div className="flex flex-col items-center gap-4">
                {imageUploader.isLoading && "Uploading images please wait..."}
                {uploadProduct.isLoading &&
                  "Creating your product please wait..."}
                <Loader2 className="text-primary-500 h-8 w-8 animate-spin" />
              </div>
            )}
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="tab-3">
        <Card className="border-none">
          <CardHeader>
            <CardTitle>Choose Price</CardTitle>
            <CardDescription>
              Change your product pricing here and click post.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Price</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) =>
                  !Number.isNaN(+e.target.value) && setPrice(e.target.value)
                }
                className={`${formError?.price ? "border-red-500" : ""}`}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="duration">Bidding Duration</Label>
              <BidDurationPicker onChange={setEndDate} />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-12">
            <div className="flex w-full gap-3">
              <Button
                className="w-full"
                onClick={() => handleChangeTab("tab-2")}
                disabled={uploadProduct.isLoading || imageUploader.isLoading}
              >
                Back
              </Button>
              <Button
                className="w-full"
                onClick={() => void handleSubmit()}
                disabled={uploadProduct.isLoading || imageUploader.isLoading}
              >
                Post Product
              </Button>
            </div>
            {(uploadProduct.isLoading || imageUploader.isLoading) && (
              <div className="flex flex-col items-center gap-4">
                {imageUploader.isLoading && "Uploading images please wait..."}
                {uploadProduct.isLoading &&
                  "Creating your product please wait..."}
                <Loader2 className="text-primary-500 h-8 w-8 animate-spin" />
              </div>
            )}
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
