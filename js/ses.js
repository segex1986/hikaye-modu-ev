// Ortam sesleri tamamen tarayıcıda sentezlenir (internet ve ses dosyası gerekmez).
// "sesler/<ortam-id>.mp3" gibi bir kayıt eklenirse o ortamın sentez sesleri yerine o çalar.
// Sesler bilinçli olarak kısık tutulur: çocuk ortamı hissetsin ama dikkati dağılmasın.

let ctx = null, ana = null, olayCikis = null, arayuzCikis = null;
let gurultu = {};
const yataklar = {};
let hedefYatak = {}, olayHizi = {};
let seviye = 0.7;
let ortamBilgi = null, havaId = 'gunesli';
let kayitliSesler = [], dosyaSes = null;
let periyodik = { tik: 0, bip: 0 };

const r = Math.random;
const sec = (dizi) => dizi[(r() * dizi.length) | 0];

function gurultuOlustur(tur) {
  const uzunluk = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, uzunluk, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, son = 0;
  for (let i = 0; i < uzunluk; i++) {
    const w = r() * 2 - 1;
    if (tur === 'beyaz') d[i] = w;
    else if (tur === 'pembe') {
      b0 = 0.99765 * b0 + w * 0.099; b1 = 0.963 * b1 + w * 0.2965; b2 = 0.57 * b2 + w * 1.0526;
      d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2;
    } else { son = (son + 0.02 * w) / 1.02; d[i] = son * 3.5; }
  }
  return buf;
}

function kaynak(tur) {
  const s = ctx.createBufferSource();
  s.buffer = gurultu[tur]; s.loop = true;
  s.loopStart = r() * 2; s.start(0, r() * 3);
  return s;
}

function filtre(tip, frekans, q = 0.7) {
  const f = ctx.createBiquadFilter();
  f.type = tip; f.frequency.value = frekans; f.Q.value = q;
  return f;
}

function lfo(frekans, derinlik, hedef) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.value = frekans; g.gain.value = derinlik;
  o.connect(g); g.connect(hedef); o.start();
}

// --- Sürekli arka plan katmanları ---------------------------------------
const YATAK_KUR = {
  dalga(cikis) {
    const mod = ctx.createGain(); mod.gain.value = 0.55;
    kaynak('pembe').connect(filtre('lowpass', 650)).connect(mod).connect(cikis);
    lfo(0.085, 0.45, mod.gain);
    const kopuk = ctx.createGain(); kopuk.gain.value = 0.06;
    kaynak('beyaz').connect(filtre('highpass', 2500)).connect(kopuk).connect(cikis);
    lfo(0.085, 0.05, kopuk.gain);
  },
  ruzgar(cikis) {
    const bp = filtre('bandpass', 450, 0.6), mod = ctx.createGain(); mod.gain.value = 0.7;
    kaynak('pembe').connect(bp).connect(mod).connect(cikis);
    lfo(0.05, 220, bp.frequency); lfo(0.13, 0.3, mod.gain);
  },
  dere(cikis) {
    const g = ctx.createGain(); g.gain.value = 0.5;
    kaynak('pembe').connect(filtre('bandpass', 1300, 0.8)).connect(g).connect(cikis);
    const kabarcik = ctx.createGain(); kabarcik.gain.value = 0.18;
    kaynak('beyaz').connect(filtre('bandpass', 3200, 3)).connect(kabarcik).connect(cikis);
    lfo(5.3, 0.1, kabarcik.gain); lfo(7.7, 0.08, kabarcik.gain);
  },
  yagmur(cikis) {
    const lp = filtre('lowpass', 7000); yataklar.yagmurFiltre = lp;
    const g = ctx.createGain(); g.gain.value = 0.35;
    kaynak('beyaz').connect(filtre('highpass', 700)).connect(lp).connect(g).connect(cikis);
  },
  oda(cikis) {
    const g = ctx.createGain(); g.gain.value = 0.6;
    kaynak('kahve').connect(filtre('lowpass', 180)).connect(g).connect(cikis);
  },
  ates(cikis) {
    const g = ctx.createGain(); g.gain.value = 0.5;
    kaynak('kahve').connect(filtre('lowpass', 320)).connect(g).connect(cikis);
  },
};

function yatakSeviyesi(ad, deger) {
  if (!yataklar[ad]) {
    if (deger <= 0) return;
    const g = ctx.createGain(); g.gain.value = 0; g.connect(ana);
    YATAK_KUR[ad](g);
    yataklar[ad] = g;
  }
  yataklar[ad].gain.setTargetAtTime(deger * 0.32, ctx.currentTime, 1.5);
}

