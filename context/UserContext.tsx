import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/constants";
import { UserInformation } from "@/types";

type UserContextType = {
  userInfo: UserInformation | null;
  isLoaded: boolean;
  isLoading: boolean;
  setUserInfo: (info: UserInformation) => void;
  clearUserInfo: () => void;
};

const defaultContextValue: UserContextType = {
  userInfo: null,
  isLoaded: false,
  isLoading: true,
  setUserInfo: () => {},
  clearUserInfo: () => {},
};

const UserContext = createContext<UserContextType>(defaultContextValue);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userInfo, setUserInfoState] = useState<UserInformation | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setIsLoading(true);
        const storedData = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);

        console.log("Yüklenen kullanıcı verisi:", storedData);

        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setUserInfoState(parsedData);
        }
      } catch (error) {
        console.error("User info loading error:", error);
      } finally {
        setIsLoaded(true);
        setIsLoading(false);
        console.log("Veri yükleme tamamlandı, isLoaded:", true);
      }
    };

    loadUserInfo();
  }, []);

  const setUserInfo = async (info: UserInformation) => {
    try {
      console.log("Kaydedilen kullanıcı bilgisi:", info);
      setUserInfoState(info);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(info));
    } catch (error) {
      console.error("User info save error:", error);
    }
  };

  const clearUserInfo = async () => {
    try {
      await AsyncStorage.clear();
      console.log("Tüm veriler silindi");

      setUserInfoState(null);
    } catch (error) {
      console.error("Veri temizleme hatası:", error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        userInfo,
        isLoaded,
        isLoading,
        setUserInfo,
        clearUserInfo,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
