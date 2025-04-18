import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { FormField } from "./ui/FormField";
import { DateTimeField } from "./ui/DateTimeField";
import { CheckboxField } from "./ui/CheckboxField";
import { fontSizes } from "@/styles/globalStyles";

export type UserFormData = {
  fullName: string;
  birthDate: Date;
  birthTime: Date;
  country: string;
  city: string;
  privacyConsent: boolean;
};

type UserInfoFormProps = {
  onSubmit: (data: UserFormData) => void;
  initialData?: Partial<UserFormData>;
  isLoading?: boolean;
};

const styles = StyleSheet.create({
  label: {
    fontSize: fontSizes.regular,
    marginBottom: 5,
  },
  input: {
    fontSize: fontSizes.regular,
  },
});

export const UserInfoForm = ({
  onSubmit,
  initialData,
  isLoading = false,
}: UserInfoFormProps) => {
  const [formData, setFormData] = useState<UserFormData>({
    fullName: initialData?.fullName || "",
    birthDate: initialData?.birthDate || new Date(),
    birthTime: initialData?.birthTime || new Date(),
    country: initialData?.country || "",
    city: initialData?.city || "",
    privacyConsent: initialData?.privacyConsent || false,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof UserFormData, string>>
  >({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Ad ve Soyad gereklidir";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Ülke gereklidir";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Şehir gereklidir";
    }

    if (!formData.privacyConsent) {
      newErrors.privacyConsent =
        "Devam etmek için kişisel verilerin kullanımını onaylamanız gerekiyor";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-1 py-2">
          <FormField
            label="Ad ve Soyad"
            value={formData.fullName}
            onChangeText={(text) =>
              setFormData({ ...formData, fullName: text })
            }
            placeholder="Adınız ve Soyadınız"
            isRequired
            error={errors.fullName}
            style={styles.label}
          />

          <DateTimeField
            label="Doğum Tarihi"
            value={formData.birthDate}
            onChange={(date) => setFormData({ ...formData, birthDate: date })}
            mode="date"
            isRequired
            error={errors.birthDate}
            style={styles.label}
          />

          <DateTimeField
            label="Doğum Saati"
            value={formData.birthTime}
            onChange={(date) => setFormData({ ...formData, birthTime: date })}
            mode="time"
            error={errors.birthTime}
            style={styles.label}
          />

          <FormField
            label="Doğduğu Ülke"
            value={formData.country}
            onChangeText={(text) => setFormData({ ...formData, country: text })}
            placeholder="Örn: Türkiye"
            isRequired
            error={errors.country}
            style={styles.label}
          />

          <FormField
            label="Doğduğu Şehir"
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
            placeholder="Örn: İstanbul"
            isRequired
            error={errors.city}
            style={styles.label}
          />

          <CheckboxField
            label={
              <Text>
                Kişisel verilerimin horoscope hesaplama amacıyla kullanılmasını{" "}
                <Text className="text-blue-600 font-medium">
                  kabul ediyorum
                </Text>
              </Text>
            }
            value={formData.privacyConsent}
            onValueChange={(value) =>
              setFormData({ ...formData, privacyConsent: value })
            }
            error={errors.privacyConsent}
            style={styles.label}
          />

          <TouchableOpacity
            className={`mt-6 mb-16 rounded-lg py-3.5 px-4 ${
              isLoading ? "bg-purple-400" : "bg-purple-700"
            }`}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text
                className="text-white text-center font-semibold"
                style={{ fontSize: fontSizes.regular }}
              >
                Kaydet
              </Text>
            )}
          </TouchableOpacity>

          <View style={{ marginBottom: Platform.OS === "android" ? 60 : 40 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
