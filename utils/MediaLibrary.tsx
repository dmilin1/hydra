import { useActionSheet } from "@expo/react-native-action-sheet";
import { saveToLibraryAsync } from "expo-media-library";
import { Alert } from "react-native";

export default class MediaLibrary {
  static useSaveImage() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { showActionSheetWithOptions } = useActionSheet();

    const cancelButtonIndex = 1;
    return async (img: string) =>
      showActionSheetWithOptions(
        {
          options: ["Save Image", "Cancel"],
          cancelButtonIndex,
        },
        async (buttonIndex) => {
          if (buttonIndex === undefined || buttonIndex === cancelButtonIndex)
            return;
          await saveToLibraryAsync(img);
          Alert.alert("Image saved to library");
        },
      );
  }
}
