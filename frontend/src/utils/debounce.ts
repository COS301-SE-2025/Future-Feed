export const debounce = <Args extends unknown[]>(
  func: (...args: Args) => void,
  wait: number
): ((...args: Args) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};