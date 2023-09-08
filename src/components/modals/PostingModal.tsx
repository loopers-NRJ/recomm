import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useRef, useState } from "react";
import { z } from "zod";

import usePostingModal from "@/hooks/usePostingModal";
import { api } from "@/utils/api";
import { uploadImagesToBackend } from "@/utils/image";
import { Brand, Category, Model } from "@prisma/client";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross1Icon } from "@radix-ui/react-icons";

import ComboBox from "../common/ComboBox";
import DatePicker from "../common/DatePicker";
import ImagePicker from "../common/ImagePicker";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";

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

const PostingModal = () => {
  const postingModal = usePostingModal();
  const router = useRouter();
  const session = useSession();

  const userId = session.data?.user.id;

  const [showModal, setShowModal] = useState(postingModal.isOpen);

  const [searchCategory, setSearchCategory] = useState("");
  const categoryApi = api.category.getCategories.useQuery({
    search: searchCategory,
  });
  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >();

  // TODO: hardcoded default category id `cllrwmem20005ua9k3cxywefx`
  // this id is for Electronics Category.
  const [searchBrand, setSearchBrand] = useState("");
  const brandApi = api.category.getBrandsByCategoryId.useQuery({
    categoryId:
      selectedCategory === undefined
        ? "cllrwmem20005ua9k3cxywefx"
        : selectedCategory.id,
    search: searchBrand,
  });
  const [selectedBrand, setSelectedBrand] = useState<Brand | undefined>();

  // TODO: hardcoded default brand id `cllrwmf4n0014ua9kz1iwr1by`
  // this id is for Apple Brand.
  const [searchModel, setSearchModel] = useState("");
  const modelApi = api.brand.getModelsByBrandId.useQuery({
    brandId:
      selectedBrand === undefined
        ? "cllrwmf4n0014ua9kz1iwr1by"
        : selectedBrand.id,
    search: searchModel,
  });
  const [selectedModel, setSelectedModel] = useState<Model | undefined>();

  const descriptionRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<File[]>([]);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const uploadProduct = api.product.createProduct.useMutation();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setShowModal(postingModal.isOpen);
  }, [postingModal.isOpen]);

  // reset the selected brand and model when the category is changed
  useEffect(() => {
    setSelectedBrand(undefined);
    setSelectedModel(undefined);
  }, [selectedCategory]);

  // reset the selected model when the brand is changed
  useEffect(() => {
    setSelectedModel(undefined);
  }, [selectedBrand]);

  const onClose = () => {
    setShowModal(false);
    setTimeout(() => {
      postingModal.onClose();
    }, 300);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

    setLoading(true);
    const imagesUrls = await uploadImagesToBackend(images);
    if (imagesUrls instanceof Error) {
      setLoading(false);
      // TODO: display the error message
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
      setLoading(false);
      return toast({
        title: "Error",
        description: product.message,
        variant: "destructive",
      });
    }
    setLoading(false);
    onClose();
    //  navigate to listing page
    void router.push(`/${userId}/listings`);
  };

  if (
    categoryApi.data instanceof Error ||
    brandApi.data instanceof Error ||
    modelApi.data instanceof Error
  ) {
    // TODO: display the error message
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

  return (
    <Dialog.Root open={postingModal.isOpen}>
      <Dialog.Portal className="relative z-50">
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        {/* Content */}
        <Dialog.DialogContent
          className={`translate fixed inset-0 z-50 mx-auto h-full w-full rounded-lg bg-white p-8 text-foreground shadow-sm duration-300 md:my-10 md:h-auto md:w-4/6 lg:h-auto lg:w-3/6 xl:w-2/5
            ${showModal ? "translate-y-0" : "translate-y-full"}
            ${showModal ? "opacity-100" : "opacity-0"}`}
        >
          {/* Close */}
          <Dialog.Close className="absolute right-0 top-0 m-3">
            <Cross1Icon onClick={onClose} />
          </Dialog.Close>
          {/* Form */}
          {loading && "loading"}
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="flex h-full flex-col justify-between"
          >
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                Category
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
                Brand
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
                Model
                <ComboBox
                  label="Model"
                  items={modelApi.data}
                  selected={selectedModel}
                  onSelect={(model) => setSelectedModel(model as Model)}
                  refetch={setSearchModel}
                  loading={modelApi.isLoading}
                />
              </div>
              Description
              <Input ref={descriptionRef} required />
              Price
              <Input ref={priceRef} type="number" defaultValue={0} required />
              Images
              <ImagePicker images={images} setImages={setImages} />
              Bidding End Date
              <DatePicker date={endDate} setDate={setEndDate} />
            </div>
            <Button variant="default" type="submit" disabled={loading}>
              Post
            </Button>
          </form>
        </Dialog.DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PostingModal;
