import { Platform, Share } from "react-native";

export default async function shareURL(url: string, title?: string) {
  await Share.share(
    Platform.OS === "android"
      ? {
          message: url,
          title,
        }
      : {
          url,
          message: title,
        },
  );
}
