# SILOA — Sistem Penerbitan & Verifikasi Letter of Acceptance

Draf konsep project. Stack usulan: **Laravel 12 + Inertia + React + shadcn/ui** (pakai `laraplate-react`), MySQL/Postgres, Redis queue, S3/MinIO, deploy Docker/Dokploy.

---

## 1. Masalah & tujuan

Tiap jurnal punya kop surat, penandatangan, dan format nomor sendiri. Saat ini LOA biasanya dibuat manual (Word → PDF), nomornya dicatat di spreadsheet, dan tidak ada cara bagi penulis/institusi lain untuk memastikan LOA itu asli.

Sasaran sistem:

1. Satu aplikasi untuk banyak jurnal, dengan akses per jurnal (1 user bisa pegang banyak jurnal, 1 jurnal bisa dipegang banyak user).
2. Nomor LOA otomatis, unik, dan mengikuti format masing-masing jurnal.
3. PDF LOA ter-render konsisten dari template, lengkap dengan tanda tangan dan QR.
4. Halaman verifikasi publik: scan QR → status LOA (valid / dicabut / tidak ditemukan).
5. Jejak audit: siapa menerbitkan apa, kapan, dan berapa kali dokumen itu diverifikasi.

---

## 2. Aktor & peran

| Peran | Cakupan | Kewenangan |
|---|---|---|
| `super_admin` | Platform | Kelola user, buat jurnal baru, lihat semua LOA, audit log |
| `journal_owner` | Per jurnal | Kelola master jurnal: penandatangan, format nomor, template, anggota tim |
| `journal_editor` | Per jurnal | Buat draf **dan menerbitkan** LOA, cabut LOA |
| `journal_staff` | Per jurnal | Buat draf saja, tidak bisa menerbitkan |
| Publik | — | Halaman verifikasi (tanpa login) |

Peran disimpan di tabel pivot `journal_user`, bukan di `users`, supaya satu orang bisa jadi editor di Jurnal A dan staff di Jurnal B. Di UI ada **journal switcher** (jurnal aktif disimpan di session), dan semua query di-scope ke jurnal yang boleh diakses user (global scope + Policy).

---

## 3. Model data

```
users ──┬── journal_user ──┬── journals ──┬── signers
        │   (role)          │             ├── number_formats ── number_counters
        │                   │             ├── loa_templates
        │                   │             └── issues
        │                                        │
        └──────── loas ───────────────────────────┘
                   │
                   ├── loa_authors
                   └── verification_logs
```

### `journals` — master jurnal
`id`, `code` (JTIK, JMBS — dipakai di pola nomor), `name`, `name_en`, `issn_print`, `issn_online`, `publisher`, `website_url`, `logo_path`, `letterhead_path`, `address`, `email`, `default_signer_id`, `default_number_format_id`, `default_template_id`, `is_active`, timestamps.

### `signers` — penanggung jawab / TTD
`id`, `journal_id`, `name`, `title` (gelar), `position` (Editor-in-Chief, Ketua Dewan Editor), `email`, `signature_path` (PNG transparan), `stamp_path`, `is_default`, `is_active`.

Satu jurnal boleh punya beberapa penandatangan (mis. Editor in Chief dan Managing Editor) — dipilih saat penerbitan.

### `number_formats` — format nomor per jurnal
`id`, `journal_id`, `name`, `pattern`, `reset_policy` (`never|yearly|monthly|per_issue`), `start_from`, `is_default`, `is_active`.

### `number_counters` — pencatat urutan
`id`, `number_format_id`, `scope_key` (mis. `2026`, `2026-09`, `issue:14`), `last_number`, `unique(number_format_id, scope_key)`.

Counter dipisah dari `number_formats` supaya reset tahunan/bulanan tinggal bikin baris baru, dan penambahan nomor bisa di-lock per baris.

### `issues` — edisi/terbitan per jurnal
`id`, `journal_id`, `volume`, `number`, `year`, `period_label` (Juli–Desember 2026), `publication_date`, `status` (`planned|open|closed|published`), `unique(journal_id, volume, number, year)`.

### `loa_templates` — template surat
`id`, `journal_id`, `name`, `language` (`id|en`), `subject_title`, `body_html` (berisi placeholder), `closing_html`, `paper_size`, `margins_json`, `show_stamp`, `is_default`.

Placeholder yang tersedia: `{{article_title}}`, `{{authors_list}}`, `{{corresponding_author}}`, `{{journal_name}}`, `{{issue_label}}`, `{{volume}}`, `{{number}}`, `{{accepted_date}}`, `{{estimated_publish_date}}`, `{{loa_number}}`, `{{signer_name}}`, `{{signer_position}}`, `{{verification_url}}`.

