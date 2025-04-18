import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLOR_ENERGIES, DailyColorEnergy } from "@/constants/mockData";

const STORAGE_KEY = "daily_color_energy";

export const useDailyColorEnergy = (): DailyColorEnergy | null => {
  const [dailyColorEnergy, setDailyColorEnergy] =
    useState<DailyColorEnergy | null>(null);

  useEffect(() => {
    const fetchColorEnergy = async () => {
      try {
        // AsyncStorage'da kaydedilmiş veri var mı kontrol et
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);

        if (storedData) {
          const parsedData = JSON.parse(storedData);
          // Bugün hala aynı günde miyiz kontrol et
          const lastStoredDate = new Date(parsedData.timestamp);
          const today = new Date();

          if (lastStoredDate.toDateString() === today.toDateString()) {
            // Kaydedilmiş günün rengi hala geçerli, kullan
            setDailyColorEnergy(parsedData.colorEnergy);
            return;
          }
        }

        // Yeni gün veya kaydedilmiş veri yok, bugünün rengini belirle
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0-6 (Pazar-Cumartesi)

        // Günün rengini bul
        const todayColorEnergy = COLOR_ENERGIES.find(
          (item) => item.day === dayOfWeek
        );

        if (todayColorEnergy) {
          // AsyncStorage'a kaydet
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              colorEnergy: todayColorEnergy,
              timestamp: today.getTime(),
            })
          );

          setDailyColorEnergy(todayColorEnergy);
        }
      } catch (error) {
        console.error("Renk enerjisi alınırken hata:", error);
      }
    };

    fetchColorEnergy();
  }, []);

  return dailyColorEnergy;
};
