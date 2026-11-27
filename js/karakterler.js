import { TEN } from './cizimler.js';

export const KATEGORILER = [
  { id: 'hayvan', ad: 'Hayvanlar', ikon: '🐾' },
  { id: 'ebeveyn', ad: 'Ebeveynler & Aile', ikon: '👨‍👩‍👧' },
  { id: 'cocuk', ad: 'Çocuklar', ikon: '🧒' },
  { id: 'ogretmen', ad: 'Öğretmenler', ikon: '🧑‍🏫' },
  { id: 'insan', ad: 'İnsanlar', ikon: '🧑' },
  { id: 'tasit', ad: 'Taşıtlar', ikon: '🚗' },
  { id: 'oyuncak', ad: 'Oyuncaklar', ikon: '🧸' },
  { id: 'terapi', ad: 'Oyun Terapisi', ikon: '🎭' },
  { id: 'tibbi', ad: 'Tıbbi Malzemeler', ikon: '🩺' },
  { id: 'hayal', ad: 'Hayal Dünyası', ikon: '✨' },
  { id: 'minyatur', ad: 'Minyatürler', ikon: '🪨' },
  { id: 'ozel', ad: 'Çizdiklerim', ikon: '🖍️' },
];

// [id, emoji, ad, ek] — ek: { aciklama, cizim, olcek }. "olcek" karakterin varsayılan boyudur
// (1 = bir köpek boyu); "cizim" varsa karakter emoji yerine tam vücut SVG olarak çizilir.
const grup = (kat, liste) => liste.map(([id, emoji, ad, ek = {}]) => ({ id, emoji, ad, kat, olcek: 1, ...ek }));

const yetiskin = (o) => ({ cizim: { tur: 'insan', tip: 'yetiskin', ...o }, olcek: 2.3 });
const cocuk = (o, olcek = 1.75) => ({ cizim: { tur: 'insan', tip: 'cocuk', ...o }, olcek });
const hayvan = (o, olcek) => ({ cizim: { tur: 'dortayak', ...o }, olcek });
const kus = (o, olcek) => ({ cizim: { tur: 'kus', ...o }, olcek });

