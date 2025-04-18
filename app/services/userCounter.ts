import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "../config/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "app_installed";

export const countUser = async () => {
  try {
    const counted = await AsyncStorage.getItem(STORAGE_KEY);
    if (counted) return;

    const statsRef = doc(db, "stats", "users");
    await setDoc(
      statsRef,
      { count: increment(1), lastUpdated: new Date().toISOString() },
      { merge: true }
    );

    await AsyncStorage.setItem(STORAGE_KEY, "true");

    console.log("Kullanıcı sayısı güncellendi");
  } catch (error) {
    console.log("Kullanıcı sayım hatası:", error);
  }
};
