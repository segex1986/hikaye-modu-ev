import { ORTAMLAR, ortamBul, ortamSvg } from './ortamlar.js';
import { KATEGORILER, KARAKTERLER, DUYGULAR, karakterBul, duyguBul, ozelKaydet, tumKarakterler } from './karakterler.js';
import { ses } from './ses.js';
import { HAVALAR, havaKur, havaSonraki, havaIndeks } from './hava.js';
import { karakterSvg, TEN } from './cizimler.js';
import { SENARYOLAR, senaryoBul } from './senaryolar.js';
import { DILLER, ikiDil, cevir } from './ceviri.js';
import { KOKLER, kokBul } from './kokler.js';
import { SOSYAL, sosyalBul, SINIF_TEMALARI, sinifBul } from './beceriler.js';

const $ = (s) => document.querySelector(s);
const kacis = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const sinirla = (v, a, b) => Math.min(b, Math.max(a, v));
// Kullanım modu: danışma (tam program), ebeveyn (evde rehberli oyun), çocuk (serbest oyun ya da oturumda sade ekran).
let mod = 'danisma', cocukAlt = 'oturum';
try { mod = localStorage.getItem('hikaye-modu-mod') || 'danisma'; cocukAlt = localStorage.getItem('hikaye-modu-cocuk-alt') || 'oturum'; } catch { /* yoksay */ }
if (!['danisma', 'ebeveyn', 'cocuk'].includes(mod)) mod = 'danisma';
// Ev sürümü (ebeveynlere verilen, sunucusuz kopya): yalnızca ebeveyn modu ve çocuğun serbest oyunu açılır.
const EV_SURUMU = !!window.HIKAYE_EV;
// iPad uygulaması: kayıtlar cihazın içinde (js/yerel-sunucu.js); telefon kumandası ve tarayıcıya kurma yok.
const IPAD = !!window.HIKAYE_IPAD;
if (EV_SURUMU) { if (mod !== 'cocuk') mod = 'ebeveyn'; cocukAlt = 'serbest'; }
const cocukSerbest = () => mod === 'cocuk' && cocukAlt === 'serbest';
// Ebeveyn ve serbest çocuk oyunlarının taslağı danışma oturumununkine karışmaz.
const taslakAnahtar = () => 'hikaye-modu-taslak' + (mod === 'ebeveyn' ? '-ebeveyn' : cocukSerbest() ? '-cocuk' : '');
const BOYUT_ARALIGI = [0.35, 3.5];

// Çizimi olan karakterler tam vücut SVG, çocuğun çizdikleri resim, diğerleri emoji olarak gösterilir.
const gorsel = (kar, duygu = null) => (kar.resim ? `<img class="ozel-resim" src="${kar.resim}" alt="" draggable="false">` : kar.cizim ? karakterSvg(kar, duygu) : kar.emoji);

const SORULAR = {
  'Başlarken': [
    'Burası sana neyi hatırlatıyor?',
    'Hikayemiz nasıl başlasın?',
    'Burada kimler yaşıyor / kimler var?',
    'Bugün burada hava nasıl olsun?',
  ],
  'Hikaye sürerken': [
    'Şimdi ne oluyor?',
    'Bu karakter ne yapmak istiyor?',
    'Bu karakter neye ihtiyaç duyuyor?',
    'Kim ona yardım edebilir?',
    'Bu karakter ne söylemek istiyor? Ona ses verir misin?',
    'Hava değişince hikayede ne değişti?',
    'Sonra ne olacak?',
  ],
  'Duygular üzerine': [
    'Bu karakter şu an nasıl hissediyor olabilir?',
    'Ne olursa bu karakter daha iyi hisseder?',
    'Diğer karakterler onun böyle hissettiğini biliyor mu?',
    'Bu karakter en çok neyden korkuyor?',
    'Bu karakter en çok ne zaman mutlu oluyor?',
  ],
  'Bitirirken': [
    'Hikaye nasıl bitsin?',
    'Hikayemize bir isim verelim mi?',
    'Hangi karakter sana en çok benziyor?',
    'Bu hikayede olsaydın nerede dururdun?',
    'Sihirli değneğin olsaydı hikayede neyi değiştirirdin?',
  ],
};

let durum = yeniDurum();
let aktifKategori = KATEGORILER[0].id;
let seciliUid = null;
let sesSeviyeI = 0;
let notlarAcik = false;
const SES_SEVIYELERI = [[0.7, '🔊'], [0.3, '🔉'], [0, '🔇']];
const suruklemeler = new Map();
const rafBekleyen = new Map();
// Yeniden oynatma ve bağ kurma durumu (akisEkle/taslakKaydet oynatma sırasında yazmaz).
let oynatiliyor = false, oynatDur = false, bagModu = null;
// Geri al / yinele yığınları, hikaye kökü, rol değiştirme, telefon bağlantısı ve süre durumu.
let geriYigin = [], ileriYigin = [], geriUyguluyor = false;
let kokAktif = null, rol = null, canli = null, sureHedef = null, seyirci = false;
let sesliOku = false;
try { sesliOku = localStorage.getItem('hikaye-modu-sesli') === '1'; } catch { /* yoksay */ }

function yeniDurum() {
  return {
    ortamId: null, havaI: 0, secili: [], sahnede: [], akis: [], sorulanlar: [],
    kod: '', not: '', baslangic: Date.now(), sahneBasladi: false, isimGoster: true, sayac: 1,
    // Rapor için: hikaye şeridindeki anlar, karakterlerin söyledikleri, seçilen duygular ve gezilen ortamlar.
    anlar: [], sozler: [], duyguGecmisi: [], gezilen: [], alanlar: [],
    // İlişki ipleri, çocuğun çizdiği karakterler, yeniden oynatma kareleri ve ışık durumu.
    baglar: [], ozel: [], kareler: [], karanlik: false,
    // Hazır senaryo, temalar, iç hava, beden haritaları, endişeler, dilek sahneleri, kum izleri, çocuğun dili.
    senaryo: null, temalar: [], icHava: { bas: null, son: null }, bedenler: [], endiseler: [], dilekler: [], kumIzleri: [], dil: 'tr',
    // Hikaye kökleri, güvenli yer, rol değiştirme diyalogları, aile ağacı, veli/öğretmen özeti, perde.
    kokler: [], guvenliYer: null, roller: [], genogram: null, genogramAyar: {}, veli: null, perdeKapali: false,
    // Danışma: oturum hedefi, risk ve koruma işaretleri. Ebeveyn modu: beceri sayaçları.
    hedef: '', hedefDurumu: '', riskler: [], riskNot: '', ebeveyn: null,
    // Sosyal beceri senaryolarında verilen yanıtlar; sınıf etkinliği teması.
    sosyal: [], sinif: null,
  };
}

// ---------------- Genel ----------------
function ekranGoster(ad) {
  document.querySelectorAll('.ekran').forEach((e) => e.classList.toggle('aktif', e.id === 'ekran-' + ad));
  if (ad !== 'sahne') { if (rol) rolBitir(); if (kokAktif) kokKapat(); if (seyirci) seyirciModu(false); ses.durdur(); secimKaldir(); rehberKapat(); $('#cizim-ortusu').classList.add('gizli'); $('#btn-guvenli').classList.remove('aktif'); }
  if (ad === 'ortam') ortamlariCiz();
  if (ad === 'karakter') { sekmeleriCiz(); karakterleriCiz(); }
}

let bildirimZamani = 0;
function bildir(metin) {
  const el = $('#bildirim');
  el.textContent = metin;
  el.classList.add('goster');
  clearTimeout(bildirimZamani);
  bildirimZamani = setTimeout(() => el.classList.remove('goster'), 1900);
}

function akisEkle(metin) {
  if (oynatiliyor) return;
  durum.akis.push({ t: Date.now(), m: metin });
  kareEkle(metin);
  akisCiz();
  taslakKaydet();
}

