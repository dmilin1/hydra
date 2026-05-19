import { CommentSettingsProvider } from "./CommentSettingsContext";
import { DataModeProvider } from "./DataModeContext";
import { FiltersProvider } from "./FiltersContext";
import { GesturesProvider } from "./GesturesContext";
import { NotificationsProvider } from "./NotificationsContext";
import { PostSettingsProvider } from "./PostSettingsContext";
import { TabSettingsProvider } from "./TabSettingsContext";
import { ThemeProvider } from "./ThemeContext";
import { TranslationSettingsProvider } from "./TranslationSettingsContext";

export function SettingsProvider({ children }: React.PropsWithChildren) {
  return (
    <ThemeProvider>
      <DataModeProvider>
        <GesturesProvider>
          <NotificationsProvider>
            <PostSettingsProvider>
              <FiltersProvider>
                <CommentSettingsProvider>
                  <TranslationSettingsProvider>
                    <TabSettingsProvider>{children}</TabSettingsProvider>
                  </TranslationSettingsProvider>
                </CommentSettingsProvider>
              </FiltersProvider>
            </PostSettingsProvider>
          </NotificationsProvider>
        </GesturesProvider>
      </DataModeProvider>
    </ThemeProvider>
  );
}
