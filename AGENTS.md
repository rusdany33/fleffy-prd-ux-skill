# AGENTS.md — AI Coding Agent Instructions

**Project:** Fleffy — Pemeriksaan Pembayaran Transfer
**Version:** 1.0 · **Purpose:** Instruksi kerja untuk AI coding agent yang membangun `apps/web` (Eksperimen B: PRD + UX Skill).

---

## 1. Project Context
Kamu adalah AI Software Engineer yang mengimplementasikan fitur pemeriksaan pembayaran transfer untuk Fleffy, aplikasi kasir laundry sepatu. Pengguna utama adalah **Admin/Kasir (Ari)** yang tidak memiliki akses rekening; kepastian dana datang dari **Pemeriksa (Owner/Finance)**. Tujuan akhirnya: Admin memutuskan **Teruskan/Tahan** berdasarkan hasil pemeriksaan yang sah untuk pesanan yang sama.

Jangan hanya membuat tampilan. Semua fungsi dalam spesifikasi harus benar-benar bekerja dan tersimpan.

## 2. Mandatory Documentation
Baca seluruhnya sebelum menulis kode:

| Dokumen | Isi |
|---|---|
| `README.md` | PRD: masalah, FR-01–FR-08, NFR, aturan bisnis, scope, V1–V8 |
| `UX-SPEC.md` | IA N0–N3c, halaman, alur S1–S4, cabang T1–T3/E2/E3, content inventory |
| `DESIGN-SYSTEM.md` | Token warna/tipografi/spacing, komponen, aksesibilitas |
| `INTERACTION-SPEC.md` | Perilaku navigasi, validasi, pemeriksaan, keputusan, edge case |
| `ACCEPTANCE-CRITERIA.md` | AC-001–AC-040 untuk pengujian |

Jika ada konflik: identifikasi, jangan pilih diam-diam, utamakan dokumen yang lebih spesifik (INTERACTION-SPEC > UX-SPEC > PRD untuk perilaku; DESIGN-SYSTEM untuk tampilan), dan catat keputusan di `DECISIONS.md`.

## 3. Core Development Principles
- **Specification-driven:** jangan menambah fitur di luar scope; jangan menghilangkan requirement.
- **UX-first:** istilah, urutan, dan teks mengikuti UX-SPEC; satu konteks pesanan di N1b.
- **Design consistency:** semua nilai visual memakai CSS custom properties dari DESIGN-SYSTEM; tidak ada warna/ukuran acak.
- **Functional completeness:** setiap tombol berfungsi, setiap form tervalidasi, setiap perubahan tersimpan dan memberi feedback.
- **Aturan di logika, bukan hanya UI:** aksi tidak sah (Teruskan tanpa hasil memadai, hasil dari Admin, permintaan ganda) harus ditolak oleh lapisan logika, tidak cukup tombol nonaktif.

## 4. Development Workflow
1. **Analyze** — ringkas pemahaman, daftar fitur, dependensi, risiko, asumsi.
2. **Setup** — Vite + React + TypeScript di `apps/web`; Vitest untuk test; hash routing; penyimpanan `localStorage` lewat lapisan `services/storage`.
3. **Design implementation** — urutan: tokens & layout → navigasi → N1b accordion → N2 → N1 → N1a → N0 → N3 → P01/P12 → bottom sheet & toast.
4. **Functional implementation** — pesanan → permintaan → hasil → kecukupan → keputusan → invalidasi data → antrean/beranda.
5. **Validation** — jalankan test, periksa di browser (mobile 375 px dan desktop), cocokkan dengan AC, tulis `TEST-REPORT.md`.

Jangan menyatakan selesai hanya karena berhasil dikompilasi.

## 5. Feature Implementation Rules

### 5.1 Data & ID
- `PSN-NNN` (counter global), `BKT-NNN` sama nomornya dengan pesanan, `PRM-NNN` / `PRM-NNN-B…` untuk permintaan, `HAS-NNN` / `HAS-NNN-B…` untuk hasil.
- Permintaan menyimpan **snapshot** (ID pesanan, pelanggan, nominal, ID bukti, nominal & waktu bukti) saat dibuat.
- Keadaan pemeriksaan **diturunkan** dari data (tidak disimpan sebagai field terpisah): `tidak_perlu | belum_diminta | menunggu | hasil_tersedia`.
- "Dana dikonfirmasi" dan "memadai" diturunkan dari aturan INTERACTION-SPEC §4.4.

