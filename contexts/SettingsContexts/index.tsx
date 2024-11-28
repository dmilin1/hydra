import { CommentSettingsProvider } from "./CommentSettingsContext";
import { DataModeProvider } from "./DataModeContext";
import { PostSettingsProvider } from "./PostSettingsContext";
import { ThemeProvider } from "./ThemeContext";

export function SettingsProvider({ children }: React.PropsWithChildren) {
  return (
    <ThemeProvider>
      <DataModeProvider>
        <PostSettingsProvider>
          <CommentSettingsProvider>{children}</CommentSettingsProvider>
        </PostSettingsProvider>
      </DataModeProvider>
    </ThemeProvider>
  );
}
