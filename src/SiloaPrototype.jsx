import React, { useMemo, useState } from "react";

/**
 * SILOA — prototipe alur penerbitan & verifikasi Letter of Acceptance.
 * Semua data hanya di memori (mock), tidak ada backend.
 */

const T = {
  ink: "#14213A",
  inkSoft: "#2C3B57",
  shell: "#E8EAE4",
  panel: "#FFFFFF",
  line: "#D2D6CC",
  brass: "#A8842C",
  seal: "#1F6B4A",
  revoked: "#97132B",
  muted: "#6A7381",
};

const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Iowan Old Style', 'Times New Roman', serif";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/* ------------------------------------------------------------------ data */

const SEED_JOURNALS = [
  {
    id: 1,
    code: "JTIK",
    name: "Jurnal Teknologi Informasi dan Komunikasi",
    nameEn: "Journal of Information and Communication Technology",
    issn: "2723-1178 (online)",
    pattern: "{n:3}/LOA/JTIK/{bulan_romawi}/{tahun}",
    reset: "yearly",
    counter: 23,
    signers: [
      { id: 11, name: "Dr. Arif Nugroho, S.Kom., M.Kom.", position: "Editor in Chief" },
      { id: 12, name: "Rizky Pratama, M.Kom.", position: "Managing Editor" },
    ],
    issues: [
      { id: 101, volume: 12, number: 2, year: 2026, label: "Juli–Desember 2026", status: "open" },
      { id: 102, volume: 13, number: 1, year: 2027, label: "Januari–Juni 2027", status: "planned" },
    ],
    members: ["Anda (editor)", "Sari Wulandari (staff)", "Dr. Arif Nugroho (owner)"],
  },
  {
    id: 2,
    code: "JMBD",
    name: "Jurnal Manajemen dan Bisnis Digital",
    nameEn: "Journal of Management and Digital Business",
    issn: "2809-4417 (online)",
    pattern: "LOA-{tahun}{n:4}-JMBD",
    reset: "yearly",
    counter: 30,
    signers: [{ id: 21, name: "Dr. Hesti Maharani, S.E., M.M.", position: "Ketua Dewan Editor" }],
    issues: [
      { id: 201, volume: 7, number: 1, year: 2026, label: "Semester I 2026", status: "closed" },
      { id: 202, volume: 7, number: 2, year: 2026, label: "Semester II 2026", status: "open" },
    ],
    members: ["Anda (editor)", "Dr. Hesti Maharani (owner)"],
  },
  {
    id: 3,
    code: "IJCSE",
    name: "International Journal of Computer Science and Engineering",
    nameEn: "International Journal of Computer Science and Engineering",
    issn: "2964-1103 (online)",
    pattern: "{kode}/LOA/V{vol}N{no}/{n:2}",
    reset: "per_issue",
    counter: 4,
    signers: [
      { id: 31, name: "Prof. Dr. Bambang Sulistyo, M.Sc.", position: "Editor in Chief" },
      { id: 32, name: "Dian Kusuma, Ph.D.", position: "Associate Editor" },
    ],
    issues: [
      { id: 301, volume: 8, number: 1, year: 2026, label: "March 2026", status: "open" },
      { id: 302, volume: 8, number: 2, year: 2026, label: "September 2026", status: "planned" },
    ],
    members: ["Anda (owner)", "Dian Kusuma (editor)"],
  },
];

const SEED_LOAS = [
  {
    id: 9001,
    journalId: 1,
    number: "021/LOA/JTIK/VIII/2026",
    token: "7H2QK9XM4T",
    title: "Optimasi Penjadwalan Kuliah Menggunakan Algoritma Genetika pada Sistem Akademik",
    authors: [
      { name: "Wahyu Setiawan", affiliation: "Universitas STEKOM", email: "wahyu@example.ac.id", corresponding: true },
      { name: "Lina Hartati", affiliation: "Universitas STEKOM", email: "", corresponding: false },
    ],
    issueId: 101,
    signerId: 11,
    acceptedDate: "2026-08-14",
    letterDate: "2026-08-15",
    language: "id",
    status: "issued",
    hash: "4f1c9a7e2b83d5610ac4e77b9d2f3081c65ab4e9",
  },
  {
    id: 9002,
    journalId: 1,
    number: "019/LOA/JTIK/VII/2026",
    token: "R4TNP8ZC2K",
    title: "Deteksi Anomali Trafik Jaringan Kampus dengan Isolation Forest",
    authors: [
      { name: "Bayu Aditya", affiliation: "Politeknik Negeri Semarang", email: "bayu@example.ac.id", corresponding: true },
    ],
    issueId: 101,
    signerId: 11,
    acceptedDate: "2026-07-02",
    letterDate: "2026-07-03",
    language: "id",
    status: "revoked",
    revokeReason: "Salah penulisan nama penulis kedua, diterbitkan ulang dengan nomor 022.",
    hash: "b7e20d4416c9f8a3cd51e0397f6b2a48d1c07e55",
  },
];

/* --------------------------------------------------------------- helpers */

