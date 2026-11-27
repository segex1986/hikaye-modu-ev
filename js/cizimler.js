// Tam vücut karakter çizimleri (SVG). İnsanlar, dört ayaklılar ve kuşlar parametrelerle çizilir;
// yüz ifadesi seçilen duyguya göre değişir. Tüm yüz/saç parçaları 20 birim yarıçaplı kafa için
// tasarlanıp ölçeklenir.

export const TEN = ['#f8d5b8', '#eebb94', '#d49a6a', '#a86f45', '#7a4b2a'];

function koyulas(hex, f = 0.75) {
  const n = parseInt(hex.slice(1), 16);
  const c = (s) => Math.round(((n >> s) & 255) * f);
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}

// ---------------- Yüz ifadeleri ----------------
const kalp = (x) => `<path transform="translate(${x} 0)" d="M0 3.6 C-5 0 -4.6 -4.4 -2 -4.4 C-0.8 -4.4 0 -3.4 0 -2.6 C0 -3.4 0.8 -4.4 2 -4.4 C4.6 -4.4 5 0 0 3.6Z" fill="#e53950"/>`;
const yildizGoz = (x) => `<polygon transform="translate(${x} 0) scale(.5)" fill="#ffb300" stroke="#8d5a00" stroke-width="1.2" points="0,-9 2.6,-3 9,-3 4,1.2 6,8 0,4 -6,8 -4,1.2 -9,-3 -2.6,-3"/>`;

export function yuz(duygu, { gozRenk = '#2b1d16', agizYok = false } = {}) {
  const g = gozRenk;
  const goz = (x, y = 0, r = 2.7) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${g}"/><circle cx="${x + 0.9}" cy="${y - 0.9}" r="${r * 0.35}" fill="#fff"/>`;
  const ikiGoz = (y = 0, r) => goz(-7, y, r) + goz(7, y, r);
  const iriGoz = (r = 4.4, p = 1.7) => [-7, 7].map((x) => `<circle cx="${x}" cy="0" r="${r}" fill="#fff" stroke="${g}" stroke-width="1.1"/><circle cx="${x}" cy="0.6" r="${p}" fill="${g}"/>`).join('');
  const kas = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2} M${-x1} ${y1} L${-x2} ${y2}" stroke="${g}" stroke-width="1.8" stroke-linecap="round"/>`;
  const yanak = (op = 0.35, r = 3.6) => `<circle cx="-11.5" cy="6" r="${r}" fill="#ff7f7f" opacity="${op}"/><circle cx="11.5" cy="6" r="${r}" fill="#ff7f7f" opacity="${op}"/>`;
  const agiz = (d, dolu = false) => agizYok ? '' : (dolu
    ? `<path d="${d}" fill="#8a2f2f" stroke="${g}" stroke-width="1.2" stroke-linejoin="round"/>`
    : `<path d="${d}" fill="none" stroke="${g}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`);
  const yay = (ters) => `<path d="M-10 0 q3 ${ters ? 3.5 : -4.5} 6 0 M4 0 q3 ${ters ? 3.5 : -4.5} 6 0" stroke="${g}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  switch (duygu) {
    case 'mutlu': return yay(false) + yanak(0.5) + agiz('M-6 6 Q0 14 6 6Z', true);
    case 'uzgun': return ikiGoz(1) + kas(-11, -5, -4, -8.5) + agiz('M-5 11 Q0 6.5 5 11') + '<path d="M-8 4 q-2.2 4 0 6 q2.2 -2 0 -6z" fill="#5ab4f0"/>';
    case 'kizgin': return ikiGoz(0.5) + kas(-11, -8.5, -3, -4) + agiz('M-5.5 10.5 Q0 7 5.5 10.5') + yanak(0.55, 4);
    case 'korkmus': return iriGoz() + kas(-10, -7, -4, -9.5) + (agizYok ? '' : `<ellipse cx="0" cy="10" rx="3.4" ry="4.4" fill="#8a2f2f" stroke="${g}" stroke-width="1.1"/>`) + '<path d="M14 -7 q-2.4 4 0 6 q2.4 -2 0 -6z" fill="#5ab4f0"/>';
    case 'saskin': return iriGoz(4.2, 2) + kas(-10, -9, -4, -10.5) + (agizYok ? '' : `<ellipse cx="0" cy="10" rx="3" ry="3.6" fill="#8a2f2f" stroke="${g}" stroke-width="1.1"/>`);
    case 'sakin': return yay(true) + yanak(0.3) + agiz('M-4 8 Q0 11 4 8');
    case 'endiseli': return ikiGoz() + kas(-10, -6, -4, -8.5) + agiz('M-6 10 q1.5 -2 3 0 q1.5 2 3 0 q1.5 -2 3 0 q1.5 2 3 0');
    case 'utangac': return ikiGoz(1.8, 2.3) + yanak(0.8, 4.6) + agiz('M-3 9 Q0 11 3 9');
    case 'heyecanli': return yildizGoz(-7) + yildizGoz(7) + yanak(0.5) + agiz('M-7 5.5 Q0 16 7 5.5Z', true);
    case 'yorgun': return `<path d="M-10 0.5 q3 1.5 6 0 M4 0.5 q3 1.5 6 0" stroke="${g}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M-10 -2 h6 M4 -2 h6" stroke="${g}" stroke-width="1.2" opacity=".5"/>` + agiz('M-3 10 h6');
    case 'sevgi': return kalp(-7) + kalp(7) + yanak(0.55) + agiz('M-5 7 Q0 12 5 7');
    case 'yalniz': return ikiGoz(2, 2.4) + kas(-10, -5, -4, -7.5) + agiz('M-4 10.5 Q0 8.5 4 10.5');
    default: return ikiGoz() + yanak(0.3) + agiz('M-5 7 Q0 11 5 7');
  }
}

// ---------------- İnsanlar ----------------
const BEDEN = {
  yetiskin: { H: 200, hy: 36, hr: 22, t1: 60, t2: 124, tw: 46, b: 188, kol: 116 },
  cocuk: { H: 152, hy: 33, hr: 24, t1: 58, t2: 102, tw: 38, b: 142, kol: 98 },
  bebek: { H: 104, hy: 32, hr: 25, t1: 55, t2: 90, tw: 42, b: 96, kol: 82 },
};

const SAC_ARKA = {
  uzun: 'M-22 0 Q-26 -26 0 -26 Q26 -26 22 0 L25 36 Q12 41 0 39 Q-12 41 -25 36Z',
  bob: 'M-23 0 Q-26 -26 0 -26 Q26 -26 23 0 L24 18 Q0 24 -24 18Z',
  atkuyrugu: '<ellipse cx="21" cy="-2" rx="7" ry="16" transform="rotate(22 21 -2)"/>',
  topuz: '<circle cx="0" cy="-25" r="9"/>',
  orgu: '<path d="M-20 4 q-8 14 -3 30 q3 6 7 0 q-4 -14 0 -28z M20 4 q8 14 3 30 q-3 6 -7 0 q4 -14 0 -28z"/>',
  sakalUzun: '',
};

const SAC_ON = {
  kisa: 'M-21 3 Q-23 -24 0 -24 Q23 -24 21 3 Q19 -10 6 -12.5 Q-8 -14 -21 3Z',
  dikensi: 'M-21 2 Q-22 -16 -14 -20 L-12 -28 L-6 -21 L0 -30 L5 -21 L12 -28 L13 -19 Q22 -14 21 2 Q18 -11 0 -13 Q-16 -11 -21 2Z',
  uzun: 'M-21 5 Q-23 -24 0 -24 Q23 -24 21 5 Q17 -9 2 -13 Q-4 -6 -14 -8 Q-19 -4 -21 5Z',
  sik: 'M-20 0 Q-22 -23 0 -23 Q22 -23 20 0 Q16 -15 0 -15 Q-16 -15 -20 0Z',
  kel: 'M-21 3 Q-22 -8 -17 -13 Q-15 -2 -19 8Z M21 3 Q22 -8 17 -13 Q15 -2 19 8Z',
  bebek: 'M-2 -20 q4 -7 9 -2 q-4 -1 -6 3z',
};
const KIVIRCIK = [[-18, -5], [-15, -14], [-7, -20], [3, -21], [12, -17], [18, -8], [-10, -12], [6, -13]];

function sac(stil, renk, katman) {
  if (katman === 'arka') {
    const a = { uzun: 'uzun', bob: 'bob', orgu: 'orgu', atkuyrugu: 'atkuyrugu', topuz: 'topuz' }[stil];
    if (!a) return '';
    const d = SAC_ARKA[a];
    return d.startsWith('<') ? `<g fill="${renk}">${d}</g>` : `<path d="${d}" fill="${renk}"/>`;
  }
  if (stil === 'kivircik') return `<g fill="${renk}">${KIVIRCIK.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7.5"/>`).join('')}</g>`;
  if (stil === 'basortu' || stil === 'yok') return '';
  const on = { bob: 'uzun', orgu: 'uzun', atkuyrugu: 'kisa', topuz: 'sik' }[stil] || stil;
  return `<path d="${SAC_ON[on] || SAC_ON.kisa}" fill="${renk}"/>`;
}

