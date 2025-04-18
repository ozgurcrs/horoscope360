import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

interface UserInformation {
  name: string;
  birthDate: string;
}

export const useUserInformation = () => {
  const [userInformation, setUserInformation] =
    useState<UserInformation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await AsyncStorage.getItem("userInformation");
        if (userInfo) {
          setUserInformation(JSON.parse(userInfo));
        }
      } catch (error) {
        console.error("Kullanıcı bilgisi alınamadı:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  return { userInformation, loading };
};
