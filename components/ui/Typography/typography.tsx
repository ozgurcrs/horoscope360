import { useTheme } from "@/hooks/useTheme";
import { View, Text, StyleSheet, TextStyle } from "react-native";

type TypographyProps = {
  variant: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  fontWeight?: "normal" | "bold" | "medium" | "semibold" | "light" | "thin";
  color?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "quaternary"
    | "quinary"
    | "white"
    | "black";
  fontSize?: number;
  textAlign?: "left" | "center" | "right";
  lineHeight?: number;
  label?: string;
  children?: React.ReactNode;
  numberOfLines?: number;
  styles?: TextStyle;
  className?: string;
};

export const Typography = ({
  children,
  variant = "p",
  color,
  fontWeight = "normal",
  fontSize = 16,
  textAlign = "center",
  lineHeight = 1.5,
  label,
  numberOfLines,
  styles,
  className,
  ...props
}: TypographyProps) => {
  const theme = useTheme();

  const selectedTypography: (typeof theme.typography)[keyof typeof theme.typography] =
    theme.typography[variant];

  return (
    <View className="w-full h-auto">
      <Text
        style={{
          fontWeight: selectedTypography.fontWeight as TextStyle["fontWeight"],
          fontSize: selectedTypography.fontSize,
          textAlign,
          ...styles,
        }}
        className={className}
        numberOfLines={numberOfLines}
        {...props}
      >
        {label ? label : children}
      </Text>
    </View>
  );
};
