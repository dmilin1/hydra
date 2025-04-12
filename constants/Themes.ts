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
  systemModeStyle: "light" | "dark";
  statusBar: StatusBarStyle;
  isPro: boolean;
  text: ColorValue;
  iconOrTextButton: ColorValue;
  buttonBg: ColorValue;
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
  midnight: Theme;
  discord: Theme;
  spotify: Theme;
  gilded: Theme;
  mulberry: Theme;
  ocean: Theme;
  aurora: Theme;
  royal: Theme;
};

const themes: Themes = {
  dark: {
    name: "Dark",
    systemModeStyle: "dark",
    statusBar: "light",
    text: "#fff",
    isPro: false,
    iconOrTextButton: "#2282fe",
    buttonBg: "#2282fe",
    buttonText: "#fff",
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
    systemModeStyle: "light",
    statusBar: "dark",
    text: "#000",
    isPro: false,
    iconOrTextButton: "#2282fe",
    buttonBg: "#2282fe",
    buttonText: "#fff",
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
    systemModeStyle: "dark",
    statusBar: "light",
    text: "#fff",
    isPro: false,
    iconOrTextButton: "#2282fe",
    buttonBg: "#2282fe",
    buttonText: "#fff",
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
    systemModeStyle: "dark",
    statusBar: "light",
    text: "#fff",
    isPro: false,
    iconOrTextButton: "#00a8fc",
    buttonBg: "#00a8fc",
    buttonText: "#fff",
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
    systemModeStyle: "dark",
    statusBar: "light",
    text: "#fff",
    isPro: false,
    iconOrTextButton: "#1fdf64",
    buttonBg: "#1fdf64",
    buttonText: "#fff",
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
  gilded: {
    name: "Gilded",
    systemModeStyle: "dark",
    statusBar: "light",
    text: "#ffffff",
    isPro: true,
    iconOrTextButton: "#FFD700",
    buttonBg: "#FFD700",
    buttonText: "#1a1a1a",
    subtleText: "#e8e3d9",
    verySubtleText: "#8a8580",
    background: "#1a1a1a",
    tint: "#2a2a2a",
    iconPrimary: "#FFD700",
    iconSecondary: "#DAA520",
    divider: "#3d3d20",
    postColorTint: rainbow,
    upvote: "#FFD700",
    downvote: "#8B7355",
    delete: "#B22222",
    reply: "#4FB3CC",
    moderator: "#2E8B57",
  },
  mulberry: {
    name: "Mulberry",
    systemModeStyle: "dark",
    statusBar: "light",
    text: "#ffffff",
    isPro: true,
    iconOrTextButton: "#FFB4B4",
    buttonBg: "#FFB4B4",
    buttonText: "#2d1f21",
    subtleText: "#e8e1e2",
    verySubtleText: "#8a8384",
    background: "#1d0f11",
    tint: "#382a2c",
    iconPrimary: "#FFB4B4",
    iconSecondary: "#E6A4A4",
    divider: "#4d3b3d",
    postColorTint: rainbow,
    upvote: "#FFB4B4",
    downvote: "#8B6F71",
    delete: "#B22222",
    reply: "#66D9EF",
    moderator: "#4682B4",
  },
  ocean: {
    name: "Deep Ocean",
    systemModeStyle: "dark",
    statusBar: "light",
    text: "#ffffff",
    isPro: true,
    iconOrTextButton: "#66D9EF",
    buttonBg: "#66D9EF",
    buttonText: "#1a2632",
    subtleText: "#e1e9ed",
    verySubtleText: "#7a8a94",
    background: "#1a2632",
    tint: "#243442",
    iconPrimary: "#66D9EF",
    iconSecondary: "#4FB3CC",
    divider: "#2d4456",
    postColorTint: rainbow,
    upvote: "#66D9EF",
    downvote: "#4A7B8C",
    delete: "#B22222",
    reply: "#FFB4B4",
    moderator: "#32CD32",
  },
  aurora: {
    name: "Aurora",
    systemModeStyle: "dark",
    statusBar: "light",
    text: "#ffffff",
    isPro: true,
    iconOrTextButton: "#A5FFD6",
    buttonBg: "#A5FFD6",
    buttonText: "#1a2428",
    subtleText: "#e2ede8",
    verySubtleText: "#7d8a85",
    background: "#1a2428",
    tint: "#243035",
    iconPrimary: "#A5FFD6",
    iconSecondary: "#7FDEB2",
    divider: "#2d4035",
    postColorTint: rainbow,
    upvote: "#A5FFD6",
    downvote: "#5C8C7A",
    delete: "#B22222",
    reply: "#FFD700",
    moderator: "#4169E1",
  },
  royal: {
    name: "Royal",
    systemModeStyle: "dark",
    statusBar: "light",
    text: "#ffffff",
    isPro: true,
    iconOrTextButton: "#9D4EDD",
    buttonBg: "#9D4EDD",
    buttonText: "#ffffff",
    subtleText: "#e6e1ed",
    verySubtleText: "#8a8591",
    background: "#1F1433",
    tint: "#2A1B45",
    iconPrimary: "#9D4EDD",
    iconSecondary: "#7B2CBF",
    divider: "#3C2665",
    postColorTint: rainbow,
    upvote: "#9D4EDD",
    downvote: "#5A189A",
    delete: "#B22222",
    reply: "#66D9EF",
    moderator: "#4682B4",
  },
};

export default themes;
