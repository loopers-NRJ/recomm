let timer: NodeJS.Timeout | undefined;
export function debounce(func: () => void, timeout = 1000) {
  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func();
    }, timeout);
  };
}
