// Çocuğun dili: danışman arayüzü Türkçe kalır; çocuğa okunan / gösterilen metinlerin altında seçilen dildeki
// karşılığı da görünür. Çeviriler ana dili bu diller olan biri tarafından gözden geçirilmelidir.
export const DILLER = [
  { id: 'tr', ad: 'Yalnız Türkçe' },
  { id: 'en', ad: 'English (İngilizce)' },
  { id: 'ar', ad: 'العربية (Arapça)', rtl: true },
  { id: 'ku', ad: 'Kurmancî (Kürtçe)' },
];

const S = {
  // Soru kartları
  'Burası sana neyi hatırlatıyor?': ['What does this place remind you of?', 'بماذا يذكّرك هذا المكان؟', 'Ev der te tîne bîra çi?'],
  'Hikayemiz nasıl başlasın?': ['How should our story begin?', 'كيف تبدأ قصتنا؟', 'Bila çîroka me çawa dest pê bike?'],
  'Burada kimler yaşıyor / kimler var?': ['Who lives here / who is here?', 'من يعيش هنا / من هنا؟', 'Li vir kî dijî / kî li vir e?'],
  'Bugün burada hava nasıl olsun?': ['What should the weather be like here today?', 'كيف يكون الطقس هنا اليوم؟', 'Îro li vir hewa bila çawa be?'],
  'Şimdi ne oluyor?': ['What is happening now?', 'ماذا يحدث الآن؟', 'Niha çi diqewime?'],
  'Bu karakter ne yapmak istiyor?': ['What does this character want to do?', 'ماذا تريد هذه الشخصية أن تفعل؟', 'Ev karakter dixwaze çi bike?'],
  'Bu karakter neye ihtiyaç duyuyor?': ['What does this character need?', 'ماذا تحتاج هذه الشخصية؟', 'Ev karakter hewcedarê çi ye?'],
  'Kim ona yardım edebilir?': ['Who can help them?', 'من يستطيع أن يساعده؟', 'Kî dikare alîkariya wî bike?'],
  'Bu karakter ne söylemek istiyor? Ona ses verir misin?': ['What does this character want to say? Will you give it a voice?', 'ماذا تريد هذه الشخصية أن تقول؟ هل تعطيها صوتك؟', 'Ev karakter dixwaze çi bibêje? Tu dengê xwe didî wî?'],
  'Hava değişince hikayede ne değişti?': ['When the weather changed, what changed in the story?', 'عندما تغيّر الطقس، ماذا تغيّر في القصة؟', 'Dema hewa guherî, di çîrokê de çi guherî?'],
  'Sonra ne olacak?': ['What will happen next?', 'ماذا سيحدث بعد ذلك؟', 'Paşê wê çi bibe?'],
  'Bu karakter şu an nasıl hissediyor olabilir?': ['How might this character be feeling right now?', 'بماذا قد تشعر هذه الشخصية الآن؟', 'Dibe ku ev karakter niha xwe çawa hîs dike?'],
  'Ne olursa bu karakter daha iyi hisseder?': ['What would make this character feel better?', 'ما الذي يجعل هذه الشخصية تشعر بتحسّن؟', 'Çi bibe, ev karakter wê xwe baştir hîs bike?'],
  'Diğer karakterler onun böyle hissettiğini biliyor mu?': ['Do the other characters know it feels this way?', 'هل تعرف الشخصيات الأخرى أنها تشعر هكذا؟', 'Gelo karakterên din dizanin ku ew wiha hîs dike?'],
  'Bu karakter en çok neyden korkuyor?': ['What is this character most afraid of?', 'ممّ تخاف هذه الشخصية أكثر شيء؟', 'Ev karakter herî zêde ji çi ditirse?'],
  'Bu karakter en çok ne zaman mutlu oluyor?': ['When is this character happiest?', 'متى تكون هذه الشخصية أسعد ما يكون؟', 'Ev karakter herî zêde kengê kêfxweş dibe?'],
  'Hikaye nasıl bitsin?': ['How should the story end?', 'كيف تنتهي القصة؟', 'Bila çîrok çawa biqede?'],
  'Hikayemize bir isim verelim mi?': ['Shall we give our story a name?', 'هل نعطي قصتنا اسمًا؟', 'Em navekî li çîroka xwe bikin?'],
  'Hangi karakter sana en çok benziyor?': ['Which character is most like you?', 'أيّ شخصية تشبهك أكثر؟', 'Kîjan karakter herî zêde dişibe te?'],
  'Bu hikayede olsaydın nerede dururdun?': ['If you were in this story, where would you be?', 'لو كنت في هذه القصة، أين كنت ستقف؟', 'Heke tu di vê çîrokê de bûya, tu yê li ku bisekiniya?'],
  'Sihirli değneğin olsaydı hikayede neyi değiştirirdin?': ['If you had a magic wand, what would you change in the story?', 'لو كانت معك عصا سحرية، ماذا كنت ستغيّر في القصة؟', 'Heke darê te yê sêrbaz hebûya, tu yê di çîrokê de çi biguherandaya?'],
  // Duygular
  'Mutlu': ['Happy', 'سعيد', 'Kêfxweş'], 'Üzgün': ['Sad', 'حزين', 'Xemgîn'], 'Kızgın': ['Angry', 'غاضب', 'Hêrsbûyî'],
  'Korkmuş': ['Scared', 'خائف', 'Tirsiyayî'], 'Şaşkın': ['Surprised', 'متفاجئ', 'Şaşmayî'], 'Sakin': ['Calm', 'هادئ', 'Aram'],
  'Endişeli': ['Worried', 'قلق', 'Bi fikar'], 'Utangaç': ['Shy', 'خجول', 'Şermok'], 'Heyecanlı': ['Excited', 'متحمّس', 'Bi kelecan'],
  'Yorgun': ['Tired', 'متعب', 'Westiyayî'], 'Sevgi Dolu': ['Loving', 'مُحِبّ', 'Bi evîn'], 'Yalnız': ['Lonely', 'وحيد', 'Tenê'],
  // Ekran yönergeleri
  'Hikayemiz nerede geçsin?': ['Where does our story take place?', 'أين تجري قصتنا؟', 'Çîroka me li ku derbas bibe?'],
  'Hikayemizde kimler olsun?': ['Who will be in our story?', 'من سيكون في قصتنا؟', 'Kî di çîroka me de hebin?'],
  'nasıl hissediyor?': ['how does it feel?', 'بماذا تشعر؟', 'xwe çawa hîs dike?'],
  'Ne kadar?': ['How much?', 'إلى أي حد؟', 'Çiqas?'],
  'Bugün içinde hava nasıl?': ["What's the weather like inside you today?", 'كيف هو الطقس في داخلك اليوم؟', 'Îro hewaya hundirê te çawa ye?'],
  'Güneşli': ['Sunny', 'مشمس', 'Tavî'], 'Parçalı bulutlu': ['Partly cloudy', 'غائم جزئيًا', 'Hinekî ewrî'], 'Bulutlu': ['Cloudy', 'غائم', 'Ewrî'],
  'Yağmurlu': ['Rainy', 'ماطر', 'Baranî'], 'Fırtınalı': ['Stormy', 'عاصف', 'Bi bahoz'], 'Gökkuşağı': ['Rainbow', 'قوس قزح', 'Keskesor'],
  'Balonu birlikte şişirelim': ["Let's blow up the balloon together", 'لننفخ البالون معًا', 'Em bi hev re balonê biwerimînin'],
  'Nefes al': ['Breathe in', 'خذ نفسًا', 'Bêhna xwe bikişîne'], 'Tut': ['Hold', 'احبس', 'Bigire'], 'Nefes ver': ['Breathe out', 'أخرج النفس', 'Bêhna xwe berde'],
  'Seni üzen ya da endişelendiren ne?': ['What is worrying or upsetting you?', 'ما الذي يقلقك أو يحزنك؟', 'Çi te xemgîn an bi fikar dike?'],
  'Canavara yedir': ['Feed it to the monster', 'أطعمه للوحش', 'Bide cinawir bixwe'],
  'Kutuya kilitle': ['Lock it in the box', 'اقفل عليه في الصندوق', 'Di qutiyê de kilît bike'],
  'Bu duyguyu bedeninin neresinde hissediyorsun?': ['Where in your body do you feel this feeling?', 'أين تشعر بهذا الشعور في جسمك؟', 'Tu vê hestê li ku derê laşê xwe hîs dikî?'],
  'Nasıl olmasını isterdin?': ['How would you like it to be?', 'كيف تحب أن يكون؟', 'Te dixwest çawa be?'],
  // Hikaye kökleri, güçler, rol değiştirme, güvenli yer, kapanış
  'Sonra ne oldu? Bana göster.': ['What happened next? Show me.', 'ماذا حدث بعد ذلك؟ أرني.', 'Paşê çi bû? Nîşanî min bide.'],
  'Hangi gücü olsun?': ['Which power should it have?', 'أي قوة تريد أن تكون له؟', 'Bila kîjan hêz a wî hebe?'],
  'Kalkan': ['Shield', 'درع', 'Mertal'],
  'Görünmezlik': ['Invisibility', 'الاختفاء', 'Nexuyabûn'],
  'Dev gibi büyüme': ['Growing like a giant', 'يكبر كالعملاق', 'Wek dêw mezin bûn'],
  'Uçma': ['Flying', 'الطيران', 'Firîn'],
  'Süper hız': ['Super speed', 'سرعة خارقة', 'Leza mezin'],
  'Süper güç': ['Super strength', 'قوة خارقة', 'Hêza mezin'],
  'Sihir': ['Magic', 'سحر', 'Sêhr'],
  'İyileştirme': ['Healing', 'الشفاء', 'Başkirin'],
  'Şimdi sen bu karakter ol': ['Now you be this character', 'الآن كن أنت هذه الشخصية', 'Niha tu bibe ev karakter'],
  'Burası senin güvenli yerin': ['This is your safe place', 'هذا مكانك الآمن', 'Ev cihê te yê ewle ye'],
  'Oyuncaklar uyuyor. Gelecek sefere kadar hoşça kal!': ['The toys are sleeping. Goodbye until next time!', 'الألعاب نائمة. إلى اللقاء في المرة القادمة!', 'Lîstok radizên. Heta cara bê bi xatirê te!'],
};
const SIRA = { en: 0, ar: 1, ku: 2 };

export function cevir(tr, dil) {
  const k = S[tr];
  return dil && dil !== 'tr' && k ? k[SIRA[dil]] : '';
}

// Türkçe metin + (varsa) seçilen dildeki karşılığı, kaçışı yapılmış HTML olarak.
export function ikiDil(tr, dil, kacis = (x) => x) {
  const c = cevir(tr, dil);
  if (!c) return kacis(tr);
  const rtl = DILLER.find((d) => d.id === dil)?.rtl;
  return `${kacis(tr)}<span class="ceviri" lang="${dil}"${rtl ? ' dir="rtl"' : ''}>${kacis(c)}</span>`;
}
