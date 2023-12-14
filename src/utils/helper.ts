const globalThisForTimer = globalThis as unknown as {
  timer: NodeJS.Timeout | undefined;
};

export const debounce = <T>(func: (...props: T[]) => void, timeout = 1000) => {
  return (...props: T[]) => {
    clearTimeout(globalThisForTimer.timer);
    globalThisForTimer.timer = setTimeout(() => {
      func(...props);
    }, timeout);
  };
};

export const truncate = (str: string, maxLength = 20) => {
  if (str.length > maxLength) {
    return `${str.slice(0, maxLength)}...`;
  }
  return str;
};
