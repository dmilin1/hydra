import { createContext } from "react";

export type ToastOptions = {
  title: string;
  body?: string;
  delay?: number;
};

type ToastContextType = {
  showToast: (toast: ToastOptions) => void;
};

const initialToastContext: ToastContextType = {
  showToast: () => {},
};

export const ToastContext = createContext(initialToastContext);