// --- Kısa olay sesleri ----------------------------------------------------
function cikis(pan = 0, ses = 1) {
  const p = ctx.createStereoPanner(); p.pan.value = pan;
  const g = ctx.createGain(); g.gain.value = ses;
  g.connect(p); p.connect(olayCikis);
  return g;
}

function zarf(g, t, tepe, atak, sure) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(tepe, t + atak);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
}

function gurultuPatlama(t, sure, filtreTip, frekans, q, tepe, hedef) {
  const s = ctx.createBufferSource(); s.buffer = gurultu.beyaz;
  const g = ctx.createGain();
  s.connect(filtre(filtreTip, frekans, q)).connect(g).connect(hedef);
  zarf(g, t, tepe, 0.002, sure);
  s.start(t, r() * 3); s.stop(t + sure + 0.05);
}

const OLAYLAR = {
  kus() {
    const out = cikis(r() * 1.6 - 0.8, 0.5 + r() * 0.5);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; g.gain.value = 0; o.connect(g); g.connect(out);
    let t = ctx.currentTime + 0.02;
    const f = 2300 + r() * 1800, tip = (r() * 4) | 0;
    if (tip === 0) {
      for (let i = 0, n = 2 + ((r() * 4) | 0); i < n; i++) {
        o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.45, t + 0.07);
        zarf(g, t, 0.07, 0.01, 0.08); t += 0.11 + r() * 0.04;
      }
    } else if (tip === 1) {
      o.frequency.setValueAtTime(f * 0.7, t); o.frequency.setValueAtTime(f * 0.7, t + 0.22);
      o.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.45);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.06, t + 0.04);
      g.gain.setValueAtTime(0.06, t + 0.2); g.gain.linearRampToValueAtTime(0.01, t + 0.24);
      g.gain.linearRampToValueAtTime(0.06, t + 0.28); g.gain.linearRampToValueAtTime(0, t + 0.48); t += 0.5;
    } else if (tip === 2) {
      const m = ctx.createOscillator(), mg = ctx.createGain();
      m.frequency.value = 22 + r() * 10; mg.gain.value = 350; m.connect(mg); mg.connect(o.frequency);
      o.frequency.value = f; m.start(t); m.stop(t + 0.6);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.045, t + 0.05); g.gain.linearRampToValueAtTime(0, t + 0.55); t += 0.6;
    } else {
      for (let i = 0; i < 3; i++) {
        o.frequency.setValueAtTime(f * 1.4, t); o.frequency.exponentialRampToValueAtTime(f * 0.75, t + 0.13);
        zarf(g, t, 0.06, 0.01, 0.14); t += 0.18;
      }
    }
    o.start(); o.stop(t + 0.1);
  },
  marti() {
    const out = cikis(r() * 1.6 - 0.8, 0.5);
    const o = ctx.createOscillator(), g = ctx.createGain(), bp = filtre('bandpass', 1500, 2);
    o.type = 'sawtooth'; o.connect(bp); bp.connect(g); g.connect(out); g.gain.value = 0;
    let t = ctx.currentTime + 0.02;
    for (let i = 0, n = 2 + ((r() * 2) | 0); i < n; i++) {
      const d = i === 0 ? 0.42 : 0.2;
      o.frequency.setValueAtTime(1050, t); o.frequency.linearRampToValueAtTime(1450, t + d * 0.3); o.frequency.linearRampToValueAtTime(820, t + d);
      zarf(g, t, 0.05, 0.03, d); t += d + 0.08;
    }
    o.start(); o.stop(t);
  },
  guguk() {
    const out = cikis(r() * 1.2 - 0.6, 0.6);
    const t = ctx.currentTime + 0.02;
    [[690, 0], [560, 0.32]].forEach(([f, dt]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f; o.connect(g); g.connect(out);
      zarf(g, t + dt, 0.07, 0.03, 0.3); o.start(t + dt); o.stop(t + dt + 0.35);
    });
  },
  agackakan() {
    const out = cikis(r() * 1.6 - 0.8, 0.5);
    const t = ctx.currentTime;
    for (let i = 0; i < 12; i++) gurultuPatlama(t + i * 0.055, 0.03, 'bandpass', 1700, 4, 0.25, out);
  },
  kurbaga() {
    const out = cikis(r() * 1.2 - 0.6, 0.6);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = 130 + r() * 50;
    o.connect(filtre('lowpass', 700)).connect(g).connect(out);
    let t = ctx.currentTime + 0.02; g.gain.value = 0;
    for (let i = 0; i < 6; i++) { zarf(g, t, 0.05, 0.005, 0.035); t += 0.045; }
    o.start(); o.stop(t + 0.05);
  },
  baykus() {
    const out = cikis(r() * 1.2 - 0.6, 0.6);
    let t = ctx.currentTime + 0.02;
    [0.45, 0.22, 0.5].forEach((d, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(380, t); o.frequency.linearRampToValueAtTime(340, t + d);
      o.connect(g); g.connect(out); g.gain.value = 0;
      g.gain.linearRampToValueAtTime(0.06, t + 0.08); g.gain.linearRampToValueAtTime(0, t + d);
      o.start(t); o.stop(t + d + 0.05); t += d + (i === 0 ? 0.35 : 0.08);
    });
  },
  cirkir() {
    const out = cikis(r() * 1.8 - 0.9, 0.4);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = 4400 + r() * 600; o.connect(g); g.connect(out); g.gain.value = 0;
    let t = ctx.currentTime + 0.02;
    for (let k = 0; k < 2; k++) {
      for (let i = 0; i < 3; i++) { zarf(g, t, 0.03, 0.004, 0.025); t += 0.04; }
      t += 0.2;
    }
    o.start(); o.stop(t);
  },
  citirti() {
    const out = cikis(r() * 0.6 - 0.3, 1);
    gurultuPatlama(ctx.currentTime, 0.008 + r() * 0.02, 'highpass', 1500 + r() * 2000, 0.7, 0.1 + r() * 0.18, out);
  },
  blup() {
    const out = cikis(r() * 0.8 - 0.4, 0.5);
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.frequency.setValueAtTime(350 + r() * 200, t); o.frequency.exponentialRampToValueAtTime(900 + r() * 400, t + 0.05);
    o.connect(g); g.connect(out); zarf(g, t, 0.035, 0.005, 0.06); o.start(t); o.stop(t + 0.08);
  },
  tik() {
    gurultuPatlama(ctx.currentTime, 0.012, 'bandpass', 3200, 5, 0.1, cikis(0.3, 0.6));
  },
  bip() {
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.frequency.value = 880; o.connect(g); g.connect(cikis(-0.2, 0.5));
    zarf(g, t, 0.03, 0.01, 0.14); o.start(t); o.stop(t + 0.16);
  },
  araba() {
    const s = ctx.createBufferSource(); s.buffer = gurultu.kahve;
    const g = ctx.createGain(), p = ctx.createStereoPanner(), t = ctx.currentTime, yon = r() < 0.5 ? -1 : 1;
    s.connect(filtre('bandpass', 260, 0.8)).connect(g).connect(p).connect(olayCikis);
    p.pan.setValueAtTime(-0.9 * yon, t); p.pan.linearRampToValueAtTime(0.9 * yon, t + 5);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 2.5); g.gain.exponentialRampToValueAtTime(0.0001, t + 5);
    s.start(t); s.stop(t + 5.1);
  },
  top() {
    const out = cikis(r() * 1.4 - 0.7, 0.7);
    let t = ctx.currentTime + 0.02, ara = 0.45, ses = 0.22;
    for (let i = 0; i < 4; i++) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.1);
      o.connect(g); g.connect(out); zarf(g, t, ses, 0.003, 0.12); o.start(t); o.stop(t + 0.14);
      t += ara; ara *= 0.72; ses *= 0.7;
    }
  },
  cocuk() { konusma(true); },
};

