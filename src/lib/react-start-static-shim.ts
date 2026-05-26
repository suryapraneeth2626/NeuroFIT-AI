export function useServerFn<T extends (...args: Array<any>) => any>(serverFn: T): T {
  return serverFn;
}

export function createServerFn() {
  const builder = {
    inputValidator() {
      return builder;
    },
    handler() {
      return async () => ({
        reply: "",
        error: "The AI coach needs server hosting and is unavailable on GitHub Pages.",
      });
    },
  };

  return builder;
}
