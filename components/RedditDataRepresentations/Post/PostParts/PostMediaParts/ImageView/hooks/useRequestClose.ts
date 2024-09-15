import { useState } from "react";

const useRequestClose = (onRequestClose: () => void) => {
  const [opacity, setOpacity] = useState(1);

  return [
    opacity,
    () => {
      setOpacity(0);
      onRequestClose();
      setTimeout(() => setOpacity(1), 0);
    },
  ] as const;
};

export default useRequestClose;
