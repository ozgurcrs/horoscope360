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
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);

        if (storedData) {
          const parsedData = JSON.parse(storedData);
          const lastStoredDate = new Date(parsedData.timestamp);
          const today = new Date();

          if (lastStoredDate.toDateString() === today.toDateString()) {
            setDailyColorEnergy(parsedData.colorEnergy);
            return;
          }
        }

        const today = new Date();
        const dayOfWeek = today.getDay();

        const todayColorEnergy = COLOR_ENERGIES.find(
          (item) => item.day === dayOfWeek
        );

        if (todayColorEnergy) {
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