function sureYaz(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

let taslakUyarisi = false;
function taslakKaydet() {
  if (oynatiliyor) return;
  geriKaydet(); canliGonderSonra();
  const veri = { ...durum, not: $('#notlar').value, kod: $('#danisan-kod').value };
  try { localStorage.setItem(taslakAnahtar(), JSON.stringify(veri)); return; } catch { /* yer yetmediyse aşağıda hafifletilir */ }
  // Tarayıcı deposu dolarsa fotoğraflar ve ses kayıtları taslağa yazılmaz; 💾 Kaydet ile sunucuda saklanırlar.
  try {
    localStorage.setItem(taslakAnahtar(), JSON.stringify({
      ...veri,
      anlar: veri.anlar.map((a) => ({ ...a, resim: '' })),
      sahnede: veri.sahnede.map((k) => (k.soz?.ses ? { ...k, soz: { ...k.soz, ses: null } } : k)),
    }));
    if (!taslakUyarisi) { taslakUyarisi = true; bildir('💾 Fotoğrafları korumak için hikayeyi kaydedin'); }
  } catch { /* depolama kapalıysa taslak tutulmaz */ }
}

function taslakOku() {
  try { return JSON.parse(localStorage.getItem(taslakAnahtar()) || 'null'); } catch { return null; }
}

function durumYukle(veri) {
  durum = { ...yeniDurum(), ...veri };
  document.body.classList.toggle('sinif-modu', !!durum.sinif);
  ozelKaydet(durum.ozel);
  // Bağlar karakterlere uid ile bağlı olduğu için kayıttaki uid korunur (eski kayıtlarda sıra numarası verilir).
  const kullanilan = new Set();
  durum.sahnede = (veri.sahnede || veri.karakterler || [])
    .filter((k) => karakterBul(k.kid))
    .map((k, i) => {
      const uid = +k.uid > 0 && !kullanilan.has(+k.uid) ? +k.uid : 10000 + i;
      kullanilan.add(uid);
      return { uid, kid: k.kid, x: +k.x || 0.5, y: +k.y || 0.7, duygu: k.duygu || null, boyut: +k.boyut || 1, ters: !!k.ters, isim: k.isim || '', ortam: k.ortam || null, soz: k.soz || null, gorunum: k.gorunum || null, siddet: +k.siddet || null, guvende: !!k.guvende, saklandi: k.saklandi || null, guc: Array.isArray(k.guc) ? k.guc.filter((g) => typeof g === 'string') : [] };
    });
  durum.sayac = Math.max(0, ...durum.sahnede.map((k) => k.uid)) + 1;
  durum.baglar = (durum.baglar || []).filter((g) => kullanilan.has(g.a) && kullanilan.has(g.b));
  durum.kareler = Array.isArray(durum.kareler) ? durum.kareler : [];
  durum.icHava = { bas: null, son: null, ...(veri.icHava || {}) };
  durum.secili = (veri.secili || []).filter((id) => karakterBul(id));
  durum.genogramAyar = veri.genogramAyar && typeof veri.genogramAyar === 'object' ? veri.genogramAyar : {};
  geriYigin = []; ileriYigin = []; kokAktif = null; rol = null;
  if (typeof veri.hava === 'string') durum.havaI = Math.max(0, HAVALAR.findIndex((h) => h.id === veri.hava));
  if (!ORTAMLAR.some((o) => o.id === durum.ortamId)) durum.ortamId = veri.ortam || ORTAMLAR[0].id;
  $('#notlar').value = durum.not || '';
  $('#danisan-kod').value = durum.kod || '';
  document.querySelectorAll('.soru').forEach((b) => b.classList.toggle('soruldu', durum.sorulanlar.includes(b.dataset.soru)));
  akisCiz(); seritCiz(); dilUygula(); temalariCiz(); icHavaCiz(); danismaAlanlariCiz();
}

// ---------------- 1. Ortam seçimi ----------------
function onizleme(o) {
  const [gx, gy] = o.gunes;
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="onz-${o.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d9df2"/><stop offset="1" stop-color="#cdeeff"/></linearGradient></defs>
    <rect width="1600" height="900" fill="url(#onz-${o.id})"/><circle cx="${gx}" cy="${gy}" r="62" fill="#ffd23f"/>${o.svg()}</svg>`;
}

function ortamlariCiz() {
  // Yalnızca kapıdan girilen iç mekânlar (ör. iki evin içi) listede gösterilmez.
  $('#ortam-listesi').innerHTML = ORTAMLAR.filter((o) => !o.gizli).map((o) => `
    <button class="ortam-kart ${o.id === durum.ortamId ? 'secili' : ''}" data-ortam="${o.id}">
      <span class="ortam-onizleme">${onizleme(o)}</span>
      <span class="ortam-ad"><span>${o.ikon}</span>${o.ad}</span>
    </button>`).join('');
}

$('#ortam-listesi').addEventListener('click', (e) => {
  const kart = e.target.closest('[data-ortam]');
  if (!kart) return;
  const o = ortamBul(kart.dataset.ortam);
  ses.sec();
  if (durum.ortamId !== o.id) {
    // Hikaye başka yere taşınınca o an sahnede olanlar da gelir; kapının öbür yanında kalanlar yerinde kalır.
    durum.sahnede.forEach((k) => { if (k.ortam === durum.ortamId) k.ortam = null; });
    durum.ortamId = o.id;
    akisEkle(`${o.ikon} Ortam seçildi: ${o.ad}`);
  }
  if (durum.sahneBasladi) sahneAc(); else ekranGoster('karakter');
});

// ---------------- 2. Karakter seçimi ----------------
function sekmeleriCiz() {
  $('#kategori-sekmeleri').innerHTML = KATEGORILER.map((k) => {
    const n = durum.secili.filter((id) => karakterBul(id).kat === k.id).length;
    return `<button class="sekme ${k.id === aktifKategori ? 'aktif' : ''}" data-kat="${k.id}"><span class="e">${k.ikon}</span>${k.ad}${n ? `<span class="sayac">${n}</span>` : ''}</button>`;
  }).join('') + `<button class="sekme ${notlarAcik ? 'aktif' : ''}" data-notlar="1" title="Oyuncakların terapötik kullanım notlarını göster">ℹ️ Rehber notları</button>`;
  $('#secim-sayaci').textContent = durum.secili.length;
}

function karakterleriCiz() {
  const liste = tumKarakterler().filter((k) => k.kat === aktifKategori);
  const hepsiSecili = liste.every((k) => durum.secili.includes(k.id));
  const yeniCizim = aktifKategori === 'ozel'
    ? '<button class="karakter-kart yeni-cizim" data-yeni-cizim="1"><span class="e">✏️</span><span class="ad">Yeni karakter çiz</span></button>' : '';
  $('#karakter-listesi').innerHTML = yeniCizim + liste.map((k) => `
    <button class="karakter-kart ${durum.secili.includes(k.id) ? 'secili' : ''}" data-kid="${k.id}" ${k.aciklama ? `title="${kacis(k.aciklama)}"` : ''}>
      <span class="e">${gorsel(k)}</span><span class="ad">${kacis(k.ad)}</span>
      ${notlarAcik && k.aciklama ? `<span class="not">${kacis(k.aciklama)}</span>` : ''}
    </button>`).join('') +
    (liste.length ? `<button class="ince-btn tumunu-sec" data-tumu="${hepsiSecili ? 'kaldir' : 'sec'}">${hepsiSecili ? '✖ Bu gruptaki seçimleri kaldır' : '✔ Bu gruptakilerin hepsini seç'}</button>` : '');
}

$('#kategori-sekmeleri').addEventListener('click', (e) => {
  const b = e.target.closest('.sekme');
  if (!b) return;
  if (b.dataset.notlar) notlarAcik = !notlarAcik; else aktifKategori = b.dataset.kat;
  ses.sec(); sekmeleriCiz(); karakterleriCiz();
  if (b.dataset.kat) $('#karakter-listesi').scrollTop = 0;
});

$('#karakter-listesi').addEventListener('click', (e) => {
  if (e.target.closest('[data-yeni-cizim]')) return cizimAc();
  const tumu = e.target.closest('[data-tumu]');
  if (tumu) {
    const ids = tumKarakterler().filter((k) => k.kat === aktifKategori).map((k) => k.id);
    durum.secili = durum.secili.filter((id) => !ids.includes(id));
    if (tumu.dataset.tumu === 'sec') durum.secili.push(...ids);
  } else {
    const kart = e.target.closest('[data-kid]');
    if (!kart) return;
    const id = kart.dataset.kid;
    const i = durum.secili.indexOf(id);
    if (i >= 0) { durum.secili.splice(i, 1); ses.birak(); } else { durum.secili.push(id); ses.al(); }
  }
  sekmeleriCiz(); karakterleriCiz(); taslakKaydet();
});

$('#btn-sahneye').addEventListener('click', () => sahneAc());

// ---------------- 3. Sahne ----------------
function sahneAc() {
  if (!durum.ortamId) return ekranGoster('ortam');
  const o = ortamBul(durum.ortamId);
  durum.sahneBasladi = true;
  if (!durum.gezilen.includes(o.id)) durum.gezilen.push(o.id);
  ekranGoster('sahne');
  manzaraCiz(true);
  $('#sahne').classList.toggle('isimler-gizli', !durum.isimGoster);
  isikAyarla(!!durum.karanlik, false);
  jetonlariCiz(); alanlariCiz(); rafiCiz(); taslakKaydet();
}

// Ortam çizimi ve hava; yeniden oynatma da bunu kullanır (akışa ve taslağa yazmaz).
function manzaraCiz(yeniOrtam = true) {
  const o = ortamBul(durum.ortamId);
  if (yeniOrtam) {
    $('#manzara').innerHTML = ortamSvg(o);
    $('#sahne-adi').textContent = `${o.ikon} ${o.ad}`;
    ses.ortam(o);
  }
  havaKur({ gok: $('#gok'), tuval: $('#hava-tuval'), ortu: $('#hava-ortu'), sahne: $('#sahne') }, o, durum.havaI);
  $('#btn-hava').textContent = HAVALAR[durum.havaI].emoji;
  kumCiz(); tiyatroCiz();
}

function jetonHTML(kar) {
  return `<div class="govde" style="--olcek:${kar.olcek}"><span class="yuz-cevir"><span class="yuz">${gorsel(kar)}</span></span><span class="rozet"></span><span class="siddet"></span></div><div class="isim"></div>`;
}

function jetonGuncelle(el, k) {
  const kar = karakterBul(k.kid);
  const d = k.duygu ? duyguBul(k.duygu) : null;
  el.style.left = (k.x * 100).toFixed(2) + '%';
  el.style.top = (k.y * 100).toFixed(2) + '%';
  el.style.zIndex = Math.round(k.y * 1000);
  el.style.setProperty('--o', (k.boyut * (0.75 + 0.45 * k.y)).toFixed(3));
  el.classList.toggle('ters', !!k.ters);
  el.classList.toggle('secili', k.uid === seciliUid);
  if (d) {
    el.dataset.duygu = d.id;
    el.style.setProperty('--aura', d.renk);
    el.style.setProperty('--aura-guc', (0.25 + 0.15 * siddetOf(k)).toFixed(2));
  } else delete el.dataset.duygu;
  const olcer = el.querySelector('.siddet'), olcerHtml = d ? '<i class="dolu"></i>'.repeat(siddetOf(k)) + '<i></i>'.repeat(5 - siddetOf(k)) : '';
  if (olcer.innerHTML !== olcerHtml) olcer.innerHTML = olcerHtml;
  el.classList.toggle('guvende', !!guvenliAlanda(k));
  // Çizimli karakterler duygu ya da görünüm değişince yeniden çizilir.
  const cizimAnahtari = `${k.duygu || ''}|${k.gorunum ? JSON.stringify(k.gorunum) : ''}`;
  if (kar.cizim && el.dataset.cizilen !== cizimAnahtari) {
    el.dataset.cizilen = cizimAnahtari;
    el.querySelector('.yuz').innerHTML = karakterSvg(kar, k.duygu, k.gorunum);
  }
  balonGuncelle(el, k);
  const rozet = el.querySelector('.rozet');
  if (rozet.textContent !== (d ? d.emoji : '')) {
    rozet.textContent = d ? d.emoji : '';
    rozet.style.animation = 'none'; void rozet.offsetWidth; rozet.style.animation = '';
  }
  el.querySelector('.isim').innerHTML = (kar.id === 'ben' ? '⭐ ' : '') + kacis(k.isim || kar.ad) + (d ? ` <span class="duygu-ad">· ${duyguMetni(d, siddetOf(k))}</span>` : '');
  gucleriGoster(el, k);
  el.classList.toggle('konusan', !!rol && rol[rol.sira] === k.uid);
  baglariCizSonra();
}

function jetonEl(uid) { return $(`#karakter-katmani .jeton[data-uid="${uid}"]`); }

function jetonEkle(k, yeni = false) {
  const el = document.createElement('div');
  el.className = 'jeton' + (yeni ? ' yeni' : '');
  el.dataset.uid = k.uid;
  el.innerHTML = jetonHTML(karakterBul(k.kid));
  jetonGuncelle(el, k);
  $('#karakter-katmani').appendChild(el);
  return el;
}

// Kapıdan başka ortama giren karakterin "ortam" alanı dolar; alanı boş olanlar hikayeyle birlikte her ortamda görünür.
const gorunur = (k) => !k.ortam || k.ortam === durum.ortamId;

function jetonlariCiz() {
  $('#karakter-katmani').innerHTML = '';
  durum.sahnede.filter(gorunur).forEach((k) => jetonEkle(k));
  kapiRozetleri();
  onPlanlariKur();
  baglariCiz();
}

// Yeniden oynatmada jetonlar silinip yeniden çizilmez; yerleri değişir, böylece kayarak hareket ederler.
function jetonlariEsle() {
  const gorunen = durum.sahnede.filter(gorunur), uidler = new Set(gorunen.map((k) => k.uid));
  document.querySelectorAll('#karakter-katmani .jeton').forEach((el) => { if (!uidler.has(+el.dataset.uid)) el.remove(); });
  gorunen.forEach((k) => { const el = jetonEl(k.uid); if (el) jetonGuncelle(el, k); else jetonEkle(k, true); });
  kapiRozetleri();
}

function rafiCiz() {
  const kidler = [...new Set([...durum.secili, ...durum.sahnede.map((k) => k.kid)])];
  $('#raf-ogeler').innerHTML = kidler.length
    ? kidler.map((id) => {
      const kar = karakterBul(id), n = durum.sahnede.filter((k) => k.kid === id).length;
      return `<button class="raf-oge" data-kid="${id}" title="${kacis(kar.ad)}">${gorsel(kar)}<span class="adet">${n || ''}</span></button>`;
    }).join('')
    : '<div class="raf-bos">Henüz karakter seçmedik. ➕ ile ekleyebilirsin.</div>';
  $('.raf-ipucu').classList.toggle('gizli', durum.sahnede.length > 0 || !kidler.length);
}

function sahneRect() { return $('#sahne').getBoundingClientRect(); }

function rafUstunde(e) {
  const raf = $('#raf');
  if (raf.offsetParent === null) return false;
  const r = raf.getBoundingClientRect();
  return e.clientX >= r.left - 10 && e.clientX <= r.right + 10 && e.clientY >= r.top - 20 && e.clientY <= r.bottom + 10;
}

function karakteriSahneyeKoy(kid, x, y) {
  const k = { uid: durum.sayac++, kid, x, y, duygu: null, boyut: 1, ters: false, isim: '' };
  durum.sahnede.push(k);
  const el = jetonEkle(k, true);
  const kar = karakterBul(kid);
  akisEkle(`${kar.emoji} ${kar.ad} hikayeye katıldı`);
  rafSayilariniGuncelle();
  return [k, el];
}

// Sürükleme sürerken parmağın altındaki raf öğesi silinmesin diye raf yeniden çizilmez, yalnızca sayılar güncellenir.
function rafSayilariniGuncelle() {
  document.querySelectorAll('.raf-oge').forEach((b) => {
    b.querySelector('.adet').textContent = durum.sahnede.filter((k) => k.kid === b.dataset.kid).length || '';
  });
  $('.raf-ipucu').classList.toggle('gizli', durum.sahnede.length > 0);
}

function rafaKoy(uid) {
  const i = durum.sahnede.findIndex((k) => k.uid === uid);
  if (i < 0) return;
  const [k] = durum.sahnede.splice(i, 1);
  jetonEl(uid)?.remove();
  durum.baglar = durum.baglar.filter((g) => g.a !== uid && g.b !== uid);
  baglariCiz();
  if (seciliUid === uid) secimKaldir();
  const kar = karakterBul(k.kid);
  akisEkle(`${kar.emoji} ${k.isim || kar.ad} rafa döndü`);
  ses.birak(); rafiCiz();
}

// --- Kapılar: karakteri kapıya bırakmak onu öbür ortama gönderir, kapıya dokunmak oraya geçirir ---
const kapilar = () => [...document.querySelectorAll('#manzara .kapi')];

function kapiUstunde(e) {
  return kapilar().find((kapi) => {
    const r = kapi.getBoundingClientRect();
    return e.clientX >= r.left - 16 && e.clientX <= r.right + 16 && e.clientY >= r.top - 16 && e.clientY <= r.bottom + 16;
  }) || null;
}

function kapiVurgula(e) {
  const hedef = e && kapiUstunde(e);
  kapilar().forEach((kapi) => kapi.classList.toggle('hedef', kapi === hedef));
}

// Bir ortama birden çok kapıdan girilebiliyorsa (İki Ev) karakter geldiği evin kapısının önünde belirir.
function girisNoktasi(hedef, kaynakId) {
  return Array.isArray(hedef.giris) ? hedef.giris : hedef.giris[kaynakId] || Object.values(hedef.giris)[0];
}

// Ortam çizimindeki (1600x900, xMidYMax slice) bir noktayı sahne oranına çevirir.
function svgNokta([x, y]) {
  const r = sahneRect(), s = Math.max(r.width / 1600, r.height / 900);
  return [((r.width - 1600 * s) / 2 + x * s) / r.width, (r.height - 900 * s + y * s) / r.height];
}

function kapiRozetleri() {
  document.querySelectorAll('#manzara .kapi').forEach((kapi) => {
    const n = durum.sahnede.filter((k) => k.ortam === kapi.dataset.kapi).length;
    const rozet = kapi.querySelector('.kapi-rozet');
    rozet.classList.toggle('bos', !n);
    rozet.querySelector('text').textContent = `👣 ${n}`;
    kapi.querySelector('title')?.remove();
    kapi.insertAdjacentHTML('afterbegin', `<title>${ortamBul(kapi.dataset.kapi).ad}: kapıya dokun ya da karakteri kapıya bırak</title>`);
  });
}

function kapidanGir(k, kapi) {
  const hedef = ortamBul(kapi.dataset.kapi), kaynak = durum.ortamId;
  const el = jetonEl(k.uid);
  if (seciliUid === k.uid) secimKaldir();
  const r = kapi.getBoundingClientRect(), sr = sahneRect();
  k.x = (r.left + r.width / 2 - sr.left) / sr.width;
  k.y = (r.bottom - sr.top) / sr.height;
  if (el) { el.classList.add('kapidan-giriyor'); el.style.left = (k.x * 100) + '%'; el.style.top = (k.y * 100) + '%'; }
  kapi.classList.add('acik');
  ses.ton(420, 260, 0.22, 0.08, 'triangle');
  setTimeout(() => {
    el?.remove();
    kapi.classList.remove('acik', 'hedef');
    // Öbür tarafta kapının önünde, birbirinin üstüne binmeden belirsin.
    const [gx, gy] = svgNokta(girisNoktasi(hedef, kaynak));
    k.ortam = hedef.id;
    k.guvende = false;
    k.saklandi = null;
    baglariCizSonra();
    k.x = sinirla(gx + (Math.random() - 0.5) * 0.12, 0.05, 0.95);
    k.y = sinirla(gy + Math.random() * 0.06, 0.15, 0.95);
    const kar = karakterBul(k.kid);
    akisEkle(`🚪 ${kar.emoji} ${k.isim || kar.ad} kapıdan geçti → ${hedef.ad}`);
    kapiRozetleri();
  }, 450);
}

function kapidanGec(hedefId) {
  const hedef = ortamBul(hedefId);
  // Kapıdan geçen yalnızca bakış açısıdır; burada duran karakterler burada kalır.
  durum.sahnede.forEach((k) => { if (!k.ortam) k.ortam = durum.ortamId; });
  durum.ortamId = hedef.id;
  secimKaldir();
  ses.ton(380, 240, 0.25, 0.09, 'triangle');
  akisEkle(`🚪 Kapıdan geçildi: ${hedef.ikon} ${hedef.ad}`);
  sahneAc();
  const m = $('#manzara');
  m.classList.remove('gecis'); void m.offsetWidth; m.classList.add('gecis');
}

$('#manzara').addEventListener('click', (e) => {
  if (Date.now() - sonPinch < 500) return;
  const kapi = e.target.closest('.kapi');
  if (kapi) return kapidanGec(kapi.dataset.kapi);
  const dolap = e.target.closest('[data-dolap]');
  if (dolap) dolapAc(dolap.dataset.dolap, dolap);
});

// --- Malzeme dolabı (hastane): dokununca o kategorideki nesneler seçilir, dolabın önünde sahneye gelir ---
let dolapKat = null, dolapNokta = [0.5, 0.75];

function dolapAc(kat, dolapEl) {
  dolapKat = kat;
  const r = dolapEl.getBoundingClientRect(), sr = sahneRect();
  dolapNokta = [(r.left + r.width / 2 - sr.left) / sr.width, Math.min(0.93, (r.bottom - sr.top) / sr.height + 0.08)];
  secimKaldir();
  ses.sec();
  dolapCiz();
  $('#dolap-penceresi').classList.remove('gizli');
  akisEkle('✚ Malzeme dolabı açıldı');
}

function dolapCiz() {
  $('#dolap-raflari').innerHTML = KARAKTERLER.filter((k) => k.kat === dolapKat).map((k) => {
    const n = durum.sahnede.filter((s) => s.kid === k.id).length;
    return `<button class="dolap-oge" data-kid="${k.id}" title="${kacis(k.aciklama || k.ad)}"><span class="e">${gorsel(k)}</span><span class="ad">${kacis(k.ad)}</span><span class="adet">${n || ''}</span></button>`;
  }).join('');
}

function dolapKapat() { $('#dolap-penceresi').classList.add('gizli'); }

$('#dolap-penceresi').addEventListener('click', (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-dolap="kapat"]')) return dolapKapat();
  const oge = e.target.closest('.dolap-oge');
  if (!oge) return;
  const kid = oge.dataset.kid, kar = karakterBul(kid);
  if (!durum.secili.includes(kid)) durum.secili.push(kid);
  // Seçilenler üst üste binmesin diye dolabın önünden odanın ortasına doğru sıralanır (5'li sıralar).
  const sira = durum.sahnede.filter((k) => karakterBul(k.kid).kat === dolapKat).length;
  const yon = dolapNokta[0] > 0.5 ? -1 : 1;
  const x = sinirla(dolapNokta[0] + yon * (sira % 5) * 0.07, 0.05, 0.95), y = sinirla(dolapNokta[1] + (Math.floor(sira / 5) % 3) * 0.06, 0.2, 0.95);
  karakteriSahneyeKoy(kid, x, y);
  ses.al();
  rafiCiz(); dolapCiz();
  bildir(`${kar.emoji} ${kar.ad} dolaptan alındı`);
});

// --- Güvenli yer: çocuk parmağıyla bir alanın çevresini çizer; içine konan karakterler "güvende" sayılır ---
const alanlarBurada = () => durum.alanlar.filter((a) => a.ortam === durum.ortamId);

function noktaIcinde([x, y], noktalar) {
  let ic = false;
  for (let i = 0, j = noktalar.length - 1; i < noktalar.length; j = i++) {
    const [xi, yi] = noktalar[i], [xj, yj] = noktalar[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ic = !ic;
  }
  return ic;
}

function guvenliAlanda(k) {
  if (!gorunur(k)) return null;
  return alanlarBurada().find((a) => noktaIcinde([k.x, k.y], a.noktalar)) || null;
}

// Noktalar ara noktalardan geçen yumuşak bir eğriyle kapatılır (viewBox 0–1000).
function alanYolu(noktalar, kapali = true) {
  const p = noktalar.map(([x, y]) => [x * 1000, y * 1000]);
  if (p.length < 3) return p.length ? `M${p[0][0]} ${p[0][1]}` + p.slice(1).map(([x, y]) => ` L${x} ${y}`).join('') : '';
  const orta = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  if (!kapali) return `M${p[0][0]} ${p[0][1]}` + p.slice(1).map(([x, y]) => ` L${x} ${y}`).join('');
  let d = `M${orta(p[p.length - 1], p[0]).join(' ')}`;
  p.forEach((n, i) => { d += ` Q${n[0]} ${n[1]} ${orta(n, p[(i + 1) % p.length]).join(' ')}`; });
  return d + 'Z';
}

// Etiket, içindeki karakterlerin üstüne binmesin diye alanın sol (yer yoksa sağ) kenarının dışına konur.
function etiketYeri(noktalar) {
  const xs = noktalar.map((n) => n[0]), ys = noktalar.map((n) => n[1]);
  const y = (Math.min(...ys) + Math.max(...ys)) / 2;
  const solda = Math.min(...xs) > 0.16;
  return { x: solda ? Math.min(...xs) : Math.max(...xs), y, donus: solda ? 'translate(calc(-100% - 6px), -50%)' : 'translate(6px, -50%)' };
}

function alanlariCiz() {
  const alanlar = alanlarBurada();
  $('#alan-katmani').innerHTML = alanlar.map((a) => `<path class="guvenli-alan" d="${alanYolu(a.noktalar)}"/>`).join('');
  $('#alan-etiketleri').innerHTML = alanlar.map((a) => {
    const { x, y, donus } = etiketYeri(a.noktalar);
    return `<button class="alan-etiket" data-alan-id="${a.id}" style="left:${x * 100}%;top:${y * 100}%;transform:${donus}" title="Silmek için dokunun">🛡️ Güvenli yer</button>`;
  }).join('');
  document.querySelectorAll('#karakter-katmani .jeton').forEach((el) => {
    const k = durum.sahnede.find((x) => x.uid === +el.dataset.uid);
    if (k) el.classList.toggle('guvende', !!guvenliAlanda(k));
  });
}

// Karakter bırakıldığında güvenli yere girip çıktığı akışa yazılır.
function guvenlikDenetle(k) {
  const simdi = !!guvenliAlanda(k);
  if (simdi === !!k.guvende) return;
  k.guvende = simdi;
  const kar = karakterBul(k.kid);
  akisEkle(`🛡️ ${kar.emoji} ${karakterAdi(k)} ${simdi ? 'güvenli yere girdi' : 'güvenli yerden çıktı'}`);
}

let cizilen = null;
function cizimModu(ac) {
  $('#cizim-ortusu').classList.toggle('gizli', !ac);
  $('#btn-guvenli').classList.toggle('aktif', ac);
  cizilen = null;
  if (ac) { secimKaldir(); ses.sec(); } else alanlariCiz();
}

$('#btn-guvenli').addEventListener('click', () => cizimModu($('#cizim-ortusu').classList.contains('gizli')));
$('#btn-cizim-vazgec').addEventListener('click', (e) => { e.stopPropagation(); cizimModu(false); });
$('#btn-cizim-vazgec').addEventListener('pointerdown', (e) => e.stopPropagation());

$('#cizim-ortusu').addEventListener('pointerdown', (e) => {
  if (cizilen) return;
  e.preventDefault();
  try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* yakalanamazsa da çizim sürer */ }
  const r = sahneRect();
  cizilen = { pid: e.pointerId, noktalar: [[(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]] };
});

$('#cizim-ortusu').addEventListener('pointermove', (e) => {
  if (!cizilen || e.pointerId !== cizilen.pid) return;
  const r = sahneRect(), n = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  const son = cizilen.noktalar[cizilen.noktalar.length - 1];
  if (Math.hypot((n[0] - son[0]) * r.width, (n[1] - son[1]) * r.height) < 9) return;
  cizilen.noktalar.push(n);
  let yol = $('#alan-katmani .ciziliyor');
  if (!yol) { $('#alan-katmani').insertAdjacentHTML('beforeend', '<path class="ciziliyor"/>'); yol = $('#alan-katmani .ciziliyor'); }
  yol.setAttribute('d', alanYolu(cizilen.noktalar, false));
});

function cizimBitir(e) {
  if (!cizilen || e.pointerId !== cizilen.pid) return;
  const r = sahneRect();
  // Kabaca alan hesabı (ekran pikseli²): çok küçük ya da kapanmamış çizgiler alan sayılmaz.
  const p = cizilen.noktalar.map(([x, y]) => [x * r.width, y * r.height]);
  let alan = 0;
  p.forEach(([x1, y1], i) => { const [x2, y2] = p[(i + 1) % p.length]; alan += x1 * y2 - x2 * y1; });
  alan = Math.abs(alan) / 2;
  if (p.length < 6 || alan < 2500) {
    $('#alan-katmani .ciziliyor')?.remove();
    cizilen = null;
    bildir('🛡️ Biraz daha büyük bir alan çiz');
    return;
  }
  const yuvarla = (v) => Math.round(sinirla(v, 0, 1) * 1000) / 1000;
  durum.alanlar.push({ id: Date.now().toString(36), ortam: durum.ortamId, noktalar: cizilen.noktalar.map(([x, y]) => [yuvarla(x), yuvarla(y)]) });
  cizimModu(false);
  ses.cime();
  const icindekiler = durum.sahnede.filter((k) => guvenliAlanda(k));
  icindekiler.forEach((k) => { k.guvende = true; });
  bildir('🛡️ Güvenli yer hazır');
  akisEkle(`🛡️ Güvenli yer çizildi${icindekiler.length ? `: içinde ${icindekiler.map(karakterAdi).join(', ')}` : ''}`);
}
$('#cizim-ortusu').addEventListener('pointerup', cizimBitir);
$('#cizim-ortusu').addEventListener('pointercancel', cizimBitir);

$('#alan-etiketleri').addEventListener('click', (e) => {
  const b = e.target.closest('[data-alan-id]');
  if (!b || !confirm('Bu güvenli yer silinsin mi?')) return;
  durum.alanlar = durum.alanlar.filter((a) => a.id !== b.dataset.alanId);
  durum.sahnede.forEach((k) => { if (k.guvende && !guvenliAlanda(k)) k.guvende = false; });
  alanlariCiz();
  akisEkle('🛡️ Güvenli yer silindi');
});

// --- Seçim ve duygu paneli ---
function karakterSec(uid) {
  const onceki = seciliUid;
  seciliUid = uid;
  if (onceki) { const el = jetonEl(onceki); if (el) el.classList.remove('secili'); }
  const k = durum.sahnede.find((x) => x.uid === uid);
  if (!k) return secimKaldir();
  jetonEl(uid)?.classList.add('secili');
  duyguPaneliCiz(k);
  // Panel, seçilen karakterin üstünü kapatmasın diye karakter aşağıdaysa ekranın üstünde açılır.
  $('#duygu-paneli').classList.toggle('ustte', k.y > 0.5);
  $('#duygu-paneli').classList.remove('gizli');
  $('#ekran-sahne').classList.add('secim-var');
}

function secimKaldir() {
  if (seciliUid) jetonEl(seciliUid)?.classList.remove('secili');
  seciliUid = null;
  $('#duygu-paneli').classList.add('gizli');
  $('#ekran-sahne').classList.remove('secim-var');
}

// --- Boyut: düğmeler, kaydırıcı, iki parmak ve fare tekerleği aynı işlevi kullanır ---
function boyutAyarla(k, deger) {
  k.boyut = sinirla(deger, ...BOYUT_ARALIGI);
  const el = jetonEl(k.uid);
  if (el) jetonGuncelle(el, k);
  if (k.uid === seciliUid) boyutGostergesi(k);
}

function boyutGostergesi(k) {
  $('#boyut').value = Math.round(k.boyut * 100);
  $('#boyut-yazi').textContent = Math.round(k.boyut * 100) + '%';
}

$('#boyut').addEventListener('input', (e) => {
  const k = durum.sahnede.find((x) => x.uid === seciliUid);
  if (k) boyutAyarla(k, e.target.value / 100);
});
$('#boyut').addEventListener('change', taslakKaydet);

$('#karakter-katmani').addEventListener('wheel', (e) => {
  const el = e.target.closest('.jeton');
  const k = el && durum.sahnede.find((x) => x.uid === +el.dataset.uid);
  if (!k) return;
  e.preventDefault();
  boyutAyarla(k, k.boyut * (e.deltaY < 0 ? 1.08 : 1 / 1.08));
  taslakKaydet();
}, { passive: false });

// Duygunun şiddeti 1–5 arasıdır; seçilmemişse orta (3) sayılır.
const SIDDETLER = ['Çok az', 'Biraz', 'Orta', 'Çok', 'Çok çok'];
const siddetOf = (k) => k.siddet || 3;
const duyguMetni = (d, s) => (s === 3 ? d.ad : `${SIDDETLER[s - 1]} ${d.ad.toLocaleLowerCase('tr')}`);

function siddetCiz(k) {
  const d = duyguBul(k.duygu);
  $('#siddet-satiri').classList.toggle('gizli', !d);
  if (!d) return;
  $('#siddet-dugmeleri').innerHTML = SIDDETLER.map((ad, i) => {
    const boy = 8 + i * 4;
    return `<button class="siddet-btn ${siddetOf(k) === i + 1 ? 'aktif' : ''}" data-siddet="${i + 1}" style="--renk:${d.renk}"><b style="width:${boy}px;height:${boy}px"></b>${ad}</button>`;
  }).join('');
}

$('#siddet-dugmeleri').addEventListener('click', (e) => {
  const b = e.target.closest('[data-siddet]');
  const k = durum.sahnede.find((x) => x.uid === seciliUid);
  const d = k && duyguBul(k.duygu);
  if (!b || !d) return;
  k.siddet = +b.dataset.siddet;
  // Şiddet, o karakterin bu duygu için son kaydına işlenir; raporda duygu sayısı değişmez.
  const son = [...durum.duyguGecmisi].reverse().find((x) => x.kid === k.kid && x.kim === karakterAdi(k));
  if (son && son.duygu === d.id) son.siddet = k.siddet;
  jetonGuncelle(jetonEl(k.uid), k);
  ses.ton(400 + k.siddet * 90, 500 + k.siddet * 110, 0.08, 0.07);
  akisEkle(`${karakterBul(k.kid).emoji} ${karakterAdi(k)} → ${duyguMetni(d, k.siddet)} ${d.emoji} (${k.siddet}/5)`);
  siddetCiz(k);
});

function duyguPaneliCiz(k) {
  siddetCiz(k);
  const kar = karakterBul(k.kid);
  boyutGostergesi(k);
  $('#duygu-kim').textContent = `${kar.emoji} ${k.isim || kar.ad}`;
  $('#duygu-soru').innerHTML = ik('nasıl hissediyor?');
  $('[data-arac="gorunum"]').classList.toggle('gizli', kar.cizim?.tur !== 'insan');
  $('#duygu-dugmeleri').innerHTML = DUYGULAR.map((d) => `
    <button class="duygu-btn ${k.duygu === d.id ? 'aktif' : ''}" data-duygu="${d.id}" style="--renk:${d.renk}"><span class="e">${d.emoji}</span>${ik(d.ad)}</button>`).join('');
}

function duyguAyarla(k, duyguId) {
  k.duygu = k.duygu === duyguId ? null : duyguId;
  k.siddet = k.duygu ? 3 : null;
  const el = jetonEl(k.uid);
  jetonGuncelle(el, k);
  const kar = karakterBul(k.kid), d = duyguBul(k.duygu);
  if (d) {
    durum.duyguGecmisi.push({ t: Date.now(), kim: k.isim || kar.ad, kid: k.kid, duygu: d.id, siddet: 3 });
    ses.zil();
    bildir(`${kar.emoji} ${k.isim || kar.ad}: ${d.ad} ${d.emoji}`);
    akisEkle(`${kar.emoji} ${k.isim || kar.ad} → ${d.ad} ${d.emoji}`);
  } else {
    ses.sec();
    akisEkle(`${kar.emoji} ${k.isim || kar.ad} → duygu kaldırıldı`);
  }
  if (seciliUid === k.uid) duyguPaneliCiz(k);
}

$('#duygu-dugmeleri').addEventListener('click', (e) => {
  const b = e.target.closest('[data-duygu]');
  const k = durum.sahnede.find((x) => x.uid === seciliUid);
  if (b && k) duyguAyarla(k, b.dataset.duygu);
});

$('.arac-dugmeleri').addEventListener('click', (e) => {
  const b = e.target.closest('[data-arac]');
  const k = durum.sahnede.find((x) => x.uid === seciliUid);
  if (!b || !k) return;
  const kar = karakterBul(k.kid);
  switch (b.dataset.arac) {
    case 'buyut': boyutAyarla(k, k.boyut * 1.2); ses.ton(500, 700, 0.1, 0.08); break;
    case 'kucult': boyutAyarla(k, k.boyut / 1.2); ses.ton(700, 500, 0.1, 0.08); break;
    case 'cevir': k.ters = !k.ters; ses.sec(); break;
    case 'isim': {
      const ad = prompt('Bu karakterin adı ne olsun?', k.isim || kar.ad);
      if (ad === null) return;
      const temiz = ad.trim().slice(0, 30);
      k.isim = temiz === kar.ad ? '' : temiz;
      if (k.isim) akisEkle(`${kar.emoji} ${kar.ad} karakterine “${k.isim}” adı verildi`);
      duyguPaneliCiz(k);
      break;
    }
    case 'kaldir': return rafaKoy(k.uid);
    case 'kapat': return secimKaldir();
    case 'konus': ses.sec(); return konusmaAc(k);
    case 'gorunum': ses.sec(); return gorunumAc(k);
    case 'bag': return bagModuAc(k);
    case 'guc': ses.sec(); return gucAc(k);
  }
  jetonGuncelle(jetonEl(k.uid), k);
  taslakKaydet();
});

// --- Parmakla sürükleme (birden çok parmak aynı anda çalışır) ---
function suruklemeBaslat(e, k, el, hazirHareket) {
  const r = sahneRect();
  suruklemeler.set(e.pointerId, {
    k, el, x0: e.clientX, y0: e.clientY, sonX: e.clientX, sonY: e.clientY, hareket: hazirHareket, pinch: null,
    dx: hazirHareket ? 0 : e.clientX - (r.left + k.x * r.width),
    dy: hazirHareket ? -Math.min(60, r.height * 0.06) : e.clientY - (r.top + k.y * r.height),
  });
  el.classList.add('tutuluyor');
  if (hazirHareket) $('#ekran-sahne').classList.add('surukleniyor');
}

// Bir karakter tutulurken sahnenin herhangi bir yerine ikinci parmak değerse iki parmakla boyutlandırma başlar.
let sonPinch = 0;
$('#sahne').addEventListener('pointerdown', (e) => {
  const tutan = [...suruklemeler.values()].find((s) => s.k && !s.pinch);
  if (!tutan || e.pointerType === 'mouse') return;
  e.stopPropagation(); e.preventDefault();
  tutan.pinch = { pid: e.pointerId, x: e.clientX, y: e.clientY, b0: tutan.k.boyut,
    d0: Math.max(20, Math.hypot(e.clientX - tutan.sonX, e.clientY - tutan.sonY)) };
  tutan.hareket = true;
  suruklemeler.set(e.pointerId, { ikinci: tutan });
  sonPinch = Date.now();
}, true);

function pinchGuncelle(s) {
  const d = Math.hypot(s.pinch.x - s.sonX, s.pinch.y - s.sonY);
  boyutAyarla(s.k, s.pinch.b0 * (d / s.pinch.d0));
  sonPinch = Date.now();
}

function pinchBitir(s) {
  const r = sahneRect();
  suruklemeler.delete(s.pinch.pid);
  s.pinch = null;
  // Kalan parmak sürüklemeye kaldığı yerden devam etsin diye tutma noktası yeniden hesaplanır.
  s.dx = s.sonX - (r.left + s.k.x * r.width);
  s.dy = s.sonY - (r.top + s.k.y * r.height);
  const kar = karakterBul(s.k.kid);
  akisEkle(`${kar.emoji} ${s.k.isim || kar.ad} boyutu: %${Math.round(s.k.boyut * 100)}`);
}

$('#karakter-katmani').addEventListener('pointerdown', (e) => {
  const el = e.target.closest('.jeton');
  if (!el) return;
  e.preventDefault();
  ses.baslat();
  const k = durum.sahnede.find((x) => x.uid === +el.dataset.uid);
  if (!k) return;
  suruklemeBaslat(e, k, el, false);
  suruklemeler.get(e.pointerId).balon = !!e.target.closest('.balon');
  ses.al();
});

$('#raf-ogeler').addEventListener('pointerdown', (e) => {
  const b = e.target.closest('.raf-oge');
  if (!b) return;
  ses.baslat();
  rafBekleyen.set(e.pointerId, { kid: b.dataset.kid, x0: e.clientX, y0: e.clientY, el: b });
});

window.addEventListener('pointermove', (e) => {
  const bekleyen = rafBekleyen.get(e.pointerId);
  if (bekleyen) {
    const dx = e.clientX - bekleyen.x0, dy = e.clientY - bekleyen.y0;
    // Dokunmatikte yatay hareket rafı kaydırır; yukarı çekiş karakteri sahneye alır.
    if (dy < -10 || (e.pointerType === 'mouse' && Math.hypot(dx, dy) > 8)) {
      rafBekleyen.delete(e.pointerId);
      const r = sahneRect();
      const [k, el] = karakteriSahneyeKoy(bekleyen.kid, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
      suruklemeBaslat(e, k, el, true);
      konumGuncelle(e, suruklemeler.get(e.pointerId));
      ses.al();
    }
    return;
  }
  const s = suruklemeler.get(e.pointerId);
  if (!s) return;
  if (s.ikinci) { s.ikinci.pinch.x = e.clientX; s.ikinci.pinch.y = e.clientY; return pinchGuncelle(s.ikinci); }
  s.sonX = e.clientX; s.sonY = e.clientY;
  if (s.pinch) return pinchGuncelle(s);
  if (!s.hareket && Math.hypot(e.clientX - s.x0, e.clientY - s.y0) > 7) {
    s.hareket = true;
    $('#ekran-sahne').classList.add('surukleniyor');
  }
  if (s.hareket) konumGuncelle(e, s);
});

function konumGuncelle(e, s) {
  const r = sahneRect();
  s.k.x = sinirla((e.clientX - s.dx - r.left) / r.width, 0.03, 0.97);
  s.k.y = sinirla((e.clientY - s.dy - r.top) / r.height, 0.12, 0.97);
  jetonGuncelle(s.el, s.k);
  $('#raf').classList.toggle('hedef', rafUstunde(e));
  kapiVurgula(e);
}

function suruklemeBitir(e) {
  const bekleyen = rafBekleyen.get(e.pointerId);
  if (bekleyen) {
    rafBekleyen.delete(e.pointerId);
    // Raftaki karaktere dokunmak da onu sahnenin ortasına yerleştirir.
    if (e.type === 'pointerup' && Math.hypot(e.clientX - bekleyen.x0, e.clientY - bekleyen.y0) < 10) {
      const [k, el] = karakteriSahneyeKoy(bekleyen.kid, 0.25 + Math.random() * 0.5, 0.6 + Math.random() * 0.22);
      // Rastgele yer bir eşyanın arkasına denk gelirse karakter görünmez kalmasın: önce başka yerler denenir,
      // olmazsa eşyanın önüne alınır.
      for (let i = 0; i < 12 && saklandigiYer(k); i++) {
        k.x = 0.2 + Math.random() * 0.6; k.y = 0.45 + Math.random() * 0.33;
        jetonGuncelle(el, k);
      }
      if (saklandigiYer(k)) {
        const onunde = Math.max(...[...document.querySelectorAll('#karakter-katmani .on-plan-kat')].map((d) => +d.style.zIndex).filter((z) => z > k.y * 1000));
        k.y = sinirla(onunde / 1000 + 0.03, 0.12, 0.95);
        jetonGuncelle(el, k);
      }
      ses.birak(); taslakKaydet();
    }
    return;
  }
  const s = suruklemeler.get(e.pointerId);
  if (!s) return;
  if (s.ikinci) { pinchBitir(s.ikinci); taslakKaydet(); return; }
  if (s.pinch) pinchBitir(s);
  suruklemeler.delete(e.pointerId);
  s.el.classList.remove('tutuluyor');
  if (!suruklemeler.size) $('#ekran-sahne').classList.remove('surukleniyor');
  const rafta = rafUstunde(e);
  $('#raf').classList.remove('hedef');
  const kapi = kapiUstunde(e);
  if (s.hareket) {
    if (rafta && e.type === 'pointerup') { kapiVurgula(null); return rafaKoy(s.k.uid); }
    if (kapi && e.type === 'pointerup') return kapidanGir(s.k, kapi);
    kapiVurgula(null);
    guvenlikDenetle(s.k);
    saklanmaDenetle(s.k);
    kareEkle();
    ses.birak(); taslakKaydet();
    return;
  }
  if (e.type !== 'pointerup') return;
  // Bağ kurma: ilk karakter seçildikten sonra dokunulan ikinci karakter.
  if (bagModu) {
    const a = bagModu;
    bagModuKapat();
    if (a !== s.k.uid) bagPenceresiAc(a, s.k.uid);
    return;
  }
  // Ses kaydı olan balona dokunmak kaydı çalar.
  if (s.balon && s.k.soz?.ses) return sesCal(s.k);
  if (seciliUid === s.k.uid) {
    // Seçili karaktere tekrar dokunmak sıradaki duyguya geçirir.
    const i = DUYGULAR.findIndex((d) => d.id === s.k.duygu);
    duyguAyarla(s.k, DUYGULAR[(i + 1) % DUYGULAR.length].id);
  } else {
    karakterSec(s.k.uid); ses.sec();
  }
}
window.addEventListener('pointerup', suruklemeBitir);
window.addEventListener('pointercancel', suruklemeBitir);

$('#sahne').addEventListener('pointerdown', (e) => {
  ses.baslat();
  fenerTasi(e);
  if (!e.target.closest('.jeton')) { secimKaldir(); if (bagModu && !e.target.closest('#bag-ipucu')) bagModuKapat(); }
});
$('#sahne').addEventListener('contextmenu', (e) => e.preventDefault());

// --- Konuşma / düşünce balonu: danışman yazar, istenirse çocuğun sesi kaydedilir ---
const karakterAdi = (k) => k.isim || karakterBul(k.kid).ad;

function balonGuncelle(el, k) {
  const metin = k.soz?.metin || '', sesVar = !!k.soz?.ses;
  let b = el.querySelector('.balon');
  if (!metin && !sesVar) { b?.remove(); return; }
  const anahtar = `${k.soz.tur}|${metin}|${sesVar}`;
  if (b?.dataset.anahtar === anahtar) return;
  if (!b) { b = document.createElement('div'); el.prepend(b); }
  b.dataset.anahtar = anahtar;
  b.className = 'balon' + (k.soz.tur === 'dusun' ? ' dusun' : '');
  b.innerHTML = kacis(metin) + (sesVar ? '<span class="ses-ikon">🔊</span>' : '');
}

let calanSes = null;
function sesCal(k) {
  calanSes?.pause();
  const b = jetonEl(k.uid)?.querySelector('.balon');
  calanSes = sesOynat(k.soz.ses, k.soz.efekt);
  b?.classList.add('caliyor');
  const bitti = () => b?.classList.remove('caliyor');
  calanSes.addEventListener('ended', bitti);
  calanSes.addEventListener('pause', bitti);
  calanSes.play().catch(bitti);
}

let konusanUid = null, taslakSoz = null, kaydedici = null, kayitZamanlayici = 0;
const mikrofonVar = () => !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);

function konusmaAc(k) {
  konusanUid = k.uid;
  taslakSoz = { tur: 'soyle', metin: '', ses: null, efekt: 'normal', ...(k.soz || {}) };
  $('#konusma-metin').value = taslakSoz.metin;
  konusmaCiz();
  $('#konusma-penceresi').classList.remove('gizli');
}

function konusmaCiz() {
  const k = durum.sahnede.find((x) => x.uid === konusanUid);
  const dusun = taslakSoz.tur === 'dusun';
  $('#konusma-baslik').textContent = `${dusun ? '💭' : '💬'} ${k ? karakterAdi(k) : ''} ${dusun ? 'ne düşünüyor?' : 'ne söylüyor?'}`;
  document.querySelectorAll('#konusma-tur .secim').forEach((b) => b.classList.toggle('aktif', b.dataset.tur === taslakSoz.tur));
  $('#konusma-metin').placeholder = dusun ? 'Karakter içinden ne düşünüyor? Çocuğun sözlerini yazın…' : 'Karakter ne söylüyor? Çocuğun sözlerini yazın…';
  $('#btn-kayit-ses').classList.toggle('gizli', !mikrofonVar());
  $('#btn-kayit-ses').classList.toggle('kayitta', !!kaydedici);
  $('#btn-kayit-ses').textContent = kaydedici ? '⏹ Kaydı bitir' : (taslakSoz.ses ? '🎙️ Yeniden kaydet' : '🎙️ Sesini kaydet');
  $('#btn-dinle').classList.toggle('gizli', !taslakSoz.ses || !!kaydedici);
  $('#btn-ses-sil').classList.toggle('gizli', !taslakSoz.ses || !!kaydedici);
  $('#ses-durum').textContent = kaydedici ? '● Kaydediliyor… (en çok 30 sn)'
    : !mikrofonVar() ? `Bu adreste tarayıcı mikrofona izin vermiyor. Tablette ses kaydı için https://${location.hostname}:${(+location.port || 5052) + 1} adresini açın (Kullanim.txt).`
      : taslakSoz.ses ? 'Ses kaydı hazır' : '';
  efektleriCiz();
}

async function sesKaydiBaslat() {
  let akim;
  try { akim = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch {
    $('#ses-durum').textContent = 'Mikrofona izin verilmedi.';
    return;
  }
  const parcalar = [];
  kaydedici = new MediaRecorder(akim);
  kaydedici.addEventListener('dataavailable', (e) => { if (e.data.size) parcalar.push(e.data); });
  kaydedici.addEventListener('stop', () => {
    akim.getTracks().forEach((t) => t.stop());
    const tur = kaydedici.mimeType || 'audio/webm';
    kaydedici = null;
    clearTimeout(kayitZamanlayici);
    ses.seviyeAyarla(SES_SEVIYELERI[sesSeviyeI][0]);
    const okuyucu = new FileReader();
    okuyucu.onload = () => { if (taslakSoz) { taslakSoz.ses = okuyucu.result; konusmaCiz(); } };
    okuyucu.readAsDataURL(new Blob(parcalar, { type: tur }));
  });
  // Ortam sesleri kayda karışmasın.
  ses.seviyeAyarla(0);
  kaydedici.start();
  kayitZamanlayici = setTimeout(sesKaydiDurdur, 30000);
  konusmaCiz();
}

function sesKaydiDurdur() { if (kaydedici?.state === 'recording') kaydedici.stop(); }

function konusmaKapat() {
  sesKaydiDurdur();
  calanSes?.pause();
  $('#konusma-penceresi').classList.add('gizli');
  konusanUid = null; taslakSoz = null;
}

function konusmaBitir(kaldir) {
  const k = durum.sahnede.find((x) => x.uid === konusanUid);
  if (!k || kaydedici) return konusmaKapat();
  const metin = kaldir ? '' : $('#konusma-metin').value.trim().slice(0, 160);
  const sesKaydi = kaldir ? null : taslakSoz.ses;
  const ad = karakterAdi(k), onceki = k.soz;
  if (!metin && !sesKaydi) {
    k.soz = null;
    if (onceki) akisEkle(`💬 ${ad}: balon kaldırıldı`);
  } else {
    k.soz = { tur: taslakSoz.tur, metin, ses: sesKaydi, efekt: sesKaydi ? taslakSoz.efekt || 'normal' : 'normal' };
    if (!onceki || onceki.metin !== metin || onceki.tur !== k.soz.tur || onceki.ses !== sesKaydi || (onceki.efekt || 'normal') !== k.soz.efekt) {
      const dusun = k.soz.tur === 'dusun';
      durum.sozler.push({ t: Date.now(), kim: ad, kid: k.kid, tur: k.soz.tur, metin, sesVar: !!sesKaydi, efekt: k.soz.efekt });
      akisEkle(`${dusun ? '💭' : '💬'} ${ad} ${dusun ? 'düşünüyor' : 'diyor ki'}: “${metin || 'ses kaydı'}”${sesKaydi && metin ? ' 🎙️' : ''}`);
    }
  }
  const el = jetonEl(k.uid);
  if (el) jetonGuncelle(el, k);
  ses.birak();
  konusmaKapat();
  taslakKaydet();
}

$('#konusma-tur').addEventListener('click', (e) => {
  const b = e.target.closest('[data-tur]');
  if (b && taslakSoz) { taslakSoz.tur = b.dataset.tur; ses.sec(); konusmaCiz(); }
});
$('#btn-kayit-ses').addEventListener('click', () => (kaydedici ? sesKaydiDurdur() : sesKaydiBaslat()));
$('#btn-dinle').addEventListener('click', () => { calanSes?.pause(); calanSes = sesOynat(taslakSoz.ses, taslakSoz.efekt); calanSes.play().catch(() => {}); });
$('#btn-ses-sil').addEventListener('click', () => { calanSes?.pause(); taslakSoz.ses = null; konusmaCiz(); });
$('#konusma-penceresi').addEventListener('click', (e) => {
  const b = e.target.closest('[data-konus]');
  if (e.target === e.currentTarget || b?.dataset.konus === 'kapat') return konusmaKapat();
  if (b) konusmaBitir(b.dataset.konus === 'kaldir');
});

// --- Görünüm: çocuk insan karakterlerini kendine / ailesine benzetebilir ---
const GORUNUM = {
  sacRenk: ['#2b1d16', '#5d4037', '#8d5a34', '#d9a441', '#c0562a', '#9e9e9e', '#7e57c2', '#ec407a'],
  sac: [['kisa', 'Kısa'], ['dikensi', 'Dikenli'], ['kivircik', 'Kıvırcık'], ['uzun', 'Uzun'], ['bob', 'Küt'], ['orgu', 'Örgülü'],
    ['atkuyrugu', 'At kuyruğu'], ['topuz', 'Topuz'], ['kel', 'Saçsız'], ['basortu', 'Başörtüsü']],
  kiyafet: ['#ef5350', '#ff9800', '#ffca28', '#66bb6a', '#26a69a', '#42a5f5', '#5c6bc0', '#ab47bc', '#f06292', '#8d6e63', '#eceff1', '#37474f'],
  altTip: [['pantolon', 'Pantolon'], ['etek', 'Etek'], ['elbise', 'Elbise']],
};

let gorunumUid = null, gorunumOnce = null;

function gorunumDegeri(k, alan) {
  const c = karakterBul(k.kid).cizim, g = k.gorunum || {};
  if (alan in g) return g[alan];
  if (alan === 'gozluk') return (c.ek || []).includes('gozluk');
  if (alan === 'tekerlekli') return (c.ek || []).includes('tekerlekli');
  if (alan === 'altTip') return c.altTip?.replace(/^uzun/, '').toLowerCase() || 'pantolon';
  if (alan === 'sacRenk' && c.sac === 'basortu') return c.basortu;
  return c[alan];
}

function gorunumAc(k) {
  gorunumUid = k.uid;
  gorunumOnce = k.gorunum ? { ...k.gorunum } : null;
  $('#gorunum-baslik').textContent = `🎨 ${karakterAdi(k)} nasıl görünsün?`;
  gorunumCiz();
  $('#gorunum-penceresi').classList.remove('gizli');
}

function gorunumCiz() {
  const k = durum.sahnede.find((x) => x.uid === gorunumUid);
  if (!k) return;
  const deger = (alan) => gorunumDegeri(k, alan);
  const renkSatiri = (baslik, alan, renkler) => `<div class="gorunum-satir"><h4>${baslik}</h4><div class="renkler">${renkler.map((r) =>
    `<button class="renk-btn ${deger(alan) === r ? 'aktif' : ''}" style="--r:${r}" data-alan="${alan}" data-deger="${r}" aria-label="${baslik}"></button>`).join('')}</div></div>`;
  const secimSatiri = (baslik, alan, secenekler) => `<div class="gorunum-satir"><h4>${baslik}</h4><div class="secim-grup">${secenekler.map(([id, ad]) =>
    `<button class="secim ${deger(alan) === id ? 'aktif' : ''}" data-alan="${alan}" data-deger="${id}">${ad}</button>`).join('')}</div></div>`;
  $('#gorunum-onizleme').innerHTML = karakterSvg(karakterBul(k.kid), k.duygu, k.gorunum);
  $('#gorunum-secenekler').innerHTML =
    renkSatiri('Ten rengi', 'ten', TEN) +
    secimSatiri('Saç', 'sac', GORUNUM.sac) +
    renkSatiri(deger('sac') === 'basortu' ? 'Başörtüsü rengi' : 'Saç rengi', 'sacRenk', GORUNUM.sacRenk) +
    renkSatiri('Üst kıyafet', 'ust', GORUNUM.kiyafet) +
    secimSatiri('Alt kıyafet', 'altTip', GORUNUM.altTip) +
    (deger('altTip') === 'elbise' ? '' : renkSatiri('Alt kıyafet rengi', 'alt', GORUNUM.kiyafet)) +
    `<div class="gorunum-satir"><h4>Ekler</h4><div class="secim-grup">
      <button class="secim ${deger('gozluk') ? 'aktif' : ''}" data-alan="gozluk" data-deger="ac-kapa">👓 Gözlük</button>
      <button class="secim ${deger('tekerlekli') ? 'aktif' : ''}" data-alan="tekerlekli" data-deger="ac-kapa">♿ Tekerlekli sandalye</button>
    </div></div>`;
}

$('#gorunum-secenekler').addEventListener('click', (e) => {
  const b = e.target.closest('[data-alan]');
  const k = durum.sahnede.find((x) => x.uid === gorunumUid);
  if (!b || !k) return;
  const { alan } = b.dataset;
  let deger = b.dataset.deger;
  if (deger === 'ac-kapa') deger = !gorunumDegeri(k, alan);
  k.gorunum = { ...(k.gorunum || {}), [alan]: deger };
  if (alan === 'altTip' && deger === 'pantolon') k.gorunum.altTip = 'pantolon';
  ses.sec();
  jetonGuncelle(jetonEl(k.uid), k);
  gorunumCiz();
});

function gorunumKapat(iptal) {
  const k = durum.sahnede.find((x) => x.uid === gorunumUid);
  if (k && iptal) { k.gorunum = gorunumOnce; jetonGuncelle(jetonEl(k.uid), k); }
  if (k && !iptal && JSON.stringify(k.gorunum) !== JSON.stringify(gorunumOnce)) {
    akisEkle(`🎨 ${karakterBul(k.kid).emoji} ${karakterAdi(k)} karakterinin görünümü değiştirildi`);
  }
  $('#gorunum-penceresi').classList.add('gizli');
  gorunumUid = null;
  taslakKaydet();
}

$('#gorunum-penceresi').addEventListener('click', (e) => {
  const b = e.target.closest('[data-gorunum]');
  if (e.target === e.currentTarget || b?.dataset.gorunum === 'kapat') return gorunumKapat(true);
  if (!b) return;
  if (b.dataset.gorunum === 'tamam') return gorunumKapat(false);
  const k = durum.sahnede.find((x) => x.uid === gorunumUid);
  if (k) { k.gorunum = null; jetonGuncelle(jetonEl(k.uid), k); gorunumCiz(); ses.sec(); }
});

// --- Hikaye şeridi: sahnenin o anki görüntüsü katman katman bir tuvale çizilir ---
const svgResmi = (metin) => new Promise((tamam, hata) => {
  const r = new Image();
  r.onload = () => tamam(r);
  r.onerror = hata;
  r.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(metin);
});

function svgMetni(svg, w, h, hazirla) {
  const kopya = svg.cloneNode(true);
  kopya.setAttribute('width', w);
  kopya.setAttribute('height', h);
  hazirla?.(kopya);
  return new XMLSerializer().serializeToString(kopya);
}

function yuvarlakKutu(c, x, y, w, h, r) {
  c.beginPath();
  if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h);
}

function yaziSatirlari(c, metin, genislik) {
  const satirlar = [];
  let satir = '';
  for (const kelime of metin.split(/\s+/)) {
    const dene = satir ? satir + ' ' + kelime : kelime;
    if (c.measureText(dene).width > genislik && satir) { satirlar.push(satir); satir = kelime; } else satir = dene;
  }
  if (satir) satirlar.push(satir);
  return satirlar;
}

async function jetonuCiz(c, el, sr) {
  const yer = (x) => { const b = x.getBoundingClientRect(); return { x: b.left - sr.left, y: b.top - sr.top, w: b.width, h: b.height }; };
  const emoji = getComputedStyle(document.documentElement).getPropertyValue('--emoji');
  const yazi = getComputedStyle(document.body).fontFamily;
  if (el.dataset.duygu) {
    const g = yer(el.querySelector('.govde')), cx = g.x + g.w / 2, cy = g.y + g.h / 2, rr = Math.max(g.w, g.h) * 0.62;
    const renk = el.style.getPropertyValue('--aura').trim();
    const gr = c.createRadialGradient(cx, cy, 0, cx, cy, rr);
    gr.addColorStop(0, renk + '99'); gr.addColorStop(1, renk + '00');
    c.fillStyle = gr; c.beginPath(); c.arc(cx, cy, rr, 0, 7); c.fill();
  }
  const yuz = el.querySelector('.yuz'), svg = yuz.querySelector('svg'), resim = yuz.querySelector('img');
  const y = yer(svg || resim || yuz);
  c.save();
  if (el.classList.contains('ters')) { c.translate(2 * y.x + y.w, 0); c.scale(-1, 1); }
  if (svg) {
    c.drawImage(await svgResmi(svgMetni(svg, y.w, y.h)), y.x, y.y, y.w, y.h);
  } else if (resim) {
    c.drawImage(resim, y.x, y.y, y.w, y.h);
  } else {
    c.font = `${parseFloat(getComputedStyle(yuz).fontSize)}px ${emoji}`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(yuz.textContent, y.x + y.w / 2, y.y + y.h / 2);
  }
  c.restore();
  const rozet = el.querySelector('.rozet');
  if (rozet.textContent) {
    const z = yer(rozet);
    c.fillStyle = '#fff'; c.beginPath(); c.arc(z.x + z.w / 2, z.y + z.h / 2, z.w / 2, 0, 7); c.fill();
    c.font = `${z.h * 0.62}px ${emoji}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#000';
    c.fillText(rozet.textContent, z.x + z.w / 2, z.y + z.h / 2);
  }
  const olcer = el.querySelector('.siddet');
  if (olcer.children.length) {
    const z = yer(olcer);
    c.fillStyle = 'rgba(255,255,255,.85)'; yuvarlakKutu(c, z.x, z.y, z.w, z.h, 3); c.fill();
    for (const i of olcer.children) {
      const p = yer(i);
      c.fillStyle = getComputedStyle(i).backgroundColor; yuvarlakKutu(c, p.x, p.y, p.w, p.h, 2); c.fill();
    }
  }
  const isim = el.querySelector('.isim');
  if (isim.offsetParent) {
    const z = yer(isim);
    c.fillStyle = 'rgba(255,255,255,.92)'; yuvarlakKutu(c, z.x, z.y, z.w, z.h, z.h / 2); c.fill();
    c.font = `800 ${parseFloat(getComputedStyle(isim).fontSize)}px ${yazi}, ${emoji}`;
    c.fillStyle = '#23324a'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(isim.textContent, z.x + z.w / 2, z.y + z.h / 2 + 1, z.w - 8);
  }
  const balon = el.querySelector('.balon');
  if (balon) {
    const z = yer(balon), dusun = balon.classList.contains('dusun');
    const fs = parseFloat(getComputedStyle(balon).fontSize);
    c.fillStyle = dusun ? '#f4f0ff' : '#fff';
    yuvarlakKutu(c, z.x, z.y, z.w, z.h, dusun ? z.h / 2 : 18); c.fill();
    if (dusun) { c.strokeStyle = '#b39ddb'; c.lineWidth = 3; c.setLineDash([6, 5]); c.stroke(); c.setLineDash([]); }
    c.beginPath();
    if (dusun) { c.arc(z.x + z.w / 2, z.y + z.h + 10, 6, 0, 7); c.arc(z.x + z.w / 2 - 6, z.y + z.h + 22, 4, 0, 7); }
    else { c.moveTo(z.x + z.w / 2 - 11, z.y + z.h - 1); c.lineTo(z.x + z.w / 2 + 11, z.y + z.h - 1); c.lineTo(z.x + z.w / 2, z.y + z.h + 11); }
    c.fill();
    c.font = `${dusun ? 'italic ' : ''}800 ${fs}px ${yazi}, ${emoji}`;
    c.fillStyle = '#23324a'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const satirlar = yaziSatirlari(c, balon.textContent, z.w - 24);
    const sh = fs * 1.3, y0 = z.y + z.h / 2 - ((satirlar.length - 1) * sh) / 2;
    satirlar.forEach((s, i) => c.fillText(s, z.x + z.w / 2, y0 + i * sh));
  }
}

async function sahneGoruntusu(enGenis = 1280) {
  const sahne = $('#sahne'), sr = sahne.getBoundingClientRect();
  const olcek = Math.min(2, enGenis / sr.width);
  const tuval = document.createElement('canvas');
  tuval.width = Math.round(sr.width * olcek); tuval.height = Math.round(sr.height * olcek);
  const c = tuval.getContext('2d');
  c.scale(olcek, olcek);
  // Gökyüzü: bulutların CSS ile kayan o anki konumu kopyaya yazılır.
  const gok = $('#gok svg');
  const bulutlar = [...gok.querySelectorAll('.bulut')].map((b) => getComputedStyle(b).transform);
  c.drawImage(await svgResmi(svgMetni(gok, sr.width, sr.height, (kopya) => {
    kopya.querySelectorAll('.bulut').forEach((b, i) => { if (bulutlar[i] !== 'none') b.setAttribute('transform', bulutlar[i]); });
  })), 0, 0);
  const icMekan = sahne.classList.contains('ic-mekan');
  const parcaciklar = () => c.drawImage($('#hava-tuval'), 0, 0, sr.width, sr.height);
  if (icMekan) parcaciklar();
  c.filter = getComputedStyle($('#manzara')).filter || 'none';
  // Boş kapı rozetleri yalnızca CSS ile gizlendiği için kopyadan çıkarılır.
  c.drawImage(await svgResmi(svgMetni($('#manzara svg'), sr.width, sr.height, (kopya) => {
    kopya.querySelectorAll('.kapi-rozet.bos').forEach((r) => r.remove());
  })), 0, 0);
  c.filter = 'none';
  if (kumBurada()) c.drawImage($('#kum-tuval'), 0, 0, sr.width, sr.height);
  if (!icMekan) parcaciklar();
  const ortu = getComputedStyle($('#hava-ortu')).backgroundColor;
  if (ortu && ortu !== 'rgba(0, 0, 0, 0)') { c.fillStyle = ortu; c.fillRect(0, 0, sr.width, sr.height); }
  for (const a of alanlarBurada()) {
    // alanYolu 0–1000 ölçeğinde çizer; noktalar önceden küçültülerek yol ekran pikseline denk getirilir.
    const yol = new Path2D(alanYolu(a.noktalar.map(([x, y]) => [x * sr.width / 1000, y * sr.height / 1000])));
    c.fillStyle = 'rgba(255,228,120,.32)'; c.fill(yol);
    c.strokeStyle = '#ffb300'; c.lineWidth = 5; c.setLineDash([14, 9]); c.lineJoin = 'round';
    c.stroke(yol);
    c.setLineDash([]);
  }
  document.querySelectorAll('#alan-etiketleri .alan-etiket').forEach((et) => {
    const b = et.getBoundingClientRect(), x = b.left - sr.left, y = b.top - sr.top;
    c.fillStyle = 'rgba(255,248,225,.95)'; yuvarlakKutu(c, x, y, b.width, b.height, b.height / 2); c.fill();
    c.font = `800 ${parseFloat(getComputedStyle(et).fontSize)}px ${getComputedStyle(document.body).fontFamily}, ${getComputedStyle(document.documentElement).getPropertyValue('--emoji')}`;
    c.fillStyle = '#8d5a00'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(et.textContent, x + b.width / 2, y + b.height / 2 + 1);
  });
  if (durum.baglar.length) c.drawImage(await svgResmi(svgMetni($('#bag-katmani'), sr.width, sr.height)), 0, 0);
  // Karakterler ve önlerindeki eşyalar (saklanma) derinlik sırasıyla çizilir.
  const filtre = getComputedStyle($('#karakter-katmani')).filter || 'none';
  const manzaraFiltre = getComputedStyle($('#manzara')).filter || 'none';
  const ogeler = [...document.querySelectorAll('#karakter-katmani .jeton, #karakter-katmani .on-plan-kat')].sort((a, b) => a.style.zIndex - b.style.zIndex);
  for (const el of ogeler) {
    if (el.classList.contains('on-plan-kat')) {
      c.filter = manzaraFiltre;
      c.drawImage(await svgResmi(svgMetni(el.querySelector('svg'), sr.width, sr.height)), 0, 0);
    } else {
      c.filter = filtre;
      await jetonuCiz(c, el, sr);
    }
  }
  c.filter = 'none';
  if (durum.karanlik) {
    const kr = $('#karanlik'), fx = parseFloat(kr.style.getPropertyValue('--fx')) || sr.width / 2, fy = parseFloat(kr.style.getPropertyValue('--fy')) || sr.height / 2;
    const yc = Math.min(sr.width, sr.height) * 0.17, g = c.createRadialGradient(fx, fy, 0, fx, fy, yc);
    g.addColorStop(0, 'rgba(255,240,180,.08)'); g.addColorStop(0.55, 'rgba(255,240,180,.04)'); g.addColorStop(1, 'rgba(4,6,18,.93)');
    c.fillStyle = g; c.fillRect(0, 0, sr.width, sr.height);
  }
  return tuval.toDataURL('image/jpeg', 0.72);
}

let anAliniyor = false;
$('#btn-an').addEventListener('click', async () => {
  if (anAliniyor) return;
  anAliniyor = true;
  ses.ton(1500, 700, 0.07, 0.09, 'square');
  const flas = $('#flas');
  flas.classList.remove('patla'); void flas.offsetWidth; flas.classList.add('patla');
  try {
    const resim = await sahneGoruntusu();
    durum.anlar.push({ id: Date.now().toString(36), t: Date.now(), resim, etiket: '', not: '', ortam: durum.ortamId, hava: HAVALAR[durum.havaI].id });
    seritCiz();
    if (cocukSerbest()) galeriyeEkle();
    bildir(cocukSerbest() ? '📸 Resmin “Benim hikayelerim”e kondu' : `📸 An kaydedildi (${durum.anlar.length})`);
    akisEkle(`📸 Hikaye şeridine an eklendi (#${durum.anlar.length})`);
  } catch (hata) {
    console.error(hata);
    bildir('⚠️ Fotoğraf alınamadı');
  }
  anAliniyor = false;
});

const ETIKETLER = [['bas', 'Başlangıç'], ['orta', 'Gelişme'], ['son', 'Son']];
const etiketAdi = (id) => ETIKETLER.find((e) => e[0] === id)?.[1] || '';

function seritCiz() {
  $('#serit-sayac').textContent = durum.anlar.length;
  $('#serit').innerHTML = durum.anlar.map((a, i) => `
    <div class="serit-kart" data-an="${a.id}">
      ${a.resim ? `<img src="${a.resim}" alt="An ${i + 1}">` : '<p class="ipucu">Fotoğraf bu cihazda saklanamadı.</p>'}
      <div class="serit-alt"><span class="no">#${i + 1}</span><time>${sureYaz(a.t - durum.baslangic)}</time>
        ${ETIKETLER.map(([id, ad]) => `<button class="secim ${a.etiket === id ? 'aktif' : ''}" data-etiket="${id}">${ad}</button>`).join('')}
        <button class="sil" title="Bu anı sil">🗑</button>
        <select data-an-tema title="Bu anın teması"><option value="">🏷️ Tema</option>${TEMALAR.map((t) => `<option value="${t.id}" ${a.tema === t.id ? 'selected' : ''}>${t.ad}</option>`).join('')}</select>
        <input value="${kacis(a.not || '')}" maxlength="200" placeholder="Bu anda ne oluyor? (not)">
      </div>
    </div>`).join('');
}

$('#serit').addEventListener('click', (e) => {
  const kart = e.target.closest('[data-an]');
  const a = kart && durum.anlar.find((x) => x.id === kart.dataset.an);
  if (!a) return;
  const etiket = e.target.closest('[data-etiket]');
  if (etiket) {
    a.etiket = a.etiket === etiket.dataset.etiket ? '' : etiket.dataset.etiket;
    seritCiz(); taslakKaydet();
  } else if (e.target.closest('.sil') && confirm('Bu an hikaye şeridinden silinsin mi?')) {
    durum.anlar = durum.anlar.filter((x) => x !== a);
    seritCiz(); taslakKaydet();
  }
});
$('#serit').addEventListener('input', (e) => {
  const kart = e.target.closest('[data-an]');
  const a = kart && durum.anlar.find((x) => x.id === kart.dataset.an);
  if (a && e.target.matches('input')) { a.not = e.target.value; taslakKaydet(); }
});
$('#serit').addEventListener('change', (e) => {
  const kart = e.target.closest('[data-an]');
  const a = kart && durum.anlar.find((x) => x.id === kart.dataset.an);
  if (!a || !e.target.matches('[data-an-tema]')) return;
  a.tema = e.target.value;
  if (a.tema) akisEkle(`🏷️ An #${durum.anlar.indexOf(a) + 1} teması: ${temaBul(a.tema).ad}`); else taslakKaydet();
});

// --- Oturum raporu: yazdırılabilir / PDF olarak kaydedilebilir özet ---
function raporHTML() {
  const o = ortamBul(durum.ortamId);
  const tarih = new Date(durum.baslangic);
  const satir = (b, d) => `<tr><th>${b}</th><td>${d || '—'}</td></tr>`;
  const ortamlar = durum.gezilen.map(ortamBul).filter(Boolean).map((x) => `${x.ikon} ${x.ad}`).join(', ');
  const sayim = {};
  durum.duyguGecmisi.forEach((d) => { sayim[d.duygu] = (sayim[d.duygu] || 0) + 1; });
  const ortalama = (id) => {
    const s = durum.duyguGecmisi.filter((d) => d.duygu === id).map((d) => d.siddet || 3);
    return (s.reduce((a, b) => a + b, 0) / s.length).toLocaleString('tr-TR', { maximumFractionDigits: 1 });
  };
  const duygular = Object.entries(sayim).sort((a, b) => b[1] - a[1])
    .map(([id, n]) => { const d = duyguBul(id); return d ? `${d.emoji} ${d.ad} ×${n} <span class="siddet-rapor">(ort. ${ortalama(id)}/5)</span>` : ''; }).filter(Boolean).join(' · ');
  // Karakter başka ortamdaysa o ortamın güvenli yerlerine bakılır.
  const alandakiler = (a) => durum.sahnede.filter((k) => (k.ortam || durum.ortamId) === a.ortam && noktaIcinde([k.x, k.y], a.noktalar));
  const guvenliMi = (k) => durum.alanlar.some((a) => alandakiler(a).includes(k));
  const guvenliYerler = durum.alanlar.map((a, i) => {
    const ic = alandakiler(a).map(karakterAdi);
    return `<li><b>${i + 1}.</b> ${kacis(ortamBul(a.ortam)?.ad || '')}: ${ic.length ? `içinde ${kacis(ic.join(', '))}` : 'içinde kimse yok'}</li>`;
  }).join('');
  const karakterler = durum.sahnede.map((k) => {
    const kar = karakterBul(k.kid), d = duyguBul(k.duygu);
    const resim = kar.resim ? `<img class="mini" src="${kar.resim}" alt="">` : kar.cizim ? karakterSvg(kar, k.duygu, k.gorunum).replace('<svg ', '<svg class="mini" ') : `<span class="mini">${kar.emoji}</span>`;
    const yer = k.ortam ? ortamBul(k.ortam)?.ad : 'hikayeyle birlikte';
    const soz = k.soz && (k.soz.metin || k.soz.ses) ? `${k.soz.tur === 'dusun' ? '💭' : '💬'} “${kacis(k.soz.metin || 'ses kaydı')}”${k.soz.ses && k.soz.efekt && k.soz.efekt !== 'normal' ? ` <small>(${efektAdi(k.soz.efekt).toLocaleLowerCase('tr')} ses)</small>` : ''}` : '';
    return `<tr><td>${resim}</td><td><b>${kar.id === 'ben' ? '⭐ ' : ''}${kacis(karakterAdi(k))}</b>${k.isim ? ` <small>(${kacis(kar.ad)})</small>` : ''}
      ${kar.id === 'ben' ? '<br><small>Çocuğun kendisini temsil eden karakter</small>' : ''}${k.guc?.length ? `<br><small>✨ Güçleri: ${k.guc.map((g) => `${gucBul(g)?.emoji || ''} ${gucBul(g)?.ad || ''}`).join(', ')}</small>` : ''}</td>
      <td>${d ? `${d.emoji} ${duyguMetni(d, siddetOf(k))} <span class="siddet-rapor">(${siddetOf(k)}/5)</span>` : '—'}</td>
      <td>${kacis(yer || '')}${guvenliMi(k) ? '<br>🛡️ güvenli yerde' : ''}${k.saklandi ? `<br>🙈 ${kacis(k.saklandi)} arkasında saklanıyor` : ''}</td><td>${soz || '—'}</td></tr>`;
  }).join('');
  const anlar = durum.anlar.filter((a) => a.resim).map((a, i) => `<div class="an"><img src="${a.resim}" alt="An ${i + 1}">
    <p>${a.etiket ? `<span class="etiket">${etiketAdi(a.etiket)}</span>` : ''}${a.tema ? `<span class="etiket tema">${kacis(temaBul(a.tema)?.ad || '')}</span>` : ''}<b>#${i + 1}</b> · ${sureYaz(a.t - durum.baslangic)}${a.not ? ` — ${kacis(a.not)}` : ''}</p></div>`).join('');
  const sozler = durum.sozler.map((s) => `<li>${sureYaz(s.t - durum.baslangic)} · <b>${kacis(s.kim)}</b> ${s.tur === 'dusun' ? 'düşünüyor' : 'diyor ki'}: “${kacis(s.metin || 'ses kaydı')}”${s.sesVar ? ' 🎙️' : ''}</li>`).join('');
  const sorular = durum.sorulanlar.map((s) => `<li>${kacis(s)}</li>`).join('');
  const akis = durum.akis.map((a) => `<li>${sureYaz(a.t - durum.baslangic)} · ${kacis(a.m)}</li>`).join('');
  return `
    <h1>📖 Hikaye Modu — Oturum Raporu</h1>
    <p class="alt-baslik">Çocuk görüşmesi · oyun ve hikaye çalışması</p>
    <table>${satir('Danışan kodu', kacis($('#danisan-kod').value.trim()))}
      ${satir('Tarih', tarih.toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' }))}
      ${satir('Süre', `${Math.max(1, Math.round((Date.now() - durum.baslangic) / 60000))} dakika`)}
      ${satir('Ortamlar', ortamlar || (o ? `${o.ikon} ${o.ad}` : ''))}
      ${satir('Son hava durumu', `${HAVALAR[durum.havaI].emoji} ${HAVALAR[durum.havaI].ad}`)}
      ${satir('Seçilen duygular', duygular)}
      ${durum.senaryo ? satir('Senaryo', `${senaryoBul(durum.senaryo)?.ikon || ''} ${kacis(senaryoBul(durum.senaryo)?.ad || '')}`) : ''}
      ${durum.icHava.bas || durum.icHava.son ? satir('İç hava durumu', `Başta: ${icHavaBul(durum.icHava.bas) ? `${icHavaBul(durum.icHava.bas).emoji} ${icHavaBul(durum.icHava.bas).ad}` : '—'} → Sonda: ${icHavaBul(durum.icHava.son) ? `${icHavaBul(durum.icHava.son).emoji} ${icHavaBul(durum.icHava.son).ad}` : '—'}`) : ''}
      ${durum.hedef ? satir('Oturum hedefi', `${kacis(durum.hedef)}${durum.hedefDurumu ? ` <b>(${kacis(HEDEF_DURUMLARI[durum.hedefDurumu] || '')})</b>` : ''}`) : ''}
      ${durum.temalar.length ? satir('Temalar', durum.temalar.map((id) => kacis(temaBul(id)?.ad || '')).join(', ')) : ''}
      ${durum.dil && durum.dil !== 'tr' ? satir('Çocuğun dili', kacis(DILLER.find((d) => d.id === durum.dil)?.ad || '')) : ''}</table>
    <h2>Karakterler (hikayenin sonunda)</h2>
    ${karakterler ? `<table class="karakterler"><tr><th></th><th>Karakter</th><th>Duygu</th><th>Nerede</th><th>Son sözü</th></tr>${karakterler}</table>` : '<p>Sahnede karakter yok.</p>'}
    ${iliskiHaritasi()}
    ${guvenliYerler ? `<h2>Güvenli yerler</h2><ul>${guvenliYerler}</ul>` : ''}
    ${anlar ? `<h2>Hikaye şeridi</h2><div class="anlar">${anlar}</div>` : ''}
    ${sozler ? `<h2>Karakterlerin söyledikleri ve düşündükleri</h2><ol>${sozler}</ol>` : ''}
    ${durum.dilekler.length ? `<h2>Dilek sahneleri (şimdi → dilek)</h2>${durum.dilekler.map((d, i) => `<div class="dilek-rapor"><div class="cift">${d.simdi ? `<figure><img src="${d.simdi}" alt=""><figcaption>Şimdi</figcaption></figure>` : ''}${d.dilek ? `<figure><img src="${d.dilek}" alt=""><figcaption>Dilek</figcaption></figure>` : ''}</div>
      <p><b>${i + 1}.</b> ${sureYaz(d.t - durum.baslangic)} · ${d.farklar.length ? d.farklar.map(kacis).join('; ') : 'Değişiklik yapılmadı'}</p></div>`).join('')}` : ''}
    ${raporEkleri()}
    ${durum.bedenler.length ? `<h2>Beden haritası</h2><div class="bedenler">${durum.bedenler.map((b) => `<figure><img src="${b.resim}" alt=""><figcaption>${b.duygular.map((id) => `${duyguBul(id)?.emoji || ''} ${duyguBul(id)?.ad || ''}`).join(', ')}</figcaption></figure>`).join('')}</div>` : ''}
    ${durum.endiseler.length ? `<h2>Endişe kutusu</h2><ul>${durum.endiseler.map((x) => `<li>${sureYaz(x.t - durum.baslangic)} · ${x.nereye === 'canavar' ? '👾 canavara yedirildi' : '🔒 kutuya kilitlendi'}: “${kacis(x.metin)}”</li>`).join('')}</ul>` : ''}
    ${sorular ? `<h2>Sorulan sorular</h2><ul>${sorular}</ul>` : ''}
    <h2>Gözlem notları</h2><div class="notlar">${kacis($('#notlar').value.trim())}</div>
    ${akis ? `<h2>Oyun akışı</h2><ol class="akis-rapor">${akis}</ol>` : ''}
    <p class="gizlilik">Bu rapor gizli danışmanlık bilgisi içerir. Çocuğun gerçek adı yerine danışan kodu kullanılmıştır.
      Raporu yalnızca yetkili kişilerle paylaşın; hikayedeki karakterler ve sözler çocuğun iç dünyasına ait metaforlardır, tek başına yorumlanmamalıdır.</p>`;
}

$('#btn-rapor').addEventListener('click', async () => {
  const rapor = $('#rapor');
  rapor.className = '';
  rapor.innerHTML = raporHTML();
  await Promise.all([...rapor.querySelectorAll('img')].map((r) => r.decode().catch(() => {})));
  akisEkle('🖨️ Oturum raporu hazırlandı');
  window.print();
});

// --- Hava durumu ---
function havaDegistir() {
  const h = havaSonraki();
  durum.havaI = havaIndeks();
  $('#btn-hava').textContent = h.emoji;
  bildir(`${h.emoji} ${h.ad}`);
  akisEkle(`${h.emoji} Hava: ${h.ad}`);
}
$('#gok').addEventListener('click', (e) => { if (e.target.closest('.gok-dokun') && Date.now() - sonPinch > 500) havaDegistir(); });
$('#btn-hava').addEventListener('click', havaDegistir);

// --- Üst düğmeler ---
$('#btn-sahne-geri').addEventListener('click', () => ekranGoster('ortam'));
$('#btn-karakter-ekle').addEventListener('click', () => ekranGoster('karakter'));
$('#btn-isim').addEventListener('click', () => {
  durum.isimGoster = !durum.isimGoster;
  $('#sahne').classList.toggle('isimler-gizli', !durum.isimGoster);
  bildir(durum.isimGoster ? '🏷️ İsimler gösteriliyor' : '🏷️ İsimler gizlendi');
  taslakKaydet();
});
$('#btn-ses').addEventListener('click', () => {
  sesSeviyeI = (sesSeviyeI + 1) % SES_SEVIYELERI.length;
  const [v, ikon] = SES_SEVIYELERI[sesSeviyeI];
  ses.baslat(); ses.seviyeAyarla(v);
  $('#btn-ses').textContent = ikon;
  bildir(v === 0 ? '🔇 Sesler kapalı' : v < 0.5 ? '🔉 Sesler kısık' : '🔊 Sesler açık');
});
$('#btn-tam-ekran').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.().catch(() => {});
});
document.querySelectorAll('[data-git]').forEach((b) => b.addEventListener('click', () => ekranGoster(b.dataset.git)));

