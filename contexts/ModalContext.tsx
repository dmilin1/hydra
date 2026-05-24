import { ReactNode, createContext } from "react";

type ModalContextType = {
  setModal: (modal?: ReactNode) => void;
};

const initialModalContext: ModalContextType = {
  setModal: () => {},
};

export const ModalContext = createContext(initialModalContext);
