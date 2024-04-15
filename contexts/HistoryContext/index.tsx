import { createContext } from "react";

export type HistoryLayer = {
  elem: JSX.Element;
  name: string;
};

export type HistoryContextType = {
  past: HistoryLayer[];
  future: HistoryLayer[];
};

export type HistoryFunctionsContextType = {
  setPast: (past: HistoryLayer[]) => void;
  setFuture: (future: HistoryLayer[]) => void;
  pushLayer: (route: HistoryLayer) => void;
  pushPath: (path: string) => void;
  reload: () => void;
  replace: (path: string) => void;
  forward: () => HistoryLayer | void;
  backward: () => HistoryLayer | void;
  setHistoryFunctions: (
    newFunctions: Omit<HistoryFunctionsContextType, "setHistoryFunctions">,
  ) => void;
};

export const initialHistoryFunctions: HistoryFunctionsContextType = {
  setPast: () => {},
  setFuture: () => {},
  pushLayer: () => {},
  pushPath: () => {},
  reload: () => {},
  replace: () => {},
  forward: () => {},
  backward: () => {},
  setHistoryFunctions: () => {},
};

export const initialHistory: {
  past: HistoryLayer[];
  future: HistoryLayer[];
} = {
  past: [],
  future: [],
};

export type HistoryProviderProps = {
  initialPast?: typeof initialHistory.past;
  initialFuture?: typeof initialHistory.future;
  children?: JSX.Element;
};

export const HistoryContext = createContext(initialHistory);
export const HistoryFunctionsContext = createContext(initialHistoryFunctions);
