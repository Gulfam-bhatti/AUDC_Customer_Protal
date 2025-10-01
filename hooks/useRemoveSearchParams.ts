import { useRouter, useSearchParams } from "next/navigation";

export function useRemoveSearchParam() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const removeParam = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // agar key exist karti hai to remove karo
    if (params.has(key)) {
      params.delete(key);
      const newUrl =
        params.toString().length > 0
          ? `${window.location.pathname}?${params.toString()}`
          : window.location.pathname;

      router.replace(newUrl);
    }
  };

  return removeParam;
}
