import { type OptionalItem } from "@/types/custom";
import { type ProductFormError } from "@/utils/validation";
import { type AtomicAnswer } from "@/app/sell/AtomicQuestion";
import { type MultipleChoiceAnswer } from "@/app/sell/MultipleChoiceQuestion";
import { type SingleModelPayloadIncluded } from "@/types/prisma";
import { type Address, type Category } from "@prisma/client";
import { create } from "zustand";

interface PostingState {
  title: string;
  description: string;
  price: string;
  couponCode: string | undefined;
  // bidDuration: Plan | undefined;
  images: File[];
  selectedCategory: Category | undefined;
  selectedBrand: OptionalItem;
  selectedModel: OptionalItem;
  modelDetails?: SingleModelPayloadIncluded;
  selectedAddress: Address | undefined;
  formError: ProductFormError & {
    serverError?: string;
  };
  atomicAnswers: AtomicAnswer[];
  multipleChoiceAnswers: MultipleChoiceAnswer[];
}

interface PostingAction {
  setTitle: (newTitle: string) => void;
  setDescription: (newDescription: string) => void;
  setPrice: (newPrice: string) => void;
  setCouponCode: (newCouponCode: string | undefined) => void;
  // setBidDuration: (newBidDuration: Plan | undefined) => void;
  setImages: (newImages: File[]) => void;
  setSelectedCategory: (newSelectedCategory: Category) => void;
  setSelectedBrand: (newSelectedBrand: OptionalItem) => void;
  setSelectedModel: (newSelectedModel: OptionalItem) => void;
  setModelDetails: (newModelDetails: SingleModelPayloadIncluded) => void;
  setSelectedAddress: (newSelectedAddress: Address) => void;
  setFormError: (
    newFormError: ProductFormError & {
      serverError?: string;
    },
  ) => void;
  setAtomicAnswers: (newAtomicAnswers: AtomicAnswer[]) => void;
  setMultipleChoiceAnswers: (
    newMultipleChoiceAnswers: MultipleChoiceAnswer[],
  ) => void;
  reset: () => void;
}

const defaultPostingState: PostingState = {
  title: "",
  description: "",
  price: "",
  couponCode: undefined,
  // bidDuration: undefined,
  images: [],
  selectedCategory: undefined,
  selectedBrand: undefined,
  selectedModel: undefined,
  selectedAddress: undefined,
  modelDetails: undefined,
  formError: {},
  atomicAnswers: [],
  multipleChoiceAnswers: [],
};

export const usePostingState = create<PostingState & PostingAction>((set) => ({
  ...defaultPostingState,

  reset: () => {
    console.debug("resetting posting state");
    set(defaultPostingState);
  },

  setTitle: (newTitle) => set({ title: newTitle }),
  setDescription: (newDescription) => set({ description: newDescription }),
  setPrice: (newPrice) => set({ price: newPrice }),
  setCouponCode: (newCouponCode) => set({ couponCode: newCouponCode }),
  // setBidDuration: (newBidDuration) => set({ bidDuration: newBidDuration }),
  setImages: (newImages) => set({ images: newImages }),
  setSelectedCategory: (newSelectedCategory) =>
    set({ selectedCategory: newSelectedCategory }),
  setSelectedBrand: (newSelectedBrand) =>
    set({ selectedBrand: newSelectedBrand }),
  setSelectedModel: (newSelectedModel) =>
    set({ selectedModel: newSelectedModel }),
  setModelDetails: (newModelDetails) => set({ modelDetails: newModelDetails }),
  setSelectedAddress: (newSelectedAddress) =>
    set({ selectedAddress: newSelectedAddress }),
  setFormError: (newFormError) => set({ formError: newFormError }),
  setAtomicAnswers: (newAtomicAnswers) =>
    set({ atomicAnswers: newAtomicAnswers }),
  setMultipleChoiceAnswers: (newMultipleChoiceAnswers) =>
    set({ multipleChoiceAnswers: newMultipleChoiceAnswers }),
}));
