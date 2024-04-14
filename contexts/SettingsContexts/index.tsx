import { DataModeProvider } from './DataModeContext';
import { ThemeProvider } from './ThemeContext';


export function SettingsProvider({ children }: React.PropsWithChildren) {

    return (
        <ThemeProvider>
            <DataModeProvider>
                {children}
            </DataModeProvider>
        </ThemeProvider>
    );
}
