import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "../config/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "app_installed";

// Basit kullanıcı sayacı - sadece bir kez çalışır
export const countUser = async () => {
  try {
    // Daha önce sayıldı mı kontrol et
    const counted = await AsyncStorage.getItem(STORAGE_KEY);
    if (counted) return;

    // Firestore'da "stats" koleksiyonunda "users" dokümanını güncelle
    // Eğer belge yoksa otomatik oluştur
    const statsRef = doc(db, "stats", "users");
    await setDoc(
      statsRef,
      { count: increment(1), lastUpdated: new Date().toISOString() },
      { merge: true }
    );

    // Cihazı sayıldı olarak işaretle
    await AsyncStorage.setItem(STORAGE_KEY, "true");

    console.log("Kullanıcı sayısı güncellendi");
  } catch (error) {
    // Hataları sessizce yok say
    console.log("Kullanıcı sayım hatası:", error);
  }
};