// ---------------- Rehber paneli ----------------
function rehberAc() { if (mod === 'ebeveyn') return ebeveynPanelAc(); $('#rehber-paneli').classList.add('acik'); $('#rehber-paneli').setAttribute('aria-hidden', 'false'); akisCiz(); }
function rehberKapat() { $('#ebeveyn-paneli')?.classList.remove('acik'); $('#rehber-paneli').classList.remove('acik'); $('#rehber-paneli').setAttribute('aria-hidden', 'true'); }
$('#btn-rehber').addEventListener('click', () => (document.querySelector('#rehber-paneli.acik, #ebeveyn-paneli.acik') ? rehberKapat() : rehberAc()));
$('#btn-rehber-kapat').addEventListener('click', rehberKapat);

$('#soru-kartlari').addEventListener('click', (e) => {
  const b = e.target.closest('.soru');
  if (!b) return;
  const s = b.dataset.soru;
  if (durum.sorulanlar.includes(s)) {
    durum.sorulanlar = durum.sorulanlar.filter((x) => x !== s);
    b.classList.remove('soruldu');
    taslakKaydet();
  } else {
    durum.sorulanlar.push(s);
    b.classList.add('soruldu');
    akisEkle(`💬 Soru: ${s}`);
    oku(s);
  }
});

function akisCiz() {
  $('#akis-sayac').textContent = durum.akis.length;
  $('#akis-listesi').innerHTML = durum.akis.map((a) => `<li><time>${sureYaz(a.t - durum.baslangic)}</time><span>${kacis(a.m)}</span></li>`).join('');
  const liste = $('#akis-listesi');
  liste.scrollTop = liste.scrollHeight;
}

$('#notlar').addEventListener('input', taslakKaydet);
$('#danisan-kod').addEventListener('input', taslakKaydet);

$('#btn-kaydet').addEventListener('click', async () => {
  const o = ortamBul(durum.ortamId);
  const veri = {
    kod: $('#danisan-kod').value.trim(), ortam: o.id, ortamAd: o.ad, hava: HAVALAR[durum.havaI].id,
    karakterler: durum.sahnede.map((k) => ({ ...k, ad: karakterBul(k.kid).ad, emoji: karakterBul(k.kid).emoji })),
    secili: durum.secili, akis: durum.akis, sorulanlar: durum.sorulanlar, not: $('#notlar').value,
    anlar: durum.anlar, sozler: durum.sozler, duyguGecmisi: durum.duyguGecmisi, gezilen: durum.gezilen, alanlar: durum.alanlar,
    baglar: durum.baglar, ozel: durum.ozel, kareler: durum.kareler, karanlik: durum.karanlik,
    senaryo: durum.senaryo, temalar: durum.temalar, icHava: durum.icHava, bedenler: durum.bedenler, endiseler: durum.endiseler,
    dilekler: durum.dilekler, kumIzleri: durum.kumIzleri, dil: durum.dil,
    kokler: durum.kokler, guvenliYer: durum.guvenliYer, roller: durum.roller, genogram: durum.genogram, genogramAyar: durum.genogramAyar, veli: durum.veli, perdeKapali: durum.perdeKapali,
    hedef: durum.hedef, hedefDurumu: durum.hedefDurumu, riskler: durum.riskler, riskNot: durum.riskNot,
    sosyal: durum.sosyal, sinif: durum.sinif,
    baslangic: durum.baslangic, sureDk: Math.round((Date.now() - durum.baslangic) / 60000), isimGoster: durum.isimGoster,
  };
  try {
    const y = await kayitIstek('api/kayitlar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(veri) });
    if (!y.ok) throw new Error(y.status);
    bildir('💾 Hikaye kaydedildi');
  } catch {
    bildir('⚠️ Kaydedilemedi — sunucu açık mı?');
  }
});

$('#btn-temizle').addEventListener('click', () => {
  if (!durum.sahnede.length || !confirm('Sahnedeki tüm karakterler rafa dönsün mü?')) return;
  durum.sahnede = [];
  durum.baglar = [];
  secimKaldir(); jetonlariCiz(); rafiCiz();
  akisEkle('🧹 Sahne temizlendi');
});

$('#btn-yeni').addEventListener('click', () => {
  if (!confirm('Yeni bir hikaye başlatılsın mı? Kaydedilmemiş notlar silinir.')) return;
  durumYukle(yeniDurum());
  try { localStorage.removeItem(taslakAnahtar()); } catch { /* yoksay */ }
  ekranGoster('ortam');
});

// ---------------- Kayıtlar ----------------
async function kayitlariAc() {
  $('#kayit-penceresi').classList.remove('gizli');
  const liste = $('#kayit-listesi');
  liste.innerHTML = '<p class="bos-mesaj">Yükleniyor…</p>';
  try {
    const y = await kayitIstek('api/kayitlar');
    if (!y.ok) throw new Error(y.status);
    const kayitlar = await y.json();
    liste.innerHTML = kayitlar.length
      ? kayitlar.map((k) => `<div class="kayit${k.tur === 'ev-gunlugu' ? ' ev-gunlugu' : ''}" data-id="${kacis(k.id)}" data-tur="${kacis(k.tur || '')}">
          <div class="bilgi"><b>${kacis(k.kod || 'Kodsuz')} · ${k.tur === 'ev-gunlugu' ? '🏠 Ev oyun günlüğü' : kacis(k.ortamAd || '')}</b>
          <small>${k.tarih ? new Date(k.tarih).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }) : ''} · ${k.tur === 'ev-gunlugu' ? `${k.gunlukSayisi || 0} ev oyunu` : `${k.karakterSayisi} karakter`}</small></div>
          ${k.kod ? `<button data-islem="izlem" data-kod="${kacis(k.kod)}" title="Bu danışan kodunun bütün oturumlarını karşılaştır">📈 İzlem</button>` : ''}
          <button data-islem="ac">Aç</button><button class="sil" data-islem="sil">Sil</button></div>`).join('')
      : '<p class="bos-mesaj">Henüz kayıtlı hikaye yok.</p>';
  } catch {
    liste.innerHTML = '<p class="bos-mesaj">Kayıtlara ulaşılamadı. Program Baslat.cmd ile açılmalı (kayıtlar parolalıysa parolayı girin).</p>';
  }
}

$('#kayit-listesi').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-islem]');
  if (!b) return;
  const id = b.closest('.kayit').dataset.id;
  if (b.dataset.islem === 'izlem') return izlemAc(b.dataset.kod);
  if (b.dataset.islem === 'sil') {
    if (!confirm('Bu kayıt kalıcı olarak silinsin mi?')) return;
    await kayitIstek('api/kayitlar/' + encodeURIComponent(id), { method: 'DELETE' }).catch(() => {});
    return kayitlariAc();
  }
  try {
    const y = await kayitIstek('api/kayitlar/' + encodeURIComponent(id));
    if (!y.ok) throw new Error(y.status);
    const veri = await y.json();
    if (veri.tur === 'ev-gunlugu') return evGunluguGoster(veri);
    durumYukle({ ...veri, ortamId: veri.ortam, sahneBasladi: true });
    $('#kayit-penceresi').classList.add('gizli');
    ses.baslat();
    sahneAc();
    bildir('📂 Hikaye açıldı');
  } catch {
    bildir('⚠️ Kayıt açılamadı');
  }
});

$('#btn-kayitlar').addEventListener('click', kayitlariAc);
$('#btn-kayitlar-giris').addEventListener('click', () => { ses.baslat(); kayitlariAc(); });
$('#btn-kayit-kapat').addEventListener('click', () => $('#kayit-penceresi').classList.add('gizli'));

// ---------------- Giriş ----------------
$('#btn-basla').addEventListener('click', () => {
  ses.baslat();
  durumYukle(yeniDurum());
  ekranGoster('ortam');
});

function devamGuncelle() {
  const t = taslakOku();
  $('#btn-devam').classList.toggle('gizli', !(t && t.ortamId));
}
$('#btn-devam').addEventListener('click', () => {
  const t = taslakOku();
  if (!t) return;
  ses.baslat();
  durumYukle(t);
  if (durum.sahneBasladi) sahneAc(); else ekranGoster('ortam');
});
devamGuncelle();

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!$('#konusma-penceresi').classList.contains('gizli')) return konusmaKapat();
  if (!$('#gorunum-penceresi').classList.contains('gizli')) return gorunumKapat(true);
  if (!$('#dolap-penceresi').classList.contains('gizli')) return dolapKapat();
  if (!$('#cizim-penceresi').classList.contains('gizli')) return cizimKapat();
  if (!$('#sakin-penceresi').classList.contains('gizli')) return sakinKapat();
  if (!$('#pin-penceresi').classList.contains('gizli')) return;
  if (!$('#kapanis').classList.contains('gizli')) return kapanisBitir();
  for (const id of ['senaryo', 'ichava', 'beden', 'endise', 'koruma', 'kok', 'guvenli', 'guc', 'rol', 'genogram', 'veli', 'kumanda', 'kisayol', 'kurulum', 'mod', 'yetiskin', 'galeri', 'gunluk', 'e-nasil', 'sosyal', 'erehberlik', 'evgunluk', 'hatirlat', 'cocuklar', 'erisim', 'sinif']) if (!$(`#${id}-penceresi`).classList.contains('gizli')) return $(`#${id}-penceresi`).classList.add('gizli');
  if (!$('#parola-penceresi').classList.contains('gizli')) { $('#parola-penceresi').classList.add('gizli'); parolaCevap?.(false); parolaCevap = null; return; }
  if (dilek) return dilekBitir(false);
  if (rol) return rolBitir();
  if (kokAktif) return kokKapat();
  if (seyirci) return seyirciModu(false);
  if (kumArac) return kumAracSec(kumArac);
  if (!$('#bag-penceresi').classList.contains('gizli')) return $('#bag-penceresi').classList.add('gizli');
  if (!$('#izlem-penceresi').classList.contains('gizli')) return $('#izlem-penceresi').classList.add('gizli');
  if (oynatiliyor) { oynatDur = true; return; }
  if (bagModu) return bagModuKapat();
  if (!$('#cizim-ortusu').classList.contains('gizli')) return cizimModu(false);
  secimKaldir(); rehberKapat(); $('#kayit-penceresi').classList.add('gizli');
});

// ================= Saklanma: eşyaların arkasına geçen karakterler =================
// Ortamdaki "on-plan" eşyalar karakter katmanına da konur. Derinlikleri (z) eşyanın tabanıdır; ayakları
// daha yukarıda olan karakter eşyanın arkasında kalır.
function onPlanlariKur() {
  const katman = $('#karakter-katmani');
  katman.querySelectorAll('.on-plan-kat').forEach((d) => d.remove());
  document.querySelectorAll('#manzara .on-plan').forEach((g) => {
    const d = document.createElement('div');
    d.className = 'on-plan-kat';
    d.dataset.taban = g.dataset.taban;
    d.dataset.ad = g.dataset.ad;
    d.innerHTML = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">${g.outerHTML}</svg>`;
    katman.appendChild(d);
  });
  onPlanSirala();
}

function onPlanSirala() {
  document.querySelectorAll('#karakter-katmani .on-plan-kat').forEach((d) => {
    d.style.zIndex = Math.round(svgNokta([0, +d.dataset.taban])[1] * 1000);
  });
}

window.addEventListener('resize', () => { onPlanSirala(); baglariCiz(); });

function saklandigiYer(k) {
  const el = jetonEl(k.uid);
  if (!el) return null;
  const z = Math.round(k.y * 1000), b = el.querySelector('.yuz').getBoundingClientRect();
  const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
  for (const d of document.querySelectorAll('#karakter-katmani .on-plan-kat')) {
    if (+d.style.zIndex <= z) continue;
    const r = d.querySelector('.on-plan').getBoundingClientRect();
    if (cx > r.left && cx < r.right && cy > r.top && cy < r.bottom) return d.dataset.ad;
  }
  return null;
}

function saklanmaDenetle(k) {
  const yer = saklandigiYer(k);
  if (yer === (k.saklandi || null)) return;
  const kar = karakterBul(k.kid);
  akisEkle(yer ? `🙈 ${kar.emoji} ${karakterAdi(k)} ${yer} arkasına saklandı` : `👀 ${kar.emoji} ${karakterAdi(k)} saklandığı yerden çıktı`);
  k.saklandi = yer;
  if (yer) bildir(`🙈 ${karakterAdi(k)} saklandı`);
}

// ================= Işığı kapat / el feneri =================
function isikAyarla(kapali, kaydet = true) {
  durum.karanlik = kapali;
  $('#sahne').classList.toggle('karanlik', kapali);
  $('#btn-isik').textContent = kapali ? '🔦' : '💡';
  $('#btn-isik').classList.toggle('aktif', kapali);
  $('#btn-isik').title = kapali ? 'Işığı aç' : 'Işığı kapat (el feneri)';
  if (!kaydet) return;
  ses.ton(kapali ? 520 : 300, kapali ? 260 : 620, 0.12, 0.08, 'square');
  bildir(kapali ? '🔦 Işıklar kapandı: parmağınla feneri gezdir' : '💡 Işıklar açıldı');
  akisEkle(kapali ? '🔦 Işıklar kapatıldı (el feneri)' : '💡 Işıklar açıldı');
}

function fenerTasi(e) {
  if (!durum.karanlik) return;
  const r = sahneRect(), k = $('#karanlik');
  k.style.setProperty('--fx', (e.clientX - r.left) + 'px');
  k.style.setProperty('--fy', (e.clientY - r.top) + 'px');
}

$('#btn-isik').addEventListener('click', () => isikAyarla(!durum.karanlik));
$('#sahne').addEventListener('pointermove', fenerTasi);

// ================= Kendi karakterini çiz =================
const CIZIM_RENKLERI = ['#212121', '#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#ec407a', '#6d4c41', '#90a4ae', '#ffffff', '#ffcc80'];
let cizgiler = [], cizgi = null, cizRenk = CIZIM_RENKLERI[0], cizKalin = 14, silgi = false;

function cizimAc() {
  cizgiler = []; cizgi = null; silgi = false;
  $('#ciz-ad').value = '';
  $('#ciz-renkler').innerHTML = CIZIM_RENKLERI.map((r) => `<button class="ciz-renk" data-renk="${r}" style="--r:${r}" title="${r}"></button>`).join('');
  cizAraclariGuncelle(); cizimYenile();
  $('#cizim-penceresi').classList.remove('gizli');
  ses.sec();
}

function cizimKapat() { $('#cizim-penceresi').classList.add('gizli'); cizgi = null; }

function cizAraclariGuncelle() {
  document.querySelectorAll('.ciz-renk').forEach((b) => b.classList.toggle('aktif', !silgi && b.dataset.renk === cizRenk));
  document.querySelectorAll('[data-kalin]').forEach((b) => b.classList.toggle('aktif', +b.dataset.kalin === cizKalin));
  $('[data-ciz="silgi"]').classList.toggle('aktif', silgi);
}

function cizgiCiz(c, g) {
  c.save();
  c.globalCompositeOperation = g.silgi ? 'destination-out' : 'source-over';
  c.strokeStyle = g.renk; c.fillStyle = g.renk; c.lineWidth = g.kalin; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath();
  if (g.noktalar.length === 1) { const [x, y] = g.noktalar[0]; c.arc(x, y, g.kalin / 2, 0, 7); c.fill(); }
  else { c.moveTo(...g.noktalar[0]); g.noktalar.slice(1).forEach((n) => c.lineTo(...n)); c.stroke(); }
  c.restore();
}

function cizimYenile() {
  const t = $('#ciz-tuval'), c = t.getContext('2d');
  c.clearRect(0, 0, t.width, t.height);
  cizgiler.forEach((g) => cizgiCiz(c, g));
}

function tuvalNoktasi(e) {
  const t = $('#ciz-tuval'), r = t.getBoundingClientRect();
  return [(e.clientX - r.left) * (t.width / r.width), (e.clientY - r.top) * (t.height / r.height)];
}

$('#ciz-tuval').addEventListener('pointerdown', (e) => {
  e.preventDefault();
  try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* yoksay */ }
  cizgi = { pid: e.pointerId, renk: cizRenk, kalin: silgi ? cizKalin * 1.8 : cizKalin, silgi, noktalar: [tuvalNoktasi(e)] };
  cizgiler.push(cizgi);
  cizgiCiz($('#ciz-tuval').getContext('2d'), cizgi);
});
$('#ciz-tuval').addEventListener('pointermove', (e) => {
  if (!cizgi || e.pointerId !== cizgi.pid) return;
  const n = tuvalNoktasi(e), son = cizgi.noktalar[cizgi.noktalar.length - 1];
  if (Math.hypot(n[0] - son[0], n[1] - son[1]) < 2) return;
  cizgi.noktalar.push(n);
  cizgiCiz($('#ciz-tuval').getContext('2d'), { ...cizgi, noktalar: [son, n] });
});
['pointerup', 'pointercancel'].forEach((t) => $('#ciz-tuval').addEventListener(t, () => { cizgi = null; }));

$('#cizim-penceresi').addEventListener('click', (e) => {
  const renk = e.target.closest('[data-renk]'), kalin = e.target.closest('[data-kalin]'), islem = e.target.closest('[data-ciz]')?.dataset.ciz;
  if (renk) { cizRenk = renk.dataset.renk; silgi = false; return cizAraclariGuncelle(); }
  if (kalin) { cizKalin = +kalin.dataset.kalin; return cizAraclariGuncelle(); }
  if (islem === 'silgi') { silgi = !silgi; return cizAraclariGuncelle(); }
  if (islem === 'geri') { cizgiler.pop(); return cizimYenile(); }
  if (islem === 'temizle') { if (cizgiler.length && confirm('Çizim silinsin mi?')) { cizgiler = []; cizimYenile(); } return; }
  if (islem === 'kapat') return cizimKapat();
  if (islem === 'kaydet') return cizimKaydet();
});

