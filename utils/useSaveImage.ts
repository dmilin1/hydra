import { saveToLibraryAsync } from "expo-media-library";
import { Alert } from "react-native";

import useContextMenu from "./useContextMenu";

export default function useSaveImage() {
  const showContextMenu = useContextMenu();

  return async (img: string) => {
    const result = await showContextMenu({
      options: ["Save Image"],
    });
    if (result === "Save Image") {
      await saveToLibraryAsync(img);
      Alert.alert("Image saved to library");
    }
  };
}
