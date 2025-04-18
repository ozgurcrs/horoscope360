import { Colors } from "@/constants/Colors";
import { theme } from "@/constants/theme";
import { Typo } from "@/constants/Typo";
import { useColorScheme } from "@/hooks/useColorScheme";

export type ThemeType = {
  colors: typeof Colors.light;
  typography: typeof Typo;
};

type Theme = typeof theme.light | typeof theme.dark;

export function useTheme(): Theme {
  const scheme = useColorScheme() ?? "light";
  return theme[scheme];
}