// Çizimin boş kenarları kırpılır, en çok 360 piksele küçültülür ve saydam PNG olarak saklanır.
function cizimKaydet() {
  const t = $('#ciz-tuval'), c = t.getContext('2d');
  const { data } = c.getImageData(0, 0, t.width, t.height);
  let x0 = t.width, y0 = t.height, x1 = -1, y1 = -1;
  for (let y = 0; y < t.height; y++) for (let x = 0; x < t.width; x++) {
    if (data[(y * t.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  if (x1 < 0) return bildir('🖍️ Önce bir şey çiz');
  const pay = 6; x0 = Math.max(0, x0 - pay); y0 = Math.max(0, y0 - pay); x1 = Math.min(t.width - 1, x1 + pay); y1 = Math.min(t.height - 1, y1 + pay);
  const w = x1 - x0 + 1, h = y1 - y0 + 1, olcek = Math.min(1, 360 / Math.max(w, h));
  const kirp = document.createElement('canvas');
  kirp.width = Math.round(w * olcek); kirp.height = Math.round(h * olcek);
  kirp.getContext('2d').drawImage(t, x0, y0, w, h, 0, 0, kirp.width, kirp.height);
  const ad = $('#ciz-ad').value.trim().slice(0, 24) || 'Benim karakterim';
  const id = 'ozel-' + Date.now().toString(36);
  durum.ozel.push({ id, ad, resim: kirp.toDataURL('image/png') });
  ozelKaydet(durum.ozel);
  if (!durum.secili.includes(id)) durum.secili.push(id);
  cizimKapat();
  ses.zil();
  bildir(`🖍️ ${ad} hazır!`);
  akisEkle(`🖍️ Çocuk kendi karakterini çizdi: ${ad}`);
  aktifKategori = 'ozel';
  sekmeleriCiz(); karakterleriCiz();
}

// ================= İlişki ipleri (aile / arkadaş haritası) =================
const BAG_TURLERI = [
  { id: 'yakin', ad: 'Yakın', emoji: '❤️', renk: '#43a047', stil: 'stroke-width:9' },
  { id: 'koruyan', ad: 'Koruyan', emoji: '🛡️', renk: '#1e88e5', stil: 'stroke-width:7;stroke-dasharray:20 8' },
  { id: 'uzak', ad: 'Uzak', emoji: '↔️', renk: '#90a4ae', stil: 'stroke-width:6;stroke-dasharray:3 14;stroke-linecap:round' },
  { id: 'catisma', ad: 'Çatışmalı', emoji: '⚡', renk: '#e53935', stil: 'stroke-width:5' },
  { id: 'kopuk', ad: 'Kopuk', emoji: '✂️', renk: '#6d4c41', stil: 'stroke-width:6' },
];
const bagTuru = (id) => BAG_TURLERI.find((t) => t.id === id) || BAG_TURLERI[0];
let bagCizimBekliyor = false, bagDuzenlenen = null;

function bagYolu(p, q, tur) {
  const [x1, y1] = p, [x2, y2] = q, d = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / d, uy = (y2 - y1) / d;
  if (tur === 'catisma') {
    const n = Math.max(4, Math.round(d / 22));
    let yol = `M${x1} ${y1}`;
    for (let i = 1; i < n; i++) { const t = i / n, s = i % 2 ? 9 : -9; yol += ` L${x1 + (x2 - x1) * t - uy * s} ${y1 + (y2 - y1) * t + ux * s}`; }
    return yol + ` L${x2} ${y2}`;
  }
  if (tur === 'kopuk') {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, b = Math.min(34, d / 4);
    return `M${x1} ${y1} L${mx - ux * b} ${my - uy * b} M${mx + ux * b} ${my + uy * b} L${x2} ${y2}`;
  }
  return `M${x1} ${y1} L${x2} ${y2}`;
}

function baglariCizSonra() {
  if (bagCizimBekliyor) return;
  bagCizimBekliyor = true;
  requestAnimationFrame(() => { bagCizimBekliyor = false; baglariCiz(); });
}

function baglariCiz() {
  const svg = $('#bag-katmani'), sr = sahneRect();
  if (!sr.width) return;
  svg.setAttribute('viewBox', `0 0 ${sr.width} ${sr.height}`);
  const merkez = (uid) => {
    const el = jetonEl(uid);
    if (!el) return null;
    const b = el.querySelector('.govde').getBoundingClientRect();
    return [Math.round(b.left - sr.left + b.width / 2), Math.round(b.top - sr.top + b.height / 2)];
  };
  svg.innerHTML = durum.baglar.map((g) => {
    const p = merkez(g.a), q = merkez(g.b);
    if (!p || !q) return '';
    const t = bagTuru(g.tur), yol = bagYolu(p, q, g.tur), mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    return `<g class="bag" data-bag="${g.id}"><path class="bag-zemin" d="${yol}"/><path d="${yol}" style="stroke:${t.renk};${t.stil}" fill="none" stroke-linejoin="round"/>
      <g transform="translate(${mx} ${my})"><circle r="17" fill="#fff" stroke="${t.renk}" stroke-width="3"/><text y="7" text-anchor="middle" font-size="18">${t.emoji}</text></g></g>`;
  }).join('');
}

function bagModuAc(k) {
  bagModu = k.uid;
  secimKaldir();
  $('#ekran-sahne').classList.add('bag-modu');
  $('#bag-ipucu-yazi').textContent = `🔗 ${karakterAdi(k)} kiminle bağlı? O karaktere dokun`;
  ses.sec();
}

function bagModuKapat() {
  bagModu = null;
  $('#ekran-sahne').classList.remove('bag-modu');
}

function bagPenceresiAc(a, b) {
  const ka = durum.sahnede.find((k) => k.uid === a), kb = durum.sahnede.find((k) => k.uid === b);
  if (!ka || !kb) return;
  bagDuzenlenen = { a, b };
  const var_ = durum.baglar.find((g) => (g.a === a && g.b === b) || (g.a === b && g.b === a));
  $('#bag-baslik').textContent = `🔗 ${karakterAdi(ka)} ↔ ${karakterAdi(kb)}`;
  $('#bag-turleri').innerHTML = BAG_TURLERI.map((t) => `<button class="bag-tur ${var_?.tur === t.id ? 'aktif' : ''}" data-tur="${t.id}" style="--renk:${t.renk}">
    <svg viewBox="0 0 120 30" width="120" height="30"><path d="${bagYolu([6, 15], [114, 15], t.id)}" style="stroke:${t.renk};${t.stil}" fill="none"/></svg><span>${t.emoji} ${t.ad}</span></button>`).join('');
  $('#btn-bag-sil').classList.toggle('gizli', !var_);
  $('#bag-penceresi').classList.remove('gizli');
  ses.sec();
}

$('#bag-penceresi').addEventListener('click', (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-bag-kapat]')) return $('#bag-penceresi').classList.add('gizli');
  const { a, b } = bagDuzenlenen || {};
  const ka = durum.sahnede.find((k) => k.uid === a), kb = durum.sahnede.find((k) => k.uid === b);
  if (!ka || !kb) return;
  const ayni = (g) => (g.a === a && g.b === b) || (g.a === b && g.b === a);
  if (e.target.closest('#btn-bag-sil')) {
    durum.baglar = durum.baglar.filter((g) => !ayni(g));
    akisEkle(`🔗 ${karakterAdi(ka)} ↔ ${karakterAdi(kb)} bağı silindi`);
  } else {
    const tb = e.target.closest('[data-tur]');
    if (!tb) return;
    const t = bagTuru(tb.dataset.tur), varolan = durum.baglar.find(ayni);
    if (varolan) varolan.tur = t.id; else durum.baglar.push({ id: Date.now().toString(36), a, b, tur: t.id });
    ses.zil();
    akisEkle(`🔗 ${karakterAdi(ka)} ↔ ${karakterAdi(kb)}: ${t.ad} ${t.emoji}`);
  }
  $('#bag-penceresi').classList.add('gizli');
  baglariCiz();
});

$('#bag-katmani').addEventListener('click', (e) => {
  const g = durum.baglar.find((x) => x.id === e.target.closest('[data-bag]')?.dataset.bag);
  if (g) bagPenceresiAc(g.a, g.b);
});
$('#btn-bag-vazgec').addEventListener('click', (e) => { e.stopPropagation(); bagModuKapat(); });

// Raporda: bağların listesi ve karakterlerin bir çember üzerinde yerleştiği küçük bir harita.
function iliskiHaritasi() {
  const bul = (uid) => durum.sahnede.find((k) => k.uid === uid);
  const baglar = durum.baglar.filter((g) => bul(g.a) && bul(g.b));
  if (!baglar.length) return '';
  const uidler = [...new Set(baglar.flatMap((g) => [g.a, g.b]))], R = 120, C = 170;
  const yer = Object.fromEntries(uidler.map((u, i) => {
    const a = (2 * Math.PI * i) / uidler.length - Math.PI / 2;
    return [u, [Math.round(C + R * Math.cos(a)), Math.round(C + R * Math.sin(a))]];
  }));
  const cizgiler = baglar.map((g) => { const t = bagTuru(g.tur); return `<path d="${bagYolu(yer[g.a], yer[g.b], g.tur)}" style="stroke:${t.renk};${t.stil.replace(/stroke-width:\d+/, 'stroke-width:4')}" fill="none"/>`; }).join('');
  const dugumler = uidler.map((u) => {
    const k = bul(u), kar = karakterBul(k.kid), [x, y] = yer[u];
    return `<g transform="translate(${x} ${y})"><circle r="26" fill="#fff" stroke="#90a4ae" stroke-width="2"/><text y="9" text-anchor="middle" font-size="24">${kar.emoji}</text>
      <text y="44" text-anchor="middle" font-size="12" font-weight="700" fill="#23324a">${kacis(karakterAdi(k))}</text></g>`;
  }).join('');
  const liste = baglar.map((g) => { const t = bagTuru(g.tur); return `<li><b>${kacis(karakterAdi(bul(g.a)))}</b> ${t.emoji} ${t.ad} <b>${kacis(karakterAdi(bul(g.b)))}</b></li>`; }).join('');
  return `<h2>İlişki haritası</h2><div class="iliski"><svg viewBox="0 0 340 360" width="300">${cizgiler}${dugumler}</svg><ul>${liste}</ul></div>`;
}

// ================= Hikayeyi yeniden oynat =================
// Her olayda (akışa yazılan her şey, her sürükleme) sahnenin küçük bir "karesi" saklanır.
function kareEkle(m = '') {
  if (oynatiliyor || !durum.ortamId) return;
  const yuv = (v) => Math.round(v * 1000) / 1000;
  const kare = {
    o: durum.ortamId, h: durum.havaI, l: durum.karanlik ? 1 : 0,
    k: durum.sahnede.map((k) => [k.uid, k.kid, yuv(k.x), yuv(k.y), k.duygu || '', yuv(k.boyut), k.ters ? 1 : 0, k.ortam || '', k.isim || '', k.siddet || 0]),
    b: durum.baglar.map((g) => [g.a, g.b, g.tur]),
  };
  const son = durum.kareler[durum.kareler.length - 1];
  if (son) {
    const { t, m: _m, ...onceki } = son;
    if (JSON.stringify(onceki) === JSON.stringify(kare)) { if (m) son.m = m; return; }
  }
  durum.kareler.push({ ...kare, t: Date.now(), m });
  // Çok uzun oturumlarda ilk yarıdaki kareler seyreltilir.
  if (durum.kareler.length > 400) durum.kareler = durum.kareler.filter((_, i) => i % 2 === 0 || i > 200);
}

const bekle = (ms) => new Promise((tamam) => {
  const bitis = Date.now() + ms;
  const dongu = () => (oynatDur || Date.now() >= bitis ? tamam() : setTimeout(dongu, 60));
  dongu();
});

async function oynat() {
  const kareler = durum.kareler;
  if (kareler.length < 2) return bildir('▶ Oynatmak için önce biraz oynayın');
  rehberKapat(); secimKaldir(); bagModuKapat();
  const yedek = durum;
  durum = { ...yedek, sahnede: [], baglar: [] };
  oynatiliyor = true; oynatDur = false;
  $('#ekran-sahne').classList.add('oynatim');
  $('#oynat-cubugu').classList.remove('gizli');
  const cizgiDongusu = () => { if (oynatiliyor) { baglariCiz(); requestAnimationFrame(cizgiDongusu); } };
  requestAnimationFrame(cizgiDongusu);
  let gosterilen = null, gosterilenHava = null;
  for (let i = 0; i < kareler.length && !oynatDur; i++) {
    const f = kareler[i];
    durum.ortamId = f.o; durum.havaI = f.h; durum.karanlik = !!f.l;
    durum.sahnede = f.k.map(([uid, kid, x, y, duygu, boyut, ters, ortam, isim, siddet]) => ({ uid, kid, x, y, duygu: duygu || null, boyut, ters: !!ters, ortam: ortam || null, isim, siddet: siddet || null }))
      .filter((k) => karakterBul(k.kid));
    durum.baglar = (f.b || []).map(([a, b, tur], j) => ({ id: 'o' + j, a, b, tur }));
    if (f.o !== gosterilen) {
      manzaraCiz(true);
      $('#karakter-katmani').innerHTML = '';
      onPlanlariKur(); alanlariCiz();
    } else if (f.h !== gosterilenHava) manzaraCiz(false);
    gosterilen = f.o; gosterilenHava = f.h;
    $('#sahne').classList.toggle('karanlik', durum.karanlik);
    jetonlariEsle();
    $('#oynat-yazi').textContent = f.m || '';
    $('#oynat-ilerleme').style.width = `${((i + 1) / kareler.length) * 100}%`;
    const sonraki = kareler[i + 1];
    await bekle(sonraki ? sinirla((sonraki.t - f.t) / 4, 500, 1400) : 1600);
  }
  oynatiliyor = false;
  durum = yedek;
  $('#ekran-sahne').classList.remove('oynatim');
  $('#oynat-cubugu').classList.add('gizli');
  sahneAc();
  akisEkle('▶ Hikaye baştan izlendi');
}

$('#btn-oynat').addEventListener('click', oynat);
$('#btn-oynat-dur').addEventListener('click', () => { oynatDur = true; });

// ================= Oturumlar arası izlem (aynı danışan kodu) =================
async function izlemAc(kod) {
  $('#izlem-penceresi').classList.remove('gizli');
  $('#izlem-baslik').textContent = `📈 ${kod} · oturumlar`;
  const icerik = $('#izlem-icerik');
  icerik.innerHTML = '<p class="bos-mesaj">Kayıtlar okunuyor…</p>';
  try {
    const liste = await kayitIstek('api/kayitlar').then((y) => y.json());
    const ayni = liste.filter((k) => (k.kod || '').trim().toLocaleLowerCase('tr') === kod.trim().toLocaleLowerCase('tr'));
    const kayitlar = [];
    for (const k of ayni) kayitlar.push(await kayitIstek('api/kayitlar/' + encodeURIComponent(k.id)).then((y) => y.json()));
    kayitlar.sort((a, b) => new Date(a.tarih || a.baslangic) - new Date(b.tarih || b.baslangic));
    const ev = kayitlar.filter((k) => k.tur === 'ev-gunlugu');
    icerik.innerHTML = izlemHTML(kod, kayitlar.filter((k) => k.tur !== 'ev-gunlugu')) + evIzlemHTML(ev);
  } catch {
    icerik.innerHTML = '<p class="bos-mesaj">Kayıtlar okunamadı.</p>';
  }
}

function izlemHTML(kod, kayitlar) {
  const tarih = (k) => new Date(k.tarih || k.baslangic);
  const sayimlar = kayitlar.map((k) => {
    const s = {};
    (k.duyguGecmisi || []).forEach((d) => { s[d.duygu] = (s[d.duygu] || 0) + 1; });
    return s;
  });
  const enCok = Math.max(1, ...sayimlar.map((s) => Object.values(s).reduce((a, b) => a + b, 0)));
  const W = 640, H = 200, sol = 30, aralik = (W - sol) / Math.max(1, kayitlar.length), bw = Math.min(56, aralik * 0.6);
  const cubuklar = sayimlar.map((s, i) => {
    let y = H;
    const x = sol + i * aralik + (aralik - bw) / 2;
    const parcalar = DUYGULAR.filter((d) => s[d.id]).map((d) => {
      const h = (s[d.id] / enCok) * (H - 20); y -= h;
      return `<rect x="${x}" y="${y}" width="${bw}" height="${h}" fill="${d.renk}"><title>${d.ad}: ${s[d.id]}</title></rect>`;
    }).join('');
    return `${parcalar}<text x="${x + bw / 2}" y="${H + 16}" text-anchor="middle" font-size="11" fill="#5b6b80">${tarih(kayitlar[i]).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}</text>`;
  }).join('');
  const kullanilan = DUYGULAR.filter((d) => sayimlar.some((s) => s[d.id]));
  const lejant = kullanilan.map((d) => `<span><i style="background:${d.renk}"></i>${d.emoji} ${d.ad}</span>`).join('');
  const satirlar = kayitlar.map((k, i) => {
    const s = sayimlar[i];
    const duygular = Object.entries(s).sort((a, b) => b[1] - a[1]).map(([id, n]) => `${duyguBul(id)?.emoji || ''}×${n}`).join(' ');
    const sid = (k.duyguGecmisi || []).map((d) => d.siddet || 3);
    const ort = sid.length ? (sid.reduce((a, b) => a + b, 0) / sid.length).toLocaleString('tr-TR', { maximumFractionDigits: 1 }) : '—';
    const ortamlar = (k.gezilen || [k.ortam]).map((id) => ORTAMLAR.find((o) => o.id === id)).filter(Boolean).map((o) => o.ikon).join(' ');
    const karakterler = (k.karakterler || []).map((c) => c.emoji || '').join(' ');
    const ic = (an) => icHavaBul(k.icHava?.[an])?.emoji || '·';
    return `<tr><td>${i + 1}</td><td>${tarih(k).toLocaleDateString('tr-TR', { dateStyle: 'medium' })}</td><td>${k.sureDk ?? '—'} dk</td><td>${ortamlar}</td><td>${k.icHava?.bas || k.icHava?.son ? `${ic('bas')} → ${ic('son')}` : '—'}</td><td>${(k.temalar || []).map((id) => temaBul(id)?.ad).filter(Boolean).join(', ') || '—'}</td>
      <td>${duygular || '—'}</td><td>${ort}</td><td>${karakterler || '—'}</td><td>${(k.alanlar || []).length || '—'}</td><td>${(k.baglar || []).length || '—'}</td>
      <td>${k.hedef ? `${kacis(k.hedef)}${k.hedefDurumu ? ` <i>(${HEDEF_DURUMLARI[k.hedefDurumu] || ''})</i>` : ''}` : '—'}</td><td>${(k.riskler || []).length ? `<b class="risk-sayi">⚠️ ${(k.riskler || []).length}</b>` : '—'}</td></tr>`;
  }).join('');
  // Birden çok oturumda tekrar eden karakterler ve ortamlar.
  const tekrar = (liste) => Object.entries(liste.reduce((s, x) => ({ ...s, [x]: (s[x] || 0) + 1 }), {})).filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]);
  const karTekrar = tekrar(kayitlar.flatMap((k) => [...new Set((k.karakterler || []).map((c) => `${c.emoji || ''} ${c.isim || c.ad || ''}`.trim()))]));
  const ortTekrar = tekrar(kayitlar.flatMap((k) => [...new Set(k.gezilen || [k.ortam])]));
  const toplam = {};
  sayimlar.forEach((s) => Object.entries(s).forEach(([id, n]) => { toplam[id] = (toplam[id] || 0) + n; }));
  const enSik = Object.entries(toplam).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id, n]) => `${duyguBul(id)?.emoji} ${duyguBul(id)?.ad} (${n})`).join(', ');
  return `
    <p class="izlem-ozet"><b>${kayitlar.length}</b> oturum${kayitlar.length ? ` · ${tarih(kayitlar[0]).toLocaleDateString('tr-TR')} – ${tarih(kayitlar[kayitlar.length - 1]).toLocaleDateString('tr-TR')}` : ''}</p>
    ${kayitlar.length ? `<h4>Oturumlara göre seçilen duygular</h4>
    <svg class="izlem-grafik" viewBox="0 0 ${W} ${H + 24}"><path d="M${sol} 0 V${H} H${W}" stroke="#c9d8ec" fill="none"/>${cubuklar}</svg>
    <div class="lejant">${lejant}</div>
    <h4>Oturumlar</h4>
    <div class="tablo-kap"><table class="izlem-tablo"><tr><th>#</th><th>Tarih</th><th>Süre</th><th>Ortamlar</th><th>İç hava</th><th>Temalar</th><th>Duygular</th><th>Ort. şiddet</th><th>Karakterler</th><th>🛡️</th><th>🔗</th><th>🎯 Hedef</th><th>Risk</th></tr>${satirlar}</table></div>
    <h4>Tekrar edenler</h4>
    <ul class="izlem-tekrar">
      <li><b>En sık duygular:</b> ${enSik || '—'}</li>
      <li><b>Birden çok oturumda yer alan karakterler:</b> ${karTekrar.map(([a, n]) => `${kacis(a)} (${n})`).join(', ') || '—'}</li>
      <li><b>Tekrar eden temalar:</b> ${tekrar(kayitlar.flatMap((k) => k.temalar || [])).map(([id, n]) => `${kacis(temaBul(id)?.ad || id)} (${n})`).join(', ') || '—'}</li>
      <li><b>Tekrar seçilen ortamlar:</b> ${ortTekrar.map(([id, n]) => { const o = ORTAMLAR.find((x) => x.id === id); return o ? `${o.ikon} ${o.ad} (${n})` : ''; }).filter(Boolean).join(', ') || '—'}</li>
    </ul>` : '<p class="bos-mesaj">Bu kodla kaydedilmiş oyun oturumu yok.</p>'}`;
}

$('#izlem-penceresi').addEventListener('click', (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-izlem="kapat"]')) return $('#izlem-penceresi').classList.add('gizli');
  if (e.target.closest('[data-izlem="yazdir"]')) {
    const rapor = $('#rapor');
    rapor.className = '';
    rapor.innerHTML = `<h1>📈 Oturumlar Arası İzlem</h1><p class="alt-baslik">${kacis($('#izlem-baslik').textContent.replace('📈 ', ''))}</p>${$('#izlem-icerik').innerHTML}
      <p class="gizlilik">Bu belge gizli danışmanlık bilgisi içerir. Grafikler çocuğun oyunda seçtiklerini özetler; tek başına tanı ya da yorum yerine geçmez.</p>`;
    window.print();
  }
});

// ================= Çocuğa hikaye kitabı =================
function kitapHTML(baslik, anlar) {
  const karakterler = [...new Set(durum.sahnede.map((k) => k.kid))].slice(0, 8).map((id) => {
    const kar = karakterBul(id);
    return kar.resim ? `<img class="kitap-kar" src="${kar.resim}" alt="">` : kar.cizim ? karakterSvg(kar).replace('<svg ', '<svg class="kitap-kar" ') : `<span class="kitap-kar">${kar.emoji}</span>`;
  }).join('');
  const varsayilan = (i) => (i === 0 ? 'Bir varmış, bir yokmuş…' : i === anlar.length - 1 ? 'Ve sonunda…' : 'Sonra…');
  const sayfalar = anlar.map((a, i) => `<section class="kitap-sayfa"><img src="${a.resim}" alt=""><p>${kacis(a.not || varsayilan(i))}</p><span class="sayfa-no">${i + 1}</span></section>`).join('');
  return `
    <section class="kitap-sayfa kapak"><h1>${kacis(baslik)}</h1><div class="kitap-karakterler">${karakterler}</div>
      <p class="yazan">Yazan ve çizen: ______________________</p><p class="tarih">${new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</p></section>
    ${sayfalar}
    <section class="kitap-sayfa son"><h1>Son 🌈</h1><p class="yazan">Bu hikayede en sevdiğim yer: ______________________</p><p class="yazan">Hikayemize bir şey eklemek istersem: ______________________</p></section>`;
}

$('#btn-kitap').addEventListener('click', async () => {
  const anlar = durum.anlar.filter((a) => a.resim);
  if (!anlar.length) return bildir('📖 Önce 📸 ile hikayeden birkaç an kaydedin');
  const ad = prompt('Hikayemizin adı ne olsun?', durum.kitapAdi || 'Benim Hikayem');
  if (ad === null) return;
  durum.kitapAdi = ad.trim().slice(0, 60) || 'Benim Hikayem';
  const rapor = $('#rapor');
  rapor.className = 'kitap';
  rapor.innerHTML = kitapHTML(durum.kitapAdi, anlar);
  await Promise.all([...rapor.querySelectorAll('img')].map((r) => r.decode().catch(() => {})));
  akisEkle(`📖 Hikaye kitabı hazırlandı: ${durum.kitapAdi}`);
  window.print();
});

// ================= Ortak: küçük çizim tahtası (beden haritası için) =================
function tuvalKonumu(t, e) {
  const r = t.getBoundingClientRect();
  return [(e.clientX - r.left) * (t.width / r.width), (e.clientY - r.top) * (t.height / r.height)];
}

// ================= Kayıtlara parola koruması ve yedekleme =================
const OTURUM_ANAHTAR = 'hikaye-modu-oturum';
const oturumAl = () => { try { return sessionStorage.getItem(OTURUM_ANAHTAR) || ''; } catch { return ''; } };
const oturumYaz = (b) => { try { if (b) sessionStorage.setItem(OTURUM_ANAHTAR, b); else sessionStorage.removeItem(OTURUM_ANAHTAR); } catch { /* yoksay */ } };

// Kayıt işlemleri bu sarmalayıcıyla yapılır: koruma açıksa parola sorulur ve istek yinelenir.
async function kayitIstek(yol, secenek = {}) {
  const y = await fetch(yol, { ...secenek, headers: { ...(secenek.headers || {}), 'X-Oturum': oturumAl() } });
  if (y.status !== 401) return y;
  if (!(await parolaSor())) throw new Error('parola');
  return kayitIstek(yol, secenek);
}

let parolaCevap = null;
function parolaSor() {
  return new Promise((tamam) => {
    parolaCevap = tamam;
    $('#parola-giris').value = '';
    $('#parola-hata').textContent = '';
    $('#parola-penceresi').classList.remove('gizli');
    setTimeout(() => $('#parola-giris').focus(), 50);
  });
}

async function parolaGonder() {
  const y = await fetch('api/koruma/giris', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ parola: $('#parola-giris').value }) });
  const v = await y.json().catch(() => ({}));
  if (!y.ok) { $('#parola-hata').textContent = v.hata || 'Giriş yapılamadı'; return; }
  oturumYaz(v.oturum);
  $('#parola-penceresi').classList.add('gizli');
  parolaCevap?.(true); parolaCevap = null;
}

$('#parola-penceresi').addEventListener('click', (e) => {
  if (e.target.closest('[data-parola="tamam"]')) return parolaGonder();
  if (e.target === e.currentTarget || e.target.closest('[data-parola="vazgec"]')) {
    $('#parola-penceresi').classList.add('gizli');
    parolaCevap?.(false); parolaCevap = null;
  }
});
$('#parola-giris').addEventListener('keydown', (e) => { if (e.key === 'Enter') parolaGonder(); });

async function korumaAc() {
  $('#koruma-penceresi').classList.remove('gizli');
  $('#koruma-icerik').innerHTML = '<p class="bos-mesaj">Okunuyor…</p>';
  const d = await fetch('api/koruma', { headers: { 'X-Oturum': oturumAl() } }).then((y) => y.json()).catch(() => null);
  if (!d) { $('#koruma-icerik').innerHTML = '<p class="bos-mesaj">Sunucuya ulaşılamadı.</p>'; return; }
  const alan = (id, yer) => `<input id="${id}" type="password" autocomplete="new-password" placeholder="${yer}">`;
  $('#koruma-icerik').innerHTML = d.aktif ? `
    <p class="koruma-durum acik">🔒 Kayıtlar bu ${IPAD ? 'cihazda' : 'bilgisayarda'} parolayla şifreli tutuluyor.</p>
    <details><summary>Parolayı değiştir</summary><div class="koruma-form">${alan('k-eski', 'Şimdiki parola')}${alan('k-yeni', 'Yeni parola (en az 4 karakter)')}${alan('k-yeni2', 'Yeni parola (tekrar)')}<button class="ince-btn" data-koruma="degistir">Değiştir</button></div></details>
    <details><summary>Korumayı kaldır</summary><div class="koruma-form">${alan('k-kaldir', 'Parola')}<p class="ipucu">Kayıtlar yeniden şifresiz saklanır.</p><button class="ince-btn tehlike" data-koruma="kaldir">Korumayı kaldır</button></div></details>
    ${d.giris ? '<button class="ince-btn" data-koruma="cikis">🚪 Bu cihazda oturumu kapat</button>' : ''}` : `
    <p class="koruma-durum">🔓 Kayıtlar şu an şifresiz.${IPAD ? ' iPad’i eline alan biri programdan kayıtları açabilir.' : ' Aynı ağdaki cihazlar programdan kayıtlara ulaşabilir.'}</p>
    <div class="koruma-form">${alan('k-yeni', 'Parola (en az 4 karakter)')}${alan('k-yeni2', 'Parola (tekrar)')}
      <p class="uyari">⚠️ Parolayı unutursanız kayıtlar <b>açılamaz</b>; kimse kurtaramaz. Parolayı güvenli bir yere not edin.</p>
      <button class="buyuk-btn kucuk" data-koruma="kur">🔒 Korumayı aç</button></div>`;
  $('#koruma-hata').textContent = '';
}

async function korumaIslem(islem) {
  const deger = (id) => $('#' + id)?.value || '';
  if ((islem === 'kur' || islem === 'degistir') && deger('k-yeni') !== deger('k-yeni2')) { $('#koruma-hata').textContent = 'Yeni parolalar aynı değil'; return; }
  if (islem === 'kaldir' && !confirm('Parola koruması kaldırılsın mı? Kayıtlar şifresiz saklanacak.')) return;
  const govde = { kur: { yeni: deger('k-yeni') }, degistir: { parola: deger('k-eski'), yeni: deger('k-yeni') }, kaldir: { parola: deger('k-kaldir') }, cikis: {} }[islem];
  $('#koruma-hata').textContent = 'Kayıtlar işleniyor…';
  const y = await fetch('api/koruma/' + islem, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Oturum': oturumAl() }, body: JSON.stringify(govde) });
  const v = await y.json().catch(() => ({}));
  if (!y.ok) { $('#koruma-hata').textContent = v.hata || 'İşlem yapılamadı'; return; }
  oturumYaz(v.oturum || (islem === 'cikis' || islem === 'kaldir' ? '' : oturumAl()));
  bildir({ kur: '🔒 Kayıtlar artık parolayla şifreli', degistir: '🔒 Parola değiştirildi', kaldir: '🔓 Parola koruması kaldırıldı', cikis: '🚪 Oturum kapatıldı' }[islem]);
  korumaAc();
}

$('#koruma-penceresi').addEventListener('click', (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-koruma="kapat"]')) return $('#koruma-penceresi').classList.add('gizli');
  const b = e.target.closest('[data-koruma]');
  if (b) korumaIslem(b.dataset.koruma);
});
$('#btn-koruma').addEventListener('click', korumaAc);

$('#btn-yedek-al').addEventListener('click', async () => {
  try {
    const d = await fetch('api/koruma').then((y) => y.json());
    if (!d.aktif && !confirm('Kayıtlar parolasız; yedek dosyası da şifresiz olacak. USB belleği güvenli tutun. Devam edilsin mi?')) return;
    const y = await kayitIstek('api/yedek');
    if (!y.ok) throw new Error(y.status);
    const ad = (y.headers.get('Content-Disposition') || '').match(/filename="([^"]+)"/)?.[1] || 'hikaye-yedek.zip';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(await y.blob());
    a.download = ad;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    bildir('💾 Yedek indirildi: İndirilenler klasöründen USB belleğe kopyalayın');
  } catch (h) {
    if (h.message !== 'parola') bildir('⚠️ Yedek alınamadı');
  }
});

$('#yedek-dosya').addEventListener('change', async (e) => {
  const dosya = e.target.files[0];
  e.target.value = '';
  if (!dosya) return;
  try {
    const y = await kayitIstek('api/yedek', { method: 'POST', headers: { 'Content-Type': 'application/zip' }, body: dosya });
    const v = await y.json().catch(() => ({}));
    if (!y.ok) return alert(v.hata || 'Yedek yüklenemedi');
    bildir(`📥 ${v.eklenen} kayıt eklendi${v.atlanan ? `, ${v.atlanan} kayıt zaten vardı` : ''}`);
    kayitlariAc();
  } catch (h) {
    if (h.message !== 'parola') bildir('⚠️ Yedek yüklenemedi');
  }
});

// ================= Çocuğun dili =================
const ik = (tr) => ikiDil(tr, durum.dil, kacis);
function dilUygula() {
  $('#ekran-ortam h2').innerHTML = `<span class="adim">1</span> ${ik('Hikayemiz nerede geçsin?')}`;
  $('#ekran-karakter h2').innerHTML = `<span class="adim">2</span> ${ik('Hikayemizde kimler olsun?')}`;
  $('#siddet-satiri > span').innerHTML = ik('Ne kadar?');
  $('#dil-secimi').value = durum.dil || 'tr';
  soruKartlariCiz();
}
$('#dil-secimi').innerHTML = DILLER.map((d) => `<option value="${d.id}">${d.ad}</option>`).join('');
$('#dil-secimi').addEventListener('change', (e) => {
  durum.dil = e.target.value;
  dilUygula();
  const k = durum.sahnede.find((x) => x.uid === seciliUid);
  if (k) duyguPaneliCiz(k);
  if (durum.dil !== 'tr') akisEkle(`🌐 Çocuğun dili: ${DILLER.find((d) => d.id === durum.dil).ad}`);
  taslakKaydet();
});

// ================= Soru kartları ve hazır senaryolar =================
function soruKartlariCiz() {
  const s = senaryoBul(durum.senaryo), sn = sinifBul(durum.sinif);
  const gruplar = Object.entries(SORULAR);
  if (s) gruplar.unshift([`${s.ikon} Senaryo: ${s.ad}`, s.sorular]);
  if (sn) gruplar.unshift([`🏫 Sınıfla: ${sn.ikon} ${sn.ad}`, sn.sorular]);
  $('#soru-kartlari').innerHTML = (sn ? `<p class="senaryo-ipucu">🏫 Sınıf etkinliği: ${kacis(sn.etkinlik)}</p>` : '') + (s ? `<p class="senaryo-ipucu">💡 ${kacis(s.ipucu)}</p>` : '') + gruplar.map(([grup, liste]) => `
    <div class="soru-grup"><h4>${kacis(grup)}</h4>${liste.map((q) => `<button class="soru ${durum.sorulanlar.includes(q) ? 'soruldu' : ''}" data-soru="${kacis(q)}">${ik(q)}</button>`).join('')}</div>`).join('');
}

function senaryolarAc() {
  $('#senaryo-listesi').innerHTML = SENARYOLAR.map((s) => `<button class="senaryo-kart" data-senaryo="${s.id}">
    <span class="e">${s.ikon}</span><b>${kacis(s.ad)}</b><small>${kacis(s.aciklama)}</small>
    <span class="kucuk-kar">${s.karakterler.map((id) => karakterBul(id)?.emoji || '').join(' ')}</span></button>`).join('');
  $('#senaryo-penceresi').classList.remove('gizli');
}

$('#btn-senaryolar').addEventListener('click', senaryolarAc);
$('#senaryo-penceresi').addEventListener('click', (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-senaryo-kapat]')) return $('#senaryo-penceresi').classList.add('gizli');
  const s = senaryoBul(e.target.closest('[data-senaryo]')?.dataset.senaryo);
  if (!s) return;
  durum.senaryo = s.id;
  durum.ortamId = s.ortam;
  durum.sahnede.forEach((k) => { k.ortam = k.ortam || null; });
  s.karakterler.filter((id) => karakterBul(id) && !durum.secili.includes(id)).forEach((id) => durum.secili.push(id));
  if (s.hava) durum.havaI = Math.max(0, HAVALAR.findIndex((h) => h.id === s.hava));
  $('#senaryo-penceresi').classList.add('gizli');
  ses.zil();
  akisEkle(`📚 Senaryo: ${s.ikon} ${s.ad}`);
  soruKartlariCiz();
  bildir(`${s.ikon} ${s.ad}: karakterleri gözden geçirin`);
  aktifKategori = KATEGORILER[0].id;
  ekranGoster('karakter');
});

// ================= Tema etiketleri =================
const TEMALAR = [
  { id: 'guven', ad: 'Güven', renk: '#43a047' }, { id: 'kayip', ad: 'Kayıp / yas', renk: '#5c6bc0' }, { id: 'ayrilik', ad: 'Ayrılık', renk: '#7e57c2' },
  { id: 'saldirganlik', ad: 'Saldırganlık', renk: '#e53935' }, { id: 'korku', ad: 'Korku', renk: '#8e24aa' }, { id: 'kontrol', ad: 'Kontrol / güç', renk: '#f4511e' },
  { id: 'bakim', ad: 'Bakım / şefkat', renk: '#ec407a' }, { id: 'kurtarma', ad: 'Kurtarma', renk: '#1e88e5' }, { id: 'sinirlar', ad: 'Sınırlar', renk: '#6d4c41' },
  { id: 'aile', ad: 'Aile ilişkileri', renk: '#00897b' }, { id: 'akran', ad: 'Akran ilişkileri', renk: '#00acc1' }, { id: 'basari', ad: 'Başarı / yeterlik', renk: '#fbc02d' },
];
const temaBul = (id) => TEMALAR.find((t) => t.id === id);

function temalariCiz() {
  $('#tema-cipleri').innerHTML = TEMALAR.map((t) => `<button class="tema-cip ${durum.temalar.includes(t.id) ? 'aktif' : ''}" data-tema="${t.id}" style="--renk:${t.renk}">${t.ad}</button>`).join('');
}

$('#tema-cipleri').addEventListener('click', (e) => {
  const t = temaBul(e.target.closest('[data-tema]')?.dataset.tema);
  if (!t) return;
  if (durum.temalar.includes(t.id)) { durum.temalar = durum.temalar.filter((x) => x !== t.id); taslakKaydet(); }
  else { durum.temalar.push(t.id); akisEkle(`🏷️ Tema: ${t.ad}`); }
  temalariCiz();
});

