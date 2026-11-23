# EVALUASI — Perbandingan Eksperimen A (PRD Only) vs B (PRD + UX Skill)

**Mata kuliah:** Rekayasa Interaksi · **Penyusun:** Rusdany Maestro (202210370311406) · **Tanggal:** 23 November 2026
**Studi kasus:** Fleffy — Pemeriksaan Pembayaran Transfer (kasir laundry sepatu)

| | Eksperimen A — PRD Only | Eksperimen B — PRD + UX Skill |
|---|---|---|
| Repo | [rusdany33/fleffy-prd-only](https://github.com/rusdany33/fleffy-prd-only) | [rusdany33/fleffy-prd-ux-skill](https://github.com/rusdany33/fleffy-prd-ux-skill) |
| Demo | https://rusdany33.github.io/fleffy-prd-only/ | https://rusdany33.github.io/fleffy-prd-ux-skill/ |
| Input dokumentasi | `README.md` (PRD v1.0) | PRD v1.0 (identik) + UX-SPEC, DESIGN-SYSTEM, INTERACTION-SPEC, ACCEPTANCE-CRITERIA, AGENTS.md |
| AI coding agent | Claude Code · Claude Opus 5.5 | Claude Code · Claude Opus 5.5 (sama) |
| Stack | React 19 + TypeScript + Vite, Vitest, localStorage, GitHub Pages | sama |

---

## 1. Ringkasan Hasil

| Parameter (slide PRD Overview) | A — PRD Only | B — PRD + UX Skill | Unggul |
|---|---|---|---|
| 📦 Kelengkapan fitur | FR-01–FR-08 terpenuhi; **24 Pass · 12 Sebagian · 4 Gagal** dari 40 kriteria UX | FR-01–FR-08 terpenuhi; **39 Pass · 0 Gagal · 1 Belum diuji** | **B** |
| 🎨 Kesesuaian UX | UX01–UX05 terpenuhi secara fungsi, tetapi alur & istilah generik; UX06 terpenuhi | UX01–UX06 terpenuhi dengan alur, istilah, dan layar mengikuti Worksheet 9–12 | **B** |
| ✨ Konsistensi desain | Tema terang generik, tidak mengikuti wireframe/aplikasi Fleffy; 30 literal warna tersebar | Tema gelap Fleffy, 16 warna hanya di `tokens.css`, komponen sesuai spesifikasi | **B** |
| 🧪 Keberhasilan pengujian | 19 unit test lulus; V1–V8 PRD 8/8 Pass | 23 unit test lulus; AC 39/40 Pass (1 Not Tested) | **B** (cakupan uji lebih luas) |
| 🔄 Jumlah revisi | 0 prompt ulang dari pengguna; 4 perbaikan internal agent; 1 commit | 0 prompt ulang dari pengguna; 5 perbaikan internal agent; 2 commit | Setara |
| ⏱️ Waktu pengembangan | ± 8 menit kerja agent (kode → commit) | ± 8 menit menyusun dokumen UX + ± 10 menit kode → commit | **A** (lebih cepat) |

**Kesimpulan singkat:** PRD saja sudah cukup untuk menghasilkan aplikasi yang **benar secara aturan bisnis**, misalnya pesanan tidak bisa diteruskan tanpa hasil *Sesuai*. Namun pengalaman penggunanya generik. Dokumen UX Skill membuat agent menerapkan **keputusan desain dari riset**: accordion empat bagian, checklist kecukupan hasil, banner "hasil perlu diperbarui", bantuan kontekstual, istilah dan ID yang konsisten, serta tema Fleffy. Konsekuensinya, B membutuhkan waktu dan kode lebih banyak.

---

## 2. Kelengkapan Fitur

### 2.1 Terhadap PRD (FR & V1–V8)
Kedua aplikasi memenuhi FR-01 sampai FR-08 dan lulus skenario V1–V8 PRD (lihat CHANGELOG masing-masing).

### 2.2 Terhadap ACCEPTANCE-CRITERIA UX Skill (AC-001–AC-040)
A dinilai memakai kriteria yang **tidak pernah diterimanya**. Inilah selisih yang ingin diukur eksperimen ini. Penilaian A memakai inspeksi kode dan hasil uji browser V1–V8. Penilaian B memakai [TEST-REPORT.md](TEST-REPORT.md).

| AC | Kriteria | A | B | Catatan untuk A |
|---|---|---|---|---|
| 001 | Buat pesanan, ID & redirect | Sebagian | Pass | ID `FLF-YYMMDD-NNN`, bukan PSN; tidak langsung membuka bagian Pemeriksaan |
| 002 | Validasi field wajib | Pass | Pass | |
| 003 | Bukti ber-ID & halaman bukti (P01) | Sebagian | Pass | Bukti tampil di detail, tanpa ID BKT dan tanpa halaman bukti |
| 004 | Catatan ≠ dana dikonfirmasi | Pass | Pass | Label "Dicatat · dana belum dipastikan" |
| 005 | Identitas selalu terlihat | Pass | Pass | |
| 006 | Dua pesanan nominal sama | Pass | Pass | |
| 007 | Cari & empty state | Pass | Pass | |
| 008 | Ubah data setelah pemeriksaan | Sebagian | Pass | Peringatan di form dan permintaan dibatalkan, tetapi tanpa banner "hasil perlu diperbarui" di detail |
| 009 | Konfirmasi buang perubahan | **Gagal** | Pass | Tidak ada |
| 010 | Minta pemeriksaan tanpa input ulang | Pass | Pass | |
| 011 | Satu permintaan aktif | Pass | Pass | |
| 012 | Tampilan menunggu tanpa ETA | Pass | Pass | Menampilkan lama menunggu, bukan perkiraan selesai |
| 013 | Hasil hanya oleh Pemeriksa | Pass | Pass | |
| 014 | Checklist 4 butir sebelum *Sesuai* | **Gagal** | Pass | Pemeriksa hanya memilih Sesuai/Tidak sesuai/Klarifikasi |
| 015 | Aturan kecukupan hasil | Sebagian | Pass | Cek "Sesuai + permintaan aktif", tanpa checklist dan tanpa perbandingan snapshot bukti |
| 016 | Permintaan ulang | Sebagian | Pass | Berfungsi, tetapi tanpa ID berurutan (PRM-xxx-B) |
| 017 | Banner gagal simpan (E2) | **Gagal** | Not Tested | A hanya punya banner global "penyimpanan tidak tersedia" |
| 018 | Teruskan diblokir + alasan | Pass | Pass | |
| 019 | Simpan Teruskan dengan dasar | Pass | Pass | |
| 020 | Tahan via bottom sheet & alasan terstruktur | Sebagian | Pass | Teks alasan bebas, inline, tanpa pilihan alasan |
| 021 | Halaman catatan keputusan | Sebagian | Pass | Riwayat ada di detail, tanpa halaman P12 |
| 022 | Hanya Admin memutuskan | Pass | Pass | |
| 023 | Antrean & filter | Pass | Pass | Filter berbentuk chip, bukan radio-list |
| 024 | Kembali mempertahankan filter | Pass | Pass | |
| 025 | Beranda ringkasan | Pass | Pass | |
| 026 | Bantuan kontekstual | Sebagian | Pass | Bantuan tidak membawa konteks pesanan |
| 027 | Accordion 4 bagian | **Gagal** | Pass | Detail berupa kartu panjang berurutan |
| 028 | Token desain | Sebagian | Pass | Ada variabel `:root`, tetapi ada literal warna di luar token |
| 029 | Pemetaan chip status | Sebagian | Pass | Konsisten di dalam A, tetapi tidak sesuai DESIGN-SYSTEM |
| 030 | Komponen sesuai spesifikasi | Sebagian | Pass | Tombol 44 px, bukan 48 px; tanpa bottom sheet |
| 031 | Navigasi aktif | Pass | Pass | |
| 032 | Feedback | Pass | Pass | |
| 033 | Empty states | Pass | Pass | |
| 034 | Persistence | Pass | Pass | |
| 035 | Responsive | Pass | Pass | |
| 036 | Aksesibilitas | Sebagian | Pass (sebagian) | Label & fokus ada; tanpa dialog ber-focus-trap |
| 037 | Performa | Pass | Pass | |
| 038 | Klik ganda | Pass | Pass | |
| 039 | Pesanan tunai | Pass | Pass | |
| 040 | URL tidak dikenal | Pass | Pass | |
| | **Total** | **24 Pass · 12 Sebagian · 4 Gagal** | **39 Pass · 1 Not Tested** | |

Kriteria tempat A gagal atau sebagian (AC-008, 014, 015, 020, 026, 027) semuanya berasal dari **keputusan riset**, bukan dari PRD. Contohnya konsep accordion terpilih (Worksheet 11), checklist hasil dan cabang P05 (Worksheet 12), serta bantuan kontekstual TS2 (Worksheet 9).

---

## 3. Kesesuaian UX (UX01–UX06, Worksheet 8)

| UX | A — PRD Only | B — PRD + UX Skill |
|---|---|---|
| UX01 Bedakan tercatat vs diperiksa | Dua kotak "Catatan pembayaran" vs "Penerimaan dana" di detail | Chip "Pembayaran tercatat" + teks, berubah menjadi "✓ Dana dikonfirmasi" hanya bila hasil memadai; halaman arti status |
| UX02 Cocokkan pesanan yang tepat | Kode pesanan + pelanggan; bukti tampil di detail | ID PSN/BKT/PRM/HAS saling merujuk; hasil dikaitkan ke snapshot permintaan; halaman bukti |
| UX03 Pemeriksa & status | Pemeriksa + "menunggu sejak …" | PRM-ID, pemeriksa, waktu kirim; teks "Permintaan tercatat. Hasil belum tersedia."; antrean dengan baris konteks |
| UX04 Tindak lanjut saat menunggu | Kotak prosedur, tombol telepon, contoh pesan ke pelanggan | Panduan 3 langkah kontekstual (PSN · PRM · pemeriksa), kontak pemeriksa, tanpa janji waktu |
| UX05 Keputusan berdasar hasil | Teruskan aktif hanya bila *Sesuai*; Tahan dengan alasan bebas | Teruskan aktif hanya bila hasil **memadai** (4 butir cocok + data terbaru); Tahan dengan alasan terstruktur; catatan keputusan |
| UX06 Tanpa ketik ulang | Data pesanan otomatis | Data pesanan otomatis + bukti; setelah membuat pesanan langsung diarahkan ke bagian Pemeriksaan |

A sebenarnya **menambah** satu fitur yang tidak diminta UX Skill, yaitu contoh pesan ke pelanggan yang dapat disalin. Fitur ini bagus, tetapi menjadi interpretasi agent yang berada di luar dokumen.

---

## 4. Konsistensi Desain

| Aspek | A | B |
|---|---|---|
| Arah visual | Tema terang biru, gaya dashboard umum | Tema gelap minimal seperti aplikasi Fleffy; monokrom + warna semantik (Worksheet 12) |
| Sumber nilai warna | Variabel `:root` + literal warna di aturan lain (30 literal hex) | 16 warna primitif hanya di `tokens.css`; komponen memakai token semantik |
| Tipografi | Font sistem | Roboto, skala 5 tingkat dari DESIGN-SYSTEM |
| Layout detail | Kartu panjang berurutan | Accordion 4 bagian sesuai konsep terpilih Worksheet 11 |
| Struktur kode | 16 berkas, 1.507 baris | 27 berkas, 2.101 baris; `domain/`, `components/`, `pages/`, `styles/` terpisah |

---

## 5. Keberhasilan Pengujian

| | A | B |
|---|---|---|
| Unit test | 19 lulus | 23 lulus |
| Kriteria yang diuji | V1–V8 (PRD) | AC-001–AC-040 (UX Skill) |
| Hasil | 8/8 Pass | 39 Pass, 1 Not Tested |
| Uji browser | 375 px & 1280 px | 320 px, 375 px & 1280 px; alur S1–S4, T3, P05, P07, kembali dari antrean |

Cakupan uji B lebih luas karena ACCEPTANCE-CRITERIA memberi daftar kriteria yang konkret. Dengan PRD saja, agent menurunkan sendiri skenario uji dari V1–V8.

---

## 6. Jumlah Revisi

| | A | B |
|---|---|---|
| Prompt ulang/koreksi dari pengguna untuk aplikasi | 0 | 0 |
| Perbaikan internal agent sebelum commit | 4 (pencarian menumpuk riwayat, markup daftar, lokasi config preview, lint) | 5 (pemecahan berkas halaman, style inline → token, pengambilan ID pesanan baru, toast tanpa ID PRM, lint) |
| Commit | 1 | 2 (dokumen → aplikasi) |

Detail tiap perbaikan dicatat di CHANGELOG masing-masing repo.

---

## 7. Waktu Pengembangan

Waktu diperkirakan dari stempel waktu berkas dan commit pada 23 November 2026, dalam waktu kerja agent:

| Tahap | A | B |
|---|---|---|
| Menyusun dokumen UX Skill | — | ± 8 menit (UX-SPEC sampai AGENTS.md, commit 19:39) |
| Menulis kode sampai commit | ± 8 menit (19:20 → 19:27) | ± 10 menit (19:40 → 19:49) |
| Uji browser, deploy, pengaturan repo | beberapa menit | beberapa menit |

Angka ini **tidak** memasukkan waktu manusia untuk riset Worksheet 1–12 yang menjadi bahan UX Skill. Di dunia nyata, biaya terbesar Eksperimen B ada pada riset tersebut.

---

## 8. Keterbatasan & Ancaman Validitas

1. **Satu sesi agent untuk A dan B.** Agent sudah membaca Worksheet 8–11 sebelum mengerjakan A. Agent diarahkan memakai PRD saja, tetapi pengetahuan itu bisa memengaruhi A (misalnya pilihan bantuan saat menunggu).
2. **Dokumen UX Skill ditulis oleh agent yang sama** dari worksheet, bukan oleh desainer independen.
3. **Penilaian dilakukan oleh agent/peneliti**, bukan penguji independen. Penilaian A pada AC-001–040 berasal dari inspeksi kode dan uji sebelumnya, bukan sesi uji ulang khusus.
4. **Waktu** adalah perkiraan dari stempel berkas, bukan pengukuran terkontrol.
5. **Belum ada uji pengguna.** Kualitas UX diukur dari kesesuaian terhadap spesifikasi, belum dari perilaku pengguna nyata (direncanakan di Worksheet 13 Usability Testing).

---

## 9. Kesimpulan

- **PRD Only** menghasilkan aplikasi yang **fungsional dan aman secara aturan**, lebih cepat dibuat, tetapi tampilannya generik. Banyak keputusan UX ditebak sendiri oleh agent, dan sebagian tebakan itu tidak sesuai hasil riset.
- **PRD + UX Skill** menghasilkan aplikasi yang **menerapkan hasil riset UX secara langsung**: struktur, istilah, alur, cabang error, dan gaya visual. Cakupan pengujiannya juga lebih terukur (40 kriteria). Biayanya adalah waktu tambahan untuk menyusun dokumen dan kode yang lebih besar.
- Dokumen UX Skill paling berdampak pada **perilaku di kondisi tidak ideal**: hasil belum memadai, data berubah, gagal simpan, dan kembali tanpa kehilangan konteks. Kondisi-kondisi ini tidak tertulis rinci di PRD.

*End of EVALUASI v1.0*
