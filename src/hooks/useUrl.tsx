import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";

export default function useUrl(key: string, initialValue?: string) {
  const router = useRouter();

  useEffect(() => {
    if (initialValue) {
      void router.push({ query: { ...router.query, [key]: initialValue } });
    }
  }, [initialValue, key, router]);

  const setUrl = useMemo(
    () => (value?: string) => {
      if (value) {
        void router.push({ query: { ...router.query, [key]: value } });
      } else {
        const { [key]: oldValue, ...query } = router.query;
        console.log("removing", { key, oldValue });
        void router.push({ query });
      }
    },
    [key, router]
  );

  return [router.query[key] as string | undefined, setUrl] as const;
}
