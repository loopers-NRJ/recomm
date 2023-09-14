import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { z } from "zod";

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
import { OptionalItem } from "@/types/item";
import { api } from "@/utils/api";
import { uploadImagesToBackend } from "@/utils/imageUpload";
import { Brand, Category, Model } from "@prisma/client";

import BidDurationPicker from "../common/BidDurationPicker";
import ComboBox from "../common/ComboBox";
import ImagePicker from "../common/ImagePicker";
import { Input } from "../ui/input";
import { toast } from "../ui/use-toast";

const productSchema = z.object({
  price: z
    .number()
    .int("Price cannot have decimal values")
    .positive("Price must not be negative"),
  description: z.string().min(1),
  modelId: z.string().min(1),
  brandId: z.string().min(1),
  categoryId: z.string().min(1),
});

interface PostingTabsProps {
  setShowModal: (bool: boolean) => void;
  postingModal: PostingModalStore;
}

export const PostingTabs: FC<PostingTabsProps> = ({
  setShowModal,
  postingModal,
}) => {
  const router = useRouter();
  const [searchCategory, setSearchCategory] = useState("");
  const categoryApi = api.search.category.useQuery({
    search: searchCategory,
  });
  const [selectedCategory, setSelectedCategory] = useState<OptionalItem>();

  const [tab, changeTab] = useState<"tab-1" | "tab-2">("tab-1");

  const session = useSession();
  const userId = session.data?.user.id;

  const [searchBrand, setSearchBrand] = useState("");
  const brandApi = api.search.brands.useQuery({
    categoryId: selectedCategory?.id,
    search: searchBrand,
  });
  const [selectedBrand, setSelectedBrand] = useState<OptionalItem>();

  const [searchModel, setSearchModel] = useState("");
  const modelApi = api.search.models.useQuery({
    brandId: selectedBrand?.id,
    search: searchModel,
  });
  const [selectedModel, setSelectedModel] = useState<OptionalItem>();

  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);

  const [images, setImages] = useState<File[]>([]);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const uploadProduct = api.product.createProduct.useMutation();

  // reset the selected brand and model when the category is changed
  useEffect(() => {
    setSelectedBrand(undefined);
    setSelectedModel(undefined);
  }, [selectedCategory]);

  // reset the selected model when the brand is changed
  useEffect(() => {
    setSelectedModel(undefined);
  }, [selectedBrand]);

  const handleSubmit = async () => {
    const result = productSchema.safeParse({
      price,
      description,
      modelId: selectedModel?.id,
      brandId: selectedBrand?.id,
      categoryId: selectedCategory?.id,
    });

    if (!result.success) {
      return toast({
        title: "Error",
        description: result.error.message,
        variant: "destructive",
      });
    }
    const { modelId } = result.data;

    // setLoading(true);
    const imagesUrls = await uploadImagesToBackend(images);
    if (imagesUrls instanceof Error) {
      // setLoading(false);
      return toast({
        title: "Error",
        description: imagesUrls.message,
        variant: "destructive",
      });
    }

    const product = await uploadProduct.mutateAsync({
      price,
      description,
      modelId,
      closedAt: endDate ?? new Date(Date.now() + 60 * 60 * 24 * 7),
      images: imagesUrls,
    });
    if (product instanceof Error) {
      // setLoading(false);
      return toast({
        title: "Error",
        description: product.message,
        variant: "destructive",
      });
    }
    // setLoading(false);
    onClose();
    //  navigate to listing page
    void router.push(`/${userId}/listings`);
  };

  const onClose = () => {
    setShowModal(false);
    setTimeout(() => {
      postingModal.onClose();
    }, 300);
  };

  if (
    categoryApi.data instanceof Error ||
    brandApi.data instanceof Error ||
    modelApi.data instanceof Error
  ) {
    const error =
      categoryApi.data instanceof Error
        ? categoryApi.data
        : brandApi.data instanceof Error
        ? brandApi.data
        : modelApi.data instanceof Error
        ? modelApi.data
        : null;
    toast({
      title: "Error",
      description: error?.message,
      variant: "destructive",
    });
    return;
  }

  const handleChangeTab = (tab: "tab-1" | "tab-2") => () => {
    // validate the input if needed
    changeTab(tab);
  };

  return (
    <Tabs defaultValue="tab-1" value={tab} className="h-full w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="tab-1" onClick={handleChangeTab("tab-1")}>
          Stage 01
        </TabsTrigger>
        <TabsTrigger value="tab-2" onClick={handleChangeTab("tab-2")}>
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
                    items={categoryApi.data}
                    selected={selectedCategory}
                    onSelect={(category) =>
                      setSelectedCategory(category as Category)
                    }
                    refetch={setSearchCategory}
                    loading={categoryApi.isLoading}
                  />
                </div>
                <div className="flex justify-between">
                  <Label>Brand</Label>
                  <ComboBox
                    label="Brand"
                    items={brandApi.data}
                    selected={selectedBrand}
                    onSelect={(brand) => setSelectedBrand(brand as Brand)}
                    refetch={setSearchBrand}
                    loading={brandApi.isLoading}
                  />
                </div>
                <div className="flex justify-between">
                  <Label>Model</Label>
                  <ComboBox
                    label="Model"
                    items={modelApi.data}
                    selected={selectedModel}
                    onSelect={(model) => setSelectedModel(model as Model)}
                    refetch={setSearchModel}
                    loading={modelApi.isLoading}
                  />
                </div>
                <Label>Description</Label>
                <Input
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                  required
                />
                Images
                <ImagePicker setImages={setImages} images={images} />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => changeTab("tab-2")}>
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
                onChange={(e) => setPrice(+e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="duration">Bidding Duration</Label>
              <BidDurationPicker setEndDate={setEndDate} />
            </div>
          </CardContent>
          <CardFooter className="gap-3">
            <Button className="w-full" onClick={() => changeTab("tab-1")}>
              Back
            </Button>
            <Button className="w-full" onClick={() => void handleSubmit()}>
              Post Product
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
