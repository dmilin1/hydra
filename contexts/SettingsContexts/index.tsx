import { DataModeProvider } from "./DataModeContext";
import { PostSettingsProvider } from "./PostSettingsContext";
import { ThemeProvider } from "./ThemeContext";

export function SettingsProvider({ children }: React.PropsWithChildren) {
  return (
    <ThemeProvider>
      <DataModeProvider>
        <PostSettingsProvider>{children}</PostSettingsProvider>
      </DataModeProvider>
    </ThemeProvider>
  );
}
