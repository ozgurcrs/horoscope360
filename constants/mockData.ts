export const mockData = {
  horoscope: {
    text: "Bugün, kozmik enerjiler size yaratıcılık ve iletişim alanlarında destek veriyor. Fikirlerinizi açıkça ifade etmek için ideal bir gün. Çevrenizdeki insanlarla olan etkileşimleriniz size ilham verebilir. Güneş'in burç evinize yaptığı olumlu açı, kendinizi ifade etmenizi kolaylaştırıyor ve özgüveninizi artırıyor. Sevdiklerinizle geçireceğiniz zaman ruhunuzu yükseltecek ve size pozitif enerji kazandıracak.",
    detailedText:
      "Bugün, kozmik enerjiler size yaratıcılık ve iletişim alanlarında destek veriyor. Fikirlerinizi açıkça ifade etmek için ideal bir gün. Çevrenizdeki insanlarla olan etkileşimleriniz size ilham verebilir. Güneş'in burç evinize yaptığı olumlu açı, kendinizi ifade etmenizi kolaylaştırıyor ve özgüveninizi artırıyor. Sevdiklerinizle geçireceğiniz zaman ruhunuzu yükseltecek ve size pozitif enerji kazandıracak.",
    love: "Romantik ilişkilerde şanslı bir gün. Partnerinizle açık iletişim kurabilir, duygularınızı paylaşabilirsiniz. Bekarsanız, yeni tanışacağınız biri hayatınızı değiştirebilir.",
    career:
      "İş yerinde fikirleriniz takdir görecek. Yeni bir proje başlatmak için uygun bir zaman. Finansal konularda temkinli olmalı ve planlı hareket etmelisiniz.",
    health:
      "Enerjiniz yüksek olacak. Fiziksel aktivite için ideal bir gün. Zihinsel sağlığınıza da özen gösterin ve meditasyon gibi rahatlama teknikleri deneyin.",
  },
};

export interface DailyColorEnergy {
  day: number;
  color: string;
  gradient: string[];
  name: string;
  energy: string;
  moodTips: string[];
  icon: string;
}

export const COLOR_ENERGIES: DailyColorEnergy[] = [
  {
    day: 0, // Pazar
    color: "#FF5733",
    gradient: ["#FF5733", "#FFC300"],
    name: "Turuncu Alev",
    energy:
      "Canlılık, sıcaklık ve yeni olasılıklar. Bugün kendinize zaman ayırmak ve sevdiğiniz şeylere yönelmek için ideal.",
    moodTips: [
      "Sevdiğiniz bir aktiviteye zaman ayırın",
      "Uzun zamandır düşündüğünüz bir fikri hayata geçirin",
      "Sıcak renkli bir kıyafet tercih edin",
    ],
    icon: "sunny-outline",
  },
  {
    day: 1, // Pazartesi
    color: "#3498DB",
    gradient: ["#3498DB", "#2980B9"],
    name: "Sakin Mavi",
    energy:
      "Huzur, dinginlik ve düzen. Bu renk enerjisi haftaya sakin bir başlangıç yapmanıza yardımcı olur.",
    moodTips: [
      "Evinizde küçük bir düzenleme yapın",
      "Günün ilk saatlerinde derin nefes alarak güne başlayın",
      "Bol su içmeyi ihmal etmeyin",
    ],
    icon: "water-outline",
  },
  {
    day: 2, // Salı
    color: "#27AE60",
    gradient: ["#27AE60", "#2ECC71"],
    name: "Canlı Yeşil",
    energy:
      "Bereket, büyüme ve denge. Bugün ailenizle ve sevdiklerinizle ilişkilerinize odaklanmak için güzel bir gün.",
    moodTips: [
      "Bir aile üyesini veya arkadaşınızı arayın",
      "Çiçeklerinizi veya bitkilerinizi sulayın",
      "Güzel anılarınızı tazelemek için eski fotoğraflara bakın",
    ],
    icon: "leaf-outline",
  },
  {
    day: 3, // Çarşamba
    color: "#9B59B6",
    gradient: ["#9B59B6", "#8E44AD"],
    name: "Gizemli Mor",
    energy:
      "Hayal gücü, bilgelik ve içe dönüş. Bugün kendinize zaman ayırarak huzur bulabilirsiniz.",
    moodTips: [
      "Sevdiğiniz bir kitabı okuyun",
      "Hoşunuza giden bir çay demleyin",
      "Kendinize küçük bir hediye alın",
    ],
    icon: "moon-outline",
  },
  {
    day: 4, // Perşembe
    color: "#F1C40F",
    gradient: ["#F1C40F", "#F39C12"],
    name: "Parlak Sarı",
    energy:
      "Neşe, iyimserlik ve aydınlık. Bugün sevdiklerinizle paylaşımda bulunmak için ideal.",
    moodTips: [
      "Sevdiğiniz biriyle kahve için veya sohbet edin",
      "Uzun zamandır ertelediğiniz küçük bir alışverişi yapın",
      "Günlük rutininize neşeli bir müzik ekleyin",
    ],
    icon: "sunny-outline",
  },
  {
    day: 5, // Cuma
    color: "#E74C3C",
    gradient: ["#E74C3C", "#C0392B"],
    name: "Canlı Kırmızı",
    energy:
      "Tutku, canlılık ve sevgi. Bugün kendinize ve sevdiklerinize sevginizi göstermek için mükemmel.",
    moodTips: [
      "Sevdiklerinize vakit ayırın",
      "Kendinize güzel bir akşam yemeği hazırlayın",
      "Evde küçük bir güzellik bakımı yapın",
    ],
    icon: "heart-outline",
  },
  {
    day: 6, // Cumartesi
    color: "#8E44AD",
    gradient: ["#8E44AD", "#9B59B6"],
    name: "Derin Mor",
    energy:
      "Dinlenme, kendini şarj etme ve iç huzur. Bugün rahatlamak ve kendinize bakmak için ideal.",
    moodTips: [
      "Rahatlatıcı bir duş veya banyo yapın",
      "Sevdiğiniz bir TV programı veya film izleyin",
      "Erken yatarak iyi bir gece uykusu alın",
    ],
    icon: "bed-outline",
  },
];
