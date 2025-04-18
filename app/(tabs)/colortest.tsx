import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Animated,
  SafeAreaView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Question {
  id: number;
  text: string;
  options: {
    id: string;
    text: string;
    color: "red" | "blue" | "yellow" | "green";
  }[];
}

const colorDescriptions = {
  red: {
    title: "KIRMIZI KİŞİLİK",
    mainDescription:
      "Siz bir KIRMIZI kişiliksiniz! İddialı, güçlü ve hedefe odaklı bir yapınız var. Liderlik etmeyi ve hedeflerinize kararlılıkla ilerlemeyi seversiniz.",
    details: [
      "Kırmızı kişilik özellikleri taşıyan bireyler doğuştan lider, kararlı ve sonuç odaklıdır. Hızlı karar alır, risk almaktan çekinmezsiniz.",
      "Güçlü yönleriniz arasında kararlılık, verimlilik, pratiklik ve cesaret bulunur. Bir işi en hızlı ve en etkili şekilde nasıl halledeceğinizi bilirsiniz.",
      "Zorluklara karşı koyma gücünüz yüksektir ve rekabetçi ortamlarda en iyi performansınızı gösterebilirsiniz. Her zaman ilk olmak istersiniz.",
      "İş hayatında yüksek mevkilere gelmeniz olasıdır çünkü hedef odaklı ve iddialısınız. Girişimcilik ruhunuz ve risk alma eğiliminiz sizi başarıya götürebilir.",
    ],
    challenges: [
      "Bazen sabırsız olabilir ve detaylara yeterince dikkat etmeyebilirsiniz.",
      "Duygusal ihtiyaçları göz ardı etme ve başkalarını incitme riskiniz vardır.",
      "Kontrolü kaybetmekten ve başarısızlıktan korkabilirsiniz.",
      "Empati kurma ve aktif dinleme becerilerinizi geliştirmeniz faydalı olabilir.",
    ],
    advice:
      "Sabırlı olmayı öğrenin ve başkalarının duygularını dikkate alın. Bazen yavaşlamak ve süreci de en az sonuç kadar önemsemek size daha sağlıklı ilişkiler ve dengeli bir yaşam sağlayabilir.",
  },
  blue: {
    title: "MAVİ KİŞİLİK",
    mainDescription:
      "Siz bir MAVİ kişiliksiniz! Analitik, detaycı ve mükemmeliyetçi özellikleriniz var. Düzen, doğruluk ve derinlemesine bilgi sizin için önemlidir.",
    details: [
      "Mavi kişilik özellikleri taşıyan bireyler analitik düşünür, veri toplar ve mantıklı kararlar verir. Detaylara önem verir ve her şeyin kusursuz olmasını istersiniz.",
      "Güçlü yönleriniz arasında organizasyon becerileri, disiplinli çalışma, dürüstlük ve metodolojik yaklaşım bulunur. Karmaşık problemleri çözme yeteneğiniz üst düzeydedir.",
      "Doğru bilgiye ulaşma ve her şeyi en ince ayrıntısına kadar anlama arzunuz sizi öğrenmeye açık tutar. Kalite, tutarlılık ve güvenilirlik sizin için önceliklidir.",
      "İş hayatında planlama, araştırma, analiz ve kalite kontrol alanlarında başarılı olursunuz. Titiz çalışma prensipleriniz sizi değerli bir çalışan yapar.",
    ],
    challenges: [
      "Aşırı analiz nedeniyle karar vermekte zorlanabilirsiniz.",
      "Mükemmeliyetçiliğiniz zaman zaman strese ve tükenmişliğe neden olabilir.",
      "Değişime direnç gösterme eğiliminiz olabilir.",
      "Başkalarını çok eleştirebilir ve yüksek standartlarınızı onlardan da bekleyebilirsiniz.",
    ],
    advice:
      "Mükemmeliyetçiliğinizi dengelemeyi öğrenin. Her zaman en iyisini yapmak güzel, ancak bazı durumlarda 'yeterince iyi' de kabul edilebilir. Spontane davranışlara ve yeniliklere daha açık olun.",
  },
  green: {
    title: "YEŞİL KİŞİLİK",
    mainDescription:
      "Siz bir YEŞİL kişiliksiniz! İlişki odaklı, destekleyici ve uyumlu özellikleriniz var. Başkalarına yardım etmeyi ve huzurlu bir ortam oluşturmayı önemsiyorsunuz.",
    details: [
      "Yeşil kişilik özellikleri taşıyan bireyler, insan ilişkilerini önemser, empati kurar ve işbirliğine değer verir. Çevrenizdeki insanların duygusal ihtiyaçlarını anlama konusunda olağanüstü yetenekleriniz vardır.",
      "Güçlü yönleriniz arasında dinleme becerisi, sabır, sadakat ve ekip çalışması bulunur. İnsanları rahatlatma ve onlara destek olma konusunda doğal bir yeteneğiniz vardır.",
      "Çatışmalardan kaçınır, uzlaşma ve uyum sağlama konusunda beceriklisiniz. Barış ve denge sizin için önemlidir ve genellikle arabulucu rolünü üstlenirsiniz.",
      "İş hayatında danışmanlık, eğitim, sosyal hizmetler ve sağlık alanlarında başarılı olursunuz. İnsan odaklı yaklaşımınız sizi değerli bir ekip üyesi yapar.",
    ],
    challenges: [
      "Hayır diyememek ve sınır koymakta zorlanabilirsiniz.",
      "Çatışmadan kaçınmak için kendi ihtiyaçlarınızı geri plana atabilirsiniz.",
      "Değişim süreçlerinde güvensizlik hissedebilirsiniz.",
      "Başkalarının onayına fazla değer verip kendinizi ihmal edebilirsiniz.",
    ],
    advice:
      "Kendi ihtiyaçlarınızı da ön planda tutmayı öğrenin. Başkalarına yardım etmek değerli, ancak kendinize de aynı şefkati ve özeni göstermelisiniz. Sınırlar belirlemek sağlıklı ilişkiler için önemlidir.",
  },
  yellow: {
    title: "SARI KİŞİLİK",
    mainDescription:
      "Siz bir SARI kişiliksiniz! Enerjik, yaratıcı ve sosyal özellikleriniz var. Hayattan keyif almayı ve yeni deneyimler yaşamayı seviyorsunuz.",
    details: [
      "Sarı kişilik özellikleri taşıyan bireyler spontane, meraklı ve eğlencelidir. Hayata optimist bir bakış açısıyla yaklaşır, her fırsatı değerlendirmeye çalışırsınız. Enerji dolu yapınız, çevrenizdeki insanlara da olumlu bir etki yapar. Yeni fikirlere açıksınız ve rutinden sıkılma eğiliminiz vardır. Hayatı bir macera olarak görür ve her anın tadını çıkarmaya çalışırsınız.",

      "Güçlü yönleriniz arasında yaratıcılık, hızlı düşünme, ikna becerisi ve uyum sağlama yeteneği bulunur. İnsanlarla tanışmaktan ve yeni fikirler keşfetmekten büyük zevk alırsınız. Karşınıza çıkan fırsatları görme ve değerlendirme konusunda ustasınız. İyimser bakış açınız, zorluklarla başa çıkmanıza ve çözüm odaklı düşünmenize yardımcı olur.",

      "İlham verici ve motive edicisiniz. Etrafınızdaki insanlara enerji verir, onları harekete geçirirsiniz. Hayalperest ve vizyoner yapınız ile yeni olasılıklar görürsünüz. İnsanları coşturmak ve onlara ilham vermek konusunda doğal bir yeteneğiniz vardır. Konuşmalarınızla, davranışlarınızla ve yaratıcı fikirlerinizle çevrenizdeki insanları etkilersiniz.",

      "İş hayatında pazarlama, satış, tasarım ve iletişim alanlarında başarılı olursunuz. Yenilikçi fikirleriniz ve insanları etkileme beceriniz sizi öne çıkarır. İş hayatında esneklik ve çeşitlilik ararsınız; aynı işi uzun süre yapmak sizi sıkabilir. Yaratıcı düşünme yeteneğiniz, problem çözme ve yenilikçi fikirler üretme konusunda size avantaj sağlar.",

      "İlişkilerinizde canlı, eğlenceli ve anlayışlısınız. İnsanlarla kolayca bağ kurar ve yeni arkadaşlıklar edinirsiniz. Sosyal ortamlarda parlar ve insanları bir araya getirme konusunda ustasınız. İlişkilerinizde eğlence, spontanelik ve heyecan ararsınız. İnsanların iyi yönlerini görmeyi ve onlara değer vermeyi bilirsiniz.",

      "Stres altında dikkatiniz dağılabilir ve odaklanma sorunu yaşayabilirsiniz. Kaygı durumlarında bir konudan diğerine atlama eğiliminiz artar. Stresle başa çıkmak için yaratıcı aktivitelere yönelebilir veya sosyal destek arayabilirsiniz. Pozitif düşünme yeteneğiniz, zorlu durumlarda bile iyimserliğinizi korumanıza yardımcı olur.",

      "Sizi motive eden şey eğlence, özgürlük, sosyal etkileşim ve yeni deneyimlerdir. Rutinden uzaklaşmak ve yeni şeyler denemek sizi canlandırır. Takdir edilmek ve fikirlerinizin değer görmesi de önemli motivasyon kaynaklarınızdır. Yaratıcı projelerde çalışmak ve düşüncelerinizi hayata geçirmek size enerji verir.",

      "İletişim tarzınız canlı, ifade dolu ve heyecanlıdır. Hikaye anlatma ve insanları eğlendirme konusunda yeteneklisiniz. Jest ve mimiklerinizi aktif olarak kullanırsınız. İletişimde çeşitlilik ve yaratıcılık ararsınız. Konuşmalarınız genellikle enerji doludur ve insanları etkiler.",

      "Günlük yaşamınızda çeşitlilik ve esneklik önemlidir. Planlarınızı son anda değiştirmekten çekinmezsiniz ve spontane kararlar alabilirsiniz. Rutin işlerden sıkılabilir ve sürekli yeni uyaranlara ihtiyaç duyabilirsiniz. Yaşam alanınız genellikle renkli, çeşitli ve canlıdır.",

      "Düşünme stiliniz yaratıcı, sezgisel ve bütünseldir. Farklı fikirleri birleştirerek yeni kavramlar oluşturabilirsiniz. Beyin fırtınası yapmayı ve sınırların dışında düşünmeyi seversiniz. Geleceğe odaklanır ve yeni olasılıkları hayal edersiniz.",
    ],
    challenges: [
      "Odaklanma sorunları yaşayabilir ve projeleri tamamlamakta zorlanabilirsiniz. Bir işe başlamakta zorlanmazsınız, ancak aynı işi bitirmek sizin için zor olabilir. Çok fazla projeye aynı anda başlama eğiliminiz, hiçbirini tamamlayamamanıza neden olabilir.",

      "Aşırı heyecan nedeniyle dürtüsel kararlar alabilirsiniz. Anlık heyecanlarla hareket etme eğiliminiz, uzun vadeli sonuçları düşünmemenize yol açabilir. Bu da bazen pişmanlık yaratacak kararlar almanıza neden olabilir.",

      "Detaylara ve planlama işlerine yeterince önem vermeyebilirsiniz. Büyük resme odaklanırken, küçük ama önemli detayları gözden kaçırabilirsiniz. Planlama eksikliği, son dakika stresine ve verimsizliğe neden olabilir.",

      "Rutin işlerde çabuk sıkılabilirsiniz. Tekrarlayan görevler ve rutin işler motivasyonunuzu düşürebilir. Sürekli yeni uyaranlara ihtiyaç duyduğunuz için, uzun süreli konsantrasyon gerektiren işlerde zorlanabilirsiniz.",
    ],
    advice:
      "Odaklanma ve projeleri tamamlama becerilerinizi geliştirin. Tüm fikirleriniz değerli, ancak bunları hayata geçirmek için sabır ve disiplin gerekir. Heyecanınızı kontrol etmeyi ve uzun vadeli hedefler belirlemeyi öğrenin.",
  },
};

