import { createContext, useState } from "react";

const initialScrollerContext = {
  scrollDisabled: false,
  setScrollDisabled: (_: boolean) => {},
};

export const ScrollerContext = createContext(initialScrollerContext);

export function ScrollerProvider({ children }: React.PropsWithChildren) {
  const [scrollDisabled, setScrollDisabledForReal] = useState(
    initialScrollerContext.scrollDisabled,
  );

  return (
    <ScrollerContext.Provider
      value={{
        scrollDisabled,
        setScrollDisabled: (newScrollDisabled) => {
          if (newScrollDisabled !== scrollDisabled) {
            setScrollDisabledForReal(newScrollDisabled);
          }
        },
      }}
    >
      {children}
    </ScrollerContext.Provider>
  );
}
