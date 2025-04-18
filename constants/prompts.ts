import { Tarot } from "./tarots";

export const dailyHoroscopePrompt = (birthDate: string, name: string) => {
  return `Kullanıcının doğum tarihi: ${birthDate} ve ismi: ${name}  

Bugün için kısa ama anlamlı bir astrolojik yorum hazırla.  
Sadece bugüne odaklan. Genel burç yorumu verme, doğum bilgilerine göre kişiselleştir.  
Günlük ruh hali, enerjisi ve dikkat etmesi gereken konulara odaklan.  
En fazla 6-7 cümle olsun.`;
};

export const tarotCardPrompt = (tarots: Tarot[]) => {
  return `3 tarot kartı seçildi:

Geçmiş: ${tarots[0]?.name} – ${tarots[0]?.description}  
Şimdi: ${tarots[1]?.name} – ${tarots[1]?.description}  
Gelecek: ${tarots[2]?.name} – ${tarots[2]?.description}  

Her birine karşılık gelecek şekilde kısa bir tarot yorumu yaz.  
Yorumlar 5-6 cümle olsun. Sade, pozitif ya da uyarıcı en önemlisi insanların genel beklentilerini karşılayacak bir dil kullan. Türkçe yaz. `;
};

export const compatibilityPrompt = (
  name: string,
  nameToCompare: string,
  birthDate: string,
  birthDateToCompare: string
) => {
  return `Ad Soyad: ${name}  
Uyumlu kişinin Ad Soyad: ${nameToCompare}  
Doğum tarihi: ${birthDate} 
Uyumlu kişinin Doğum tarihi: ${birthDateToCompare} 

Numerolojiye göre bu kişinin temel karakter özelliklerini ve yaşam enerjisini sade bir şekilde yorumla.  
5 paragraf yaz, Türkçe yaz. Pozitif ya da uyarıcı dille olabilir, spiritüel bir ton kullan.`;
};

export const horoscopePrompt = (birthDate: string, name: string) => {
  return `Sen bir astroloji uzmanısın. ${birthDate} doğumlu, ${name} isimli kullanıcımın burcu için bugünün burç yorumunu Türkçe olarak yaz. 
      
  İlk paragrafta en az 4-5 cümlelik detaylı bir genel yorum yaz. Başlık veya "Genel Bakış" gibi etiketler kullanma. 
  
  Sonra aşağıdaki üç alan için ayrı ayrı 2-3 cümlelik detaylı yorumlar yaz:
  - Aşk ve İlişkiler
  - Kariyer ve Finans
  - Sağlık ve Enerji
  
  Her bölümün başında sadece "Aşk:", "Kariyer:", "Sağlık:" yazarak başla. 
  Markdown formatı, yıldız işaretleri veya numaralandırmalar kullanma. 
  Bilimsel terminoloji veya uyarılar ekleme.`;
};

export const tarotPrompt = (cardNames: string) => {
  return `Seçilen tarot kartları: ${cardNames}

Bu tarot kartlarına göre yorumlarını aşağıdaki gibi yap:
1. İlk paragrafta genel bir özet ver (yaklaşık 3-4 cümle)
2. Ardından her kart için ayrı birer paragraf halinde yorum yap (kart isimleri olmadan, direkt yorumu yaz)

Yorumların sade ve anlaşılır olsun, spiritüel bir dil kullan. Türkçe yazmalısın. Hem olumlu hem de uyarıcı mesajlar içerebilir.`;
};
