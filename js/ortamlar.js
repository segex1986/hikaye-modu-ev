// Ortam çizimleri 1600x900 SVG koordinatlarında. Gökyüzü ayrı bir katmanda (hava.js) çizilir;
// buradaki her şey ".zemin" grubundadır. İç mekânlarda pencere boşlukları duvarda delik
// bırakılarak yapılır, böylece arkadaki gökyüzü ve hava durumu pencereden görünür.

function rastgele(tohum) {
  let s = tohum;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const agac = (x, y, s = 1, r = '#4caf50', g = '#3e8e41') => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-12" y="-75" width="24" height="80" rx="8" fill="#8b5a3c"/>
  <circle cx="-40" cy="-90" r="46" fill="${g}"/><circle cx="42" cy="-92" r="48" fill="${g}"/>
  <circle cx="0" cy="-132" r="60" fill="${r}"/><circle cx="-22" cy="-148" r="22" fill="#fff" opacity=".13"/></g>`;

const cam = (x, y, s = 1, r = '#2e7d4f') => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-9" y="-25" width="18" height="30" fill="#6d4c33"/>
  <polygon points="0,-130 -72,-20 72,-20" fill="${r}"/><polygon points="0,-185 -58,-88 58,-88" fill="${r}"/>
  <polygon points="0,-238 -42,-150 42,-150" fill="${r}"/></g>`;

const cali = (x, y, s = 1, r = '#43a047') => `<g transform="translate(${x} ${y}) scale(${s})">
  <circle cx="-30" cy="-20" r="30" fill="${r}"/><circle cx="26" cy="-22" r="32" fill="${r}"/><circle cx="0" cy="-40" r="34" fill="${r}"/></g>`;

const cicek = (x, y, r = '#ff6fa8') => `<g transform="translate(${x} ${y})">
  <line x1="0" y1="0" x2="0" y2="-22" stroke="#3e8e41" stroke-width="3"/>
  <circle cx="-6" cy="-26" r="6" fill="${r}"/><circle cx="6" cy="-26" r="6" fill="${r}"/>
  <circle cx="0" cy="-32" r="6" fill="${r}"/><circle cx="0" cy="-20" r="6" fill="${r}"/><circle cx="0" cy="-26" r="4" fill="#ffd23f"/></g>`;

function cicekler(tohum, adet, x0, x1, y0, y1) {
  const r = rastgele(tohum);
  const renkler = ['#ff6fa8', '#ffd23f', '#ffffff', '#b388ff', '#ff8a65'];
  let s = '';
  for (let i = 0; i < adet; i++) s += cicek(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), renkler[(r() * renkler.length) | 0]);
  return s;
}

function cimen(tohum, adet, x0, x1, y0, y1, renk = '#3f8f3a') {
  const r = rastgele(tohum);
  let d = '';
  for (let i = 0; i < adet; i++) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0);
    d += `M${x} ${y} l-6 -16 M${x} ${y} l0 -20 M${x} ${y} l6 -15 `;
  }
  return `<path d="${d}" stroke="${renk}" stroke-width="3" stroke-linecap="round" fill="none"/>`;
}

const tepeler = (renk1, renk2, y = 470) => `
  <path d="M0 ${y - 40} Q200 ${y - 150} 420 ${y - 60} T860 ${y - 70} T1300 ${y - 110} T1600 ${y - 50} V${y + 40} H0Z" fill="${renk1}"/>
  <path d="M0 ${y - 10} Q300 ${y - 90} 600 ${y - 20} T1200 ${y - 30} T1600 ${y - 20} V${y + 40} H0Z" fill="${renk2}"/>`;

const pencere = (x, y, w, h) => `
  <rect class="cam-yuzey" x="${x}" y="${y}" width="${w}" height="${h}" fill="#bfe6ff" opacity=".12"/>
  <rect x="${x - 10}" y="${y - 10}" width="${w + 20}" height="${h + 20}" fill="none" stroke="#fff" stroke-width="20" rx="4"/>
  <line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h}" stroke="#fff" stroke-width="12"/>
  <line x1="${x}" y1="${y + h / 2}" x2="${x + w}" y2="${y + h / 2}" stroke="#fff" stroke-width="12"/>
  <rect x="${x - 26}" y="${y + h + 8}" width="${w + 52}" height="18" rx="6" fill="#e9e2d6"/>`;

// Başka bir ortama açılan kapı. Karakter üstüne bırakılınca kanat aralanır; kapıya dokunmak hedef ortama geçirir.
// Rozet, kapının öbür tarafındaki karakter sayısını gösterir (uygulama.js günceller).
// isaret: kapının üst panelinde görünen küçük simge (ör. mutfak kapısında 🍳).
const kapi = (hedef, x, y, w, h, renk, panel, isaret = '') => `
  <g class="kapi" data-kapi="${hedef}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#ffcc80"/>
    <g class="kapi-kanat">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${renk}"/>
      <rect x="${x + w * 0.17}" y="${y + h * 0.11}" width="${w * 0.66}" height="${h * 0.28}" rx="6" fill="${panel}"/>
      <rect x="${x + w * 0.17}" y="${y + h * 0.5}" width="${w * 0.66}" height="${h * 0.36}" rx="6" fill="${panel}"/>
      <circle cx="${x + w * 0.82}" cy="${y + h * 0.5}" r="${Math.max(7, w * 0.065)}" fill="#ffd54f"/>
      ${isaret ? `<circle cx="${x + w / 2}" cy="${y + h * 0.25}" r="${w * 0.24}" fill="#fff" opacity=".85"/><text x="${x + w / 2}" y="${y + h * 0.25 + w * 0.12}" text-anchor="middle" font-size="${w * 0.32}">${isaret}</text>` : ''}
    </g>
    <g class="kapi-rozet" transform="translate(${x + w / 2} ${y - 34})">
      <rect x="-46" y="-24" width="92" height="44" rx="22" fill="#fff" stroke="#ffb74d" stroke-width="4"/>
      <text y="9" text-anchor="middle" font-size="26" font-weight="800" fill="#5d4037"></text>
    </g>
  </g>`;

// Saklanma: "on-plan" eşyalar karakterlerin önünde de çizilir. Ayakları eşyanın tabanından (taban, SVG y)
// yukarıda kalan karakter onun arkasında kalır. "ad" akışta kullanılır (ör. "koltuğun arkasına saklandı").
const on = (taban, ad, ic) => `<g class="on-plan" data-taban="${taban}" data-ad="${ad}">${ic}</g>`;

// Dışarıdan ev: kapısı "hedef" ortama açılır. (x, y) evin zemin ortasıdır.
function evDisi(x, y, s, hedef, r = {}) {
  const { duvar = '#fff3e0', cati = '#e5533d', catiKoyu = '#c0392b', kapiRenk = '#8d6e63', kapiPanel = '#a1887f' } = r;
  const pencereCiz = (px) => `<rect x="${px}" y="-270" width="130" height="110" fill="#bfe6ff" stroke="#fff" stroke-width="12"/><path d="M${px + 65} -270 v110 M${px} -215 h130" stroke="#fff" stroke-width="8"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="140" y="-460" width="60" height="120" fill="#a1887f"/>
    <rect x="-270" y="-330" width="540" height="340" fill="${duvar}"/>
    <path d="M-310 -320 L0 -520 L310 -320Z" fill="${cati}"/><path d="M-310 -320 L0 -520 L310 -320" stroke="${catiKoyu}" stroke-width="14" fill="none" stroke-linejoin="round"/>
    <circle cy="-410" r="36" fill="#bfe6ff" stroke="#fff" stroke-width="10"/>
    ${kapi(hedef, -60, -170, 120, 180, kapiRenk, kapiPanel)}
    ${pencereCiz(-230)}${pencereCiz(100)}
    <rect x="-240" y="-150" width="150" height="22" rx="6" fill="#8d6e63"/>${cicekler(41 + x, 6, -230, -100, -150, -150)}
    <rect x="90" y="-150" width="150" height="22" rx="6" fill="#8d6e63"/>${cicekler(42 + x, 6, 100, 230, -150, -150)}
    <rect x="-80" y="10" width="160" height="20" fill="#bcaaa4"/>
  </g>`;
}

// İçeriden ev (oturma odası). Renkler değiştirilerek birden çok evin içi çizilir; kapı "hedef" ortama açılır.
// mutfak: verilirse sol duvara o ortama açılan bir mutfak kapısı konur; verilmezse orada saksı durur.
// cocukOdasi: verilirse ön kapının yanına ⭐ işaretli çocuk odası kapısı konur, kitaplık kenara kayar.
function evIci({ hedef, mutfak = null, cocukOdasi = null, duvar = '#ffe1cf', serit = '#ffd2b8', perde = '#7e57c2', koltuk = ['#26a69a', '#2bbbad', '#00897b'], hali = '#ef9a9a', kapiRenk = '#6d4c41', kapiPanel = '#8d6e63' }) {
  return `
    <path fill-rule="evenodd" fill="${duvar}" d="M0 0H1600V620H0Z M590 110H1010V420H590Z"/>
    <g fill="${serit}">${Array.from({ length: 16 }, (_, i) => {
      const x = i * 100 + 40;
      return x + 20 > 590 && x < 1010
        ? `<rect x="${x}" y="0" width="20" height="110"/><rect x="${x}" y="420" width="20" height="200"/>`
        : `<rect x="${x}" y="0" width="20" height="620"/>`;
    }).join('')}</g>
    ${pencere(590, 110, 420, 310)}
    <path d="M540 70 h520" stroke="#8d6e63" stroke-width="10" stroke-linecap="round"/>
    <path d="M540 70 h90 q-20 180 10 380 h-100z" fill="${perde}"/><path d="M1060 70 h-90 q20 180 -10 380 h100z" fill="${perde}"/>
    <rect y="620" width="1600" height="280" fill="#d7a26d"/>
    <path d="M0 680 H1600 M0 760 H1600 M0 850 H1600" stroke="#c48d57" stroke-width="4"/>
    <ellipse cx="800" cy="780" rx="420" ry="90" fill="${hali}"/><ellipse cx="800" cy="780" rx="340" ry="64" fill="none" stroke="#fff" stroke-width="8" opacity=".6"/>
    ${mutfak
      ? `<rect x="238" y="318" width="154" height="306" rx="8" fill="#a1887f"/>${kapi(mutfak, 250, 330, 130, 290, '#f5f5f5', '#e0e0e0', '🍳')}`
      : `<g transform="translate(315 620)"><path d="M-34 0 h68 l-10 -70 h-48z" fill="#ff8a65"/><circle cx="0" cy="-100" r="40" fill="#4caf50"/><circle cx="-28" cy="-72" r="26" fill="#43a047"/><circle cx="28" cy="-76" r="28" fill="#43a047"/></g>`}
    <g transform="translate(480 620)"><rect x="-6" y="-300" width="12" height="300" fill="#5d4037"/><ellipse cy="2" rx="40" ry="10" fill="#5d4037"/><path d="M-60 -290 h120 l-30 -80 h-60z" fill="#fff59d"/></g>
    ${on(688, 'koltuğun', `<g transform="translate(800 640) scale(.8)">
      <rect x="-220" y="-150" width="440" height="120" rx="40" fill="${koltuk[0]}"/>
      <rect x="-240" y="-60" width="480" height="90" rx="24" fill="${koltuk[1]}"/>
      <rect x="-260" y="-110" width="60" height="140" rx="26" fill="${koltuk[2]}"/><rect x="200" y="-110" width="60" height="140" rx="26" fill="${koltuk[2]}"/>
      <rect x="-150" y="-120" width="90" height="70" rx="20" fill="#ffca28" transform="rotate(-10 -105 -85)"/>
      <rect x="-230" y="30" width="16" height="30" fill="#5d4037"/><rect x="214" y="30" width="16" height="30" fill="#5d4037"/>
    </g>`)}
    <rect x="1074" y="318" width="162" height="306" rx="8" fill="#a1887f"/>
    ${kapi(hedef, 1086, 330, 138, 290, kapiRenk, kapiPanel)}
    ${cocukOdasi ? `<rect x="1248" y="318" width="144" height="306" rx="8" fill="#a1887f"/>${kapi(cocukOdasi, 1258, 330, 124, 290, '#7986cb', '#9fa8da', '⭐')}` : ''}
    <g transform="${cocukOdasi ? 'translate(1515 630) scale(.7)' : 'translate(1425 630)'}">
      <rect x="-170" y="-430" width="340" height="440" fill="#8d6e63"/>
      <rect x="-150" y="-410" width="300" height="110" fill="#6d4c41"/><rect x="-150" y="-280" width="300" height="110" fill="#6d4c41"/><rect x="-150" y="-150" width="300" height="140" fill="#6d4c41"/>
      ${['#ef5350', '#42a5f5', '#66bb6a', '#ffca28', '#ab47bc', '#ff7043', '#26c6da'].map((c, i) => `<rect x="${-140 + i * 30}" y="${-392 + (i % 2) * 10}" width="24" height="${92 - (i % 2) * 10}" fill="${c}"/>`).join('')}
      ${['#8d6e63', '#26a69a', '#ec407a', '#fdd835', '#5c6bc0'].map((c, i) => `<rect x="${-20 + i * 32}" y="${-262 + (i % 3) * 8}" width="26" height="${92 - (i % 3) * 8}" fill="${c}"/>`).join('')}
      <circle cx="-80" cy="-212" r="30" fill="#4caf50"/><rect x="-100" y="-194" width="40" height="22" fill="#ff8a65"/>
      <rect x="-120" y="-120" width="110" height="90" rx="8" fill="#ffecb3"/><rect x="20" y="-100" width="110" height="70" rx="8" fill="#b3e5fc"/>
    </g>
    <g transform="translate(${mutfak ? 315 : 130} ${mutfak ? 190 : 230}) scale(${mutfak ? 0.7 : 1})"><rect x="-110" y="-80" width="220" height="160" fill="#fff" stroke="#a1887f" stroke-width="12"/><path d="M-96 66 L-30 -10 L20 40 L50 10 L96 66Z" fill="#81c784"/><circle cx="50" cy="-30" r="20" fill="#ffd54f"/></g>
    ${on(797, 'sehpanın', `<g transform="translate(800 735)"><ellipse rx="130" ry="26" fill="#8d6e63"/><rect x="-10" y="0" width="20" height="60" fill="#6d4c41"/><ellipse cy="60" rx="60" ry="12" fill="#6d4c41"/><circle cx="-40" cy="-20" r="14" fill="#ff7043"/><rect x="20" y="-44" width="30" height="30" rx="6" fill="#fff"/></g>`)}`;
}

