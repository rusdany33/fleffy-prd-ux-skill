# INTERACTION-SPEC — Fleffy: Pemeriksaan Pembayaran Transfer

**Versi:** 1.0 · **Status:** Final untuk Eksperimen B
**Rujukan:** README.md (PRD) · UX-SPEC.md · DESIGN-SYSTEM.md · Worksheet 10 (User Flow) · Worksheet 12 (prototype route check)

---

## 1. Interaction Principles
1. **Immediate feedback** — setiap aksi menghasilkan perubahan tampilan + toast/banner dalam ≤ 300 ms.
2. **Predictability** — komponen yang sama berperilaku sama di semua halaman.
3. **Error prevention** — aksi tidak sah dinonaktifkan **dan** ditolak di logika.
4. **User control** — keputusan dan pengiriman selalu bisa dibatalkan sebelum disimpan; kembali tidak menghapus konteks.
5. **State consistency** — perubahan langsung tercermin di Beranda, Pesanan, Antrean, Detail, Catatan keputusan.
6. **Persistence** — data tersimpan di penyimpanan browser dan bertahan setelah muat ulang.

## 2. Global Behavior

### 2.1 Navigasi
| Aksi | Perilaku |
|---|---|
| Ketuk item bottom nav | Membuka halaman L0/L1 terkait; item aktif ditandai. |
| ‹ Kembali | Kembali ke halaman asal sesuai riwayat (antrean dengan filter, daftar dengan pencarian, detail dengan accordion yang sama). Bila tidak ada riwayat → halaman induk. |
| Bantuan (header detail) | Membuka N3 Bantuan dengan konteks pesanan (TS2). |
| Buka PSN-xxx dari antrean | Membuka N1b dengan accordion Pemeriksaan terbuka (TS1). |
| Ganti halaman | Scroll ke atas. |

Routing memakai hash (`#/…`) agar bekerja di GitHub Pages.

### 2.2 Pemilih peran (simulasi)
Ketuk "Ari · Admin ▾" di header membuka bottom sheet pilihan peran: **Admin/Kasir**, **Owner (Pemeriksa)**, **Finance (Pemeriksa)**. Memilih peran menutup sheet, menampilkan toast "Masuk sebagai {nama} · {peran}", dan tampilan langsung menyesuaikan hak akses.

### 2.3 Loading, error, persistence
- Operasi simpan memakai **status submit**: tombol berlabel "Menyimpan…" dan nonaktif sampai selesai.
- Bila penyimpanan ke browser gagal: data tidak dianggap tersimpan, tampil banner error sesuai kasus (lihat §8) dan input dipertahankan.
- Bila penyimpanan browser tidak tersedia sama sekali: banner global "Penyimpanan perangkat tidak tersedia. Perubahan tidak akan tersimpan."

## 3. Pencatatan Pesanan (N1a)

### 3.1 Alur
Buka *Buat pesanan* → isi field → *Simpan pesanan* → validasi → simpan → toast "Pesanan PSN-xxx tersimpan." → buka N1b pesanan baru dengan accordion Pemeriksaan terbuka.

### 3.2 Validasi
| Field | Aturan | Pesan |
|---|---|---|
| Nama pelanggan | wajib, ≤ 100 karakter, tidak hanya spasi | "Nama pelanggan wajib diisi." |
| Nomor WhatsApp | opsional; 8–15 digit, boleh diawali + | "Nomor WhatsApp tidak valid." |
| Layanan | wajib | "Pilih layanan." |
| Jumlah pasang | bilangan bulat 1–20 | "Jumlah pasang 1–20." |
| Nominal tagihan | bilangan bulat > 0 | "Nominal tagihan harus lebih dari 0." |
| Metode | wajib | — |
| Bukti: nominal | wajib bila bagian bukti diisi; > 0 | "Nominal pada bukti wajib diisi." |
| Bukti: tanggal & waktu | wajib bila bukti diisi; tidak di masa depan | "Waktu transfer tidak valid." |
| Bukti: pengirim | wajib bila bukti diisi | "Nama pengirim wajib diisi." |
| Catatan | ≤ 500 karakter | "Maksimal 500 karakter." |

Validasi saat submit; setelah submit pertama, field divalidasi ulang saat berubah. Fokus dipindah ke field invalid pertama. Data lain dipertahankan.
Peringatan non-blok: nominal bukti ≠ tagihan → "Nominal pada bukti berbeda dari tagihan. Periksa sebelum meminta pemeriksaan."

