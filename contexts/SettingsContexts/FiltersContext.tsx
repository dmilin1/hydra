import { createContext } from "react";
import { useMMKVBoolean } from "react-native-mmkv";

const initialValues = {
  filterSeenPosts: false,
};

const initialPostSettingsContext = {
  ...initialValues,
  toggleFilterSeenPosts: (_newValue?: boolean) => {},
};

export const FiltersContext = createContext(initialPostSettingsContext);

export function FiltersProvider({ children }: React.PropsWithChildren) {
  const [filterSeenPosts, setFilterSeenPosts] =
    useMMKVBoolean("postCompactMode");

  return (
    <FiltersContext.Provider
      value={{
        filterSeenPosts: filterSeenPosts ?? initialValues.filterSeenPosts,
        toggleFilterSeenPosts: (newValue = !filterSeenPosts) =>
          setFilterSeenPosts(newValue),
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
}
