import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type CheckboxFieldProps = {
  label: React.ReactNode;
  value: boolean;
  onValueChange: (value: boolean) => void;
  error?: string;
  style?: StyleProp<TextStyle>;
};

export const CheckboxField = ({
  label,
  value,
  onValueChange,
  error,
  style,
}: CheckboxFieldProps) => {
  return (
    <View className="mb-4">
      <TouchableOpacity
        className="flex-row items-start"
        onPress={() => onValueChange(!value)}
        activeOpacity={0.7}
      >
        <View
          className={`w-6 h-6 rounded border flex items-center justify-center mr-2 mt-0.5 ${
            value ? "bg-blue-600 border-blue-600" : "bg-white border-gray-400"
          }`}
        >
          {value && <Ionicons name="checkmark" size={16} color="white" />}
        </View>
        <View className="flex-1">
          <Text className="text-gray-700 text-sm">{label}</Text>
          {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
        </View>
      </TouchableOpacity>
    </View>
  );
};
