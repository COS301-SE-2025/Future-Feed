type ThemeColors =
'green'

type ThemeMode = 'dark' | 'light' | 'system' | 'future-feed'
type Theme = {
    mode: ThemeMode;
    color: ThemeColors;
};

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
};
type ThemeProviderState = {
    theme: Theme;
    setTheme:(theme: Theme) => void;
};

