const iconCache: Record<string, string> = {};
const requestCache: Record<string, Promise<string>> = {};

const iconsPath = () =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? '/popisujeme'}/assets/icons`;

const iconUrl = (name: string, type: string) =>
  `${iconsPath()}/${type}/${name}.svg?v=v`;

export async function fetchIcon({
  name,
  type,
}: {
  name: string;
  type: string;
}): Promise<string> {
  const cacheKey = `${type}-${name}`;

  if (iconCache[cacheKey]) {
    return iconCache[cacheKey];
  }

  if (!requestCache[cacheKey]) {
    requestCache[cacheKey] = fetch(iconUrl(name, type)).then((response) => {
      if (response.status !== 200) {
        throw new Error("Gov Icon doesn't exists");
      }

      return response.text();
    });
  }

  const icon = await requestCache[cacheKey];
  iconCache[cacheKey] = icon;

  return icon;
}
