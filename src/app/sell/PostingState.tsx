import { type OptionalItem } from "@/types/custom";
import { type ProductFormError } from "@/utils/validation";
import { type AtomicAnswer } from "@/app/sell/AtomicQuestion";
import { type MultipleChoiceAnswer } from "@/app/sell/MultipleChoiceQuestion";
import { type SingleModelPayloadIncluded } from "@/types/prisma";
import { type Category } from "@prisma/client";
import { create } from "zustand";

interface PostingState {
  title: string;
  setTitle: (newTitle: string) => void;

  description: string;
  setDescription: (newDescription: string) => void;

  price: string;
  setPrice: (newPrice: string) => void;

  couponCode: string | undefined;
  setCouponCode: (newCouponCode: string | undefined) => void;

  // bidDuration: Plan | undefined;
  // setBidDuration: (newBidDuration: Plan | undefined) => void;

  images: File[];
  setImages: (newImages: File[]) => void;

  selectedCategory: Category | undefined;
  setSelectedCategory: (newSelectedCategory: Category) => void;

  selectedBrand: OptionalItem;
  setSelectedBrand: (newSelectedBrand: OptionalItem) => void;

  selectedModel: OptionalItem;
  setSelectedModel: (newSelectedModel: OptionalItem) => void;
  modelDetails?: SingleModelPayloadIncluded;
  setModelDetails: (newModelDetails: SingleModelPayloadIncluded) => void;

  formError: ProductFormError & {
    serverError?: string;
  };
  setFormError: (
    newFormError: ProductFormError & {
      serverError?: string;
    },
  ) => void;

  atomicAnswers: AtomicAnswer[];
  setAtomicAnswers: (newAtomicAnswers: AtomicAnswer[]) => void;

  multipleChoiceAnswers: MultipleChoiceAnswer[];
  setMultipleChoiceAnswers: (
    newMultipleChoiceAnswers: MultipleChoiceAnswer[],
  ) => void;
}

export const usePostingState = create<PostingState>((set) => ({
  title: "",
  setTitle: (newTitle) => set({ title: newTitle }),

  description: "",
  setDescription: (newDescription) => set({ description: newDescription }),

  price: "",
  setPrice: (newPrice) => set({ price: newPrice }),

  couponCode: "RECOMM100",
  setCouponCode: (newCouponCode) => set({ couponCode: newCouponCode }),

  // bidDuration: undefined,
  // setBidDuration: (newBidDuration) => set({ bidDuration: newBidDuration }),

  images: [],
  setImages: (newImages) => set({ images: newImages }),

  selectedCategory: undefined,
  setSelectedCategory: (newSelectedCategory) =>
    set({ selectedCategory: newSelectedCategory }),

  selectedBrand: undefined,
  setSelectedBrand: (newSelectedBrand) =>
    set({ selectedBrand: newSelectedBrand }),

  selectedModel: undefined,
  setSelectedModel: (newSelectedModel) =>
    set({ selectedModel: newSelectedModel }),
  modelDetails: undefined,
  setModelDetails: (newModelDetails) => set({ modelDetails: newModelDetails }),

  formError: {},
  setFormError: (newFormError) => set({ formError: newFormError }),

  atomicAnswers: [],
  setAtomicAnswers: (newAtomicAnswers) =>
    set({ atomicAnswers: newAtomicAnswers }),

  multipleChoiceAnswers: [],
  setMultipleChoiceAnswers: (newMultipleChoiceAnswers) =>
    set({ multipleChoiceAnswers: newMultipleChoiceAnswers }),
}));
