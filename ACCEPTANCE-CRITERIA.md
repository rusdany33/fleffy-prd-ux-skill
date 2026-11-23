# ACCEPTANCE-CRITERIA — Fleffy: Pemeriksaan Pembayaran Transfer

**Versi:** 1.1 · **Status:** Final untuk Eksperimen B
**Rujukan:** README.md (PRD v1.0) · UX-SPEC.md · DESIGN-SYSTEM.md · INTERACTION-SPEC.md

---

## 1. Purpose
Menetapkan kriteria terukur agar aplikasi (1) memenuhi PRD, (2) mengikuti struktur & alur UX-SPEC, (3) memakai DESIGN-SYSTEM, (4) berperilaku sesuai INTERACTION-SPEC, dan (5) dapat diuji.

## 2. Convention
Setiap kriteria memiliki **ID**, **Priority** (Must / Should / Could), **Verification** (Manual, Automated, Visual, Integration), dan format **Given / When / Then**.
Status hasil uji: **Pass · Fail · Blocked · Not Tested**. Status Pass wajib disertai bukti.

---

## 3. Functional — Pesanan & Pembayaran

**AC-001 Buat pesanan** · Must · Manual, Automated
Given Admin di N1a, When mengisi field wajib valid dan menyimpan, Then pesanan tersimpan dengan ID `PSN-NNN` unik, toast sukses tampil, dan pengguna diarahkan ke N1b dengan bagian Pemeriksaan terbuka.

**AC-002 Validasi field wajib** · Must · Manual, Automated
Given form N1a, When field wajib kosong/tidak valid, Then penyimpanan ditolak, pesan tampil di field terkait, fokus pindah ke field invalid pertama, dan data lain dipertahankan.

**AC-003 Bukti transfer** · Must · Manual, Automated
Given metode Bank Transfer dengan bukti, When tersimpan, Then bukti memiliki ID `BKT-NNN` yang bernomor sama dengan pesanan dan dapat dibuka di P01 beserta tanggal, waktu, nominal, dan pengirim.

**AC-004 Catatan ≠ dana dikonfirmasi (UX01)** · Must · Manual, Automated
Given pesanan transfer tercatat tanpa hasil memadai, Then bagian Pembayaran menampilkan chip "Pembayaran tercatat" dan teks "Pencatatan belum memastikan dana masuk."; kata "Lunas" tidak dipakai; chip "Dana dikonfirmasi" hanya muncul setelah hasil memadai.

**AC-005 Identitas selalu terlihat (UX02)** · Must · Visual
Given N1b, Then baris "PSN-NNN · Metode · Rp…" tampil di kepala halaman di luar accordion.

**AC-006 Dua pesanan nominal sama (UX02)** · Must · Manual, Automated
Given dua pesanan Rp150.000 (PSN-015, PSN-016), Then keduanya dibedakan oleh ID dan nama di daftar, antrean, dan detail; hasil pemeriksaan PSN-015 tidak pernah tampil sebagai hasil PSN-016.

**AC-007 Cari pesanan** · Must · Manual, Automated
Given N1, When mencari ID atau nama pelanggan, Then daftar tersaring; bila kosong tampil empty state "Pesanan tidak ditemukan" dengan tombol *Hapus pencarian*.

**AC-008 Ubah data setelah pemeriksaan** · Must · Automated, Manual
Given pesanan dengan permintaan/hasil, When nominal/pelanggan/metode/bukti diubah, Then form menampilkan peringatan sebelum simpan; setelah simpan hasil lama ditandai kedaluwarsa (banner "Hasil sebelumnya perlu diperbarui"), keputusan lama tidak berlaku, dan *Teruskan* nonaktif.

**AC-009 Buang perubahan** · Should · Manual
Given form ubah dengan perubahan belum disimpan, When menekan Batal/Kembali, Then muncul konfirmasi "Buang perubahan?".

## 4. Functional — Pemeriksaan

**AC-010 Minta pemeriksaan tanpa input ulang (UX06)** · Must · Manual, Automated
Given N1b keadaan Belum diminta, When Admin menekan *Minta pemeriksaan*, Then permintaan `PRM-NNN` dibuat dengan salinan ID pesanan, pelanggan, nominal, dan ID bukti tanpa mengetik ulang; toast sukses tampil; keadaan menjadi Menunggu hasil.

**AC-011 Satu permintaan aktif** · Must · Automated
Given permintaan menunggu hasil, Then tombol minta pemeriksaan tidak tersedia dan logika menolak permintaan kedua.

**AC-012 Menunggu hasil (UX03)** · Must · Manual
Given Menunggu hasil, Then tampil PRM-ID, pemeriksa, waktu kirim, teks "Permintaan tercatat. Hasil belum tersedia.", tautan Panduan saat menunggu dan Kontak pemeriksa; tidak ada ETA.

