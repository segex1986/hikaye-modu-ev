// Sosyal beceri mini senaryoları: kısa bir durum, üç seçenek. Seçeneğin sonucu yargılamadan anlatılır;
// çocuk isterse başka bir yolu da dener. puan: 2 = durumu iyi çözen yol, 1 = anlaşılır ama işe yaramayan, 0 = zarar veren.
export const SOSYAL = [
  {
    id: 'paylasma', ikon: '🧸', ad: 'Paylaşma', sahne: '👧 🧸 👦',
    metin: 'Ece ile Can aynı oyuncak ayıyla oynamak istiyor. İkisi de ayıyı çok seviyor.',
    soru: 'Ece ne yapabilir?',
    secenekler: [
      ['Ayıyı Can’ın elinden çekip alır.', 'Can çok üzülür ve kızar, oyun kavgaya döner. Başka ne yapabilirdi?', 0],
      ['“Sırayla oynayalım mı? Önce sen, sonra ben” der.', 'İkisi de ayıyla oynayabilir. Can da Ece de mutlu!', 2],
      ['Ağlayarak oradan uzaklaşır.', 'Ece üzgün kalır, ayıyla da oynayamaz. Başka bir yol deneyelim mi?', 1],
    ],
  },
  {
    id: 'sira', ikon: '🛝', ad: 'Sıra bekleme', sahne: '🧒 🧒 🧒 🛝',
    metin: 'Kaydırağın önünde üç çocuk sıra bekliyor. Deniz de kaymak istiyor, hem de hemen!',
    soru: 'Deniz ne yapabilir?',
    secenekler: [
      ['Herkesi itip en öne geçer.', 'Arkadaşları düşebilir, onlar da çok kızar. Başka ne yapabilirdi?', 0],
      ['Sıranın sonuna geçip beklerken sayı sayar.', 'Biraz bekler ama sıra ona gelince keyifle kayar. Beklemek kolay değil, ama yaptı!', 2],
      ['“Hiç kaymayacağım o zaman!” deyip küser.', 'Deniz hiç kayamaz, canı da sıkılır. Başka bir yol deneyelim mi?', 1],
    ],
  },
  {
    id: 'ozur', ikon: '🧱', ad: 'Özür dileme', sahne: '👦 🧱💥 👧',
    metin: 'Can koşarken yanlışlıkla Zeynep’in yaptığı kuleyi yıktı. Zeynep çok üzüldü.',
    soru: 'Can ne yapabilir?',
    secenekler: [
      ['“Ben yapmadım!” der ve kaçar.', 'Zeynep hem üzgün hem kırgın kalır. Başka ne yapabilirdi?', 0],
      ['“Özür dilerim, istemeden oldu. Birlikte yeniden yapalım mı?” der.', 'Zeynep’in üzüntüsü azalır. Belki eskisinden de güzel bir kule yaparlar!', 2],
      ['Hiçbir şey demeden başka yere bakar.', 'Zeynep, Can’ın umursamadığını düşünür. Başka bir yol deneyelim mi?', 1],
    ],
  },
  {
    id: 'hayir', ikon: '🍬', ad: 'Hayır demek', sahne: '🧍 🍬 🧒',
    metin: 'Parkta tanımadığı biri Arda’ya şeker uzatıyor ve “Gel, sana daha çok şeker vereyim” diyor.',
    soru: 'Arda ne yapabilir?',
    secenekler: [
      ['Şekeri alıp onunla gider.', 'Bu tehlikeli olabilir. Tanımadığımız biriyle hiçbir yere gitmeyiz. Başka ne yapabilirdi?', 0],
      ['“Hayır!” der, hemen annesinin ya da güvendiği büyüğün yanına koşup anlatır.', 'Çok doğru! Hayır demek ve güvendiğin büyüğe anlatmak seni korur.', 2],
      ['Ne yapacağını bilemez, olduğu yerde bekler.', 'Korkmak çok normal. Ama orada beklemek yerine yapabileceği bir şey var. Deneyelim mi?', 1],
    ],
  },
  {
    id: 'katilma', ikon: '⚽', ad: 'Oyuna katılma', sahne: '👦 ⚽ 👧   🧒',
    metin: 'Bahçede çocuklar top oynuyor. Elif de oynamak istiyor ama biraz utanıyor.',
    soru: 'Elif ne yapabilir?',
    secenekler: [
      ['Topu kapıp kaçar, böylece onu fark ederler.', 'Çocuklar oyunları bozulduğu için kızar. Başka ne yapabilirdi?', 0],
      ['Yanlarına gidip “Ben de oynayabilir miyim?” diye sorar.', 'Çocuklar “Gel!” der. Sormak cesaret ister, Elif başardı!', 2],
      ['Uzaktan izler, hiçbir şey söylemez.', 'Çocuklar Elif’in oynamak istediğini bilemez. Başka bir yol deneyelim mi?', 1],
    ],
  },
  {
    id: 'kizginlik', ikon: '😠', ad: 'Kızgınlıkla baş etme', sahne: '🧒 😠 🧩',
    metin: 'Mert bir türlü yapbozu tamamlayamıyor. Parçalar yerine oturmuyor ve çok kızıyor.',
    soru: 'Mert ne yapabilir?',
    secenekler: [
      ['Yapbozu fırlatır, parçaları her yere saçar.', 'Parçalar kaybolur, Mert daha da üzülür. Başka ne yapabilirdi?', 0],
      ['Derin bir balon nefesi alır, sonra yardım ister ya da biraz ara verir.', 'Nefes alınca biraz sakinleşir. Sonra yapbozu tamamlamak daha kolay olur!', 2],
      ['“Ben hiçbir şeyi beceremiyorum” deyip bırakır.', 'Mert kendini kötü hisseder. Ama bu yapboz gerçekten zor! Başka bir yol deneyelim mi?', 1],
    ],
  },
  {
    id: 'yardim', ikon: '🙋', ad: 'Yardım isteme', sahne: '👩‍🏫 ✏️ 🧒',
    metin: 'Sınıfta öğretmen bir oyun anlattı ama Defne ne yapacağını anlamadı.',
    soru: 'Defne ne yapabilir?',
    secenekler: [
      ['Yanındaki arkadaşının kâğıdını çekip alır.', 'Arkadaşı kızar, Defne yine de anlamamış olur. Başka ne yapabilirdi?', 0],
      ['Elini kaldırıp “Anlamadım, bir daha anlatır mısınız?” der.', 'Öğretmen seve seve yeniden anlatır. Sormak çok akıllıca!', 2],
      ['Anlamamış olduğu için hiçbir şey yapmaz.', 'Defne oyuna katılamaz ve canı sıkılır. Başka bir yol deneyelim mi?', 1],
    ],
  },
  {
    id: 'kaybetme', ikon: '🎲', ad: 'Kaybetmeyi kabullenme', sahne: '👦 🎲 👧',
    metin: 'Kerem ile Ayşe kutu oyunu oynadı. Bu sefer Ayşe kazandı.',
    soru: 'Kerem ne yapabilir?',
    secenekler: [
      ['Oyunu masadan atar: “Hileci!”', 'Ayşe üzülür, bir daha onunla oynamak istemeyebilir. Başka ne yapabilirdi?', 0],
      ['“Tebrikler! Bir daha oynayalım mı?” der.', 'Ayşe çok sevinir, birlikte yeniden oynarlar. Kaybetmek de oyunun bir parçası!', 2],
      ['Somurtur, bir köşeye çekilir.', 'Kerem’in üzülmesi normal. Ama böyle yalnız kalır. Başka bir yol deneyelim mi?', 1],
    ],
  },
  {
    id: 'empati', ikon: '🤗', ad: 'Arkadaşı üzgün', sahne: '🧒 😢 🧒',
    metin: 'Bahçede Ali’nin dondurması yere düştü. Ali ağlamaya başladı.',
    soru: 'Ali’nin arkadaşı ne yapabilir?',
    secenekler: [
      ['Ali’ye güler: “Ha ha, düşürdün!”', 'Ali daha çok üzülür ve yalnız hisseder. Başka ne yapabilirdi?', 0],
      ['Yanına gelip “Çok üzüldün, değil mi? İstersen benimkinden tadabilirsin” der.', 'Ali biraz rahatlar. Arkadaşının yanında olması ona iyi gelir.', 2],
      ['Görmezden gelip oynamaya devam eder.', 'Ali yalnız kalır. Arkadaşı ne yapabilir, başka bir yol deneyelim mi?', 1],
    ],
  },
];
export const sosyalBul = (id) => SOSYAL.find((s) => s.id === id) || null;

