import nativeSlugify from "slugify";

export default function slugify(input: string, addCurrentDate?: true) {
  if (addCurrentDate) {
    return nativeSlugify(input) + "-" + Date.now();
  }
  return nativeSlugify(input);
}
