import { useEffect } from "react";
import { Image } from "react-native";
import { ImageSource } from "../@types";

const useImagePrefetch = (images: ImageSource[]) => {
  useEffect(() => {
    images.forEach((image) => {
      //@ts-ignore
      if (image.uri) {
        //@ts-ignore
        return Image.prefetch(image.uri);
      }
    });
  }, []);
};

export default useImagePrefetch;
