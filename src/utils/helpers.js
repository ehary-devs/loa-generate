import { ROMAN, BULAN, TOKEN_CHARS } from './constants';

export function renderPattern(pattern, { n, journal, issue, date }) {
  return pattern.replace(/\{([^}]+)\}/g, (_, raw) => {
    const [key, arg] = raw.split(":");
    switch (key) {
      case "n":
        return String(n).padStart(arg ? Number(arg) : 1, "0");
      case "tahun":
        return String(date.getFullYear());
      case "tahun2":
        return String(date.getFullYear()).slice(-2);
      case "bulan":
        return String(date.getMonth() + 1).padStart(2, "0");
      case "bulan_romawi":
        return ROMAN[date.getMonth()];
      case "kode":
        return journal.code;
      case "vol":
        return issue ? String(issue.volume) : "—";
      case "no":
        return issue ? String(issue.number) : "—";
      case "teks":
        return arg || "";
      default:
        return `{${raw}}`;
    }
  });
}

export function makeToken(len = 10) {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += TOKEN_CHARS[Math.floor(Math.random() * TOKEN_CHARS.length)];
  }
  return out;
}

export function makeHash() {
  let out = "";
  for (let i = 0; i < 40; i++) out += "0123456789abcdef"[Math.floor(Math.random() * 16)];
  return out;
}

export function tanggalPanjang(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return "—";
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export function longDateEn(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}