const questions: Question[] = [
  {
    id: 1,
    text: "Beklenmedik bir kriz durumunda ilk tepkiniz ne olur?",
    options: [
      {
        id: "a",
        text: "Hemen harekete geçer ve kontrolü ele alırım",
        color: "red",
      },
      {
        id: "b",
        text: "Durumu analiz eder ve en mantıklı çözümü ararım",
        color: "blue",
      },
      {
        id: "c",
        text: "Herkesin duygusal ihtiyaçlarını gözetir ve destek olurum",
        color: "green",
      },
      {
        id: "d",
        text: "Yaratıcı alternatifler düşünür ve farklı çözümler üretirim",
        color: "yellow",
      },
    ],
  },
  {
    id: 2,
    text: "Hayatınızdaki en büyük başarı sizce nedir?",
    options: [
      {
        id: "a",
        text: "Hedeflerime ulaşmak ve somut sonuçlar elde etmek",
        color: "red",
      },
      {
        id: "b",
        text: "Bilgimi derinleştirmek ve uzmanlık kazanmak",
        color: "blue",
      },
      {
        id: "c",
        text: "İnsanlarla anlamlı ilişkiler kurmak ve onlara yardım etmek",
        color: "green",
      },
      {
        id: "d",
        text: "Kendimi özgürce ifade etmek ve hayattan keyif almak",
        color: "yellow",
      },
    ],
  },
  {
    id: 3,
    text: "Tatil için bir yer seçerken en çok nelere dikkat edersiniz?",
    options: [
      {
        id: "a",
        text: "Aktif olabileceğim, heyecan verici aktivitelerin olduğu yerler",
        color: "red",
      },
      {
        id: "b",
        text: "Düzenli, iyi planlanmış, tarihi ve kültürel değeri olan yerler",
        color: "blue",
      },
      {
        id: "c",
        text: "Sakin, huzurlu ve sıcak insanların olduğu yerler",
        color: "green",
      },
      {
        id: "d",
        text: "Eğlenceli, farklı ve keşfedilecek yeni deneyimlerin olduğu yerler",
        color: "yellow",
      },
    ],
  },
  {
    id: 4,
    text: "Birisi size karşı haksızlık yaptığında nasıl tepki verirsiniz?",
    options: [
      {
        id: "a",
        text: "Doğrudan yüzleşir ve durumu açıklığa kavuştururum",
        color: "red",
      },
      {
        id: "b",
        text: "Mantıklı argümanlarla kendimi savunur ve haklılığımı kanıtlarım",
        color: "blue",
      },
      {
        id: "c",
        text: "İlişkiyi bozmadan sorunu çözmeye çalışır, empati kurarım",
        color: "green",
      },
      {
        id: "d",
        text: "Durumu hafifletmeye çalışır, mizahı kullanırım",
        color: "yellow",
      },
    ],
  },
  {
    id: 5,
    text: "En çok hangi tür ortamlarda kendinizi rahat hissedersiniz?",
    options: [
      {
        id: "a",
        text: "Rekabetçi, dinamik ve sonuç odaklı ortamlar",
        color: "red",
      },
      {
        id: "b",
        text: "Düzenli, sessiz ve derinlemesine düşünmeye imkan veren ortamlar",
        color: "blue",
      },
      {
        id: "c",
        text: "Samimi, destekleyici ve işbirlikçi ortamlar",
        color: "green",
      },
      { id: "d", text: "Canlı, değişken ve uyarıcı ortamlar", color: "yellow" },
    ],
  },
  {
    id: 6,
    text: "Bir kitap okumaya karar verdiğinizde genellikle hangi tür kitapları tercih edersiniz?",
    options: [
      {
        id: "a",
        text: "Başarı hikayeleri, liderlik veya kişisel gelişim kitapları",
        color: "red",
      },
      {
        id: "b",
        text: "Bilimsel, tarihi veya felsefi kitaplar",
        color: "blue",
      },
      {
        id: "c",
        text: "İnsan ilişkileri, psikoloji veya biyografi kitapları",
        color: "green",
      },
      {
        id: "d",
        text: "Macera, fantastik veya yaratıcılığı teşvik eden kitaplar",
        color: "yellow",
      },
    ],
  },
  {
    id: 7,
    text: "Yeni bir şehre taşındınız. İlk olarak ne yaparsınız?",
    options: [
      {
        id: "a",
        text: "Bölgedeki fırsatları araştırır, hedeflerime uygun bir plan yaparım",
        color: "red",
      },
      {
        id: "b",
        text: "Şehir hakkında bilgi toplar, haritasını inceler ve sistematik keşfederim",
        color: "blue",
      },
      {
        id: "c",
        text: "Komşularımla tanışır, yerel toplulukları ve sosyal grupları bulurum",
        color: "green",
      },
      {
        id: "d",
        text: "Popüler mekanları gezer, spontane bir şekilde şehri keşfederim",
        color: "yellow",
      },
    ],
  },
  {
    id: 8,
    text: "Hayatınızdaki en büyük korkularınız nelerdir?",
    options: [
      {
        id: "a",
        text: "Başarısız olmak veya kontrolü kaybetmek",
        color: "red",
      },
      { id: "b", text: "Hata yapmak veya bilgisiz görünmek", color: "blue" },
      {
        id: "c",
        text: "İlişkileri kaybetmek veya çatışma yaşamak",
        color: "green",
      },
      {
        id: "d",
        text: "Sıkışıp kalmak veya özgürlüğünü kaybetmek",
        color: "yellow",
      },
    ],
  },
  {
    id: 9,
    text: "Sizin için ideal bir iş ortamı nasıl olmalıdır?",
    options: [
      {
        id: "a",
        text: "Hızlı tempolu, iddialı hedefleri olan ve ilerlemek için fırsatlar sunan",
        color: "red",
      },
      {
        id: "b",
        text: "Düzenli, sessiz ve profesyonel, uzmanlık geliştirmeye imkan veren",
        color: "blue",
      },
      {
        id: "c",
        text: "İşbirlikçi, destekleyici ve olumlu ilişkileri teşvik eden",
        color: "green",
      },
      {
        id: "d",
        text: "Esnek, yaratıcı ve sürekli değişen, farklı projeler sunan",
        color: "yellow",
      },
    ],
  },
  {
    id: 10,
    text: "Mutlu olduğunuz anlarda genellikle ne yapıyorsunuzdur?",
    options: [
      {
        id: "a",
        text: "Bir hedefe ulaşmak veya bir yarışmayı kazanmak",
        color: "red",
      },
      {
        id: "b",
        text: "Karmaşık bir problemi çözmek veya yeni bir şey öğrenmek",
        color: "blue",
      },
      {
        id: "c",
        text: "Sevdiklerimle nitelikli zaman geçirmek",
        color: "green",
      },
      {
        id: "d",
        text: "Yeni deneyimler yaşamak veya yaratıcı bir şey yapmak",
        color: "yellow",
      },
    ],
  },
  {
    id: 11,
    text: "Zor bir karar vermek zorunda kaldığınızda en çok neye güvenirsiniz?",
    options: [
      {
        id: "a",
        text: "İçgüdülerime ve hızlı düşünme kabiliyetime",
        color: "red",
      },
      { id: "b", text: "Mantığıma ve detaylı analizlerime", color: "blue" },
      { id: "c", text: "Değerlerime ve başkalarına etkisine", color: "green" },
      {
        id: "d",
        text: "Sezgilerime ve alternatif olasılıklara",
        color: "yellow",
      },
    ],
  },
  {
    id: 12,
    text: "İş arkadaşlarınız sizi nasıl tanımlar?",
    options: [
      { id: "a", text: "Kararlı, odaklı ve hedef yönelimli", color: "red" },
      { id: "b", text: "Analitik, titiz ve güvenilir", color: "blue" },
      {
        id: "c",
        text: "Yardımsever, sabırlı ve takım oyuncusu",
        color: "green",
      },
      { id: "d", text: "Hevesli, uyumlu ve fikir üreten", color: "yellow" },
    ],
  },
  {
    id: 13,
    text: "Stresli olduğunuzda kendinizi nasıl rahatlatırsınız?",
    options: [
      {
        id: "a",
        text: "Fiziksel aktivite yapar, sorunları çözmek için harekete geçerim",
        color: "red",
      },
      {
        id: "b",
        text: "Yalnız kalır, düşünür ve mantıksal çözümler ararım",
        color: "blue",
      },
      {
        id: "c",
        text: "Bir arkadaşla konuşur veya sevdiklerimle vakit geçiririm",
        color: "green",
      },
      {
        id: "d",
        text: "Yaratıcı bir şeyler yapar veya dikkatimi başka yöne çekerim",
        color: "yellow",
      },
    ],
  },
  {
    id: 14,
    text: "Hayatınızda değişiklik yapmaya karar verdiğinizde genellikle nasıl hareket edersiniz?",
    options: [
      {
        id: "a",
        text: "Doğrudan ve hızlı adımlar atarım, sonuçlara odaklanırım",
        color: "red",
      },
      {
        id: "b",
        text: "Kapsamlı araştırma yapar, artıları ve eksileri değerlendiririm",
        color: "blue",
      },
      {
        id: "c",
        text: "Değişimin başkalarını nasıl etkileyeceğini düşünür, geçiş sürecini yavaş yönetirim",
        color: "green",
      },
      {
        id: "d",
        text: "Değişimi heyecanla karşılar, süreci akışına bırakırım",
        color: "yellow",
      },
    ],
  },
  {
    id: 15,
    text: "Çevrenizdeki insanların en çok takdir ettiği özelliğiniz nedir?",
    options: [
      { id: "a", text: "Motivasyon ve liderlik yeteneğim", color: "red" },
      {
        id: "b",
        text: "Bilgi birikimim ve problem çözme becerilerim",
        color: "blue",
      },
      {
        id: "c",
        text: "Dinleme yeteneğim ve verdiğim duygusal destek",
        color: "green",
      },
      {
        id: "d",
        text: "Pozitif enerjim ve yaratıcı fikirlerim",
        color: "yellow",
      },
    ],
  },
  {
    id: 16,
    text: "Hayalinizdeki ev nasıl bir yerdir?",
    options: [
      {
        id: "a",
        text: "Prestijli, etkileyici ve fonksiyonel olarak tasarlanmış",
        color: "red",
      },
      {
        id: "b",
        text: "Düzenli, iyi planlanmış ve sessiz bir ortam sunan",
        color: "blue",
      },
      {
        id: "c",
        text: "Sıcak, rahat ve aile/arkadaşlarla vakit geçirmeye uygun",
        color: "green",
      },
      {
        id: "d",
        text: "Renkli, ilham verici ve kişiliğimi yansıtan",
        color: "yellow",
      },
    ],
  },
];

