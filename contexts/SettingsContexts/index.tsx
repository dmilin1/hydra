import { CommentSettingsProvider } from "./CommentSettingsContext";
import { DataModeProvider } from "./DataModeContext";
import { FiltersProvider } from "./FiltersContext";
import { NotificationsProvider } from "./NotificationsContext";
import { PostSettingsProvider } from "./PostSettingsContext";
import { TabSettingsProvider } from "./TabSettingsContext";
import { ThemeProvider } from "./ThemeContext";

export function SettingsProvider({ children }: React.PropsWithChildren) {
  return (
    <ThemeProvider>
      <DataModeProvider>
        <NotificationsProvider>
          <PostSettingsProvider>
            <FiltersProvider>
              <CommentSettingsProvider>
                <TabSettingsProvider>{children}</TabSettingsProvider>
              </CommentSettingsProvider>
            </FiltersProvider>
          </PostSettingsProvider>
        </NotificationsProvider>
      </DataModeProvider>
    </ThemeProvider>
  );
}