### `loas` — dokumen LOA
`id`, `uuid`, `journal_id`, `issue_id` (nullable), `number_format_id`, `template_id`, `signer_id`,
`loa_number`, `sequence`, `scope_key`,
`article_title`, `abstract`, `keywords`, `manuscript_id` (nomor submission OJS, opsional),
`corresponding_email`, `submitted_date`, `accepted_date`, `estimated_publish_date`,
`place`, `letter_date`, `language`, `notes`,
`status` (`draft|issued|revoked`), `verification_token`, `pdf_path`, `pdf_hash`, `pdf_generated_at`,
`snapshot_json`, `created_by`, `issued_by`, `issued_at`, `revoked_by`, `revoked_at`, `revoke_reason`,
`unique(journal_id, loa_number)`, `unique(verification_token)`.

### `loa_authors`
`id`, `loa_id`, `order`, `name`, `affiliation`, `email`, `is_corresponding`.

### `verification_logs`
`id`, `loa_id`, `ip_hash`, `user_agent`, `source` (`qr|manual|api`), `created_at`.

### Prinsip penting: snapshot
Begitu LOA berstatus `issued`, seluruh data yang tercetak (nama jurnal, ISSN, nama & jabatan penandatangan, label edisi, isi template) **dibekukan** ke `snapshot_json`. Kalau tahun depan nama Editor-in-Chief berganti atau template diedit, LOA lama tetap tampil sesuai dokumen aslinya. Halaman verifikasi juga membaca snapshot, bukan master yang sekarang.

---

## 4. Mesin penomoran

### Token pola

| Token | Hasil | Catatan |
|---|---|---|
| `{n}` / `{n:3}` | `7` / `007` | urutan, `:3` = padding nol |
| `{tahun}` / `{tahun2}` | `2026` / `26` | |
| `{bulan}` / `{bulan_romawi}` | `09` / `IX` | |
| `{kode}` | `JTIK` | `journals.code` |
| `{vol}` / `{no}` | `12` / `2` | dari edisi yang dipilih |
| `{teks:LOA}` | `LOA` | literal, opsional |

Contoh pola nyata:

- `{n:3}/LOA/JTIK/{bulan_romawi}/{tahun}` → `007/LOA/JTIK/IX/2026`
- `LOA-{tahun}{n:4}-JMBS` → `LOA-20260031-JMBS`
- `{kode}/LOA/V{vol}N{no}/{n:2}` → `IJCSE/LOA/V8N1/03`

### Alokasi nomor yang aman

Nomor **hanya dialokasikan saat penerbitan**, bukan saat draf dibuat — supaya draf yang dibatalkan tidak meninggalkan lubang nomor.

```php
final class LoaNumberService
{
    public function allocate(Loa $loa): string
    {
        $format = $loa->numberFormat;
        $scope  = $this->scopeKey($format, $loa);   // '2026' | '2026-09' | 'issue:14' | 'all'

        return DB::transaction(function () use ($format, $scope, $loa) {
            $counter = NumberCounter::query()
                ->where('number_format_id', $format->id)
                ->where('scope_key', $scope)
                ->lockForUpdate()
                ->first();

            if (! $counter) {
                $counter = NumberCounter::create([
                    'number_format_id' => $format->id,
                    'scope_key'        => $scope,
                    'last_number'      => $format->start_from - 1,
                ]);
            }

            $counter->increment('last_number');

            return $this->render($format->pattern, $counter->last_number, $loa);
        }, attempts: 3);
    }
}
```

`render()` mengganti token dengan nilainya. Tambahkan `unique(journal_id, loa_number)` di DB sebagai jaring terakhir — kalau race condition lolos, insert-nya gagal dan bisa di-retry, bukan menghasilkan nomor kembar.

---

## 5. Alur penerbitan

```
[draft] --terbitkan--> [issued] --cabut--> [revoked]
   |                                          |
   +-- hapus (boleh)                          +-- terbitkan ulang -> LOA baru (reference_loa_id)
```

Langkah user:

1. Pilih jurnal aktif (switcher).
2. Pilih edisi tujuan (atau "belum ditentukan").
3. Isi judul artikel, daftar penulis + afiliasi, corresponding author, tanggal submit & tanggal diterima.
4. Pilih penandatangan, template, dan bahasa surat.
5. **Pratinjau** — nomor masih tampil sebagai contoh (`(nomor terbit otomatis)`).
6. **Terbitkan** — dalam satu transaksi: alokasi nomor → generate `verification_token` → snapshot data → render PDF → hitung SHA-256 → simpan ke storage privat → status `issued`.
7. Unduh PDF atau kirim email ke corresponding author (queued, dengan log pengiriman).

Setelah `issued`, record tidak bisa diedit. Salah data → **cabut dengan alasan**, lalu terbitkan ulang. Halaman verifikasi LOA yang dicabut menampilkan status merah beserta tanggal & alasan pencabutan, jadi dokumen yang sudah tersebar tidak jadi zombie.

---

## 6. Render PDF

Rekomendasi: **spatie/browsershot** (headless Chromium) dengan Blade template.

- Kualitas layout HTML/CSS jauh lebih baik daripada dompdf untuk kop surat, tabel penulis, dan tanda tangan bertumpuk.
- Perlu `chromium` + font di image Docker. Di Dockerfile tambahkan `chromium`, `fonts-liberation`, dan set `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` lalu `Browsershot::setChromePath()`.
- Alternatif ringan kalau tidak mau Chromium di container: `mpdf` — tapi siap kompromi CSS.

