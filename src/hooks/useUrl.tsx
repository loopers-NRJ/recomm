import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function useUrl<T extends string>(
  key: string,
  defaultValue: T
): [T, (value?: T) => void];
export default function useUrl<T = undefined>(
  key: string
): [T | undefined, (value?: T) => void];

export default function useUrl<T extends string>(
  key: Readonly<string>,
  defaultValue?: T
) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  // load initial value from url
  useEffect(() => {
    const urlValue = router.query[key] as T | undefined;
    if (urlValue) {
      setValue(urlValue);
    }
  }, [key, router.query]);

  useEffect(() => {
    if (value && value !== router.query[key]) {
      void router.push(
        { query: { ...router.query, [key]: value } },
        undefined,
        { shallow: true }
      );
    } else {
      const { [key]: oldValue, ...query } = router.query;
      console.log("removing", { key, oldValue });
      void router.push({ query }, undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, value]);

  return [value, setValue] as const;
}