const STORAGE_KEY_COLORTEST_USAGE = "colortest_daily_usage";

const checkDailyUsageLimit = async () => {
  try {
    const storedData = await AsyncStorage.getItem(STORAGE_KEY_COLORTEST_USAGE);

    if (!storedData) {
      return { canUse: true, remainingTests: 2 };
    }

    const usageData = JSON.parse(storedData);
    const today = new Date().toDateString();

    // Farklı gün kontrolü
    if (usageData.date !== today) {
      return { canUse: true, remainingTests: 2 };
    }

    // Günlük limit kontrolü (2 test)
    if (usageData.count >= 2) {
      return { canUse: false, remainingTests: 0 };
    }

    return {
      canUse: true,
      remainingTests: 2 - usageData.count,
    };
  } catch (error) {
    console.error("Limit kontrolü yapılamadı:", error);
    return { canUse: true, remainingTests: 1 }; // Hata durumunda izin ver ama sınırlı
  }
};

const updateUsageCount = async () => {
  try {
    const today = new Date().toDateString();
    const storedData = await AsyncStorage.getItem(STORAGE_KEY_COLORTEST_USAGE);

    let usageData = { date: today, count: 1 };

    if (storedData) {
      const currentData = JSON.parse(storedData);
      if (currentData.date === today) {
        usageData.count = currentData.count + 1;
      }
    }

    await AsyncStorage.setItem(
      STORAGE_KEY_COLORTEST_USAGE,
      JSON.stringify(usageData)
    );
  } catch (error) {
    console.error("Kullanım sayısı güncellenemedi:", error);
  }
};

