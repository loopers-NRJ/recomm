import type { Model } from "../types";
import { ModelBrandEdit, ModelCategoryEdit, ModelNameEdit } from "./Editors";

export default function BasicInfoEditSection({ model }: { model: Model }) {
  return (
    <section className="flex w-full flex-col items-center gap-2">
      <h2 className="text-lg font-semibold">Basic Informations</h2>
      <ModelNameEdit model={model} />
      {/* edit model category */}
      <ModelCategoryEdit model={model} />
      {/* edit model brand */}
      <ModelBrandEdit model={model} />
      {/* edit model price range */}
    </section>
  );
}
