import { useState } from "react";

import ImagePicker from "@/components/common/ImagePicker";
import { api } from "@/utils/api";
import { uploadImagesToBackend } from "@/utils/imageUpload";
import { Brand, Category, Model, Product } from "@prisma/client";

import type { Image } from "@/utils/validation";
const Home = () => {
  const [image, setImage] = useState<Image | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const deleteImageApi = api.image.deleteImage.useMutation();

  const createCategoryApi = api.category.createCategory.useMutation();
  const deleteCategoryApi = api.category.deleteCategoryById.useMutation();
  const [category, setCategory] = useState<Category | null>(null);

  const createBrandApi = api.brand.createBrand.useMutation();
  const deleteBrandApi = api.brand.deleteBrandById.useMutation();
  const [brand, setBrand] = useState<Brand | null>(null);

  const createModelApi = api.model.createModel.useMutation();
  const deleteModelApi = api.model.deleteModelById.useMutation();
  const [model, setModel] = useState<Model | null>(null);

  const createProductApi = api.product.createProduct.useMutation();
  const deleteProductApi = api.product.deleteProductById.useMutation();
  const [product, setProduct] = useState<Product | null>(null);

  const [error, setError] = useState<string | null>(null);

  const uploadImage = async () => {
    if (imageFiles.length === 0) {
      return setError("select a image to create a image");
    }
    const result = await uploadImagesToBackend(imageFiles);
    console.log(result);
    if (result instanceof Error) {
      return setError(result.message);
    }
    setImage(result[0]!);
  };
  const deleteImage = async () => {
    if (image === null) {
      return setError("create a image to delete");
    }
    console.log(image);
    const result = await deleteImageApi.mutateAsync({
      publicId: image.publicId,
    });
    console.log(result);
    if (result instanceof Error) {
      return setError(result.message);
    }
    setImage(null);
  };

  const createCategory = async () => {
    if (image === null) {
      return setError("create a image to create a brand");
    }
    const result = await createCategoryApi.mutateAsync({
      name: "test category",
      image,
    });
    console.log(result);
    if (result instanceof Error) {
      return setError(result.message);
    }
    setCategory(result);
  };

  const deleteCategory = async () => {
    if (category === null) {
      return setError("create a category to delete");
    }
    const result = await deleteCategoryApi.mutateAsync({
      categoryId: category.id,
    });
    console.log(result);
    if (result instanceof Error) {
      return setError(result.message);
    }
    setCategory(null);
  };

  const createBrand = async () => {
    if (image === null) {
      return setError("create a image to create a brand");
    }
    const result = await createBrandApi.mutateAsync({
      name: "test brand",
      image,
    });
    console.log(result);
    if (result instanceof Error) {
      return setError(result.message);
    }
    setBrand(result);
  };

  const deleteBrand = async () => {
    if (brand === null) {
      return setError("create a brand to delete");
    }
    const result = await deleteBrandApi.mutateAsync({
      brandId: brand.id,
    });
    console.log(result);
    if (result instanceof Error) {
      return setError(result.message);
    }
    setBrand(null);
  };

  const createProduct = async () => {
    if (image === null) {
      return setError("create a image to create a brand");
    }
    if (model === null) {
      return setError("create a model to create a product");
    }
    const result = await createProductApi.mutateAsync({
      price: 69,
      description: "test product",
      closedAt: new Date(Date.now() + 60 * 60 * 24 * 7),
      images: [image],
      modelId: model.id,
    });
    console.log(result);
    if (result instanceof Error) {
      return setError(result.message);
    }
    setProduct(result);
  };

  const deleteProduct = async () => {
    if (product === null) {
      return setError("create a brand to delete");
    }
    const result = await deleteProductApi.mutateAsync({
      productId: product.id,
    });
    console.log(result);
    if (result instanceof Error) {
      return setError(result.message);
    }
    setProduct(null);
  };

  const createModel = async () => {
    if (image === null) {
      return setError("create a image to create a brand");
    }
    if (category === null) {
      return setError("create category to create a model");
    }
    if (brand === null) {
      return setError("create brand to create a model");
    }
    const result = await createModelApi.mutateAsync({
      name: "test model",
      brandId: brand.id,
      categoryIds: [category.id],
      image,
    });

    console.log(result);
    if (result instanceof Error) {
      return setError(result.message);
    }
    setModel(result);
  };

  const deleteModel = async () => {
    if (model === null) {
      return setError("create a model to delete");
    }
    const result = await deleteModelApi.mutateAsync({
      modelId: model.id,
    });
    console.log(result);
    if (result instanceof Error) {
      return setError(result.message);
    }
    setModel(null);
  };

  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-center text-2xl font-bold">Api test</h1>

      <h1 className="text-center text-2xl font-bold text-red-400">{error}</h1>

      <section className="flex flex-col">
        <h2 className="text-center text-lg">
          Image - {image?.publicId ?? "null"}
        </h2>

        <div className="flex justify-between px-4">
          <ImagePicker setImages={setImageFiles} maxImages={1} />
          <button
            onClick={() => void uploadImage()}
            className="h-fit rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Upload Image
          </button>
          <button
            onClick={() => void deleteImage()}
            className="h-fit rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Delete Image
          </button>
        </div>
      </section>

      <section className="flex flex-col">
        <h2 className="text-center text-lg">
          Category - {category?.id ?? "null"}
        </h2>

        <div className="flex justify-between px-4">
          <button
            onClick={() => void createCategory()}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Create Category
          </button>
          <button
            onClick={() => void deleteCategory()}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Delete Category
          </button>
        </div>
      </section>
      <section className="flex flex-col">
        <h2 className="text-center text-lg">Brand - {brand?.id ?? "null"}</h2>

        <div className="flex justify-between px-4">
          <button
            onClick={() => void createBrand()}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Create Brand
          </button>
          <button
            onClick={() => void deleteBrand()}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Delete Brand
          </button>
        </div>
      </section>

      <section className="flex flex-col">
        <h2 className="text-center text-lg">Model - {model?.id ?? "null"}</h2>
        <div className="flex justify-between px-4">
          <button
            onClick={() => void createModel()}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Create Model
          </button>
          <button
            onClick={() => void deleteModel()}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Delete Model
          </button>
        </div>
      </section>

      <section className="flex flex-col">
        <h2 className="text-center text-lg">
          Product - {product?.id ?? "null"}
        </h2>
        <div className="flex justify-between px-4">
          <button
            onClick={() => void createProduct()}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Create Product
          </button>
          <button
            onClick={() => void deleteProduct()}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Delete Product
          </button>
        </div>
      </section>

      <br />
    </main>
  );
};

export default Home;
