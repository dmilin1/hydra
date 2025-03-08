import { CommentSettingsProvider } from "./CommentSettingsContext";
import { DataModeProvider } from "./DataModeContext";
import { FiltersProvider } from "./FiltersContext";
import { PostSettingsProvider } from "./PostSettingsContext";
import { ThemeProvider } from "./ThemeContext";

export function SettingsProvider({ children }: React.PropsWithChildren) {
  return (
    <ThemeProvider>
      <DataModeProvider>
        <PostSettingsProvider>
          <FiltersProvider>
            <CommentSettingsProvider>{children}</CommentSettingsProvider>
          </FiltersProvider>
        </PostSettingsProvider>
      </DataModeProvider>
    </ThemeProvider>
  );
}
