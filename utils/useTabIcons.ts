import Entypo from "@react-native-vector-icons/entypo";
import Feather from "@react-native-vector-icons/feather";
import Ionicons from "@react-native-vector-icons/ionicons";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import type { NativeBottomTabIcon } from "@react-navigation/bottom-tabs/unstable";
import { useEffect, useState } from "react";
import { ImageSourcePropType, Platform } from "react-native";

import type { TabParamsList } from "../app/tabs";

type TabIcon = (props: { focused: boolean }) => NativeBottomTabIcon;
export type TabIcons = Partial<Record<keyof TabParamsList, TabIcon>>;

type SFSymbol = Extract<NativeBottomTabIcon, { type: "sfSymbol" }>["name"];

const sfSymbol =
  (name: SFSymbol, selectedName: SFSymbol = name): TabIcon =>
  ({ focused }) => ({ type: "sfSymbol", name: focused ? selectedName : name });

const IOS_ICONS: TabIcons = {
  Posts: sfSymbol("text.below.photo", "text.below.photo.fill"),
  Inbox: sfSymbol("envelope", "envelope.fill"),
  Account: sfSymbol("person.crop.circle", "person.crop.circle.fill"),
  Search: sfSymbol("magnifyingglass"),
  Settings: sfSymbol("gearshape", "gearshape.fill"),
};

// Square box keeps the glyph centered in Material's 24dp icon slot.
const GLYPH_OPTIONS = { size: 24, lineHeight: 24, color: "white" };

let androidIcons: TabIcons | null = null;

// Android has no SF Symbols, so today's glyphs are rendered to images once.
async function loadAndroidIcons(): Promise<TabIcons> {
  const [Posts, Inbox, Account, Search, Settings] = (
    await Promise.all([
      MaterialCommunityIcons.getImageSource("post", GLYPH_OPTIONS),
      Entypo.getImageSource("mail", GLYPH_OPTIONS),
      MaterialIcons.getImageSource("account-circle", GLYPH_OPTIONS),
      Feather.getImageSource("search", GLYPH_OPTIONS),
      Ionicons.getImageSource("settings-sharp", GLYPH_OPTIONS),
    ])
  ).map(
    (source): TabIcon =>
      () => ({ type: "image", source: source as ImageSourcePropType }),
  );
  return { Posts, Inbox, Account, Search, Settings };
}

/** Returns null until the icons are ready so the tab bar never renders blank. */
export default function useTabIcons(): TabIcons | null {
  const [icons, setIcons] = useState<TabIcons | null>(
    Platform.OS === "ios" ? IOS_ICONS : androidIcons,
  );

  useEffect(() => {
    if (icons) return;
    loadAndroidIcons()
      // Labels alone beat being stuck on the splash screen.
      .catch(() => ({}))
      .then((loaded) => {
        androidIcons = loaded;
        setIcons(loaded);
      });
  }, []);

  return icons;
}