### 3.3 Ubah pesanan
Field terisi data saat ini. Jika pesanan sudah punya permintaan/hasil dan pengguna mengubah **nominal, pelanggan, metode, atau bukti**: tampil peringatan sebelum tombol simpan "Perubahan ini membuat permintaan dan hasil pemeriksaan sebelumnya tidak berlaku." Setelah simpan: permintaan/hasil lama ditandai *kedaluwarsa*, keputusan lama tidak berlaku, banner P05 tampil di detail.
Batal/kembali dengan perubahan belum disimpan → bottom sheet "Buang perubahan?" (*Buang* / *Lanjut mengubah*).

## 4. Detail Pesanan (N1b)

### 4.1 Accordion
- Ketuk header → buka/tutup, ikon +/− berganti, `aria-expanded` diperbarui.
- Lebih dari satu bagian boleh terbuka.
- Keadaan buka/tutup per pesanan diingat selama sesi (kembali dari Bantuan/Bukti mempertahankannya).
- Bagian default terbuka mengikuti UX-SPEC §4 N1b.

### 4.2 Minta pemeriksaan (S1, UX03/UX06)
Prasyarat: peran Admin, metode Bank Transfer, tidak ada permintaan aktif tanpa hasil, hasil terakhir bukan *memadai*.
1. Tujuan pemeriksa default **Owner**; dapat diganti (Owner/Finance) dari select.
2. Catatan tambahan opsional (≤ 300 karakter).
3. Ketuk *Minta pemeriksaan* → tombol "Menyimpan…" → buat PRM-xxx dengan **salinan** ID pesanan, pelanggan, nominal, ID bukti (tanpa input ulang).
4. Sukses: toast "Permintaan PRM-xxx tercatat untuk {Owner}.", bagian Pemeriksaan berubah ke *Menunggu hasil*.
5. Gagal simpan (E2): banner "Pengiriman belum terkonfirmasi — Data pesanan dan catatan tetap tersedia. Jangan mengirim ulang sebelum memeriksa permintaan." + tombol *Periksa permintaan* (memuat ulang data; bila permintaan ada → tampilkan, bila tidak → tombol kirim aktif kembali). Catatan yang diketik dipertahankan.

### 4.3 Menunggu hasil (S2, UX04)
- Tampilkan PRM-ID, pemeriksa, waktu kirim, teks "Permintaan tercatat. Hasil belum tersedia."
- Tidak ada ETA. Tidak ada tombol kirim ulang.
- Tautan *Panduan saat menunggu* → N3b dengan konteks; *Kontak pemeriksa* → N3c dengan konteks.
- Tindak lanjut: *Teruskan* nonaktif + alasan "Tunggu hasil yang sesuai dengan pesanan dan data terbaru."

### 4.4 Hasil tersedia — penilaian kecukupan (S3, UX05)
Hasil dinilai **memadai** bila semuanya benar:
1. Dicatat peran pemeriksa (Owner/Finance);
2. Merujuk permintaan aktif pesanan ini (ID pesanan sama);
3. Dibuat untuk data terbaru (nominal & bukti pada permintaan = data pesanan sekarang);
4. Semua butir checklist bernilai cocok dan kesimpulan **Sesuai**.

Memadai → chip "Hasil tersedia" (success), checklist ✓, Pembayaran berubah ke "✓ Dana dikonfirmasi", tombol *Simpan keputusan Teruskan* aktif.
Belum memadai → chip "Perlu klarifikasi"/"Tidak sesuai", butir ✗ ditandai, teks "Hasil belum memenuhi dasar keputusan untuk data terbaru.", *Teruskan* nonaktif, *Tahan untuk klarifikasi* tersedia, *Minta pemeriksaan ulang* tersedia (PRM-xxx-B).

## 5. Catat Hasil Pemeriksaan (peran Owner/Finance)
Tampil di bagian Pemeriksaan bila peran pemeriksa dan ada permintaan aktif tanpa hasil.
1. Konteks: "PRM-015 · PSN-015 · Rp150.000 · BKT-015 (pengirim, waktu)".
2. Checklist 4 butir (checkbox, default kosong):
   - Identitas pesanan dan bukti sesuai
   - Nominal sesuai: Rp150.000
   - Waktu transfer cocok dengan data bukti
   - Dana diterima menurut mutasi rekening
