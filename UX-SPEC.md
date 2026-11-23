# UX-SPEC — Fleffy: Pemeriksaan Pembayaran Transfer

**Versi:** 1.0 · **Status:** Final untuk Eksperimen B · **Tanggal:** 23 November 2026
**Rujukan:** README.md (PRD v1.0) · DESIGN-SYSTEM.md · INTERACTION-SPEC.md · ACCEPTANCE-CRITERIA.md
**Sumber riset:** Worksheet 6 (Persona), 7 (Journey), 8 (UX Requirements), 9 (Information Architecture), 10 (User Flow), 11 (Crazy 8, konsep terpilih), 12 (Wireframe & Prototype) di [rusdany33/rekayasa-interaksi](https://github.com/rusdany33/rekayasa-interaksi).

---

## 1. UX Overview & Objectives

### 1.1 Tujuan pengalaman
Admin Fleffy (Ari) harus dapat memutuskan **Teruskan** atau **Tahan** untuk satu pesanan Bank Transfer berdasarkan **hasil pemeriksaan berwenang untuk pesanan yang sama dan data terbaru**, tanpa berpindah ke chat dan tanpa salah membaca "pembayaran tercatat" sebagai "dana masuk".

### 1.2 Kebutuhan UX (dari Worksheet 8)

| ID | Kebutuhan UX | Prioritas | Urutan |
|---|---|---|---|
| UX01 | Ari dapat membedakan pembayaran tercatat dan penerimaan yang sudah diperiksa tanpa petunjuk. | Must | 4 |
| UX02 | Ari dapat mencocokkan bukti dan hasil dengan pesanan yang tepat, termasuk dua pesanan bernominal sama. | Must | 3 |
| UX03 | Ari dapat menyebut pemeriksa dan mengetahui apakah hasil sudah tersedia atau masih ditunggu, tanpa menganggap permintaan sebagai penerimaan dana. | Must | 2 |
| UX04 | Ari dapat memilih tindak lanjut sesuai prosedur saat hasil belum tersedia, tanpa menjanjikan waktu atau hasil. | Should | 5 |
| UX05 | Ari menentukan tindak lanjut berdasarkan hasil yang sesuai untuk pesanan yang sama; tanpa hasil memadai, ia menahan. | Must | 1 |
| UX06 | Ari dapat meneruskan konteks pesanan ke pemeriksaan tanpa mengetik ulang identitas dan nominal. | Should | 6 |

### 1.3 Prinsip UX proyek
1. **Catatan ≠ kepastian.** Label pembayaran tidak pernah menyiratkan dana masuk. Kepastian hanya muncul dari hasil pemeriksa.
2. **Satu konteks pesanan.** Pembayaran, bukti, permintaan, hasil, dan keputusan berada di satu halaman Detail Pesanan (N1b).
3. **Identitas selalu terlihat.** ID pesanan, metode, dan nominal tampil di kepala halaman dan tidak tersembunyi di accordion.
4. **Tidak ada janji waktu.** Aplikasi tidak menampilkan ETA, persentase progres, atau hitung mundur pemeriksaan.
5. **Aksi yang belum sah dinonaktifkan dengan alasan.** Tombol *Teruskan* nonaktif disertai teks penjelasan di bawahnya, bukan disembunyikan.
6. **Kembali tanpa kehilangan konteks.** Kembali dari Bantuan atau Antrean mempertahankan pesanan, bagian accordion, dan filter asal.

---

## 2. User Scenarios & User Journey

### 2.1 Persona
**Ari**, 20–22 tahun, admin operasional merangkap kasir. Menggunakan smartphone. Tidak memiliki akses rekening usaha. Pemeriksa: **Owner** (utama) atau **Finance**.

### 2.2 Skenario utama (S1–S4, Worksheet 10/12)
Pesanan PSN-015, *deep cleaning* dua pasang, Bank Transfer Rp150.000, bukti BKT-015 dari WhatsApp.

| Langkah | Keadaan | Layar acuan |
|---|---|---|
| S1 | Pesanan sudah tercatat, pemeriksaan **belum diminta**. Ari meminta pemeriksaan ke Owner; data pesanan dipakai ulang. | 03 Detail / belum diminta |
| S2 | Permintaan PRM-015 tercatat, **menunggu hasil**. *Teruskan* nonaktif. Ari dapat membuka Panduan saat menunggu atau Kontak pemeriksa. | 04 Detail / menunggu |
| — | Owner memasukkan hasil HAS-015. Antrean menampilkan PSN-015 pada **Hasil tersedia**. | 05 Antrean / hasil tersedia |
| S3 | Ari membaca hasil **memadai** (sumber berwenang, pesanan sama, data terbaru, semua butir cocok), lalu menyimpan keputusan **Teruskan**. | 06 Detail / hasil memadai |
| S4 | Keputusan tersimpan dan terkonfirmasi. Pesanan siap diteruskan ke teknisi. | 07 Keputusan tersimpan |

### 2.3 Cabang dan akhir sementara

| Kode | Kondisi | Perilaku | Layar acuan |
|---|---|---|---|
| T1 | Bukti belum jelas atau perlu klarifikasi data sebelum permintaan | Tombol *Minta pemeriksaan* tetap bisa dipakai setelah bukti ditinjau; *Teruskan* nonaktif | P02 |
| T2 | Hasil masih ditunggu | Panduan menunggu, kontak pemeriksa, *Teruskan* nonaktif | 04, 08 |
| T3 | Hasil tersedia tetapi **belum memadai** (Tidak sesuai / Perlu klarifikasi) | *Teruskan* nonaktif; tersedia *Tahan untuk klarifikasi* | P04, P08 |
| E2 | Pengiriman permintaan tidak pasti (gagal simpan) | Pesan "belum terkonfirmasi", data tetap ada, tombol *Periksa permintaan* sebelum kirim ulang | P03 |
| E3 | Penyimpanan keputusan tidak pasti | Pesan "belum terkonfirmasi", *Periksa catatan keputusan* | P06 |
| — | Data pesanan berubah setelah hasil diberikan | Hasil lama ditandai **perlu diperbarui**, tidak dapat menjadi dasar keputusan | P05 |
| — | Pencarian tanpa hasil | Empty state "Pesanan tidak ditemukan" + *Hapus pencarian* | P07 |

### 2.4 Journey ringkas (Worksheet 7)
T1 Terima pesanan & bukti → T2 Catat pesanan & pembayaran → T3 Cocokkan → T4 Minta pemeriksaan → T5 Menunggu → T6 Keputusan.
Fitur ini menangani T2 (pencatatan) sampai T6. Proses cuci dan pengantaran di luar cakupan.

---

## 3. Information Architecture & Sitemap

### 3.1 Struktur halaman (Worksheet 9)

```
N0 Beranda
├── N1 Pesanan
│   ├── N1a Buat Pesanan
│   └── N1b Detail Pesanan  ← halaman kanonis satu pesanan
│        ├─ bagian Ringkasan pesanan
│        ├─ bagian Pembayaran   → P01 Bukti pembayaran
│        ├─ bagian Pemeriksaan
│        └─ bagian Tindak lanjut → P12 Catatan keputusan
├── N2 Pemeriksaan Pembayaran (antrean)
└── N3 Bantuan Pemeriksaan
     ├── N3a Arti Status Pembayaran
     ├── N3b Panduan saat Menunggu
     └── N3c Kontak Pemeriksa
```

### 3.2 Navigasi
- **Navigasi global (bottom navigation, 4 item):** Beranda · Pesanan · Pemeriksaan · Bantuan. Item aktif diberi latar dan label tebal.
- **H2:** N1 → N1a (Buat Pesanan) atau N1b (pilih pesanan).
- **TS1:** N2 → N1b dengan accordion **Pemeriksaan** terbuka. Saat kembali, filter dan pencarian antrean dipertahankan.
- **TS2:** N1b → N3a/N3b/N3c (bantuan kontekstual). Saat kembali, pesanan dan bagian accordion asal dipertahankan.
- **NH1:** perpindahan antarbagian N1b tidak membuat salinan pesanan.
- Halaman tingkat L2 (N1a, N1b, P01, P12, N3a–c) memakai header **‹ Kembali** dan tautan **Bantuan**; halaman L0/L1 memakai header **FLEFFY** + identitas pengguna.

### 3.3 Content inventory (C01–C16)

| ID | Konten | Lokasi | Prioritas |
|---|---|---|---|
| C01 | Ringkasan identitas pesanan & tagihan | N1b Ringkasan | Must |
| C02 | Catatan pembayaran & penjelasan maknanya | N1b Pembayaran | Must |
| C03 | Rujukan bukti pelanggan & pembanding | N1b Pembayaran, P01 | Must |
| C04 | Permintaan pemeriksaan dengan rujukan pesanan | N1b Pemeriksaan | Must |
| C05 | Hasil pemeriksaan beserta sumber & rujukan | N1b Pemeriksaan | Must |
| C06 | Dasar keputusan & catatan tindak lanjut | N1b Tindak lanjut | Must |
| C07 | Antrean dengan keadaan & penanggung jawab | N2 | Must |
| C08 | Daftar & pencarian pesanan berdasarkan identitas | N1 | Must |
| C09 | Pencatatan pelanggan, layanan, nominal | N1a | Should |
| C10 | Pemanfaatan ulang konteks saat meminta pemeriksaan | N1b Pemeriksaan | Should |
| C11 | Panduan arti status | N3a | Should |
| C12 | Panduan tindak lanjut saat menunggu | N3b | Should |
| C13 | Kontak pemeriksa | N3c | Should |
| C14 | Ringkasan Beranda & pintasan | N0 | Should |
| C15 | Jejak permintaan, hasil, keputusan | N1b, P12 | Must |
| C16 | Penyaringan antrean menurut keadaan | N2 | Should |

### 3.4 Identitas data
Setiap objek memiliki ID yang terlihat dan saling merujuk dengan nomor urut yang sama per pesanan:

| Objek | Format | Contoh |
|---|---|---|
| Pesanan | `PSN-NNN` | PSN-015 |
| Bukti pembayaran | `BKT-NNN` | BKT-015 |
| Permintaan pemeriksaan | `PRM-NNN` (+ huruf urut bila ulang: PRM-015-B) | PRM-015 |
| Hasil pemeriksaan | `HAS-NNN` (+ huruf urut bila ulang) | HAS-015 |

---

## 4. Page Specifications & User Flows

> Konsep terpilih Worksheet 11: **Ringkasan bertingkat (accordion)** pada N1b. Identitas pesanan, nominal, ringkasan hasil, dan alasan aksi nonaktif selalu terlihat. Lebih dari satu bagian boleh terbuka bersamaan.

### N0 Beranda (layar 01)
- Header: **FLEFFY** · "Ari · Admin" (pemilih peran).
- Judul "Beranda", sapaan "Halo, {nama}", subjudul "Periksa pembayaran sebelum pesanan diteruskan."
- Kartu **Pemeriksaan pembayaran**: jumlah per keadaan (Belum diminta, Menunggu hasil, Hasil tersedia) yang masing-masing membuka N2 dengan filter itu, serta tombol utama *Buka pemeriksaan*.
- Kartu **Pesanan laundry sepatu**: "Temukan pesanan melalui ID atau nama pelanggan." Tombol sekunder *Lihat pesanan* dan *Buat pesanan*.
- Kotak info **Pisahkan status dan keputusan**: "Pembayaran tercatat belum memastikan dana masuk. Gunakan hasil pemeriksa yang berwenang."
- Tautan **Bantuan pemeriksaan**.

### N1 Pesanan (layar 02, P07)
- Kartu **Cari pesanan**: input "Cari ID / nama pelanggan" + tombol *Cari*. Pencarian juga berjalan saat mengetik.
- Daftar kartu pesanan: judul "PSN-015 · Pelanggan A", baris "Laundry sepatu · Bank Transfer", "Tagihan Rp150.000", chip keadaan pemeriksaan, tombol sekunder *Buka PSN-015*.
- Dua pesanan bernominal sama **wajib** dibedakan oleh ID dan nama pelanggan pada judul kartu.
- Empty state (P07): "Pesanan tidak ditemukan — Tidak ada hasil untuk "{kata}". Periksa ID atau nama pelanggan, lalu coba kembali." + kartu "Coba pencarian lain" dengan tombol *Hapus pencarian*.
- Tombol *+ Buat pesanan* (hanya peran Admin).

### N1a Buat Pesanan
Form satu kolom: Nama pelanggan*, Nomor WhatsApp, Layanan*, Jumlah pasang*, Nominal tagihan*, Metode pembayaran* (Bank Transfer/Tunai), Catatan. Bila Bank Transfer: bagian **Bukti pelanggan** (nominal pada bukti*, tanggal & waktu transfer*, nama pengirim*, keterangan). Teks bantuan di bawah metode transfer: "Pencatatan pembayaran belum memastikan dana masuk."
Setelah tersimpan, pengguna diarahkan ke N1b pesanan baru dengan accordion **Pemeriksaan** terbuka (lanjutan alami ke S1, UX06).

### N1b Detail Pesanan (layar 03, 04, 06, 07, P02–P06, P08, P15, P16)
**Kepala halaman (selalu terlihat):** "‹ Kembali" · "Bantuan"; judul "Detail pesanan"; baris identitas **"PSN-015 · Bank Transfer · Rp150.000"**. Di bawahnya slot **banner status** (sukses/peringatan/error) bila ada.

**Accordion (4 bagian, header 48 px, ikon + / −):**

1. **Ringkasan pesanan** — ID pesanan, Pelanggan, Layanan, Metode, Tagihan, Dibuat. Teks bantu: "Gunakan identitas pesanan dan bukti untuk mencocokkan pembayaran; nominal saja tidak cukup." Tombol *Ubah pesanan* (Admin).
2. **Pembayaran** — chip **"Pembayaran tercatat"** + teks "Pencatatan belum memastikan dana masuk." (atau chip **"Dana dikonfirmasi"** + "Menurut hasil {Owner} {HAS-ID}" bila hasil memadai). Tautan *Lihat bukti BKT-015* → P01. Bila bukti tidak ada: "Belum ada bukti transfer."
3. **Pemeriksaan** — isi bergantung keadaan:
   - *Belum diminta:* chip "Belum diminta"; "Tujuan pemeriksa: Owner" (dapat diganti); teks "Identitas, nominal dan bukti mengikuti pesanan ini."; input *Catatan tambahan (opsional)*; tombol utama *Minta pemeriksaan*.
   - *Menunggu hasil:* chip "Menunggu hasil"; Permintaan PRM-015; Pemeriksa Owner; Dikirim {waktu}; teks **"Permintaan tercatat. Hasil belum tersedia."**; tautan *Panduan saat menunggu* (N3b) dan *Kontak pemeriksa* (N3c).
   - *Hasil tersedia — memadai:* chip "Hasil tersedia"; Sumber berwenang: Owner; Hasil / permintaan: HAS-015 / PRM-015; "Untuk PSN-015 · data terbaru"; daftar centang 4 butir pemeriksaan.
   - *Hasil tersedia — belum memadai:* chip "Perlu klarifikasi" atau "Tidak sesuai"; butir yang tidak cocok ditandai ✗; catatan pemeriksa; teks "Penerimaan untuk pesanan ini belum dapat dipastikan."; tombol *Minta pemeriksaan ulang*.
   - *Hasil kedaluwarsa (P05):* banner "Hasil sebelumnya perlu diperbarui — HAS-015 dibuat untuk data sebelumnya." + tombol *Tinjau data pembayaran*; keadaan kembali ke Belum diminta.
   - *Peran Pemeriksa:* formulir **Catat hasil pemeriksaan** (lihat INTERACTION-SPEC §5).
4. **Tindak lanjut** —
   - Belum memadai: tombol *Teruskan* **nonaktif** dengan alasan di bawahnya (mis. "Tunggu hasil yang sesuai dengan pesanan dan data terbaru."). Bila hasil sudah ada tapi belum memadai: tombol sekunder *Tahan untuk klarifikasi*.
   - Memadai: "Dasar keputusan: HAS-015"; tombol utama *Simpan keputusan Teruskan*; tombol sekunder *Tahan untuk klarifikasi*.
   - Tersimpan (S4): Keputusan, Dasar, Petugas, Waktu; teks "Status ini mencatat keputusan. Pesanan belum dinyatakan selesai dikerjakan."; tombol *Lihat catatan keputusan* → P12.

**Bagian default terbuka** mengikuti keadaan: belum diminta → Pembayaran + Pemeriksaan + Tindak lanjut; menunggu → Pemeriksaan + Tindak lanjut; hasil tersedia → Pemeriksaan + Tindak lanjut; keputusan tersimpan → Tindak lanjut. Datang dari antrean (TS1) → Pemeriksaan terbuka.

### P01 Bukti pembayaran
Header kembali. Kotak konteks "Terkait PSN-015 · BKT-015 · Bank Transfer · Rp150.000". Kartu **Pratinjau bukti** (placeholder berlabel "Data contoh — gambar bukti belum disertakan"), Tanggal bukti, Waktu bukti, Nominal bukti, Pengirim, Keterangan. Bila nominal bukti ≠ tagihan: peringatan. Tombol *Kembali ke pesanan*.

### N2 Pemeriksaan Pembayaran (layar 05, P13, P14)
- Kartu **Cari pemeriksaan**: input "Cari ID pesanan".
- Daftar filter berbentuk radio-list: **Belum diminta · Menunggu hasil · Hasil tersedia** (+ "Keputusan tersimpan" untuk arsip). Jumlah per filter ditampilkan.
- Subjudul sesuai filter, lalu kartu pesanan: "PSN-015 · Pelanggan A", "Laundry sepatu · Bank Transfer", Tagihan, chip keadaan, baris konteks (mis. "PRM-015 · Owner · hasil belum tersedia." / "Owner · HAS-015. Baca isi hasil sebelum mengambil keputusan."), tombol *Buka PSN-015*.
- Peran Pemeriksa: filter default **Menunggu hasil**, banner jumlah permintaan yang ditujukan kepadanya.

### N3 Bantuan Pemeriksaan (P09) · N3a (P10) · N3b (layar 08) · N3c (P11)
- **N3**: tiga kartu (Arti status pembayaran, Panduan saat menunggu, Kontak pemeriksa) dengan tombol *Buka panduan*.
- **N3a**: kartu per istilah: Pembayaran tercatat · Menunggu hasil · Hasil tersedia · Keputusan lanjut tersimpan, plus kartu *Kembali*.
- **N3b**: bila dibuka dari pesanan, kotak "Konteks tetap tersimpan — PSN-015 · PRM-015 · Owner". Tiga langkah bernomor: 1) Pastikan permintaan tercatat, 2) Hubungi pemeriksa yang ditetapkan, 3) Jelaskan status kepada pelanggan. Kartu Tindak lanjut: *Kontak pemeriksa* (utama), *Kembali ke pemeriksaan* (sekunder).
- **N3c**: kotak konteks permintaan; kartu "Pemeriksa yang ditetapkan" (peran, nama, kanal); kartu "Informasi yang disampaikan" (sertakan ID pesanan, ID permintaan, nominal); *Kembali ke pemeriksaan*.

