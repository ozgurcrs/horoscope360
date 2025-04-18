import { BottomSheetRefProps } from "@/components/BottomSheet";
import { UserFormData } from "@/components/UserInfoForm";
import { STORAGE_KEYS } from "@/constants";
import { calculateHoroscope } from "@/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useRouter } from "expo-router";
import { useRef, useState, useCallback } from "react";
import { Alert, Keyboard, Platform } from "react-native";
import { useUser } from "@/context/UserContext";

export const useWelcome = () => {
  const bottomSheetRef = useRef<BottomSheetRefProps>(null);
  const [tapCount, setTapCount] = useState(0);
  const tapTimeout = useRef<NodeJS.Timeout>();
  const [isLoadingWelcomePage, setIsLoadingWelcomePage] =
    useState<boolean>(false);

  const redirect = useRouter();
  const { setUserInfo } = useUser();

  const handleSaveUser = async (data: UserFormData) => {
    try {
      setIsLoadingWelcomePage(true);
      const horoscope = calculateHoroscope({
        birthDate: data.birthDate,
        birthTime: data.birthTime.toISOString(),
        birthPlace: data.city,
      });

      const userInfoData = {
        ...data,
        birthDate: data.birthDate.toISOString(),
        birthTime: data.birthTime.toISOString(),
        horoscope,
      };

      await setUserInfo(userInfoData);

      console.log("Kullanıcı kaydedildi, yönlendirme yapılıyor");
      redirect.replace("/(tabs)");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingWelcomePage(false);
      handleCloseBottomSheet();
    }
  };

  const handleOpenBottomSheet = useCallback(() => {
    console.log("BottomSheet'i açmaya çalışıyorum");

    const openValue = Platform.OS === "android" ? 0.98 : 0.9;

    bottomSheetRef.current?.scrollTo(openValue);

    Keyboard.dismiss();

    const keepBottomSheetFullyOpen = () => {
      if (bottomSheetRef.current?.isActive()) {
        bottomSheetRef.current?.scrollTo(openValue);
      }
    };

    let openIntervalId: NodeJS.Timeout;
    const startKeepingOpen = () => {
      if (openIntervalId) clearInterval(openIntervalId);

      openIntervalId = setInterval(keepBottomSheetFullyOpen, 100);

      setTimeout(() => {
        clearInterval(openIntervalId);
      }, 3000);
    };

    startKeepingOpen();

    setTimeout(() => startKeepingOpen(), 500);
    setTimeout(() => startKeepingOpen(), 1000);
    setTimeout(() => startKeepingOpen(), 2000);
  }, []);

  const handleCloseBottomSheet = () => {
    Keyboard.dismiss();
    bottomSheetRef.current?.scrollTo(0);
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

  const handleLogoPress = async () => {
    setTapCount((prev) => {
      const newCount = prev + 1;

      if (newCount === 5) {
        resetAllData().then((success) => {
          if (success) {
            Alert.alert("Başarılı", "Tüm veriler sıfırlandı");
            router.replace("/welcome");
          }
        });
        return 0;
      }

      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
      }

      tapTimeout.current = setTimeout(() => {
        setTapCount(0);
      }, 2000);

      return newCount;
    });
  };

  return {
    isLoadingWelcomePage,
    handleSaveUser,
    handleOpenBottomSheet,
    handleCloseBottomSheet,
    bottomSheetRef,
    handleLogoPress,
  };
};