// ================= İç hava durumu =================
const IC_HAVA = [
  { id: 'gunes', emoji: '☀️', ad: 'Güneşli' }, { id: 'parcali', emoji: '⛅', ad: 'Parçalı bulutlu' }, { id: 'bulut', emoji: '☁️', ad: 'Bulutlu' },
  { id: 'yagmur', emoji: '🌧️', ad: 'Yağmurlu' }, { id: 'firtina', emoji: '⛈️', ad: 'Fırtınalı' }, { id: 'gokkusagi', emoji: '🌈', ad: 'Gökkuşağı' },
];
const icHavaBul = (id) => IC_HAVA.find((h) => h.id === id);
let icHavaAn = 'bas';

function icHavaCiz() {
  ['bas', 'son'].forEach((an) => {
    const h = icHavaBul(durum.icHava[an]);
    $(`#ichava-${an}`).textContent = h ? `${h.emoji} ${h.ad}` : '—';
  });
}

function icHavaSor(an) {
  icHavaAn = an;
  $('#ichava-soru').innerHTML = ik('Bugün içinde hava nasıl?');
  $('#ichava-kartlari').innerHTML = IC_HAVA.map((h) => `<button class="ichava-kart ${durum.icHava[an] === h.id ? 'aktif' : ''}" data-ichava="${h.id}"><span class="e">${h.emoji}</span>${ik(h.ad)}</button>`).join('');
  $('#ichava-penceresi').classList.remove('gizli');
  rehberKapat();
  oku('Bugün içinde hava nasıl?');
}

$('#rehber-paneli').addEventListener('click', (e) => {
  const b = e.target.closest('[data-ichava-sor]');
  if (b) icHavaSor(b.dataset.ichavaSor);
});
$('#ichava-penceresi').addEventListener('click', (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-ichava-kapat]')) return $('#ichava-penceresi').classList.add('gizli');
  const h = icHavaBul(e.target.closest('[data-ichava]')?.dataset.ichava);
  if (!h) return;
  durum.icHava[icHavaAn] = h.id;
  ses.zil();
  akisEkle(`🌤️ İç hava (${icHavaAn === 'bas' ? 'başta' : 'sonda'}): ${h.emoji} ${h.ad}`);
  icHavaCiz();
  $('#ichava-penceresi').classList.add('gizli');
});

// ================= Beden haritası =================
const BEDEN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 500"><g fill="FILL" stroke="STROKE" stroke-width="6" stroke-linejoin="round">
  <circle cx="150" cy="62" r="44"/><path d="M134 104 h32 v18 h-32z"/>
  <path d="M96 128 q54 -14 108 0 q22 6 24 30 l16 130 q2 16 -12 18 q-14 2 -16 -14 l-18 -110 l-4 96 l6 190 q0 14 -16 14 q-16 0 -18 -14 l-10 -150 h-12 l-10 150 q-2 14 -18 14 q-16 0 -16 -14 l6 -190 l-4 -96 l-18 110 q-2 16 -16 14 q-14 -2 -12 -18 l16 -130 q2 -24 24 -30z"/></g></svg>`;
const bedenResmi = (dolgu, cizgi) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(BEDEN_SVG.replace('FILL', dolgu).replace('STROKE', cizgi));
let bedenCizgiler = [], bedenCizgi = null, bedenDuygu = 'kizgin', bedenSilgi = false;

function bedenAc() {
  bedenCizgiler = []; bedenCizgi = null; bedenSilgi = false;
  $('#beden-soru').innerHTML = ik('Bu duyguyu bedeninin neresinde hissediyorsun?');
  $('#beden-duygular').innerHTML = DUYGULAR.map((d) => `<button class="beden-duygu" data-beden-duygu="${d.id}" style="--renk:${d.renk}"><i></i>${d.emoji} ${ik(d.ad)}</button>`).join('');
  $('#beden-arka').src = bedenResmi('#ffffff', 'none');
  $('#beden-cizgi').src = bedenResmi('none', '#607d8b');
  bedenAraclari(); bedenYenile();
  $('#beden-penceresi').classList.remove('gizli');
  rehberKapat();
  oku('Bu duyguyu bedeninin neresinde hissediyorsun?');
}

function bedenAraclari() {
  document.querySelectorAll('.beden-duygu').forEach((b) => b.classList.toggle('aktif', !bedenSilgi && b.dataset.bedenDuygu === bedenDuygu));
  $('[data-beden="silgi"]').classList.toggle('aktif', bedenSilgi);
}

function bedenYenile() {
  const t = $('#beden-tuval'), c = t.getContext('2d');
  c.clearRect(0, 0, t.width, t.height);
  bedenCizgiler.forEach((g) => cizgiCiz(c, g));
}

$('#beden-tuval').addEventListener('pointerdown', (e) => {
  e.preventDefault();
  try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* yoksay */ }
  const d = duyguBul(bedenDuygu);
  bedenCizgi = { pid: e.pointerId, renk: d.renk, kalin: bedenSilgi ? 40 : 26, silgi: bedenSilgi, duygu: bedenSilgi ? null : d.id, noktalar: [tuvalKonumu(e.currentTarget, e)] };
  bedenCizgiler.push(bedenCizgi);
  cizgiCiz(e.currentTarget.getContext('2d'), bedenCizgi);
});
$('#beden-tuval').addEventListener('pointermove', (e) => {
  if (!bedenCizgi || e.pointerId !== bedenCizgi.pid) return;
  const n = tuvalKonumu(e.currentTarget, e), son = bedenCizgi.noktalar[bedenCizgi.noktalar.length - 1];
  bedenCizgi.noktalar.push(n);
  cizgiCiz(e.currentTarget.getContext('2d'), { ...bedenCizgi, noktalar: [son, n] });
});
['pointerup', 'pointercancel'].forEach((t) => $('#beden-tuval').addEventListener(t, () => { bedenCizgi = null; }));

$('#beden-penceresi').addEventListener('click', async (e) => {
  const d = e.target.closest('[data-beden-duygu]'), islem = e.target.closest('[data-beden]')?.dataset.beden;
  if (d) { bedenDuygu = d.dataset.bedenDuygu; bedenSilgi = false; return bedenAraclari(); }
  if (islem === 'silgi') { bedenSilgi = !bedenSilgi; return bedenAraclari(); }
  if (islem === 'geri') { bedenCizgiler.pop(); return bedenYenile(); }
  if (islem === 'kapat' || e.target === e.currentTarget) return $('#beden-penceresi').classList.add('gizli');
  if (islem !== 'kaydet') return;
  const boyali = bedenCizgiler.filter((g) => !g.silgi);
  if (!boyali.length) return bildir('🧍 Önce bir duyguyla boya');
  // Gövde, boya ve dış çizgi tek bir resimde birleştirilir.
  const t = $('#beden-tuval'), son = document.createElement('canvas');
  son.width = t.width; son.height = t.height;
  const c = son.getContext('2d');
  for (const kaynak of [$('#beden-arka'), t, $('#beden-cizgi')]) {
    if (kaynak.tagName === 'IMG') await kaynak.decode().catch(() => {});
    c.drawImage(kaynak, 0, 0, son.width, son.height);
  }
  const duygular = [...new Set(boyali.map((g) => g.duygu))];
  durum.bedenler.push({ t: Date.now(), resim: son.toDataURL('image/png'), duygular });
  akisEkle(`🧍 Beden haritası: ${duygular.map((id) => `${duyguBul(id).emoji} ${duyguBul(id).ad}`).join(', ')}`);
  bildir('🧍 Beden haritası kaydedildi');
  $('#beden-penceresi').classList.add('gizli');
});

// ================= Endişe kutusu / endişe canavarı =================
function endiseAc() {
  $('#endise-soru').innerHTML = ik('Seni üzen ya da endişelendiren ne?');
  $('[data-endise="canavar"]').innerHTML = `👾 ${ik('Canavara yedir')}`;
  $('[data-endise="kutu"]').innerHTML = `🔒 ${ik('Kutuya kilitle')}`;
  $('#endise-metin').value = '';
  $('#endise-sayac').textContent = durum.endiseler.length ? `Bugün bırakılan: ${durum.endiseler.length}` : '';
  $('#endise-penceresi').classList.remove('gizli');
  rehberKapat();
  oku('Seni üzen ya da endişelendiren ne?');
  setTimeout(() => $('#endise-metin').focus(), 60);
}

$('#endise-penceresi').addEventListener('click', (e) => {
  const nereye = e.target.closest('[data-endise]')?.dataset.endise;
  if (e.target === e.currentTarget || nereye === 'kapat') return $('#endise-penceresi').classList.add('gizli');
  if (nereye !== 'canavar' && nereye !== 'kutu') return;
  const metin = $('#endise-metin').value.trim().slice(0, 200);
  if (!metin) return bildir('Önce endişeyi yaz (ya da çocuğun söylediğini)');
  const kagit = document.createElement('div');
  kagit.className = 'endise-kagit ' + nereye;
  kagit.textContent = metin;
  $('.endise-sahne').appendChild(kagit);
  $('.endise-sahne').classList.remove('cigniyor', 'kilitlendi');
  void kagit.offsetWidth;
  kagit.classList.add('uc');
  setTimeout(() => {
    kagit.remove();
    $('.endise-sahne').classList.add(nereye === 'canavar' ? 'cigniyor' : 'kilitlendi');
    if (nereye === 'canavar') { ses.ton(180, 90, 0.25, 0.12, 'sawtooth'); setTimeout(() => ses.ton(220, 110, 0.2, 0.1, 'sawtooth'), 260); }
    else { ses.ton(900, 600, 0.08, 0.1, 'square'); setTimeout(() => ses.ton(500, 300, 0.12, 0.1, 'square'), 140); }
  }, 900);
  durum.endiseler.push({ t: Date.now(), metin, nereye });
  akisEkle(`${nereye === 'canavar' ? '👾 Endişe canavara yedirildi' : '🔒 Endişe kutuya kilitlendi'}: “${metin}”`);
  $('#endise-metin').value = '';
  $('#endise-sayac').textContent = `Bugün bırakılan: ${durum.endiseler.length}`;
});

// ================= Sakinleşme köşesi (balon nefesi) =================
let sakinZamanlayici = 0, sakinNefes = 0;
function sakinAc() {
  rehberKapat(); secimKaldir();
  sakinNefes = 0;
  $('#sakin-baslik').innerHTML = ik('Balonu birlikte şişirelim');
  $('#sakin-penceresi').classList.remove('gizli');
  sakinDongu();
}

function sakinDongu() {
  const balon = $('#sakin-balon'), yazi = $('#sakin-yazi');
  const evre = (ad, sure, olcek, sonra) => {
    yazi.innerHTML = ik(ad);
    oku(ad);
    balon.style.transitionDuration = `${sure}s`;
    balon.style.transform = `scale(${olcek})`;
    sakinZamanlayici = setTimeout(sonra, sure * 1000);
  };
  evre('Nefes al', 4, 1.6, () => { ses.ton(523, 523, 0.25, 0.05); evre('Tut', 2, 1.6, () => evre('Nefes ver', 6, 0.7, () => {
    sakinNefes++;
    $('#sakin-sayac').textContent = '🎈'.repeat(Math.min(sakinNefes, 10));
    sakinDongu();
  })); });
}

function sakinKapat() {
  clearTimeout(sakinZamanlayici);
  $('#sakin-penceresi').classList.add('gizli');
  $('#sakin-balon').style.transform = 'scale(.7)';
  akisEkle(`🎈 Sakinleşme molası (${sakinNefes} nefes)`);
}
$('#sakin-penceresi').addEventListener('click', (e) => { if (e.target.closest('[data-sakin="kapat"]')) sakinKapat(); });

// ================= Karakter sesi efektleri =================
const SES_EFEKTLERI = [['normal', '🙂 Olduğu gibi'], ['ince', '🐭 İnce'], ['kalin', '🐻 Kalın'], ['robot', '🤖 Robot']];
const efektAdi = (id) => SES_EFEKTLERI.find((x) => x[0] === id)?.[1].replace(/^\S+ /, '') || '';

// İnce/kalın: perde korunmadan hızlandırma/yavaşlatma. Robot: sesi alçak frekanslı bir dalgayla çarpma (halka modülasyonu).
function sesOynat(kaynak, efekt) {
  const a = new Audio(kaynak);
  if (efekt === 'ince' || efekt === 'kalin') {
    a.preservesPitch = false; a.webkitPreservesPitch = false;
    a.playbackRate = efekt === 'ince' ? 1.5 : 0.72;
  } else if (efekt === 'robot') {
    try {
      const ctx = new AudioContext(), giris = ctx.createMediaElementSource(a), carpan = ctx.createGain(), dalga = ctx.createOscillator();
      carpan.gain.value = 0; dalga.frequency.value = 60;
      dalga.connect(carpan.gain); giris.connect(carpan); carpan.connect(ctx.destination); dalga.start();
      const kapat = () => { ctx.close().catch(() => {}); };
      a.addEventListener('ended', kapat); a.addEventListener('pause', kapat);
    } catch { /* desteklenmezse normal çalar */ }
  }
  return a;
}

function efektleriCiz() {
  $('#ses-efektleri').classList.toggle('gizli', !taslakSoz?.ses || !!kaydedici);
  $('#ses-efektleri').innerHTML = SES_EFEKTLERI.map(([id, ad]) => `<button class="secim ${(taslakSoz?.efekt || 'normal') === id ? 'aktif' : ''}" data-efekt="${id}">${ad}</button>`).join('');
}
$('#ses-efektleri').addEventListener('click', (e) => {
  const b = e.target.closest('[data-efekt]');
  if (!b || !taslakSoz) return;
  taslakSoz.efekt = b.dataset.efekt;
  efektleriCiz();
  calanSes?.pause();
  calanSes = sesOynat(taslakSoz.ses, taslakSoz.efekt);
  calanSes.play().catch(() => {});
});

// ================= Dilek sahnesi: şimdi ve dilek =================
let dilek = null;
async function dilekBaslat() {
  if (dilek) return;
  rehberKapat(); secimKaldir();
  const simdi = await sahneGoruntusu(900).catch(() => '');
  dilek = { t: Date.now(), ortam: durum.ortamId, simdi, sahnede: structuredClone(durum.sahnede), baglar: structuredClone(durum.baglar) };
  $('#dilek-yazi').innerHTML = `🪄 ${ik('Nasıl olmasını isterdin?')}`;
  $('#ekran-sahne').classList.add('dilek-modu');
  ses.zil();
  akisEkle('🪄 Dilek sahnesi başladı: “Nasıl olmasını isterdin?”');
  oku('Nasıl olmasını isterdin?');
}

function dilekFarklari() {
  const ad = (k) => karakterAdi(k), f = [];
  const once = new Map(dilek.sahnede.map((k) => [k.uid, k])), simdi = new Map(durum.sahnede.map((k) => [k.uid, k]));
  durum.sahnede.forEach((k) => { if (!once.has(k.uid)) f.push(`${ad(k)} hikayeye eklendi`); });
  dilek.sahnede.forEach((k) => { if (!simdi.has(k.uid)) f.push(`${ad(k)} hikayeden çıkarıldı`); });
  const ortak = durum.sahnede.filter((k) => once.has(k.uid));
  ortak.forEach((k) => {
    const o = once.get(k.uid);
    if ((o.ortam || '') !== (k.ortam || '')) f.push(`${ad(k)} başka bir yere gitti (${ortamBul(k.ortam || dilek.ortam).ad})`);
    if (o.duygu !== k.duygu) f.push(`${ad(k)}: ${duyguBul(o.duygu)?.ad || 'duygusuz'} → ${duyguBul(k.duygu)?.ad || 'duygusuz'}`);
    if (!!o.saklandi !== !!k.saklandi) f.push(`${ad(k)} ${k.saklandi ? 'saklandı' : 'saklandığı yerden çıktı'}`);
    if ((o.guc || []).join() !== (k.guc || []).join()) f.push(`${ad(k)}: güçleri ${(k.guc || []).length ? (k.guc || []).map((g) => gucBul(g)?.ad).join(', ') : 'kalmadı'}`);
    if (!!o.guvende !== !!k.guvende) f.push(`${ad(k)} ${k.guvende ? 'güvenli yere girdi' : 'güvenli yerden çıktı'}`);
  });
  // İki karakter arasındaki uzaklık belirgin değiştiyse yakınlaştı/uzaklaştı yazılır.
  const uzaklik = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  for (let i = 0; i < ortak.length; i++) for (let j = i + 1; j < ortak.length; j++) {
    const a = ortak[i], b = ortak[j];
    if ((a.ortam || '') !== (b.ortam || '')) continue;
    const fark = uzaklik(a, b) - uzaklik(once.get(a.uid), once.get(b.uid));
    if (Math.abs(fark) > 0.15) f.push(`${ad(a)} ile ${ad(b)} ${fark < 0 ? 'yakınlaştı' : 'uzaklaştı'}`);
  }
  const bagAnahtar = (g) => [Math.min(g.a, g.b), Math.max(g.a, g.b)].join('-');
  const eskiBag = new Map(dilek.baglar.map((g) => [bagAnahtar(g), g])), yeniBag = new Map(durum.baglar.map((g) => [bagAnahtar(g), g]));
  const kimler = (g) => `${ad(durum.sahnede.find((k) => k.uid === g.a) || dilek.sahnede.find((k) => k.uid === g.a))} ↔ ${ad(durum.sahnede.find((k) => k.uid === g.b) || dilek.sahnede.find((k) => k.uid === g.b))}`;
  yeniBag.forEach((g, a) => { const e = eskiBag.get(a); if (!e) f.push(`${kimler(g)}: yeni bağ (${bagTuru(g.tur).ad})`); else if (e.tur !== g.tur) f.push(`${kimler(g)}: ${bagTuru(e.tur).ad} → ${bagTuru(g.tur).ad}`); });
  eskiBag.forEach((g, a) => { if (!yeniBag.has(a)) f.push(`${kimler(g)}: bağ kalktı`); });
  return f;
}

async function dilekBitir(kaydet) {
  if (!dilek) return;
  if (kaydet) {
    const resim = await sahneGoruntusu(900).catch(() => '');
    const farklar = dilekFarklari();
    durum.dilekler.push({ t: dilek.t, ortam: dilek.ortam, simdi: dilek.simdi, dilek: resim, farklar });
    akisEkle(`🪄 Dilek sahnesi: ${farklar.length ? farklar.join('; ') : 'değişiklik yapılmadı'}`);
    if (!confirm('Dilek kaydedildi. Sahne dileğin hâliyle kalsın mı?\n(İptal: sahne şimdiki hâline döner)')) dilekGeriDon();
  } else {
    dilekGeriDon();
    akisEkle('🪄 Dilek sahnesinden vazgeçildi');
  }
  dilek = null;
  $('#ekran-sahne').classList.remove('dilek-modu');
}

function dilekGeriDon() {
  durum.sahnede = dilek.sahnede;
  durum.baglar = dilek.baglar;
  durum.ortamId = dilek.ortam;
  sahneAc();
}

$('#btn-dilek').addEventListener('click', dilekBaslat);
$('#btn-dilek-bitti').addEventListener('click', () => dilekBitir(true));
$('#btn-dilek-vazgec').addEventListener('click', () => dilekBitir(false));

// ================= Kum tepsisi: su, tepe, çukur =================
const KUM_ARACLARI = {
  su: { ad: '💧 Su', renk: 'rgba(66,165,245,.9)', ic: 'rgba(144,202,249,.9)', kalin: 70 },
  tepe: { ad: '⛰️ Tepe', renk: 'rgba(176,132,82,.75)', ic: 'rgba(232,200,150,.9)', kalin: 90 },
  cukur: { ad: '🕳️ Çukur', renk: 'rgba(110,78,44,.7)', ic: 'rgba(80,55,30,.65)', kalin: 70 },
  duzle: { ad: '🧹 Düzle', silgi: true, kalin: 110 },
};
let kumArac = null, kumIz = null;
const kumBurada = () => durum.ortamId === 'kum-tepsisi';

// Kum izleri ortam çiziminin (1600x900) koordinatlarında tutulur; ekran boyutu değişse de yerinde kalır.
function svgdenEkrana([x, y]) { const [fx, fy] = svgNokta([x, y]), r = sahneRect(); return [fx * r.width, fy * r.height]; }
function ekrandanSvge(e) {
  const r = sahneRect(), s = Math.max(r.width / 1600, r.height / 900);
  return [Math.round((e.clientX - r.left - (r.width - 1600 * s) / 2) / s), Math.round((e.clientY - r.top - (r.height - 900 * s)) / s)];
}

function kumCiz() {
  if (!kumBurada() && kumArac) kumAracSec(kumArac);
  const t = $('#kum-tuval'), r = sahneRect();
  $('#kum-araclari').classList.toggle('gizli', !kumBurada() || oynatiliyor);
  t.classList.toggle('gizli', !kumBurada());
  if (!kumBurada() || !r.width) return;
  const oran = window.devicePixelRatio || 1;
  t.width = Math.round(r.width * oran); t.height = Math.round(r.height * oran);
  const c = t.getContext('2d'), s = Math.max(r.width / 1600, r.height / 900);
  c.setTransform(oran, 0, 0, oran, 0, 0);
  c.clearRect(0, 0, r.width, r.height);
  durum.kumIzleri.forEach((iz) => {
    const a = KUM_ARACLARI[iz.a];
    if (!a || iz.n.length < 1) return;
    const n = iz.n.map(svgdenEkrana);
    const yol = () => { c.beginPath(); c.moveTo(...n[0]); n.slice(1).forEach((p) => c.lineTo(...p)); if (n.length === 1) c.lineTo(n[0][0] + 0.1, n[0][1]); };
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.globalCompositeOperation = a.silgi ? 'destination-out' : 'source-over';
    yol(); c.strokeStyle = a.silgi ? '#000' : a.renk; c.lineWidth = a.kalin * s; c.stroke();
    if (!a.silgi) { yol(); c.strokeStyle = a.ic; c.lineWidth = a.kalin * s * 0.55; c.stroke(); }
  });
  c.globalCompositeOperation = 'source-over';
}

function kumAracSec(arac) {
  kumArac = kumArac === arac ? null : arac;
  document.querySelectorAll('[data-kum]').forEach((b) => b.classList.toggle('aktif', b.dataset.kum === kumArac));
  $('#kum-ortusu').classList.toggle('gizli', !kumArac);
  if (kumArac) { secimKaldir(); ses.sec(); }
}

$('#kum-araclari').addEventListener('click', (e) => { const b = e.target.closest('[data-kum]'); if (b) kumAracSec(b.dataset.kum); });
$('#kum-ortusu').addEventListener('pointerdown', (e) => {
  if (!kumArac) return;
  e.preventDefault();
  try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* yoksay */ }
  kumIz = { pid: e.pointerId, a: kumArac, n: [ekrandanSvge(e)] };
  durum.kumIzleri.push(kumIz);
  kumCiz();
});
$('#kum-ortusu').addEventListener('pointermove', (e) => {
  if (!kumIz || e.pointerId !== kumIz.pid) return;
  const n = ekrandanSvge(e), son = kumIz.n[kumIz.n.length - 1];
  if (Math.hypot(n[0] - son[0], n[1] - son[1]) < 8) return;
  kumIz.n.push(n);
  kumCiz();
});
['pointerup', 'pointercancel'].forEach((t) => $('#kum-ortusu').addEventListener(t, () => {
  if (!kumIz) return;
  const { pid, ...iz } = kumIz;
  durum.kumIzleri[durum.kumIzleri.length - 1] = iz;
  if (iz.a !== 'duzle') akisEkle(`🏖️ Kum tepsisi: ${KUM_ARACLARI[iz.a].ad}`); else taslakKaydet();
  kumIz = null;
}));
window.addEventListener('resize', kumCiz);

// Açılışta ilk çizimler.
$('#btn-beden').addEventListener('click', bedenAc);
$('#btn-endise').addEventListener('click', endiseAc);
$('#btn-sakin').addEventListener('click', sakinAc);
dilUygula(); temalariCiz(); icHavaCiz();

// ================= Ortak yardımcılar =================
const pencereAc = (id) => $(`#${id}-penceresi`).classList.remove('gizli');
const pencereKapat = (id) => $(`#${id}-penceresi`).classList.add('gizli');
const acikPencereVar = () => [...document.querySelectorAll('.pencere-arka')].some((p) => !p.classList.contains('gizli'));
const gorunenler = () => durum.sahnede.filter(gorunur);
const uyu = (ms) => new Promise((tamam) => setTimeout(tamam, ms));

// ================= Sesli okuma =================
const KONUSMA_DILI = { tr: 'tr-TR', en: 'en-US', ar: 'ar-SA', ku: 'ku' };
function sesBul(lang) {
  if (!window.speechSynthesis) return null;
  const on = lang.slice(0, 2).toLowerCase();
  return speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(on)) || null;
}
// Çeviri varsa ve cihazda o dilde ses varsa çocuğun dilinde, yoksa Türkçe okunur.
function oku(tr, zorla = false) {
  if ((!sesliOku && !zorla) || !window.speechSynthesis || !tr) return;
  const dil = durum.dil || 'tr', c = cevir(tr, dil);
  const [metin, d] = c && sesBul(KONUSMA_DILI[dil]) ? [c, dil] : [tr, 'tr'];
  const u = new SpeechSynthesisUtterance(metin);
  u.lang = KONUSMA_DILI[d] || 'tr-TR';
  const v = sesBul(u.lang);
  if (v) u.voice = v;
  u.rate = 0.9; u.pitch = 1.05;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}
if (window.speechSynthesis) speechSynthesis.getVoices();
$('#sesli-oku').checked = sesliOku;
$('#sesli-oku').addEventListener('change', (e) => {
  sesliOku = e.target.checked;
  try { localStorage.setItem('hikaye-modu-sesli', sesliOku ? '1' : '0'); } catch { /* yoksay */ }
  if (sesliOku && !window.speechSynthesis) bildir('⚠️ Bu tarayıcı sesli okumayı desteklemiyor');
  else if (sesliOku) { oku('Hikayemiz nasıl başlasın?'); if (!sesBul('tr-TR')) bildir('⚠️ Cihazda Türkçe ses yok; ayarlardan Türkçe konuşma sesi indirin'); }
});

// ================= Geri al / yinele =================
const GERI_SINIR = 40;
const sahneAnligi = () => JSON.stringify({ o: durum.ortamId, h: durum.havaI, s: durum.sahnede, b: durum.baglar, a: durum.alanlar, z: durum.kumIzleri, k: !!durum.karanlik, p: !!durum.perdeKapali });

function geriKaydet() {
  if (geriUyguluyor || !durum.sahneBasladi) return;
  const a = sahneAnligi();
  if (geriYigin[geriYigin.length - 1] === a) return;
  geriYigin.push(a);
  if (geriYigin.length > GERI_SINIR) geriYigin.shift();
  ileriYigin = [];
  geriDugmeleri();
}

function geriDugmeleri() {
  $('#btn-geri-al').disabled = geriYigin.length < 2;
  $('#btn-yinele').disabled = !ileriYigin.length;
}

function anlikUygula(a) {
  const v = JSON.parse(a);
  geriUyguluyor = true;
  secimKaldir();
  const ortamDegisti = v.o !== durum.ortamId;
  Object.assign(durum, { ortamId: v.o, havaI: v.h, sahnede: v.s, baglar: v.b, alanlar: v.a, kumIzleri: v.z, karanlik: v.k, perdeKapali: v.p });
  if (!durum.gezilen.includes(v.o)) durum.gezilen.push(v.o);
  manzaraCiz(ortamDegisti);
  isikAyarla(v.k, false);
  jetonlariCiz(); alanlariCiz(); rafiCiz();
  taslakKaydet();
  geriUyguluyor = false;
  geriDugmeleri();
}

function geriAl() {
  if (oynatiliyor || dilek) return;
  if (geriYigin.length < 2) return bildir('↶ Geri alınacak bir şey yok');
  ileriYigin.push(geriYigin.pop());
  anlikUygula(geriYigin[geriYigin.length - 1]);
  ses.ton(600, 420, 0.1, 0.07);
  bildir('↶ Geri alındı');
}

function yinele() {
  if (oynatiliyor || dilek || !ileriYigin.length) return;
  const a = ileriYigin.pop();
  geriYigin.push(a);
  anlikUygula(a);
  ses.ton(420, 600, 0.1, 0.07);
  bildir('↷ Yinelendi');
}
$('#btn-geri-al').addEventListener('click', geriAl);
$('#btn-yinele').addEventListener('click', yinele);

// ================= Klavye kısayolları =================
const KISAYOLLAR = [
  ['Ctrl + Z', 'Geri al'], ['Ctrl + Y  /  Ctrl + Shift + Z', 'Yinele'], ['Ctrl + S', 'Hikayeyi kaydet'],
  ['R', 'Rehber paneli'], ['H', 'Hava durumunu değiştir'], ['L', 'Işığı kapat / aç (el feneri)'], ['I', 'İsimleri göster / gizle'],
  ['F', 'Anın fotoğrafını çek'], ['K', 'Karakter ekle'], ['P', 'Kukla tiyatrosunda perdeyi aç / kapat'],
  ['Ok tuşları', 'Seçili karakteri taşı (Shift ile büyük adım)'], ['+  /  −', 'Seçili karakteri büyüt / küçült'], ['C', 'Seçili karakteri çevir'],
  ['Delete', 'Seçili karakteri rafa koy'], ['Esc', 'Pencereyi kapat / seçimi kaldır'], ['?', 'Bu liste'],
];
function kisayolAc() {
  $('#kisayol-listesi').innerHTML = KISAYOLLAR.map(([t, a]) => `<tr><td><kbd>${kacis(t)}</kbd></td><td>${kacis(a)}</td></tr>`).join('');
  pencereAc('kisayol');
}
$('#btn-kisayollar').addEventListener('click', () => { rehberKapat(); kisayolAc(); });
$('#kisayol-penceresi').addEventListener('click', (e) => { if (e.target === e.currentTarget || e.target.closest('[data-kapat]')) pencereKapat('kisayol'); });

let okZamanlayici = 0;
document.addEventListener('keydown', (e) => {
  if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
  if (!$('#ekran-sahne').classList.contains('aktif') || acikPencereVar() || oynatiliyor) return;
  const ctrl = e.ctrlKey || e.metaKey, t = e.key.toLocaleLowerCase('tr');
  if (ctrl && t === 'z' && !e.shiftKey) { e.preventDefault(); return geriAl(); }
  if (ctrl && (t === 'y' || (t === 'z' && e.shiftKey))) { e.preventDefault(); return yinele(); }
  if (ctrl && t === 's') { e.preventDefault(); return $('#btn-kaydet').click(); }
  if (ctrl || e.altKey) return;
  const k = durum.sahnede.find((x) => x.uid === seciliUid);
  const arac = (ad) => $(`.arac-dugmeleri [data-arac="${ad}"]`).click();
  if (k && e.key.startsWith('Arrow')) {
    e.preventDefault();
    const adim = e.shiftKey ? 0.05 : 0.01;
    if (e.key === 'ArrowLeft') k.x = sinirla(k.x - adim, 0.03, 0.97);
    if (e.key === 'ArrowRight') k.x = sinirla(k.x + adim, 0.03, 0.97);
    if (e.key === 'ArrowUp') k.y = sinirla(k.y - adim, 0.12, 0.97);
    if (e.key === 'ArrowDown') k.y = sinirla(k.y + adim, 0.12, 0.97);
    jetonGuncelle(jetonEl(k.uid), k);
    clearTimeout(okZamanlayici);
    okZamanlayici = setTimeout(() => { guvenlikDenetle(k); saklanmaDenetle(k); kareEkle(); taslakKaydet(); }, 450);
    return;
  }
  if (k && (e.key === '+' || e.key === '=')) return arac('buyut');
  if (k && (e.key === '-' || e.key === '−')) return arac('kucult');
  if (k && (e.key === 'Delete' || e.key === 'Backspace')) { e.preventDefault(); return arac('kaldir'); }
  if (k && (t === 'c' || t === 'ç')) return arac('cevir');
  if (e.key === '?') return kisayolAc();
  const dugme = { r: '#btn-rehber', h: '#btn-hava', l: '#btn-isik', i: '#btn-isim', 'ı': '#btn-isim', f: '#btn-an', k: '#btn-karakter-ekle' }[t];
  if (dugme) { e.preventDefault(); return $(dugme).click(); }
  if (t === 'p' && tiyatroBurada()) perdeAyarla(!durum.perdeKapali);
});

// ================= Süper güçler =================
const GUCLER = [
  { id: 'kalkan', emoji: '🛡️', ad: 'Kalkan' }, { id: 'gorunmez', emoji: '👻', ad: 'Görünmezlik' },
  { id: 'buyume', emoji: '⬆️', ad: 'Dev gibi büyüme' }, { id: 'ucma', emoji: '🕊️', ad: 'Uçma' },
  { id: 'hiz', emoji: '⚡', ad: 'Süper hız' }, { id: 'kuvvet', emoji: '💪', ad: 'Süper güç' },
  { id: 'sihir', emoji: '🪄', ad: 'Sihir' }, { id: 'iyilestirme', emoji: '💖', ad: 'İyileştirme' },
];
const gucBul = (id) => GUCLER.find((g) => g.id === id);
let gucUid = null;

function gucleriGoster(el, k) {
  const guc = k.guc || [];
  GUCLER.forEach((g) => el.classList.toggle('guc-' + g.id, guc.includes(g.id)));
  const metin = guc.map((id) => gucBul(id)?.emoji || '').join('');
  let r = el.querySelector('.guc-rozet');
  if (!metin) return r?.remove();
  if (!r) { r = document.createElement('span'); r.className = 'guc-rozet'; el.querySelector('.govde').appendChild(r); }
  if (r.textContent !== metin) r.textContent = metin;
}

function gucAc(k) {
  gucUid = k.uid;
  $('#guc-soru').innerHTML = `${kacis(karakterAdi(k))}: ${ik('Hangi gücü olsun?')}`;
  gucCiz();
  pencereAc('guc');
  oku('Hangi gücü olsun?');
}

function gucCiz() {
  const k = durum.sahnede.find((x) => x.uid === gucUid);
  if (!k) return;
  $('#guc-kartlari').innerHTML = GUCLER.map((g) => `<button class="ichava-kart ${(k.guc || []).includes(g.id) ? 'aktif' : ''}" data-guc="${g.id}"><span class="e">${g.emoji}</span>${ik(g.ad)}</button>`).join('');
}

$('#guc-penceresi').addEventListener('click', (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-kapat]')) return pencereKapat('guc');
  const g = gucBul(e.target.closest('[data-guc]')?.dataset.guc), k = durum.sahnede.find((x) => x.uid === gucUid);
  if (!g || !k) return;
  k.guc = k.guc || [];
  const vardi = k.guc.includes(g.id);
  k.guc = vardi ? k.guc.filter((x) => x !== g.id) : [...k.guc, g.id];
  const el = jetonEl(k.uid);
  if (el) jetonGuncelle(el, k);
  if (vardi) ses.sec(); else ses.cime();
  akisEkle(`✨ ${karakterAdi(k)}: ${g.emoji} ${g.ad} ${vardi ? 'gücü bıraktı' : 'gücü kazandı'}`);
  gucCiz();
});

// Bir eşyanın arkasında kalan karakter, o eşyanın hemen önüne alınır.
function onuneAl(k) {
  // Gövdenin alt kısmı eşyanın içinde kalıyorsa da öne alınır (yalnız başı görünen karakter).
  const ortudugu = () => {
    const el = jetonEl(k.uid);
    if (!el) return null;
    const b = el.querySelector('.yuz').getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height * 0.7;
    return [...document.querySelectorAll('#karakter-katmani .on-plan-kat')].find((d) => {
      if (+d.style.zIndex <= Math.round(k.y * 1000)) return false;
      const r = d.querySelector('.on-plan').getBoundingClientRect();
      return x > r.left && x < r.right && y > r.top && y < r.bottom;
    });
  };
  for (let i = 0; i < 3; i++) {
    const esya = ortudugu();
    if (!esya) break;
    k.y = sinirla(+esya.style.zIndex / 1000 + 0.03, 0.12, 0.95);
    jetonGuncelle(jetonEl(k.uid), k);
  }
  k.saklandi = null;
  jetonGuncelle(jetonEl(k.uid), k);
}

// ================= Hikaye kökleri =================
function koklerAc() {
  $('#kok-listesi').innerHTML = KOKLER.map((k) => `<button class="senaryo-kart" data-kok="${k.id}"><span class="e">${k.ikon}</span><b>${kacis(k.ad)}</b>
    <small>${kacis(k.konu)} · ${kacis(ortamBul(k.ortam).ad)}</small><span class="kok-metin">${kacis(k.metin)}</span></button>`).join('');
  pencereAc('kok');
  rehberKapat();
}

