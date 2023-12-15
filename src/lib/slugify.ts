import nativeSlugify from "slugify";

export default function slugify(input: string) {
  return nativeSlugify(input) + "-" + Date.now();
}