Detail yang biasanya terlewat:

- Ukuran A4, margin fisik 2,5 cm; kop surat sebagai `header` Browsershot, nomor halaman di `footer`.
- Tanda tangan PNG transparan, tinggi tetap (mis. 90 px) supaya tidak gepeng; stempel di-overlay dengan `mix-blend-mode: multiply`.
- QR digenerate inline (`bacon/bacon-qr-code` → SVG base64), error correction level **Q** supaya tetap terbaca kalau hasil cetakan/scan jelek, quiet zone tetap ada.
- Simpan `pdf_hash` (SHA-256) dan tampilkan di halaman verifikasi supaya file bisa dibandingkan.
- Job render masuk queue; untuk bulk generate satu edisi, gunakan batch + progress bar.
- Jangan taruh PDF di disk publik. Akses lewat signed route (`/loa/{uuid}/file?signature=...`).

---

## 7. QR & halaman verifikasi

**Payload QR**: URL pendek berisi token acak, bukan ID berurutan.

```
https://loa.devs.web.id/v/7H2QK9XM4T
```

- `verification_token`: 10 karakter base32 tanpa karakter ambigu (tanpa `0/O/1/I`), acak kriptografis. Tidak bisa ditebak dari nomor LOA, jadi orang tidak bisa menyusun daftar LOA orang lain.
- Di bawah QR, token dicetak juga sebagai teks — kalau QR rusak, verifikator bisa mengetik manual di `/verify`.

**Halaman verifikasi publik** menampilkan: status (valid / dicabut / tidak ditemukan), nomor LOA, nama jurnal + ISSN, judul artikel, daftar penulis, tanggal diterima, edisi target, nama & jabatan penandatangan, tanggal terbit, SHA-256 PDF, dan tautan lihat PDF.

Pengamanan:

- Rate limit per IP (mis. 20/menit) untuk mencegah brute force token.
- Form manual memakai nomor LOA **dan** token (dua faktor lemah, tapi cukup mematikan percobaan acak).
- Setiap kunjungan dicatat ke `verification_logs` (IP di-hash) → berguna untuk statistik dan deteksi penyalahgunaan.
- Roadmap legal-grade: tanda tangan elektronik tersertifikasi (BSrE/PSrE) agar PDF punya PAdES signature, bukan cuma gambar TTD.

---

## 8. Peta route

**Terproteksi (Inertia)**

```
GET    /dashboard
POST   /journal-context/{journal}        # switch jurnal aktif
GET    /journals/{journal}/settings      # master: profil, kop, default
CRUD   /journals/{journal}/signers
CRUD   /journals/{journal}/number-formats
POST   /journals/{journal}/number-formats/{format}/preview
CRUD   /journals/{journal}/templates
CRUD   /journals/{journal}/issues
CRUD   /journals/{journal}/members       # kelola akses user
GET    /loas                             # riwayat + filter status/edisi/tanggal
GET    /loas/create
POST   /loas                             # simpan draft
POST   /loas/{loa}/issue                 # alokasi nomor + render PDF
POST   /loas/{loa}/revoke
POST   /loas/{loa}/send-email
GET    /loas/{loa}/file                  # signed URL
POST   /loas/bulk-import                 # CSV/XLSX satu edisi
```

**Publik**

```
GET    /v/{token}                        # target QR
GET    /verify                           # form manual
POST   /verify
```

---

## 9. Rencana pengembangan

| Tahap | Isi | Perkiraan |
|---|---|---|
| M1 | Auth, journal + journal_user, journal switcher, policy | 1 minggu |
| M2 | Master signers, number_formats + mesin penomoran + preview, issues | 1 minggu |
| M3 | Form LOA, draft, pratinjau HTML, template engine | 1,5 minggu |
| M4 | Render PDF (Browsershot), QR, penerbitan, halaman verifikasi publik | 1,5 minggu |
| M5 | Riwayat + filter, cabut & terbitkan ulang, email ke penulis, audit log | 1 minggu |
| M6 | Bulk import, statistik verifikasi, rate limit, backup, hardening | 1 minggu |

Total realistis ±7 minggu untuk 1–2 dev, belum termasuk integrasi OJS.

---

## 10. Yang perlu diputuskan dulu

1. **Integrasi OJS** — apakah data artikel diambil otomatis dari OJS (API/plugin) atau diinput manual? Ini paling memengaruhi desain form.
2. **Domain verifikasi** — satu domain terpusat untuk semua jurnal, atau per jurnal? QR yang sudah tercetak sulit diubah, jadi domain ini sebaiknya permanen sejak awal.
3. **Bahasa surat** — jurnal internasional biasanya butuh LOA bahasa Inggris; perlu dua template default sejak M3 atau nanti?
4. **Kewenangan nomor** — boleh nomor manual/backdate untuk LOA yang sudah pernah terbit sebelum sistem ini ada? Kalau ya, sediakan mode "import historis" yang tidak menyentuh counter.
5. **Legalitas TTD** — cukup gambar tanda tangan, atau harus e-Sign tersertifikasi?
