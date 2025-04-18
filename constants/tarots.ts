export const tarots = [
  {
    id: "fool",
    name: "Aptal",
    description: "Başlangıçlar, özgür ruh, sıçrama, potansiyel",
    reverseDescription: "Düşüncesizlik, değişim korkusu, sorumsuzluk",
  },
  {
    id: "magician",
    name: "Büyücü",
    description: "Yaratım gücü, ilham, beceri, kaynakları kullanma",
    reverseDescription: "Aldatma, illüzyon, kullanılmayan yetenekler",
  },
  {
    id: "high_priestess",
    name: "Başrahibe",
    description: "Sezgi, gizem, içsel bilgelik, bilinçaltı",
    reverseDescription: "Sırlar, sezgiden kopukluk, içe kapanma",
  },
  {
    id: "empress",
    name: "İmparatoriçe",
    description: "Verimlilik, güzellik, bolluk, şefkatli enerji",
    reverseDescription: "Yaratıcılık tıkanıklığı, bağımlılık, güvensizlik",
  },
  {
    id: "emperor",
    name: "İmparator",
    description: "Otorite, yapı, istikrar, baba figürü",
    reverseDescription: "Baskıcılık, katılık, kontrol sorunu",
  },
  {
    id: "hierophant",
    name: "Başrahip",
    description: "Gelenek, ruhsal bilgelik, uyum, inançlar",
    reverseDescription: "İsyan, kişisel değerler, farklılık",
  },
  {
    id: "lovers",
    name: "Aşıklar",
    description: "Aşk, uyum, ortaklıklar, seçimler",
    reverseDescription: "Uyumsuzluk, dengesizlik, ilişki sorunları",
  },
  {
    id: "chariot",
    name: "Savaş Arabası",
    description: "İrade gücü, kontrol, zafer, kararlılık",
    reverseDescription: "Yön kaybı, saldırganlık, engeller",
  },
  {
    id: "strength",
    name: "Güç",
    description: "İçsel güç, cesaret, şefkat, sabır",
    reverseDescription:
      "Kendine güven eksikliği, zayıflık, bastırılmış duygular",
  },
  {
    id: "hermit",
    name: "Ermiş",
    description: "İçe dönüş, yalnızlık, içsel rehberlik, yansıma",
    reverseDescription: "Yalıtım, yalnızlık hissi, bilgeliği reddetme",
  },
  {
    id: "wheel_of_fortune",
    name: "Kader Çarkı",
    description: "Değişim, döngüler, kader, şans",
    reverseDescription: "Kötü şans, değişime direnç, karma",
  },
  {
    id: "justice",
    name: "Adalet",
    description: "Adalet, hakikat, yasa, sorumluluk",
    reverseDescription: "Adaletsizlik, dengesizlik, dürüst olmamak",
  },
  {
    id: "hanged_man",
    name: "Asılan Adam",
    description: "Duraklama, kabulleniş, yeni bakış açısı, bırakma",
    reverseDescription: "Direnç, kararsızlık, sıkışmışlık",
  },
  {
    id: "death",
    name: "Ölüm",
    description: "Dönüşüm, sonlanma, değişim, geçiş",
    reverseDescription: "Değişim korkusu, durgunluk, direnç",
  },
  {
    id: "temperance",
    name: "Denge",
    description: "Uyum, sabır, ölçülülük, içsel denge",
    reverseDescription: "Aşırılık, dengesizlik, kontrolsüzlük",
  },
  {
    id: "devil",
    name: "Şeytan",
    description: "Bağımlılıklar, arzular, materyalizm, esaret",
    reverseDescription: "Özgürleşme, bağımlılıktan kurtulma, gölgeyle yüzleşme",
  },
  {
    id: "tower",
    name: "Kule",
    description: "Ani değişim, yıkım, kaos, farkındalık",
    reverseDescription: "Yıkımdan kaçış, değişim korkusu, baskılanmış kriz",
  },
  {
    id: "star",
    name: "Yıldız",
    description: "Umut, ilham, yenilenme, şifa",
    reverseDescription: "Umutsuzluk, kopukluk, inanç kaybı",
  },
  {
    id: "moon",
    name: "Ay",
    description: "Yanılsama, sezgi, rüyalar, bilinçaltı",
    reverseDescription: "Kafa karışıklığı, aldanma, korkular",
  },
  {
    id: "sun",
    name: "Güneş",
    description: "Mutluluk, başarı, canlılık, pozitiflik",
    reverseDescription: "Negatiflik, gecikmeler, keyifsizlik",
  },
  {
    id: "judgement",
    name: "Mahkeme",
    description: "Uyanış, iç çağrı, yeniden doğuş, farkındalık",
    reverseDescription: "Kendini sorgulayamama, öğrenememe, hatalı karar",
  },
  {
    id: "world",
    name: "Dünya",
    description: "Tamamlanma, başarı, bütünlük, doyum",
    reverseDescription: "Kapanmamış döngüler, eksik hedefler, ertelenme",
  },
];

export type Tarot = (typeof tarots)[number];