const SAPKA = {
  polis: '<path d="M-21 -10 Q-20 -31 0 -32 Q20 -31 21 -10Z" fill="#1a237e"/><rect x="-25" y="-12" width="50" height="6" rx="3" fill="#111"/><circle cx="0" cy="-21" r="4" fill="#ffd54f"/>',
  itfaiye: '<path d="M-22 -8 Q-22 -33 0 -33 Q22 -33 22 -8Z" fill="#d32f2f"/><rect x="-28" y="-10" width="56" height="6" rx="3" fill="#b71c1c"/><rect x="-5" y="-31" width="10" height="14" rx="2" fill="#ffd54f"/>',
  asci: '<rect x="-14" y="-29" width="28" height="17" fill="#fff" stroke="#e0e0e0"/><circle cx="-10" cy="-33" r="9" fill="#fff"/><circle cx="0" cy="-37" r="10" fill="#fff"/><circle cx="10" cy="-33" r="9" fill="#fff"/>',
  baret: '<path d="M-21 -8 Q-20 -32 0 -32 Q20 -32 21 -8Z" fill="#fdd835"/><rect x="-27" y="-10" width="54" height="5" rx="2.5" fill="#f9a825"/><rect x="-2" y="-32" width="4" height="22" fill="#f9a825"/>',
  hasir: '<ellipse cx="0" cy="-12" rx="34" ry="7" fill="#e6c36a"/><path d="M-16 -12 Q-15 -31 0 -31 Q15 -31 16 -12Z" fill="#d9b25a"/><rect x="-16" y="-18" width="32" height="5" fill="#c0392b"/>',
  pilot: '<path d="M-21 -10 Q-20 -31 0 -32 Q20 -31 21 -10Z" fill="#263238"/><rect x="-25" y="-12" width="50" height="6" rx="3" fill="#111"/><rect x="-21" y="-17" width="42" height="3" fill="#ffca28"/><circle cx="0" cy="-23" r="3.5" fill="#ffca28"/>',
  fotr: '<ellipse cx="0" cy="-13" rx="31" ry="6" fill="#5d4037"/><path d="M-17 -13 Q-17 -33 0 -30 Q17 -33 17 -13Z" fill="#795548"/><rect x="-17" y="-19" width="34" height="5" fill="#3e2723"/>',
  tac: '<path d="M-16 -15 L-16 -33 L-8 -24 L0 -38 L8 -24 L16 -33 L16 -15Z" fill="#ffca28" stroke="#f9a825" stroke-width="1.5" stroke-linejoin="round"/><circle cx="0" cy="-21" r="3" fill="#e91e63"/>',
  buyucu: '<path d="M-27 -12 Q0 -5 27 -12 L5 -62 Q0 -65 -3 -60Z" fill="#5e35b1"/><path d="M-27 -12 Q0 -5 27 -12" stroke="#4527a0" stroke-width="4" fill="none"/><text x="-6" y="-26" font-size="10" fill="#ffd54f">★</text><text x="3" y="-42" font-size="7" fill="#ffd54f">★</text>',
  hemsire: '<path d="M-14 -17 L-12 -28 L12 -28 L14 -17Z" fill="#fff" stroke="#e0e0e0"/><path d="M-2 -26 h4 v3 h3 v4 h-3 v3 h-4 v-3 h-3 v-4 h3z" fill="#e53935"/>',
  kep: '<path d="M-21 -8 Q-21 -31 0 -31 Q21 -31 21 -8Z" fill="#e53935"/><path d="M-22 -9 Q-34 -9 -36 -5 L-20 -5Z" fill="#c62828"/>',
};

