import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import _ from "lodash";
import { UserFormData } from "@/components/UserInfoForm";
import { BottomSheetRefProps } from "@/components/BottomSheet";
import { STORAGE_KEYS } from "@/constants";
const useUserInformations = () => {
  const redirect = useRouter();
  const bottomSheetRef = useRef<BottomSheetRefProps>(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleSaveUser = async (data: UserFormData) => {
    try {
      setIsLoading(true);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(data));
      redirect.replace("/(tabs)");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      handleCloseBottomSheet();
    }
  };

  const handleOpenBottomSheet = () => {
    bottomSheetRef.current?.scrollTo(-0.85);
  };

  const handleCloseBottomSheet = () => {
    bottomSheetRef.current?.scrollTo(0);
  };

  return {
    handleSaveUser,
    isLoading,
    bottomSheetRef,
    handleOpenBottomSheet,
    handleCloseBottomSheet,
  };
};

const resetAllData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.error("Reset error:", error);
    return false;
  }
};

export { resetAllData };

export default useUserInformations;