// Uzaktan gelen, anlaşılmayan çocuk/insan sesleri: ünlü formantlarından sentezlenen hece dizileri.
const UNLULER = [[800, 1200], [550, 1850], [320, 2250], [500, 900], [350, 750]];
function konusma(cocukMu) {
  const out = cikis(r() * 1.6 - 0.8, 1);
  const lp = filtre('lowpass', 1500); lp.connect(out);
  const o = ctx.createOscillator(), f1 = filtre('bandpass', 800, 7), f2 = filtre('bandpass', 1200, 7), g = ctx.createGain(), g2 = ctx.createGain();
  o.type = 'sawtooth'; g.gain.value = 0; g2.gain.value = 0.6;
  o.connect(f1); o.connect(f2); f1.connect(g); f2.connect(g2); g2.connect(g); g.connect(lp);
  const kahkaha = r() < 0.18;
  const f0 = cocukMu ? 250 + r() * 150 : 130 + r() * 70;
  const t0 = ctx.currentTime + 0.02;
  let t = t0;
  const n = kahkaha ? 4 + ((r() * 3) | 0) : 3 + ((r() * 7) | 0);
  for (let i = 0; i < n; i++) {
    const d = kahkaha ? 0.08 : 0.1 + r() * 0.16;
    const v = kahkaha ? UNLULER[0] : sec(UNLULER);
    f1.frequency.setValueAtTime(v[0], t); f2.frequency.setValueAtTime(v[1], t);
    const p = kahkaha ? f0 * (1.3 - i * 0.04) : f0 * (0.9 + r() * 0.3);
    o.frequency.setValueAtTime(p, t); o.frequency.linearRampToValueAtTime(p * (0.9 + r() * 0.2), t + d);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.09, t + 0.025); g.gain.linearRampToValueAtTime(0, t + d);
    t += d + (kahkaha ? 0.06 : 0.03 + r() * 0.09);
  }
  o.start(t0); o.stop(t + 0.1);
}