export const KARAKTERLER = [
  ...grup('hayvan', [
    ['kopek', '🐕', 'Köpek', hayvan({ renk: '#c68b59', acik: '#f3d9b8', kulak: 'sarkik', kulakRenk: '#8d5a34', kuyruk: 'yukari' }, 1.15)],
    ['kedi', '🐈', 'Kedi', hayvan({ renk: '#ffa94d', acik: '#ffe0b2', kulak: 'sivri', kulakIc: '#f8bbd0', kuyruk: 'uzun', desen: 'cizgi', cizgiRenk: '#e07b1f', burunUcu: '#e57373' }, 0.95)],
    ['tavsan', '🐇', 'Tavşan', hayvan({ renk: '#eceff1', acik: '#ffffff', kulak: 'uzun', kuyruk: 'ponpon', burunUcu: '#f48fb1' }, 0.9)],
    ['ayi', '🐻', 'Ayı', hayvan({ renk: '#8d6e63', acik: '#d7ccc8', kulak: 'yuvarlak', kuyruk: 'kisa', basR: 24 }, 1.6)],
    ['aslan', '🦁', 'Aslan', hayvan({ renk: '#f4b450', acik: '#ffe0a3', yele: '#c77d2e', kulak: 'yuvarlak', kuyruk: 'puskul' }, 1.6)],
    ['kaplan', '🐅', 'Kaplan', hayvan({ renk: '#f57c00', acik: '#fff3e0', kulak: 'yuvarlak', kulakIc: '#fff3e0', desen: 'cizgi', cizgiRenk: '#3e2723', kuyruk: 'uzun' }, 1.6)],
    ['fil', '🐘', 'Fil', hayvan({ renk: '#90a4ae', kulak: 'fil', burun: 'hortum', kuyruk: 'kisa', basR: 25 }, 2.2)],
    ['maymun', '🐒', 'Maymun', hayvan({ renk: '#8d6e63', acik: '#ffccbc', kulak: 'yuvarlak', kulakIc: '#ffccbc', yuzMaske: '#ffccbc', kuyruk: 'kivrik' }, 1.05)],
    ['tilki', '🦊', 'Tilki', hayvan({ renk: '#ef6c00', acik: '#ffffff', kulak: 'sivri', kulakIc: '#3e2723', kuyruk: 'kabarik', uzunBurun: true }, 1.05)],
    ['kurt', '🐺', 'Kurt', hayvan({ renk: '#78909c', acik: '#eceff1', kulak: 'sivri', kulakIc: '#cfd8dc', kuyruk: 'kabarik', uzunBurun: true }, 1.35)],
    ['panda', '🐼', 'Panda', hayvan({ renk: '#fafafa', acik: '#ffffff', desen: 'panda', kulak: 'yuvarlak', kulakIc: '#424242', kuyruk: 'kisa', basR: 24 }, 1.5)],
    ['koala', '🐨', 'Koala', hayvan({ renk: '#9e9e9e', acik: '#e0e0e0', kulak: 'koala', burun: 'koala', burunRenk: '#bdbdbd', kuyruk: 'kisa', basR: 23 }, 1.05)],
    ['inek', '🐄', 'İnek', hayvan({ renk: '#fafafa', acik: '#ffffff', desen: 'benek', kulak: 'boynuz', burunRenk: '#f8bbd0', burunUcu: '#c2185b', kuyruk: 'puskul', puskulRenk: '#212121', uzunBurun: true }, 1.8)],
    ['at', '🐎', 'At', hayvan({ renk: '#a0612f', acik: '#c88a52', yele: '#3e2723', kulak: 'sivri', kulakIc: '#7b4a22', kuyruk: 'at', uzunBacak: true, uzunBurun: true, burunRenk: '#c8a27e' }, 2.0)],
    ['koyun', '🐑', 'Koyun', hayvan({ renk: '#f5f5f5', desen: 'yun', basRenk: '#5d4037', burunRenk: '#6d4c41', burunUcu: '#212121', kulak: 'yatay', kulakRenk: '#5d4037', kuyruk: 'kisa' }, 1.15)],
    ['tavuk', '🐔', 'Tavuk', kus({ renk: '#fafafa', gogus: '#ffffff', ibik: true, kuyrukTuy: '#e0e0e0' }, 0.95)],
    ['civciv', '🐥', 'Civciv', kus({ renk: '#ffe14d', gogus: '#fff59d' }, 0.6)],
    ['ordek', '🦆', 'Ördek', kus({ renk: '#fff8e1', gogus: '#ffffff', genisGaga: true, gaga: '#ff9800' }, 0.85)],
    ['kus', '🐦', 'Kuş', kus({ renk: '#42a5f5', gogus: '#ffcc80', kuyrukTuy: '#1e88e5' }, 0.6)],
    ['baykus', '🦉', 'Baykuş', kus({ renk: '#8d6e63', gogus: '#d7ccc8', baykus: true }, 0.9)],
    ['kaplumbaga', '🐢', 'Kaplumbağa', { olcek: 0.85 }],
    ['kurbaga', '🐸', 'Kurbağa', { cizim: { tur: 'kurbaga', renk: '#66bb6a' }, olcek: 0.7 }],
    ['yilan', '🐍', 'Yılan', { olcek: 0.95 }],
    ['balik', '🐟', 'Balık', { olcek: 0.7 }],
    ['yunus', '🐬', 'Yunus', { olcek: 1.3 }],
    ['kelebek', '🦋', 'Kelebek', { olcek: 0.6 }],
    ['ari', '🐝', 'Arı', { olcek: 0.5 }],
    ['ugurbocegi', '🐞', 'Uğur Böceği', { olcek: 0.45 }],
    ['kirpi', '🦔', 'Kirpi', hayvan({ renk: '#c9a27e', acik: '#ffe0b2', koyu: '#5d4037', desen: 'diken', kulak: 'yuvarlak', kuyruk: 'yok' }, 0.75)],
    ['sincap', '🐿️', 'Sincap', hayvan({ renk: '#c0763a', acik: '#ffe0b2', kulak: 'sivri', kulakIc: '#ffccbc', kuyruk: 'sincap' }, 0.8)],
  ]),
  ...grup('ebeveyn', [
    ['anne', '👩', 'Anne', yetiskin({ ten: TEN[1], sac: 'uzun', sacRenk: '#6d4c41', ust: '#ec407a', altTip: 'etek', alt: '#5c6bc0', ayakkabi: '#6d4c41' })],
    ['baba', '👨', 'Baba', yetiskin({ ten: TEN[1], sac: 'kisa', sacRenk: '#4e342e', ust: '#42a5f5', alt: '#37474f' })],
    ['anne-basortulu', '🧕', 'Anne', yetiskin({ ten: TEN[1], sac: 'basortu', basortu: '#7e57c2', ust: '#26a69a', altTip: 'uzunEtek', alt: '#455a64' })],
    ['baba-sakalli', '🧔', 'Baba', yetiskin({ ten: TEN[2], sac: 'kisa', sacRenk: '#3e2723', ust: '#8d6e63', alt: '#263238', ek: ['sakal'] })],
    ['hamile-anne', '🤰', 'Hamile Anne', yetiskin({ ten: TEN[0], sac: 'bob', sacRenk: '#a1887f', ust: '#ffb74d', altTip: 'elbise', ek: ['karin'] })],
    ['anneanne', '👵', 'Anneanne / Babaanne', yetiskin({ ten: TEN[0], sac: 'topuz', sacRenk: '#cfd8dc', ust: '#8e24aa', altTip: 'uzunEtek', alt: '#5d4037', ek: ['gozluk'] })],
    ['dede', '👴', 'Dede', yetiskin({ ten: TEN[1], sac: 'kel', sacRenk: '#e0e0e0', ust: '#795548', alt: '#5d4037', ek: ['biyik', 'gozluk', 'baston'] })],
    ['teyze', '👩‍🦱', 'Teyze / Hala', yetiskin({ ten: TEN[2], sac: 'kivircik', sacRenk: '#212121', ust: '#ff7043', altTip: 'etek', alt: '#3949ab' })],
    ['amca', '👨‍🦱', 'Amca / Dayı', yetiskin({ ten: TEN[2], sac: 'kisa', sacRenk: '#212121', ust: '#66bb6a', alt: '#424242', ek: ['biyik'] })],
    ['kucak-bebek', '👩‍🍼', 'Bebeğini Taşıyan', yetiskin({ ten: TEN[1], sac: 'atkuyrugu', sacRenk: '#5d4037', ust: '#4db6ac', alt: '#37474f', ek: ['kucakBebek'] })],
  ]),
  ...grup('cocuk', [
    ['ben', '🧒', 'Ben', { aciklama: 'Çocuğun kendisini temsil etmesi için', ...cocuk({ ten: TEN[1], sac: 'kisa', sacRenk: '#5d4037', ust: '#ffca28', alt: '#1e88e5' }) }],
    ['kiz', '👧', 'Kız Çocuk', cocuk({ ten: TEN[1], sac: 'orgu', sacRenk: '#6d4c41', ust: '#f06292', altTip: 'elbise' })],
    ['erkek', '👦', 'Erkek Çocuk', cocuk({ ten: TEN[1], sac: 'dikensi', sacRenk: '#4e342e', ust: '#4caf50', alt: '#1565c0' })],
    ['bebek', '👶', 'Bebek', { cizim: { tur: 'insan', tip: 'bebek', ten: TEN[0], sac: 'bebek', sacRenk: '#a1887f', ust: '#90caf9', alt: '#90caf9', ayakkabi: '#90caf9' }, olcek: 1.1 }],
    ['abla', '👧🏼', 'Abla', cocuk({ ten: TEN[0], sac: 'atkuyrugu', sacRenk: '#ffb74d', ust: '#9575cd', alt: '#37474f' }, 1.95)],
    ['abi', '👦🏽', 'Abi', cocuk({ ten: TEN[2], sac: 'kisa', sacRenk: '#212121', ust: '#ef5350', alt: '#263238' }, 1.95)],
    ['kardes', '🧒🏻', 'Kardeş', cocuk({ ten: TEN[0], sac: 'kivircik', sacRenk: '#ffcc80', ust: '#26c6da', alt: '#ff7043' }, 1.5)],
    ['arkadas', '🧒🏾', 'Arkadaş', cocuk({ ten: TEN[3], sac: 'kivircik', sacRenk: '#212121', ust: '#ff9800', alt: '#3949ab' })],
    ['tekerlekli', '🧑‍🦽', 'Tekerlekli Sandalyede', cocuk({ ten: TEN[1], sac: 'bob', sacRenk: '#6d4c41', ust: '#7e57c2', alt: '#455a64', ek: ['tekerlekli'] }, 1.55)],
    ['ergen', '🧑', 'Büyük Çocuk', { ...yetiskin({ ten: TEN[1], sac: 'kisa', sacRenk: '#3e2723', ust: '#607d8b', alt: '#1a237e', ek: ['kapsonlu'] }), olcek: 2.05 }],
  ]),
  ...grup('ogretmen', [
    ['ogretmen-k', '👩‍🏫', 'Öğretmen', yetiskin({ ten: TEN[0], sac: 'bob', sacRenk: '#8d6e63', ust: '#ab47bc', altTip: 'etek', alt: '#455a64', ek: ['gozluk', 'kitap'] })],
    ['ogretmen-e', '👨‍🏫', 'Öğretmen', yetiskin({ ten: TEN[1], sac: 'kisa', sacRenk: '#424242', ust: '#5c6bc0', alt: '#37474f', ek: ['yaka', 'kravat', 'kitap'], kravat: '#ffb300' })],
    ['rehber', '🧑‍🏫', 'Rehber Öğretmen', yetiskin({ ten: TEN[2], sac: 'atkuyrugu', sacRenk: '#3e2723', ust: '#26a69a', alt: '#5d4037', ek: ['pano'] })],
    ['mudur', '🧑‍💼', 'Müdür', yetiskin({ ten: TEN[1], sac: 'kel', sacRenk: '#9e9e9e', ust: '#37474f', alt: '#37474f', ek: ['gozluk', 'yaka', 'kravat'] })],
    ['hemsire-okul', '👩‍⚕️', 'Okul Hemşiresi', yetiskin({ ten: TEN[0], sac: 'topuz', sacRenk: '#6d4c41', ust: '#e3f2fd', altTip: 'elbise', sapka: 'hemsire', ek: ['stetoskop'] })],
  ]),
  ...grup('insan', [
    ['polis', '👮', 'Polis', yetiskin({ ten: TEN[1], sac: 'kisa', sacRenk: '#3e2723', ust: '#283593', alt: '#1a237e', sapka: 'polis', ek: ['rozet'], ayakkabi: '#111' })],
    ['doktor', '🧑‍⚕️', 'Doktor', yetiskin({ ten: TEN[2], sac: 'kisa', sacRenk: '#212121', ust: '#90caf9', alt: '#455a64', kolRenk: '#ffffff', ek: ['onluk', 'stetoskop', 'gozluk'] })],
    ['itfaiyeci', '🧑‍🚒', 'İtfaiyeci', yetiskin({ ten: TEN[1], sac: 'kisa', sacRenk: '#5d4037', ust: '#455a64', alt: '#37474f', sapka: 'itfaiye', ek: ['serit'], ayakkabi: '#212121' })],
    ['asci', '🧑‍🍳', 'Aşçı', yetiskin({ ten: TEN[0], sac: 'kisa', sacRenk: '#6d4c41', ust: '#ffffff', alt: '#424242', sapka: 'asci', ek: ['fular', 'biyik'] })],
    ['ciftci', '🧑‍🌾', 'Çiftçi', yetiskin({ ten: TEN[2], sac: 'kisa', sacRenk: '#4e342e', ust: '#e53935', alt: '#1565c0', sapka: 'hasir', ek: ['tulum'] })],
    ['isci', '👷', 'İşçi', yetiskin({ ten: TEN[1], sac: 'kisa', sacRenk: '#3e2723', ust: '#ff9800', alt: '#455a64', sapka: 'baret', ek: ['serit'] })],
    ['tamirci', '🧑‍🔧', 'Tamirci', yetiskin({ ten: TEN[3], sac: 'kisa', sacRenk: '#212121', ust: '#90a4ae', alt: '#546e7a', sapka: 'kep', ek: ['tulum'] })],
    ['komsu', '🧓', 'Yaşlı Komşu', yetiskin({ ten: TEN[0], sac: 'kel', sacRenk: '#bdbdbd', ust: '#a1887f', alt: '#5d4037', ek: ['sakal', 'gozluk', 'baston'] })],
    ['dedektif', '🕵️', 'Dedektif', yetiskin({ ten: TEN[1], sac: 'kisa', sacRenk: '#3e2723', ust: '#bcaaa4', alt: '#5d4037', sapka: 'fotr', ek: ['yaka', 'biyik'] })],
    ['pilot', '🧑‍✈️', 'Pilot', yetiskin({ ten: TEN[1], sac: 'kisa', sacRenk: '#5d4037', ust: '#ffffff', alt: '#263238', sapka: 'pilot', ek: ['kravat'], kravat: '#263238' })],
    ['astronot', '🧑‍🚀', 'Astronot', yetiskin({ ten: TEN[2], sac: 'kisa', sacRenk: '#212121', ust: '#f5f5f5', alt: '#eeeeee', ayakkabi: '#9e9e9e', sapka: 'astronot', ek: ['rozet'] })],
    ['yabanci', '🧍', 'Yabancı Biri', yetiskin({ ten: TEN[2], sac: 'kisa', sacRenk: '#5d4037', ust: '#9e9e9e', alt: '#616161', ek: ['gunesGozlugu', 'yaka'] })],
    ['prenses', '👸', 'Prenses', yetiskin({ ten: TEN[0], sac: 'uzun', sacRenk: '#ffd54f', ust: '#f48fb1', altTip: 'uzunElbise', sapka: 'tac' })],
    ['prens', '🤴', 'Prens', yetiskin({ ten: TEN[1], sac: 'kisa', sacRenk: '#6d4c41', ust: '#1e88e5', alt: '#fafafa', sapka: 'tac', ek: ['pelerin'] })],
    ['buyucu', '🧙', 'Büyücü', yetiskin({ ten: TEN[0], sac: 'uzun', sacRenk: '#eeeeee', ust: '#5e35b1', altTip: 'uzunElbise', sapka: 'buyucu', ek: ['uzunSakal', 'asa'] })],
  ]),
  ...grup('tasit', [
    ['araba', '🚗', 'Araba', { olcek: 1.5 }], ['otobus', '🚌', 'Otobüs', { olcek: 2.2 }], ['servis', '🚐', 'Okul Servisi', { olcek: 1.8 }],
    ['ambulans', '🚑', 'Ambulans', { olcek: 1.9 }], ['polis-araba', '🚓', 'Polis Arabası', { olcek: 1.5 }], ['itfaiye', '🚒', 'İtfaiye', { olcek: 2.1 }],
    ['taksi', '🚕', 'Taksi', { olcek: 1.5 }], ['bisiklet', '🚲', 'Bisiklet', { olcek: 1.2 }], ['scooter', '🛴', 'Scooter', { olcek: 1 }],
    ['motor', '🏍️', 'Motosiklet', { olcek: 1.3 }], ['traktor', '🚜', 'Traktör', { olcek: 1.8 }], ['tren', '🚂', 'Tren', { olcek: 2.2 }],
    ['ucak', '✈️', 'Uçak', { olcek: 1.8 }], ['helikopter', '🚁', 'Helikopter', { olcek: 1.8 }], ['yelkenli', '⛵', 'Yelkenli', { olcek: 2 }],
    ['roket', '🚀', 'Roket', { olcek: 1.8 }],
  ]),
  ...grup('oyuncak', [
    ['oyuncak-ayi', '🧸', 'Oyuncak Ayı', { olcek: 0.8 }], ['top', '⚽', 'Top', { olcek: 0.5 }], ['basket', '🏀', 'Basketbol Topu', { olcek: 0.5 }],
    ['ucurtma', '🪁', 'Uçurtma', { olcek: 0.9 }], ['balon', '🎈', 'Balon', { olcek: 0.8 }], ['yoyo', '🪀', 'Yoyo', { olcek: 0.45 }],
    ['matruska', '🪆', 'Matruşka', { olcek: 0.7 }], ['zar', '🎲', 'Zar', { olcek: 0.45 }], ['yapboz', '🧩', 'Yapboz', { olcek: 0.6 }],
    ['robot', '🤖', 'Robot', { olcek: 0.9 }], ['boya', '🎨', 'Boya Seti', { olcek: 0.6 }], ['atlikarinca', '🎠', 'Atlıkarınca', { olcek: 1.6 }],
    ['konsol', '🎮', 'Oyun Konsolu', { olcek: 0.55 }], ['kitap', '📚', 'Kitap', { olcek: 0.6 }],
  ]),
  ...grup('terapi', [
    ['oyuncak-aile', '👪', 'Oyuncak Aile', { aciklama: 'Aile ilişkilerini canlandırma' }],
    ['oyuncak-ev', '🏠', 'Oyuncak Ev', { aciklama: 'Ev yaşamı ve güven teması', olcek: 1.6 }],
    ['biberon', '🍼', 'Biberon', { aciklama: 'Bakım görme / bakım verme oyunu', olcek: 0.6 }],
    ['doktor-seti', '🩺', 'Doktor Seti', { aciklama: 'Tıbbi deneyimleri işleme', olcek: 0.7 }],
    ['yara-bandi', '🩹', 'Yara Bandı', { aciklama: 'İyileşme ve onarım teması', olcek: 0.5 }],
    ['telefon', '📞', 'Telefon', { aciklama: 'Dolaylı iletişim; söyleyemediklerini söyleme', olcek: 0.6 }],
    ['maske', '🎭', 'Maskeler', { aciklama: 'Farklı roller ve duygular deneme', olcek: 0.7 }],
    ['dinozor', '🦖', 'Dinozor', { aciklama: 'Öfke ve güç ifadesi', olcek: 1.6 }],
    ['timsah', '🐊', 'Timsah', { aciklama: 'Saldırganlığın güvenli dışavurumu', olcek: 1.5 }],
    ['kopekbaligi', '🦈', 'Köpekbalığı', { aciklama: 'Tehdit ve korku temaları', olcek: 1.5 }],
    ['kilic', '🗡️', 'Oyuncak Kılıç', { aciklama: 'Güç ve kontrol; sınırlarla oynama', olcek: 0.8 }],
    ['kalkan', '🛡️', 'Kalkan', { aciklama: 'Korunma ve güvende olma', olcek: 0.8 }],
    ['kale', '🏰', 'Kale', { aciklama: 'Güvenli alan ve sınırlar', olcek: 2 }],
    ['bariyer', '🚧', 'Engel / Çit', { aciklama: 'Sınır koyma, ayrılık, uzaklık', olcek: 1.2 }],
    ['bloklar', '🧱', 'Bloklar', { aciklama: 'Kurma ve yıkma; yaratıcı ifade', olcek: 0.8 }],
    ['yiyecek', '🍎', 'Yiyecek', { aciklama: 'Beslenme ve bakım', olcek: 0.5 }],
    ['para', '💰', 'Para Kesesi', { aciklama: 'Değer, paylaşma, güç', olcek: 0.6 }],
    ['yatak', '🛏️', 'Yatak', { aciklama: 'Uyku, dinlenme, gece korkuları', olcek: 1.6 }],
    ['tac', '👑', 'Taç', { aciklama: 'Güç ve kontrol ihtiyacı', olcek: 0.6 }],
    ['asa', '🪄', 'Sihirli Değnek', { aciklama: 'Dilekler: “Neyi değiştirmek isterdin?”', olcek: 0.7 }],
    ['anahtar', '🔑', 'Anahtar', { aciklama: 'Sırlar, açmak / kapatmak', olcek: 0.5 }],
    ['surpriz-kutu', '🎁', 'Sürpriz Kutu', { aciklama: 'Gizli şeyler, sürprizler', olcek: 0.7 }],
    ['davul', '🥁', 'Davul', { aciklama: 'Duyguyu sesle boşaltma', olcek: 0.7 }],
  ]),
  // Hastanedeki Malzeme Dolabı da bu listeyi açar. Tıbbi oyun, ameliyat / tedavi / iğne deneyimlerini
  // çocuğun kontrolünde yeniden yaşayıp işlemesine yardım eder.
  ...grup('tibbi', [
    ['steteskop', '🩺', 'Steteskop', { aciklama: 'Dinlemek, “içimde ne oluyor?” merakı', olcek: 0.7 }],
    ['siringa', '💉', 'Şırınga / İğne', { aciklama: 'İğne korkusunu oyunda yönetme; rol değiştirme', olcek: 0.6 }],
    ['ilac', '💊', 'İlaç', { aciklama: 'Tedavi, iyileşme beklentisi', olcek: 0.45 }],
    ['termometre', '🌡️', 'Ateş Ölçer', { aciklama: 'Hastalık belirtileri, bakım görme', olcek: 0.6 }],
    ['bandaj', '🩹', 'Bandaj', { aciklama: 'Yaralanma ve onarım; acıyı adlandırma', olcek: 0.5 }],
    ['ilac-sisesi', '🧴', 'İlaç Şişesi / Krem', { aciklama: 'Bakım verme ve rahatlatma', olcek: 0.55 }],
    ['tup', '🧪', 'Tahlil Tüpü', { aciklama: 'Tahlil / kan alma deneyimleri', olcek: 0.55 }],
    ['kan', '🩸', 'Kan Damlası', { aciklama: 'Kan alma, yaralanma; korkuyu dile getirme', olcek: 0.45 }],
    ['rontgen', '🩻', 'Röntgen', { aciklama: 'Görünmeyeni görmek; tetkik süreçleri', olcek: 0.9 }],
    ['mikroskop', '🔬', 'Mikroskop', { aciklama: 'Merak, mikroplar, hastalığı anlama', olcek: 0.7 }],
    ['tekerlekli-sandalye', '🦽', 'Tekerlekli Sandalye', { aciklama: 'Hareket kısıtlılığı, yardım alma', olcek: 1.2 }],
    ['koltuk-degnegi', '🩼', 'Koltuk Değneği', { aciklama: 'Kırık / ameliyat sonrası iyileşme', olcek: 1 }],
    ['buz-torbasi', '🧊', 'Buz Torbası', { aciklama: 'Ağrıyı hafifletme, kendini yatıştırma', olcek: 0.5 }],
    ['eldiven', '🧤', 'Eldiven', { aciklama: 'Hijyen; doktor rolünü üstlenme', olcek: 0.5 }],
    ['maske-tibbi', '😷', 'Maske', { aciklama: 'Bulaşma kaygısı, korunma', olcek: 0.6 }],
    ['sargi', '🧻', 'Sargı Bezi', { aciklama: 'Sarmalamak, korumak, iyileşmeyi beklemek', olcek: 0.55 }],
  ]),
  // Kum tepsisi için küçük nesneler (her ortamda da kullanılabilir).
  ...grup('minyatur', [
    ['agac-m', '🌳', 'Ağaç', { olcek: 1.2 }], ['cam-m', '🌲', 'Çam', { olcek: 1.2 }], ['kaktus', '🌵', 'Kaktüs', { olcek: 0.9 }],
    ['cicek-m', '🌸', 'Çiçek', { olcek: 0.5 }], ['mantar', '🍄', 'Mantar', { olcek: 0.5 }], ['kaya', '🪨', 'Kaya', { olcek: 0.8 }],
    ['ada', '🏝️', 'Ada', { olcek: 1.4 }], ['yanardag', '🌋', 'Yanardağ', { aciklama: 'Patlamak üzere olan büyük duygular', olcek: 1.6 }],
    ['kopru', '🌉', 'Köprü', { aciklama: 'Bağlantı kurmak, iki yer arasında geçiş', olcek: 1.5 }], ['cadir', '⛺', 'Çadır', { olcek: 1.1 }],
    ['kulube', '🛖', 'Kulübe', { olcek: 1.2 }], ['eski-ev', '🏚️', 'Yıkık Ev', { aciklama: 'Zarar görmüş, onarılması gereken', olcek: 1.3 }],
    ['hazine', '💎', 'Hazine', { aciklama: 'Değerli olan, korunan', olcek: 0.5 }], ['ates', '🔥', 'Ateş', { aciklama: 'Öfke, tehlike ya da sıcaklık', olcek: 0.7 }],
    ['dalga', '🌊', 'Dalga', { olcek: 1 }], ['cukur', '🕳️', 'Çukur', { aciklama: 'Saklanan, gömülen şeyler', olcek: 0.9 }],
    ['deniz-kabugu', '🐚', 'Deniz Kabuğu', { olcek: 0.45 }], ['yildiz-m', '⭐', 'Yıldız', { olcek: 0.5 }], ['gokkusagi-m', '🌈', 'Gökkuşağı', { olcek: 1.3 }],
    ['bayrak', '🚩', 'Bayrak', { aciklama: 'Burası benim: sahiplenme, sınır', olcek: 0.7 }], ['capa', '⚓', 'Çapa', { olcek: 0.6 }],
    ['mezar', '🪦', 'Mezar Taşı', { aciklama: 'Kayıp ve yas; vedalaşma', olcek: 0.8 }],
  ]),
  ...grup('hayal', [
    ['kahraman', '🦸', 'Süper Kahraman', { aciklama: 'Güçlü hissetme, kurtarma', ...yetiskin({ ten: TEN[1], sac: 'kisa', sacRenk: '#212121', ust: '#1e88e5', alt: '#1565c0', ayakkabi: '#c62828', ek: ['pelerin', 'maske', 'logo'] }) }],
    ['ejderha', '🐉', 'Ejderha', { aciklama: 'Büyük korkular ve güç', olcek: 2.2 }],
    ['peri', '🧚', 'Peri', { aciklama: 'Yardım, dilek, iyileştirme', ...cocuk({ ten: TEN[0], sac: 'uzun', sacRenk: '#ffcc80', ust: '#ce93d8', altTip: 'elbise', ek: ['kanat', 'asa'] }, 1.45) }],
    ['hayalet', '👻', 'Hayalet', { aciklama: 'Görünmeyen korkular, kayıp', olcek: 1.3 }],
    ['unicorn', '🦄', 'Tek Boynuzlu At', { aciklama: 'Hayaller ve umut', ...hayvan({ renk: '#fafafa', acik: '#f3e5f5', yele: '#ce93d8', kulak: 'sivri', kulakIc: '#f8bbd0', kuyruk: 'at', uzunBacak: true, uzunBurun: true, burunRenk: '#f8bbd0', boynuz: true }, 1.9) }],
  ]),
];