function renderPattern(pattern, { n, journal, issue, date }) {
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

const TOKEN_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
function makeToken(len = 10) {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += TOKEN_CHARS[Math.floor(Math.random() * TOKEN_CHARS.length)];
  }
  return out;
}

function makeHash() {
  let out = "";
  for (let i = 0; i < 40; i++) out += "0123456789abcdef"[Math.floor(Math.random() * 16)];
  return out;
}

function tanggalPanjang(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return "—";
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function longDateEn(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

/* ------------------------------------------------------------- pseudo QR */

function qrModules(seed, size = 25) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const cells = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      h ^= h << 13;
      h ^= h >>> 17;
      h ^= h << 5;
      row.push(((h >>> 3) & 3) !== 0);
    }
    cells.push(row);
  }
  const finder = (ox, oy) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        cells[oy + y][ox + x] = edge || core;
      }
    }
    for (let y = -1; y <= 7; y++) {
      for (let x = -1; x <= 7; x++) {
        const cy = oy + y, cx = ox + x;
        if (cy < 0 || cx < 0 || cy >= size || cx >= size) continue;
        if (x === -1 || y === -1 || x === 7 || y === 7) cells[cy][cx] = false;
      }
    }
  };
  finder(0, 0);
  finder(size - 7, 0);
  finder(0, size - 7);
  return cells;
}

function QrCode({ value, px = 96 }) {
  const size = 25;
  const cells = useMemo(() => qrModules(value || "kosong", size), [value]);
  const unit = px / size;
  return (
    <svg width={px} height={px} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`QR ${value}`}>
      <rect width={size} height={size} fill="#fff" />
      {cells.map((row, y) =>
        row.map((on, x) =>
          on ? <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={T.ink} /> : null
        )
      )}
    </svg>
  );
}

/* --------------------------------------------------------------- atoms */

const inputStyle = {
  width: "100%",
  border: `1px solid ${T.line}`,
  borderRadius: 4,
  padding: "8px 10px",
  fontSize: 14,
  fontFamily: SANS,
  color: T.ink,
  background: "#fff",
  outline: "none",
};

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-sm" style={{ color: T.inkSoft, marginBottom: 4 }}>
        {label}
      </span>
      {children}
      {hint ? (
        <span className="block text-xs" style={{ color: T.muted, marginTop: 4 }}>
          {hint}
        </span>
      ) : null}
    </label>
  );
}

function Button({ children, onClick, variant = "primary", disabled, size = "md" }) {
  const base = {
    fontFamily: SANS,
    fontSize: size === "sm" ? 13 : 14,
    borderRadius: 4,
    padding: size === "sm" ? "6px 10px" : "9px 16px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    border: `1px solid ${T.ink}`,
  };
  const variants = {
    primary: { background: T.ink, color: "#fff" },
    ghost: { background: "transparent", color: T.ink, border: `1px solid ${T.line}` },
    danger: { background: "#fff", color: T.revoked, border: `1px solid ${T.revoked}` },
  };
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
}

function Panel({ children, title, aside }) {
  return (
    <section
      style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 6 }}
      className="p-5"
    >
      {title ? (
        <header className="flex items-baseline justify-between" style={{ marginBottom: 16 }}>
          <h2 className="text-base font-medium" style={{ color: T.ink }}>
            {title}
          </h2>
          {aside}
        </header>
      ) : null}
      {children}
    </section>
  );
}

