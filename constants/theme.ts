import { Colors } from "./Colors";
import { Typo } from "./Typo";

// Açık ve koyu tema için typography'yi daha sonra özelleştirebilirsiniz
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