function kokBaslat(kok) {
  if (!kok) return;
  pencereKapat('kok');
  if (dilek) dilekBitir(false);
  secimKaldir();
  durum.ortamId = kok.ortam;
  if (kok.hava) durum.havaI = Math.max(0, HAVALAR.findIndex((h) => h.id === kok.hava));
  durum.sahnede.forEach((k) => { if (k.ortam === undefined) k.ortam = null; });
  sahneAc();
  const kullanilan = new Set();
  kok.k.forEach(([kid, x, y, duygu]) => {
    if (!karakterBul(kid)) return;
    if (!durum.secili.includes(kid)) durum.secili.push(kid);
    // Aynı karakter zaten sahnedeyse yenisi eklenmez, kökteki yerine taşınır.
    let k = gorunenler().find((c) => c.kid === kid && !kullanilan.has(c.uid));
    if (k) { k.x = x; k.y = y; } else [k] = karakteriSahneyeKoy(kid, x, y);
    kullanilan.add(k.uid);
    if (duygu) { k.duygu = duygu; k.siddet = 3; }
    jetonGuncelle(jetonEl(k.uid), k);
    onuneAl(k);
  });
  // Köke ait olmayan, o yerde görünen karakterler rafa döner (↶ ile geri alınabilir).
  const disarida = gorunenler().filter((k) => !kullanilan.has(k.uid));
  if (disarida.length) {
    const uidler = new Set(disarida.map((k) => k.uid));
    durum.sahnede = durum.sahnede.filter((k) => !uidler.has(k.uid));
    durum.baglar = durum.baglar.filter((b) => !uidler.has(b.a) && !uidler.has(b.b));
    jetonlariCiz();
    bildir(`🌱 Diğer ${disarida.length} karakter rafa döndü`);
  }
  rafiCiz();
  kokAktif = { id: kok.id, t: Date.now() };
  $('#kok-yazi').textContent = kok.metin;
  $('#kok-soru').innerHTML = ik('Sonra ne oldu? Bana göster.');
  $('#ekran-sahne').classList.add('kok-modu');
  ses.zil();
  akisEkle(`🌱 Hikaye kökü: ${kok.ikon} ${kok.ad} — “${kok.metin}”`);
  oku(`${kok.metin} Sonra ne oldu? Bana göster.`);
}

async function kokTamam() {
  if (!kokAktif) return;
  const kok = kokBul(kokAktif.id), resim = await sahneGoruntusu(900).catch(() => '');
  const not = prompt('Çocuk hikayeyi nasıl tamamladı? (kısa not, isteğe bağlı)', '');
  const sure = Math.round((Date.now() - kokAktif.t) / 1000);
  durum.kokler.push({ t: kokAktif.t, id: kok.id, ad: kok.ad, metin: kok.metin, sureSn: sure, resim, not: (not || '').trim().slice(0, 400) });
  akisEkle(`🌱 Kök tamamlandı: ${kok.ad} (${sureYaz(sure * 1000)})${not ? ` — ${not.trim()}` : ''}`);
  bildir('🌱 Rapora eklendi');
  kokKapat();
}

function kokKapat() {
  kokAktif = null;
  $('#ekran-sahne').classList.remove('kok-modu');
  window.speechSynthesis?.cancel();
}

$('#btn-kokler').addEventListener('click', koklerAc);
$('#kok-penceresi').addEventListener('click', (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-kapat]')) return pencereKapat('kok');
  const b = e.target.closest('[data-kok]');
  if (b) kokBaslat(kokBul(b.dataset.kok));
});
$('#btn-kok-oku').addEventListener('click', () => { const k = kokBul(kokAktif?.id); if (k) oku(`${k.metin} Sonra ne oldu? Bana göster.`, true); });
$('#btn-kok-tamam').addEventListener('click', kokTamam);
$('#btn-kok-kapat').addEventListener('click', kokKapat);

// ================= Güvenli yerim =================
let oncekiGuvenli = null;
function guvenliAc() {
  rehberKapat();
  oncekiGuvenli = null;
  guvenliCiz();
  pencereAc('guvenli');
}

function guvenliKart(g, kaynak) {
  if (!g) return '';
  const tarih = new Date(g.t).toLocaleDateString('tr-TR', { dateStyle: 'medium' });
  return `<figure class="guvenli-kart">${g.resim ? `<img src="${g.resim}" alt="">` : ''}<figcaption><b>🏡 ${kacis(g.ad)}</b> · ${kacis(ortamBul(g.ortam).ad)} · ${tarih}
    <small>${g.sahnede.map((k) => kacis(karakterAdi(k))).join(', ') || 'karakter yok'}</small></figcaption>
    <button class="buyuk-btn kucuk" data-guvenli-kur="${kaynak}">🏡 Sahneye kur</button></figure>`;
}

function guvenliCiz() {
  $('#guvenli-icerik').innerHTML = `
    <p class="ipucu">Çocuk kendisini güvende hissettiği yeri sahnede kursun; burada kaydedin. Kayıt 💾 Kaydet ile oturuma yazılır ve
      aynı danışan koduyla sonraki oturumlarda tek dokunuşla geri açılır.</p>
    <div class="pencere-dugmeler" style="justify-content:flex-start;flex-wrap:wrap">
      <button class="buyuk-btn kucuk" data-guvenli="kaydet">💾 Bu sahneyi güvenli yerim olarak kaydet</button>
      <button class="ince-btn" data-guvenli="onceki">📂 Önceki oturumdaki güvenli yeri bul</button></div>
    ${durum.guvenliYer ? `<h4>Bu oturumda kaydedilen</h4>${guvenliKart(durum.guvenliYer, 'bu')}` : ''}
    ${oncekiGuvenli ? `<h4>Önceki oturumdan</h4>${guvenliKart(oncekiGuvenli, 'onceki')}` : ''}`;
}

async function guvenliKaydet() {
  const sahnede = gorunenler();
  if (!sahnede.length && !confirm('Sahnede karakter yok. Yine de bu yer kaydedilsin mi?')) return;
  const ad = prompt('Güvenli yerin adı ne olsun? (çocuğa sorun)', durum.guvenliYer?.ad || 'Güvenli yerim');
  if (ad === null) return;
  pencereKapat('guvenli');
  const resim = await sahneGoruntusu(900).catch(() => '');
  const uidler = new Set(sahnede.map((k) => k.uid));
  durum.guvenliYer = {
    t: Date.now(), ad: ad.trim().slice(0, 40) || 'Güvenli yerim', ortam: durum.ortamId, havaI: durum.havaI, resim,
    sahnede: structuredClone(sahnede).map((k) => ({ ...k, soz: k.soz?.ses ? { ...k.soz, ses: null } : k.soz })),
    baglar: structuredClone(durum.baglar.filter((g) => uidler.has(g.a) && uidler.has(g.b))),
    kumIzleri: durum.ortamId === 'kum-tepsisi' ? structuredClone(durum.kumIzleri) : [],
  };
  ses.cime();
  akisEkle(`🏡 Güvenli yer kaydedildi: “${durum.guvenliYer.ad}” (${sahnede.map(karakterAdi).join(', ') || 'karakter yok'})`);
  bildir('🏡 Güvenli yer kaydedildi — oturumu 💾 kaydetmeyi unutmayın');
}

async function oncekiGuvenliBul() {
  const kod = $('#danisan-kod').value.trim();
  if (!kod) return bildir('Önce rehber panelinde danışan kodunu yazın');
  $('#guvenli-icerik').insertAdjacentHTML('beforeend', '<p class="bos-mesaj" id="guvenli-yukleniyor">Kayıtlar okunuyor…</p>');
  try {
    const liste = await kayitIstek('api/kayitlar').then((y) => { if (!y.ok) throw new Error(y.status); return y.json(); });
    const ayni = liste.filter((k) => (k.kod || '').trim().toLocaleLowerCase('tr') === kod.toLocaleLowerCase('tr'));
    oncekiGuvenli = null;
    for (const k of ayni) {
      const v = await kayitIstek('api/kayitlar/' + encodeURIComponent(k.id)).then((y) => y.json()).catch(() => null);
      if (v?.guvenliYer?.sahnede) { oncekiGuvenli = v.guvenliYer; break; }
    }
    guvenliCiz();
    if (!oncekiGuvenli) bildir(`${kod} için kayıtlı güvenli yer bulunamadı`);
  } catch {
    $('#guvenli-yukleniyor')?.remove();
    bildir('⚠️ Kayıtlara ulaşılamadı');
  }
}

function guvenliKur(g) {
  if (!g) return;
  const yerdekiler = durum.sahnede.filter((k) => !k.ortam || k.ortam === g.ortam);
  if (yerdekiler.length && !confirm('O yerdeki karakterler rafa dönüp güvenli yer kurulsun mu? (↶ ile geri alınabilir)')) return;
  pencereKapat('guvenli');
  const eski = new Set(yerdekiler.map((k) => k.uid));
  durum.sahnede = durum.sahnede.filter((k) => !eski.has(k.uid));
  durum.baglar = durum.baglar.filter((b) => !eski.has(b.a) && !eski.has(b.b));
  const esle = new Map();
  g.sahnede.filter((k) => karakterBul(k.kid)).forEach((k) => {
    const uid = durum.sayac++;
    esle.set(k.uid, uid);
    durum.sahnede.push({ ...structuredClone(k), uid, ortam: k.ortam ? g.ortam : null, soz: null, guc: k.guc || [] });
    if (!durum.secili.includes(k.kid)) durum.secili.push(k.kid);
  });
  (g.baglar || []).forEach((b) => { if (esle.has(b.a) && esle.has(b.b)) durum.baglar.push({ ...b, a: esle.get(b.a), b: esle.get(b.b) }); });
  durum.ortamId = g.ortam;
  durum.havaI = g.havaI || 0;
  if (g.ortam === 'kum-tepsisi' && g.kumIzleri?.length) durum.kumIzleri = structuredClone(g.kumIzleri);
  sahneAc();
  ses.cime();
  bildir(`🏡 ${g.ad}`);
  akisEkle(`🏡 Güvenli yer sahneye kuruldu: “${g.ad}”`);
  oku('Burası senin güvenli yerin');
}

$('#btn-guvenli-yer').addEventListener('click', guvenliAc);
$('#guvenli-penceresi').addEventListener('click', (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-kapat]')) return pencereKapat('guvenli');
  const islem = e.target.closest('[data-guvenli]')?.dataset.guvenli, kur = e.target.closest('[data-guvenli-kur]')?.dataset.guvenliKur;
  if (islem === 'kaydet') return guvenliKaydet();
  if (islem === 'onceki') return oncekiGuvenliBul();
  if (kur) guvenliKur(kur === 'bu' ? durum.guvenliYer : oncekiGuvenli);
});

// ================= Kukla tiyatrosu =================
const tiyatroBurada = () => durum.ortamId === 'kukla-tiyatrosu';
function tiyatroCiz() {
  const var_ = tiyatroBurada();
  $('#tiyatro-araclari').classList.toggle('gizli', !var_ || oynatiliyor && !seyirci);
  $('#perde').classList.toggle('gizli', !var_);
  $('#perde').classList.toggle('kapali', var_ && !!durum.perdeKapali);
  $('#sahne').classList.toggle('perde-kapali', var_ && !!durum.perdeKapali);
  $('[data-tiyatro="perde"]').innerHTML = `🎭<span>${durum.perdeKapali ? 'Perdeyi aç' : 'Perdeyi kapat'}</span>`;
  if (!var_ && seyirci) seyirciModu(false);
}

function perdeAyarla(kapali) {
  durum.perdeKapali = kapali;
  tiyatroCiz();
  ses.ton(kapali ? 300 : 200, kapali ? 160 : 420, 0.7, 0.05, 'triangle');
  akisEkle(kapali ? '🎭 Perde kapandı' : '🎭 Perde açıldı');
}

function alkisla() {
  ses.alkis(2.6);
  const kat = $('#alkis-katmani');
  for (let i = 0; i < 18; i++) {
    const s = document.createElement('span');
    s.textContent = ['👏', '👏', '✨', '🎉', '💛'][i % 5];
    s.style.left = `${8 + Math.random() * 84}%`;
    s.style.animationDelay = `${Math.random() * 0.9}s`;
    s.style.fontSize = `${1.6 + Math.random() * 1.6}rem`;
    kat.appendChild(s);
    setTimeout(() => s.remove(), 3200);
  }
  akisEkle('👏 Alkış!');
}

function selamVer() {
  const jetonlar = [...document.querySelectorAll('#karakter-katmani .jeton')];
  jetonlar.forEach((el, i) => setTimeout(() => { el.classList.remove('selam'); void el.offsetWidth; el.classList.add('selam'); }, i * 120));
  setTimeout(() => jetonlar.forEach((el) => el.classList.remove('selam')), jetonlar.length * 120 + 1500);
  ses.cime();
  akisEkle('🙇 Karakterler selam verdi');
}

function seyirciModu(ac) {
  seyirci = ac;
  $('#ekran-sahne').classList.toggle('seyirci-modu', ac);
  if (ac) { secimKaldir(); rehberKapat(); akisEkle('🍿 Çocuk seyirci oldu'); bildir('🍿 Seyirci modu: ↩ ile sahneye dönün'); }
  tiyatroCiz();
}

$('#tiyatro-araclari').addEventListener('click', (e) => {
  const t = e.target.closest('[data-tiyatro]')?.dataset.tiyatro;
  if (t === 'perde') perdeAyarla(!durum.perdeKapali);
  if (t === 'alkis') alkisla();
  if (t === 'selam') selamVer();
  if (t === 'seyirci') seyirciModu(!seyirci);
  if (t === 'oynat') oynat();
});

// ================= Rol değiştirme (boş sandalye) =================
let rolSecim = [];
function rolAc() {
  const kisiler = gorunenler();
  rehberKapat();
  if (kisiler.length < 2) return bildir('🪑 Sahnede en az iki karakter olmalı');
  rolSecim = [];
  $('#rol-karakterler').innerHTML = kisiler.map((k) => `<button class="rol-kart" data-rol-uid="${k.uid}"><span class="e">${gorsel(karakterBul(k.kid), k.duygu)}</span>${kacis(karakterAdi(k))}</button>`).join('');
  pencereAc('rol');
}

function rolBasla() {
  const [a, b] = rolSecim.map((uid) => durum.sahnede.find((k) => k.uid === uid));
  if (!a || !b) return bildir('İki karakter seçin');
  pencereKapat('rol');
  // İki karakter karşı karşıya oturtulur.
  const y = sinirla(Math.max(a.y, b.y), 0.6, 0.85);
  Object.assign(a, { x: 0.36, y, ters: false });
  Object.assign(b, { x: 0.64, y, ters: true });
  rol = { t: Date.now(), a: a.uid, b: b.uid, sira: 'a', satirlar: [], degisim: 0 };
  jetonlariCiz();
  $('#ekran-sahne').classList.add('rol-modu');
  rolCubugu();
  ses.zil();
  akisEkle(`🪑 Rol değiştirme: ${karakterAdi(a)} ↔ ${karakterAdi(b)}`);
  setTimeout(() => $('#rol-metin').focus(), 80);
}

function rolKim() { return durum.sahnede.find((k) => k.uid === rol?.[rol.sira]); }

function rolCubugu() {
  const k = rolKim();
  if (!k) return rolBitir();
  $('#rol-yazi').innerHTML = `🎤 <b>${kacis(karakterAdi(k))}</b> · ${ik('Şimdi sen bu karakter ol')}`;
  $('#rol-metin').placeholder = `${karakterAdi(k)} ne söylüyor?`;
  document.querySelectorAll('#karakter-katmani .jeton').forEach((el) => el.classList.toggle('konusan', +el.dataset.uid === k.uid));
}

function rolSoyle() {
  const k = rolKim(), metin = $('#rol-metin').value.trim().slice(0, 160);
  if (!k || !metin) return;
  k.soz = { tur: 'soyle', metin };
  jetonGuncelle(jetonEl(k.uid), k);
  rol.satirlar.push({ t: Date.now(), kim: karakterAdi(k), metin });
  durum.sozler.push({ t: Date.now(), kim: karakterAdi(k), kid: k.kid, tur: 'soyle', metin, sesVar: false });
  akisEkle(`🪑 ${karakterAdi(k)}: “${metin}”`);
  $('#rol-metin').value = '';
}

function rolDegistir() {
  if (!rol) return;
  rol.sira = rol.sira === 'a' ? 'b' : 'a';
  rol.degisim++;
  ses.ton(500, 800, 0.15, 0.08);
  rolCubugu();
  akisEkle(`🔄 Taraf değişti: çocuk şimdi ${karakterAdi(rolKim())}`);
  oku('Şimdi sen bu karakter ol');
  $('#rol-metin').focus();
}

function rolBitir() {
  if (!rol) return;
  const r = rol, ad = (uid) => { const k = durum.sahnede.find((x) => x.uid === uid); return k ? karakterAdi(k) : '?'; };
  rol = null;
  if (r.satirlar.length || r.degisim) durum.roller.push({ t: r.t, a: ad(r.a), b: ad(r.b), satirlar: r.satirlar, degisim: r.degisim });
  $('#ekran-sahne').classList.remove('rol-modu');
  document.querySelectorAll('#karakter-katmani .jeton.konusan').forEach((el) => el.classList.remove('konusan'));
  akisEkle(`🪑 Rol değiştirme bitti (${r.satirlar.length} söz, ${r.degisim} kez taraf değişti)`);
}

$('#btn-rol').addEventListener('click', rolAc);
$('#rol-penceresi').addEventListener('click', (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-kapat]')) return pencereKapat('rol');
  if (e.target.closest('[data-rol-basla]')) return rolBasla();
  const b = e.target.closest('[data-rol-uid]');
  if (!b) return;
  const uid = +b.dataset.rolUid;
  rolSecim = rolSecim.includes(uid) ? rolSecim.filter((x) => x !== uid) : [...rolSecim, uid].slice(-2);
  document.querySelectorAll('.rol-kart').forEach((x) => x.classList.toggle('aktif', rolSecim.includes(+x.dataset.rolUid)));
  $('[data-rol-basla]').disabled = rolSecim.length !== 2;
});
$('#btn-rol-soyle').addEventListener('click', rolSoyle);
$('#rol-metin').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); rolSoyle(); } });
$('#btn-rol-degistir').addEventListener('click', rolDegistir);
$('#btn-rol-bitir').addEventListener('click', rolBitir);

// ================= Aile ağacı (genogram) =================
// k: kuşak (0 büyükanne-büyükbaba, 1 ebeveyn, 2 çocuk), c: e / k / ? (belirsiz)
const GENOGRAM_VARSAYILAN = {
  anne: [1, 'k'], 'anne-basortulu': [1, 'k'], 'hamile-anne': [1, 'k'], 'kucak-bebek': [1, 'k'], teyze: [1, 'k'],
  baba: [1, 'e'], 'baba-sakalli': [1, 'e'], amca: [1, 'e'], anneanne: [0, 'k'], dede: [0, 'e'],
  ben: [2, '?'], kiz: [2, 'k'], erkek: [2, 'e'], abla: [2, 'k'], abi: [2, 'e'], bebek: [2, '?'], kardes: [2, '?'], tekerlekli: [2, '?'], ergen: [2, '?'], arkadas: [2, '?'],
};
const KUSAKLAR = ['Büyükanne / büyükbaba', 'Ebeveyn kuşağı', 'Çocuklar'];
const insanMi = (k) => { const kar = karakterBul(k.kid); return kar.cizim?.tur === 'insan' || ['ebeveyn', 'cocuk'].includes(kar.kat); };

function genogramAyari(k) {
  const v = GENOGRAM_VARSAYILAN[k.kid], kar = karakterBul(k.kid);
  const kayitli = durum.genogramAyar[k.uid] || {};
  return { kusak: kayitli.kusak ?? (v ? v[0] : 1), c: kayitli.c ?? (v ? v[1] : '?'), dahil: kayitli.dahil ?? (['ebeveyn', 'cocuk'].includes(kar.kat) && k.kid !== 'arkadas') };
}

function genogramSvg() {
  const kisiler = durum.sahnede.filter(insanMi).map((k) => ({ k, ...genogramAyari(k) })).filter((x) => x.dahil);
  const W = 760, satirY = [90, 270, 450], R = 30;
  const satirlar = [0, 1, 2].map((ks) => kisiler.filter((x) => x.kusak === ks));
  // Her kuşakta erkekler solda, kadınlar sağda, belirsizler sonda: ilk erkek ile ilk kadın çift olarak çizilir.
  satirlar.forEach((s) => s.sort((a, b) => 'ek?'.indexOf(a.c) - 'ek?'.indexOf(b.c)));
  const yer = new Map();
  satirlar.forEach((s, ks) => {
    const ara = Math.min(210, (W - 120) / Math.max(1, s.length));
    const bas = W / 2 - (ara * (s.length - 1)) / 2;
    s.forEach((x, i) => yer.set(x.k.uid, [bas + i * ara, satirY[ks]]));
  });
  let cizgi = '';
  const ciftler = [];
  satirlar.forEach((s, ks) => {
    const e = s.find((x) => x.c === 'e'), k = s.find((x) => x.c === 'k');
    if (e && k && ks < 2) {
      const [x1, y] = yer.get(e.k.uid), [x2] = yer.get(k.k.uid);
      cizgi += `<path d="M${x1} ${y + R} V${y + 46} H${x2} V${y + R}" fill="none" stroke="#37474f" stroke-width="3"/>`;
      ciftler[ks] = [(x1 + x2) / 2, y + 46];
    }
  });
  // Çocuklar ebeveyn çiftine kardeş çizgisiyle bağlanır; büyükanne-büyükbaba ebeveyn kuşağına kesik çizgiyle.
  const cocuklar = satirlar[2];
  if (cocuklar.length) {
    const ust = ciftler[1] || (satirlar[1][0] ? [yer.get(satirlar[1][0].k.uid)[0], satirY[1] + R] : null);
    const xs = cocuklar.map((x) => yer.get(x.k.uid)[0]), barY = satirY[2] - 60;
    cocuklar.forEach((x) => { const [cx, cy] = yer.get(x.k.uid); cizgi += `<path d="M${cx} ${cy - R} V${barY}" stroke="#37474f" stroke-width="3"/>`; });
    if (xs.length > 1) cizgi += `<path d="M${Math.min(...xs)} ${barY} H${Math.max(...xs)}" stroke="#37474f" stroke-width="3"/>`;
    if (ust) {
      const orta = xs.length > 1 ? (Math.min(...xs) + Math.max(...xs)) / 2 : xs[0];
      cizgi += `<path d="M${ust[0]} ${ust[1]} V${barY - 20} H${orta} V${barY}" fill="none" stroke="#37474f" stroke-width="3"/>`;
    }
  }
  if (satirlar[0].length && satirlar[1].length) {
    const ust = ciftler[0] || [yer.get(satirlar[0][0].k.uid)[0], satirY[0] + R];
    const alt = ciftler[1] ? [ciftler[1][0], satirY[1] - R] : [yer.get(satirlar[1][0].k.uid)[0], satirY[1] - R];
    cizgi += `<path d="M${ust[0]} ${ust[1]} V${(ust[1] + alt[1]) / 2} H${alt[0]} V${alt[1]}" fill="none" stroke="#90a4ae" stroke-width="3" stroke-dasharray="8 6"/>`;
  }
  // Çocuğun kurduğu bağlar genogram ilişki çizgileri olarak eklenir.
  const baglar = durum.baglar.filter((g) => yer.has(g.a) && yer.has(g.b)).map((g) => {
    const t = bagTuru(g.tur), [x1, y1] = yer.get(g.a), [x2, y2] = yer.get(g.b);
    const ek = t.id === 'yakin' ? `<path d="${bagYolu([x1, y1 + 8], [x2, y2 + 8], 'yakin')}" stroke="${t.renk}" stroke-width="3" fill="none"/>` : '';
    return `<path d="${bagYolu([x1, y1], [x2, y2], t.id)}" style="${t.stil.replace(/stroke-width:\d+/, 'stroke-width:3')}" stroke="${t.renk}" fill="none" opacity=".85"/>${ek}`;
  }).join('');
  const sembol = (x) => {
    const [cx, cy] = yer.get(x.k.uid), ben = x.k.kid === 'ben', d = duyguBul(x.k.duygu);
    const sekil = x.c === 'e' ? `<rect x="${cx - R}" y="${cy - R}" width="${R * 2}" height="${R * 2}"/>`
      : x.c === 'k' ? `<circle cx="${cx}" cy="${cy}" r="${R}"/>`
        : `<path d="M${cx} ${cy - R - 4} L${cx + R + 4} ${cy} L${cx} ${cy + R + 4} L${cx - R - 4} ${cy}z"/>`;
    const cift = ben ? (x.c === 'e' ? `<rect x="${cx - R + 6}" y="${cy - R + 6}" width="${R * 2 - 12}" height="${R * 2 - 12}"/>` : x.c === 'k' ? `<circle cx="${cx}" cy="${cy}" r="${R - 6}"/>` : `<path d="M${cx} ${cy - R + 4} L${cx + R - 4} ${cy} L${cx} ${cy + R - 4} L${cx - R + 4} ${cy}z"/>`) : '';
    return `<g fill="#fff" stroke="#263238" stroke-width="3">${sekil}${cift}</g>
      ${d ? `<text x="${cx}" y="${cy + 9}" text-anchor="middle" font-size="24">${d.emoji}</text>` : ben ? `<text x="${cx}" y="${cy + 8}" text-anchor="middle" font-size="22">⭐</text>` : ''}
      <text x="${cx}" y="${cy - R - 10}" text-anchor="middle" font-size="18" font-weight="700" fill="#263238" font-family="Segoe UI, sans-serif">${kacis(karakterAdi(x.k))}</text>`;
  };
  const dolu = [0, 1, 2].filter((ks) => satirlar[ks].length), Y0 = dolu.length ? satirY[dolu[0]] - 80 : 0;
  const H = (dolu.length ? satirY[dolu[dolu.length - 1]] + 110 : 550) - Y0;
  const efsane = BAG_TURLERI.filter((t) => durum.baglar.some((g) => g.tur === t.id && yer.has(g.a) && yer.has(g.b)))
    .map((t, i) => `<g transform="translate(${20 + i * 130} ${Y0 + H - 34})"><path d="${bagYolu([0, 0], [50, 0], t.id)}" style="${t.stil.replace(/stroke-width:\d+/, 'stroke-width:3')}" stroke="${t.renk}" fill="none"/><text x="58" y="6" font-size="15" fill="#455a64" font-family="Segoe UI, sans-serif">${t.ad}</text></g>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${Y0} ${W} ${H}" width="${W}" height="${H}"><rect y="${Y0}" width="${W}" height="${H}" fill="#fff"/>
    ${kisiler.length ? '' : `<text x="${W / 2}" y="270" text-anchor="middle" font-size="22" fill="#90a4ae" font-family="Segoe UI, sans-serif">Sahnede aile karakteri yok</text>`}
    ${cizgi}${baglar}${kisiler.map(sembol).join('')}${efsane}
    <text x="${W - 12}" y="${Y0 + H - 10}" text-anchor="end" font-size="13" fill="#90a4ae" font-family="Segoe UI, sans-serif">□ erkek  ○ kadın  ◇ belirtilmemiş  · çift çizgili: çocuğun kendisi</text></svg>`;
}

function genogramAc() {
  rehberKapat();
  const kisiler = durum.sahnede.filter(insanMi);
  $('#genogram-ayarlar').innerHTML = kisiler.length ? kisiler.map((k) => {
    const a = genogramAyari(k);
    return `<div class="genogram-satir" data-g-uid="${k.uid}"><label><input type="checkbox" data-g="dahil" ${a.dahil ? 'checked' : ''}> ${kacis(karakterAdi(k))}</label>
      <select data-g="kusak">${KUSAKLAR.map((ad, i) => `<option value="${i}" ${a.kusak === i ? 'selected' : ''}>${ad}</option>`).join('')}</select>
      <select data-g="c">${[['e', 'Erkek'], ['k', 'Kadın'], ['?', 'Belirtilmemiş']].map(([v, ad]) => `<option value="${v}" ${a.c === v ? 'selected' : ''}>${ad}</option>`).join('')}</select></div>`;
  }).join('') : '<p class="bos-mesaj">Sahnede insan karakter yok.</p>';
  $('#genogram-cizim').innerHTML = genogramSvg();
  pencereAc('genogram');
}

$('#genogram-ayarlar').addEventListener('change', (e) => {
  const satir = e.target.closest('[data-g-uid]'), alan = e.target.dataset.g;
  if (!satir || !alan) return;
  const uid = satir.dataset.gUid, a = durum.genogramAyar[uid] = { ...genogramAyari(durum.sahnede.find((k) => k.uid === +uid)), ...(durum.genogramAyar[uid] || {}) };
  a[alan] = alan === 'dahil' ? e.target.checked : alan === 'kusak' ? +e.target.value : e.target.value;
  $('#genogram-cizim').innerHTML = genogramSvg();
  taslakKaydet();
});
$('#btn-genogram').addEventListener('click', genogramAc);
$('#genogram-penceresi').addEventListener('click', (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-kapat]')) return pencereKapat('genogram');
  if (!e.target.closest('[data-genogram-ekle]')) return;
  durum.genogram = { t: Date.now(), svg: genogramSvg() };
  akisEkle('🌳 Aile ağacı rapora eklendi');
  bildir('🌳 Aile ağacı rapora eklendi');
  pencereKapat('genogram');
});

// ================= Oturum süresi ve kapanış ritüeli =================
let sureBaslangic = 0, sureUyarildi = 0;
const sureKalan = () => (sureHedef ? sureHedef * 60000 - (Date.now() - sureBaslangic) : null);

function sureDenetle() {
  const kalan = sureKalan(), dugme = $('#btn-rehber');
  const sureYazisi = kalan === null ? '' : kalan > 0 ? `Kalan: ${Math.ceil(kalan / 60000)} dk` : `Süre ${Math.ceil(-kalan / 60000)} dk aşıldı`;
  $('#sure-kalan').textContent = sureYazisi;
  $('#sure-kalan-e').textContent = sureYazisi;
  const esik = Math.min(5, Math.max(1, (sureHedef || 25) / 5)) * 60000;
  dugme.classList.toggle('sure-uyari', kalan !== null && kalan <= esik && kalan > 0);
  dugme.classList.toggle('sure-bitti', kalan !== null && kalan <= 0);
  if (kalan !== null && kalan <= esik && sureUyarildi < 1) { sureUyarildi = 1; bildir(`⏱️ ${Math.round(esik / 60000)} dakika kaldı`); ses.ton(660, 660, 0.15, 0.03); canliGonderSonra(); }
  if (kalan !== null && kalan <= 0 && sureUyarildi < 2) { sureUyarildi = 2; bildir('⏱️ Süre doldu'); ses.ton(520, 520, 0.2, 0.03); canliGonderSonra(); }
}
setInterval(sureDenetle, 10000);
$('#sure-hedef').addEventListener('change', (e) => {
  sureHedef = +e.target.value || null;
  sureBaslangic = Date.now(); sureUyarildi = 0;
  sureDenetle();
  if (sureHedef) bildir(`⏱️ ${sureHedef} dakika: 5 dakika kala sessizce haber verilir`);
  canliGonderSonra();
});

const NINNI = [392, 330, 392, 330, 349, 294, 330, 262, 294, 330, 262];
async function kapanisRituali() {
  if (!$('#ekran-sahne').classList.contains('aktif')) return;
  rehberKapat(); secimKaldir();
  if (rol) rolBitir();
  if (kokAktif) kokKapat();
  const jetonlar = [...document.querySelectorAll('#karakter-katmani .jeton')];
  $('#ekran-sahne').classList.add('kapanis-modu');
  NINNI.forEach((f, i) => setTimeout(() => ses.ton(f, f * 0.99, 0.5, 0.05, 'triangle'), i * 520));
  jetonlar.forEach((el, i) => setTimeout(() => el.classList.add('uyuyor'), 500 + i * 380));
  akisEkle('🌙 Kapanış ritüeli: oyuncaklar uyutuldu');
  await uyu(900 + jetonlar.length * 380 + 900);
  $('#kapanis-yazi').innerHTML = ik('Oyuncaklar uyuyor. Gelecek sefere kadar hoşça kal!');
  $('#kapanis').classList.remove('gizli');
  oku('Oyuncaklar uyuyor. Gelecek sefere kadar hoşça kal!');
}

function kapanisBitir() {
  $('#kapanis').classList.add('gizli');
  $('#ekran-sahne').classList.remove('kapanis-modu');
  document.querySelectorAll('#karakter-katmani .jeton.uyuyor').forEach((el) => el.classList.remove('uyuyor'));
  if (mod === 'ebeveyn' && ebeveynBitiyor) { ebeveynBitiyor = false; return gunlukFormAc(); }
  if (!cocukSerbest() && mod !== 'ebeveyn') bildir('💾 Oturumu kaydetmeyi unutmayın');
}
$('#btn-kapanis').addEventListener('click', kapanisRituali);
$('#kapanis').addEventListener('click', (e) => { if (e.target.closest('[data-kapanis-bitti]')) kapanisBitir(); });

// ================= Veli / öğretmen özeti =================
const GUCLU_YANLAR = ['Hayal gücü zengin', 'Duygularını adlandırabiliyor', 'Oyuna kolayca katıldı', 'Kendini ifade etmeye istekli', 'Sorun çözmeye çalıştı',
  'Yardım istemeyi biliyor', 'Dikkatini uzun süre sürdürebildi', 'Kurallara ve sınırlara uydu', 'Başkalarının duygularını fark ediyor', 'Sakinleşme yollarını deniyor'];
const ONERILER = ['Her gün 10–15 dakika çocuğun yönettiği oyun zamanı ayırmak', 'Duygularını adlandırarak yansıtmak (“Kızgın görünüyorsun.”)', 'Balon nefesini birlikte uygulamak (4 saniye al, 2 tut, 6 ver)',
  'Uyku öncesi sakin ve öngörülebilir bir rutin', 'Olumlu davranışı fark edip söylemek', 'Ekran süresini sınırlayıp birlikte oyun oynamak', 'Hikaye Modu’nun Ebeveyn modunda haftada 3 kez 10–15 dakika özel oyun zamanı', 'Değişiklikleri (taşınma, kardeş vb.) önceden ve basitçe anlatmak',
  'Çabayı övmek, sonucu değil', 'Okul ile ev arasında düzenli iletişim'];

function yapilanlarMetni() {
  const s = [];
  const yerler = durum.gezilen.map((id) => ortamBul(id)?.ad).filter(Boolean);
  s.push(`Oyun ve hikaye kurma çalışması yaptık${yerler.length ? ` (${yerler.slice(0, 4).join(', ')})` : ''}.`);
  if (durum.icHava.bas || durum.icHava.son) s.push('Çocuk o günkü duygularını bir hava durumuyla anlattı.');
  if (durum.bedenler.length) s.push('Duyguların bedende nerede hissedildiğini konuştuk.');
  if (durum.endiseler.length) s.push('Endişeleri dile getirme ve onları “bırakma” oyunu oynadık.');
  if (durum.akis.some((a) => a.m.startsWith('🎈'))) s.push('Balon nefesiyle sakinleşme alıştırması yaptık.');
  if (durum.dilekler.length) s.push('“Nasıl olmasını isterdin?” sorusuyla dileklerini sahnede gösterdi.');
  if (durum.kokler.length) s.push('Yarım kalan hikayeleri tamamlama oyunu oynadık.');
  if (durum.roller.length) s.push('Farklı karakterlerin yerine geçerek onların gözünden bakmayı denedik.');
  if (durum.guvenliYer || durum.alanlar.length) s.push('Kendisi için güvenli bir yer kurdu.');
  if (durum.akis.some((a) => a.m.startsWith('🌙'))) s.push('Oturumu sakin bir kapanış ritüeliyle bitirdik.');
  return s.join(' ');
}

function veliAc() {
  rehberKapat();
  const v = durum.veli || {};
  $('#veli-kime').value = v.kime || 'veli';
  $('#veli-yapilan').value = v.yapilan || yapilanlarMetni();
  $('#veli-guclu').value = v.guclu || '';
  $('#veli-oneri').value = v.oneri || '';
  $('#veli-sonraki').value = v.sonraki || '';
  $('#veli-guclu-cipler').innerHTML = GUCLU_YANLAR.map((m) => `<button class="tema-cip" style="--renk:#43a047" data-ekle="veli-guclu">${kacis(m)}</button>`).join('');
  $('#veli-oneri-cipler').innerHTML = ONERILER.map((m) => `<button class="tema-cip" style="--renk:#1e88e5" data-ekle="veli-oneri">${kacis(m)}</button>`).join('');
  pencereAc('veli');
}

function veliOku() {
  durum.veli = { kime: $('#veli-kime').value, yapilan: $('#veli-yapilan').value.trim(), guclu: $('#veli-guclu').value.trim(), oneri: $('#veli-oneri').value.trim(), sonraki: $('#veli-sonraki').value.trim() };
  taslakKaydet();
  return durum.veli;
}

function veliHTML(v) {
  const satirlar = (m) => kacis(m).split(/\n+/).filter(Boolean).map((x) => `<li>${x.replace(/^[-•]\s*/, '')}</li>`).join('');
  const kime = v.kime === 'ogretmen' ? 'Sayın Öğretmenimiz' : 'Sayın Velimiz';
  return `<h1>Rehberlik Servisi — Görüşme Bilgilendirmesi</h1>
    <p class="alt-baslik">${new Date(durum.baslangic).toLocaleDateString('tr-TR', { dateStyle: 'long' })} · yaklaşık ${Math.max(1, Math.round((Date.now() - durum.baslangic) / 60000))} dakika</p>
    <p>${kime},</p>
    <h2>Bugün birlikte neler yaptık?</h2><p>${kacis(v.yapilan)}</p>
    ${v.guclu ? `<h2>Gözlemlediğimiz güçlü yanlar</h2><ul>${satirlar(v.guclu)}</ul>` : ''}
    ${v.oneri ? `<h2>${v.kime === 'ogretmen' ? 'Sınıfta' : 'Evde'} destek olabilecek öneriler</h2><ul>${satirlar(v.oneri)}</ul>` : ''}
    ${v.sonraki ? `<h2>Sonraki görüşme</h2><p>${kacis(v.sonraki)}</p>` : ''}
    <p class="gizlilik">Bu özet, çocuğun güvenini korumak için oyun içeriğine, çocuğun anlattıklarına ve danışmanlık notlarına yer vermez.
      Sorularınız için rehberlik servisiyle görüşebilirsiniz.</p>`;
}