function gokGurultusuCal(gecikme = 1.2) {
  if (!ctx || seviye === 0) return;
  const s = ctx.createBufferSource(); s.buffer = gurultu.kahve;
  const lp = filtre('lowpass', 400), g = ctx.createGain(), t = ctx.currentTime + gecikme;
  lp.frequency.setValueAtTime(420, t); lp.frequency.exponentialRampToValueAtTime(90, t + 4);
  s.connect(lp).connect(g).connect(cikis(r() * 1.2 - 0.6, 1));
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);
  s.start(t); s.stop(t + 4.6);
}

// --- Ortam + hava birleşimi ------------------------------------------------
function karisimiGuncelle() {
  if (!ctx || !ortamBilgi) return;
  const ic = ortamBilgi.ic;
  const dosyaVar = !!dosyaSes;
  const y = dosyaVar ? {} : { ...ortamBilgi.ses.yatak };
  const o = dosyaVar ? {} : { ...ortamBilgi.ses.olay };
  const carp = (ad, k) => { if (o[ad]) o[ad] *= k; };
  const ekle = (obj, ad, v) => { obj[ad] = (obj[ad] || 0) + v; };

  switch (havaId) {
    case 'gece':
      carp('kus', 0); carp('marti', 0); carp('cocuk', 0.15); carp('top', 0); carp('guguk', 0); carp('agackakan', 0);
      ekle(o, 'cirkir', ic ? 0.08 : 0.9); if (!ic) ekle(o, 'baykus', 0.02);
      break;
    case 'gunbatimi': carp('kus', 0.5); ekle(o, 'cirkir', ic ? 0 : 0.2); break;
    case 'bulutlu': carp('kus', 0.6); break;
    case 'ruzgarli': ekle(y, 'ruzgar', ic ? 0.15 : 0.55); carp('kus', 0.5); break;
    case 'yagmurlu': ekle(y, 'yagmur', ic ? 0.45 : 0.7); carp('kus', 0.1); carp('cocuk', 0.2); carp('top', 0); carp('marti', 0.3); break;
    case 'firtinali': ekle(y, 'yagmur', ic ? 0.6 : 0.95); ekle(y, 'ruzgar', ic ? 0.15 : 0.45); carp('kus', 0); carp('cocuk', 0); carp('top', 0); carp('marti', 0); break;
    case 'gokkusagi': carp('kus', 1.4); break;
    case 'karli': ekle(y, 'ruzgar', ic ? 0.05 : 0.2); carp('kus', 0.25); carp('cocuk', 0.6); carp('top', 0); carp('kurbaga', 0); carp('blup', 0.5); break;
  }
  if (ic && y.ruzgar) y.ruzgar *= 0.4;
  hedefYatak = y; olayHizi = o;
  for (const ad of Object.keys(YATAK_KUR)) yatakSeviyesi(ad, y[ad] || 0);
  if (yataklar.yagmurFiltre) yataklar.yagmurFiltre.frequency.setTargetAtTime(ic ? 1300 : 7000, ctx.currentTime, 0.5);
}

function zamanlayici() {
  if (!ctx || seviye === 0 || document.hidden) return;
  const simdi = performance.now();
  for (const [ad, hiz] of Object.entries(olayHizi)) {
    if (!hiz) continue;
    if (ad === 'tik') {
      if (simdi - periyodik.tik >= 1000) { periyodik.tik = simdi; OLAYLAR.tik(); }
    } else if (ad === 'bip') {
      if (simdi - periyodik.bip >= 4000) { periyodik.bip = simdi; OLAYLAR.bip(); }
    } else if (r() < hiz * 0.1) {
      OLAYLAR[ad]();
    }
  }
}

