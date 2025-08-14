//introduce a debounce function to prevent excessive API calls for searching in explore page

// utils/debounce.ts
export const debounce = <Args extends unknown[]>(
  func: (...args: Args) => void,
  wait: number
): ((...args: Args) => void) => {
  //let timeout: ReturnType<typeof setTimeout>;
  let timeout: NodeJS.Timeout; // Use NodeJS.Timeout for better type safety in TypeScript
  return (...args: Args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};