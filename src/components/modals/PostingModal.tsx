import * as Dialog from "@radix-ui/react-dialog";
import usePostingModal from "@/hooks/usePostingModal";
import { Cross1Icon } from "@radix-ui/react-icons";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormEvent, useEffect, useRef, useState } from "react";
import ComboBox from "../common/ComboBox";
import { api } from "@/utils/api";
import ImagePicker from "../common/ImagePicker";
import DatePicker from "../common/DatePicker";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const PostingModal = () => {
  const postingModal = usePostingModal();
  const router = useRouter();

  const session = useSession();
  const userId = session.data?.user.id;

  const [showModal, setShowModal] = useState(postingModal.isOpen);

  const { data: categories = [] } = api.category.getCategories.useQuery({});
  const [selectedCategory, setSelectedCategory] = useState("");

  // TODO: hardcoded default category id `cllrwmem20005ua9k3cxywefx`
  // this id is for Electronics Category.
  const { data: brands = [] } = api.category.getBrandsByCategoryId.useQuery({
    categoryId:
      selectedCategory === "" ? "cllrwmem20005ua9k3cxywefx" : selectedCategory,
  });
  const [selectedBrand, setSelectedBrand] = useState("");

  // TODO: hardcoded default brand id `cllrwmf4n0014ua9kz1iwr1by`
  // this id is for Apple Brand.
  const { data: models = [] } = api.brand.getModelsByBrandId.useQuery({
    brandId: selectedBrand === "" ? "cllrwmf4n0014ua9kz1iwr1by" : selectedBrand,
  });
  const [selectedModel, setSelectedModel] = useState("");

  const descriptionRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<File[]>([]);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const uploadProduct = api.product.createProduct.useMutation();

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setShowModal(postingModal.isOpen);
  }, [postingModal.isOpen]);

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
    if (description === "") {
      return alert("Description cannot be empty");
    }
    if (Number.isNaN(price)) {
      return alert("Price must be a number");
    }
    if (selectedCategory === "") {
      return alert("Category must be selected");
    }
    if (selectedBrand === "") {
      return alert("Brand must be selected");
    }
    if (selectedModel === "") {
      return alert("Model must be selected");
    }

    const formData = new FormData();
    images.forEach((picture) => {
      formData.append("images", picture);
    });
    const uploadedPictureUrls = [];
    setLoading(true);
    try {
      const result = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });

      if (!result.ok) {
        setLoading(false);
        console.log(result);
        return alert("cannot upload the images. this is the place");
      }
      const data = await result.json();
      // ckech weather the data.files is an array of string
      if (
        Array.isArray(data) &&
        data.every((item): item is string => typeof item === "string")
      ) {
        uploadedPictureUrls.push(...data);
      } else {
        setLoading(false);
        console.log(data);
        return alert("cannot upload the images.");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      return alert("cannot upload the images.");
    }

    const product = await uploadProduct.mutateAsync({
      price,
      description,
      modelId: selectedModel,
      closedAt: endDate ?? new Date(Date.now() + 60 * 60 * 24 * 7),
      images: uploadedPictureUrls,
    });
    if (product instanceof Error) {
      setLoading(false);
      return alert(product.message);
    }

    console.log("product", product);
    setLoading(false);
    onClose();
    //  navigate to listing page
    void router.push(`/${userId}/listings`);
  };

  if (
    categories instanceof Error ||
    brands instanceof Error ||
    models instanceof Error
  ) {
    // const error =
    //   categories instanceof Error
    //     ? categories
    //     : brands instanceof Error
    //     ? brands
    //     : models instanceof Error
    //     ? models
    //     : null;
    // give a descriptive error message
    // return <h1>{error?.message}</h1>;
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
                  items={categories}
                  selected={selectedCategory}
                  onSelect={setSelectedCategory}
                />
              </div>
              <div className="flex justify-between">
                Brand
                <ComboBox
                  label="Brand"
                  items={brands}
                  selected={selectedBrand}
                  onSelect={setSelectedBrand}
                />
              </div>
              <div className="flex justify-between">
                Model
                <ComboBox
                  label="Model"
                  items={models}
                  selected={selectedModel}
                  onSelect={setSelectedModel}
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
