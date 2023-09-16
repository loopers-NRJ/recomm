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
import { productSchema } from "@/utils/validation";

import { Input } from "../ui/input";
import { toast } from "../ui/use-toast";
import BidDurationPicker from "./BidDurationPicker";
import ComboBox from "./ComboBox";
import ImagePicker from "./ImagePicker";

interface FormError {
  categoryId?: string[] | undefined;
  brandId?: string[] | undefined;
  modelId?: string[] | undefined;
  title?: string[] | undefined;
  description?: string[] | undefined;
  images?: string[] | undefined;
  price?: string[] | undefined;
  closedAt?: string[] | undefined;
}

interface PostingTabsProps {
  setShowModal: (bool: boolean) => void;
  postingModal: PostingModalStore;
}

type Tab = "tab-1" | "tab-2";

const tab1Schema = productSchema.omit({ price: true, closedAt: true });

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

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [tab, changeTab] = useState<Tab>("tab-1");

  const [formError, setFormError] = useState<FormError | undefined>();
  const router = useRouter();
  const session = useSession();
  const userId = session.data?.user.id;

  const uploadProduct = api.product.createProduct.useMutation();
  const imageUploader = useImageUploader();

  // reset the selected brand and model when the category is changed
  useEffect(() => {
    setFormError(undefined);
    setSelectedBrand(undefined);
    setSelectedModel(undefined);
  }, [selectedCategory]);

  // reset the selected model when the brand is changed
  useEffect(() => {
    setFormError(undefined);
    setSelectedModel(undefined);
  }, [selectedBrand]);

  const handleSubmit = async () => {
    const result = productSchema.safeParse({
      price: +price,
      description,
      modelId: selectedModel?.id,
      brandId: selectedBrand?.id,
      categoryId: selectedCategory?.id,
      images,
      endDate,
    });
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      // error anything other than price and closedAt are from tab-1
      // so we need to change tab to tab-1 if there is an error
      if (!fields.price && !fields.closedAt) {
        handleChangeTab("tab-1");
      }
      return setFormError(fields);
    }
    const { modelId, closedAt } = result.data;

    const imagesUrls = await imageUploader.upload(images);
    if (imagesUrls instanceof Error) {
      console.log(imagesUrls.message);
      return toast({
        title: "Error",
        description: "cannot upload images",
        variant: "destructive",
      });
    }
    try {
      const product = await uploadProduct.mutateAsync({
        title,
        price: +price,
        description,
        modelId,
        closedAt,
        images: imagesUrls,
      });
      if (product instanceof Error) {
        console.log(product.message);
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
    if (tab === "tab-2") {
      const result = tab1Schema.safeParse({
        title,
        description,
        modelId: selectedModel?.id,
        brandId: selectedBrand?.id,
        categoryId: selectedCategory?.id,
        images,
      });
      if (!result.success) {
        return setFormError(result.error.flatten().fieldErrors);
      }
    }

    setFormError(undefined);
    changeTab(tab);
  };

  return (
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
        <Card className="border-none">
          <CardHeader>
            <CardTitle>Choose Product Details</CardTitle>
            <CardDescription>
              Make changes to your posting here. Click next when you are done.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2">
            <form className="flex h-full flex-col justify-between">
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
                <div className="flex justify-between">
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
                <div className="flex justify-between">
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
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                  className={`${
                    formError?.title
                      ? "border-red-500 text-red-500"
                      : "border-gray-300 text-gray-500"
                  }`}
                  placeholder="Enter title..."
                  required
                />
                <Label>Description</Label>
                <Input
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                  className={`${
                    formError?.description
                      ? "border-red-500 text-red-500"
                      : "border-gray-300 text-gray-500"
                  }`}
                  placeholder="Enter description..."
                  required
                />
                Images
                <ImagePicker
                  setImages={setImages}
                  images={images}
                  requiredError={!!formError?.images}
                />
              </div>
            </form>
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
                className={`${
                  formError?.price
                    ? "border-red-500 text-red-500"
                    : "border-gray-300 text-gray-500"
                }`}
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
                onClick={() => handleChangeTab("tab-1")}
              >
                Back
              </Button>
              <Button className="w-full" onClick={() => void handleSubmit()}>
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
