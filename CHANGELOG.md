# Changelog — Fleffy (Eksperimen B: PRD + UX Skill)

Semua perubahan pada repositori ini dicatat di sini. Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/).

**Kondisi eksperimen**
- **Input dokumentasi:** `README.md` (PRD v1.0, identik dengan Eksperimen A) + `UX-SPEC.md`, `DESIGN-SYSTEM.md`, `INTERACTION-SPEC.md`, `ACCEPTANCE-CRITERIA.md`, dan `AGENTS.md`.
- **AI coding agent:** Claude Code (model Claude Opus 5.5), sama dengan Eksperimen A.
- **Stack:** React 19 + TypeScript + Vite di `apps/web`, Vitest, `localStorage`, GitHub Pages lewat GitHub Actions.
- Kode ditulis ulang dari nol mengikuti dokumen di atas. Tidak ada kode yang disalin dari Eksperimen A.

---

## [0.1.0] — 2026-11-23

### Dokumentasi (commit pertama)
- **UX-SPEC.md:** tujuan UX01–UX06, persona, alur S1–S4, cabang T1–T3/E2/E3/P05/P07, IA N0–N3c, content inventory C01–C16, format ID PSN/BKT/PRM/HAS, spesifikasi per halaman berdasarkan wireframe Worksheet 12 (8 layar utama, 16 layar pendukung), empty state & pencegahan kesalahan.
- **DESIGN-SYSTEM.md:** tema gelap, palet primitif & semantik, pemetaan status → warna, tipografi Roboto, spacing/radius/breakpoint, spesifikasi 15 komponen, aksesibilitas.
- **INTERACTION-SPEC.md:** navigasi & tombol kembali, pemilih peran, validasi form, accordion, minta pemeriksaan, catat hasil (checklist 4 butir), aturan kecukupan hasil, keputusan Teruskan/Tahan, antrean, edge case.
- **ACCEPTANCE-CRITERIA.md:** AC-001 s.d. AC-040 (Given/When/Then, prioritas, metode verifikasi).
- **AGENTS.md:** instruksi agent, arsitektur, aturan implementasi, kebutuhan pengujian, laporan.

### Ditambahkan (aplikasi)
- **Domain** (`src/domain`): ID PSN/BKT/PRM/HAS berurutan (sufiks -B untuk permintaan ulang), snapshot permintaan, keadaan pemeriksaan diturunkan dari data, aturan kecukupan hasil (sumber berwenang + pesanan sama + data terbaru + Sesuai dengan 4 butir cocok), invalidasi data, dan penolakan aksi tidak sah di lapisan logika.
- **N1b Detail Pesanan** dengan 4 accordion: Ringkasan, Pembayaran, Pemeriksaan, Tindak lanjut. Identitas pesanan selalu terlihat. Bagian default terbuka mengikuti keadaan. Keadaan buka/tutup diingat selama sesi.
- **Pemeriksaan:** minta pemeriksaan dengan konteks otomatis (UX06), tampilan menunggu tanpa ETA, formulir hasil untuk Owner/Finance (checklist + kesimpulan + catatan), checklist hasil ✓/✗, permintaan ulang.
- **Tindak lanjut:** tombol Teruskan nonaktif beserta alasannya, *Simpan keputusan Teruskan*, bottom sheet *Tahan untuk klarifikasi* (alasan terpilih otomatis sesuai keadaan), ringkasan keputusan, catatan keputusan (P12).
- **Banner status:** keputusan lanjut tersimpan, keputusan tahan tersimpan, pengiriman/keputusan belum terkonfirmasi (E2/E3), hasil sebelumnya perlu diperbarui (P05).
- **N2 Antrean** dengan filter radio-list (Belum diminta, Menunggu hasil, Hasil tersedia, Keputusan tersimpan) dan jumlah per filter, pencarian, baris konteks per kartu, filter dipertahankan saat kembali.
- **N1 Pesanan** dengan pencarian ID/nama/ID bukti dan empty state P07. **N1a** form buat/ubah dengan validasi, peringatan nominal bukti, peringatan invalidasi, dan konfirmasi buang perubahan.
- **N0 Beranda**, **N3 Bantuan** (N3a arti status, N3b panduan menunggu kontekstual, N3c kontak pemeriksa), **P01 Bukti pembayaran**.
- **Komponen & token:** AppShell (header root/detail, bottom nav), Button, Card, InfoBox, Chip, Accordion, Field, BottomSheet (focus trap, Esc, dialog di ≥ 640 px), Toast, KeyValue, EmptyState. Semua nilai visual berasal dari `tokens.css`.
- **Pemilih peran** Admin/Owner/Finance dan data contoh fiktif PSN-015 s.d. PSN-019 (termasuk dua pesanan bernominal sama Rp150.000).
- **Pengujian:** 23 unit test domain (Vitest).
- **Deploy:** workflow `.github/workflows/deploy.yml` (test, build, deploy ke GitHub Pages).
- **Laporan:** DECISIONS.md (D-01 s.d. D-12), TEST-REPORT.md, COMPLETION-REPORT.md.

### Diperbaiki selama build (iterasi internal agent, sebelum commit aplikasi)
1. Halaman awalnya ditulis dalam satu berkas `Pages.tsx`, lalu dipecah per area sesuai prinsip AGENTS §6. Import yang tidak terpakai dibersihkan.
2. Style inline (`style={{…}}`) diganti dengan kelas utilitas agar semua nilai visual berasal dari token (AC-028).
3. Pembuatan pesanan awalnya membaca ulang `localStorage` untuk mengambil kode PSN baru. Diganti dengan memakai hasil aksi domain secara langsung.
4. Toast permintaan belum menyebut ID PRM seperti di INTERACTION-SPEC §4.2. Diperbaiki menjadi "Permintaan PRM-xxx tercatat untuk {pemeriksa}." (ditemukan saat uji browser).
5. Penulisan `ref` saat render di StoreContext dihapus (peringatan lint `react(refs)`).

### Hasil pengujian
Lihat [TEST-REPORT.md](TEST-REPORT.md): 39 Pass (1 sebagian), 0 Fail, 1 Not Tested (AC-017, Should).
