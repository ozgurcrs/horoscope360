import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Modal,
  SafeAreaView,
  StyleProp,
  TextStyle,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

type DateTimeFieldProps = {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  mode: "date" | "time";
  isRequired?: boolean;
  error?: string;
  style?: StyleProp<TextStyle>;
};

export const DateTimeField = ({
  label,
  value,
  onChange,
  mode,
  isRequired = false,
  error,
  style,
}: DateTimeFieldProps) => {
  const [showModal, setShowModal] = useState(false);
  const [tempDate, setTempDate] = useState(value);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === "android") {
        onChange(selectedDate);
        setShowModal(false);
      }
    }
  };

  const formatValue = () => {
    if (mode === "date") {
      return value.toLocaleDateString("tr-TR");
    } else {
      return value.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  const handleDone = () => {
    onChange(tempDate);
    setShowModal(false);
  };

  return (
    <View className="mb-4">
      <Text style={style} className="text-gray-700 text-sm mb-1 font-medium">
        {label} {isRequired && <Text className="text-red-500">*</Text>}
      </Text>
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        className="border border-gray-300 rounded-md p-3 bg-white flex-row justify-between items-center"
      >
        <Text className="text-gray-800">{formatValue()}</Text>
        <Ionicons
          name={mode === "date" ? "calendar-outline" : "time-outline"}
          size={20}
          color="#6B7280"
        />
      </TouchableOpacity>
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}

      {Platform.OS === "ios" ? (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showModal}
          onRequestClose={() => setShowModal(false)}
        >
          <View className="flex-1 bg-gray-800/50 justify-end">
            <SafeAreaView className="bg-white rounded-t-xl">
              <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                <TouchableOpacity onPress={handleCancel}>
                  <Text className="text-blue-500 font-medium">İptal</Text>
                </TouchableOpacity>
                <Text className="text-lg font-medium">{label}</Text>
                <TouchableOpacity onPress={handleDone}>
                  <Text className="text-blue-600 font-medium">Tamam</Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={tempDate}
                mode={mode}
                display="spinner"
                onChange={handleChange}
                locale="tr-TR"
                style={{
                  height: 200,
                  backgroundColor: "white",
                }}
                textColor="#000000"
              />
            </SafeAreaView>
          </View>
        </Modal>
      ) : (
        showModal && (
          <DateTimePicker
            value={value}
            mode={mode}
            display="default"
            onChange={handleChange}
          />
        )
      )}
    </View>
  );
};