function insan(o, duygu) {
  const P = BEDEN[o.tip || 'yetiskin'];
  const { hy, hr, t1, tw } = P;
  let { H, t2, b, kol } = P;
  const ek = new Set(o.ek || []);
  const ten = o.ten || TEN[1], ust = o.ust || '#42a5f5', alt = o.alt || '#37474f';
  const kolRenk = o.kolRenk || ust, ayakkabi = o.ayakkabi || '#4e342e', sacRenk = o.sacRenk || '#4e342e';
  const oturuyor = ek.has('tekerlekli');
  if (oturuyor) { b = t2 + 34; H = b + 8; }
  const s = hr / 20;
  const basG = (ic) => `<g transform="translate(0 ${hy}) scale(${s})">${ic}</g>`;
  const L = tw / 2;
  let arka = '', bacak = '', govde = '', on = '', el = '';

  if (ek.has('pelerin')) arka += `<path d="M${-L + 3} ${t1 + 2} L${-L - 16} ${b - 2} Q0 ${b + 6} ${L + 16} ${b - 2} L${L - 3} ${t1 + 2}Z" fill="${o.pelerin || '#d32f2f'}"/>`;
  if (ek.has('kanat')) arka += [-1, 1].map((y) => `<ellipse cx="${y * 22}" cy="${t1 + 12}" rx="17" ry="27" fill="#b3e5fc" stroke="#81d4fa" stroke-width="2" opacity=".85" transform="rotate(${y * 28} ${y * 22} ${t1 + 12})"/>`).join('');
  if (oturuyor) arka += `<rect x="${-L - 6}" y="${t1 + 6}" width="${tw + 12}" height="${t2 - t1}" rx="6" fill="#546e7a"/><path d="M${-L - 3} ${t1 + 8} v-10 h-6" stroke="#455a64" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  arka += basG(sac(o.sac, sacRenk, 'arka'));

  // Bacaklar ve alt giyim
  const bacakCift = (y1, renk) => [-1, 1].map((y) => `<rect x="${y < 0 ? -L + 3 : 2}" y="${y1}" width="${L - 5}" height="${b - y1}" rx="5" fill="${renk}"/>`).join('');
  const ayakkabilar = [-1, 1].map((y) => `<ellipse cx="${y * (L / 2 + 1)}" cy="${b + 2}" rx="${L / 2 + 0.5}" ry="5.5" fill="${ayakkabi}"/>`).join('');
  if (oturuyor) {
    bacak = [-1, 1].map((y) => `<rect x="${-L + 2}" y="${t2 - 16 + (y > 0 ? 8 : 0)}" width="${tw + 10}" height="12" rx="6" fill="${alt}"/>`).join('') +
      `<rect x="${L}" y="${t2 - 10}" width="12" height="${b - t2 + 10}" rx="5" fill="${alt}"/><ellipse cx="${L + 9}" cy="${b + 2}" rx="9" ry="5" fill="${ayakkabi}"/>`;
  } else if (o.altTip === 'etek' || o.altTip === 'uzunEtek') {
    const uzun = o.altTip === 'uzunEtek';
    bacak = bacakCift(t2, ten) + ayakkabilar;
    govde += `<path d="M${-L} ${t2 - 12} L${-L - 9} ${uzun ? b - 6 : t2 + 30} Q0 ${uzun ? b : t2 + 36} ${L + 9} ${uzun ? b - 6 : t2 + 30} L${L} ${t2 - 12}Z" fill="${alt}"/>`;
  } else if (o.altTip === 'elbise' || o.altTip === 'uzunElbise') {
    const uzun = o.altTip === 'uzunElbise';
    bacak = bacakCift(t2, ten) + ayakkabilar;
    govde += `<path d="M${-L} ${t1 + 18} L${-L - 11} ${uzun ? b - 4 : t2 + 30} Q0 ${uzun ? b + 2 : t2 + 37} ${L + 11} ${uzun ? b - 4 : t2 + 30} L${L} ${t1 + 18}Z" fill="${ust}"/>`;
  } else {
    bacak = bacakCift(t2 - 8, alt) + ayakkabilar;
  }
  if (ek.has('serit') && !oturuyor) bacak += `<rect x="${-L + 3}" y="${b - 22}" width="${tw - 6}" height="4" fill="#ffee58"/>`;

  // Gövde ve kollar
  govde = `<rect x="${-L}" y="${t1}" width="${tw}" height="${t2 - t1}" rx="${L * 0.55}" fill="${ust}"/>` + govde;
  if (ek.has('karin')) govde += `<ellipse cx="0" cy="${(t1 + t2) / 2 + 14}" rx="${L + 5}" ry="23" fill="${ust}"/><ellipse cx="-6" cy="${(t1 + t2) / 2 + 8}" rx="7" ry="5" fill="#fff" opacity=".25"/>`;
  const kollar = [-1, 1].map((y) => `<g transform="rotate(${y * 9} ${y * L} ${t1 + 6})"><rect x="${y < 0 ? -L - 10 : L - 1}" y="${t1 + 1}" width="11" height="${kol - t1}" rx="5.5" fill="${kolRenk}"/><circle cx="${y * (L + 4.5)}" cy="${kol + 2}" r="6" fill="${ten}"/></g>`).join('');

  if (ek.has('onluk')) on += [-1, 1].map((y) => `<path d="M${y * 3} ${t1} L${y * (L - 2)} ${t1} Q${y * L} ${t1} ${y * L} ${t1 + 8} L${y * (L + 2)} ${t2 + 18} L${y * 3} ${t2 + 18}Z" fill="#fff" stroke="#dfe6ec"/>`).join('');
  if (ek.has('yaka')) on += `<path d="M-9 ${t1} L0 ${t1 + 12} L9 ${t1} Z" fill="#fff"/>`;
  if (ek.has('kravat')) on += `<path d="M0 ${t1 + 3} L-4 ${t1 + 9} L0 ${t1 + 32} L4 ${t1 + 9}Z" fill="${o.kravat || '#c62828'}"/>`;
  if (ek.has('rozet')) on += `<polygon transform="translate(${-L / 2.2} ${t1 + 18}) scale(.55)" fill="#ffd54f" stroke="#f9a825" points="0,-9 2.6,-3 9,-3 4,1.2 6,8 0,4 -6,8 -4,1.2 -9,-3 -2.6,-3"/>`;
  if (ek.has('logo')) on += `<polygon transform="translate(0 ${t1 + 22}) scale(1.1)" fill="#ffd54f" points="0,-9 2.6,-3 9,-3 4,1.2 6,8 0,4 -6,8 -4,1.2 -9,-3 -2.6,-3"/>`;
  if (ek.has('serit')) on += `<rect x="${-L}" y="${t1 + 30}" width="${tw}" height="5" fill="#ffee58"/>`;
  if (ek.has('tulum')) on += `<rect x="${-L + 5}" y="${t1 + 20}" width="${tw - 10}" height="${t2 - t1 - 14}" rx="4" fill="${alt}"/><path d="M${-L + 7} ${t1 + 22} L${-L + 9} ${t1} M${L - 7} ${t1 + 22} L${L - 9} ${t1}" stroke="${alt}" stroke-width="5"/>`;
  if (ek.has('onlukAsci')) on += `<rect x="${-L + 6}" y="${t1 + 18}" width="${tw - 12}" height="${t2 - t1 + 2}" rx="4" fill="#fff" stroke="#e0e0e0"/>`;
  if (ek.has('fular')) on += `<path d="M-10 ${t1} Q0 ${t1 + 8} 10 ${t1} L6 ${t1 + 12} L2 ${t1 + 6}Z" fill="#e53935"/>`;
  if (ek.has('stetoskop')) on += `<path d="M-9 ${t1} Q-11 ${t1 + 24} 0 ${t1 + 26} Q11 ${t1 + 24} 9 ${t1}" stroke="#455a64" fill="none" stroke-width="2.6"/><circle cx="0" cy="${t1 + 29}" r="4.2" fill="#90a4ae" stroke="#455a64"/>`;
  if (ek.has('kapsonlu')) on += `<path d="M-12 ${t1 + 1} Q0 ${t1 + 14} 12 ${t1 + 1}" stroke="${koyulas(ust)}" stroke-width="4" fill="none"/><rect x="-10" y="${t1 + 28}" width="20" height="10" rx="3" fill="${koyulas(ust, 0.85)}"/>`;
  if (ek.has('kucakBebek')) on += `<ellipse cx="2" cy="${t1 + 30}" rx="18" ry="12" fill="#bbdefb"/><circle cx="-9" cy="${t1 + 23}" r="9" fill="${TEN[0]}"/><path d="M-12 ${t1 + 23} h2 M-7 ${t1 + 23} h2" stroke="#3a2a20" stroke-width="1.5" stroke-linecap="round"/>`;

  if (ek.has('kitap')) el += `<rect x="${L + 1}" y="${kol - 16}" width="15" height="19" rx="2" fill="#e53935" transform="rotate(-10 ${L + 8} ${kol - 6})"/><rect x="${L + 3}" y="${kol - 14}" width="11" height="15" fill="#fff" opacity=".35" transform="rotate(-10 ${L + 8} ${kol - 6})"/>`;
  if (ek.has('pano')) el += `<rect x="${L}" y="${kol - 22}" width="17" height="23" rx="2" fill="#8d6e63"/><rect x="${L + 2.5}" y="${kol - 18}" width="12" height="16" fill="#fff"/><path d="M${L + 4.5} ${kol - 14} h8 M${L + 4.5} ${kol - 10} h8 M${L + 4.5} ${kol - 6} h6" stroke="#90a4ae" stroke-width="1.4"/>`;
  if (ek.has('baston')) el += `<path d="M${L + 7} ${kol + 2} L${L + 9} ${b + 4} M${L + 7} ${kol + 2} q0 -9 -8 -6" stroke="#6d4c41" stroke-width="3.6" fill="none" stroke-linecap="round"/>`;
  if (ek.has('asa')) el += `<path d="M${-L - 6} ${kol + 4} L${-L - 18} ${kol - 34}" stroke="#6d4c41" stroke-width="3" stroke-linecap="round"/><polygon transform="translate(${-L - 19} ${kol - 38}) scale(.8)" fill="#ffeb3b" stroke="#fbc02d" points="0,-9 2.6,-3 9,-3 4,1.2 6,8 0,4 -6,8 -4,1.2 -9,-3 -2.6,-3"/>`;
  if (oturuyor) el += `<circle cx="-2" cy="${t2 + 6}" r="27" fill="none" stroke="#37474f" stroke-width="5"/><circle cx="-2" cy="${t2 + 6}" r="20" fill="none" stroke="#90a4ae" stroke-width="2"/><path d="M-2 ${t2 - 21} v54 M-29 ${t2 + 6} h54" stroke="#90a4ae" stroke-width="1.5"/><circle cx="-2" cy="${t2 + 6}" r="3" fill="#37474f"/><circle cx="${L + 16}" cy="${b + 3}" r="5" fill="#37474f"/>`;

  // Baş
  let bas = `<rect x="-5" y="${hy + hr - 8}" width="10" height="${t1 - hy - hr + 10}" fill="${ten}"/>`;
  bas += `<circle cx="${-hr}" cy="${hy + 2}" r="${hr * 0.22}" fill="${ten}"/><circle cx="${hr}" cy="${hy + 2}" r="${hr * 0.22}" fill="${ten}"/>`;
  bas += `<circle cx="0" cy="${hy}" r="${hr}" fill="${ten}"/>`;
  let yuzAlti = '', yuzUstu = '';
  if (ek.has('sakal')) yuzAlti += `<path d="M-19 0 Q-20 25 0 27 Q20 25 19 0 Q16 12 8 12.5 Q0 9.5 -8 12.5 Q-16 12 -19 0Z" fill="${o.sakalRenk || sacRenk}"/>`;
  if (ek.has('uzunSakal')) yuzAlti += `<path d="M-19 0 Q-20 30 0 46 Q20 30 19 0 Q16 12 8 12.5 Q0 9.5 -8 12.5 Q-16 12 -19 0Z" fill="${o.sakalRenk || sacRenk}"/>`;
  if (ek.has('maske')) yuzAlti += '<path d="M-19 -6 Q0 -11 19 -6 L18 4 Q9 6 3 2 L-3 2 Q-9 6 -18 4Z" fill="#0d47a1"/>';
  if (ek.has('biyik')) yuzUstu += `<path d="M-8 6.5 Q-4 3.5 0 5.5 Q4 3.5 8 6.5 Q4 8.5 0 7 Q-4 8.5 -8 6.5Z" fill="${o.sakalRenk || sacRenk}"/>`;
  if (ek.has('gozluk')) yuzUstu += '<g fill="#fff" fill-opacity=".15" stroke="#37474f" stroke-width="1.5"><circle cx="-7" cy="0" r="5.2"/><circle cx="7" cy="0" r="5.2"/><path d="M-1.8 0 h3.6" fill="none"/></g>';
  if (ek.has('gunesGozlugu')) yuzUstu += '<g fill="#263238" stroke="#263238" stroke-width="1.5"><rect x="-13" y="-4" width="11" height="7" rx="3"/><rect x="2" y="-4" width="11" height="7" rx="3"/><path d="M-2 -1 h4"/></g>';
  let sacOn = sac(o.sac, sacRenk, 'on');
  if (o.sac === 'basortu') sacOn = `<path fill-rule="evenodd" fill="${o.basortu || '#7e57c2'}" d="M-26 6 Q-28 -28 0 -28 Q28 -28 26 6 L24 31 Q0 39 -24 31Z M0 -16 C-15 -16 -16 0 -15 6 C-13 18 13 18 15 6 C16 0 15 -16 0 -16Z"/>`;
  const sapka = o.sapka === 'astronot'
    ? '<circle r="29" fill="#b3e5fc" fill-opacity=".3" stroke="#eceff1" stroke-width="5"/><path d="M-16 -18 q8 -6 16 -6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>'
    : (SAPKA[o.sapka] || '');

  const govdeKatmani = arka + bacak + govde + kollar + on + el;
  const basKatmani = bas + basG(yuzAlti + `<g transform="translate(0 2)">${yuz(duygu)}</g>` + yuzUstu + sacOn + sapka);
  const ust0 = o.sapka === 'buyucu' ? -40 : o.sapka ? -16 : -6;
  const genislik = 112;
  return { vb: `${-genislik / 2} ${ust0} ${genislik} ${H - ust0}`, ic: govdeKatmani + basKatmani };
}

// ---------------- Dört ayaklılar ----------------
const KULAK = {
  sivri: (R, A) => [-1, 1].map((y) => `<polygon points="${y * 19},-6 ${y * 15},-31 ${y * 3},-17" fill="${R}"/><polygon points="${y * 15},-9 ${y * 13},-25 ${y * 7},-16" fill="${A}"/>`).join(''),
  yuvarlak: (R, A) => [-1, 1].map((y) => `<circle cx="${y * 15}" cy="-16" r="8" fill="${R}"/><circle cx="${y * 15}" cy="-16" r="4.2" fill="${A}"/>`).join(''),
  uzun: (R, A) => [-1, 1].map((y) => `<ellipse cx="${y * 8}" cy="-32" rx="6.5" ry="19" fill="${R}" transform="rotate(${y * 10} ${y * 8} -18)"/><ellipse cx="${y * 8}" cy="-31" rx="3" ry="14" fill="#f8bbd0" transform="rotate(${y * 10} ${y * 8} -18)"/>`).join(''),
  koala: (R, A) => [-1, 1].map((y) => `<circle cx="${y * 19}" cy="-12" r="12" fill="${R}"/><circle cx="${y * 19}" cy="-12" r="7" fill="${A}"/>`).join(''),
  fil: (R) => [-1, 1].map((y) => `<ellipse cx="${y * 22}" cy="2" rx="15" ry="19" fill="${R}"/><ellipse cx="${y * 23}" cy="3" rx="9" ry="13" fill="#f3c6cf" opacity=".6"/>`).join(''),
  yatay: (R) => [-1, 1].map((y) => `<ellipse cx="${y * 22}" cy="-6" rx="9" ry="4.5" fill="${R}" transform="rotate(${y * 20} ${y * 22} -6)"/>`).join(''),
  boynuz: (R) => [-1, 1].map((y) => `<path d="M${y * 9} -16 q${y * 6} -12 ${y * 14} -12" stroke="#f5e6c8" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="${y * 22}" cy="-6" rx="9" ry="4.5" fill="${R}" transform="rotate(${y * 20} ${y * 22} -6)"/>`).join(''),
};

function dortayak(o, duygu) {
  const R = o.renk, A = o.acik || R, K = o.koyu || koyulas(R);
  const at = !!o.uzunBacak;
  const by = at ? 50 : 60, bry = at ? 19 : 22, ayakUst = by + 6;
  const hx = at ? -36 : -30, hy = at ? 26 : 38, hr = o.basR || 22;
  let s = '';

  // Kuyruk
  const kuyruk = {
    kisa: `<ellipse cx="47" cy="${by - 8}" rx="6" ry="4" fill="${R}" transform="rotate(-30 47 ${by - 8})"/>`,
    yukari: `<path d="M44 ${by - 4} q13 -6 11 -23" stroke="${R}" stroke-width="7" fill="none" stroke-linecap="round"/>`,
    uzun: `<path d="M45 ${by - 2} q24 -4 19 -32" stroke="${o.kuyrukRenk || R}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
    kabarik: `<ellipse cx="58" cy="${by - 14}" rx="19" ry="9" fill="${R}" transform="rotate(-35 58 ${by - 14})"/><circle cx="71" cy="${by - 26}" r="6" fill="#fff"/>`,
    puskul: `<path d="M45 ${by - 2} q16 6 18 -18" stroke="${R}" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="63" cy="${by - 22}" rx="5" ry="7" fill="${o.puskulRenk || o.yele || K}"/>`,
    ponpon: `<circle cx="47" cy="${by - 6}" r="8" fill="#fff"/>`,
    kivrik: `<path d="M45 ${by + 2} q28 0 21 -28 q-4 -10 -12 -3" stroke="${R}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    at: `<path d="M44 ${by - 8} q18 4 14 34 q-6 -4 -8 -8 q-4 -14 -10 -18z" fill="${o.yele || K}"/>`,
    sincap: `<path d="M36 ${by + 2} Q70 ${by - 6} 62 ${by - 40} Q54 ${by - 62} 34 ${by - 46} Q52 ${by - 44} 50 ${by - 28} Q48 ${by - 10} 34 ${by - 6}Z" fill="${R}"/>`,
  }[o.kuyruk || 'kisa'] || '';
  s += kuyruk;

  // Uzak bacaklar
  const bacak = (x, renk) => `<rect x="${x}" y="${ayakUst}" width="11" height="${94 - ayakUst}" rx="5" fill="${renk}"/><ellipse cx="${x + 5.5}" cy="94" rx="7" ry="3.5" fill="${o.toynak || koyulas(renk, 0.85)}"/>`;
  const bacakRenk = o.desen === 'panda' ? '#212121' : R;
  s += bacak(-12, koyulas(bacakRenk, 0.82)) + bacak(28, koyulas(bacakRenk, 0.82));

  // Gövde
  if (o.desen === 'diken') {
    let d = `M-26 ${by + 10}`;
    for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; d += ` L${10 + Math.cos(a) * 44} ${by + Math.sin(a) * 30} L${10 + Math.cos(a + 0.13) * 32} ${by + Math.sin(a + 0.13) * 20}`; }
    s += `<path d="${d} Z" fill="${K}"/>`;
  }
  if (o.desen === 'yun') {
    s += `<g fill="${R}">${[[-20, 0], [-6, -10], [10, -12], [26, -10], [38, 0], [30, 12], [12, 16], [-6, 14], [-20, 10]].map(([x, y]) => `<circle cx="${x + 2}" cy="${by + y}" r="13"/>`).join('')}<ellipse cx="10" cy="${by}" rx="34" ry="18"/></g>`;
  } else {
    s += `<ellipse cx="10" cy="${by}" rx="38" ry="${bry}" fill="${R}"/>`;
    if (o.desen !== 'diken') s += `<ellipse cx="6" cy="${by + 8}" rx="24" ry="${bry * 0.55}" fill="${A}" opacity=".9"/>`;
  }
  if (o.desen === 'cizgi') s += `<g stroke="${o.cizgiRenk || K}" stroke-width="4" stroke-linecap="round" fill="none">${[-8, 4, 16, 28, 38].map((x) => `<path d="M${x} ${by - bry + 3} q3 7 0 12"/>`).join('')}</g>`;
  if (o.desen === 'benek') s += `<g fill="${o.benek || '#212121'}"><ellipse cx="-4" cy="${by - 8}" rx="9" ry="6"/><ellipse cx="24" cy="${by - 4}" rx="8" ry="9"/><ellipse cx="38" cy="${by + 6}" rx="5" ry="4"/></g>`;
  if (o.desen === 'panda') s += `<path d="M-14 ${by - 18} Q10 ${by - 8} 34 ${by - 18} L30 ${by - 4} Q10 ${by + 6} -12 ${by - 4}Z" fill="#212121"/>`;
  if (o.yele && o.kuyruk === 'at') s += `<path d="M${hx + 8} ${hy - 18} Q${hx + 30} ${hy - 6} ${hx + 40} ${by - 16} L${hx + 30} ${by - 10} Q${hx + 20} ${hy + 6} ${hx + 6} ${hy}Z" fill="${o.yele}"/>`;
  if (at) s += `<path d="M${hx + 4} ${hy + 6} L${hx + 22} ${by - 14} L${hx + 34} ${by - 4} L${hx + 14} ${hy + 18}Z" fill="${R}"/>`;

  // Yakın bacaklar
  s += bacak(-22, bacakRenk) + bacak(18, bacakRenk);

  // Baş
  const sc = hr / 20;
  let bas = '';
  if (o.yele && o.kuyruk !== 'at') bas += `<g fill="${o.yele}">${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<circle cx="${Math.cos(a) * 22}" cy="${Math.sin(a) * 22 + 2}" r="9"/>`; }).join('')}</g>`;
  if (o.kulak && o.kulak !== 'sarkik') bas += KULAK[o.kulak](o.kulakRenk || (o.desen === 'panda' ? '#212121' : R), o.kulakIc || A);
  bas += `<circle r="20" fill="${o.basRenk || R}"/>`;
  if (o.desen === 'cizgi') bas += `<path d="M-4 -19 v6 M0 -20 v8 M4 -19 v6" stroke="${o.cizgiRenk || K}" stroke-width="2.4" stroke-linecap="round"/>`;
  if (o.desen === 'panda') bas += '<ellipse cx="-7.5" cy="0" rx="5.5" ry="7" fill="#212121" transform="rotate(25 -7.5 0)"/><ellipse cx="7.5" cy="0" rx="5.5" ry="7" fill="#212121" transform="rotate(-25 7.5 0)"/>';
  if (o.yuzMaske) bas += `<path d="M-20 2 Q-12 -8 0 4 Q12 -8 20 2 Q18 20 0 20 Q-18 20 -20 2Z" fill="${o.yuzMaske}"/>`;
  if (o.burun !== 'hortum') bas += `<ellipse cx="0" cy="8" rx="${o.uzunBurun ? 12 : 10.5}" ry="${o.uzunBurun ? 10 : 7.5}" fill="${o.burunRenk || A}"/>`;
  bas += `<g transform="translate(0 1)">${yuz(duygu, { gozRenk: '#2b1d16' })}</g>`;
  if (o.burun === 'hortum') bas += `<path d="M0 6 Q2 26 -10 34" stroke="${R}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M-6 10 l-5 7 M6 10 l5 7" stroke="#fffde7" stroke-width="3" stroke-linecap="round"/>`;
  else if (o.burun === 'koala') bas += '<ellipse cx="0" cy="4.5" rx="5" ry="6.5" fill="#37474f"/>';
  else bas += `<ellipse cx="0" cy="3.6" rx="3.6" ry="2.6" fill="${o.burunUcu || '#3e2723'}"/>`;
  if (o.kulak === 'sarkik') bas += [-1, 1].map((y) => `<ellipse cx="${y * 19}" cy="-1" rx="7" ry="14" fill="${o.kulakRenk || K}" transform="rotate(${y * -18} ${y * 19} -12)"/>`).join('');
  if (o.boynuz) bas += `<path d="M-3 -18 L0 -42 L3 -18Z" fill="#ffd54f" stroke="#ffb300"/><path d="M-12 -18 q6 -10 12 -4 q6 -10 12 2" stroke="#f48fb1" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  s += `<g transform="translate(${hx} ${hy}) scale(${sc})">${bas}</g>`;

  const ust = Math.min(hy - hr * 2.2, by - 70);
  return { vb: `-74 ${ust} 152 ${100 - ust}`, ic: s };
}

// ---------------- Kuşlar ----------------
function kus(o, duygu) {
  const R = o.renk, G = o.gogus || '#fff8e1', K = koyulas(R, 0.8), gaga = o.gaga || '#ffa000';
  let s = '';
  s += `<path d="M-6 84 v10 M6 84 v10 M-11 95 h10 M1 95 h10" stroke="${gaga}" stroke-width="3" stroke-linecap="round"/>`;
  if (o.kuyrukTuy) s += `<path d="M14 66 q22 -10 26 -34 q-14 12 -26 16z" fill="${o.kuyrukTuy}"/>`;
  s += `<ellipse cx="0" cy="60" rx="26" ry="27" fill="${R}"/><ellipse cx="0" cy="66" rx="17" ry="18" fill="${G}"/>`;
  s += [-1, 1].map((y) => `<ellipse cx="${y * 24}" cy="60" rx="8" ry="17" fill="${K}" transform="rotate(${y * -14} ${y * 24} 60)"/>`).join('');
  if (o.ibik) s += '<g fill="#e53935"><circle cx="-6" cy="12" r="6"/><circle cx="1" cy="9" r="6.5"/><circle cx="8" cy="13" r="5.5"/></g>';
  if (o.baykus) s += `<polygon points="-18,18 -14,2 -6,14" fill="${K}"/><polygon points="18,18 14,2 6,14" fill="${K}"/>`;
  s += `<circle cx="0" cy="32" r="${o.baykus ? 22 : 20}" fill="${R}"/>`;
  if (o.baykus) s += `<circle cx="-8" cy="31" r="9" fill="${G}"/><circle cx="8" cy="31" r="9" fill="${G}"/>`;
  s += `<g transform="translate(0 31) scale(${o.baykus ? 1.15 : 1})">${yuz(duygu, { agizYok: true })}</g>`;
  s += o.genisGaga
    ? `<ellipse cx="0" cy="40" rx="9" ry="4.5" fill="${gaga}"/><path d="M-8 40 h16" stroke="${koyulas('#ff9800', 0.8)}" stroke-width="1"/>`
    : `<path d="M-5 37 L5 37 L0 45Z" fill="${gaga}"/>`;
  if (o.ibik) s += '<ellipse cx="0" cy="49" rx="3" ry="4.5" fill="#e53935"/>';
  return { vb: '-46 0 92 100', ic: s };
}

function kurbaga(o, duygu) {
  const R = o.renk, K = koyulas(R, 0.78);
  const s = `<ellipse cx="-24" cy="80" rx="14" ry="10" fill="${K}"/><ellipse cx="24" cy="80" rx="14" ry="10" fill="${K}"/>
    <ellipse cx="0" cy="66" rx="28" ry="24" fill="${R}"/><ellipse cx="0" cy="72" rx="18" ry="15" fill="#dcedc8"/>
    <ellipse cx="0" cy="44" rx="28" ry="19" fill="${R}"/>
    <circle cx="-14" cy="29" r="10" fill="${R}"/><circle cx="14" cy="29" r="10" fill="${R}"/>
    <path d="M-14 84 l-8 8 M-14 84 l0 10 M14 84 l8 8 M14 84 l0 10" stroke="${K}" stroke-width="4" stroke-linecap="round"/>
    <g transform="translate(0 40) scale(1.1)">${yuz(duygu)}</g>`;
  return { vb: '-46 12 92 88', ic: s };
}

const CIZICILER = { insan, dortayak, kus, kurbaga };

// Çocuğun bir insan karakterine verdiği görünüm (ten, saç, kıyafet, gözlük, tekerlekli sandalye)
// karakterin kendi özelliklerinin üstüne yazılır.
function gorunumUygula(c, g) {
  if (!g || c.tur !== 'insan') return c;
  const { gozluk, tekerlekli, ...renkler } = g;
  const ek = new Set(c.ek || []);
  if (gozluk !== undefined) { ek.delete('gunesGozlugu'); if (gozluk) ek.add('gozluk'); else ek.delete('gozluk'); }
  if (tekerlekli !== undefined) { if (tekerlekli) ek.add('tekerlekli'); else ek.delete('tekerlekli'); }
  const yeni = { ...c, ...renkler, ek: [...ek] };
  if (renkler.ust) yeni.kolRenk = renkler.ust;
  if (renkler.sac === 'basortu') yeni.basortu = renkler.sacRenk || c.basortu;
  return yeni;
}

export function karakterSvg(kar, duygu, gorunum = null) {
  const c = gorunumUygula(kar.cizim, gorunum);
  const { vb, ic } = CIZICILER[c.tur](c, duygu);
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${ic}</svg>`;
}