export const DUYGULAR = [
  { id: 'mutlu', ad: 'Mutlu', emoji: '😊', renk: '#ffcf33' },
  { id: 'uzgun', ad: 'Üzgün', emoji: '😢', renk: '#5b9bff' },
  { id: 'kizgin', ad: 'Kızgın', emoji: '😠', renk: '#ff4d4d' },
  { id: 'korkmus', ad: 'Korkmuş', emoji: '😨', renk: '#a77bff' },
  { id: 'saskin', ad: 'Şaşkın', emoji: '😲', renk: '#ff9f40' },
  { id: 'sakin', ad: 'Sakin', emoji: '😌', renk: '#4fd1a0' },
  { id: 'endiseli', ad: 'Endişeli', emoji: '😟', renk: '#94a3b8' },
  { id: 'utangac', ad: 'Utangaç', emoji: '😳', renk: '#ff8fb1' },
  { id: 'heyecanli', ad: 'Heyecanlı', emoji: '🤩', renk: '#ffb800' },
  { id: 'yorgun', ad: 'Yorgun', emoji: '😴', renk: '#8c8fa3' },
  { id: 'sevgi', ad: 'Sevgi Dolu', emoji: '🥰', renk: '#ff6fa8' },
  { id: 'yalniz', ad: 'Yalnız', emoji: '🥺', renk: '#7d8fd1' },
];

// Çocuğun kendi çizdiği karakterler hikayeyle birlikte saklanır; hikaye açılınca buraya yüklenir.
export const OZEL = [];
export function ozelKaydet(liste = []) {
  OZEL.length = 0;
  OZEL.push(...liste.filter((o) => o && o.id && o.resim).map((o) => ({ id: o.id, ad: o.ad || 'Benim karakterim', resim: o.resim, kat: 'ozel', emoji: '🖍️', olcek: 1.6 })));
}
export const tumKarakterler = () => [...KARAKTERLER, ...OZEL];
export const karakterBul = (id) => KARAKTERLER.find((k) => k.id === id) || OZEL.find((k) => k.id === id);
export const duyguBul = (id) => DUYGULAR.find((d) => d.id === id);