### P12 Catatan keputusan
Kotak "Catatan ditemukan — Keputusan untuk PSN-015 sudah tersimpan." Kartu PSN-015: Keputusan, Dasar hasil, Permintaan, Petugas, Status (Tersimpan), Waktu. Riwayat lengkap pesanan (permintaan, hasil, keputusan, perubahan data). Tombol *Kembali ke detail*.

---

## 5. UX Requirements & Guidelines

| Pedoman | Penerapan |
|---|---|
| Bahasa | Bahasa Indonesia, kalimat pendek, kata kerja aktif pada tombol ("Minta pemeriksaan", bukan "Kirim"). |
| Istilah tetap | *Pembayaran tercatat*, *Belum diminta*, *Menunggu hasil*, *Hasil tersedia*, *Perlu klarifikasi*, *Tidak sesuai*, *Dana dikonfirmasi*, *Teruskan*, *Tahan*. Tidak memakai "Lunas" untuk transfer. |
| Status bukan hanya warna | Setiap chip memuat teks; warna hanya penguat. |
| Aksi utama | Maksimal satu tombol utama (primary) per bagian. |
| Target sentuh | ≥ 48 px untuk tombol dan header accordion. |
| Peran | Admin: catat pesanan, minta pemeriksaan, keputusan. Owner/Finance: catat hasil. Kontrol yang bukan haknya tidak ditampilkan; diganti teks "Dicatat oleh Admin/Pemeriksa". |
| Data contoh | Ditandai label **Contoh**; Beranda menyediakan *Muat ulang data contoh*. |

## 6. Empty States & Error Prevention

| Halaman | Kondisi | Pesan | Aksi |
|---|---|---|---|
| N1 | Belum ada pesanan | "Belum ada pesanan yang tercatat." | Buat pesanan |
| N1 | Pencarian kosong | "Pesanan tidak ditemukan" | Hapus pencarian |
| N2 | Filter kosong | "Tidak ada pesanan pada keadaan ini." | Lihat semua keadaan |
| N1b | ID tidak dikenal | "Pesanan tidak ditemukan." | Kembali ke Pesanan |
| N1b Pembayaran | Tanpa bukti | "Belum ada bukti transfer." | Ubah pesanan |

**Pencegahan kesalahan:**
- *Teruskan* nonaktif sampai hasil memadai; logika menolak meskipun tombol dipaksa.
- Permintaan ganda dicegah: tombol *Minta pemeriksaan* nonaktif saat menyimpan dan tidak tersedia selama ada permintaan aktif.
- Perubahan nominal/pelanggan/bukti setelah permintaan → peringatan di form sebelum simpan, lalu hasil lama ditandai kedaluwarsa.
- Kembali dari form dengan perubahan belum disimpan → konfirmasi "Buang perubahan?".

*End of UX-SPEC v1.0*