3. Kesimpulan (segmented): **Sesuai** (hanya aktif bila 4 butir dicentang) · **Perlu klarifikasi** · **Tidak sesuai**.
4. Catatan: wajib untuk Perlu klarifikasi/Tidak sesuai.
5. *Simpan hasil* → HAS-xxx tercatat dengan nama & peran pemeriksa + waktu. Toast "Hasil HAS-xxx tersimpan." Keadaan → Hasil tersedia.
Admin tidak pernah melihat formulir ini.

## 6. Keputusan Tindak Lanjut (S3–S4, T3)

### 6.1 Simpan keputusan Teruskan
Prasyarat: hasil memadai. Ketuk → "Menyimpan…" → keputusan tersimpan (dasar HAS-ID, permintaan PRM-ID, petugas, waktu) → banner success **"Keputusan lanjut tersimpan — Pesanan siap diteruskan ke teknisi."** → bagian Tindak lanjut menampilkan ringkasan keputusan + *Lihat catatan keputusan*.
Gagal simpan (E3): banner "Keputusan belum terkonfirmasi — Periksa catatan untuk mengetahui apakah keputusan sudah tersimpan." + tombol *Periksa catatan keputusan*. Pilihan tetap tersedia. Tidak tampil sukses.

### 6.2 Tahan untuk klarifikasi
Ketuk → bottom sheet "Tahan pesanan PSN-xxx?":
- Alasan (radio, wajib): *Hasil belum tersedia* · *Hasil belum memadai / perlu klarifikasi* · *Data pesanan atau bukti perlu dicek* · *Lainnya*.
- Catatan (wajib bila *Lainnya*).
- *Simpan keputusan Tahan* (primary) · *Batal* (secondary).
Sukses → banner warning "Keputusan tahan tersimpan — PSN-xxx menunggu klarifikasi. Pesanan belum siap diteruskan." Ringkasan: Keputusan Tahan, Dasar (HAS-ID bila ada), Alasan; tombol *Kontak pemeriksa*.

### 6.3 Aturan
- Hanya Admin yang mencatat keputusan.
- Keputusan baru menggantikan tampilan keputusan sebelumnya; semua tetap ada di riwayat.
- Keputusan Teruskan tidak berlaku lagi bila data pesanan berubah (§3.3).

## 7. Antrean Pemeriksaan (N2)
- Filter radio-list; ketuk → daftar & subjudul berganti, URL diperbarui (`?f=`), jumlah per filter diperbarui langsung.
- Cari ID pesanan/pelanggan: menyaring dalam filter aktif.
- Urutan: permintaan/pesanan terlama di atas (yang menunggu paling lama terlihat dulu).
- Buka PSN → N1b dengan Pemeriksaan terbuka; kembali → filter & pencarian sama.
- Filter kosong → empty state + *Lihat semua keadaan*.

## 8. Feedback & Edge Cases

| Kasus | Perilaku |
|---|---|
| Klik ganda tombol simpan | Satu operasi saja (tombol nonaktif saat menyimpan). |
| Dua pesanan nominal sama | Kartu & detail selalu menampilkan ID + nama; hasil hanya menempel pada PRM pesanan itu (P16: "Hasil untuk PSN-015 tidak digunakan bagi pesanan ini"). |
| Data berubah setelah hasil | Hasil kedaluwarsa, banner P05, *Teruskan* nonaktif. |
| Pesanan tunai | Bagian Pemeriksaan menampilkan "Pembayaran tunai tidak memerlukan pemeriksaan transfer."; *Simpan keputusan Teruskan* aktif. |
| Muat ulang | Semua data dan keputusan tetap ada. |
| ID pesanan tidak ada di URL | Empty state "Pesanan tidak ditemukan." |
| Toast | Sukses/info 4 detik; error tetap tampil sebagai banner di konteks, bukan hanya toast. |

## 9. Responsive Interaction
- **Mobile:** layout penuh, bottom sheet dari bawah, bottom nav tetap.
- **Tablet/Desktop:** kolom 560 px terpusat, bottom sheet menjadi dialog terpusat; hover state pada kartu & tombol.
- Tidak ada horizontal overflow pada 320 px.

## 10. Interaction Completion Rules
Interaksi selesai bila: aksi diproses, data tersimpan, tampilan mencerminkan kondisi terbaru di semua halaman, pengguna menerima umpan balik, tidak ada duplikasi, dan kegagalan dapat dipahami serta dipulihkan.

*End of INTERACTION-SPEC v1.0*
