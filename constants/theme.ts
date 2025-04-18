import { Colors } from "./Colors";
import { Typo } from "./Typo";

export const theme = {
  light: {
    colors: Colors.light,
    typography: Typo,
  },
  dark: {
    colors: Colors.dark,
    typography: Typo,
  },
};

export type ThemeType = typeof theme.light;
