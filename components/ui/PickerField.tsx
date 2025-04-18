import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type PickerItem = {
  label: string;
  value: string;
};

type PickerFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  items: PickerItem[];
  placeholder?: string;
  isRequired?: boolean;
  error?: string;
};

export const PickerField = ({
  label,
  value,
  onChange,
  items,
  placeholder = "Seçiniz",
  isRequired = false,
  error,
}: PickerFieldProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedItem = items.find((item) => item.value === value);

  return (
    <View className="mb-4">
      <Text className="text-gray-700 text-sm mb-1 font-medium">
        {label} {isRequired && <Text className="text-red-500">*</Text>}
      </Text>

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="border border-gray-300 rounded-md p-3 bg-white flex-row justify-between items-center"
      >
        <Text className={selectedItem ? "text-gray-800" : "text-gray-400"}>
          {selectedItem?.label || placeholder}
        </Text>
        <Ionicons name="chevron-down-outline" size={20} color="#6B7280" />
      </TouchableOpacity>

      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-gray-800/50 justify-end">
          <SafeAreaView className="bg-white rounded-t-xl max-h-[70%]">
            <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
              <Text className="text-lg font-medium">{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`p-4 border-b border-gray-100 ${item.value === value ? "bg-blue-50" : ""}`}
                  onPress={() => {
                    onChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    className={`${item.value === value ? "text-blue-600 font-medium" : "text-gray-800"}`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};