// Sınıf rehberliği temaları: akıllı tahtada bütün sınıfla birlikte kurulan hikayeler. Kayıt danışan kodu istemez.
export const SINIF_TEMALARI = [
  {
    id: 'arkadaslik', ikon: '🤝', ad: 'Arkadaşlık', ortam: 'okul-bahcesi',
    aciklama: 'Arkadaş edinme, oyuna davet etme, iyi arkadaşın özellikleri',
    karakterler: ['kiz', 'erkek', 'arkadas', 'kardes', 'ogretmen-k', 'kopek'],
    sorular: ['Bu çocuklar nasıl arkadaş olabilir?', 'Yalnız kalan biri olursa ne yaparız?', 'İyi bir arkadaş nasıl davranır?', 'Arkadaşımız üzgünse ona nasıl yardım ederiz?', 'Hikayenin sonunda herkes nasıl hissediyor?'],
    etkinlik: 'Her çocuk bir arkadaşına “Seninle oynamayı seviyorum çünkü…” cümlesini tamamlasın.',
  },
  {
    id: 'zorbalik', ikon: '🛑', ad: 'Zorbalığa “dur”', ortam: 'okul-bahcesi',
    aciklama: 'Akran zorbalığı, seyirci olmamak, yardım istemek',
    karakterler: ['kiz', 'erkek', 'arkadas', 'ergen', 'ogretmen-e', 'rehber'],
    sorular: ['Burada bir çocuk üzülüyor. Ne oluyor?', 'Bunu gören arkadaşlar ne yapabilir?', 'Kime haber verebiliriz?', 'Üzülen çocuğa ne söyleyebiliriz?', 'Bir daha olmaması için ne yapabiliriz?'],
    etkinlik: 'Sınıfça “Dur, bu hoş değil!” cümlesini kararlı bir sesle birlikte söyleyin; ardından yardım isteyebileceğimiz kişileri sayın.',
  },
  {
    id: 'duygular', ikon: '🌈', ad: 'Duygularımız', ortam: 'park',
    aciklama: 'Duyguları tanıma, adlandırma ve ifade etme',
    karakterler: ['kiz', 'erkek', 'anne', 'baba', 'kedi', 'tavsan'],
    sorular: ['Bu karakter şu an ne hissediyor? Nereden anladık?', 'Biz bu duyguyu ne zaman hissederiz?', 'Bu duygu bedenimizin neresinde olur?', 'Ona ne iyi gelir?', 'Duygusu değişince hikaye nasıl değişiyor?'],
    etkinlik: 'Duygu pandomimi: Bir çocuk karakterin duygusunu yüzüyle göstersin, sınıf tahmin etsin.',
  },
  {
    id: 'farkliliklar', ikon: '🌍', ad: 'Farklılıklarımız', ortam: 'sinif',
    aciklama: 'Farklılıklara saygı, kapsayıcılık, herkesin bir yeri var',
    karakterler: ['kiz', 'erkek', 'tekerlekli', 'arkadas', 'anne-basortulu', 'ogretmen-k'],
    sorular: ['Bu çocukların nesi farklı, nesi aynı?', 'Herkesin katılabileceği bir oyun nasıl olur?', 'Yeni gelen bir arkadaşımız olsa ona nasıl davranırız?', 'Farklı olmak neden güzel olabilir?'],
    etkinlik: '“Ben de!” oyunu: Bir çocuk sevdiği bir şeyi söylesin, aynı şeyi seven herkes “Ben de!” diye ayağa kalksın.',
  },
  {
    id: 'isbirligi', ikon: '🧩', ad: 'İş birliği ve paylaşma', ortam: 'kamp',
    aciklama: 'Birlikte çalışma, paylaşma, ortak sorun çözme',
    karakterler: ['kiz', 'erkek', 'arkadas', 'kardes', 'bloklar', 'yiyecek'],
    sorular: ['Kamp alanında bir sorun çıktı. Ne olabilir?', 'Bu sorunu tek başına mı, birlikte mi çözmek daha kolay?', 'Herkes ne yapabilir?', 'Paylaşınca ne oldu?'],
    etkinlik: 'Sınıfı küçük gruplara ayırın; her grup bloklarla birlikte tek bir kule yapsın ve nasıl karar verdiklerini anlatsın.',
  },
  {
    id: 'kurallar', ikon: '📏', ad: 'Sınıf kurallarımız', ortam: 'sinif',
    aciklama: 'Kuralların neden olduğu, birlikte kural koyma',
    karakterler: ['kiz', 'erkek', 'arkadas', 'ogretmen-k', 'mudur'],
    sorular: ['Sınıfta herkes aynı anda konuşursa ne olur?', 'Bu sınıfa hangi kural iyi gelir?', 'Kural unutulunca ne yaparız?', 'Kurallar bizi nasıl korur?'],
    etkinlik: 'Sınıfça 3 kural seçin, her kurala bir resim çizip panoya asın.',
  },
  {
    id: 'guvenlik', ikon: '🛡️', ad: 'Kendimi koruyorum', ortam: 'park',
    aciklama: 'Hayır deme, güvendiğimiz büyükler, bedenimiz bizimdir',
    karakterler: ['ben', 'kiz', 'erkek', 'yabanci', 'anne', 'polis'],
    sorular: ['Tanımadığımız biri bizi bir yere çağırırsa ne yaparız?', 'Kimler bizim güvendiğimiz büyüklerimiz?', 'Bizi rahatsız eden bir şey olursa kime anlatırız?', '“Hayır” demek ne zaman doğru olur?'],
    etkinlik: 'Her çocuk elini kâğıda çizsin; beş parmağa güvendiği beş büyüğün adını yazsın (ya da resmini yapsın).',
  },
];
export const sinifBul = (id) => SINIF_TEMALARI.find((s) => s.id === id) || null;
