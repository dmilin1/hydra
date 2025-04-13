import { CommentSettingsProvider } from "./CommentSettingsContext";
import { DataModeProvider } from "./DataModeContext";
import { FiltersProvider } from "./FiltersContext";
import { NotificationsProvider } from "./NotificationsContext";
import { PostSettingsProvider } from "./PostSettingsContext";
import { ThemeProvider } from "./ThemeContext";

export function SettingsProvider({ children }: React.PropsWithChildren) {
  return (
    <ThemeProvider>
      <DataModeProvider>
        <NotificationsProvider>
          <PostSettingsProvider>
            <FiltersProvider>
              <CommentSettingsProvider>{children}</CommentSettingsProvider>
            </FiltersProvider>
          </PostSettingsProvider>
        </NotificationsProvider>
      </DataModeProvider>
    </ThemeProvider>
  );
}