$('#btn-veli').addEventListener('click', veliAc);
$('#veli-penceresi').addEventListener('click', async (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-kapat]')) { veliOku(); return pencereKapat('veli'); }
  const cip = e.target.closest('[data-ekle]');
  if (cip) {
    const alan = $('#' + cip.dataset.ekle);
    if (!alan.value.includes(cip.textContent)) alan.value = (alan.value.trim() ? alan.value.trim() + '\n' : '') + cip.textContent;
    return;
  }
  if (e.target.closest('[data-veli="yenile"]')) { $('#veli-yapilan').value = yapilanlarMetni(); return; }
  if (!e.target.closest('[data-veli="yazdir"]')) return;
  const v = veliOku();
  const rapor = $('#rapor');
  rapor.className = 'veli';
  rapor.innerHTML = veliHTML(v);
  akisEkle(`👪 ${v.kime === 'ogretmen' ? 'Öğretmen' : 'Veli'} özeti hazırlandı`);
  window.print();
});

// ================= Rapor ekleri: kökler, güvenli yer, rol değiştirme, aile ağacı =================
function raporEkleri() {
  const zaman = (t) => sureYaz(t - durum.baslangic);
  const kokler = durum.kokler.map((k, i) => `<div class="dilek-rapor"><p><b>${i + 1}. ${kacis(k.ad)}</b> · ${zaman(k.t)} · ${sureYaz(k.sureSn * 1000)} sürdü</p>
    <p class="kok-alinti">“${kacis(k.metin)}”</p>${k.resim ? `<figure style="max-width:120mm"><img src="${k.resim}" alt=""><figcaption>Çocuğun tamamladığı hâl</figcaption></figure>` : ''}
    ${k.not ? `<p><b>Not:</b> ${kacis(k.not)}</p>` : ''}</div>`).join('');
  const roller = durum.roller.map((r, i) => `<div class="dilek-rapor"><p><b>${i + 1}. ${kacis(r.a)} ↔ ${kacis(r.b)}</b> · ${zaman(r.t)} · ${r.degisim} kez taraf değişti</p>
    ${r.satirlar.length ? `<ol>${r.satirlar.map((s) => `<li><b>${kacis(s.kim)}:</b> “${kacis(s.metin)}”</li>`).join('')}</ol>` : ''}</div>`).join('');
  const g = durum.guvenliYer;
  return `${sosyalRaporu()}${kokler ? `<h2>Hikaye kökleri</h2>${kokler}` : ''}
    ${roller ? `<h2>Rol değiştirme (boş sandalye)</h2>${roller}` : ''}
    ${g ? `<h2>Güvenli yer: “${kacis(g.ad)}”</h2><div class="dilek-rapor">${g.resim ? `<figure style="max-width:120mm"><img src="${g.resim}" alt=""></figure>` : ''}
      <p>${kacis(ortamBul(g.ortam).ad)} · ${g.sahnede.map((k) => kacis(karakterAdi(k))).join(', ') || 'karakter yok'}</p></div>` : ''}
    ${riskRaporu()}
    ${durum.genogram ? `<h2>Aile ağacı</h2><div class="genogram-rapor">${durum.genogram.svg}</div>` : ''}`;
}

// ================= Telefondan yönetim =================
const ETKINLIKLER = {
  'ichava-bas': () => icHavaSor('bas'), 'ichava-son': () => icHavaSor('son'), beden: bedenAc, endise: endiseAc, sakin: sakinAc,
  dilek: dilekBaslat, kapanis: kapanisRituali, kokler: koklerAc, guvenli: guvenliAc, rol: rolAc, isik: () => $('#btn-isik').click(),
  hava: () => $('#btn-hava').click(), perde: () => tiyatroBurada() && perdeAyarla(!durum.perdeKapali), alkis: () => tiyatroBurada() && alkisla(),
};

function soruGruplari() {
  const s = senaryoBul(durum.senaryo), g = Object.entries(SORULAR);
  if (s) g.unshift([`${s.ikon} Senaryo: ${s.ad}`, s.sorular]);
  return g;
}

function canliDurumu() {
  const o = ortamBul(durum.ortamId);
  return {
    kod: $('#danisan-kod').value.trim(), sure: Date.now() - durum.baslangic, kalan: sureKalan(),
    ekran: document.querySelector('.ekran.aktif')?.id.replace('ekran-', '') || '', ortam: o ? `${o.ikon} ${o.ad}` : '',
    hava: `${HAVALAR[durum.havaI].emoji} ${HAVALAR[durum.havaI].ad}`, karanlik: !!durum.karanlik, tiyatro: tiyatroBurada(),
    karakterler: gorunenler().map((k) => { const kar = karakterBul(k.kid), d = duyguBul(k.duygu); return { ad: karakterAdi(k), emoji: kar.emoji, duygu: d ? `${d.emoji} ${duyguMetni(d, siddetOf(k))}` : '', guc: (k.guc || []).map((g) => gucBul(g)?.emoji).join(''), saklandi: !!k.saklandi }; }),
    akis: durum.akis.slice(-60).map((a) => ({ t: sureYaz(a.t - durum.baslangic), m: a.m })),
    sorular: soruGruplari(), sorulanlar: durum.sorulanlar,
    temalar: TEMALAR.map((t) => ({ ...t, aktif: durum.temalar.includes(t.id) })),
    not: $('#notlar').value, icHava: { bas: icHavaBul(durum.icHava.bas)?.emoji || '', son: icHavaBul(durum.icHava.son)?.emoji || '' },
    kokler: KOKLER.map((k) => ({ id: k.id, ad: `${k.ikon} ${k.ad}` })), kok: kokAktif ? kokBul(kokAktif.id)?.ad : '', rol: !!rol, dilek: !!dilek,
  };
}

function canliGonderSonra() {
  if (!canli) return;
  clearTimeout(canli.zaman);
  canli.zaman = setTimeout(canliGonder, 350);
}

async function canliGonder() {
  if (!canli) return;
  try {
    await fetch(`api/canli/${canli.kod}/durum`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Yazici': canli.yazici }, body: JSON.stringify(canliDurumu()) });
  } catch { /* bağlantı koptuysa bir sonraki değişiklikte yeniden denenir */ }
}

function komutUygula(k) {
  switch (k.tur) {
    case 'soru': {
      const s = String(k.soru || '');
      if (!s) return;
      if (durum.sorulanlar.includes(s)) { durum.sorulanlar = durum.sorulanlar.filter((x) => x !== s); taslakKaydet(); }
      else { durum.sorulanlar.push(s); akisEkle(`💬 Soru: ${s}`); oku(s); }
      return soruKartlariCiz();
    }
    case 'tema': {
      const t = temaBul(k.tema);
      if (!t) return;
      if (durum.temalar.includes(t.id)) { durum.temalar = durum.temalar.filter((x) => x !== t.id); taslakKaydet(); } else { durum.temalar.push(t.id); akisEkle(`🏷️ Tema: ${t.ad}`); }
      return temalariCiz();
    }
    case 'not': $('#notlar').value = String(k.metin || '').slice(0, 20000); return taslakKaydet();
    case 'gozlem': { const m = String(k.metin || '').trim().slice(0, 300); if (m) akisEkle(`📝 ${m}`); return; }
    case 'an': if ($('#ekran-sahne').classList.contains('aktif')) $('#btn-an').click(); return;
    case 'kaydet': return $('#btn-kaydet').click();
    case 'kod': $('#danisan-kod').value = String(k.metin || '').slice(0, 40); return taslakKaydet();
    case 'kok': if ($('#ekran-sahne').classList.contains('aktif') || durum.ortamId) kokBaslat(kokBul(k.id)); return;
    case 'panel': return panelTelefonda(!!k.gizle);
    case 'etkinlik':
      // Danışmana ait ayar pencereleri kapanır; çocuğun o an kullandığı bir pencere açıksa etkinlik başlamaz.
      ['kumanda', 'kisayol', 'kurulum'].forEach(pencereKapat);
      if (!$('#ekran-sahne').classList.contains('aktif')) return bildir('📱 Etkinlik için önce sahneye geçin');
      if (acikPencereVar()) return bildir('📱 Önce açık pencereyi kapatın');
      return ETKINLIKLER[k.ad]?.();
  }
}

async function canliDongu() {
  while (canli) {
    const c = canli;
    try {
      const y = await fetch(`api/canli/${c.kod}/komut?sonra=${c.son}`, { headers: { 'X-Yazici': c.yazici } });
      if (y.status === 404) { canliKapat(true); break; }
      const v = await y.json();
      c.telefon = v.telefon;
      v.komutlar.forEach((k) => { c.son = Math.max(c.son, k.id); komutUygula(k); });
      if (!$('#kumanda-penceresi').classList.contains('gizli')) kumandaCiz();
    } catch { /* geçici ağ hatası */ }
    await uyu(1200);
  }
}

async function canliAc() {
  try {
    const y = await kayitIstek('api/canli/ac', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    if (!y.ok) throw new Error(y.status);
    const v = await y.json();
    canli = { kod: v.kod, yazici: v.yazici, son: 0, telefon: null, zaman: 0, adresler: v.adresler || [] };
    canliGonder();
    canliDongu();
    canli.nabiz = setInterval(canliGonder, 15000);
    akisEkle('📱 Telefondan yönetim açıldı');
    kumandaCiz();
  } catch {
    bildir('⚠️ Bağlantı açılamadı — program Baslat.cmd ile açık mı?');
  }
}

function canliKapat(sunucuKapatti = false) {
  if (!canli) return;
  const c = canli;
  canli = null;
  clearInterval(c.nabiz);
  if (!sunucuKapatti) fetch(`api/canli/${c.kod}`, { method: 'DELETE', headers: { 'X-Yazici': c.yazici } }).catch(() => {});
  panelTelefonda(false);
  akisEkle('📱 Telefon bağlantısı kapatıldı');
  kumandaCiz();
}

function panelTelefonda(gizle) {
  $('#ekran-sahne').classList.toggle('panel-telefonda', gizle);
  if (gizle) rehberKapat();
}

function kumandaCiz() {
  const c = canli;
  if (!c) {
    $('#kumanda-icerik').innerHTML = `<p>Not alma, soru kartları, temalar ve etkinlikler danışmanın telefonundan yönetilir; tablette yalnızca çocuğun sahnesi kalır.
      Bağlantı yalnızca bu ağın içindedir, internete çıkmaz.</p>
      <div class="pencere-dugmeler" style="justify-content:flex-start"><button class="buyuk-btn kucuk" data-kumanda="ac">📱 Bağlantıyı aç</button></div>`;
    return;
  }
  const adresler = [...new Set([location.origin, ...c.adresler.map((a) => `${location.protocol}//${a}:${location.port || (location.protocol === 'https:' ? 443 : 80)}`)])]
    .filter((a) => !/localhost|127\.0\.0\.1/.test(a) || !c.adresler.length);
  const bagli = c.telefon !== null && c.telefon !== undefined && c.telefon < 10;
  $('#kumanda-icerik').innerHTML = `
    <ol class="kumanda-adimlar"><li>Telefon bu bilgisayarla <b>aynı Wi-Fi ağında</b> olsun.</li>
      <li>Telefonun tarayıcısında şu adreslerden birini açın:${adresler.map((a) => `<code>${kacis(a)}/kumanda.html</code>`).join('')}</li>
      <li>Eşleşme kodunu girin:</li></ol>
    <div class="eslesme-kodu">${c.kod.slice(0, 3)} ${c.kod.slice(3)}</div>
    <p class="koruma-durum ${bagli ? 'acik' : ''}">${bagli ? '✅ Telefon bağlı' : '⏳ Telefon bekleniyor…'}</p>
    <label class="secenek"><input type="checkbox" data-kumanda="gizle" ${$('#ekran-sahne').classList.contains('panel-telefonda') ? 'checked' : ''}> Tablette 📋 rehber düğmesini gizle
      <small>(geri getirmek için: sahne adına üç kez dokunun ya da telefondan açın)</small></label>
    <div class="pencere-dugmeler" style="justify-content:flex-start"><button class="ince-btn tehlike" data-kumanda="kapat">Bağlantıyı kapat</button></div>`;
}

$('#btn-kumanda').addEventListener('click', () => { rehberKapat(); kumandaCiz(); pencereAc('kumanda'); });
$('#kumanda-penceresi').addEventListener('click', (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-kapat]')) return pencereKapat('kumanda');
  const k = e.target.closest('[data-kumanda]')?.dataset.kumanda;
  if (k === 'ac') canliAc();
  if (k === 'kapat') canliKapat();
});
$('#kumanda-penceresi').addEventListener('change', (e) => { if (e.target.dataset.kumanda === 'gizle') { panelTelefonda(e.target.checked); canliGonderSonra(); } });
// Rehber düğmesi gizliyken sahne adına üç kez dokunmak geri getirir.
let adDokunma = [];
$('#sahne-adi').addEventListener('click', () => {
  adDokunma = [...adDokunma.filter((t) => Date.now() - t < 900), Date.now()];
  if (adDokunma.length >= 3 && $('#ekran-sahne').classList.contains('panel-telefonda')) { panelTelefonda(false); adDokunma = []; bildir('📋 Rehber düğmesi geri geldi'); }
});
window.addEventListener('pagehide', () => { if (canli) navigator.sendBeacon?.(`api/canli/${canli.kod}/kapat?y=${encodeURIComponent(canli.yazici)}`); });

// ================= Tablete uygulama olarak kurma =================
let kurulumIstegi = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); kurulumIstegi = e; });
if ('serviceWorker' in navigator && window.isSecureContext && !IPAD) navigator.serviceWorker.register('sw.js').catch(() => {});
$('#btn-kurulum').addEventListener('click', () => {
  rehberKapat();
  const kurulu = matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone;
  $('#kurulum-dogrudan').classList.toggle('gizli', !kurulumIstegi);
  $('#kurulum-durum').textContent = kurulu ? '✅ Program şu an uygulama olarak açık.' : '';
  pencereAc('kurulum');
});
$('#kurulum-penceresi').addEventListener('click', async (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-kapat]')) return pencereKapat('kurulum');
  if (!e.target.closest('#kurulum-dogrudan') || !kurulumIstegi) return;
  kurulumIstegi.prompt();
  const sonuc = await kurulumIstegi.userChoice.catch(() => null);
  kurulumIstegi = null;
  if (sonuc?.outcome === 'accepted') { bildir('📲 Ana ekrana eklendi'); pencereKapat('kurulum'); }
});

geriDugmeleri();

// ================= Modlar: Psikolojik danışma · Ebeveyn · Çocuk =================
const MODLAR = {
  danisma: { ikon: '🧑‍⚕️', ad: 'Psikolojik danışma' },
  ebeveyn: { ikon: '👨‍👩‍👧', ad: 'Ebeveyn ile oyun' },
  cocuk: { ikon: '🧒', ad: 'Çocuk modu' },
};
const COCUK_ALT = { serbest: 'serbest oyun', oturum: 'oturumda sade ekran' };

function modUygula() {
  const b = document.body;
  ['danisma', 'ebeveyn', 'cocuk'].forEach((m) => b.classList.toggle('mod-' + m, mod === m));
  b.classList.toggle('cocuk-serbest', cocukSerbest());
  b.classList.toggle('cocuk-oturum', mod === 'cocuk' && cocukAlt === 'oturum');
  b.classList.toggle('ev-surumu', EV_SURUMU);
  b.classList.toggle('ipad-surumu', IPAD);
  const m = MODLAR[mod];
  $('#btn-mod').innerHTML = `${m.ikon} ${m.ad} <small>· modu değiştir</small>`;
  document.title = mod === 'ebeveyn' ? 'Hikaye Modu · Ebeveyn' : mod === 'cocuk' ? 'Hikaye Modu' : 'Hikaye Modu · Danışma';
  devamGuncelle();
}

// --- Çocuk kilidi (PIN). Gerçek güvenlik değil, çocuğun yanlışlıkla çıkmasını önler; kayıtları parola korur. ---
const PIN_ANAHTAR = 'hikaye-modu-pin';
const pinOzet = (p) => { let h = 5381; for (const c of 'hikaye-pin:' + p) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0; return h.toString(36); };
const pinVar = () => { try { return !!localStorage.getItem(PIN_ANAHTAR); } catch { return false; } };
let pinCevap = null, pinGirilen = '';

function pinSor(baslik, aciklama = '') {
  pinCevap?.(null);
  pinGirilen = '';
  $('#pin-baslik').textContent = baslik;
  $('#pin-aciklama').textContent = aciklama;
  $('#pin-hata').textContent = '';
  pinNoktalari();
  pencereAc('pin');
  return new Promise((tamam) => { pinCevap = tamam; });
}
function pinNoktalari() { $('#pin-noktalar').innerHTML = [0, 1, 2, 3].map((i) => `<i class="${i < pinGirilen.length ? 'dolu' : ''}"></i>`).join(''); }
function pinBitir(deger) { pencereKapat('pin'); const c = pinCevap; pinCevap = null; c?.(deger); }

$('#pin-tuslar').innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'vazgec', 0, 'sil'].map((t) => `<button data-pin="${t}">${t === 'sil' ? '⌫' : t === 'vazgec' ? '✖' : t}</button>`).join('');
$('#pin-penceresi').addEventListener('click', (e) => {
  const t = e.target.closest('[data-pin]')?.dataset.pin;
  if (!t) return;
  if (t === 'vazgec') return pinBitir(null);
  if (t === 'sil') pinGirilen = pinGirilen.slice(0, -1);
  else if (pinGirilen.length < 4) pinGirilen += t;
  pinNoktalari();
  if (pinGirilen.length === 4) setTimeout(() => pinBitir(pinGirilen), 150);
});
document.addEventListener('keydown', (e) => {
  if ($('#pin-penceresi').classList.contains('gizli')) return;
  if (/^\d$/.test(e.key) && pinGirilen.length < 4) { pinGirilen += e.key; pinNoktalari(); if (pinGirilen.length === 4) setTimeout(() => pinBitir(pinGirilen), 150); }
  if (e.key === 'Backspace') { pinGirilen = pinGirilen.slice(0, -1); pinNoktalari(); }
  if (e.key === 'Escape') pinBitir(null);
});

async function pinKur() {
  const a = await pinSor('Yeni PIN', 'Çocuk modundan çıkmak için kullanılacak 4 haneli bir PIN seçin.');
  if (!a) return false;
  const b = await pinSor('PIN’i tekrar girin', 'Doğrulamak için aynı PIN’i girin.');
  if (a !== b) { bildir('⚠️ PIN’ler aynı değil'); return false; }
  try { localStorage.setItem(PIN_ANAHTAR, pinOzet(a)); } catch { return false; }
  bildir('🔐 PIN kaydedildi');
  return true;
}

// Doğru PIN bir dakika geçerli kalır (yetişkin menüsünden mod değiştirirken yeniden sorulmaz).
let pinZamani = 0;
async function pinDogrula(neden) {
  if (!pinVar() || Date.now() - pinZamani < 60000) return true;
  for (let i = 0; i < 3; i++) {
    const p = await pinSor('PIN', neden);
    if (p === null) return false;
    let dogru = false;
    try { dogru = localStorage.getItem(PIN_ANAHTAR) === pinOzet(p); } catch { /* yoksay */ }
    if (dogru) { pinZamani = Date.now(); return true; }
    await uyu(600);
    bildir('⚠️ PIN yanlış');
  }
  return false;
}

async function modDegistir(yeni, alt = cocukAlt) {
  if (EV_SURUMU && (yeni === 'danisma' || (yeni === 'cocuk' && alt !== 'serbest'))) return bildir('Ev sürümünde yalnızca ebeveyn modu ve çocuğun serbest oyunu var');
  if (yeni === mod && (yeni !== 'cocuk' || alt === cocukAlt)) return pencereKapat('mod');
  // Çocuk modundan çıkış ve danışma moduna giriş PIN ister.
  if (mod === 'cocuk' && !(await pinDogrula('Çocuk modundan çıkmak için PIN’i girin.'))) return;
  if (yeni === 'danisma' && mod === 'ebeveyn' && !(await pinDogrula('Danışma moduna geçmek için PIN’i girin.'))) return;
  if (yeni === 'cocuk' && !pinVar()) {
    bildir('🔐 Önce çocuk modundan çıkış için bir PIN belirleyin');
    if (!(await pinKur())) return;
  }
  const eskiAnahtar = taslakAnahtar();
  if (durum.sahneBasladi && !oynatiliyor) taslakKaydet();
  mod = yeni; cocukAlt = alt;
  try { localStorage.setItem('hikaye-modu-mod', mod); localStorage.setItem('hikaye-modu-cocuk-alt', cocukAlt); } catch { /* yoksay */ }
  pencereKapat('mod');
  rehberKapat();
  modUygula();
  // Danışma ile "oturumda sade ekran" aynı oturumu paylaşır; öteki modlarda giriş ekranına dönülür.
  if (taslakAnahtar() !== eskiAnahtar) { durumYukle(yeniDurum()); ekranGoster('giris'); }
  bildir(`${MODLAR[mod].ikon} ${MODLAR[mod].ad}${mod === 'cocuk' ? ` (${COCUK_ALT[cocukAlt]})` : ''}`);
}

function modPenceresiAc() {
  $('#mod-pin-durum').textContent = pinVar() ? '🔐 PIN belirlenmiş' : '🔓 PIN henüz yok (çocuk moduna geçerken istenir)';
  document.querySelectorAll('[data-mod-sec]').forEach((b) => b.classList.toggle('aktif', b.dataset.modSec === mod && (mod !== 'cocuk' || b.dataset.alt === cocukAlt)));
  pencereAc('mod');
}

$('#btn-mod').addEventListener('click', modPenceresiAc);
$('#mod-penceresi').addEventListener('click', async (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-kapat]')) { try { localStorage.setItem('hikaye-modu-mod', mod); } catch { /* yoksay */ } return pencereKapat('mod'); }
  if (e.target.closest('[data-pin-degistir]')) { if (await pinDogrula('Şu anki PIN’i girin.')) await pinKur(); return modPenceresiAc(); }
  const b = e.target.closest('[data-mod-sec]');
  if (b) modDegistir(b.dataset.modSec, b.dataset.alt || cocukAlt);
});

// --- Çocuk modunda yetişkin köşesi: sol alt köşeye 2 saniye basılı tutulur, PIN istenir. ---
let koseZamanlayici = 0;
$('#gizli-kose').addEventListener('pointerdown', (e) => {
  e.preventDefault();
  $('#gizli-kose').classList.add('basiliyor');
  koseZamanlayici = setTimeout(async () => {
    $('#gizli-kose').classList.remove('basiliyor');
    if (!(await pinDogrula('Yetişkin menüsü için PIN’i girin.'))) return;
    $('#yetiskin-rehber').classList.toggle('gizli', cocukSerbest());
    pencereAc('yetiskin');
  }, 2000);
});
['pointerup', 'pointerleave', 'pointercancel'].forEach((t) => $('#gizli-kose').addEventListener(t, () => { clearTimeout(koseZamanlayici); $('#gizli-kose').classList.remove('basiliyor'); }));
$('#yetiskin-penceresi').addEventListener('click', (e) => {
  const i = e.target.closest('[data-yetiskin]')?.dataset.yetiskin;
  if (e.target === e.currentTarget || i === 'kapat') return pencereKapat('yetiskin');
  pencereKapat('yetiskin');
  if (i === 'rehber') { $('#rehber-paneli').classList.add('acik'); $('#rehber-paneli').setAttribute('aria-hidden', 'false'); akisCiz(); }
  if (i === 'mod') modPenceresiAc();
  if (i === 'danisma') modDegistir('danisma');
});

// ================= Çocuk modu =================
$('.cocuk-kutular').addEventListener('click', (e) => {
  const k = e.target.closest('[data-cocuk-kutu]')?.dataset.cocukKutu;
  ses.baslat();
  if (k === 'ciz') cizimAc();
  if (k === 'sakin') sakinAc();
  if (k === 'endise') endiseAc();
  if (k === 'galeri') galeriAc();
  if (k === 'sosyal') sosyalAc();
});

const GALERI_ANAHTAR = 'hikaye-modu-galeri';
const galeriOku = () => { try { return JSON.parse(localStorage.getItem(GALERI_ANAHTAR) || '[]'); } catch { return []; } };
async function galeriyeEkle() {
  const resim = await sahneGoruntusu(640).catch(() => '');
  if (!resim) return;
  let liste = [{ t: Date.now(), resim, ortam: ortamBul(durum.ortamId)?.ad || '' }, ...galeriOku()].slice(0, 16);
  // Tarayıcı deposu dolarsa en eski resimler çıkarılır.
  while (liste.length) {
    try { localStorage.setItem(GALERI_ANAHTAR, JSON.stringify(liste)); break; } catch { liste = liste.slice(0, -1); }
  }
}

function galeriAc() {
  const liste = galeriOku();
  $('#galeri-icerik').innerHTML = liste.length
    ? liste.map((g, i) => `<figure class="galeri-oge"><img src="${g.resim}" alt="" data-galeri-buyut="${i}"><figcaption>${new Date(g.t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} · ${kacis(g.ortam)}
        <button class="ince-btn" data-galeri-sil="${i}" title="Sil">🗑</button></figcaption></figure>`).join('')
    : `<p class="bos-mesaj">Henüz resim yok. Hikayende 📸 düğmesine dokununca resmin buraya gelir.</p>`;
  $('#galeri-buyuk').classList.add('gizli');
  pencereAc('galeri');
}
$('#galeri-penceresi').addEventListener('click', (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-kapat]')) return pencereKapat('galeri');
  const buyut = e.target.closest('[data-galeri-buyut]'), sil = e.target.closest('[data-galeri-sil]');
  if (buyut) { $('#galeri-buyuk').src = buyut.src; $('#galeri-buyuk').classList.remove('gizli'); return; }
  if (e.target.id === 'galeri-buyuk') return $('#galeri-buyuk').classList.add('gizli');
  if (sil && confirm('Bu resim silinsin mi?')) {
    const liste = galeriOku();
    liste.splice(+sil.dataset.galeriSil, 1);
    try { localStorage.setItem(GALERI_ANAHTAR, JSON.stringify(liste)); } catch { /* yoksay */ }
    galeriAc();
  }
});

// ================= Ebeveyn modu: evde özel oyun zamanı =================
let ebeveynBitiyor = false, ipucuI = 0;
const BECERILER = [
  { id: 'betimle', ikon: '🗣️', ad: 'Betimledim', ornek: '“Ayıyı evin önüne koydun.”' },
  { id: 'ov', ikon: '👏', ad: 'Övdüm', ornek: '“Ne güzel paylaştın!” (davranışı söyleyerek)' },
  { id: 'yansit', ikon: '💛', ad: 'Duyguyu söyledim', ornek: '“Tavşan biraz korkmuş görünüyor.”' },
  { id: 'taklit', ikon: '🪞', ad: 'Taklit ettim', ornek: 'Çocuğun yaptığını siz de yapın.' },
];
const IPUCLARI = [
  'Liderlik çocuğunuzda. Ne oynanacağına, kimin ne olacağına o karar versin.',
  'Soru sormak yerine anlatın: “Kedi ağaca çıktı.” Sorular çocuğu yönlendirir.',
  'Belirli övün: “Aferin” yerine “Çok dikkatli yerleştirdin.”',
  'Duyguyu karaktere bağlayın: “Bu ayı çok kızgın.” Çocuğa “Sen mi kızgınsın?” diye sormayın.',
  'Düzeltmeyin, öğretmeyin. Ağaç mor olabilir, araba uçabilir; bu onun hikayesi.',
  'Üzücü ya da kavgalı sahneler normaldir. Sakin kalın, betimleyin, oyun içinde kalın.',
  'Telefonunuzu uzağa koyun. Bu 10–15 dakika yalnızca onun.',
  'Bitime 2 dakika kala haber verin; kapanışta “Oyuncakları uyutalım” ritüelini kullanın.',
];
const KACIN = ['Soru yağmuru', 'Komut vermek (“Şunu koy”)', 'Eleştiri / “Hayır, öyle değil”', 'Oyunu kendi fikrinize çevirmek'];
const DUYGU_CUMLELERI = {
  mutlu: 'Çok mutlu görünüyor, gülüyor!', uzgun: 'Biraz üzgün galiba… Ona ne iyi gelir acaba?', kizgin: 'Çok kızmış! Kızınca böyle bağırıyor.',
  korkmus: 'Korkmuş görünüyor. Yanında biri olsa iyi olurdu.', saskin: 'Şaşırdı! Bunu hiç beklemiyordu.', sakin: 'Şimdi sakin ve rahat.',
  endiseli: 'Bir şeyden endişe ediyor gibi.', utangac: 'Biraz utanıyor, saklanmak istiyor.', heyecanli: 'Çok heyecanlı, yerinde duramıyor!',
  yorgun: 'Yorulmuş, dinlenmek istiyor.', sevgi: 'Ona çok sevgiyle bakıyor.', yalniz: 'Yalnız kalmış gibi.',
};
const ZOR_ANLAR = [
  ['Oyun çok kavgalı ya da saldırgan', 'Bu, çocukların duygularını oyunla boşaltma yoludur. Sakin kalın, betimleyin (“Aslan çok kızgın, herkese bağırıyor”). Yalnızca gerçek eşyaya ya da kişiye zarar verilirse kuralı söyleyin: “Oyuncaklara vurmak yok; istersen yastığa vurabilirsin.”'],
  ['Ölüm, kayıp, hastalık gibi temalar', 'Panik yapmayın, oyunu durdurmayın. Oyunun içinde kalın: “Kuş artık uçamıyor, herkes çok üzgün.” Kaygılanırsanız bunu çocuğun yanında değil, danışmanla konuşun.'],
  ['Çocuk çok üzüldü ya da ağladı', 'Yanında olun, duyguyu adlandırın: “Bu çok üzdü seni.” İsterseniz 🎈 balon nefesini birlikte yapın.'],
  ['Oyunu bitirmek istemiyor', 'Önceden haber verin, kapanış ritüelini kullanın ve bir sonraki oyun gününü söyleyin: “Yarın yine oynayacağız.”'],
  ['Beni oyuna katmıyor', 'Sorun değil. Yanında oturun, gördüğünüzü sesli anlatın. İlgi göstermek de katılmaktır.'],
];

function ebeveynBaslat() {
  if (!durum.ebeveyn) durum.ebeveyn = { baslangic: Date.now(), beceriler: { betimle: 0, ov: 0, yansit: 0, taklit: 0 } };
}

function ebeveynPanelAc() {
  ebeveynBaslat();
  ebeveynCiz();
  $('#ebeveyn-paneli').classList.add('acik');
  $('#ebeveyn-paneli').setAttribute('aria-hidden', 'false');
}

function ebeveynCiz() {
  const e = durum.ebeveyn;
  $('#e-ipucu').textContent = IPUCLARI[ipucuI % IPUCLARI.length];
  kimCiz();
  $('#e-beceriler').innerHTML = BECERILER.map((b) => `<button class="beceri" data-beceri="${b.id}" title="${kacis(b.ornek)}"><span>${b.ikon}</span>${b.ad}<b>${e.beceriler[b.id] || 0}</b><small>${kacis(b.ornek)}</small></button>`).join('');
  $('#e-kacin').innerHTML = KACIN.map((k) => `<li>${kacis(k)}</li>`).join('');
  $('#e-duygular').innerHTML = DUYGULAR.map((d) => `<li><b>${d.emoji} ${d.ad}:</b> ${kacis(DUYGU_CUMLELERI[d.id] || '')}</li>`).join('');
  $('#e-zor').innerHTML = ZOR_ANLAR.map(([b, m]) => `<details><summary>${kacis(b)}</summary><p>${kacis(m)} <button class="dinle-btn" data-dinle aria-label="Sesli dinle">🔊</button></p></details>`).join('');
}

function sureAyarla(dk) {
  sureHedef = +dk || null;
  sureBaslangic = Date.now(); sureUyarildi = 0;
  sureDenetle();
}

$('#ebeveyn-paneli').addEventListener('click', (e) => {
  if (e.target.closest('[data-kapat]')) return rehberKapat();
  const b = e.target.closest('[data-beceri]');
  if (b) {
    ebeveynBaslat();
    durum.ebeveyn.beceriler[b.dataset.beceri] = (durum.ebeveyn.beceriler[b.dataset.beceri] || 0) + 1;
    ses.sec(); navigator.vibrate?.(10);
    ebeveynCiz(); taslakKaydet();
    return;
  }
  const i = e.target.closest('[data-e]')?.dataset.e;
  if (i === 'ipucu') { ipucuI++; ebeveynCiz(); }
  if (i === 'sakin') sakinAc();
  if (i === 'endise') endiseAc();
  if (i === 'ichava') icHavaSor(durum.icHava.bas ? 'son' : 'bas');
  if (i === 'bitir') { ebeveynBitiyor = true; kapanisRituali(); }
  if (i === 'sosyal') { rehberKapat(); sosyalAc(); }
  if (i === 'sira') siraDegistir();
});
$('#e-sure').addEventListener('change', (e) => { sureAyarla(e.target.value); if (sureHedef) bildir(`⏱️ ${sureHedef} dakikalık özel oyun zamanı başladı`); });

// --- Oyun günlüğü (yalnızca bu cihazda) ---
const GUNLUK_ANAHTAR = 'hikaye-modu-gunluk';
const gunlukOku = () => { try { return JSON.parse(localStorage.getItem(GUNLUK_ANAHTAR) || '[]'); } catch { return []; } };
const KEYIFLER = ['😞', '😐', '🙂', '😄', '🤩'];
let gunlukSecim = { cocuk: null, ben: null };

function gunlukFormAc() {
  gunlukSecim = { cocuk: null, ben: null };
  $('#gunluk-form').classList.remove('gizli');
  $('#gunluk-liste').classList.add('gizli');
  $('#gunluk-baslik').textContent = '📔 Bugünkü oyun';
  document.querySelectorAll('[data-keyif-grup]').forEach((g) => { g.innerHTML = KEYIFLER.map((k, i) => `<button data-keyif="${i + 1}">${k}</button>`).join(''); });
  $('#gunluk-not').value = ''; $('#gunluk-soru').value = '';
  const e = durum.ebeveyn?.beceriler || {};
  gunlukKimCiz();
  $('#gunluk-ozet').innerHTML = `${BECERILER.map((b) => `${b.ikon} ${b.ad}: <b>${e[b.id] || 0}</b>`).join(' · ')}`;
  pencereAc('gunluk');
}

function gunlukListeAc() {
  const liste = gunlukOku();
  $('#gunluk-form').classList.add('gizli');
  $('#gunluk-liste').classList.remove('gizli');
  $('#gunluk-baslik').textContent = '📔 Oyun günlüğüm';
  $('#gunluk-kayitlar').innerHTML = liste.length ? liste.map((g) => `<div class="gunluk-kart"><b>${new Date(g.t).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</b> · ${g.sureDk} dk${g.kim ? ` · 🧒 ${kacis(g.kim)}` : ''}
      <div>Çocuğun keyfi: ${KEYIFLER[g.cocuk - 1] || '—'} · Benim keyfim: ${KEYIFLER[g.ben - 1] || '—'}</div>
      <div class="gunluk-beceri">${BECERILER.map((b) => `${b.ikon} ${g.beceriler?.[b.id] || 0}`).join('  ')}</div>
      ${g.not ? `<p>📝 ${kacis(g.not)}</p>` : ''}${g.soru ? `<p>❓ ${kacis(g.soru)}</p>` : ''}</div>`).join('')
    : '<p class="bos-mesaj">Henüz kayıt yok. Oyun bitince “🏁 Oyunu bitir” ile kısa bir not düşebilirsiniz.</p>';
  pencereAc('gunluk');
}

function gunlukHTML(liste) {
  return `<h1>Özel Oyun Zamanı — Oyun Günlüğü</h1><p class="alt-baslik">Danışmanla paylaşmak için · ${new Date().toLocaleDateString('tr-TR', { dateStyle: 'long' })}</p>
    <table><tr><th>Tarih</th><th>Çocuk</th><th>Süre</th><th>Çocuğun keyfi</th><th>Benim keyfim</th><th>Betimleme</th><th>Övgü</th><th>Duygu</th><th>Taklit</th></tr>
    ${liste.map((g) => `<tr><td>${new Date(g.t).toLocaleDateString('tr-TR')}</td><td>${kacis(g.kim || '—')}</td><td>${g.sureDk} dk</td><td>${KEYIFLER[g.cocuk - 1] || '—'}</td><td>${KEYIFLER[g.ben - 1] || '—'}</td>${BECERILER.map((b) => `<td>${g.beceriler?.[b.id] || 0}</td>`).join('')}</tr>`).join('')}</table>
    ${liste.filter((g) => g.not || g.soru).map((g) => `<p><b>${new Date(g.t).toLocaleDateString('tr-TR')}:</b> ${g.not ? kacis(g.not) : ''}${g.soru ? `<br>❓ ${kacis(g.soru)}` : ''}</p>`).join('')}`;
}

