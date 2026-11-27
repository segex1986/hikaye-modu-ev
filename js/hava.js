import { ses } from './ses.js';

// Gökyüzüne / güneşe / buluta dokununca sıradaki hava durumuna geçilir.
export const HAVALAR = [
  { id: 'gunesli', ad: 'Güneşli', emoji: '☀️', gok: ['#3d9df2', '#7cc4ff', '#cdeeff'], bulut: 2, bulutRenk: '#ffffff', gunes: 1 },
  { id: 'parcali', ad: 'Parçalı Bulutlu', emoji: '⛅', gok: ['#4fa3e6', '#8ccaf5', '#d6eefb'], bulut: 5, bulutRenk: '#ffffff', gunes: 1 },
  { id: 'bulutlu', ad: 'Bulutlu', emoji: '☁️', gok: ['#8fa4b8', '#b4c3d0', '#dde4ea'], bulut: 9, bulutRenk: '#e6ebf0', gunes: 0 },
  { id: 'ruzgarli', ad: 'Rüzgârlı', emoji: '🌬️', gok: ['#6aa7d8', '#9cc8ea', '#d7e9f5'], bulut: 6, bulutRenk: '#f4f7fa', gunes: 1, hizli: true },
  { id: 'yagmurlu', ad: 'Yağmurlu', emoji: '🌧️', gok: ['#5f7386', '#8297aa', '#aebdca'], bulut: 9, bulutRenk: '#9aa8b5', gunes: 0 },
  { id: 'firtinali', ad: 'Fırtınalı', emoji: '⛈️', gok: ['#2e3a4c', '#4a586b', '#6e7c8c'], bulut: 9, bulutRenk: '#6b7785', gunes: 0, hizli: true },
  { id: 'gokkusagi', ad: 'Gökkuşağı', emoji: '🌈', gok: ['#57b5f5', '#9ad4fb', '#e6f6ff'], bulut: 3, bulutRenk: '#ffffff', gunes: 1, gokkusagi: true },
  { id: 'karli', ad: 'Karlı', emoji: '❄️', gok: ['#a9b9c9', '#ccd7e1', '#eef3f7'], bulut: 8, bulutRenk: '#f2f5f8', gunes: 0 },
  { id: 'gunbatimi', ad: 'Gün Batımı', emoji: '🌅', gok: ['#5a5aa8', '#f08a6c', '#ffd59e'], bulut: 3, bulutRenk: '#ffc2a8', gunes: 2 },
  { id: 'gece', ad: 'Gece', emoji: '🌙', gok: ['#0b1734', '#1c2c55', '#33467a'], bulut: 2, bulutRenk: '#53607e', gunes: 0, ay: true, yildiz: true },
];

const BULUTLAR = [
  [0.0, 90, 1.1], [0.55, 150, 0.9], [0.25, 60, 1.3], [0.8, 200, 0.8], [0.4, 120, 1.0],
  [0.12, 230, 0.75], [0.68, 40, 1.2], [0.9, 110, 1.05], [0.33, 260, 0.85],
];

let gokEl, tuval, ortuEl, sahneEl, ortam, indeks = 0;
let parcaciklar = [], animId = 0, simsekZamani = 0, sonZaman = 0;

const bulutSekli = '<circle cx="0" cy="0" r="46"/><circle cx="50" cy="-22" r="58"/><circle cx="108" cy="2" r="44"/><circle cx="54" cy="18" r="42"/><rect x="-10" y="0" width="128" height="44" rx="22"/>';

