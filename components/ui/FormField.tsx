import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StyleProp,
  TextStyle,
} from "react-native";

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "number-pad" | "email-address";
  isRequired?: boolean;
  error?: string;
  style?: StyleProp<TextStyle>;
};

export const FormField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  isRequired = false,
  error,
  style,
}: FormFieldProps) => {
  return (
    <View className="mb-4">
      <Text style={style} className="text-gray-700 text-sm mb-1 font-medium">
        {label} {isRequired && <Text style={{ color: "red" }}> *</Text>}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        className="border border-gray-300 rounded-md p-3 bg-white text-gray-800"
      />
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
};