$('#gunluk-penceresi').addEventListener('click', (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-kapat]')) return pencereKapat('gunluk');
  const k = e.target.closest('[data-keyif]');
  if (k) {
    const grup = k.parentElement.dataset.keyifGrup;
    gunlukSecim[grup] = +k.dataset.keyif;
    k.parentElement.querySelectorAll('button').forEach((b) => b.classList.toggle('aktif', b === k));
    return;
  }
  const i = e.target.closest('[data-gunluk]')?.dataset.gunluk;
  if (i === 'kaydet') {
    const e2 = durum.ebeveyn || { baslangic: durum.baslangic, beceriler: {} };
    const kayit = { t: Date.now(), sureDk: Math.max(1, Math.round((Date.now() - e2.baslangic) / 60000)), beceriler: e2.beceriler, cocuk: gunlukSecim.cocuk, ben: gunlukSecim.ben,
      not: $('#gunluk-not').value.trim().slice(0, 600), soru: $('#gunluk-soru').value.trim().slice(0, 400), kim: $('#gunluk-kim').value || e2.kim || '' };
    const liste = [kayit, ...gunlukOku()].slice(0, 100);
    try { localStorage.setItem(GUNLUK_ANAHTAR, JSON.stringify(liste)); } catch { /* yoksay */ }
    durum.ebeveyn = null;
    sureAyarla(null); $('#e-sure').value = '';
    bildir('📔 Günlüğe yazıldı. Teşekkürler!');
    gunlukListeAc();
  }
  if (i === 'yazdir') {
    const liste = gunlukOku();
    if (!liste.length) return;
    $('#rapor').className = 'veli';
    $('#rapor').innerHTML = gunlukHTML(liste);
    window.print();
  }
  if (i === 'temizle' && confirm('Bu cihazdaki bütün oyun günlüğü silinsin mi? Geri alınamaz.')) {
    try { localStorage.removeItem(GUNLUK_ANAHTAR); } catch { /* yoksay */ }
    gunlukListeAc();
  }
});
$('#btn-e-gunluk').addEventListener('click', gunlukListeAc);
$('#btn-e-nasil').addEventListener('click', () => pencereAc('e-nasil'));
$('#e-nasil-penceresi').addEventListener('click', (e) => { if (e.target === e.currentTarget || e.target.closest('[data-kapat]')) pencereKapat('e-nasil'); });

// ================= Danışma modu: hedef, not şablonları, risk işaretleri =================
const HEDEF_DURUMLARI = { ulasildi: 'ulaşıldı', kismen: 'kısmen ulaşıldı', ulasilamadi: 'ulaşılamadı' };
const RISKLER = [
  ['kendine', 'Kendine zarar verme / ölüm isteği ifadesi'], ['baskasina', 'Başkasına zarar verme ifadesi'],
  ['istismar', 'İstismar (fiziksel, cinsel, duygusal) şüphesi'], ['ihmal', 'İhmal belirtisi (bakım, beslenme, hijyen, sağlık)'],
  ['siddet', 'Evde şiddete tanıklık'], ['davranis', 'Ani ve belirgin davranış değişikliği'], ['devamsizlik', 'Okul reddi / uzun devamsızlık'],
];
const NOT_SABLONLARI = {
  dap: 'D (Veri): \nA (Değerlendirme): \nP (Plan): ',
  soap: 'S (Çocuğun / ailenin ifadesi): \nO (Gözlem): \nA (Değerlendirme): \nP (Plan): ',
  oyun: 'Oyuna giriş ve ilişki kurma: \nSeçilen ortam ve karakterler: \nTekrar eden temalar: \nDuygusal ifade ve düzenleme: \nSınır / kural gerektiren anlar: \nKapanış: \nSonraki oturum için: ',
};

function danismaAlanlariCiz() {
  $('#oturum-hedefi').value = durum.hedef || '';
  $('#hedef-durumu').value = durum.hedefDurumu || '';
  $('#risk-listesi').innerHTML = RISKLER.map(([id, ad]) => `<label><input type="checkbox" data-risk="${id}" ${durum.riskler.includes(id) ? 'checked' : ''}> ${ad}</label>`).join('');
  $('#risk-not').value = durum.riskNot || '';
  $('#risk-uyari').classList.toggle('gizli', !durum.riskler.length);
}

function riskRaporu() {
  if (!durum.riskler.length && !durum.riskNot) return '';
  return `<div class="risk-rapor"><h2>⚠️ Risk ve koruma işaretleri</h2><ul>${durum.riskler.map((id) => `<li>${kacis(RISKLER.find((r) => r[0] === id)?.[1] || id)}</li>`).join('')}</ul>
    ${durum.riskNot ? `<p>${kacis(durum.riskNot)}</p>` : ''}</div>`;
}

$('#oturum-hedefi').addEventListener('input', (e) => { durum.hedef = e.target.value.slice(0, 400); taslakKaydet(); });
$('#hedef-durumu').addEventListener('change', (e) => { durum.hedefDurumu = e.target.value; if (e.target.value) akisEkle(`🎯 Oturum hedefi: ${HEDEF_DURUMLARI[e.target.value]}`); else taslakKaydet(); });
$('#risk-not').addEventListener('input', (e) => { durum.riskNot = e.target.value.slice(0, 2000); taslakKaydet(); });
$('#risk-listesi').addEventListener('change', (e) => {
  const id = e.target.dataset.risk;
  if (!id) return;
  durum.riskler = e.target.checked ? [...new Set([...durum.riskler, id])] : durum.riskler.filter((x) => x !== id);
  $('#risk-uyari').classList.toggle('gizli', !durum.riskler.length);
  taslakKaydet();
});
document.querySelector('.not-sablonlari').addEventListener('click', (e) => {
  const s = NOT_SABLONLARI[e.target.closest('[data-sablon]')?.dataset.sablon];
  if (!s) return;
  const n = $('#notlar');
  n.value = (n.value.trim() ? n.value.trim() + '\n\n' : '') + s;
  n.focus();
  taslakKaydet();
});

modUygula();
danismaAlanlariCiz();
// İlk açılışta mod seçimi gösterilir.
// Ev sürümünde mod sorulmaz; ebeveyne ilk açılışta "Nasıl oynanır?" gösterilir.
try {
  if (EV_SURUMU) { if (!localStorage.getItem('hikaye-modu-mod')) { localStorage.setItem('hikaye-modu-mod', mod); pencereAc('e-nasil'); } }
  else if (!localStorage.getItem('hikaye-modu-mod')) modPenceresiAc();
} catch { /* yoksay */ }

// ================= Ortak: dosya paylaşma / indirme =================
async function dosyaPaylas(dosya, baslik) {
  try {
    if (navigator.canShare?.({ files: [dosya] })) { await navigator.share({ files: [dosya], title: baslik }); return true; }
  } catch (e) { if (e.name === 'AbortError') return false; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(dosya); a.download = dosya.name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  bildir(`💾 ${dosya.name} indirildi`);
  return true;
}

// ================= Sesli dinleme (ebeveyn ipuçları, nasıl oynanır) =================
document.addEventListener('click', (e) => {
  const d = e.target.closest('[data-dinle]');
  if (!d) return;
  const hedef = d.dataset.dinle ? $(d.dataset.dinle) : d.parentElement;
  if (!window.speechSynthesis) return bildir('⚠️ Bu tarayıcı sesli okumayı desteklemiyor');
  if (speechSynthesis.speaking) { speechSynthesis.cancel(); return; }
  oku(hedef.innerText.replace(/🔊/g, '').trim(), true);
});

// ================= Sosyal beceri: "Sen olsan ne yapardın?" =================
let sosyalAktif = null, sosyalDenemeler = [];

function sosyalAc() {
  sosyalAktif = null;
  $('#sosyal-baslik').textContent = '🤝 Sen olsan ne yapardın?';
  $('#sosyal-icerik').innerHTML = `<p class="ipucu">Bir durum seç. Hikayeyi birlikte okuyup ne yapılabileceğini düşünün.</p>
    <div class="sosyal-liste">${SOSYAL.map((s) => `<button class="sosyal-kart" data-sosyal="${s.id}"><span>${s.ikon}</span><b>${kacis(s.ad)}</b>${durum.sosyal.some((x) => x.id === s.id) ? '<i>⭐</i>' : ''}</button>`).join('')}</div>`;
  pencereAc('sosyal');
}

function sosyalGoster(id) {
  const s = sosyalBul(id);
  if (!s) return;
  sosyalAktif = s; sosyalDenemeler = [];
  // Seçenekler her seferinde karışık gelir; iyi yanıt hep aynı yerde durmasın.
  const sira = s.secenekler.map((_, i) => i).sort(() => Math.random() - 0.5);
  $('#sosyal-baslik').textContent = `${s.ikon} ${s.ad}`;
  $('#sosyal-icerik').innerHTML = `<div class="sosyal-sahne">${s.sahne}</div>
    <p class="sosyal-metin">${kacis(s.metin)} <button class="dinle-btn" data-sosyal-oku aria-label="Sesli dinle">🔊</button></p>
    <h4 class="sosyal-soru">${kacis(s.soru)}</h4>
    <div class="sosyal-secenekler">${sira.map((i, n) => `<button class="sosyal-secenek" data-secenek="${i}"><span>${'ABC'[n]}</span>${kacis(s.secenekler[i][0])}</button>`).join('')}</div>
    <div id="sosyal-sonuc" class="sosyal-sonuc gizli"></div>
    <div class="pencere-dugmeler"><button class="ince-btn" data-sosyal-geri>‹ Başka bir durum</button><span></span></div>`;
  oku(`${s.metin} ${s.soru}`);
}

function sosyalSec(i) {
  const s = sosyalAktif, [, sonuc, puan] = s.secenekler[i];
  if (!sosyalDenemeler.includes(i)) sosyalDenemeler.push(i);
  document.querySelectorAll('.sosyal-secenek').forEach((b) => { if (+b.dataset.secenek === i) b.classList.add(puan === 2 ? 'iyi' : 'denendi'); });
  const el = $('#sosyal-sonuc');
  el.className = 'sosyal-sonuc ' + (puan === 2 ? 'iyi' : 'dene');
  el.innerHTML = `${puan === 2 ? '⭐ ' : '🤔 '}${kacis(sonuc)}${puan === 2 ? '<p class="ipucu">Sence şimdi herkes nasıl hissediyor? Sen de hiç böyle bir şey yaşadın mı?</p>' : ''}`;
  oku(sonuc);
  if (puan !== 2) { ses.sec(); return; }
  ses.zil();
  document.querySelectorAll('.sosyal-secenek').forEach((b) => { b.disabled = true; });
  const ilk = s.secenekler[sosyalDenemeler[0]][0];
  durum.sosyal.push({ id: s.id, t: Date.now(), ilk, ilkPuan: s.secenekler[sosyalDenemeler[0]][2], deneme: sosyalDenemeler.length });
  akisEkle(`🤝 Ne yapardın · ${s.ad}: ilk seçim “${ilk}”${sosyalDenemeler.length > 1 ? ` · ${sosyalDenemeler.length}. denemede çözdü` : ''}`);
}

function sosyalRaporu() {
  if (!durum.sosyal?.length) return '';
  const etiket = ['zarar veren yol', 'işe yaramayan yol', 'durumu çözen yol'];
  return `<h2>Sosyal beceri durumları</h2><table><tr><th>Durum</th><th>İlk seçimi</th><th>Çözene kadar</th></tr>${durum.sosyal.map((x) => {
    const s = sosyalBul(x.id);
    return `<tr><td>${s ? `${s.ikon} ${kacis(s.ad)}` : kacis(x.id)}</td><td>“${kacis(x.ilk || '')}” <i>(${etiket[x.ilkPuan] || ''})</i></td><td>${x.deneme} deneme</td></tr>`;
  }).join('')}</table>`;
}

$('#btn-sosyal').addEventListener('click', () => { rehberKapat(); sosyalAc(); });
$('#sosyal-penceresi').addEventListener('click', (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-kapat]')) return pencereKapat('sosyal');
  const k = e.target.closest('[data-sosyal]');
  if (k) return sosyalGoster(k.dataset.sosyal);
  if (e.target.closest('[data-sosyal-geri]')) return sosyalAc();
  if (e.target.closest('[data-sosyal-oku]') && sosyalAktif) return oku(`${sosyalAktif.metin} ${sosyalAktif.soru}`, true);
  const b = e.target.closest('[data-secenek]');
  if (b && !b.disabled) sosyalSec(+b.dataset.secenek);
});

// ================= Ebeveyn modu: kardeşler =================
const COCUKLAR_ANAHTAR = 'hikaye-modu-cocuklar';
const cocuklarOku = () => { try { return JSON.parse(localStorage.getItem(COCUKLAR_ANAHTAR) || '[]').filter(Boolean).slice(0, 6); } catch { return []; } };
const cocuklarYaz = (l) => { try { localStorage.setItem(COCUKLAR_ANAHTAR, JSON.stringify(l)); } catch { /* yoksay */ } };

function kimCiz() {
  const c = cocuklarOku(), el = $('#e-kim');
  el.classList.toggle('gizli', !c.length);
  if (!c.length || !durum.ebeveyn) return;
  if (!c.includes(durum.ebeveyn.kim)) durum.ebeveyn.kim = c[0];
  el.innerHTML = `<span>🧒 Şimdi sıra: <b>${kacis(durum.ebeveyn.kim)}</b></span>${c.length > 1 ? '<button class="ince-btn" data-e="sira">🔄 Sıra değiştir</button>' : ''}`;
}

function siraDegistir() {
  const c = cocuklarOku();
  if (c.length < 2) return;
  ebeveynBaslat();
  durum.ebeveyn.kim = c[(c.indexOf(durum.ebeveyn.kim) + 1) % c.length];
  if (sureHedef) sureAyarla(sureHedef);
  kimCiz(); taslakKaydet();
  ses.zil();
  bildir(`🔄 Şimdi sıra: ${durum.ebeveyn.kim}. Hikayeyi o yönetiyor.`);
}

function gunlukKimCiz() {
  const c = cocuklarOku();
  $('#gunluk-kim-alan').classList.toggle('gizli', !c.length);
  $('#gunluk-kim').innerHTML = c.map((k) => `<option ${k === durum.ebeveyn?.kim ? 'selected' : ''}>${kacis(k)}</option>`).join('') + '<option value="">Birlikte / belirtmeden</option>';
}

function cocuklarAc() {
  const c = cocuklarOku();
  $('#cocuk-listesi').innerHTML = c.length ? c.map((k, i) => `<span class="cocuk-etiket">🧒 ${kacis(k)}<button data-cocuk-sil="${i}" aria-label="Sil">✖</button></span>`).join('')
    : '<p class="bos-mesaj">Henüz eklenmedi. Tek çocuğunuz varsa eklemeniz gerekmez.</p>';
  pencereAc('cocuklar');
}

$('#btn-e-cocuklar').addEventListener('click', cocuklarAc);
$('#cocuklar-penceresi').addEventListener('click', (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-kapat]')) return pencereKapat('cocuklar');
  const s = e.target.closest('[data-cocuk-sil]');
  if (s) { const c = cocuklarOku(); c.splice(+s.dataset.cocukSil, 1); cocuklarYaz(c); return cocuklarAc(); }
  if (e.target.closest('[data-cocuk="ekle"]')) cocukEkle();
});
$('#cocuk-yeni').addEventListener('keydown', (e) => { if (e.key === 'Enter') cocukEkle(); });
function cocukEkle() {
  const ad = $('#cocuk-yeni').value.trim().slice(0, 16);
  const c = cocuklarOku();
  if (!ad || c.includes(ad)) return;
  if (c.length >= 6) return bildir('En fazla 6 çocuk eklenebilir');
  cocuklarYaz([...c, ad]);
  $('#cocuk-yeni').value = '';
  cocuklarAc();
}

// ================= Ebeveyn modu: takvim hatırlatıcısı (.ics) =================
const GUNLER = [['MO', 'Pzt'], ['TU', 'Sal'], ['WE', 'Çar'], ['TH', 'Per'], ['FR', 'Cum'], ['SA', 'Cmt'], ['SU', 'Paz']];

function hatirlatAc() {
  $('#hatirlat-gunler').innerHTML = GUNLER.map(([k, a], i) => `<label><input type="checkbox" value="${k}" ${[0, 2, 4].includes(i) ? 'checked' : ''}><span>${a}</span></label>`).join('');
  pencereAc('hatirlat');
}

// Takvim dosyasında satırlar 75 baytı geçmemeli; uzun satırlar bölünür.
function icsSatir(satir) {
  const kodlayici = new TextEncoder(), parcalar = [];
  let parca = '', bayt = 0;
  for (const ch of satir) {
    const n = kodlayici.encode(ch).length;
    if (bayt + n > (parcalar.length ? 73 : 74)) { parcalar.push(parca); parca = ''; bayt = 0; }
    parca += ch; bayt += n;
  }
  parcalar.push(parca);
  return parcalar.join('\r\n ');
}

function icsOlustur() {
  const gunler = [...document.querySelectorAll('#hatirlat-gunler input:checked')].map((i) => i.value);
  if (!gunler.length) return bildir('En az bir gün seçin');
  const [sa, dk] = ($('#hatirlat-saat').value || '19:00').split(':').map(Number);
  const sure = +$('#hatirlat-sure').value || 15;
  const haftaGunu = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  const bas = new Date(); bas.setHours(sa, dk, 0, 0);
  if (bas < new Date()) bas.setDate(bas.getDate() + 1);
  for (let i = 0; i < 7 && !gunler.includes(haftaGunu[bas.getDay()]); i++) bas.setDate(bas.getDate() + 1);
  const bit = new Date(bas.getTime() + sure * 60000);
  const p2 = (n) => String(n).padStart(2, '0');
  const yerel = (d) => `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}T${p2(d.getHours())}${p2(d.getMinutes())}00`;
  const damga = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Hikaye Modu//Evde Oyun//TR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    `UID:hikaye-${Date.now().toString(36)}@hikaye-modu`, `DTSTAMP:${damga}`, `DTSTART:${yerel(bas)}`, `DTEND:${yerel(bit)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=${gunler.join(',')}`, 'SUMMARY:🧸 Özel oyun zamanı',
    `DESCRIPTION:${sure} dakika. Oyunu çocuğunuz yönetsin\\, siz eşlik edin. Telefon uzakta!`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Özel oyun zamanı yaklaşıyor', 'TRIGGER:-PT10M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR']
    .map(icsSatir).join('\r\n') + '\r\n';
  dosyaPaylas(new File([ics], 'ozel-oyun-zamani.ics', { type: 'text/calendar' }), 'Özel oyun zamanı').then((ok) => {
    if (ok) { pencereKapat('hatirlat'); bildir('📅 Dosyayı açıp takviminize ekleyin'); }
  });
}

$('#btn-e-hatirlat').addEventListener('click', hatirlatAc);
$('#hatirlat-penceresi').addEventListener('click', (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-kapat]')) return pencereKapat('hatirlat');
  if (e.target.closest('[data-hatirlat="olustur"]')) icsOlustur();
});

// ================= Ev oyun günlüğünü danışmana gönderme =================
const EV_KOD_ANAHTAR = 'hikaye-modu-ev-kod';
// Danışman adresi kodla birlikte verebilir: .../hikaye-modu-ev/#kod=D-12 (adresin # sonrası hiçbir sunucuya gitmez).
try {
  const m = location.hash.match(/kod=([\w.-]{1,20})/);
  if (m) { localStorage.setItem(EV_KOD_ANAHTAR, decodeURIComponent(m[1])); history.replaceState(null, '', location.pathname + location.search); }
  $('#ev-kod').value = localStorage.getItem(EV_KOD_ANAHTAR) || '';
} catch { /* yoksay */ }
$('#ev-kod').addEventListener('input', (e) => { try { localStorage.setItem(EV_KOD_ANAHTAR, e.target.value.trim().slice(0, 20)); } catch { /* yoksay */ } });

async function gunlukGonder() {
  const liste = gunlukOku();
  if (!liste.length) return bildir('Önce günlüğe bir oyun yazın');
  const kod = $('#ev-kod').value.trim().slice(0, 20);
  if (!kod) { $('#ev-kod').focus(); return bildir('Danışmanınızın verdiği kodu yazın'); }
  const veri = { tur: 'hikaye-ev-gunlugu', surum: 1, kod, olusturma: new Date().toISOString(), gunluk: liste };
  const ad = `ev-gunlugu-${kod.replace(/[^\w-]/g, '') || 'kod'}-${new Date().toISOString().slice(0, 10)}.json`;
  if (await dosyaPaylas(new File([JSON.stringify(veri)], ad, { type: 'application/json' }), 'Oyun günlüğü')) {
    bildir('📤 Dosyayı danışmanınıza gönderin (WhatsApp, e-posta…) ya da görüşmeye getirin');
  }
}
$('#gunluk-penceresi').addEventListener('click', (e) => { if (e.target.closest('[data-gunluk="gonder"]')) gunlukGonder(); });

// Danışman: gelen dosya kayıtlara (parola koruması varsa şifreli) eklenir.
function evGunluguTemizle(liste) {
  return (Array.isArray(liste) ? liste : []).slice(0, 200).map((g) => ({
    t: +g.t || 0, sureDk: sinirla(Math.round(+g.sureDk || 0), 0, 240),
    cocuk: sinirla(Math.round(+g.cocuk || 0), 0, 5) || null, ben: sinirla(Math.round(+g.ben || 0), 0, 5) || null,
    kim: String(g.kim || '').slice(0, 16), not: String(g.not || '').slice(0, 600), soru: String(g.soru || '').slice(0, 400),
    beceriler: Object.fromEntries(BECERILER.map((b) => [b.id, sinirla(Math.round(+g.beceriler?.[b.id] || 0), 0, 999)])),
  })).filter((g) => g.t > 0);
}

$('#ev-gunluk-dosya').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  let v;
  try {
    if (f.size > 2e6) throw new Error('büyük');
    v = JSON.parse(await f.text());
    if (v.tur !== 'hikaye-ev-gunlugu') throw new Error('tür');
  } catch { return bildir('⚠️ Bu dosya bir ev oyun günlüğü değil'); }
  const gunluk = evGunluguTemizle(v.gunluk);
  if (!gunluk.length) return bildir('⚠️ Dosyada oyun kaydı yok');
  const kod = prompt(`${gunluk.length} ev oyunu bulundu. Hangi danışan koduna eklensin?`, String(v.kod || '').trim().slice(0, 20))?.trim().slice(0, 20);
  if (!kod) return;
  try {
    const y = await kayitIstek('api/kayitlar', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tur: 'ev-gunlugu', kod, gunluk, gonderim: String(v.olusturma || '').slice(0, 30) }) });
    if (!y.ok) throw new Error(y.status);
    bildir(`🏠 ${gunluk.length} ev oyunu ${kod} koduna eklendi`);
    kayitlariAc();
  } catch { bildir('⚠️ Eklenemedi — sunucu açık mı?'); }
});

function evIzlemHTML(evler) {
  const tum = new Map();
  evler.forEach((v) => (v.gunluk || []).forEach((g) => tum.set(`${g.t}|${g.kim || ''}`, g)));
  const liste = [...tum.values()].sort((a, b) => a.t - b.t);
  if (!liste.length) return '';
  const top = (id) => liste.reduce((s, g) => s + (g.beceriler?.[id] || 0), 0);
  const ort = (k) => { const d = liste.map((g) => g[k]).filter(Boolean); return d.length ? d.reduce((a, b) => a + b, 0) / d.length : null; };
  const keyif = (x) => (x ? `${KEYIFLER[Math.round(x) - 1]} (${x.toLocaleString('tr-TR', { maximumFractionDigits: 1 })}/5)` : '—');
  const ilk = new Date(liste[0].t), son = new Date(liste[liste.length - 1].t);
  const hafta = Math.max(1, Math.ceil((son - ilk) / (7 * 864e5)));
  return `<h4>🏠 Evde özel oyun zamanı (ebeveynin günlüğü)</h4>
    <p class="izlem-ozet"><b>${liste.length}</b> ev oyunu · ${ilk.toLocaleDateString('tr-TR')} – ${son.toLocaleDateString('tr-TR')} · haftada ortalama ${(liste.length / hafta).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} kez · ortalama ${Math.round(ort('sureDk') || 0)} dk</p>
    <p>Çocuğun keyfi: ${keyif(ort('cocuk'))} · Ebeveynin keyfi: ${keyif(ort('ben'))}</p>
    <p>Beceriler (toplam): ${BECERILER.map((b) => `${b.ikon} ${b.ad}: <b>${top(b.id)}</b>`).join(' · ')}</p>
    <div class="tablo-kap"><table class="izlem-tablo"><tr><th>Tarih</th><th>Çocuk</th><th>Süre</th><th>Keyif (çocuk / ebeveyn)</th>${BECERILER.map((b) => `<th title="${kacis(b.ad)}">${b.ikon}</th>`).join('')}<th>Ebeveynin notu</th></tr>
    ${liste.map((g) => `<tr><td>${new Date(g.t).toLocaleDateString('tr-TR')}</td><td>${kacis(g.kim || '—')}</td><td>${g.sureDk} dk</td><td>${KEYIFLER[g.cocuk - 1] || '—'} / ${KEYIFLER[g.ben - 1] || '—'}</td>${BECERILER.map((b) => `<td>${g.beceriler?.[b.id] || 0}</td>`).join('')}<td>${kacis([g.not, g.soru ? `❓ ${g.soru}` : ''].filter(Boolean).join(' · ')) || '—'}</td></tr>`).join('')}</table></div>
    <p class="ipucu">Ebeveynin kendi tuttuğu kayıttır; beceri sayıları ebeveynin fark ettiklerini gösterir.</p>`;
}

function evGunluguGoster(veri) {
  $('#kayit-penceresi').classList.add('gizli');
  $('#evgunluk-baslik').textContent = `🏠 ${veri.kod || 'Kodsuz'} · ev oyun günlüğü`;
  $('#evgunluk-icerik').innerHTML = evIzlemHTML([veri]);
  pencereAc('evgunluk');
}
$('#evgunluk-penceresi').addEventListener('click', (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-kapat]')) return pencereKapat('evgunluk');
  if (e.target.closest('[data-evgunluk="yazdir"]')) {
    const rapor = $('#rapor');
    rapor.className = '';
    rapor.innerHTML = `<h1>🏠 Evde Özel Oyun Zamanı</h1><p class="alt-baslik">${kacis($('#evgunluk-baslik').textContent.replace('🏠 ', ''))}</p>${$('#evgunluk-icerik').innerHTML}
      <p class="gizlilik">Bu belge gizli danışmanlık bilgisi içerir.</p>`;
    window.print();
  }
});

// ================= e-Rehberlik faaliyet metni =================
function kullanilanCalismalar() {
  const akis = durum.akis.map((a) => a.m).join(' ');
  return [
    [durum.icHava?.bas || durum.icHava?.son, 'iç hava durumu ile duygu değerlendirmesi'],
    [durum.bedenler?.length, 'beden haritası'],
    [durum.endiseler?.length, 'endişe kutusu'],
    [durum.dilekler?.length, 'dilek sahnesi'],
    [durum.kokler?.length, 'hikaye tamamlama'],
    [durum.guvenliYer, 'güvenli yer çalışması'],
    [durum.roller?.length, 'rol değiştirme'],
    [durum.genogram, 'aile ağacı'],
    [durum.sosyal?.length, 'sosyal beceri senaryoları'],
    [durum.alanlar?.length, 'güvenli alan belirleme'],
    [durum.baglar?.length, 'ilişki haritası'],
    [durum.kumIzleri?.length, 'kum tepsisi'],
    [/balon nefes|sakinleş/i.test(akis), 'nefes ve sakinleşme çalışması'],
  ].filter(([v]) => v).map(([, ad]) => ad);
}

const listeYaz = (l) => (l.length < 2 ? l.join('') : `${l.slice(0, -1).join(', ')} ve ${l[l.length - 1]}`);

function eRehberlikMetni(tur) {
  const dk = Math.max(1, Math.round((Date.now() - durum.baslangic) / 60000));
  const calismalar = kullanilanCalismalar();
  const temalar = (durum.temalar || []).map((id) => temaBul(id)?.ad).filter(Boolean);
  const ortamSayisi = new Set(durum.gezilen.length ? durum.gezilen : [durum.ortamId].filter(Boolean)).size;
  const sn = sinifBul(durum.sinif);
  const karSayisi = new Set(durum.sahnede.map((k) => k.kid)).size;
  if (tur === 'sinif') {
    const ad = sn ? sn.ad : 'Sınıf rehberliği';
    return `“${ad}” konulu sınıf rehberlik etkinliği yaklaşık ${dk} dakika sürmüştür. Etkinlikte dijital hikaye ortamı (Hikaye Modu) akıllı tahtada kullanılmış; öğrencilerle birlikte ${sn ? `${sn.aciklama.toLocaleLowerCase('tr')} konularını` : 'belirlenen konuyu'} işleyen bir hikaye kurulmuştur.`
      + `${durum.sorulanlar.length ? ` Hikaye boyunca öğrencilere ${durum.sorulanlar.length} yönlendirici soru yöneltilmiş, öğrencilerin düşüncelerini paylaşmaları sağlanmıştır.` : ' Hikaye üzerinden soru-cevap ile öğrencilerin düşüncelerini paylaşmaları sağlanmıştır.'}`
      + `${durum.sosyal?.length ? ` Sosyal beceri senaryoları üzerinde birlikte çözüm yolları tartışılmıştır.` : ''} Etkinlik kısa bir pekiştirme çalışmasıyla tamamlanmıştır.`;
  }
  return `Öğrenciyle yaklaşık ${dk} dakikalık bireysel görüşme yapılmıştır. Görüşmede oyun temelli yaklaşım benimsenmiş; dijital hikaye ortamında (${ortamSayisi || 1} mekân${karSayisi ? `, ${karSayisi} karakter` : ''}) öğrencinin kendini oyun yoluyla ifade etmesi desteklenmiştir.`
    + `${calismalar.length ? ` Görüşmede ${listeYaz(calismalar)} çalışmalarına yer verilmiştir.` : ''}`
    + `${durum.duyguGecmisi.length ? ' Öğrencinin duygularını tanıma ve adlandırma becerileri üzerinde durulmuştur.' : ''}`
    + `${temalar.length ? ` Görüşmede ${listeYaz(temalar.map((t) => t.toLocaleLowerCase('tr')))} temaları öne çıkmıştır.` : ''}`
    + `${durum.hedef.trim() ? ` Görüşme hedefi: ${durum.hedef.trim().replace(/\.$/, '')}${durum.hedefDurumu ? ` (hedefe ${HEDEF_DURUMLARI[durum.hedefDurumu]})` : ''}.` : ''}`
    + ' Görüşme olumlu bir kapanışla sonlandırılmış, gerekli görüldüğünde izlem görüşmesi yapılması planlanmıştır.';
}

function eRehberlikAc() {
  rehberKapat();
  $('#erehberlik-tur').value = durum.sinif ? 'sinif' : 'bireysel';
  $('#erehberlik-metin').value = eRehberlikMetni($('#erehberlik-tur').value);
  pencereAc('erehberlik');
}
$('#btn-erehberlik').addEventListener('click', eRehberlikAc);
$('#erehberlik-tur').addEventListener('change', (e) => { $('#erehberlik-metin').value = eRehberlikMetni(e.target.value); });
$('#erehberlik-penceresi').addEventListener('click', async (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-kapat]')) return pencereKapat('erehberlik');
  if (e.target.closest('[data-erehberlik="kopyala"]')) {
    const m = $('#erehberlik-metin');
    try { await navigator.clipboard.writeText(m.value); } catch { m.select(); document.execCommand('copy'); }
    bildir('📋 Metin kopyalandı; e-Rehberlik’te açıklama alanına yapıştırın');
  }
  if (e.target.closest('[data-erehberlik="yenile"]')) $('#erehberlik-metin').value = eRehberlikMetni($('#erehberlik-tur').value);
});

// ================= Sınıf rehberliği =================
function sinifAc() {
  $('#sinif-listesi').innerHTML = SINIF_TEMALARI.map((t) => `<button class="senaryo-kart" data-sinif="${t.id}">
    <span class="e">${t.ikon}</span><b>${kacis(t.ad)}</b><small>${kacis(t.aciklama)}</small>
    <span class="kucuk-kar">${t.karakterler.map((id) => karakterBul(id)?.emoji || '').join(' ')}</span></button>`).join('');
  pencereAc('sinif');
}

function sinifBaslat(t) {
  ses.baslat();
  durumYukle({ ...yeniDurum(), sinif: t.id, kod: `Sınıf · ${t.ad}`, ortamId: t.ortam, secili: t.karakterler.filter((id) => karakterBul(id)), isimGoster: true });
  pencereKapat('sinif');
  ses.zil();
  akisEkle(`🏫 Sınıf etkinliği: ${t.ikon} ${t.ad}`);
  soruKartlariCiz();
  bildir(`🏫 ${t.ad}: karakterleri sınıfla birlikte seçin`);
  aktifKategori = KATEGORILER[0].id;
  ekranGoster('karakter');
}

$('#btn-sinif').addEventListener('click', () => { ses.baslat(); sinifAc(); });
$('#sinif-penceresi').addEventListener('click', (e) => {
  if (e.target === e.currentTarget || e.target.closest('[data-kapat]')) return pencereKapat('sinif');
  if (e.target.closest('[data-sinif-tam]')) {
    const el = document.documentElement;
    if (document.fullscreenElement) document.exitFullscreen?.(); else el.requestFullscreen?.().catch(() => bildir('Tam ekran açılamadı'));
    return;
  }
  const t = sinifBul(e.target.closest('[data-sinif]')?.dataset.sinif);
  if (t) sinifBaslat(t);
});

// ================= Erişilebilirlik / görünüm ayarları =================
const ERISIM_ANAHTAR = 'hikaye-modu-erisim';
const ERISIM = [
  ['buyuk', '🔠 Büyük yazı ve düğmeler', 'Az gören çocuklar ya da uzaktan bakan sınıf için'],
  ['okuma', '📖 Okuması kolay yazı', 'Geniş harf ve satır aralığı; okumada zorlanan çocuklar için'],
  ['renk', '🎨 Renk körlüğüne uygun duygu renkleri', 'Duygu renkleri birbirinden daha kolay ayrılır'],
  ['karsitlik', '◐ Yüksek karşıtlık', 'Soluk yazılar koyulaşır, kenarlar belirginleşir'],
  ['hareket', '🐢 Hareketleri azalt', 'Kayma, yanıp sönme ve geçiş efektleri kapanır'],
];
const RENK_ORIJINAL = Object.fromEntries(DUYGULAR.map((d) => [d.id, d.renk]));
// Okabe–Ito paleti temel alındı; emoji her zaman rengin yanında durur.
const RENK_DOSTU = { mutlu: '#F0E442', uzgun: '#0072B2', kizgin: '#D55E00', korkmus: '#4D4D4D', saskin: '#E69F00', sakin: '#009E73',
  endiseli: '#CC79A7', utangac: '#F4B6D2', heyecanli: '#882255', yorgun: '#A6A6A6', sevgi: '#AA3377', yalniz: '#56B4E9' };
let erisim = {};
try { erisim = JSON.parse(localStorage.getItem(ERISIM_ANAHTAR) || '{}') || {}; } catch { erisim = {}; }

function erisimUygula() {
  ERISIM.forEach(([k]) => document.documentElement.classList.toggle('er-' + k, !!erisim[k]));
  DUYGULAR.forEach((d) => { d.renk = erisim.renk ? (RENK_DOSTU[d.id] || RENK_ORIJINAL[d.id]) : RENK_ORIJINAL[d.id]; });
}

function erisimAc() {
  $('#erisim-listesi').innerHTML = ERISIM.map(([k, ad, ack]) => `<label class="erisim-secenek"><input type="checkbox" data-erisim="${k}" ${erisim[k] ? 'checked' : ''}><span><b>${ad}</b><small>${ack}</small></span></label>`).join('')
    + `<div class="renk-ornek">${DUYGULAR.map((d) => `<span style="background:${d.renk}" title="${kacis(d.ad)}">${d.emoji}</span>`).join('')}</div>`;
  pencereAc('erisim');
}

$('#btn-erisim').addEventListener('click', erisimAc);
$('#erisim-penceresi').addEventListener('click', (e) => { if (e.target === e.currentTarget || e.target.closest('[data-kapat]')) pencereKapat('erisim'); });
$('#erisim-penceresi').addEventListener('change', (e) => {
  const k = e.target.dataset.erisim;
  if (!k) return;
  erisim[k] = e.target.checked;
  try { localStorage.setItem(ERISIM_ANAHTAR, JSON.stringify(erisim)); } catch { /* yoksay */ }
  erisimUygula();
  if (k === 'renk') {
    erisimAc();
    // Duygu paneli yalnızca bir karakter seçiliyken çizilebilir.
    try { duyguPaneliCiz(); } catch { /* seçili karakter yok */ }
  }
});
erisimUygula();

// ================= Parolasız kayıt uyarısı (danışma modu) =================
async function korumaUyariDenetle() {
  const el = $('#koruma-uyari');
  if (EV_SURUMU || mod !== 'danisma') return el.classList.add('gizli');
  try {
    if (localStorage.getItem('hikaye-modu-koruma-sonra') === new Date().toDateString()) return el.classList.add('gizli');
    const b = await fetch('api/koruma').then((y) => y.json());
    el.classList.toggle('gizli', !!b.aktif);
  } catch { el.classList.add('gizli'); }
}
$('#koruma-uyari').addEventListener('click', (e) => {
  if (e.target.closest('[data-koruma-uyari="ac"]')) korumaAc();
  if (e.target.closest('[data-koruma-uyari="sonra"]')) {
    try { localStorage.setItem('hikaye-modu-koruma-sonra', new Date().toDateString()); } catch { /* yoksay */ }
    $('#koruma-uyari').classList.add('gizli');
  }
});
$('#koruma-penceresi').addEventListener('click', () => setTimeout(korumaUyariDenetle, 1200));
$('#mod-penceresi').addEventListener('click', () => setTimeout(korumaUyariDenetle, 300));
korumaUyariDenetle();