function dosyaSesiAyarla() {
  if (dosyaSes) { dosyaSes.el.pause(); dosyaSes.kaynak.disconnect(); dosyaSes = null; }
  if (!ortamBilgi) return;
  const ad = kayitliSesler.find((f) => f.replace(/\.[^.]+$/, '') === ortamBilgi.id);
  if (!ad) return;
  const el = new Audio('sesler/' + encodeURIComponent(ad));
  el.loop = true;
  const g = ctx.createGain(); g.gain.value = 0.5;
  const k = ctx.createMediaElementSource(el); k.connect(g); g.connect(ana);
  el.play().catch(() => {});
  dosyaSes = { el, kaynak: k };
}

export const ses = {
  async baslat() {
    if (ctx) { if (ctx.state !== 'running') ctx.resume(); return; }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ctx.createDynamicsCompressor();
    ana = ctx.createGain(); ana.gain.value = seviye;
    olayCikis = ctx.createGain(); olayCikis.gain.value = 1; olayCikis.connect(ana);
    arayuzCikis = ctx.createGain(); arayuzCikis.gain.value = 0.9; arayuzCikis.connect(ana);
    ana.connect(comp); comp.connect(ctx.destination);
    gurultu = { beyaz: gurultuOlustur('beyaz'), pembe: gurultuOlustur('pembe'), kahve: gurultuOlustur('kahve') };
    setInterval(zamanlayici, 100);
    // Ev sürümünde sunucu yoktur; yalnızca sentez sesler kullanılır.
    if (!window.HIKAYE_EV) try {
      const yanit = await fetch('api/sesler');
      if (yanit.ok) kayitliSesler = await yanit.json();
    } catch { /* sunucusuz açıldıysa yalnızca sentez sesler kullanılır */ }
    if (ortamBilgi) { dosyaSesiAyarla(); karisimiGuncelle(); }
  },
  ortam(ortam) {
    ortamBilgi = ortam;
    if (!ctx) return;
    dosyaSesiAyarla(); karisimiGuncelle();
  },
  hava(id) { havaId = id; karisimiGuncelle(); },
  durdur() {
    ortamBilgi = null;
    if (!ctx) return;
    if (dosyaSes) { dosyaSes.el.pause(); dosyaSes = null; }
    for (const ad of Object.keys(YATAK_KUR)) yatakSeviyesi(ad, 0);
    olayHizi = {};
  },
  seviyeAyarla(v) {
    seviye = v;
    if (ana) ana.gain.setTargetAtTime(v, ctx.currentTime, 0.2);
    if (dosyaSes) dosyaSes.el.muted = v === 0;
  },
  gokGurultusu: gokGurultusuCal,

  // Dokunma geri bildirimleri: yumuşak ve kısa.
  ton(f1, f2, sure = 0.12, tepe = 0.12, tip = 'sine') {
    if (!ctx || seviye === 0) return;
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.type = tip; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + sure);
    o.connect(g); g.connect(arayuzCikis); zarf(g, t, tepe, 0.01, sure + 0.05); o.start(t); o.stop(t + sure + 0.1);
  },
  al() { this.ton(520, 820, 0.09, 0.1); },
  birak() { this.ton(600, 380, 0.12, 0.09); },
  sec() { this.ton(700, 900, 0.06, 0.06); },
  zil() {
    if (!ctx || seviye === 0) return;
    const t = ctx.currentTime;
    [880, 1320].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f; o.connect(g); g.connect(arayuzCikis);
      zarf(g, t + i * 0.09, 0.07, 0.01, 0.8); o.start(t + i * 0.09); o.stop(t + 1);
    });
  },
  // Kukla tiyatrosu alkışı: rastgele zamanlı kısa gürültü patlamaları.
  alkis(sure = 2.5) {
    if (!ctx || seviye === 0) return;
    const t0 = ctx.currentTime;
    for (let i = 0; i < sure * 30; i++) {
      const t = t0 + r() * sure * (0.5 + 0.5 * r());
      gurultuPatlama(t, 0.025 + r() * 0.03, 'bandpass', 1100 + r() * 1900, 1.1, 0.16 + r() * 0.14, arayuzCikis);
    }
  },
  cime() {
    if (!ctx || seviye === 0) return;
    const t = ctx.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = f; o.connect(g); g.connect(arayuzCikis);
      zarf(g, t + i * 0.07, 0.06, 0.01, 0.9); o.start(t + i * 0.07); o.stop(t + 1.2);
    });
  },
};
