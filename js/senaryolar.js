// Hazır senaryolar: danışmanın sık karşılaştığı konular için ortam, karakterler ve soru kartları hazır gelir.
// Hikayeyi yine çocuk kurar; senaryo yalnızca başlangıç malzemesidir.
export const SENARYOLAR = [
  {
    id: 'ilk-gun', ad: 'Okulun ilk günü', ikon: '🎒', ortam: 'okul-bahcesi',
    aciklama: 'Okula başlama, ayrılık kaygısı, yeni ortama uyum',
    karakterler: ['ben', 'anne', 'baba', 'ogretmen-k', 'arkadas', 'kiz', 'erkek'],
    ipucu: 'Ayrılma anına ve çocuğu kimin karşıladığına dikkat edin.',
    sorular: ['Okula gelen çocuk neler hissediyor?', 'Annesinden / babasından ayrılırken ne oldu?', 'Sınıfta onu kim karşıladı?', 'Okulda en çok neyi merak ediyor?', 'Okul bitince ne olacak?'],
  },
  {
    id: 'yeni-kardes', ad: 'Yeni kardeş', ikon: '👶', ortam: 'ev-ici',
    aciklama: 'Kardeş doğumu, kıskançlık, ilginin paylaşılması',
    karakterler: ['ben', 'anne', 'baba', 'bebek', 'anneanne', 'oyuncak-ayi', 'biberon'],
    ipucu: 'Bebeğin ve çocuğun sahnede nereye konduğu, kimin kime yakın durduğu önemli olabilir.',
    sorular: ['Eve kim geldi?', 'Bebek gelince evde neler değişti?', 'Bu çocuk şimdi kiminle vakit geçiriyor?', 'Bebek ağlayınca evdekiler ne yapıyor?', 'Bu çocuğun en çok neye ihtiyacı var?'],
  },
  {
    id: 'iki-ev', ad: 'İki evde yaşamak', ikon: '🏘️', ortam: 'iki-ev',
    aciklama: 'Boşanma, ayrı yaşayan ebeveynler, evler arası gidip gelme',
    karakterler: ['ben', 'anne', 'baba', 'kardes', 'kopek', 'oyuncak-ayi'],
    ipucu: 'Evlere ad vermeyin; "Bu ev kimin?" sorusunu çocuğa bırakın. Bir evden ötekine geçişleri izleyin.',
    sorular: ['Bu ev kimin?', 'Çocuk hangi evde ne yapıyor?', 'Bir evden ötekine giderken neler hissediyor?', 'En sevdiği eşyası hangi evde?', 'Herkes birbirine ne söylemek istiyor?'],
  },
  {
    id: 'hastane', ad: 'Hastaneye yatış / ameliyat', ikon: '🏥', ortam: 'hastane',
    aciklama: 'Tıbbi işlem öncesi hazırlık ve sonrası işleme',
    karakterler: ['ben', 'anne', 'doktor', 'oyuncak-ayi', 'steteskop', 'siringa', 'bandaj'],
    ipucu: 'Çocuğun doktor rolünü üstlenmesine izin verin; malzeme dolabı ve muayene odası kullanılabilir.',
    sorular: ['Hastaneye kim geldi, neden?', 'Doktor ne yapacak?', 'Hasta olan en çok neyden korkuyor?', 'Onun yanında kim var?', 'İyileşince ne yapmak istiyor?'],
  },
  {
    id: 'yas', ad: 'Bir kaybın ardından', ikon: '🕊️', ortam: 'ani-bahcesi',
    aciklama: 'Yas, vedalaşma, özlem (kişi ya da evcil hayvan)',
    karakterler: ['ben', 'anne', 'baba', 'anneanne', 'dede', 'kopek', 'kelebek', 'mezar'],
    ipucu: 'Acele etmeyin; anıları ve sürdürmek istenen bağı konuşmak için alan açın.',
    sorular: ['Bu bahçeye kim geliyor?', 'Anı ağacına ne asmak isterdin?', 'Özlediğin birine ne söylemek isterdin?', 'Burada sana kim eşlik ediyor?', 'Bu anı taşına ne çizerdin?'],
  },
  {
    id: 'zorbalik', ad: 'Arkadaş sorunları / zorbalık', ikon: '🛑', ortam: 'okul-bahcesi',
    aciklama: 'Dışlanma, alay, akran zorbalığı, yardım isteme',
    karakterler: ['ben', 'arkadas', 'kiz', 'erkek', 'ergen', 'ogretmen-k', 'rehber', 'kalkan'],
    ipucu: 'Kimin kime ne yaptığını, kimin izlediğini ve yardımın nereden geldiğini not edin.',
    sorular: ['Bahçede neler oluyor?', 'Bu çocuğa kim üzücü bir şey yaptı?', 'Olanları kimler gördü?', 'Bu çocuk kimden yardım isteyebilir?', 'Ne olursa bu çocuk kendini güvende hisseder?'],
  },
  {
    id: 'gece', ad: 'Gece korkuları', ikon: '🌙', ortam: 'cocuk-odasi', hava: 'gece',
    aciklama: 'Uyku sorunları, karanlık korkusu, kâbuslar',
    karakterler: ['ben', 'anne', 'baba', 'hayalet', 'oyuncak-ayi', 'kopek', 'asa'],
    ipucu: '💡 ile ışığı kapatıp el fenerini kullanabilirsiniz. Korkulan şeyi küçültmek ya da dönüştürmek çocuğun elinde olsun.',
    sorular: ['Gece odada neler oluyor?', 'Karanlıkta ne var?', 'Bu çocuk korkunca kimi çağırıyor?', 'Korkuyu ne küçültebilir?', 'Sabah olunca ne oluyor?'],
  },
  {
    id: 'tasinma', ad: 'Taşınma / yeni ev', ikon: '📦', ortam: 'ev-onu',
    aciklama: 'Yeni ev, yeni mahalle, geride kalanlar',
    karakterler: ['ben', 'anne', 'baba', 'kardes', 'komsu', 'kopek', 'arkadas'],
    ipucu: 'Geride bırakılan kişi ve eşyaları sorun; eski ve yeni evi karşılaştırmasına fırsat verin.',
    sorular: ['Bu aile nereye taşındı?', 'Eski evden neler geldi, neler kaldı?', 'Yeni evde en çok neyi merak ediyor?', 'Eski evden kimi özlüyor?', 'Yeni evde kimlerle tanışacak?'],
  },
];

export const senaryoBul = (id) => SENARYOLAR.find((s) => s.id === id) || null;