function StatusChip({ status }) {
  const map = {
    issued: { label: "Terbit", color: T.seal },
    draft: { label: "Draf", color: T.muted },
    revoked: { label: "Dicabut", color: T.revoked },
    open: { label: "Dibuka", color: T.seal },
    closed: { label: "Ditutup", color: T.muted },
    planned: { label: "Rencana", color: T.brass },
    published: { label: "Terbit", color: T.ink },
  };
  const s = map[status] || { label: status, color: T.muted };
  return (
    <span
      className="text-xs"
      style={{
        color: s.color,
        border: `1px solid ${s.color}`,
        borderRadius: 999,
        padding: "2px 9px",
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

/* ----------------------------------------------------------- dokumen LOA */

function LoaDocument({ journal, issue, signer, data, number, token, preview }) {
  const en = data.language === "en";
  const authorsLine = data.authors
    .filter((a) => a.name.trim())
    .map((a) => a.name.trim())
    .join("; ");
  const corr = data.authors.find((a) => a.corresponding) || data.authors[0];
  const verifyUrl = `loa.jurnal.stekom.ac.id/v/${token || "XXXXXXXXXX"}`;

  return (
    <article
      style={{
        background: "#fff",
        border: `1px solid ${T.line}`,
        boxShadow: "0 1px 0 rgba(20,33,58,0.06)",
        fontFamily: SERIF,
        color: "#1A1A1A",
        padding: "34px 38px 26px",
        lineHeight: 1.55,
        fontSize: 13,
      }}
    >
      <div
        className="flex items-center gap-4"
        style={{ borderBottom: `2px solid ${T.ink}`, paddingBottom: 12 }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: 48,
            height: 48,
            border: `1px solid ${T.line}`,
            borderRadius: 999,
            fontSize: 10,
            color: T.muted,
            fontFamily: SANS,
            flexShrink: 0,
          }}
        >
          logo
        </div>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 0.6 }}>
            UNIVERSITAS SAINS DAN TEKNOLOGI KOMPUTER
          </div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{en ? journal.nameEn : journal.name}</div>
          <div style={{ fontSize: 11, color: "#555" }}>
            ISSN {journal.issn} — Jl. Majapahit 605, Semarang 50192
          </div>
        </div>
      </div>

      <div className="text-center" style={{ marginTop: 22 }}>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.4 }}>
          {en ? "LETTER OF ACCEPTANCE" : "SURAT PENERIMAAN ARTIKEL"}
        </div>
        <div style={{ fontSize: 12, marginTop: 2 }}>
          {en ? "No." : "Nomor:"}{" "}
          <span style={{ color: number ? "#1A1A1A" : T.brass }}>
            {number || (en ? "(assigned on issue)" : "(nomor diberikan saat diterbitkan)")}
          </span>
        </div>
      </div>

      <p style={{ marginTop: 20 }}>
        {en ? "Dear " : "Kepada "}
        <strong>{corr?.name?.trim() || (en ? "Author" : "Penulis")}</strong>
        {corr?.affiliation ? `, ${corr.affiliation}` : ""}
      </p>

      <p style={{ marginTop: 12 }}>
        {en
          ? `On behalf of the editorial board of ${journal.nameEn}, we are pleased to inform you that your manuscript has been reviewed and accepted for publication.`
          : `Dewan editor ${journal.name} dengan ini menyatakan bahwa artikel berikut telah melalui proses telaah dan dinyatakan diterima untuk dipublikasikan.`}
      </p>

      <table style={{ width: "100%", marginTop: 14, borderCollapse: "collapse", fontSize: 12.5 }}>
        <tbody>
          {[
            [en ? "Title" : "Judul", data.title || (en ? "(untitled)" : "(judul belum diisi)")],
            [en ? "Author(s)" : "Penulis", authorsLine || (en ? "(none)" : "(belum diisi)")],
            [
              en ? "Accepted on" : "Tanggal diterima",
              en ? longDateEn(data.acceptedDate) : tanggalPanjang(data.acceptedDate),
            ],
            [
              en ? "Scheduled issue" : "Rencana terbit",
              issue
                ? `Vol. ${issue.volume} No. ${issue.number} (${issue.year}) — ${issue.label}`
                : en
                ? "to be announced"
                : "belum ditentukan",
            ],
          ].map(([k, v]) => (
            <tr key={k}>
              <td style={{ verticalAlign: "top", width: 132, padding: "3px 0", color: "#444" }}>{k}</td>
              <td style={{ verticalAlign: "top", padding: "3px 0" }}>: {v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {data.notes ? (
        <p style={{ marginTop: 12, fontSize: 12.5 }}>{data.notes}</p>
      ) : null}

      <p style={{ marginTop: 12 }}>
        {en
          ? "This letter is issued for administrative purposes and may be verified through the QR code below."
          : "Surat ini diterbitkan untuk keperluan administrasi dan keabsahannya dapat diperiksa melalui QR di bawah."}
      </p>

      <div className="flex items-start justify-between" style={{ marginTop: 24 }}>
        <div className="flex flex-col items-center" style={{ width: 150 }}>
          <QrCode value={token || "PREVIEW"} px={84} />
          <div style={{ fontFamily: SANS, fontSize: 9.5, color: "#444", marginTop: 6, textAlign: "center" }}>
            {verifyUrl}
            <br />
            {en ? "Code" : "Kode"}: {token || "XXXX-XXXX"}
          </div>
        </div>

        <div style={{ textAlign: "left", width: 230 }}>
          <div>
            Semarang, {en ? longDateEn(data.letterDate) : tanggalPanjang(data.letterDate)}
          </div>
          <div>{signer?.position || "—"}</div>
          <div
            className="flex items-center"
            style={{ height: 62, color: T.muted, fontFamily: SANS, fontSize: 10 }}
          >
            {preview ? "[ tanda tangan + stempel ]" : ""}
          </div>
          <div style={{ fontWeight: 700, textDecoration: "underline" }}>{signer?.name || "—"}</div>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------ halaman */

function GeneratePage({ journal, loas, onIssue, onGoVerify }) {
  const [form, setForm] = useState({
    issueId: journal.issues[0]?.id ?? null,
    signerId: journal.signers[0]?.id ?? null,
    title: "",
    authors: [{ name: "", affiliation: "", email: "", corresponding: true }],
    submittedDate: "",
    acceptedDate: today(),
    letterDate: today(),
    language: journal.code === "IJCSE" ? "en" : "id",
    notes: "",
  });
  const [justIssued, setJustIssued] = useState(null);

  const issue = journal.issues.find((i) => i.id === Number(form.issueId)) || null;
  const signer = journal.signers.find((s) => s.id === Number(form.signerId)) || null;

  const nextNumber = renderPattern(journal.pattern, {
    n: journal.counter + 1,
    journal,
    issue,
    date: new Date(form.letterDate + "T00:00:00"),
  });

  const ready = form.title.trim() && form.authors.some((a) => a.name.trim()) && signer;

  const setAuthor = (idx, patch) =>
    setForm((f) => ({
      ...f,
      authors: f.authors.map((a, i) => (i === idx ? { ...a, ...patch } : a)),
    }));

  const setCorresponding = (idx) =>
    setForm((f) => ({
      ...f,
      authors: f.authors.map((a, i) => ({ ...a, corresponding: i === idx })),
    }));

  const handleIssue = () => {
    const result = onIssue({ ...form, issue, signer });
    setJustIssued(result);
  };

  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1.05fr)" }}>
      <div className="flex flex-col gap-5" style={{ minWidth: 0 }}>
        {justIssued ? (
          <div
            className="p-4"
            style={{ background: "#fff", border: `1px solid ${T.seal}`, borderRadius: 6 }}
          >
            <div className="font-medium" style={{ color: T.seal }}>
              LOA {justIssued.number} diterbitkan
            </div>
            <div className="text-sm" style={{ color: T.inkSoft, marginTop: 4 }}>
              Kode verifikasi {justIssued.token}. PDF tersimpan, nomor urut jurnal maju ke{" "}
              {justIssued.sequence}.
            </div>
            <div className="flex gap-2" style={{ marginTop: 10 }}>
              <Button size="sm" variant="ghost" onClick={() => onGoVerify(justIssued.token)}>
                Buka halaman verifikasi
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setJustIssued(null)}>
                Buat LOA lain
              </Button>
            </div>
          </div>
        ) : null}

        <Panel title="Artikel">
          <div className="flex flex-col gap-4">
            <Field label="Judul artikel">
              <textarea
                rows={2}
                style={{ ...inputStyle, resize: "vertical" }}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Tulis judul sesuai naskah final"
              />
            </Field>

            <div>
              <span className="block text-sm" style={{ color: T.inkSoft, marginBottom: 6 }}>
                Penulis
              </span>
              <div className="flex flex-col gap-3">
                {form.authors.map((a, i) => (
                  <div
                    key={i}
                    className="p-3"
                    style={{ border: `1px solid ${T.line}`, borderRadius: 4 }}
                  >
                    <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                      <input
                        style={inputStyle}
                        placeholder="Nama lengkap"
                        value={a.name}
                        onChange={(e) => setAuthor(i, { name: e.target.value })}
                      />
                      <input
                        style={inputStyle}
                        placeholder="Afiliasi"
                        value={a.affiliation}
                        onChange={(e) => setAuthor(i, { affiliation: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-3" style={{ marginTop: 8 }}>
                      <input
                        style={{ ...inputStyle, flex: 1 }}
                        placeholder="Email"
                        value={a.email}
                        onChange={(e) => setAuthor(i, { email: e.target.value })}
                      />
                      <label
                        className="flex items-center gap-2 text-sm"
                        style={{ color: T.inkSoft, whiteSpace: "nowrap" }}
                      >
                        <input
                          type="radio"
                          checked={!!a.corresponding}
                          onChange={() => setCorresponding(i)}
                        />
                        Korespondensi
                      </label>
                      {form.authors.length > 1 ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setForm((f) => ({ ...f, authors: f.authors.filter((_, x) => x !== i) }))
                          }
                        >
                          Hapus
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10 }}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      authors: [...f.authors, { name: "", affiliation: "", email: "", corresponding: false }],
                    }))
                  }
                >
                  Tambah penulis
                </Button>
              </div>
            </div>

            <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
              <Field label="Tanggal submit">
                <input
                  type="date"
                  style={inputStyle}
                  value={form.submittedDate}
                  onChange={(e) => setForm({ ...form, submittedDate: e.target.value })}
                />
              </Field>
              <Field label="Tanggal diterima">
                <input
                  type="date"
                  style={inputStyle}
                  value={form.acceptedDate}
                  onChange={(e) => setForm({ ...form, acceptedDate: e.target.value })}
                />
              </Field>
              <Field label="Tanggal surat">
                <input
                  type="date"
                  style={inputStyle}
                  value={form.letterDate}
                  onChange={(e) => setForm({ ...form, letterDate: e.target.value })}
                />
              </Field>
            </div>
          </div>
        </Panel>

        <Panel title="Penerbitan">
          <div className="flex flex-col gap-4">
            <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <Field label="Edisi tujuan">
                <select
                  style={inputStyle}
                  value={form.issueId ?? ""}
                  onChange={(e) => setForm({ ...form, issueId: e.target.value || null })}
                >
                  <option value="">Belum ditentukan</option>
                  {journal.issues.map((i) => (
                    <option key={i.id} value={i.id}>
                      Vol. {i.volume} No. {i.number} ({i.year}) — {i.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Penandatangan">
                <select
                  style={inputStyle}
                  value={form.signerId ?? ""}
                  onChange={(e) => setForm({ ...form, signerId: e.target.value })}
                >
                  {journal.signers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.position}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 2fr" }}>
              <Field label="Bahasa surat">
                <select
                  style={inputStyle}
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                >
                  <option value="id">Indonesia</option>
                  <option value="en">Inggris</option>
                </select>
              </Field>
              <Field label="Catatan tambahan" hint="Opsional, muncul sebagai paragraf di surat.">
                <input
                  style={inputStyle}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="mis. Artikel dijadwalkan terbit pada halaman 45–58."
                />
              </Field>
            </div>

            <div
              className="flex items-center justify-between p-3"
              style={{ background: T.shell, borderRadius: 4 }}
            >
              <div>
                <div className="text-xs" style={{ color: T.muted }}>
                  Nomor yang akan dipakai
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>{nextNumber}</div>
              </div>
              <div className="text-xs" style={{ color: T.muted, textAlign: "right" }}>
                pola {journal.pattern}
                <br />
                urutan terakhir {journal.counter}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleIssue} disabled={!ready}>
                Terbitkan LOA
              </Button>
              <Button variant="ghost" disabled={!ready}>
                Simpan draf
              </Button>
              {!ready ? (
                <span className="text-xs" style={{ color: T.muted }}>
                  Judul dan minimal satu nama penulis wajib diisi.
                </span>
              ) : null}
            </div>
          </div>
        </Panel>

        <p className="text-xs" style={{ color: T.muted }}>
          Nomor baru dialokasikan saat tombol terbitkan ditekan, bukan saat draf dibuat, jadi draf
          yang dibatalkan tidak meninggalkan nomor kosong. Setelah terbit, data dibekukan — perbaikan
          dilakukan dengan mencabut lalu menerbitkan ulang.
        </p>
      </div>

      <div style={{ minWidth: 0 }}>
        <div className="flex items-baseline justify-between" style={{ marginBottom: 10 }}>
          <h2 className="text-base font-medium" style={{ color: T.ink }}>
            Pratinjau dokumen
          </h2>
          <span className="text-xs" style={{ color: T.muted }}>
            A4 · template {form.language === "en" ? "English" : "Indonesia"}
          </span>
        </div>
        <LoaDocument
          journal={journal}
          issue={issue}
          signer={signer}
          data={form}
          number={justIssued?.number || null}
          token={justIssued?.token || null}
          preview
        />
        <div className="text-xs" style={{ color: T.muted, marginTop: 10 }}>
          Di produksi, HTML yang sama dirender jadi PDF lewat headless Chromium, lalu di-hash
          SHA-256 dan disimpan di storage privat.
        </div>
      </div>
    </div>
  );
}

function HistoryPage({ journal, loas, onRevoke, onGoVerify }) {
  const rows = loas.filter((l) => l.journalId === journal.id);
  return (
    <Panel title={`Riwayat LOA — ${journal.code}`} aside={<span className="text-xs" style={{ color: T.muted }}>{rows.length} dokumen</span>}>
      {rows.length === 0 ? (
        <p className="text-sm" style={{ color: T.muted }}>
          Belum ada LOA untuk jurnal ini. Mulai dari halaman Terbitkan LOA.
        </p>
      ) : (
        <div className="flex flex-col">
          {rows.map((l, idx) => {
            const issue = journal.issues.find((i) => i.id === l.issueId);
            return (
              <div
                key={l.id}
                className="flex items-start justify-between gap-4"
                style={{
                  padding: "14px 0",
                  borderTop: idx === 0 ? "none" : `1px solid ${T.line}`,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink }}>{l.number}</span>
                    <StatusChip status={l.status} />
                  </div>
                  <div className="text-sm" style={{ color: T.inkSoft, marginTop: 3 }}>
                    {l.title}
                  </div>
                  <div className="text-xs" style={{ color: T.muted, marginTop: 3 }}>
                    {l.authors.map((a) => a.name).filter(Boolean).join("; ")} — diterima{" "}
                    {tanggalPanjang(l.acceptedDate)}
                    {issue ? ` — Vol. ${issue.volume} No. ${issue.number}` : ""}
                  </div>
                  {l.revokeReason ? (
                    <div className="text-xs" style={{ color: T.revoked, marginTop: 4 }}>
                      Alasan pencabutan: {l.revokeReason}
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2" style={{ flexShrink: 0 }}>
                  <Button size="sm" variant="ghost" onClick={() => onGoVerify(l.token)}>
                    Verifikasi
                  </Button>
                  {l.status === "issued" ? (
                    <Button size="sm" variant="danger" onClick={() => onRevoke(l.id)}>
                      Cabut
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

function IssuesPage({ journal }) {
  return (
    <Panel title={`Edisi ${journal.code}`} aside={<Button size="sm" variant="ghost">Tambah edisi</Button>}>
      <div className="flex flex-col">
        {journal.issues.map((i, idx) => (
          <div
            key={i.id}
            className="flex items-center justify-between"
            style={{ padding: "12px 0", borderTop: idx === 0 ? "none" : `1px solid ${T.line}` }}
          >
            <div>
              <div style={{ color: T.ink }}>
                Vol. {i.volume} No. {i.number} ({i.year})
              </div>
              <div className="text-xs" style={{ color: T.muted }}>
                {i.label}
              </div>
            </div>
            <StatusChip status={i.status} />
          </div>
        ))}
      </div>
      <p className="text-xs" style={{ color: T.muted, marginTop: 14 }}>
        Edisi berstatus rencana atau dibuka bisa dipilih sebagai target LOA. Edisi yang sudah terbit
        dikunci agar tidak ada LOA baru masuk ke nomor yang sudah dicetak.
      </p>
    </Panel>
  );
}

function MasterPage({ journal, onPattern }) {
  const sampleIssue = journal.issues[0];
  const sample = renderPattern(journal.pattern, {
    n: journal.counter + 1,
    journal,
    issue: sampleIssue,
    date: new Date(),
  });
  const tokens = [
    ["{n:3}", "urutan dengan padding"],
    ["{tahun}", "2026"],
    ["{tahun2}", "26"],
    ["{bulan}", "09"],
    ["{bulan_romawi}", "IX"],
    ["{kode}", journal.code],
    ["{vol}", "volume edisi"],
    ["{no}", "nomor edisi"],
  ];

  return (
    <div className="flex flex-col gap-5">
      <Panel title="Profil jurnal">
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Field label="Nama jurnal">
            <input style={inputStyle} defaultValue={journal.name} />
          </Field>
          <Field label="Nama (Inggris)">
            <input style={inputStyle} defaultValue={journal.nameEn} />
          </Field>
          <Field label="Kode jurnal" hint="Dipakai token {kode} di pola nomor.">
            <input style={inputStyle} defaultValue={journal.code} />
          </Field>
          <Field label="ISSN">
            <input style={inputStyle} defaultValue={journal.issn} />
          </Field>
        </div>
      </Panel>

      <Panel title="Format nomor">
        <div className="flex flex-col gap-4">
          <Field label="Pola">
            <input
              style={{ ...inputStyle, fontFamily: SERIF, fontSize: 15 }}
              value={journal.pattern}
              onChange={(e) => onPattern(e.target.value)}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            {tokens.map(([tk, desc]) => (
              <button
                key={tk}
                type="button"
                onClick={() => onPattern(journal.pattern + tk)}
                title={desc}
                style={{
                  fontFamily: SERIF,
                  fontSize: 13,
                  color: T.brass,
                  background: "#fff",
                  border: `1px solid ${T.line}`,
                  borderRadius: 4,
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
              >
                {tk}
              </button>
            ))}
          </div>
          <div className="p-3" style={{ background: T.shell, borderRadius: 4 }}>
            <div className="text-xs" style={{ color: T.muted }}>
              Contoh hasil untuk nomor berikutnya
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 17, color: T.ink }}>{sample}</div>
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <Field label="Reset urutan">
              <select style={inputStyle} defaultValue={journal.reset}>
                <option value="never">Tidak pernah</option>
                <option value="yearly">Setiap tahun</option>
                <option value="monthly">Setiap bulan</option>
                <option value="per_issue">Setiap edisi</option>
              </select>
            </Field>
            <Field label="Urutan terakhir terpakai">
              <input style={inputStyle} value={journal.counter} readOnly />
            </Field>
          </div>
        </div>
      </Panel>

      <Panel title="Penandatangan" aside={<Button size="sm" variant="ghost">Tambah</Button>}>
        <div className="flex flex-col">
          {journal.signers.map((s, idx) => (
            <div
              key={s.id}
              className="flex items-center justify-between"
              style={{ padding: "12px 0", borderTop: idx === 0 ? "none" : `1px solid ${T.line}` }}
            >
              <div>
                <div style={{ color: T.ink }}>{s.name}</div>
                <div className="text-xs" style={{ color: T.muted }}>
                  {s.position} — berkas tanda tangan tersimpan
                </div>
              </div>
              {idx === 0 ? <StatusChip status="issued" /> : null}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Tim pengelola">
        <ul className="flex flex-col gap-2 text-sm" style={{ color: T.inkSoft }}>
          {journal.members.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
        <p className="text-xs" style={{ color: T.muted, marginTop: 12 }}>
          Peran disimpan per pasangan user–jurnal, jadi satu orang bisa jadi editor di satu jurnal
          dan staff di jurnal lain.
        </p>
      </Panel>
    </div>
  );
}

function VerifyPage({ loas, journals, initialToken }) {
  const [input, setInput] = useState(initialToken || "");
  const [checked, setChecked] = useState(initialToken ? initialToken : null);

  const found = checked
    ? loas.find((l) => l.token.toUpperCase() === checked.trim().toUpperCase())
    : null;
  const journal = found ? journals.find((j) => j.id === found.journalId) : null;
  const signer = journal ? journal.signers.find((s) => s.id === found.signerId) : null;
  const issue = journal ? journal.issues.find((i) => i.id === found.issueId) : null;

  return (
    <div className="flex flex-col gap-5" style={{ maxWidth: 720 }}>
      <Panel>
        <div className="text-xs" style={{ color: T.muted }}>
          Halaman publik — loa.jurnal.stekom.ac.id/verify
        </div>
        <h2 style={{ fontFamily: SERIF, fontSize: 24, color: T.ink, margin: "6px 0 4px" }}>
          Periksa keaslian Letter of Acceptance
        </h2>
        <p className="text-sm" style={{ color: T.inkSoft, marginBottom: 14 }}>
          Scan QR pada surat, atau masukkan kode 10 karakter yang tercetak di bawah QR.
        </p>
        <div className="flex gap-2">
          <input
            style={{ ...inputStyle, fontFamily: SERIF, fontSize: 17, letterSpacing: 2 }}
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            placeholder="7H2QK9XM4T"
          />
          <Button onClick={() => setChecked(input)}>Periksa</Button>
        </div>
      </Panel>

      {checked ? (
        found ? (
          <section
            className="p-5"
            style={{
              background: "#fff",
              border: `1px solid ${found.status === "issued" ? T.seal : T.revoked}`,
              borderRadius: 6,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div
                  style={{
                    color: found.status === "issued" ? T.seal : T.revoked,
                    fontFamily: SERIF,
                    fontSize: 20,
                  }}
                >
                  {found.status === "issued" ? "Dokumen sah" : "Dokumen telah dicabut"}
                </div>
                <div className="text-sm" style={{ color: T.inkSoft, marginTop: 2 }}>
                  {found.status === "issued"
                    ? "Data di bawah diambil dari arsip penerbitan, bukan dari berkas yang Anda pegang."
                    : "Surat ini pernah diterbitkan, namun sudah dinyatakan tidak berlaku."}
                </div>
              </div>
              <div
                className="flex items-center justify-center"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 999,
                  border: `2px solid ${found.status === "issued" ? T.seal : T.revoked}`,
                  color: found.status === "issued" ? T.seal : T.revoked,
                  fontFamily: SERIF,
                  fontSize: 11,
                  textAlign: "center",
                  lineHeight: 1.15,
                  flexShrink: 0,
                }}
              >
                {found.status === "issued" ? "TER-\nVERIFIKASI" : "DICABUT"}
              </div>
            </div>

            <table style={{ width: "100%", marginTop: 18, fontSize: 14, borderCollapse: "collapse" }}>
              <tbody>
                {[
                  ["Nomor LOA", found.number],
                  ["Jurnal", `${journal.name} — ISSN ${journal.issn}`],
                  ["Judul artikel", found.title],
                  ["Penulis", found.authors.map((a) => a.name).filter(Boolean).join("; ")],
                  ["Tanggal diterima", tanggalPanjang(found.acceptedDate)],
                  [
                    "Rencana terbit",
                    issue ? `Vol. ${issue.volume} No. ${issue.number} (${issue.year})` : "belum ditentukan",
                  ],
                  ["Penandatangan", signer ? `${signer.name} — ${signer.position}` : "—"],
                  ["SHA-256 berkas", found.hash],
                  found.revokeReason ? ["Alasan pencabutan", found.revokeReason] : null,
                ]
                  .filter(Boolean)
                  .map(([k, v]) => (
                    <tr key={k} style={{ borderTop: `1px solid ${T.line}` }}>
                      <td
                        style={{ padding: "9px 12px 9px 0", color: T.muted, width: 160, verticalAlign: "top" }}
                      >
                        {k}
                      </td>
                      <td
                        style={{
                          padding: "9px 0",
                          color: T.ink,
                          verticalAlign: "top",
                          wordBreak: k === "SHA-256 berkas" ? "break-all" : "normal",
                          fontFamily: k === "SHA-256 berkas" ? SERIF : SANS,
                        }}
                      >
                        {v}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <div className="flex gap-2" style={{ marginTop: 16 }}>
              <Button size="sm" variant="ghost">Lihat PDF arsip</Button>
              <Button size="sm" variant="ghost">Laporkan kejanggalan</Button>
            </div>
          </section>
        ) : (
          <section
            className="p-5"
            style={{ background: "#fff", border: `1px solid ${T.revoked}`, borderRadius: 6 }}
          >
            <div style={{ color: T.revoked, fontFamily: SERIF, fontSize: 20 }}>
              Kode tidak ditemukan
            </div>
            <p className="text-sm" style={{ color: T.inkSoft, marginTop: 6 }}>
              Tidak ada LOA dengan kode {checked.trim().toUpperCase()} di arsip. Periksa kembali
              ketikannya, atau hubungi redaksi jurnal yang tercantum pada surat. Coba{" "}
              <span style={{ fontFamily: SERIF }}>7H2QK9XM4T</span> untuk contoh dokumen sah dan{" "}
              <span style={{ fontFamily: SERIF }}>R4TNP8ZC2K</span> untuk contoh yang dicabut.
            </p>
          </section>
        )
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------- app */

const NAV = [
  { key: "terbitkan", label: "Terbitkan LOA" },
  { key: "riwayat", label: "Riwayat" },
  { key: "edisi", label: "Edisi" },
  { key: "master", label: "Master jurnal" },
  { key: "verifikasi", label: "Halaman verifikasi" },
];

export default function SiloaPrototype() {
  const [journals, setJournals] = useState(SEED_JOURNALS);
  const [loas, setLoas] = useState(SEED_LOAS);
  const [activeId, setActiveId] = useState(1);
  const [page, setPage] = useState("terbitkan");
  const [verifyToken, setVerifyToken] = useState("");
  const [formKey, setFormKey] = useState(0);

  const journal = journals.find((j) => j.id === activeId);

  const issueLoa = (payload) => {
    const sequence = journal.counter + 1;
    const number = renderPattern(journal.pattern, {
      n: sequence,
      journal,
      issue: payload.issue,
      date: new Date(payload.letterDate + "T00:00:00"),
    });
    const token = makeToken();
    const loa = {
      id: Date.now(),
      journalId: journal.id,
      number,
      token,
      title: payload.title,
      authors: payload.authors,
      issueId: payload.issue?.id ?? null,
      signerId: payload.signer?.id ?? null,
      acceptedDate: payload.acceptedDate,
      letterDate: payload.letterDate,
      language: payload.language,
      status: "issued",
      hash: makeHash(),
    };
    setLoas((prev) => [loa, ...prev]);
    setJournals((prev) => prev.map((j) => (j.id === journal.id ? { ...j, counter: sequence } : j)));
    return { number, token, sequence };
  };

  const revokeLoa = (id) =>
    setLoas((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, status: "revoked", revokeReason: "Dicabut dari prototipe — alasan diisi lewat dialog." }
          : l
      )
    );

  const goVerify = (token) => {
    setVerifyToken(token);
    setPage("verifikasi");
  };

  const setPattern = (pattern) =>
    setJournals((prev) => prev.map((j) => (j.id === journal.id ? { ...j, pattern } : j)));

  return (
    <div
      style={{ background: T.shell, fontFamily: SANS, minHeight: "100vh", color: T.ink }}
      className="flex"
    >
      <aside
        style={{ background: T.ink, width: 228, flexShrink: 0, minHeight: "100vh" }}
        className="flex flex-col"
      >
        <div style={{ padding: "22px 20px 18px" }}>
          <div style={{ fontFamily: SERIF, fontSize: 22, color: "#fff", letterSpacing: 1 }}>SILOA</div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
            Penerbitan &amp; verifikasi LOA
          </div>
        </div>

        <div style={{ padding: "0 14px 16px" }}>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>
            Jurnal aktif
          </div>
          <select
            value={activeId}
            onChange={(e) => {
              setActiveId(Number(e.target.value));
              setFormKey((k) => k + 1);
            }}
            style={{
              ...inputStyle,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#fff",
            }}
          >
            {journals.map((j) => (
              <option key={j.id} value={j.id} style={{ color: T.ink }}>
                {j.code} — {j.name.slice(0, 22)}…
              </option>
            ))}
          </select>
        </div>

        <nav className="flex flex-col" style={{ padding: "0 8px" }}>
          {NAV.map((n) => {
            const active = page === n.key;
            return (
              <button
                key={n.key}
                type="button"
                onClick={() => setPage(n.key)}
                style={{
                  textAlign: "left",
                  background: active ? "rgba(255,255,255,0.10)" : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.72)",
                  border: "none",
                  borderLeft: `2px solid ${active ? T.brass : "transparent"}`,
                  padding: "10px 12px",
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: SANS,
                }}
              >
                {n.label}
              </button>
            );
          })}
        </nav>

        <div style={{ marginTop: "auto", padding: 18 }}>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
            Prototipe tanpa backend. Data kembali ke awal saat halaman dimuat ulang.
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: "26px 30px 60px" }}>
        <header className="flex items-baseline justify-between" style={{ marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1.2 }}>
              {NAV.find((n) => n.key === page)?.label}
            </h1>
            <div className="text-sm" style={{ color: T.muted, marginTop: 4 }}>
              {journal.name} — pola nomor {journal.pattern}
            </div>
          </div>
          <div className="text-sm" style={{ color: T.inkSoft }}>
            Anda · editor
          </div>
        </header>

        {page === "terbitkan" ? (
          <GeneratePage
            key={`${journal.id}-${formKey}`}
            journal={journal}
            loas={loas}
            onIssue={issueLoa}
            onGoVerify={goVerify}
          />
        ) : null}
        {page === "riwayat" ? (
          <HistoryPage journal={journal} loas={loas} onRevoke={revokeLoa} onGoVerify={goVerify} />
        ) : null}
        {page === "edisi" ? <IssuesPage journal={journal} /> : null}
        {page === "master" ? <MasterPage journal={journal} onPattern={setPattern} /> : null}
        {page === "verifikasi" ? (
          <VerifyPage key={verifyToken} loas={loas} journals={journals} initialToken={verifyToken} />
        ) : null}
      </main>
    </div>
  );
}
