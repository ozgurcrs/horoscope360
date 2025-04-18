import { generateTarotCard } from "@/api/api";
import { Tarot, tarots } from "@/constants/tarots";
import { useEffect, useState } from "react";
export const useTarotHook = () => {
  const [tarotList, setTarotList] = useState<Tarot[]>([]);
  const [selectedTarots, setSelectedTarots] = useState<Tarot[]>([]);
  const mixTarotList = () => {
    const mixedTarotList = tarots.sort(() => Math.random() - 0.5);
    setTarotList(mixedTarotList);
  };

  useEffect(() => {
    mixTarotList();
  }, []);

  const selectTarot = (tarot: Tarot) => {
    setSelectedTarots((prev) => [...prev, tarot]);
  };

  const unselectTarot = (tarot: Tarot) => {
    setSelectedTarots((prev) => prev.filter((t) => t.id !== tarot.id));
  };

  useEffect(() => {
    if (selectedTarots.length === 3) {
      generateTarotCard(
        `3 tarot kartı seçildi:

Geçmiş: ${selectedTarots[0]?.name} – ${selectedTarots[0]?.description}  
Şimdi: ${selectedTarots[1]?.name} – ${selectedTarots[1]?.description}  
Gelecek: ${selectedTarots[2]?.name} – ${selectedTarots[2]?.description}  

Her birine karşılık gelecek şekilde kısa bir tarot yorumu yaz.  
Yorumlar 5-6 cümle olsun. Sade, pozitif ya da uyarıcı en önemlisi insanların genel beklentilerini karşılayacak bir dil kullan. Türkçe yaz. `,
        selectedTarots
      );
    }
  }, [selectedTarots]);

  return {
    tarotList,
    selectedTarots,
    selectTarot,
    unselectTarot,
  };
};
