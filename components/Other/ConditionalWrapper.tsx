import { PropsWithChildren, ReactNode } from "react";

type ConditionalWrapperProps = PropsWithChildren<{
  condition: boolean;
  wrapper: (props: PropsWithChildren) => ReactNode;
}>;

export default function ConditionalWrapper({
  condition,
  wrapper,
  children,
}: ConditionalWrapperProps) {
  return condition ? wrapper({ children }) : children;
}
