import ImagePicker from "../common/ImagePicker";
import { Brand, Category, Model } from "@prisma/client";
import ComboBox from "../common/ComboBox";
import { Input } from "../ui/input";
import BidDurationPicker from "../common/BidDurationPicker";
import { Button } from "@/components/ui/button";
import { uploadImagesToBackend } from "@/utils/imageUpload";

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
import { FC, useEffect, useRef, useState } from "react";
import { OptionalItem } from "@/types/item";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { toast } from "../ui/use-toast";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { PostingModalStore } from "@/hooks/usePostingModal";

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

interface TabsDemoProps {
  setShowModal: (bool: boolean) => void;
  postingModal: PostingModalStore;
}

export const TabsDemo: FC<TabsDemoProps> = ({ setShowModal, postingModal }) => {
  const router = useRouter();
  const [searchCategory, setSearchCategory] = useState("");
  const categoryApi = api.search.category.useQuery({
    search: searchCategory,
  });
  const [selectedCategory, setSelectedCategory] = useState<OptionalItem>();

  const [tab, changeTab] = useState<"tab-1" | "tab-2">("tab-1");

  const session = useSession();
  const userId = session.data?.user.id;

  // TODO: hardcoded default category id `cllrwmem20005ua9k3cxywefx`
  // this id is for Electronics Category.
  const [searchBrand, setSearchBrand] = useState("");
  const brandApi = api.search.brands.useQuery({
    categoryId: selectedCategory?.id,
    search: searchBrand,
  });
  const [selectedBrand, setSelectedBrand] = useState<OptionalItem>();

  // TODO: hardcoded default brand id `cllrwmf4n0014ua9kz1iwr1by`
  // this id is for Apple Brand.
  const [searchModel, setSearchModel] = useState("");
  const modelApi = api.search.models.useQuery({
    brandId: selectedBrand?.id,
    search: searchModel,
  });
  const [selectedModel, setSelectedModel] = useState<OptionalItem>();

  const descriptionRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<File[]>([]);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const uploadProduct = api.product.createProduct.useMutation();
  // const [loading, setLoading] = useState(false);

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
    if (descriptionRef.current == null || priceRef.current == null) {
      return;
    }
    const description = descriptionRef.current.value;
    const price = +priceRef.current.value;
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
  console.log(images, descriptionRef.current?.value, priceRef.current?.value);

  return (
    <Tabs defaultValue="tab-1" value={tab} className="h-full w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="tab-1">Stage 01</TabsTrigger>
        <TabsTrigger value="tab-2">Stage 02</TabsTrigger>
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
                <Input ref={descriptionRef} required />
                Images
                <ImagePicker setImages={setImages} />
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
                ref={priceRef}
                id="price"
                type="number"
                defaultValue={0}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="duration">Bidding Duration</Label>
              <BidDurationPicker setEndDate={setEndDate} />
            </div>
          </CardContent>
          <CardFooter>
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
