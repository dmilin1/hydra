import { createContext } from "react";

export type HistoryLayer = {
  elem: JSX.Element;
  name: string;
};

export type HistoryContextType = {
  past: HistoryLayer[];
  future: HistoryLayer[];
};

export type HistoryFunctionsType = {
  setPast: (past: HistoryLayer[]) => void;
  setFuture: (future: HistoryLayer[]) => void;
  pushLayer: (route: HistoryLayer) => void;
  pushPath: (path: string) => void;
  reload: () => void;
  replace: (path: string) => void;
  forward: () => HistoryLayer | void;
  backward: () => HistoryLayer | void;
};

export const HistoryFunctions: HistoryFunctionsType = {
  setPast: () => {},
  setFuture: () => {},
  pushLayer: () => {},
  pushPath: () => {},
  reload: () => {},
  replace: () => {},
  forward: () => {},
  backward: () => {},
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
