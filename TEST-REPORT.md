# TEST-REPORT — Eksperimen B (v0.1.0)

**Tanggal:** 23 November 2026 · **Build:** commit rilis v0.1.0
**Lingkungan:** Vitest 3 (Node 24), browser Chromium (panel browser Claude) pada 320×700, 375×812, dan 1280×800.
**Data uji:** data contoh fiktif (PSN-015 sampai PSN-019) dan pesanan baru yang dibuat saat uji.

Unit test: **23/23 lulus** (`apps/web/src/tests/domain.test.ts`).

| ID | Status | Bukti | Catatan |
|---|---|---|---|
| AC-001 Buat pesanan | Pass | Unit test "membuat PSN/BKT berurutan". Browser: form tersimpan, toast, diarahkan ke detail. | |
| AC-002 Validasi | Pass | Unit test validasi (wajib, spasi, 0, waktu masa depan, WA). Browser: fokus ke field invalid pertama. | |
| AC-003 Bukti BKT | Pass | Unit test ID BKT-015. Browser: P01 menampilkan tanggal, waktu, nominal, pengirim. | Gambar bukti tidak diunggah (di luar scope). |
| AC-004 Catatan ≠ dana | Pass | Unit test fundsConfirmed. Browser: chip "Pembayaran tercatat" + teks; "Dana dikonfirmasi" hanya setelah hasil memadai. | |
| AC-005 Identitas terlihat | Pass | Browser: baris "PSN-015 · Bank Transfer · Rp150.000" di luar accordion. | |
| AC-006 Nominal sama | Pass | Unit test PSN-015/016. Browser: kartu antrean berjudul ID · nama. | |
| AC-007 Cari pesanan | Pass | Browser: "PSN-999" → empty state "Pesanan tidak ditemukan" + Hapus pencarian. | |
| AC-008 Ubah setelah pemeriksaan | Pass | Unit test invalidasi. Browser: ubah nominal PSN-017 → peringatan di form, banner "Hasil sebelumnya perlu diperbarui", Teruskan nonaktif. | |
| AC-009 Buang perubahan | Pass | Browser: Batal dengan perubahan → sheet "Buang perubahan?". | |
| AC-010 Minta pemeriksaan | Pass | Unit test snapshot. Browser: toast "Permintaan PRM-015 tercatat untuk Owner.", chip Menunggu hasil. | |
| AC-011 Satu permintaan aktif | Pass | Unit test penolakan permintaan kedua. | |
| AC-012 Menunggu hasil | Pass | Browser: PRM-ID, pemeriksa, waktu, teks "Permintaan tercatat. Hasil belum tersedia.", tautan panduan & kontak, tanpa ETA. | |
| AC-013 Hasil oleh Pemeriksa | Pass | Unit test penolakan Admin. Browser: peran Owner melihat formulir; Admin tidak. | |
| AC-014 Checklist lengkap | Pass | Unit test. Browser: radio Sesuai nonaktif sebelum 4 butir dicentang. | |
| AC-015 Kecukupan hasil | Pass | Unit test resultAdequate + invalidasi. | |
| AC-016 Permintaan ulang | Pass | Unit test PRM-015-B. Browser: PSN-018 → "Minta pemeriksaan ulang" → riwayat permintaan (2). | |
| AC-017 Gagal simpan permintaan | Not Tested | Logika ada (D-08), tetapi kegagalan `localStorage` tidak disimulasikan di browser. | |
| AC-018 Teruskan diblokir | Pass | Unit test. Browser: tombol nonaktif + alasan pada Menunggu (S2), Perlu klarifikasi (T3), data berubah (P05). | |
| AC-019 Simpan Teruskan | Pass | Unit test dasar HAS/PRM. Browser: banner "Keputusan lanjut tersimpan". | |
| AC-020 Tahan | Pass | Unit test. Browser: sheet dengan alasan otomatis terpilih, banner, ringkasan Tahan · HAS-018 · alasan, tetap ada setelah reload. | |
| AC-021 Catatan keputusan | Pass | Browser: P12 menampilkan riwayat dan status "Belum ada keputusan yang berlaku" pada pesanan baru. Ringkasan keputusan (Keputusan, Dasar, Petugas, Waktu) diverifikasi di bagian Tindak lanjut setelah Tahan (PSN-018). | Kartu keputusan di halaman P12 belum dilihat langsung setelah Teruskan. |
| AC-022 Hanya Admin memutuskan | Pass | Unit test. Browser: peran Owner tidak melihat tombol keputusan. | |
| AC-023 Antrean & filter | Pass | Browser: 4 filter dengan jumlah, kartu dengan baris konteks. Owner: banner jumlah permintaan. | |
| AC-024 Kembali mempertahankan konteks | Pass | Browser: antrean `?f=menunggu` → detail (Pemeriksaan terbuka) → ‹ Kembali → `#/pemeriksaan?f=menunggu`. | |
| AC-025 Beranda | Pass | Browser: jumlah per keadaan dapat diklik, kotak "Pisahkan status dan keputusan". | |
| AC-026 Bantuan kontekstual | Pass | Browser: N3b "Konteks tetap tersimpan — PSN · PRM · Pemeriksa", tiga langkah, tanpa janji waktu. | |
| AC-027 Accordion | Pass | Browser: 4 bagian, `aria-expanded`, multi-buka, default sesuai keadaan. | |
| AC-028 Token desain | Pass | Inspeksi: semua nilai di `styles/tokens.css`; tidak ada `style={{}}` inline di komponen. | |
| AC-029 Chip konsisten | Pass | Visual: pemetaan sesuai DESIGN-SYSTEM §2.3. | |
| AC-030 Komponen konsisten | Pass | Visual: tombol 48 px, card, sheet, toast, bottom nav. | |
| AC-031 Navigasi aktif | Pass | Browser: `aria-current="page"` pada item aktif. | |
| AC-032 Feedback | Pass | Browser: toast pada simpan permintaan, hasil, pesanan; banner pada keputusan. | |
| AC-033 Empty states | Pass | Browser: pencarian kosong, filter kosong. | |
| AC-034 Persistence | Pass | Browser: keputusan Tahan tetap ada setelah reload. | |
| AC-035 Responsive | Pass | Browser: 320 px tanpa overflow; 1280 px kolom 560 px terpusat. | Dialog terpusat ≥ 640 px diperiksa lewat CSS, belum lewat screenshot. |
| AC-036 Accessibility | Pass (sebagian) | Label field, fokus terlihat, sheet dengan focus trap + Esc, status berteks. | Belum diuji dengan screen reader. |
| AC-037 Performance | Pass | Bundle JS 84 kB gzip, render instan pada uji lokal. | Belum diukur di jaringan lambat. |
| AC-038 Klik ganda | Pass | Tombol nonaktif saat menyimpan; logika menolak permintaan kedua. | |
| AC-039 Tunai | Pass | Unit test. | |
| AC-040 URL tidak dikenal | Pass | Browser: "Pesanan tidak ditemukan." | |

**Ringkasan:** 39 Pass (1 di antaranya sebagian) · 0 Fail · 1 Not Tested (AC-017, Should Have).