### 5.2 Peran
`admin | owner | finance`. Admin: catat/ubah pesanan, minta pemeriksaan, keputusan. Owner/Finance: catat hasil. Peran dipilih lewat pemilih peran di header (simulasi, sesuai asumsi PRD).

### 5.3 Invalidasi
Mengubah nominal, pelanggan, metode, atau bukti setelah permintaan → permintaan aktif dan hasilnya ditandai `stale`, keputusan berbasis permintaan itu tidak berlaku.

### 5.4 Persistence
- Satu kunci `localStorage` berversi. Bungkus baca/tulis dengan try/catch.
- Jangan menyimpan data hanya di state komponen.
- Data contoh fiktif ditandai `sample: true` dan label "Contoh"; sediakan reset.

## 6. Component Architecture
```
apps/web/src/
├── components/
│   ├── layout/      AppHeader, BottomNav, PageHeader, AppShell
│   ├── common/      Button, Card, Chip, InfoBox, Field, Accordion, BottomSheet, Toast, KeyValue, EmptyState
│   ├── orders/      OrderCard, OrderForm, sections/ (Summary, Payment, Verification, FollowUp)
│   └── verification/ ResultForm, ResultChecklist
├── pages/           Home, Orders, OrderNew, OrderEdit, OrderDetail, Proof, DecisionLog, Queue, Help, HelpStatus, HelpWaiting, HelpContacts, NotFound
├── domain/          types.ts, rules.ts (aturan murni), actions.ts (aksi → data baru), ids.ts
├── services/        storage.ts, seed.ts
├── store/           StoreContext.tsx
├── hooks/           useRoute.ts
├── utils/           format.ts, validation.ts
├── styles/          tokens.css, base.css, components.css
└── tests/           rules.test.ts, actions.test.ts, validation.test.ts
```
Pisahkan logika murni (`domain/`) dari komponen. Hindari satu file raksasa.

## 7. Code Quality Rules
TypeScript strict, nama deskriptif, tanpa dependensi baru selain React/Vite/Vitest, error ditangani eksplisit, tidak ada placeholder sebagai implementasi akhir, tidak ada data dummy tanpa penanda.

## 8. Responsive Design Rules
Mobile < 640 · Tablet 640–1023 · Desktop ≥ 1024 · Wide ≥ 1440. Kolom konten max 560 px terpusat di ≥ 640 px. Tidak ada horizontal overflow pada 320 px.

## 9. Testing Requirements
Unit test untuk `domain/` minimal: buat pesanan & validasi, snapshot permintaan, satu permintaan aktif, hasil hanya pemeriksa, Sesuai butuh checklist lengkap, kecukupan hasil, Teruskan ditolak tanpa hasil memadai, Tahan wajib alasan, invalidasi data, dua pesanan nominal sama, ID berurutan, ringkasan beranda.
Pengujian browser: alur S1–S4, T3, P05, antrean & kembali, responsif.

## 10. Visual Validation
Bandingkan hasil dengan UX-SPEC (struktur & teks), DESIGN-SYSTEM (token & komponen), INTERACTION-SPEC (perilaku) menggunakan browser nyata. Jangan menilai kesesuaian hanya dari kode CSS.

## 11. Scope Control
Di luar scope: integrasi bank, QRIS/payment gateway, unggah gambar bukti, login sungguhan, notifikasi WhatsApp otomatis, laporan keuangan, proses cuci & pengantaran.

## 12. Decision & Assumption Management
Catat keputusan teknis dan interpretasi di `DECISIONS.md` (ID D-01, D-02, …) beserta alasan dan dokumen rujukan.

## 13. Completion Report
Akhiri dengan `COMPLETION-REPORT.md`: ringkasan implementasi, status AC (Pass/Fail/Not Tested), known issues, next steps. Catat setiap iterasi di `CHANGELOG.md`.

## 14. Final Instruction
Urutan prioritas: kebenaran fungsi → kebutuhan pengguna → kesesuaian UX & interaksi → konsistensi desain → kualitas kode → kinerja & keamanan → kemudahan pemeliharaan.

**Build what is specified, validate what is built, and report what is not yet complete.**

*End of AGENTS.md v1.0*
