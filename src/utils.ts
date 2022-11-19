/** Flatten an array of promises of arrays into one promise of arrays */
export async function collect<T>(searches: Promise<T[]>[]): Promise<T[]> {
  const results = await Promise.all(
    searches.map((promise) =>
      promise.catch((reason) => {
        console.error(reason);
        return [] as T[];
      })
    )
  );
  return results.flat();
}
