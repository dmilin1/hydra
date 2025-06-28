import { CommentSettingsProvider } from "./CommentSettingsContext";
import { DataModeProvider } from "./DataModeContext";
import { FiltersProvider } from "./FiltersContext";
import { GesturesProvider } from "./GesturesContext";
import { NotificationsProvider } from "./NotificationsContext";
import { PostSettingsProvider } from "./PostSettingsContext";
import { TabSettingsProvider } from "./TabSettingsContext";
import { ThemeProvider } from "./ThemeContext";

export function SettingsProvider({ children }: React.PropsWithChildren) {
  return (
    <ThemeProvider>
      <DataModeProvider>
        <GesturesProvider>
          <NotificationsProvider>
            <PostSettingsProvider>
              <FiltersProvider>
                <CommentSettingsProvider>
                  <TabSettingsProvider>{children}</TabSettingsProvider>
                </CommentSettingsProvider>
              </FiltersProvider>
            </PostSettingsProvider>
          </NotificationsProvider>
        </GesturesProvider>
      </DataModeProvider>
    </ThemeProvider>
  );
}
