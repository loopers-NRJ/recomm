const globalThisForTimer = globalThis as unknown as {
  timer: NodeJS.Timeout | undefined;
};

export const debounce = (func: () => void, timeout = 1000) => {
  return () => {
    clearTimeout(globalThisForTimer.timer);
    globalThisForTimer.timer = setTimeout(() => {
      func();
    }, timeout);
  };
};

export const truncate = (str: string, maxLength = 20) => {
  if (str.length > maxLength) {
    return `${str.slice(0, maxLength)}...`;
  }
  return str;
};