const ColorTestScreen: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [testStarted, setTestStarted] = useState<boolean>(false);
  const animationRef = useRef<LottieView | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Test sonucu hesaplama
  const calculateResult = () => {
    const colorCounts: Record<string, number> = {
      red: 0,
      blue: 0,
      green: 0,
      yellow: 0,
    };

    // Her cevap için renk sayılarını arttır
    Object.keys(answers).forEach((questionId) => {
      const questionIndex = parseInt(questionId);
      const selectedOptionId = answers[questionIndex];
      const question = questions.find((q) => q.id === questionIndex);

      if (question) {
        const selectedOption = question.options.find(
          (o) => o.id === selectedOptionId
        );
        if (selectedOption) {
          colorCounts[selectedOption.color]++;
        }
      }
    });

    // En yüksek puana sahip rengi bul
    let dominantColor = "blue";
    let maxCount = 0;

    Object.keys(colorCounts).forEach((color) => {
      if (colorCounts[color] > maxCount) {
        maxCount = colorCounts[color];
        dominantColor = color;
      }
    });

    return dominantColor;
  };

  // Bir sonraki soruya geç
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Animasyon geçişi
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 300);
    } else {
      // Test tamamlandı, sonucu hesapla
      const dominantColor = calculateResult();
      setResult(dominantColor);
      setShowResult(true);
    }
  };

  // Seçeneği işaretle
  const handleSelectOption = (questionId: number, optionId: string) => {
    setAnswers({
      ...answers,
      [questionId]: optionId,
    });
  };

  // Testi başlat
  const startTest = async () => {
    // Günlük kullanım limitini kontrol et
    const usageCheck = await checkDailyUsageLimit();
    if (!usageCheck.canUse) {
      Alert.alert(
        "Günlük Limit",
        `Günlük renk testi limitine ulaştınız. Yarın tekrar deneyebilirsiniz. Kalan hak: ${usageCheck.remainingTests}`
      );
      return;
    }

    setTestStarted(true);
    if (animationRef.current) {
      animationRef.current.play();
    }

    // Testi başlattığını kaydet
    await updateUsageCount();
  };

  // Testi yeniden başlat
  const restartTest = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResult(null);
    setShowResult(false);
  };

  // İlerleme durumu
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Test sonuçlarını gösteren fonksiyonda bu açıklamaları kullanabiliriz
  const displayTestResult = (colorType: string) => {
    const result =
      colorDescriptions[colorType as keyof typeof colorDescriptions];

    return (
      <View style={styles.resultDetail}>
        <Text style={styles.resultTitle}>{result.title}</Text>
        <Text style={styles.resultMainDescription}>
          {result.mainDescription}
        </Text>

        <Text style={styles.sectionTitle}>TEMEL ÖZELLİKLERİNİZ</Text>
        {result.details.map((detail: string, index: number) => (
          <Text key={index} style={styles.resultDetailText}>
            • {detail}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>ZORLUKLAR</Text>
        {result.challenges.map((challenge: string, index: number) => (
          <Text key={index} style={styles.resultDetailText}>
            • {challenge}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>ÖNERİ</Text>
        <Text style={styles.resultAdvice}>{result.advice}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#2A004E", "#4A0072", "#2A004E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Başlık */}
        <View style={styles.header}>
          <Text style={styles.title}>Kişilik Renk Testi</Text>
        </View>

        {!testStarted && !showResult && (
          <View style={styles.welcomeContainer}>
            <LottieView
              ref={animationRef}
              source={require("@/assets/lotties/stars.json")}
              style={styles.welcomeAnimation}
              loop
              autoPlay
            />
            <Text style={styles.welcomeTitle}>Renk Kişiliğinizi Keşfedin</Text>
            <Text style={styles.welcomeText}>
              16 soru ile hangi renk kişiliğine sahip olduğunuzu öğrenin.
              Kırmızı, Mavi, Yeşil veya Sarı - her rengin kendine özgü
              özellikleri vardır.
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={startTest}>
              <Text style={styles.startButtonText}>Teste Başla</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sorular */}
        {testStarted && !showResult && (
          <Animated.View
            style={[styles.questionContainer, { opacity: fadeAnim }]}
          >
            {/* İlerleme çubuğu */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {currentQuestionIndex + 1}/{questions.length}
              </Text>
            </View>

            <Text style={styles.questionNumber}>
              Soru {currentQuestionIndex + 1}
            </Text>
            <Text style={styles.questionText}>
              {questions[currentQuestionIndex].text}
            </Text>

            <View style={styles.optionsContainer}>
              {questions[currentQuestionIndex].options.map((option) => {
                const isSelected =
                  answers[questions[currentQuestionIndex].id] === option.id;

                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      isSelected ? styles.selectedOption : {},
                    ]}
                    onPress={() =>
                      handleSelectOption(
                        questions[currentQuestionIndex].id,
                        option.id
                      )
                    }
                  >
                    <View style={styles.optionContent}>
                      <View
                        style={[
                          styles.optionIndicator,
                          isSelected ? styles.selectedIndicator : {},
                        ]}
                      >
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#FFFFFF"
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          isSelected ? styles.selectedOptionText : {},
                        ]}
                      >
                        {option.text}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[
                styles.nextButton,
                !answers[questions[currentQuestionIndex].id]
                  ? styles.disabledButton
                  : {},
              ]}
              onPress={goToNextQuestion}
              disabled={!answers[questions[currentQuestionIndex].id]}
            >
              <Text style={styles.nextButtonText}>
                {currentQuestionIndex < questions.length - 1
                  ? "Sonraki Soru"
                  : "Sonuçları Gör"}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Sonuç */}
        {showResult && result && (
          <View style={styles.resultContainer}>
            {displayTestResult(result)}

            <TouchableOpacity
              style={styles.restartButton}
              onPress={restartTest}
            >
              <Text style={styles.restartButtonText}>Testi Yeniden Başlat</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  header: {
    marginTop: 30,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  welcomeContainer: {
    alignItems: "center",
    backgroundColor: "rgba(74, 0, 114, 0.4)",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  welcomeAnimation: {
    width: 200,
    height: 200,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 12,
    color: "#D5C2FF",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: "#9061F9",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginTop: 10,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // Sorular
  questionContainer: {
    backgroundColor: "rgba(74, 0, 114, 0.4)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    flex: 1,
    marginRight: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#9061F9",
    borderRadius: 4,
  },
  progressText: {
    color: "#D5C2FF",
    fontSize: 12,
    fontWeight: "500",
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9061F9",
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  selectedOption: {
    borderColor: "#9061F9",
    backgroundColor: "rgba(144, 97, 249, 0.1)",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedIndicator: {
    backgroundColor: "#9061F9",
    borderColor: "#9061F9",
  },
  optionText: {
    fontSize: 14,
    color: "#D5C2FF",
    flex: 1,
  },
  selectedOptionText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  nextButton: {
    backgroundColor: "#9061F9",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: "rgba(144, 97, 249, 0.4)",
  },
  // Sonuç
  resultContainer: {
    marginTop: 10,
  },
  resultDetail: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  resultMainDescription: {
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  resultDetailText: {
    fontSize: 13,
    color: "#FFFFFF",
    marginBottom: 10,
    lineHeight: 22,
  },
  resultAdvice: {
    fontSize: 13,
    color: "#FFFFFF",
    fontStyle: "italic",
    marginTop: 8,
    lineHeight: 22,
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
  },
  restartButton: {
    backgroundColor: "#9061F9",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  restartButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  // Reklam
  adContainer: {
    width: "100%",
    height: 90,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderStyle: "dashed",
  },
  adText: {
    color: "#D5C2FF",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default ColorTestScreen;