**AC-013 Catat hasil hanya oleh Pemeriksa** · Must · Manual, Automated
Given peran Owner/Finance dan permintaan aktif, When mengisi checklist dan kesimpulan lalu menyimpan, Then hasil `HAS-NNN` tersimpan dengan nama, peran, waktu. Peran Admin tidak melihat formulir dan logika menolak hasil dari Admin.

**AC-014 Kesimpulan Sesuai butuh checklist lengkap** · Must · Automated
Given formulir hasil, Then pilihan *Sesuai* nonaktif sampai keempat butir dicentang; *Perlu klarifikasi*/*Tidak sesuai* wajib catatan.

**AC-015 Kecukupan hasil (UX05)** · Must · Automated
Hasil dinilai memadai hanya bila: dari peran pemeriksa, untuk permintaan aktif pesanan ini, untuk data terbaru, dan kesimpulan Sesuai dengan 4 butir cocok.

**AC-016 Minta pemeriksaan ulang** · Should · Manual, Automated
Given hasil Perlu klarifikasi/Tidak sesuai, When Admin meminta ulang, Then permintaan baru ber-ID `PRM-NNN-B` dibuat dan permintaan lama tetap di riwayat.

**AC-017 Kegagalan simpan permintaan (E2)** · Should · Manual
Given penyimpanan gagal, Then tidak ada toast sukses, banner "Pengiriman belum terkonfirmasi" tampil dengan tombol *Periksa permintaan*, dan catatan yang diketik tetap ada.

## 5. Functional — Keputusan

**AC-018 Teruskan hanya dengan hasil memadai (UX05)** · Must · Manual, Automated
Given hasil belum ada/belum memadai/kedaluwarsa, Then tombol *Teruskan* nonaktif dengan teks alasan di bawahnya, dan logika menolak keputusan Teruskan.

**AC-019 Simpan keputusan Teruskan** · Must · Manual, Automated
Given hasil memadai, When Admin menekan *Simpan keputusan Teruskan*, Then keputusan tersimpan dengan dasar HAS-ID, PRM-ID, petugas, waktu; banner "Keputusan lanjut tersimpan — Pesanan siap diteruskan ke teknisi." tampil.

**AC-020 Tahan untuk klarifikasi** · Must · Manual, Automated
When Admin memilih *Tahan untuk klarifikasi*, Then bottom sheet meminta alasan (wajib); setelah simpan tampil banner "Keputusan tahan tersimpan" dan ringkasan alasan.

**AC-021 Catatan keputusan** · Should · Manual
Given keputusan tersimpan, When membuka *Lihat catatan keputusan*, Then P12 menampilkan keputusan, dasar, permintaan, petugas, status, dan riwayat lengkap.

**AC-022 Hanya Admin memutuskan** · Must · Automated
Peran pemeriksa tidak melihat tombol keputusan dan logika menolak keputusan dari peran selain Admin.

## 6. Antrean, Beranda, Bantuan

**AC-023 Antrean & filter (UX03)** · Must · Manual, Automated
Given N2, Then filter Belum diminta / Menunggu hasil / Hasil tersedia / Keputusan tersimpan menampilkan jumlah dan daftar yang benar; kartu memuat ID, nama, tagihan, chip, dan baris konteks.

**AC-024 Kembali mempertahankan konteks** · Must · Manual
Given pengguna membuka pesanan dari antrean dengan filter tertentu, When menekan Kembali, Then antrean tampil dengan filter dan pencarian yang sama. Dari N3b/N3c kembali ke pesanan yang sama.

**AC-025 Beranda** · Should · Manual
Then Beranda menampilkan jumlah per keadaan yang dapat diklik ke antrean terfilter, kartu Pesanan, dan kotak "Pisahkan status dan keputusan".

**AC-026 Bantuan kontekstual (UX04)** · Should · Manual
Given dibuka dari pesanan, Then N3b menampilkan "Konteks tetap tersimpan — PSN · PRM · Pemeriksa" dan tiga langkah; N3c menampilkan pemeriksa dan informasi yang harus disampaikan; tidak ada janji waktu.

## 7. UX & Design System

**AC-027 Accordion N1b** · Must · Manual, Visual
Empat bagian (Ringkasan, Pembayaran, Pemeriksaan, Tindak lanjut), header 48 px dengan +/−, `aria-expanded` benar, dapat dibuka bersamaan, default terbuka sesuai keadaan.

**AC-028 Token desain** · Must · Visual
Warna, tipografi, spacing, dan radius hanya memakai token DESIGN-SYSTEM (CSS custom properties). Tema gelap.

**AC-029 Chip status konsisten** · Must · Visual
Pemetaan status → warna mengikuti DESIGN-SYSTEM §2.3; setiap chip berisi teks.

**AC-030 Komponen konsisten** · Must · Visual
Button 48 px (primary/secondary/disabled), card, input, bottom sheet, toast, bottom nav sesuai spesifikasi.

**AC-031 Navigasi aktif** · Must · Manual
Bottom nav menandai halaman aktif (`aria-current`).

**AC-032 Feedback** · Must · Manual
Setiap aksi simpan memberi toast/banner sukses atau error; tombol menampilkan "Menyimpan…" saat proses.

**AC-033 Empty states** · Should · Manual
Pesan dan aksi sesuai tabel UX-SPEC §6.

## 8. Non-Functional

**AC-034 Persistence** · Must · Integration
Data dan keputusan tetap ada setelah muat ulang.

**AC-035 Responsive** · Must · Visual, Manual
Pada 320, 375, 768, 1280 px: tidak ada horizontal overflow; tablet/desktop kolom 560 px terpusat; bottom sheet menjadi dialog di ≥ 640 px.

**AC-036 Accessibility** · Should · Manual
Fungsi utama dapat dioperasikan keyboard, fokus terlihat, field berlabel, error terbaca, status tidak hanya warna.

**AC-037 Performance** · Should · Manual
Halaman tampil < 3 detik pada koneksi wajar; interaksi tanpa jeda terasa.

## 9. Edge Cases

**AC-038 Klik ganda** · Must · Automated — Satu aksi simpan menghasilkan satu objek.
**AC-039 Pesanan tunai** · Should · Manual — Tidak memerlukan pemeriksaan; *Teruskan* dapat disimpan.
**AC-040 URL pesanan tidak dikenal** · Should · Manual — Empty state "Pesanan tidak ditemukan".

## 10. Release Acceptance
Rilis v1.0 diterima bila seluruh **Must** Pass, tidak ada bug kritis, data persisten, dan pengujian otomatis lulus. Should/Could yang belum terpenuhi dicatat sebagai pekerjaan lanjutan di COMPLETION-REPORT.md, tidak diklaim selesai.

## 11. Test Execution Report
Hasil dicatat di `TEST-REPORT.md` dengan kolom: Criteria ID · Status · Evidence · Bug Ref · Notes.

## 12. Kriteria Tambahan v1.1

**AC-041 Terminologi Fleffy** · Must · Visual — Transaksi bernomor `INV-YYMMDD-NNN`, pelanggan berkode `K-n`, menu "Transaksi", chip LUNAS/BELUM LUNAS.
**AC-042 Multi-pembayaran** · Must · Automated, Manual — Satu transaksi dapat memiliki beberapa entri (Cash/Bank Transfer/E-Wallet) ber-ID `BYR-NNN-k`; nominal yang melebihi sisa tagihan ditolak.
**AC-043 Dibayar vs dikonfirmasi** · Must · Automated, Manual — Detail menampilkan "Dibayar X dari Y" dan "Dana dikonfirmasi Z dari Y"; tunai langsung terhitung, non-tunai hanya setelah hasil memadai.
**AC-044 Pemeriksaan per entri** · Must · Automated — Permintaan mencakup semua entri non-tunai yang belum dikonfirmasi; hasil Sesuai mengonfirmasi tepat entri tersebut; entri baru setelahnya kembali *Belum diminta*.
**AC-045 Gerbang Diproses** · Must · Automated, Manual — Antrian → Diproses ditolak bila ada entri non-tunai belum dikonfirmasi atau belum ada pembayaran; diizinkan untuk DP yang sudah dikonfirmasi.
**AC-046 Gerbang Selesai** · Must · Automated — QC → Selesai ditolak bila dana dikonfirmasi < tagihan.
**AC-047 Batalkan entri** · Should · Automated — Hanya entri tunai/belum diminta yang dapat dibatalkan; entri yang sudah diminta/diperiksa ditolak.
**AC-048 Notifikasi peran** · Should · Manual — Owner/Finance melihat notifikasi permintaan yang ditujukan kepadanya; Admin melihat hasil yang masuk; ketuk membuka detail.
**AC-049 Visual Fleffy** · Should · Visual — Tombol utama biru berbentuk pil, FAB "+" untuk Admin.

Pada v1.1, AC-008 (invalidasi) dibaca sesuai INTERACTION-SPEC §11.6; AC-019/AC-020 dibaca sebagai "Teruskan" = Antrian → Diproses, dengan Tahan tetap memakai alasan terstruktur.

*End of ACCEPTANCE-CRITERIA v1.1*
