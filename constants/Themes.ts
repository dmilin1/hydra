import { StatusBarStyle } from "expo-status-bar";
import { ColorValue } from "react-native";

const rainbow = [
  "#e40303",
  "#ff8c00",
  "#e6d600",
  "#008026",
  "#24408e",
  "#732982",
];

type Theme = {
  name: string;
  statusBar: StatusBarStyle;
  text: ColorValue;
  buttonText: ColorValue;
  subtleText: ColorValue;
  verySubtleText: ColorValue;
  background: ColorValue;
  tint: ColorValue;
  iconPrimary: ColorValue;
  iconSecondary: ColorValue;
  divider: ColorValue;
  postColorTint: string[];
  upvote: ColorValue;
  downvote: ColorValue;
  delete: ColorValue;
  reply: ColorValue;
  moderator: ColorValue;
};

type Themes = {
  dark: Theme;
  light: Theme;
};

export default {
  dark: {
    name: "Dark",
    statusBar: "light",
    text: "#fff",
    buttonText: "#2282fe",
    subtleText: "#ccc",
    verySubtleText: "#666",
    background: "#000",
    tint: "#131516",
    iconPrimary: "#2282fe",
    iconSecondary: "#ccc",
    divider: "#222222",
    postColorTint: rainbow,
    upvote: "#ff6c00",
    downvote: "#565fe3",
    delete: "#ff0000",
    reply: "#23b5ff",
    moderator: "#00940f",
  },
  light: {
    name: "Light",
    statusBar: "dark",
    text: "#000",
    buttonText: "#2282fe",
    subtleText: "#222",
    verySubtleText: "#888",
    background: "#ffffff",
    tint: "#f2f3f7",
    iconPrimary: "#2282fe",
    iconSecondary: "#ccc",
    divider: "#999",
    postColorTint: rainbow,
    upvote: "#ff6c00",
    downvote: "#565fe3",
    delete: "#ff0000",
    reply: "#23b5ff",
    moderator: "#00940f",
  },
  midnight: {
    name: "Midnight",
    statusBar: "light",
    text: "#fff",
    buttonText: "#2282fe",
    subtleText: "#e4e9ec",
    verySubtleText: "#b5bac1",
    background: "#111214",
    tint: "#1e1f22",
    iconPrimary: "#2282fe",
    iconSecondary: "#ccc",
    divider: "#383a40",
    postColorTint: rainbow,
    upvote: "#ff6c00",
    downvote: "#565fe3",
    delete: "#ff0000",
    reply: "#23b5ff",
    moderator: "#00940f",
  },
  discord: {
    name: "Discord",
    statusBar: "light",
    text: "#fff",
    buttonText: "#00a8fc",
    subtleText: "#e4e9ec",
    verySubtleText: "#b5bac1",
    background: "#1e1f22",
    tint: "#2b2d31",
    iconPrimary: "#00a8fc",
    iconSecondary: "#ccc",
    divider: "#383a40",
    postColorTint: rainbow,
    upvote: "#23a55a",
    downvote: "#f23f43",
    delete: "#ff0000",
    reply: "#23b5ff",
    moderator: "#00940f",
  },
  spotify: {
    name: "Spotify",
    statusBar: "light",
    text: "#fff",
    buttonText: "#1fdf64",
    subtleText: "#dcdcdc",
    verySubtleText: "#b5bac1",
    background: "#000000",
    tint: "#1a1a1a",
    iconPrimary: "#1fdf64",
    iconSecondary: "#ccc",
    divider: "#4d4d4d",
    postColorTint: rainbow,
    upvote: "#1fdf64",
    downvote: "#565fe3",
    delete: "#ff0000",
    reply: "#23b5ff",
    moderator: "#4687d6",
  },
} as Themes;
