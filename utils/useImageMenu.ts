import { saveToLibraryAsync } from "expo-media-library";
import { Alert, Share } from "react-native";

import useContextMenu from "./useContextMenu";

async function getBase64Img(img: string) {
  const res = await fetch(img);
  const blob = await res.blob();
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      function () {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to load image as string"));
        }
      },
      false,
    );
    reader.onerror = () => {
      return reject(new Error("Failed to load image"));
    };
    reader.readAsDataURL(blob);
  });
  return base64;
}

export default function useImageMenu() {
  const showContextMenu = useContextMenu();

  return async (img: string) => {
    const result = await showContextMenu({
      options: ["Save Image", "Share"],
    });
    if (result === "Save Image") {
      await saveToLibraryAsync(img);
      Alert.alert("Image saved to library");
    } else if (result === "Share") {
      try {
        const base64 = await getBase64Img(img);
        Share.share({
          url: base64,
        });
      } catch (_e) {
        Alert.alert("Failed to share image");
      }
    }
  };
}
