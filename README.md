# SILOA — Prototipe Letter of Acceptance

Prototipe alur penerbitan & verifikasi LoA. Semua data hanya di memori (mock), tanpa backend.

## Stack

- React 19
- Vite 8
- Deploy: Vercel (static SPA)

## Jalankan lokal

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output ke dist/
npm run preview  # cek hasil build
```

## Deploy ke Vercel

### Lewat dashboard (Git)

1. Push repo ini ke GitHub/GitLab/Bitbucket.
2. Buka https://vercel.com/new, import repo.
3. Vercel membaca `vercel.json`: framework `vite`, build `npm run build`, output `dist`.
4. Klik **Deploy**.

### Lewat CLI

```bash
npm i -g vercel
vercel          # preview deployment
vercel --prod   # production
```

## Struktur

```
index.html            entry HTML
src/main.jsx          bootstrap React
src/index.css         reset + background
src/SiloaPrototype.jsx  seluruh aplikasi prototipe
vercel.json           konfigurasi deploy + SPA rewrite
```