const yildizDeniz = (x, y, s = 1) => `<polygon transform="translate(${x} ${y}) scale(${s})" fill="#ff8a65"
  points="0,-22 6,-7 22,-7 9,3 14,19 0,9 -14,19 -9,3 -22,-7 -6,-7"/>`;

export const ORTAMLAR = [
  {
    id: 'deniz', ad: 'Deniz Kenarı', ikon: '🏖️', ic: false, gunes: [1250, 170],
    ses: { yatak: { dalga: 0.75, ruzgar: 0.15 }, olay: { marti: 0.07, kus: 0.04, cocuk: 0.06 } },
    svg: () => `
      <rect y="420" width="1600" height="240" fill="#2196f3"/>
      <rect y="420" width="1600" height="40" fill="#1565c0" opacity=".45"/>
      <path d="M1120 424 Q1240 350 1360 424Z" fill="#5fa86a"/>
      <g class="yelkenli"><path d="M300 440 h80 l-12 14 h-56z" fill="#fff"/><path d="M340 438 V372 L376 432Z" fill="#fff"/><path d="M336 438 V382 L306 432Z" fill="#ffccbc"/></g>
      <g class="dalgalar" stroke="#fff" stroke-width="5" fill="none" opacity=".55" stroke-linecap="round">
        <path d="M60 480 q30 -14 60 0 t60 0"/><path d="M520 470 q30 -14 60 0 t60 0"/><path d="M980 500 q30 -14 60 0 t60 0"/>
        <path d="M260 540 q30 -14 60 0 t60 0"/><path d="M760 560 q30 -14 60 0 t60 0"/><path d="M1300 530 q30 -14 60 0 t60 0"/>
      </g>
      <path d="M0 610 Q400 570 800 600 T1600 590 V900 H0Z" fill="#f6d992"/>
      <path class="kopuk" d="M0 610 Q400 570 800 600 T1600 590" stroke="#fff" stroke-width="14" fill="none" opacity=".85" stroke-linecap="round"/>
      <path d="M0 640 Q400 600 800 630 T1600 620 V650 Q1200 660 800 660 T0 670Z" fill="#e8c57a" opacity=".6"/>
      <g transform="translate(1270 780)">
        <line x1="0" y1="0" x2="20" y2="-230" stroke="#795548" stroke-width="8"/>
        <path d="M-130 -200 Q20 -330 170 -180 Z" fill="#ff5252"/>
        <path d="M-80 -228 Q20 -330 30 -320 L20 -230 Z M60 -224 Q30 -330 30 -320 L20 -230Z" fill="#fff" opacity=".9"/>
      </g>
      <rect x="1080" y="790" width="240" height="80" rx="10" fill="#4fc3f7" transform="rotate(-6 1200 830)"/>
      <rect x="1080" y="810" width="240" height="14" fill="#fff" opacity=".7" transform="rotate(-6 1200 830)"/>
      <g transform="translate(330 800)">
        <rect x="-90" y="-60" width="180" height="70" fill="#e0b860"/>
        <rect x="-110" y="-120" width="60" height="130" fill="#e6c46e"/><rect x="50" y="-120" width="60" height="130" fill="#e6c46e"/>
        <rect x="-30" y="-150" width="60" height="160" fill="#ecca78"/>
        <path d="M-110 -120 h12 v-12 h12 v12 h12 v-12 h12 v12 h12 M50 -120 h12 v-12 h12 v12 h12 v-12 h12 v12 h12 M-30 -150 h12 v-12 h12 v12 h12 v-12 h12 v12 h12" fill="none" stroke="#ecca78" stroke-width="2"/>
        <path d="M-15 10 v-36 a15 15 0 0 1 30 0 v36z" fill="#b8913f"/>
        <line x1="0" y1="-150" x2="0" y2="-200" stroke="#795548" stroke-width="4"/><path d="M0 -200 l34 10 l-34 10z" fill="#ff5252"/>
      </g>
      <path d="M520 840 l30 -60 h60 l30 60z" fill="#ffca28"/><path d="M548 780 q32 -50 64 0" stroke="#ff7043" stroke-width="6" fill="none"/>
      ${yildizDeniz(760, 760)}${yildizDeniz(140, 860, .8)}
      <g fill="#ffe0e9" stroke="#e7a1b4" stroke-width="3"><path d="M900 860 q20 -40 40 0z"/><path d="M1480 760 q16 -32 32 0z"/></g>`,
  },
  {
    id: 'orman', ad: 'Orman', ikon: '🌲', ic: false, gunes: [1300, 150],
    ses: { yatak: { ruzgar: 0.35 }, olay: { kus: 0.45, guguk: 0.025, agackakan: 0.02 } },
    svg: () => `
      ${tepeler('#4b8a5c', '#5d9b63', 470)}
      ${[60, 190, 330, 470, 610, 760, 900, 1040, 1190, 1330, 1470, 1580].map((x, i) => cam(x, 500 + (i % 2) * 10, .8 + (i % 3) * .1, '#2c6e49')).join('')}
      <rect y="490" width="1600" height="410" fill="#62a84f"/>
      <path d="M700 490 Q620 620 760 700 T640 900 H900 Q820 780 900 690 T790 490Z" fill="#c9a26b"/>
      ${cam(120, 640, 1.3)}${cam(1480, 660, 1.4)}${on(600, 'ağacın', agac(330, 600, 1, '#56b05a', '#45964a'))}${on(590, 'ağacın', agac(1250, 590, 1.05, '#56b05a', '#45964a'))}
      ${cam(1060, 560, .95, '#35855a')}${cam(500, 560, .9, '#35855a')}
      ${on(740, 'çalının', cali(560, 740, 1))}${on(770, 'çalının', cali(1080, 770, 1.1))}${cali(60, 850, 1.2)}
      <g transform="translate(980 860)"><rect x="-130" y="-34" width="260" height="56" rx="28" fill="#8d6e63"/><ellipse cx="130" cy="-6" rx="18" ry="28" fill="#bcaaa4"/><ellipse cx="130" cy="-6" rx="9" ry="16" fill="#a1887f"/></g>
      <g transform="translate(420 820)"><rect x="-6" y="-22" width="12" height="24" fill="#fff3e0"/><path d="M-28 -20 Q0 -56 28 -20Z" fill="#e53935"/><circle cx="-10" cy="-32" r="4" fill="#fff"/><circle cx="8" cy="-28" r="3" fill="#fff"/></g>
      <g transform="translate(1340 840) scale(.8)"><rect x="-6" y="-22" width="12" height="24" fill="#fff3e0"/><path d="M-28 -20 Q0 -56 28 -20Z" fill="#e53935"/><circle cx="-10" cy="-32" r="4" fill="#fff"/></g>
      ${cimen(11, 70, 0, 1600, 560, 900)}${cicekler(4, 14, 0, 1600, 620, 890)}`,
  },
  {
    id: 'nehir', ad: 'Nehir Kenarı', ikon: '🏞️', ic: false, gunes: [300, 160],
    ses: { yatak: { dere: 0.7, ruzgar: 0.12 }, olay: { kus: 0.3, kurbaga: 0.05, blup: 0.6 } },
    svg: () => `
      ${tepeler('#6a9f6e', '#79b26f', 470)}
      ${[90, 260, 1340, 1500].map((x) => cam(x, 500, .8, '#2f7a4c')).join('')}
      <rect y="490" width="1600" height="410" fill="#77bb5b"/>
      <path d="M760 490 Q690 560 790 620 T700 760 T760 900 H1120 Q1020 820 1080 720 T900 580 T840 490Z" fill="#4fb3e8"/>
      <path d="M760 490 Q690 560 790 620 T700 760 T760 900" stroke="#c9a26b" stroke-width="16" fill="none"/>
      <path d="M840 490 Q960 520 900 580 T1080 720 T1120 900" stroke="#c9a26b" stroke-width="16" fill="none"/>
      <g class="akinti" stroke="#fff" stroke-width="5" fill="none" opacity=".6" stroke-linecap="round">
        <path d="M800 560 q20 10 40 0"/><path d="M820 650 q24 12 48 0"/><path d="M880 740 q28 12 56 0"/><path d="M900 840 q30 12 60 0"/><path d="M800 800 q20 10 40 0"/>
      </g>
      <g fill="#9e9e9e"><ellipse cx="760" cy="900" rx="60" ry="24"/><ellipse cx="1120" cy="880" rx="40" ry="18"/><ellipse cx="930" cy="690" rx="26" ry="12" fill="#bdbdbd"/></g>
      <g stroke="#558b2f" stroke-width="6" stroke-linecap="round">
        <path d="M690 720 q-10 -60 -4 -110 M705 730 q4 -70 14 -100 M675 740 q-20 -50 -30 -80"/><path d="M1130 700 q-6 -60 0 -100 M1145 710 q10 -60 20 -90"/>
      </g>
      <g fill="#6d4c41"><ellipse cx="686" cy="608" rx="8" ry="20"/><ellipse cx="719" cy="628" rx="7" ry="18"/><ellipse cx="1130" cy="598" rx="8" ry="20"/></g>
      ${on(700, 'ağacın', agac(280, 700, 1.2))}${agac(1400, 720, 1.25, '#5cb85c', '#4a9f4a')}${on(640, 'çalının', cali(520, 640, .9))}${cali(1320, 860, 1.1)}
      ${cimen(21, 60, 0, 640, 560, 900)}${cimen(22, 50, 1160, 1600, 560, 900)}${cicekler(7, 10, 0, 620, 640, 880)}${cicekler(8, 8, 1180, 1600, 640, 880)}`,
  },
  {
    id: 'sinif', ad: 'Sınıf', ikon: '🏫', ic: true, gunes: [1400, 230], bulutY: [140, 430], giris: [1185, 720],
    ses: { yatak: { oda: 0.6 }, olay: { tik: 1, cocuk: 0.04, kus: 0.03 } },
    svg: () => `
      <path fill-rule="evenodd" fill="#f8e9c9" d="M0 0H1600V640H0Z M90 120H430V470H90Z M1300 120H1520V470H1300Z"/>
      <rect y="560" width="1600" height="80" fill="#e9d2a6"/>
      ${pencere(90, 120, 340, 350)}${pencere(1300, 120, 220, 350)}
      <rect x="1108" y="318" width="154" height="322" rx="8" fill="#a1887f"/>
      ${kapi('koridor', 1120, 330, 130, 310, '#5d8aa8', '#7fa7c2')}
      <rect x="520" y="110" width="560" height="320" rx="10" fill="#8d6e63"/>
      <rect x="538" y="128" width="524" height="284" fill="#2f5d4a"/>
      <text x="800" y="230" text-anchor="middle" font-family="Comic Sans MS, Segoe Print, cursive" font-size="58" fill="#f1f8e9" opacity=".92">Merhaba!</text>
      <text x="800" y="320" text-anchor="middle" font-family="Comic Sans MS, Segoe Print, cursive" font-size="40" fill="#fff59d" opacity=".85">A B C  1 2 3</text>
      <path d="M600 370 q30 -24 60 0 t60 0" stroke="#f8bbd0" stroke-width="5" fill="none"/>
      <rect x="560" y="430" width="480" height="12" fill="#a1887f"/>
      <g transform="translate(800 62)"><circle r="40" fill="#fff" stroke="#5d4037" stroke-width="8"/><line y2="-24" stroke="#333" stroke-width="5" stroke-linecap="round"/><line x2="18" stroke="#333" stroke-width="5" stroke-linecap="round"/></g>
      ${['#ef5350', '#ffca28', '#66bb6a', '#42a5f5', '#ab47bc', '#ff7043'].map((c, i) => `<path d="M${470 + i * 112} 0 v40 l28 18 l28 -18 v-40z" fill="${c}"/>`).join('')}
      <rect y="640" width="1600" height="260" fill="#c8915a"/>
      <path d="M0 700 H1600 M0 770 H1600 M0 850 H1600" stroke="#b07a46" stroke-width="4"/>
      <g transform="translate(800 590)"><rect x="-170" y="-50" width="340" height="30" rx="6" fill="#8d6e63"/><rect x="-150" y="-20" width="20" height="70" fill="#6d4c41"/><rect x="130" y="-20" width="20" height="70" fill="#6d4c41"/></g>
      <g fill="#a1887f"><rect x="80" y="780" width="300" height="26" rx="6"/><rect x="1220" y="780" width="300" height="26" rx="6"/></g>
      <g fill="#795548"><rect x="100" y="806" width="16" height="80"/><rect x="344" y="806" width="16" height="80"/><rect x="1240" y="806" width="16" height="80"/><rect x="1484" y="806" width="16" height="80"/></g>
      <g transform="translate(1560 560)"><path d="M-30 0 h60 l-10 80 h-40z" fill="#ff8a65"/><circle cx="0" cy="-30" r="34" fill="#4caf50"/><circle cx="-22" cy="-6" r="20" fill="#43a047"/><circle cx="22" cy="-8" r="22" fill="#43a047"/></g>`,
  },
  {
    id: 'park', ad: 'Park', ikon: '🛝', ic: false, gunes: [1350, 160], isik: [[560, 434, 170]],
    ses: { yatak: { ruzgar: 0.15 }, olay: { kus: 0.3, cocuk: 0.22, top: 0.015 } },
    svg: () => `
      ${tepeler('#7cbf72', '#8fcf79', 480)}
      ${agac(120, 520, .7)}${agac(400, 515, .65)}${agac(1180, 515, .7)}${agac(1500, 520, .75)}
      <rect y="500" width="1600" height="400" fill="#8bd16b"/>
      <ellipse cx="800" cy="780" rx="900" ry="120" fill="#e0c391"/>
      <g transform="translate(330 720)" stroke-linecap="round">
        <path d="M-150 0 L-110 -260 L-70 0 M150 0 L110 -260 L70 0" stroke="#e53935" stroke-width="14" fill="none"/>
        <line x1="-120" y1="-258" x2="120" y2="-258" stroke="#c62828" stroke-width="16"/>
        <g class="salincak"><line x1="-50" y1="-250" x2="-50" y2="-70" stroke="#757575" stroke-width="4"/><line x1="0" y1="-250" x2="0" y2="-70" stroke="#757575" stroke-width="4"/><rect x="-62" y="-74" width="74" height="12" rx="4" fill="#1e88e5"/></g>
        <g class="salincak gec"><line x1="40" y1="-250" x2="40" y2="-90" stroke="#757575" stroke-width="4"/><line x1="86" y1="-250" x2="86" y2="-90" stroke="#757575" stroke-width="4"/><rect x="28" y="-94" width="70" height="12" rx="4" fill="#fdd835"/></g>
      </g>
      <g transform="translate(1100 720)">
        <rect x="-140" y="-230" width="14" height="230" fill="#757575"/><rect x="-90" y="-230" width="14" height="230" fill="#757575"/>
        <path d="M-140 -60 h64 M-140 -110 h64 M-140 -160 h64 M-140 -210 h64" stroke="#9e9e9e" stroke-width="8"/>
        <rect x="-150" y="-244" width="90" height="20" rx="6" fill="#ff9800"/>
        <path d="M-64 -240 Q40 -180 80 -30 Q90 0 140 0 h20 v-24 h-20 Q110 -24 104 -44 Q60 -200 -64 -268Z" fill="#ffb300"/>
      </g>
      ${on(696, 'bankın', `<g transform="translate(760 640)"><rect x="-120" y="-10" width="240" height="18" rx="6" fill="#8d6e63"/><rect x="-120" y="-48" width="240" height="16" rx="6" fill="#a1887f"/><rect x="-110" y="8" width="14" height="48" fill="#5d4037"/><rect x="96" y="8" width="14" height="48" fill="#5d4037"/></g>`)}
      <g transform="translate(1440 820)"><rect x="-130" y="-60" width="260" height="80" rx="8" fill="#8d6e63"/><rect x="-116" y="-46" width="232" height="56" rx="6" fill="#f6d992"/><path d="M-60 -20 q20 -26 40 0z" fill="#e0b860"/></g>
      <g transform="translate(560 640)"><rect x="-6" y="-200" width="12" height="200" fill="#455a64"/><circle cy="-206" r="20" fill="#fff59d"/></g>
      ${cimen(31, 80, 0, 1600, 520, 680)}${cicekler(12, 14, 0, 1600, 540, 660)}`,
  },
  {
    id: 'ev-ici', ad: 'Evin İçi', ikon: '🛋️', ic: true, gunes: [860, 210], bulutY: [120, 400],
    giris: { 'ev-onu': [1155, 690], mutfak: [315, 690], 'cocuk-odasi': [1320, 690] },
    ses: { yatak: { oda: 0.7 }, olay: { tik: 1, kus: 0.02 } },
    svg: () => evIci({ hedef: 'ev-onu', mutfak: 'mutfak', cocukOdasi: 'cocuk-odasi' }),
  },
  {
    // Evin İçi'ndeki 🍳 kapıdan girilir; ortam listesinde görünmez.
    // Önemli her şey x 220–1380 arasında: 4:3 tablette kenarlar kırpılsa da kapı ve dolaplar görünür.
    id: 'mutfak', ad: 'Mutfak', ikon: '🍳', ic: true, gizli: true, gunes: [880, 200], bulutY: [130, 370], giris: [1289, 690],
    ses: { yatak: { oda: 0.7 }, olay: { tik: 1, kus: 0.02 } },
    svg: () => `
      <path fill-rule="evenodd" fill="#e8f4ea" d="M0 0H1600V620H0Z M640 120H960V390H640Z"/>
      <rect x="400" y="300" width="780" height="160" fill="#fff"/>
      <path d="${Array.from({ length: 15 }, (_, i) => `M${450 + i * 50} 300 v160`).join(' ')} M400 340 H1180 M400 380 H1180 M400 420 H1180" stroke="#cfe3d3" stroke-width="3"/>
      ${pencere(640, 120, 320, 270)}
      <g fill="#ffb74d" stroke="#ef8f2f" stroke-width="4"><rect x="410" y="100" width="210" height="190" rx="8"/><rect x="980" y="100" width="190" height="190" rx="8"/></g>
      <path d="M515 100 v190 M1075 100 v190" stroke="#ef8f2f" stroke-width="4"/>
      <g fill="#8d6e63"><rect x="495" y="180" width="10" height="34" rx="4"/><rect x="525" y="180" width="10" height="34" rx="4"/><rect x="1055" y="180" width="10" height="34" rx="4"/><rect x="1085" y="180" width="10" height="34" rx="4"/></g>
      <g transform="translate(110 260)">
        <rect x="-90" y="0" width="180" height="14" rx="5" fill="#a1887f"/><rect x="-90" y="110" width="180" height="14" rx="5" fill="#a1887f"/>
        <rect x="-76" y="-46" width="40" height="46" rx="8" fill="#fff" opacity=".9"/><rect x="-76" y="-26" width="40" height="26" rx="6" fill="#ffcc80"/>
        <rect x="-20" y="-56" width="40" height="56" rx="8" fill="#fff" opacity=".9"/><rect x="-20" y="-30" width="40" height="30" rx="6" fill="#ef9a9a"/>
        <rect x="36" y="-40" width="40" height="40" rx="8" fill="#fff" opacity=".9"/><rect x="36" y="-22" width="40" height="22" rx="6" fill="#a5d6a7"/>
        <circle cx="-50" cy="86" r="24" fill="#ef5350"/><circle cx="10" cy="90" r="20" fill="#ffca28"/><circle cx="56" cy="88" r="22" fill="#66bb6a"/>
      </g>
      <g transform="translate(230 620)">
        <rect x="0" y="-370" width="160" height="370" rx="16" fill="#eceff1" stroke="#b0bec5" stroke-width="5"/>
        <path d="M0 -240 H160" stroke="#b0bec5" stroke-width="5"/>
        <rect x="132" y="-330" width="12" height="60" rx="5" fill="#90a4ae"/><rect x="132" y="-210" width="12" height="90" rx="5" fill="#90a4ae"/>
        <rect x="22" y="-340" width="34" height="40" rx="4" fill="#ffd54f" transform="rotate(-6 39 -320)"/><circle cx="84" cy="-306" r="14" fill="#ef5350"/><rect x="30" y="-180" width="60" height="44" rx="6" fill="#81d4fa" transform="rotate(4 60 -158)"/>
      </g>
      <rect x="400" y="455" width="780" height="24" rx="6" fill="#bcaaa4"/>
      <rect x="410" y="479" width="760" height="141" fill="#ffb74d"/>
      <path d="M610 479 v141 M790 479 v141 M980 479 v141" stroke="#ef8f2f" stroke-width="4"/>
      <g fill="#8d6e63"><rect x="770" y="530" width="10" height="34" rx="4"/><rect x="960" y="530" width="10" height="34" rx="4"/><rect x="1145" y="530" width="10" height="34" rx="4"/></g>
      <g transform="translate(510 455)">
        <rect x="-100" y="24" width="200" height="141" fill="#78909c"/><rect x="-80" y="50" width="160" height="80" rx="8" fill="#37474f"/><rect x="-60" y="38" width="120" height="8" rx="4" fill="#cfd8dc"/>
        <ellipse cx="-45" cy="-2" rx="34" ry="8" fill="#455a64"/><ellipse cx="45" cy="-2" rx="34" ry="8" fill="#455a64"/>
        <path d="M-75 -10 h60 v-46 a30 30 0 0 0 -60 0z" fill="#e53935"/><rect x="-81" y="-62" width="72" height="10" rx="5" fill="#c62828"/><rect x="-15" y="-46" width="30" height="8" rx="4" fill="#c62828"/>
        <path d="M20 -8 h50 l-6 -40 h-38z" fill="#90caf9"/><path d="M64 -40 q22 -2 18 18" stroke="#90caf9" stroke-width="6" fill="none"/>
      </g>
      <g transform="translate(800 455)"><rect x="-90" y="-6" width="180" height="16" rx="6" fill="#90a4ae"/><path d="M20 -6 v-46 q0 -14 -18 -14 h-10" stroke="#78909c" stroke-width="10" fill="none" stroke-linecap="round"/></g>
      <g transform="translate(1010 455)"><path d="M-50 -2 h100 l-10 -40 h-80z" fill="#a1887f"/><circle cx="-24" cy="-48" r="16" fill="#ef5350"/><circle cx="6" cy="-52" r="16" fill="#ffca28"/><circle cx="30" cy="-46" r="15" fill="#66bb6a"/><path d="M0 -70 q14 -20 26 -8" stroke="#6d4c41" stroke-width="5" fill="none"/></g>
      <g transform="translate(1125 455)"><rect x="-26" y="-60" width="52" height="60" rx="8" fill="#fff"/><path d="M-14 -60 v-20 M0 -60 v-26 M14 -60 v-18" stroke="#8d6e63" stroke-width="6" stroke-linecap="round"/></g>
      <rect x="1208" y="318" width="162" height="306" rx="8" fill="#a1887f"/>
      ${kapi('ev-ici', 1220, 330, 138, 290, '#6d4c41', '#8d6e63')}
      <g transform="translate(1289 170)"><circle r="34" fill="#fff" stroke="#5d4037" stroke-width="7"/><line y2="-20" stroke="#333" stroke-width="5" stroke-linecap="round"/><line x2="15" stroke="#333" stroke-width="5" stroke-linecap="round"/></g>
      <g transform="translate(1490 620)"><path d="M-34 0 h68 l-10 -70 h-48z" fill="#ff8a65"/><circle cx="0" cy="-100" r="40" fill="#4caf50"/><circle cx="-28" cy="-72" r="26" fill="#43a047"/><circle cx="28" cy="-76" r="28" fill="#43a047"/></g>
      <rect y="620" width="1600" height="280" fill="#f3e2c3"/>
      <path d="M0 690 H1600 M0 770 H1600 M0 850 H1600 ${Array.from({ length: 17 }, (_, i) => `M${i * 100} 620 L${(i - 8) * 130 + 800} 900`).join(' ')}" stroke="#e0c99c" stroke-width="4"/>
      ${on(846, 'masanın', `<g transform="translate(800 760)">
        <ellipse cy="86" rx="250" ry="20" fill="#000" opacity=".08"/>
        <rect x="-230" y="-40" width="460" height="28" rx="10" fill="#a1887f"/><rect x="-220" y="-14" width="440" height="10" fill="#8d6e63"/>
        <rect x="-200" y="-4" width="18" height="90" fill="#6d4c41"/><rect x="182" y="-4" width="18" height="90" fill="#6d4c41"/>
        <circle cx="-120" cy="-52" r="22" fill="#fff"/><circle cx="-120" cy="-52" r="12" fill="#ffcc80"/>
        <circle cx="110" cy="-52" r="22" fill="#fff"/><circle cx="110" cy="-52" r="12" fill="#a5d6a7"/>
        <rect x="-16" y="-80" width="32" height="40" rx="6" fill="#fff" opacity=".85"/><rect x="-16" y="-62" width="32" height="22" rx="4" fill="#ffab91"/>
      </g>`)}
      <g fill="#c56a12"><rect x="490" y="660" width="12" height="176"/><rect x="558" y="660" width="12" height="176"/><rect x="1030" y="660" width="12" height="176"/><rect x="1098" y="660" width="12" height="176"/></g>
      <g fill="#ef8f2f"><rect x="485" y="656" width="90" height="16" rx="6"/><rect x="1025" y="656" width="90" height="16" rx="6"/></g>
      <g fill="#ffb74d"><rect x="480" y="790" width="100" height="18" rx="6"/><rect x="1020" y="790" width="100" height="18" rx="6"/></g>`,
  },
  {
    // Evin İçi'ndeki ⭐ kapıdan girilir. Uyku, gece korkuları, kardeş ve "yatağın altı" temaları için.
    id: 'cocuk-odasi', ad: 'Çocuk Odası', ikon: '🧸', ic: true, gizli: true, gunes: [900, 200], bulutY: [120, 310],
    giris: { 'ev-ici': [315, 700] },
    ses: { yatak: { oda: 0.6 }, olay: { tik: 1, kus: 0.02 } },
    svg: () => {
      const r = rastgele(77);
      let yildizlar = '';
      for (let i = 0; i < 46; i++) {
        const x = r() * 1600, y = r() * 600;
        if (x > 730 && x < 1070 && y > 80 && y < 350) continue;
        yildizlar += i % 3 ? `<circle cx="${x}" cy="${y}" r="5"/>` : `<polygon transform="translate(${x} ${y}) scale(.7)" points="0,-14 4,-4 14,-4 6,2 9,12 0,6 -9,12 -6,2 -14,-4 -4,-4"/>`;
      }
      return `
      <path fill-rule="evenodd" fill="#e8eaf6" d="M0 0H1600V640H0Z M760 110H1040V320H760Z"/>
      <g fill="#c5cae9">${yildizlar}</g>
      <path d="M60 60 Q400 120 800 70 T1540 60" stroke="#9fa8da" stroke-width="3" fill="none"/>
      <g fill="#ffd54f">${Array.from({ length: 15 }, (_, i) => `<polygon transform="translate(${100 + i * 100} ${78 + Math.sin(i) * 12})" points="0,-12 3,-4 12,-4 5,2 8,11 0,5 -8,11 -5,2 -12,-4 -3,-4"/>`).join('')}</g>
      ${pencere(760, 110, 280, 210)}
      <path d="M730 92 h340" stroke="#8d6e63" stroke-width="8" stroke-linecap="round"/>
      <path d="M730 92 h70 q-10 110 6 240 h-76z" fill="#ffb74d"/><path d="M1070 92 h-70 q10 110 -6 240 h76z" fill="#ffb74d"/>
      <rect x="238" y="318" width="154" height="306" rx="8" fill="#a1887f"/>
      ${kapi('ev-ici', 250, 330, 130, 290, '#6d4c41', '#8d6e63')}
      <g transform="translate(560 220)"><rect x="-80" y="-60" width="160" height="120" fill="#fff" transform="rotate(-4)"/><circle cx="-40" cy="-20" r="18" fill="#ffca28"/><path d="M-10 40 v-36 l30 -24 l30 24 v36z" fill="#ef5350"/><rect x="10" y="12" width="20" height="28" fill="#5d4037"/></g>
      <rect y="640" width="1600" height="260" fill="#e6c39a"/>
      <path d="M0 700 H1600 M0 780 H1600 M0 860 H1600" stroke="#d4ab7c" stroke-width="4"/>
      <ellipse cx="820" cy="810" rx="300" ry="62" fill="#80deea"/><ellipse cx="820" cy="810" rx="220" ry="42" fill="none" stroke="#fff" stroke-width="8" opacity=".7"/>
      <g transform="translate(980 640)">
        <rect x="-60" y="-110" width="120" height="110" rx="10" fill="#ffcc80"/><path d="M-60 -56 h120" stroke="#ffb74d" stroke-width="4"/><circle cy="-80" r="6" fill="#8d6e63"/><circle cy="-28" r="6" fill="#8d6e63"/>
        <circle cy="-190" r="70" fill="#fff59d" opacity=".28"/><rect x="-6" y="-150" width="12" height="40" fill="#fff"/>
        <path d="M-42 -150 q0 -52 42 -56 q42 4 42 56z" fill="#f48fb1"/><g fill="#fff"><circle cx="-18" cy="-172" r="7"/><circle cx="14" cy="-186" r="6"/><circle cx="22" cy="-162" r="5"/></g>
      </g>
      ${on(752, 'yatağın', `<g transform="translate(630 700)">
        <rect x="-210" y="0" width="420" height="50" fill="#3e2723" opacity=".55"/>
        <rect x="-262" y="-236" width="44" height="288" rx="18" fill="#ff8a65"/><rect x="214" y="-150" width="44" height="202" rx="18" fill="#ff8a65"/>
        <rect x="-226" y="-40" width="450" height="42" rx="8" fill="#ffab91"/>
        <rect x="-222" y="-94" width="444" height="58" rx="20" fill="#fff"/>
        <path d="M-90 -100 h300 q14 0 14 14 v52 h-314z" fill="#7e57c2"/>
        <g fill="#ffd54f">${[[-50, -70], [20, -80], [90, -62], [160, -78]].map(([x, y]) => `<polygon transform="translate(${x} ${y}) scale(.8)" points="0,-12 3,-4 12,-4 5,2 8,11 0,5 -8,11 -5,2 -12,-4 -3,-4"/>`).join('')}</g>
        <ellipse cx="-160" cy="-104" rx="60" ry="28" fill="#fff" stroke="#e0e0e0" stroke-width="4"/>
        <g transform="translate(130 -120)"><circle r="26" fill="#a1887f"/><circle cx="-18" cy="-20" r="10" fill="#a1887f"/><circle cx="18" cy="-20" r="10" fill="#a1887f"/><circle cx="-8" cy="-4" r="3"/><circle cx="8" cy="-4" r="3"/><ellipse cy="8" rx="9" ry="6" fill="#d7ccc8"/></g>
      </g>`)}
      ${on(642, 'dolabın', `<g transform="translate(1215 640)">
        <rect x="-120" y="-420" width="240" height="420" rx="10" fill="#a1887f"/>
        <rect x="-108" y="-405" width="104" height="390" rx="6" fill="#bcaaa4"/><rect x="4" y="-405" width="104" height="390" rx="6" fill="#bcaaa4"/>
        <circle cx="-18" cy="-210" r="8" fill="#6d4c41"/><circle cx="18" cy="-210" r="8" fill="#6d4c41"/>
        <path d="M-130 -420 h260 l-14 -24 h-232z" fill="#8d6e63"/>
      </g>`)}
      ${on(838, 'oyuncak sandığının', `<g transform="translate(1110 838)">
        <circle cx="-40" cy="-112" r="22" fill="#ef5350"/><rect x="20" y="-130" width="36" height="36" rx="6" fill="#66bb6a"/>
        <rect x="-95" y="-92" width="190" height="92" rx="12" fill="#4fc3f7"/><rect x="-102" y="-104" width="204" height="22" rx="8" fill="#29b6f6"/>
        <g fill="#fff"><polygon transform="translate(0 -46)" points="0,-16 5,-5 16,-5 7,2 10,14 0,7 -10,14 -7,2 -16,-5 -5,-5"/></g>
      </g>`)}`;
    },
  },
  {
    id: 'ev-onu', ad: 'Evin Önü', ikon: '🏡', ic: false, gunes: [280, 160], giris: [1180, 740],
    ses: { yatak: { ruzgar: 0.2 }, olay: { kus: 0.3, araba: 0.012, cocuk: 0.03 } },
    svg: () => `
      ${tepeler('#86c27a', '#97d084', 480)}
      <rect y="500" width="1600" height="400" fill="#8fd36f"/>
      ${evDisi(1180, 640, 1, 'ev-ici')}
      <path d="M1130 670 Q1100 780 1000 900 H1300 Q1240 780 1230 670Z" fill="#d7ccc8"/>
      <g transform="translate(0 640)" fill="#fff">
        ${Array.from({ length: 16 }, (_, i) => `<path d="M${20 + i * 56} 0 v-96 l18 -20 l18 20 v96z"/>`).join('')}
        <rect x="0" y="-80" width="920" height="14"/><rect x="0" y="-36" width="920" height="14"/>
      </g>
      <g transform="translate(980 700)"><rect x="-6" y="-100" width="12" height="100" fill="#6d4c41"/><rect x="-40" y="-150" width="80" height="54" rx="26" fill="#1e88e5"/><rect x="34" y="-148" width="8" height="34" fill="#e53935"/></g>
      ${on(640, 'ağacın', agac(200, 640, 1.2))}${on(660, 'çalının', cali(560, 660, .9, '#4caf50'))}${on(670, 'çalının', cali(760, 670, .8, '#4caf50'))}
      <g transform="translate(420 840)"><circle r="44" fill="#90caf9" opacity=".7"/><rect x="-40" y="-6" width="80" height="14" rx="6" fill="#fff" opacity=".5"/></g>
      ${cimen(51, 70, 0, 1600, 700, 900)}${cicekler(13, 12, 0, 900, 700, 880)}`,
  },
  {
    // Ayrı yaşayan ebeveynler, taşınma ya da iki ev arasında gidip gelme hikayeleri için.
    // Evlere ad verilmez; hangi evin kimin olduğunu çocuk söyler.
    id: 'iki-ev', ad: 'İki Ev', ikon: '🏘️', ic: false, gunes: [800, 130],
    giris: { 'pembe-ev-ici': [400, 735], 'mavi-ev-ici': [1200, 735] },
    ses: { yatak: { ruzgar: 0.2 }, olay: { kus: 0.25, araba: 0.02, cocuk: 0.02 } },
    svg: () => `
      ${tepeler('#8cc77e', '#9bd38a', 470)}
      <rect y="500" width="1600" height="400" fill="#8fd36f"/>
      <rect y="790" width="1600" height="110" fill="#9e9e9e"/>
      <path d="M0 845 H1600" stroke="#fff" stroke-width="8" stroke-dasharray="60 46"/>
      <rect y="782" width="1600" height="12" fill="#bdbdbd"/>
      <path d="M365 650 L340 782 H460 L435 650Z M1165 650 L1140 782 H1260 L1235 650Z" fill="#d7ccc8"/>
      ${evDisi(400, 640, 0.75, 'pembe-ev-ici', { duvar: '#ffe4ee', cati: '#ec407a', catiKoyu: '#c2185b', kapiRenk: '#ad1457', kapiPanel: '#d81b60' })}
      ${evDisi(1200, 640, 0.75, 'mavi-ev-ici', { duvar: '#e3f1ff', cati: '#1e88e5', catiKoyu: '#1565c0', kapiRenk: '#0d47a1', kapiPanel: '#1976d2' })}
      ${on(660, 'ağacın', agac(800, 660, 1.1))}${on(680, 'çalının', cali(640, 680, .8, '#4caf50'))}${on(680, 'çalının', cali(960, 680, .8, '#4caf50'))}
      <g transform="translate(800 860)"><rect x="-70" y="-24" width="140" height="44" rx="14" fill="#fdd835"/><rect x="-46" y="-50" width="92" height="32" rx="10" fill="#fbc02d"/>
        <rect x="-38" y="-44" width="34" height="22" rx="4" fill="#bbdefb"/><rect x="4" y="-44" width="34" height="22" rx="4" fill="#bbdefb"/>
        <circle cx="-40" cy="22" r="14" fill="#37474f"/><circle cx="40" cy="22" r="14" fill="#37474f"/></g>
      ${cimen(61, 50, 0, 1600, 660, 780)}${cicekler(17, 10, 0, 1600, 680, 770)}`,
  },
  {
    id: 'pembe-ev-ici', ad: 'Pembe Evin İçi', ikon: '🩷', ic: true, gizli: true, gunes: [860, 210], bulutY: [120, 400], giris: [1155, 690],
    ses: { yatak: { oda: 0.7 }, olay: { tik: 1, kus: 0.02 } },
    svg: () => evIci({ hedef: 'iki-ev', duvar: '#fde6ef', serit: '#f9d3e3', perde: '#26a69a', koltuk: ['#5c6bc0', '#7986cb', '#3f51b5'], hali: '#ffcc80', kapiRenk: '#ad1457', kapiPanel: '#d81b60' }),
  },
  {
    id: 'mavi-ev-ici', ad: 'Mavi Evin İçi', ikon: '💙', ic: true, gizli: true, gunes: [860, 210], bulutY: [120, 400], giris: [1155, 690],
    ses: { yatak: { oda: 0.7 }, olay: { tik: 1, kus: 0.02 } },
    svg: () => evIci({ hedef: 'iki-ev', duvar: '#e2efff', serit: '#cfe3fb', perde: '#ff8a65', koltuk: ['#ef6c00', '#fb8c00', '#e65100'], hali: '#a5d6a7', kapiRenk: '#0d47a1', kapiPanel: '#1976d2' }),
  },
  {
    id: 'okul-bahcesi', ad: 'Okul Bahçesi', ikon: '🏀', ic: false, gunes: [1420, 140], giris: [800, 610],
    ses: { yatak: { ruzgar: 0.12 }, olay: { cocuk: 0.35, kus: 0.15, top: 0.05 } },
    svg: () => `
      ${tepeler('#8ec584', '#9fd18d', 470)}
      <g transform="translate(800 520)">
        <rect x="-520" y="-300" width="1040" height="300" fill="#f5c58a"/>
        <rect x="-540" y="-320" width="1080" height="30" fill="#d9925a"/>
        ${[0, 1].map((r) => Array.from({ length: 9 }, (_, i) => (i === 4 ? '' : `<rect x="${-480 + i * 110}" y="${-270 + r * 120}" width="70" height="80" fill="#bfe6ff" stroke="#fff" stroke-width="8"/>`)).join('')).join('')}
        ${kapi('koridor', -60, -140, 120, 140, '#8d6e63', '#a1887f')}
        <rect x="-110" y="-246" width="220" height="44" rx="8" fill="#1565c0"/>
        <text y="-216" text-anchor="middle" font-family="Segoe UI, Arial" font-weight="700" font-size="28" fill="#fff">OKULUMUZ</text>
      </g>
      <g transform="translate(180 560)"><rect x="-6" y="-360" width="12" height="360" fill="#bdbdbd"/>
        <g transform="translate(6 -350)"><g class="bayrak"><rect width="150" height="100" fill="#e30a17"/><circle cx="54" cy="50" r="25" fill="#fff"/><circle cx="61" cy="50" r="20" fill="#e30a17"/>
          <polygon transform="translate(92 50) scale(.9)" fill="#fff" points="-12,0 3,-5 3,-20 12,-7 26,-12 17,0 26,12 12,7 3,20 3,5"/></g></g></g>
      <rect y="520" width="1600" height="380" fill="#b9c0c7"/>
      <path d="M0 520 H1600" stroke="#9aa3ab" stroke-width="10"/>
      <g transform="translate(760 720)" stroke="#fff" stroke-width="6" fill="none" font-family="Segoe UI, Arial" font-size="36">
        <rect x="-60" y="60" width="120" height="70"/><rect x="-60" y="-10" width="120" height="70"/><rect x="-120" y="-80" width="120" height="70"/><rect x="0" y="-80" width="120" height="70"/><rect x="-60" y="-150" width="120" height="70"/>
        <g fill="#fff" stroke="none" text-anchor="middle"><text y="108">1</text><text y="38">2</text><text x="-60" y="-32">3</text><text x="60" y="-32">4</text><text y="-102">5</text></g>
      </g>
      <g transform="translate(250 840)"><rect x="-10" y="-330" width="20" height="330" fill="#546e7a"/><rect x="-10" y="-330" width="110" height="16" fill="#546e7a"/>
        <rect x="90" y="-400" width="130" height="90" fill="#fff" stroke="#e53935" stroke-width="6"/><ellipse cx="155" cy="-306" rx="44" ry="8" fill="none" stroke="#ff7043" stroke-width="7"/>
        <path d="M115 -304 l14 50 h52 l14 -50" stroke="#eee" stroke-width="3" fill="none"/></g>
      ${agac(1460, 700, 1.15)}${agac(1240, 640, .9, '#5cb85c', '#4a9f4a')}
      <g transform="translate(1180 840)"><rect x="-130" y="-10" width="260" height="18" rx="6" fill="#26a69a"/><rect x="-130" y="-50" width="260" height="16" rx="6" fill="#4db6ac"/><rect x="-118" y="8" width="14" height="44" fill="#455a64"/><rect x="104" y="8" width="14" height="44" fill="#455a64"/></g>`,
  },
  {
    id: 'kamp', ad: 'Kamp Alanı', ikon: '🏕️', ic: false, gunes: [420, 150], isik: [[760, 720, 320, true]],
    ses: { yatak: { ates: 0.6, ruzgar: 0.2 }, olay: { citirti: 6, kus: 0.15, baykus: 0.008 } },
    svg: () => `
      <path d="M0 470 L220 250 L330 340 L520 170 L760 430 L900 300 L1100 160 L1340 380 L1470 280 L1600 400 V520 H0Z" fill="#8090b0"/>
      <path d="M520 170 L470 224 L500 220 L520 240 L548 214 L572 226Z M1100 160 L1050 214 L1084 206 L1110 228 L1130 204 L1158 222Z M220 250 L190 280 L230 290 L260 284Z" fill="#fff"/>
      <rect y="470" width="1600" height="430" fill="#6aa84f"/>
      <ellipse cx="300" cy="560" rx="320" ry="56" fill="#4aa3df"/><ellipse cx="300" cy="552" rx="260" ry="30" fill="#7cc4f0" opacity=".5"/>
      ${[640, 760, 880, 1000, 1500, 1580].map((x, i) => cam(x, 520 + (i % 2) * 12, .75, '#2c6e49')).join('')}
      ${cam(60, 700, 1.4)}${cam(1530, 760, 1.5, '#2f7d4f')}
      <g transform="translate(1230 700)">
        <path d="M-200 0 L0 -260 L200 0Z" fill="#ff8f00"/><path d="M-200 0 L0 -260 L40 0Z" fill="#ffa726"/>
        <path d="M-50 0 L0 -150 L50 0Z" fill="#5d4037"/><line x1="0" y1="-260" x2="0" y2="-290" stroke="#5d4037" stroke-width="6"/>
        <line x1="-200" y1="0" x2="-260" y2="20" stroke="#bcaaa4" stroke-width="3"/><line x1="200" y1="0" x2="260" y2="20" stroke="#bcaaa4" stroke-width="3"/>
      </g>
      <g transform="translate(760 800)">
        ${Array.from({ length: 10 }, (_, i) => { const a = i / 10 * Math.PI * 2; return `<ellipse cx="${Math.cos(a) * 110}" cy="${Math.sin(a) * 34}" rx="26" ry="16" fill="${i % 2 ? '#9e9e9e' : '#bdbdbd'}"/>`; }).join('')}
        <rect x="-80" y="-24" width="160" height="26" rx="12" fill="#6d4c41" transform="rotate(14)"/><rect x="-80" y="-24" width="160" height="26" rx="12" fill="#795548" transform="rotate(-14)"/>
        <g class="alev"><path d="M-60 -10 Q-70 -90 -20 -150 Q-10 -90 10 -110 Q50 -60 30 -170 Q90 -90 60 -10Z" fill="#ff7043"/>
          <path d="M-36 -10 Q-40 -70 -6 -110 Q4 -70 20 -80 Q44 -50 36 -10Z" fill="#ffca28"/></g>
      </g>
      <g transform="translate(460 830)"><rect x="-120" y="-30" width="240" height="56" rx="28" fill="#8d6e63"/><ellipse cx="120" cy="-2" rx="16" ry="28" fill="#bcaaa4"/></g>
      <g transform="translate(1050 860)"><rect x="-110" y="-30" width="220" height="56" rx="28" fill="#8d6e63"/><ellipse cx="-110" cy="-2" rx="16" ry="28" fill="#bcaaa4"/></g>
      ${cimen(61, 60, 0, 1600, 620, 900, '#4e8f3a')}${cicekler(16, 6, 0, 600, 660, 880)}`,
  },
  {
    id: 'hastane', ad: 'Hastane', ikon: '🏥', ic: true, gunes: [1250, 180], bulutY: [110, 280], giris: { muayene: [315, 700] },
    ses: { yatak: { oda: 0.55 }, olay: { bip: 1, cocuk: 0.01 } },
    svg: () => `
      <path fill-rule="evenodd" fill="#dff2ee" d="M0 0H1600V620H0Z M1110 90H1390V290H1110Z"/>
      <rect y="350" width="1600" height="16" fill="#b2dfdb"/>
      ${pencere(1110, 90, 280, 200)}
      <path d="M40 40 h880" stroke="#90a4ae" stroke-width="8"/>
      <path d="M60 44 q30 260 0 560 h120 q-30 -280 0 -560z" fill="#80cbc4" opacity=".9"/>
      <rect y="620" width="1600" height="280" fill="#cfd8dc"/>
      <path d="${Array.from({ length: 9 }, (_, i) => `M${i * 200} 620 L${i * 200 - 120} 900`).join(' ')} M0 700 H1600 M0 800 H1600" stroke="#b0bec5" stroke-width="3"/>
      <rect x="238" y="318" width="154" height="306" rx="8" fill="#90a4ae"/>
      ${kapi('muayene', 250, 330, 130, 290, '#80cbc4', '#b2dfdb', '🩺')}
      ${on(732, 'yatağın', `<g transform="translate(720 700) scale(.8)">
        <rect x="-330" y="-140" width="660" height="70" rx="10" fill="#eceff1"/>
        <rect x="-330" y="-160" width="660" height="40" rx="16" fill="#fff"/>
        <rect x="-110" y="-162" width="440" height="56" rx="14" fill="#64b5f6"/>
        <rect x="-310" y="-196" width="170" height="52" rx="24" fill="#fff" stroke="#e0e0e0" stroke-width="4"/>
        <rect x="-350" y="-300" width="26" height="320" rx="10" fill="#90a4ae"/><rect x="324" y="-220" width="26" height="240" rx="10" fill="#90a4ae"/>
        <g fill="#546e7a"><circle cx="-300" cy="40" r="14"/><circle cx="300" cy="40" r="14"/></g>
      </g>`)}
      <g transform="translate(1040 640)"><rect x="-5" y="-400" width="10" height="400" fill="#90a4ae"/><path d="M-40 -400 h80" stroke="#90a4ae" stroke-width="8"/><rect x="18" y="-390" width="44" height="70" rx="12" fill="#e3f2fd" stroke="#90caf9" stroke-width="4"/><path d="M40 -320 q0 100 -40 160" stroke="#90caf9" stroke-width="3" fill="none"/><path d="M-40 0 h80" stroke="#78909c" stroke-width="10"/></g>
      <g transform="translate(700 210)"><rect x="-150" y="-90" width="300" height="180" rx="16" fill="#263238"/><rect x="-136" y="-76" width="272" height="152" rx="8" fill="#102027"/>
        <path class="nabiz" d="M-130 0 h60 l14 -40 l18 80 l16 -60 l10 20 h60 l14 -40 l18 80 l16 -60 l10 20 h30" stroke="#69f0ae" stroke-width="5" fill="none" stroke-linejoin="round"/>
        <text x="110" y="-46" font-family="Segoe UI, Arial" font-size="26" fill="#69f0ae" text-anchor="end">♥ 82</text></g>
      <g class="malzeme-dolabi" data-dolap="tibbi" transform="translate(1250 650)">
        <title>Malzeme Dolabı: dokun, tıbbi malzemeleri seç</title>
        <rect x="-140" y="-282" width="280" height="292" rx="14" fill="#fff" stroke="#b0bec5" stroke-width="6"/>
        <rect x="-118" y="-262" width="112" height="140" rx="6" fill="#e3f2fd" stroke="#90caf9" stroke-width="4"/>
        <rect x="6" y="-262" width="112" height="140" rx="6" fill="#e3f2fd" stroke="#90caf9" stroke-width="4"/>
        <path d="M-118 -196 h236" stroke="#90caf9" stroke-width="4"/>
        <g><rect x="-104" y="-240" width="22" height="40" rx="5" fill="#ffb74d"/><rect x="-74" y="-232" width="24" height="32" rx="5" fill="#81c784"/><rect x="-42" y="-244" width="20" height="44" rx="5" fill="#ef9a9a"/>
          <rect x="22" y="-226" width="48" height="26" rx="5" fill="#fff" stroke="#e53935" stroke-width="3"/><circle cx="92" cy="-216" r="16" fill="#fff" stroke="#bdbdbd" stroke-width="5"/>
          <rect x="-104" y="-170" width="60" height="40" rx="6" fill="#fff" stroke="#e53935" stroke-width="3"/><path d="M-80 -150 h12 M-74 -156 v12" stroke="#e53935" stroke-width="4"/>
          <rect x="-34" y="-166" width="14" height="36" rx="4" fill="#ce93d8"/><rect x="22" y="-174" width="40" height="44" rx="6" fill="#4fc3f7"/><rect x="72" y="-160" width="30" height="30" rx="15" fill="#ffd54f"/></g>
        <rect x="-118" y="-112" width="112" height="108" rx="6" fill="#eceff1"/><rect x="6" y="-112" width="112" height="108" rx="6" fill="#eceff1"/>
        <rect x="-26" y="-74" width="10" height="34" rx="4" fill="#90a4ae"/><rect x="16" y="-74" width="10" height="34" rx="4" fill="#90a4ae"/>
        <g transform="translate(0 -310)"><rect x="-122" y="-28" width="244" height="54" rx="27" fill="#e53935"/><rect x="-104" y="-8" width="30" height="14" fill="#fff"/><rect x="-96" y="-16" width="14" height="30" fill="#fff"/>
          <text x="18" y="10" text-anchor="middle" font-family="Segoe UI, Arial" font-size="27" font-weight="800" fill="#fff">MALZEME</text></g>
      </g>
      <g transform="translate(1030 800)"><rect x="-70" y="-150" width="140" height="20" rx="8" fill="#4db6ac"/><rect x="-70" y="-60" width="140" height="24" rx="8" fill="#26a69a"/><rect x="-62" y="-130" width="16" height="200" fill="#455a64"/><rect x="46" y="-130" width="16" height="200" fill="#455a64"/></g>
      <g transform="translate(330 120)"><circle r="50" fill="#fff" stroke="#80cbc4" stroke-width="6"/><path d="M0 -26 q24 -30 36 0 q0 20 -36 44 q-36 -24 -36 -44 q12 -30 36 0z" fill="#ff8a80"/></g>`,
  },
  {
    // Hastanedeki 🩺 kapıdan girilir. Muayene, boy-kilo ölçümü, göz testi; içeriden ameliyathaneye geçilir.
    id: 'muayene', ad: 'Muayene Odası', ikon: '🩺', ic: true, gizli: true, gunes: [730, 190], bulutY: [110, 270],
    giris: { hastane: [315, 700], ameliyathane: [1289, 700] },
    ses: { yatak: { oda: 0.55 }, olay: { tik: 1, bip: 0.3 } },
    svg: () => `
      <path fill-rule="evenodd" fill="#e0f7fa" d="M0 0H1600V640H0Z M600 100H860V280H600Z"/>
      <rect y="420" width="1600" height="220" fill="#b2ebf2"/><rect y="412" width="1600" height="10" fill="#80deea"/>
      ${pencere(600, 100, 260, 180)}
      <rect x="238" y="318" width="154" height="306" rx="8" fill="#90a4ae"/>
      ${kapi('hastane', 250, 330, 130, 290, '#90a4ae', '#b0bec5')}
      <rect x="1208" y="318" width="162" height="306" rx="8" fill="#607d8b"/>
      ${kapi('ameliyathane', 1220, 330, 138, 290, '#26a69a', '#4db6ac', '✚')}
      <g transform="translate(450 640)">
        <rect x="-22" y="-470" width="44" height="470" rx="6" fill="#fff59d" stroke="#fbc02d" stroke-width="3"/>
        <path d="${Array.from({ length: 23 }, (_, i) => `M-22 ${-20 - i * 20} h${i % 5 ? 12 : 24}`).join(' ')}" stroke="#f57f17" stroke-width="3"/>
        <circle cy="-492" r="24" fill="#ffca28"/><circle cx="-8" cy="-496" r="3"/><circle cx="8" cy="-496" r="3"/><circle cx="-14" cy="-516" r="6" fill="#8d6e63"/><circle cx="14" cy="-516" r="6" fill="#8d6e63"/>
      </g>
      <g transform="translate(1080 210)"><rect x="-80" y="-100" width="160" height="210" rx="6" fill="#fff" stroke="#90a4ae" stroke-width="5"/>
        <g font-family="Arial" font-weight="700" fill="#263238" text-anchor="middle"><text y="-36" font-size="56">E</text><text y="14" font-size="34">F  P</text><text y="52" font-size="24">T O Z</text><text y="82" font-size="16">L P E D</text></g></g>
      <rect y="640" width="1600" height="260" fill="#cfd8dc"/>
      <path d="${Array.from({ length: 9 }, (_, i) => `M${i * 200} 640 L${i * 200 - 120} 900`).join(' ')} M0 720 H1600 M0 810 H1600" stroke="#b0bec5" stroke-width="3"/>
      ${on(706, 'muayene masasının', `<g transform="translate(730 700)">
        <rect x="-190" y="-74" width="18" height="80" fill="#78909c"/><rect x="172" y="-74" width="18" height="80" fill="#78909c"/>
        <rect x="-210" y="-120" width="420" height="52" rx="16" fill="#4db6ac"/>
        <path d="M-210 -112 q0 -60 70 -70 l20 62z" fill="#26a69a"/>
        <rect x="-150" y="-128" width="320" height="12" rx="4" fill="#fff" opacity=".92"/>
        <rect x="170" y="-30" width="80" height="20" rx="6" fill="#90a4ae"/><rect x="180" y="-10" width="12" height="16" fill="#78909c"/><rect x="228" y="-10" width="12" height="16" fill="#78909c"/>
      </g>`)}
      <g transform="translate(1040 640)"><rect x="-110" y="-150" width="220" height="20" rx="6" fill="#8d6e63"/><rect x="-100" y="-130" width="16" height="130" fill="#6d4c41"/><rect x="84" y="-130" width="16" height="130" fill="#6d4c41"/>
        <rect x="-60" y="-250" width="110" height="80" rx="8" fill="#37474f"/><rect x="-52" y="-242" width="94" height="64" rx="4" fill="#81d4fa"/><rect x="-12" y="-170" width="20" height="20" fill="#37474f"/>
        <path d="M60 -152 q10 -40 30 -20 q10 14 -14 22" stroke="#455a64" stroke-width="5" fill="none"/><circle cx="62" cy="-156" r="8" fill="#90a4ae"/></g>
      <g transform="translate(450 820)"><rect x="-60" y="-14" width="120" height="22" rx="8" fill="#eceff1" stroke="#b0bec5" stroke-width="3"/><rect x="-20" y="-10" width="40" height="12" rx="3" fill="#80cbc4"/></g>`,
  },
  {
    // Muayene odasından girilir. Ameliyat / işlem öncesi hazırlık oyunu için sakin, aydınlık bir oda.
    id: 'ameliyathane', ad: 'Ameliyathane', ikon: '😷', ic: true, gizli: true, gunes: [800, -300], bulutY: [-400, -300],
    giris: { muayene: [315, 700] },
    ses: { yatak: { oda: 0.5 }, olay: { bip: 1 } },
    svg: () => `
      <rect width="1600" height="640" fill="#b2dfdb"/>
      <path d="${Array.from({ length: 16 }, (_, i) => `M${i * 100 + 50} 0 V640`).join(' ')} ${Array.from({ length: 6 }, (_, i) => `M0 ${i * 100 + 60} H1600`).join(' ')}" stroke="#a5d6a7" stroke-width="3"/>
      <rect x="238" y="318" width="154" height="306" rx="8" fill="#607d8b"/>
      ${kapi('muayene', 250, 330, 130, 290, '#26a69a', '#4db6ac')}
      <rect y="640" width="1600" height="260" fill="#cfd8dc"/>
      <path d="M0 720 H1600 M0 810 H1600" stroke="#b0bec5" stroke-width="3"/>
      <path d="M680 160 L560 680 H1040 L920 160Z" fill="#fffde7" opacity=".28"/>
      <g transform="translate(800 0)"><rect x="-10" y="0" width="20" height="100" fill="#90a4ae"/>
        <ellipse cy="130" rx="170" ry="48" fill="#eceff1" stroke="#90a4ae" stroke-width="8"/>
        <g fill="#fffde7" stroke="#ffe082" stroke-width="3"><circle cx="-90" cy="132" r="22"/><circle cy="140" r="24"/><circle cx="90" cy="132" r="22"/></g></g>
      <g transform="translate(480 640)"><rect x="-5" y="-200" width="10" height="200" fill="#90a4ae"/><ellipse cy="2" rx="44" ry="10" fill="#78909c"/>
        <rect x="-70" y="-214" width="140" height="18" rx="6" fill="#64b5f6"/><g fill="#b0bec5"><rect x="-56" y="-226" width="34" height="10" rx="4"/><rect x="-12" y="-226" width="26" height="10" rx="4"/><circle cx="40" cy="-222" r="8"/></g></g>
      ${on(736, 'ameliyat masasının', `<g transform="translate(800 700)">
        <rect x="-120" y="20" width="240" height="16" rx="8" fill="#78909c"/><rect x="-30" y="-74" width="60" height="96" fill="#90a4ae"/>
        <rect x="-270" y="-112" width="540" height="44" rx="18" fill="#4db6ac"/><ellipse cx="-210" cy="-116" rx="50" ry="16" fill="#fff"/>
        <rect x="-120" y="-120" width="300" height="14" rx="6" fill="#80cbc4"/>
      </g>`)}
      <g transform="translate(1190 640)"><rect x="-80" y="-300" width="160" height="290" rx="12" fill="#eceff1" stroke="#b0bec5" stroke-width="4"/>
        <rect x="-64" y="-284" width="128" height="80" rx="6" fill="#102027"/><path class="nabiz" d="M-58 -244 h30 l8 -22 l10 44 l8 -30 l6 8 h50" stroke="#69f0ae" stroke-width="4" fill="none"/>
        <g fill="#90a4ae"><circle cx="-36" cy="-170" r="12"/><circle cx="0" cy="-170" r="12"/><circle cx="36" cy="-170" r="12"/></g>
        <rect x="-50" y="-130" width="100" height="70" rx="10" fill="#cfd8dc"/><g fill="#546e7a"><circle cx="-60" r="12"/><circle cx="60" r="12"/></g></g>`,
  },
  {
    // Okul bahçesinden ve sınıftan girilen teneffüs koridoru: sınıfa, rehberlik odasına ve bahçeye kapı.
    id: 'koridor', ad: 'Okul Koridoru', ikon: '🚪', ic: true, gizli: true, gunes: [550, 170], bulutY: [105, 240],
    giris: { 'okul-bahcesi': [325, 700], sinif: [765, 700], rehberlik: [1215, 700] },
    ses: { yatak: { oda: 0.5 }, olay: { cocuk: 0.25, tik: 0.5 } },
    svg: () => {
      const dolaplar = (x0, adet) => Array.from({ length: adet }, (_, i) => {
        const x = x0 + i * 56, renk = ['#42a5f5', '#ef5350', '#66bb6a', '#ffca28'][i % 4];
        return `<rect x="${x}" y="400" width="52" height="236" rx="4" fill="${renk}"/><path d="M${x + 12} 420 h28 M${x + 12} 430 h28 M${x + 12} 440 h28" stroke="#fff" stroke-width="3" opacity=".6"/><rect x="${x + 38}" y="510" width="6" height="26" rx="3" fill="#fff"/>`;
      }).join('');
      const levha = (x, yazi) => `<rect x="${x - 70}" y="208" width="140" height="38" rx="8" fill="#fff" stroke="#8d6e63" stroke-width="4"/><text x="${x}" y="235" text-anchor="middle" font-family="Segoe UI, Arial" font-size="22" font-weight="800" fill="#5d4037">${yazi}</text>`;
      return `
      <path fill-rule="evenodd" fill="#fff3e0" d="M0 0H1600V640H0Z M410 100H690V250H410Z"/>
      <rect y="380" width="1600" height="260" fill="#ffe0b2"/><rect y="372" width="1600" height="10" fill="#ffcc80"/>
      ${pencere(410, 100, 280, 150)}
      <g transform="translate(990 220)"><rect x="-130" y="-110" width="260" height="220" rx="8" fill="#d7a86e" stroke="#8d6e63" stroke-width="10"/>
        <rect x="-110" y="-90" width="70" height="90" fill="#fff" transform="rotate(-5)"/><circle cx="-76" cy="-56" r="18" fill="#ffca28"/>
        <rect x="-20" y="-96" width="80" height="70" fill="#e1f5fe" transform="rotate(4)"/><path d="M-6 -40 l20 -30 l20 30z" fill="#66bb6a"/>
        <rect x="-100" y="20" width="90" height="70" fill="#fce4ec"/><path d="M-86 70 q30 -50 60 0" stroke="#ec407a" stroke-width="6" fill="none"/>
        <rect x="20" y="10" width="90" height="80" fill="#fff9c4" transform="rotate(-3)"/><text x="64" y="58" text-anchor="middle" font-family="Comic Sans MS, cursive" font-size="22" fill="#5d4037">A B C</text></g>
      ${dolaplar(412, 5)}${dolaplar(862, 5)}
      <rect x="248" y="318" width="154" height="318" rx="8" fill="#a1887f"/>${kapi('okul-bahcesi', 260, 330, 130, 306, '#8d6e63', '#a1887f', '🌳')}${levha(325, 'BAHÇE')}
      <rect x="688" y="318" width="154" height="318" rx="8" fill="#a1887f"/>${kapi('sinif', 700, 330, 130, 306, '#5d8aa8', '#7fa7c2', '📚')}${levha(765, 'SINIF 1-A')}
      <rect x="1138" y="318" width="154" height="318" rx="8" fill="#a1887f"/>${kapi('rehberlik', 1150, 330, 130, 306, '#ab47bc', '#ce93d8', '💛')}${levha(1215, 'REHBERLİK')}
      <g transform="translate(1460 640)"><rect x="-50" y="-180" width="100" height="180" rx="10" fill="#90a4ae"/><rect x="-36" y="-170" width="72" height="40" rx="8" fill="#cfd8dc"/><path d="M0 -150 q14 -30 26 -10" stroke="#4fc3f7" stroke-width="5" fill="none"/></g>
      <rect y="640" width="1600" height="260" fill="#e0e0e0"/>
      <path d="M0 700 H1600 M0 780 H1600 M0 860 H1600" stroke="#cfcfcf" stroke-width="4"/>
      <path d="M200 760 h1200" stroke="#fff" stroke-width="40" opacity=".35" stroke-linecap="round"/>`;
    },
  },
  {
    // Koridordaki 💛 kapıdan girilir: rehberlik servisinin oyun odası.
    id: 'rehberlik', ad: 'Rehberlik Odası', ikon: '💛', ic: true, gizli: true, gunes: [1040, 200], bulutY: [120, 310],
    giris: { koridor: [315, 700] },
    ses: { yatak: { oda: 0.6 }, olay: { tik: 1, kus: 0.03 } },
    svg: () => `
      <path fill-rule="evenodd" fill="#fff8e1" d="M0 0H1600V640H0Z M900 110H1180V320H900Z"/>
      <rect y="430" width="1600" height="210" fill="#ffecb3"/><rect y="422" width="1600" height="10" fill="#ffe082"/>
      ${pencere(900, 110, 280, 210)}
      <rect x="238" y="318" width="154" height="306" rx="8" fill="#a1887f"/>
      ${kapi('koridor', 250, 330, 130, 290, '#ab47bc', '#ce93d8')}
      <g transform="translate(560 210)"><rect x="-120" y="-100" width="240" height="210" rx="10" fill="#fff" stroke="#ffcc80" stroke-width="8"/>
        <text y="-66" text-anchor="middle" font-family="Segoe UI, Arial" font-size="24" font-weight="800" fill="#6d4c41">Duygular</text>
        ${[['#ffd54f', 'M-12 8 q12 12 24 0'], ['#64b5f6', 'M-12 14 q12 -12 24 0'], ['#ef5350', 'M-12 12 h24'], ['#b39ddb', 'M-8 12 a8 6 0 1 0 16 0 a8 6 0 1 0 -16 0'], ['#81c784', 'M-12 8 q12 14 24 0'], ['#ffab91', 'M-12 12 q6 -6 12 0 q6 6 12 0']]
          .map(([c, m], i) => `<g transform="translate(${-70 + (i % 3) * 70} ${-6 + Math.floor(i / 3) * 70})"><circle r="28" fill="${c}"/><circle cx="-9" cy="-6" r="4" fill="#3e2723"/><circle cx="9" cy="-6" r="4" fill="#3e2723"/><path d="${m}" stroke="#3e2723" stroke-width="4" fill="none" stroke-linecap="round"/></g>`).join('')}</g>
      <g transform="translate(1300 640)"><rect x="-80" y="-340" width="160" height="340" fill="#a1887f"/>
        <rect x="-68" y="-326" width="136" height="96" fill="#8d6e63"/><rect x="-68" y="-216" width="136" height="96" fill="#8d6e63"/><rect x="-68" y="-106" width="136" height="96" fill="#8d6e63"/>
        <circle cx="-34" cy="-258" r="22" fill="#ffca28"/><rect x="0" y="-284" width="44" height="54" rx="8" fill="#ef9a9a"/>
        <rect x="-56" y="-166" width="34" height="34" fill="#42a5f5"/><rect x="-18" y="-166" width="34" height="34" fill="#66bb6a"/><rect x="-37" y="-196" width="34" height="30" fill="#ffca28"/>
        <rect x="-50" y="-60" width="70" height="38" rx="10" fill="#ef5350"/><circle cx="-34" cy="-20" r="10" fill="#37474f"/><circle cx="6" cy="-20" r="10" fill="#37474f"/></g>
      <rect y="640" width="1600" height="260" fill="#d7a26d"/>
      <path d="M0 700 H1600 M0 780 H1600 M0 860 H1600" stroke="#c48d57" stroke-width="4"/>
      <ellipse cx="760" cy="800" rx="330" ry="66" fill="#ce93d8"/><ellipse cx="760" cy="800" rx="250" ry="46" fill="none" stroke="#fff" stroke-width="8" opacity=".6"/>
      ${on(690, 'minderin', `<g transform="translate(470 690)"><ellipse cy="-50" rx="90" ry="64" fill="#4db6ac"/><ellipse cx="-20" cy="-76" rx="40" ry="20" fill="#80cbc4" opacity=".7"/></g>`)}
      <g transform="translate(1040 720)"><rect x="-120" y="-64" width="240" height="64" rx="8" fill="#8d6e63"/><rect x="-104" y="-56" width="208" height="44" rx="4" fill="#ffe0a3"/>
        <rect x="-110" y="0" width="14" height="40" fill="#6d4c41"/><rect x="96" y="0" width="14" height="40" fill="#6d4c41"/>
        <circle cx="-60" cy="-46" r="14" fill="#66bb6a"/><rect x="-64" y="-36" width="6" height="12" fill="#6d4c41"/><path d="M10 -20 v-18 l14 -12 l14 12 v18z" fill="#ef5350"/><circle cx="70" cy="-30" r="8" fill="#42a5f5"/></g>
      ${on(840, 'masanın', `<g transform="translate(760 760)">
        <rect x="-190" y="-50" width="16" height="130" fill="#ff8a65"/><rect x="-250" y="-6" width="90" height="16" rx="6" fill="#ff7043"/><rect x="-246" y="10" width="10" height="70" fill="#e64a19"/>
        <rect x="174" y="-50" width="16" height="130" fill="#ff8a65"/><rect x="160" y="-6" width="90" height="16" rx="6" fill="#ff7043"/><rect x="236" y="10" width="10" height="70" fill="#e64a19"/>
        <ellipse cy="-30" rx="150" ry="30" fill="#ffcc80"/><rect x="-12" y="-30" width="24" height="100" fill="#ffb74d"/><ellipse cy="72" rx="60" ry="10" fill="#ffb74d"/>
        <rect x="-60" y="-50" width="50" height="34" rx="4" fill="#fff" transform="rotate(-8)"/><circle cx="50" cy="-38" r="10" fill="#42a5f5"/><rect x="66" y="-46" width="8" height="22" rx="3" fill="#ef5350" transform="rotate(20 70 -35)"/>
      </g>`)}
      <g transform="translate(1480 640)"><path d="M-34 0 h68 l-10 -70 h-48z" fill="#ff8a65"/><circle cx="0" cy="-100" r="40" fill="#4caf50"/><circle cx="-28" cy="-72" r="26" fill="#43a047"/><circle cx="28" cy="-76" r="28" fill="#43a047"/></g>`,
  },
  {
    // Yukarıdan bakılan kum tepsisi. Su, tepe ve çukur araçları ekranın solunda çıkar; minyatürler karakter seçiminde.
    id: 'kum-tepsisi', ad: 'Kum Tepsisi', ikon: '🏝️', ic: true, gunes: [800, -300], bulutY: [-400, -300],
    ses: { yatak: { oda: 0.45 }, olay: { tik: 0.4 } },
    svg: () => {
      const r = rastgele(57);
      let tane = '';
      for (let i = 0; i < 260; i++) tane += `<circle cx="${190 + r() * 1220}" cy="${90 + r() * 760}" r="${1.5 + r() * 2.5}" fill="${r() > 0.5 ? '#d9b77a' : '#f3dcaa'}"/>`;
      return `
      <rect width="1600" height="900" fill="#6d4c41"/>
      <path d="${Array.from({ length: 12 }, (_, i) => `M0 ${i * 80 + 20} H1600`).join(' ')}" stroke="#5d4037" stroke-width="6" opacity=".6"/>
      <rect x="150" y="50" width="1300" height="840" rx="26" fill="#8d6e63"/>
      <rect x="150" y="50" width="1300" height="840" rx="26" fill="none" stroke="#a1887f" stroke-width="10"/>
      <rect x="185" y="85" width="1230" height="770" rx="10" fill="#e8cc94"/>
      ${tane}
      <path d="M230 160 q200 -40 420 10 M900 820 q200 -30 460 4" stroke="#d6b678" stroke-width="5" fill="none" opacity=".7"/>`;
    },
  },
  {
    // Yas ve vedalaşma çalışmaları için sakin bir bahçe: anı ağacı, boyalı anı taşları, fenerler, bank.
    id: 'ani-bahcesi', ad: 'Anı Bahçesi', ikon: '🕊️', ic: false, gunes: [1300, 150],
    ses: { yatak: { ruzgar: 0.15 }, olay: { kus: 0.22 } },
    svg: () => {
      const r = rastgele(91);
      const taslar = Array.from({ length: 9 }, (_, i) => {
        const x = 600 + i * 50 + r() * 20, y = 720 + (i % 3) * 22 + r() * 10, renk = ['#f48fb1', '#90caf9', '#ffe082', '#a5d6a7', '#ce93d8', '#ffab91'][i % 6];
        return `<ellipse cx="${x}" cy="${y}" rx="24" ry="15" fill="${renk}" stroke="#fff" stroke-width="3"/>${i % 2 ? `<path transform="translate(${x} ${y - 2}) scale(.45)" d="M0 8 q-20 -14 -10 -24 q8 -6 10 4 q2 -10 10 -4 q10 10 -10 24z" fill="#fff"/>` : `<circle cx="${x}" cy="${y - 2}" r="5" fill="#fff"/>`}`;
      }).join('');
      const kalpler = [[-120, -230, '#ef5350'], [-60, -300, '#f48fb1'], [40, -320, '#ffca28'], [110, -250, '#ce93d8'], [-10, -200, '#4fc3f7'], [150, -170, '#ff8a65'], [-150, -150, '#81c784']]
        .map(([x, y, c]) => `<path d="M${x} ${y - 30} v18" stroke="#fff" stroke-width="2"/><path transform="translate(${x} ${y})" d="M0 10 q-22 -14 -12 -26 q8 -6 12 4 q4 -10 12 -4 q10 12 -12 26z" fill="${c}"/>`).join('');
      const fener = (x) => `<g transform="translate(${x} 688)"><rect x="-14" y="-44" width="28" height="40" rx="6" fill="#fff8e1" stroke="#8d6e63" stroke-width="3"/><circle cy="-24" r="22" fill="#ffe082" opacity=".35"/><path d="M0 -34 q6 8 0 14 q-6 -6 0 -14z" fill="#ff9800"/><path d="M-10 -44 q10 -16 20 0" stroke="#8d6e63" stroke-width="3" fill="none"/></g>`;
      return `
      ${tepeler('#a5d6a7', '#b2dfb0', 470)}
      <rect y="500" width="1600" height="400" fill="#a5d6a7"/>
      <path d="M800 900 Q700 820 760 760 Q820 700 800 640" stroke="#e8dcc6" stroke-width="70" fill="none" stroke-linecap="round"/>
      ${cicekler(31, 18, 0, 1600, 560, 680)}
      <g transform="translate(1180 260)"><path d="M0 0 q-10 120 -60 220" stroke="#fff" stroke-width="2" fill="none"/><ellipse rx="30" ry="38" fill="#f48fb1"/>
        <path d="M70 40 q0 100 -100 180" stroke="#fff" stroke-width="2" fill="none"/><ellipse cx="70" cy="40" rx="26" ry="32" fill="#90caf9"/>
        <path d="M-60 60 q30 80 30 160" stroke="#fff" stroke-width="2" fill="none"/><ellipse cx="-60" cy="60" rx="24" ry="30" fill="#ffe082"/></g>
      ${on(620, 'ağacın', agac(800, 620, 1.5, '#66bb6a', '#4caf50'))}
      <g transform="translate(800 620)">${kalpler}</g>
      ${taslar}
      <g transform="translate(1240 700)"><rect x="-150" y="-22" width="300" height="40" rx="10" fill="#bcaaa4"/><path d="M-150 -2 h300" stroke="#a1887f" stroke-width="3"/></g>
      ${fener(1130)}${fener(1210)}${fener(1290)}${fener(1370)}
      ${on(778, 'bankın', `<g transform="translate(380 720)"><rect x="-130" y="-10" width="260" height="20" rx="6" fill="#8d6e63"/><rect x="-130" y="-56" width="260" height="18" rx="6" fill="#a1887f"/><rect x="-130" y="-32" width="260" height="10" rx="4" fill="#a1887f"/>
        <rect x="-118" y="10" width="14" height="48" fill="#5d4037"/><rect x="104" y="10" width="14" height="48" fill="#5d4037"/></g>`)}
      <ellipse cx="260" cy="850" rx="170" ry="40" fill="#81d4fa"/><ellipse cx="260" cy="846" rx="130" ry="26" fill="#b3e5fc"/>
      <g fill="#66bb6a"><ellipse cx="200" cy="846" rx="22" ry="8"/><ellipse cx="310" cy="854" rx="18" ry="7"/></g><circle cx="204" cy="842" r="6" fill="#f8bbd0"/>
      <g fill="#ce93d8"><path d="M540 560 q-14 -14 -2 -18 q8 2 2 18 q14 -14 18 -2 q-2 8 -18 2z"/></g><g fill="#ffcc80"><path d="M1040 600 q-14 -14 -2 -18 q8 2 2 18 q14 -14 18 -2 q-2 8 -18 2z"/></g>
      ${cimen(93, 60, 0, 1600, 620, 900, '#6aa86a')}`;
    },
  },
  {
    // Kukla tiyatrosu: perde (index.html'deki #perde) karakterlerin önünde açılıp kapanır.
    id: 'kukla-tiyatrosu', ad: 'Kukla Tiyatrosu', ikon: '🎭', ic: true, gunes: [800, -300], bulutY: [-400, -300],
    ses: { yatak: { oda: 0.35 }, olay: {} },
    svg: () => {
      const r = rastgele(33);
      let yildiz = '';
      for (let i = 0; i < 40; i++) yildiz += `<circle cx="${350 + r() * 900}" cy="${180 + r() * 220}" r="${1.5 + r() * 2.5}" fill="#fff" opacity="${0.5 + r() * 0.5}"/>`;
      const lamba = Array.from({ length: 9 }, (_, i) => `<circle cx="${380 + i * 105}" cy="712" r="9" fill="#ffe082"/><circle cx="${380 + i * 105}" cy="712" r="20" fill="#ffe082" opacity=".25"/>`).join('');
      return `
      <defs><linearGradient id="tiyatro-duvar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a1d5e"/><stop offset="1" stop-color="#2b0f38"/></linearGradient>
        <linearGradient id="tiyatro-fon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a237e"/><stop offset="1" stop-color="#5c6bc0"/></linearGradient></defs>
      <rect width="1600" height="900" fill="url(#tiyatro-duvar)"/>
      <rect x="260" y="80" width="1080" height="720" rx="18" fill="#8d5524"/>
      <rect x="260" y="80" width="1080" height="720" rx="18" fill="none" stroke="#ffca28" stroke-width="8"/>
      <rect x="330" y="150" width="940" height="560" fill="url(#tiyatro-fon)"/>
      ${yildiz}<circle cx="1120" cy="250" r="44" fill="#fff9c4"/><circle cx="1138" cy="240" r="40" fill="#3949ab" opacity=".9"/>
      <path d="M330 520 q160 -90 320 -20 q170 -100 340 -10 q140 -60 280 0 V710 H330z" fill="#3f51b5" opacity=".75"/>
      <path d="M330 590 q200 -60 420 0 q220 -60 520 -10 V710 H330z" fill="#283593" opacity=".85"/>
      <rect x="330" y="600" width="940" height="110" fill="#a0522d"/>
      <path d="${Array.from({ length: 5 }, (_, i) => `M330 ${618 + i * 22} H1270`).join(' ')}" stroke="#7b3f1c" stroke-width="3"/>
      <rect x="300" y="700" width="1000" height="100" rx="8" fill="#6d3b14"/>
      ${lamba}
      <path d="M300 790 H1300" stroke="#ffca28" stroke-width="6"/>
      <g fill="#1a0a22" opacity=".85">${Array.from({ length: 11 }, (_, i) => `<circle cx="${120 + i * 140}" cy="${885 - (i % 2) * 8}" r="${44 + (i % 3) * 6}"/>`).join('')}</g>`;
    },
  },
];

export function ortamBul(id) {
  return ORTAMLAR.find((o) => o.id === id) || ORTAMLAR[0];
}

export function ortamSvg(ortam) {
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><g class="zemin">${ortam.svg()}</g></svg>`;
}
