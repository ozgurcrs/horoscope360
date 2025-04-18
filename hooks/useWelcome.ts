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

    // Daha yüksek açılma değeri kullan
    const openValue = Platform.OS === "android" ? 0.98 : 0.9;

    // İlk açılış
    bottomSheetRef.current?.scrollTo(openValue);

    // Klavyeyi kapat
    Keyboard.dismiss();

    // Bu işlev BottomSheet'i tam açık tutacak
    const keepBottomSheetFullyOpen = () => {
      if (bottomSheetRef.current?.isActive()) {
        bottomSheetRef.current?.scrollTo(openValue);
      }
    };

    // BottomSheet'in açık kalmasını sağlamak için sürekli kontrol
    let openIntervalId: NodeJS.Timeout;
    const startKeepingOpen = () => {
      // Önce interval'i temizle (varsa)
      if (openIntervalId) clearInterval(openIntervalId);

      // 100ms'de bir kontrol et (dokunmalar sırasında tepki vermesi için)
      openIntervalId = setInterval(keepBottomSheetFullyOpen, 100);

      // 3 saniye sonra interval'i durdur
      setTimeout(() => {
        clearInterval(openIntervalId);
      }, 3000);
    };

    // Başlat
    startKeepingOpen();

    // Kullanıcı dokunduğunda tekrar başlat (touchstart olayını yakalayamıyoruz,
    // bu yüzden düzenli kontroller yapacağız)
    setTimeout(() => startKeepingOpen(), 500);
    setTimeout(() => startKeepingOpen(), 1000);
    setTimeout(() => startKeepingOpen(), 2000);
  }, []);

  const handleCloseBottomSheet = () => {
    Keyboard.dismiss(); // Klavyeyi kapat
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

      // 5 hızlı tıklama olduğunda
      if (newCount === 5) {
        resetAllData().then((success) => {
          if (success) {
            Alert.alert("Başarılı", "Tüm veriler sıfırlandı");
            router.replace("/welcome");
          }
        });
        return 0;
      }

      // Tıklama sayacını sıfırla (2 saniye içinde 5 tıklama olmazsa)
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