function gokSvg(o) {
  const [gx, gy] = o.gunes;
  const [y0, y1] = o.bulutY || [40, 300];
  const yildizlar = Array.from({ length: 70 }, (_, i) => {
    const x = (i * 397) % 1600, y = (i * 131) % 480;
    return `<circle cx="${x}" cy="${y}" r="${1.5 + (i % 3)}" fill="#fff" class="yildiz" style="animation-delay:${(i % 7) * 0.6}s"/>`;
  }).join('');
  const isinlar = Array.from({ length: 12 }, (_, i) => `<rect x="-6" y="-112" width="12" height="34" rx="6" transform="rotate(${i * 30})"/>`).join('');
  const bulutlar = BULUTLAR.map(([gec, y, s], i) => `<g class="bulut" data-i="${i}" style="animation-delay:calc(var(--bulut-sure) * -${gec})">
      <g transform="translate(0 ${y0 + (y / 260) * (y1 - y0)}) scale(${s})">${bulutSekli}</g></g>`).join('');
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="gok-grad" x1="0" y1="0" x2="0" y2="1"><stop id="gok-s1" offset="0"/><stop id="gok-s2" offset=".55"/><stop id="gok-s3" offset="1"/></linearGradient>
      <radialGradient id="gunes-hale"><stop offset="0" stop-color="#fff6c4" stop-opacity=".85"/><stop offset="1" stop-color="#fff6c4" stop-opacity="0"/></radialGradient></defs>
    <rect class="gok-dokun" width="1600" height="900" fill="url(#gok-grad)"/>
    <g id="yildizlar">${yildizlar}</g>
    <g id="gokkusagi" fill="none" stroke-width="22" opacity=".75">
      ${['#ff5252', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3', '#673ab7'].map((c, i) => `<path d="M${180 + i * 22} 720 A${620 - i * 22} ${520 - i * 22} 0 0 1 ${1420 - i * 22} 720" stroke="${c}"/>`).join('')}
    </g>
    <g id="gunes" class="gok-dokun" transform="translate(${gx} ${gy})">
      <circle r="150" fill="url(#gunes-hale)"/>
      <g class="gunes-isin" fill="#ffd54f">${isinlar}</g>
      <circle r="62" fill="#ffd23f"/>
      <g class="gunes-yuz"><circle cx="-20" cy="-8" r="6" fill="#7a4a00"/><circle cx="20" cy="-8" r="6" fill="#7a4a00"/>
      <path d="M-22 14 q22 20 44 0" stroke="#7a4a00" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="-34" cy="10" r="8" fill="#ff8a65" opacity=".5"/><circle cx="34" cy="10" r="8" fill="#ff8a65" opacity=".5"/></g>
    </g>
    <g id="ay" class="gok-dokun" transform="translate(${gx} ${gy})">
      <circle r="110" fill="url(#gunes-hale)" opacity=".35"/>
      <path d="M10 -52 A52 52 0 1 0 10 52 A40 40 0 1 1 10 -52Z" fill="#f6f1cf"/>
    </g>
    <g id="bulutlar" class="gok-dokun">${bulutlar}</g>
  </svg>`;
}

export function havaKur(elemanlar, yeniOrtam, baslangic = 0) {
  ({ gok: gokEl, tuval, ortu: ortuEl, sahne: sahneEl } = elemanlar);
  ortam = yeniOrtam;
  gokEl.innerHTML = gokSvg(ortam);
  sahneEl.classList.toggle('ic-mekan', !!ortam.ic);
  havaAyarla(baslangic, true);
  if (!animId) { sonZaman = performance.now(); animId = requestAnimationFrame(ciz); }
}

export function havaAyarla(i, sessiz = false) {
  indeks = (i + HAVALAR.length) % HAVALAR.length;
  const h = HAVALAR[indeks];
  ['gok-s1', 'gok-s2', 'gok-s3'].forEach((id, k) => gokEl.querySelector('#' + id).setAttribute('stop-color', h.gok[k]));
  const gunes = gokEl.querySelector('#gunes');
  const [gx, gy] = ortam.gunes;
  gunes.style.display = h.gunes ? '' : 'none';
  gunes.setAttribute('transform', `translate(${gx} ${gy + (h.gunes === 2 ? 70 : 0)})`);
  gunes.classList.toggle('batan', h.gunes === 2);
  gokEl.querySelector('#ay').style.display = h.ay ? '' : 'none';
  gokEl.querySelector('#yildizlar').style.opacity = h.yildiz ? 1 : 0;
  gokEl.querySelector('#gokkusagi').style.display = h.gokkusagi ? '' : 'none';
  const bulutlar = gokEl.querySelector('#bulutlar');
  bulutlar.style.fill = h.bulutRenk;
  bulutlar.querySelectorAll('.bulut').forEach((b, k) => { b.style.display = k < h.bulut ? '' : 'none'; });
  sahneEl.dataset.hava = h.id;
  sahneEl.style.setProperty('--bulut-sure', h.hizli ? '45s' : '160s');
  parcaciklariHazirla(h.id);
  simsekZamani = performance.now() + 2500;
  ses.hava(h.id);
  if (!sessiz) ses.cime();
  return h;
}

export const havaSonraki = () => havaAyarla(indeks + 1);
export const havaIndeks = () => indeks;
export const havaMevcut = () => HAVALAR[indeks];

function boyutla() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = tuval.clientWidth, h = tuval.clientHeight;
  if (tuval.width !== Math.round(w * dpr) || tuval.height !== Math.round(h * dpr)) {
    tuval.width = Math.round(w * dpr); tuval.height = Math.round(h * dpr);
  }
  return [w, h, dpr];
}

function parcaciklariHazirla(id) {
  const [w, h] = boyutla();
  const r = Math.random;
  const yeni = (tur, adet, f) => Array.from({ length: adet }, () => ({ tur, x: r() * w, y: r() * h, ...f() }));
  parcaciklar = [];
  if (id === 'yagmurlu' || id === 'firtinali') {
    const n = id === 'firtinali' ? 260 : 150;
    parcaciklar = yeni('yagmur', n, () => ({ hiz: 700 + r() * 400, boy: 12 + r() * 14 }));
  } else if (id === 'karli') {
    parcaciklar = yeni('kar', 140, () => ({ hiz: 30 + r() * 50, boy: 2 + r() * 4, faz: r() * 6 }));
  } else if (id === 'ruzgarli') {
    parcaciklar = yeni('yaprak', 16, () => ({ hiz: 160 + r() * 140, boy: 7 + r() * 6, faz: r() * 6, renk: ['#e6893c', '#f3b23a', '#c45c2c', '#8bc34a'][(r() * 4) | 0] }));
  } else if (id === 'gece' && !ortam.ic) {
    parcaciklar = yeni('atesbocegi', 18, () => ({ y: h * (0.55 + r() * 0.4), faz: r() * 6, hiz: 10 + r() * 15 }));
  }
}

function ciz(simdi) {
  animId = requestAnimationFrame(ciz);
  const dt = Math.min((simdi - sonZaman) / 1000, 0.05);
  sonZaman = simdi;
  if (!tuval || !tuval.isConnected || tuval.offsetParent === null) return;
  const [w, h, dpr] = boyutla();
  const c = tuval.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, w, h);
  const hava = HAVALAR[indeks].id;
  const egim = hava === 'firtinali' ? 0.35 : 0.12;
  for (const p of parcaciklar) {
    if (p.tur === 'yagmur') {
      p.y += p.hiz * dt; p.x += p.hiz * egim * dt;
      if (p.y > h) { p.y = -20; p.x = Math.random() * w * 1.2 - w * 0.2; }
      c.strokeStyle = 'rgba(220,235,255,.55)'; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.boy * egim, p.y - p.boy); c.stroke();
    } else if (p.tur === 'kar') {
      p.faz += dt; p.y += p.hiz * dt; p.x += Math.sin(p.faz) * 20 * dt;
      if (p.y > h) { p.y = -10; p.x = Math.random() * w; }
      c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(p.x, p.y, p.boy, 0, 7); c.fill();
    } else if (p.tur === 'yaprak') {
      p.faz += dt * 3; p.x += p.hiz * dt; p.y += (Math.sin(p.faz) * 40 + 25) * dt;
      if (p.x > w + 20) { p.x = -20; p.y = Math.random() * h * 0.8; }
      c.save(); c.translate(p.x, p.y); c.rotate(p.faz); c.fillStyle = p.renk;
      c.beginPath(); c.ellipse(0, 0, p.boy, p.boy * 0.5, 0, 0, 7); c.fill(); c.restore();
    } else if (p.tur === 'atesbocegi') {
      p.faz += dt; p.x += Math.cos(p.faz * 0.7) * p.hiz * dt; p.y += Math.sin(p.faz) * p.hiz * dt;
      const a = 0.35 + 0.65 * Math.max(0, Math.sin(p.faz * 2.3));
      const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, 12);
      g.addColorStop(0, `rgba(230,255,140,${a})`); g.addColorStop(1, 'rgba(230,255,140,0)');
      c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, 12, 0, 7); c.fill();
    }
  }
  // Karanlık havalarda kamp ateşi / park lambası gibi ışık kaynakları çevresini aydınlatır.
  const karanlik = { gece: 1, firtinali: 0.6, gunbatimi: 0.5, yagmurlu: 0.35 }[hava] || 0;
  if (karanlik && ortam.isik) {
    const s = Math.max(w / 1600, h / 900), ox = (w - 1600 * s) / 2, oy = h - 900 * s;
    for (const [ix, iy, yaricap, titrek] of ortam.isik) {
      const x = ox + ix * s, y = oy + iy * s, rr = yaricap * s * (titrek ? 1 + Math.sin(simdi / 90) * 0.04 + Math.random() * 0.03 : 1);
      const g = c.createRadialGradient(x, y, 0, x, y, rr);
      g.addColorStop(0, `rgba(255,190,90,${0.55 * karanlik})`);
      g.addColorStop(0.35, `rgba(255,150,60,${0.22 * karanlik})`);
      g.addColorStop(1, 'rgba(255,140,50,0)');
      c.globalCompositeOperation = 'lighter';
      c.fillStyle = g; c.beginPath(); c.arc(x, y, rr, 0, 7); c.fill();
      c.globalCompositeOperation = 'source-over';
    }
  }
  if (hava === 'firtinali' && simdi > simsekZamani) {
    simsekZamani = simdi + 7000 + Math.random() * 8000;
    ortuEl.classList.remove('simsek'); void ortuEl.offsetWidth; ortuEl.classList.add('simsek');
    ses.gokGurultusu(0.8 + Math.random() * 1.2);
  }
}
