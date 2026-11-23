> **Eksperimen B — PRD + UX Skill** · Aplikasi dibangun AI coding agent dari PRD di bawah **ditambah** dokumen UX Skill: [UX-SPEC.md](UX-SPEC.md), [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md), [INTERACTION-SPEC.md](INTERACTION-SPEC.md), [ACCEPTANCE-CRITERIA.md](ACCEPTANCE-CRITERIA.md), dan instruksi agent [AGENTS.md](AGENTS.md).
> Aplikasi: [`apps/web`](apps/web) · Demo: https://rusdany33.github.io/fleffy-prd-ux-skill/ · Riwayat perubahan: [CHANGELOG.md](CHANGELOG.md) · Perbandingan A vs B: [EVALUASI.md](EVALUASI.md)
>
> **v0.2.0** (setelah eksperimen): prototipe diselaraskan dengan aplikasi Fleffy asli — nota INV, multi-pembayaran, status pengerjaan, dan pemisahan LUNAS tercatat vs dana dikonfirmasi. Lihat UX-SPEC §7 dan CHANGELOG.
>
> Menjalankan lokal: `cd apps/web && npm install && npm run dev` · Test: `npm test`

# PRD — Fleffy: Pemeriksaan Pembayaran Transfer

**Produk:** Fleffy — Kasir Laundry Sepatu
**Fitur:** Pemeriksaan Pembayaran Transfer sebelum Pesanan Diteruskan ke Teknisi
**Versi:** 1.0 · **Status:** Final untuk Eksperimen · **Tanggal:** 23 November 2026
**Penyusun:** Rusdany Maestro · NIM 202210370311406 · Informatika, Universitas Muhammadiyah Malang
**Mata kuliah:** Rekayasa Interaksi

> Dokumen ini adalah satu-satunya acuan kebutuhan produk. Isinya disintesis dari Worksheet 3, 5, 6, 7, dan 8 pada repositori [rusdany33/rekayasa-interaksi](https://github.com/rusdany33/rekayasa-interaksi). Bagian yang berupa asumsi atau usulan ditandai secara eksplisit.

---

## 1. Product Overview

### 1.1 Latar Belakang

Fleffy adalah aplikasi kasir toko laundry sepatu untuk mencatat pesanan, layanan, dan pembayaran. Pada pembayaran Bank Transfer, status **Lunas** di aplikasi hanya berarti pembayaran **sudah dicatat** oleh kasir. Status itu belum memastikan bahwa dana benar-benar masuk ke rekening usaha.

Fleffy tidak terhubung ke bank. Kepastian penerimaan dana diperoleh dari pemeriksaan mutasi rekening, biasanya lewat mobile banking, oleh pihak yang berwenang (owner atau finance). Admin yang merangkap kasir tidak memiliki akses rekening. Ia harus:

1. mencocokkan catatan Fleffy dengan bukti transfer di WhatsApp pelanggan,
2. meminta owner atau finance memeriksa rekening lewat chat atau telepon,
3. menunggu balasan, lalu
4. memutuskan apakah pesanan boleh diteruskan ke teknisi.

Informasi tersebar di tiga sumber (Fleffy, chat pelanggan, chat pemeriksa). Penantian konfirmasi membuat admin cemas dan dapat menunda pelayanan.

### 1.2 Product Vision

Menyediakan satu tempat di Fleffy untuk menghubungkan pesanan, pembayaran, permintaan pemeriksaan, hasil pemeriksaan, dan keputusan tindak lanjut. Dengan begitu, admin dapat meneruskan pesanan ke teknisi berdasarkan hasil pemeriksaan yang sah, bukan berdasarkan label pembayaran.

### 1.3 Target Pengguna

| Peran | Tanggung jawab | Hubungan dengan pemeriksaan |
|---|---|---|
| **Admin / Kasir** (pengguna utama) | Mencatat pesanan dan pembayaran, meminta pemeriksaan, mencatat keputusan | Tidak memiliki akses rekening; menunggu hasil dari pemeriksa |
| **Pemeriksa** (Owner atau Finance) | Memeriksa mutasi rekening, memberikan hasil pemeriksaan | Pihak berwenang yang menentukan apakah dana diterima |
| **Teknisi** | Mengerjakan pesanan | Hanya menerima pesanan yang sudah diputuskan *Teruskan* |

### 1.4 Skenario Acuan

Pelanggan memesan *deep cleaning* dua pasang sepatu melalui WhatsApp dan mengirim bukti transfer Rp150.000. Ari (admin) mencatat pesanan dan meminta owner memeriksa rekening. Setelah hasil pemeriksaan tersedia dan sesuai, Ari meneruskan pesanan ke teknisi.

---

## 2. User Problem

Berdasarkan wawancara R1–R3 (Worksheet 5), Empathy Map (Worksheet 6), dan User Journey (Worksheet 7):

| Kode | Masalah | Dasar riset |
|---|---|---|
| **M1** | **Penantian konfirmasi pihak lain.** Respons pemeriksa bisa lambat. Admin cemas, dan pelayanan atau pengerjaan ikut tertunda. | R2 Q8–Q11 |
| **M2** | **Informasi pembayaran tersebar.** Admin berpindah antara Fleffy, bukti di chat pelanggan, dan chat pemeriksa. | R2 Q4–Q8 |
| **M3** | **Catatan pembayaran bukan dasar kepastian.** Status Lunas tidak menjamin dana diterima, dan pengguna memahaminya secara berbeda. | R1–R3 Q7 |
| **M4** | **Keputusan bergantung pada konfirmasi berwenang.** Pesanan baru boleh diteruskan setelah ada konfirmasi dari owner atau finance. | R2 Q3, Q8; R3 Q8 |

**Problem Statement**
Admin Fleffy membutuhkan cara untuk menghubungkan pesanan, bukti pembayaran, dan hasil pemeriksaan rekening dalam satu konteks pesanan. Tujuannya agar admin dapat berkoordinasi dengan pemeriksa saat menunggu dan meneruskan pesanan ke teknisi hanya berdasarkan hasil pemeriksaan yang sah.

---

## 3. User Persona

**Nama:** Ari (nama samaran R2) · **Usia:** 20–22 tahun · **Peran:** Admin operasional yang merangkap kasir

**Karakteristik**
- Mencatat pesanan, layanan, dan pembayaran di Fleffy setiap hari.
- Menerima pesanan dan bukti transfer melalui WhatsApp.
- Tidak memiliki akses rekening usaha, sehingga harus meminta owner atau finance memeriksa mutasi.
- Menilai input pesanan dan nota di Fleffy sudah lancar.

**Goals**
- Mengetahui pembayaran mana yang sudah dipastikan dananya.
- Mencocokkan bukti dan hasil pemeriksaan dengan pesanan yang benar.
- Mengetahui siapa yang memeriksa dan apakah hasilnya sudah tersedia.
- Meneruskan pesanan ke teknisi dengan yakin.

**Pain Points**
- Menunggu balasan pemeriksa tanpa kepastian waktu.
- Sungkan ketika pelanggan harus menunggu.
- Harus menghubungkan informasi dari beberapa sumber secara manual.

*Pembanding:* R1 dan R3 dapat memeriksa rekening sendiri. Perbedaan akses ini dipertahankan, sehingga pemeriksa adalah peran, bukan orang tertentu.

---

## 4. User Needs

Format: *[Pengguna] butuh cara untuk [kebutuhan] agar bisa [tujuan].*

| ID | User Need | Bukti riset |
|---|---|---|
| **UN1** | Ari butuh cara untuk membedakan pembayaran yang baru dicatat dari penerimaan dana yang sudah diperiksa, agar bisa menjelaskan dasar kepastian pembayaran. | R1–R3 Q7 |
| **UN2** | Ari butuh cara untuk menghubungkan pesanan, nominal, bukti pelanggan, dan hasil pemeriksaan pada pembayaran yang sama, agar bisa mencocokkan tanpa mengandalkan ingatan. | R2 Q4–Q8; R1, R3 Q4–Q8 |
| **UN3** | Ari butuh cara untuk mengetahui siapa yang memeriksa dan sejauh mana permintaan pemeriksaan ditangani, agar bisa berkoordinasi dengan pihak yang tepat. | R2 Q1, Q8–Q11 |
| **UN4** | Ari butuh cara untuk mengetahui langkah berikutnya saat hasil belum tersedia, agar bisa menjelaskan kondisi kepada pelanggan tanpa menjanjikan kepastian yang belum ada. | R2 Q9–Q11 |
| **UN5** | Ari butuh dasar dari pihak berwenang untuk pesanan yang sama, agar bisa memutuskan pesanan diteruskan atau ditahan. | R2 Q3, Q8; R3 Q8 |
| **UN6** | Ari butuh cara untuk meneruskan konteks pesanan ke permintaan pemeriksaan, agar pencatatan tetap lancar tanpa mengisi ulang data yang sudah benar. | R2 Q6, Q9, Q12 |

---

## 5. Product Goals

| ID | Tujuan | Menjawab |
|---|---|---|
| **G1** | Admin dapat mencocokkan catatan dengan pembayaran yang tepat dan memahami informasi mana yang sudah dipastikan. | M2, M3 |
| **G2** | Admin dapat menangani koordinasi dengan jelas saat menunggu hasil pemeriksaan. | M1 |
| **G3** | Admin dapat menentukan kapan pesanan boleh diteruskan ke teknisi. | M4 |
| **G4** | Kelancaran pencatatan yang sudah baik tetap terjaga. | Pengalaman baik R2 |

### Success Metrics

| Indikator | Target awal |
|---|---|
| Pesanan diteruskan ke teknisi tanpa hasil pemeriksaan *Sesuai* | **0** pada skenario uji |
| Admin dapat membedakan "pembayaran dicatat" dan "dana dipastikan" tanpa bantuan | Terpenuhi pada skenario V1 |
| Admin memilih pesanan yang benar ketika ada dua pesanan bernominal sama | Terpenuhi pada skenario V2 |
| Permintaan pemeriksaan dibuat tanpa mengetik ulang identitas pesanan dan nominal | Terpenuhi pada skenario V5 |

*Catatan:* target menit, jumlah klik, dan persentase belum ditetapkan karena belum ada baseline. Durasi tugas dan kebutuhan bantuan dicatat sebagai baseline pengujian berikutnya.

---

## 6. Functional Requirements

### FR-01: Pemisahan Catatan Pembayaran dan Hasil Pemeriksaan — *Must*
Sistem menyimpan catatan pembayaran (dibuat admin) dan hasil pemeriksaan penerimaan (dibuat pemeriksa) sebagai dua informasi terpisah. Keduanya terhubung ke pesanan yang sama.
- Catatan pembayaran memuat metode (Tunai / Bank Transfer), nominal, dan waktu pencatatan.
- Hasil pemeriksaan memuat hasil, nama atau peran pemeriksa, waktu pemeriksaan, dan catatan opsional.
- Sistem menampilkan sumber hasil pemeriksaan (siapa dan kapan).
- Status pembayaran yang tercatat tidak boleh ditampilkan sebagai "dana diterima" sebelum ada hasil pemeriksaan *Sesuai*.

### FR-02: Keterhubungan Informasi Pesanan — *Must*
Sistem mengaitkan identitas pesanan, pelanggan, layanan, nominal tagihan, rujukan bukti pelanggan, dan hasil pemeriksaan, sehingga semuanya dapat ditinjau dalam satu konteks pesanan.
- Setiap pesanan memiliki kode unik yang selalu terlihat.
- Rujukan bukti pelanggan memuat nominal, tanggal/waktu transfer, dan keterangan pengirim (misalnya nama rekening pengirim atau catatan chat).
- Daftar pesanan dapat dicari berdasarkan kode pesanan dan nama pelanggan.
- Dua pesanan bernominal sama tetap dapat dibedakan dari kode pesanan, pelanggan, dan waktu.

### FR-03: Permintaan Pemeriksaan — *Must*
Sistem mencatat permintaan pemeriksaan per pesanan Bank Transfer.
- Admin memilih pemeriksa yang dituju (Owner atau Finance).
- Keadaan permintaan: **Belum diminta → Menunggu hasil → Hasil tersedia**.
- Pemeriksa memasukkan hasil: **Sesuai**, **Tidak sesuai**, atau **Perlu klarifikasi**.
- Mengirim permintaan **tidak** mengubah pembayaran menjadi "dana diterima".
- Sistem menyediakan antrean pemeriksaan yang dapat disaring menurut keadaan permintaan.

### FR-04: Informasi Tindak Lanjut saat Menunggu — *Should*
Saat hasil pemeriksaan belum tersedia, sistem menampilkan:
- pemeriksa yang dituju dan kontaknya,
- sejak kapan permintaan menunggu,
- langkah tindak lanjut sesuai prosedur usaha (misalnya menghubungi ulang pemeriksa atau menghubungi pemeriksa pengganti),
- contoh penjelasan kepada pelanggan yang tidak menjanjikan dana diterima atau waktu selesai.

### FR-05: Keputusan Tindak Lanjut Pesanan — *Must*
Sistem mencatat keputusan **Teruskan** (ke teknisi) atau **Tahan** untuk setiap pesanan Bank Transfer.
- Keputusan *Teruskan* hanya dapat disimpan jika ada hasil pemeriksaan **Sesuai** untuk pesanan yang sama.
- Keputusan *Tahan* wajib disertai alasan.
- Setiap keputusan menyimpan rujukan hasil pemeriksaan, petugas yang memutuskan, dan waktu keputusan.
- Riwayat permintaan, hasil, dan keputusan dapat ditelusuri pada pesanan.

### FR-06: Pemanfaatan Ulang Konteks Pesanan — *Should*
Saat admin membuat permintaan pemeriksaan, sistem otomatis memakai kode pesanan, pelanggan, dan nominal yang sudah tersimpan.
- Admin tidak perlu mengetik ulang identitas pesanan dan nominal.
- Rincian awal tidak berubah kecuali admin sengaja mengubahnya.

### FR-07: Pencatatan Pesanan — *Must (pendukung)*
Sistem memungkinkan admin membuat, melihat, dan mengubah pesanan.
- Data pesanan: kode pesanan (otomatis), nama pelanggan, nomor WhatsApp, layanan, jumlah pasang, nominal tagihan, metode pembayaran, catatan, waktu dibuat.
- Fitur ini mendukung FR-01 sampai FR-06. Proses cuci, pengantaran, dan pengambilan tidak termasuk.

### FR-08: Beranda Ringkasan — *Should*
Sistem menampilkan ringkasan jumlah pesanan transfer yang **belum diminta**, **menunggu hasil**, **hasil tersedia**, dan **siap diteruskan**. Setiap ringkasan dapat diklik menuju daftar yang sesuai.

---

## 7. Non-Functional Requirements

**NFR-01 Usability.** Arti setiap status mudah dipahami tanpa panduan. Istilah "dicatat" dan "dana dipastikan" tidak boleh tertukar.

**NFR-02 Responsive.** Aplikasi digunakan terutama di smartphone kasir, tetapi tetap dapat dipakai di tablet dan desktop.

**NFR-03 Reliability.** Data pesanan, permintaan, hasil, dan keputusan tersimpan persisten dan tetap tersedia setelah halaman dimuat ulang.

**NFR-04 Integrity.** Hasil pemeriksaan dan keputusan tidak dapat dihapus diam-diam. Perubahan tercatat dalam riwayat pesanan.

**NFR-05 Access.** Hanya peran Pemeriksa yang dapat memasukkan hasil pemeriksaan. Admin tidak dapat menandai dana diterima.

**NFR-06 Feedback.** Setiap aksi penting (simpan, kirim permintaan, simpan keputusan) memberi umpan balik berhasil atau gagal yang jelas.

---

## 8. Business Rules

1. Pesanan wajib memiliki pelanggan, layanan, dan nominal tagihan lebih dari 0.
2. Pemeriksaan hanya berlaku untuk pesanan dengan metode **Bank Transfer**.
3. Catatan pembayaran **bukan** bukti dana diterima. Kepastian dana hanya berasal dari hasil pemeriksaan **Sesuai**.
4. Satu pesanan hanya memiliki satu permintaan pemeriksaan aktif. Permintaan ulang hanya dapat dibuat setelah hasil *Tidak sesuai* atau *Perlu klarifikasi*.
5. Hasil pemeriksaan harus merujuk pesanan yang sama dengan permintaannya.
6. Hanya peran Pemeriksa (Owner/Finance) yang dapat memasukkan hasil pemeriksaan.
7. Keputusan *Teruskan* hanya diizinkan jika hasil pemeriksaan terakhir adalah *Sesuai*.
8. Jika hasil belum tersedia, *Tidak sesuai*, atau *Perlu klarifikasi*, pesanan berada dalam keadaan *Tahan* sampai ada hasil *Sesuai*.
9. Jika nominal pesanan diubah setelah permintaan dikirim, permintaan perlu dikirim ulang untuk data terbaru.
10. Sistem tidak menjanjikan waktu selesai pemeriksaan.

---

## 9. User Stories

| ID | User Story | Kaitan |
|---|---|---|
| **US-01** | Sebagai admin yang merangkap kasir, saya ingin membedakan pembayaran yang tercatat dari dana yang sudah dipastikan, agar saya tahu informasi pembayaran mana yang sudah diverifikasi. | UN1 · FR-01 · G1 |
| **US-02** | Sebagai admin, saya ingin mencocokkan setiap pesanan dengan tagihan, bukti pembayaran, dan hasil pemeriksaannya, agar saya dapat mengenali pembayaran yang benar meskipun nominalnya sama. | UN2 · FR-02 · G1 |
| **US-03** | Sebagai admin, saya ingin tahu siapa yang memeriksa pembayaran dan apakah hasilnya sudah tersedia, agar saya dapat berkoordinasi dengan orang yang tepat selama menunggu. | UN3 · FR-03 · G2 |
| **US-04** | Sebagai admin, saya ingin tahu langkah tindak lanjut saat hasil belum tersedia, agar saya dapat menjelaskan kondisi kepada pelanggan tanpa janji yang tidak berdasar. | UN4 · FR-04 · G2 |
| **US-05** | Sebagai admin, saya ingin keputusan saya didasarkan pada hasil pemeriksaan berwenang untuk pesanan yang sama, agar saya dapat memutuskan pesanan diteruskan ke teknisi atau ditahan. | UN5 · FR-05 · G3 |
| **US-06** | Sebagai admin, saya ingin memakai ulang data pesanan yang benar saat meminta pemeriksaan, agar saya tidak perlu mengetik ulang identitas pesanan dan nominal. | UN6 · FR-06 · G4 |
| **US-07** | Sebagai pemeriksa (owner/finance), saya ingin melihat permintaan yang ditujukan kepada saya dan memasukkan hasil pemeriksaan untuk pesanan tersebut, agar admin mendapat dasar keputusan yang sah. | FR-03 · G2, G3 |

---

## 10. Scope

### In Scope
- Pencatatan, daftar, pencarian, dan detail pesanan.
- Pencatatan pembayaran (Tunai / Bank Transfer) yang terpisah dari hasil pemeriksaan.
- Permintaan pemeriksaan dengan pemeriksa yang dituju dan keadaan permintaan.
- Antrean pemeriksaan beserta filter keadaan.
- Input hasil pemeriksaan oleh peran Pemeriksa.
- Informasi tindak lanjut dan kontak pemeriksa saat menunggu.
- Keputusan *Teruskan* / *Tahan* beserta dasar dan riwayatnya.
- Beranda ringkasan.
- Penjelasan arti status pembayaran dan pemeriksaan.
- Tampilan responsif dengan prioritas mobile.

### Out of Scope
- Integrasi bank, API mutasi rekening, atau validasi transfer otomatis secara real-time.
- QRIS dinamis dan payment gateway (usulan R2 Q12–Q13; dinilai di fase lain).
- Akses rekening untuk admin.
- Proses cuci, pengantaran, dan pengambilan sepatu.
- Pengiriman pesan WhatsApp otomatis.
- Laporan keuangan dan pembukuan.

---

## 11. Assumptions & Dependencies

### Assumptions
- Usaha telah menetapkan siapa pemeriksa yang berwenang (Owner dan/atau Finance).
- Pemeriksaan rekening tetap dilakukan manual oleh pemeriksa melalui mobile banking.
- Prosedur tindak lanjut saat menunggu (kapan menghubungi ulang, siapa pengganti) ditentukan usaha. Aplikasi menampilkan prosedur tersebut, bukan menetapkannya.
- Untuk prototipe eksperimen, autentikasi penuh tidak diwajibkan. Peran **Admin** dan **Pemeriksa** dapat dipilih di aplikasi untuk mensimulasikan dua pengguna, dan data disimpan di perangkat (persisten di browser).
- Data pesanan pada prototipe adalah data fiktif dan diberi penanda jelas.

### Dependencies
- Penyimpanan data persisten.
- Kesepakatan usaha tentang pemeriksa berwenang dan prosedur tindak lanjut.

---

## 12. Expected Deliverables

Implementasi harus menghasilkan:
1. **Beranda**: ringkasan dan pintasan ke Pesanan, Pemeriksaan Pembayaran, dan Bantuan.
2. **Pesanan**: daftar dan pencarian pesanan.
3. **Buat / Ubah Pesanan**: form pencatatan pesanan dan pembayaran.
4. **Detail Pesanan**: ringkasan pesanan, pembayaran dan bukti, pemeriksaan, serta tindak lanjut dalam satu halaman.
5. **Pemeriksaan Pembayaran**: antrean pesanan transfer menurut keadaan pemeriksaan.
6. **Input Hasil Pemeriksaan**: untuk peran Pemeriksa.
7. **Bantuan Pemeriksaan**: arti status pembayaran, panduan saat menunggu, dan kontak pemeriksa.
8. Mekanisme keputusan *Teruskan* / *Tahan* dengan riwayat.
9. Penyimpanan data persisten.

---

## 13. Product Acceptance Criteria

Fitur dinyatakan memenuhi kebutuhan produk apabila:

| ID | Skenario uji | Hasil yang diharapkan | Kaitan |
|---|---|---|---|
| **V1** | Pesanan transfer sudah dicatat, hasil pemeriksaan belum tersedia. | Aplikasi menunjukkan pembayaran *dicatat* dan dana *belum dipastikan*. Pemeriksa yang dituju dan keadaan *Menunggu hasil* terlihat. | US-01, US-03 |
| **V2** | Dua pesanan bernominal sama dengan bukti berbeda. | Pengguna dapat membedakan kedua pesanan dari kode, pelanggan, dan waktu, lalu menghubungkan hasil pemeriksaan ke pesanan yang benar. | US-02 |
| **V3** | Hasil pemeriksaan *Sesuai* dari pemeriksa berwenang tersedia. | Keputusan *Teruskan* dapat disimpan beserta rujukan hasil dan petugasnya. | US-05 |
| **V4** | Hasil belum tersedia, *Tidak sesuai*, atau *Perlu klarifikasi*. | Keputusan *Teruskan* ditolak sistem. Pengguna diarahkan untuk menahan pesanan dan melihat langkah tindak lanjut tanpa janji waktu. | US-04, US-05 |
| **V5** | Admin membuat permintaan pemeriksaan dari pesanan yang sudah dicatat. | Kode pesanan dan nominal terisi otomatis tanpa diketik ulang, dan rincian awal tidak berubah. | US-06 |
| **V6** | Pemeriksa membuka antrean dan memasukkan hasil. | Hasil tersimpan pada pesanan yang sama, dan keadaan berubah menjadi *Hasil tersedia*. | US-07 |
| **V7** | Halaman dimuat ulang. | Seluruh pesanan, permintaan, hasil, dan keputusan tetap tersedia. | NFR-03 |
| **V8** | Aplikasi dibuka di smartphone dan desktop. | Semua fungsi dapat digunakan tanpa tampilan terpotong. | NFR-02 |

**Prioritas uji:** V3/V4 (keputusan) → V1 (koordinasi) → V2 (pencocokan) → V6 → V5 → V7 → V8.
Meneruskan pesanan tanpa hasil *Sesuai* dihitung sebagai **kesalahan kritis**.

---

## 14. Traceability

| User Need | Masalah | Goal | FR | User Story | Uji | Sumber |
|---|---|---|---|---|---|---|
| UN1 | M3 | G1 | FR-01 | US-01 | V1 | WS5 R1–R3 Q7; WS6 U1; WS7 T2–T3 |
| UN2 | M2 | G1 | FR-02 | US-02 | V2 | WS5 R2 Q4–Q8; WS6 U2; WS7 T1–T4 |
| UN3 | M1 | G2 | FR-03 | US-03, US-07 | V1, V6 | WS5 R2 Q1, Q8–Q11; WS6 U3; WS7 T4–T5 |
| UN4 | M1 | G2 | FR-04 | US-04 | V4 | WS5 R2 Q9–Q11; WS6 U3; WS7 T5 |
| UN5 | M3, M4 | G3 | FR-05 | US-05 | V3, V4 | WS5 R2 Q3, Q8; R3 Q8; WS6 U4; WS7 T6 |
| UN6 | M2 | G4 | FR-06 | US-06 | V5 | WS5 R2 Q6, Q9, Q12; WS7 |

---

## 15. Sumber

| Kode | Dokumen |
|---|---|
| WS3 | Worksheet 3 — User & Stakeholder (pembagian peran Kasir, Admin, Owner, Teknisi) |
| WS5 | Worksheet 5 — User Interview (R1–R3, Q1–Q13) |
| WS6 | Worksheet 6 — Empathy Map & Persona (Ari, U1–U4) |
| WS7 | Worksheet 7 — User Journey (T1–T6) |
| WS8 | Worksheet 8 — UX Requirements (UX01–UX06, FR01–FR06, US01–US06, V1–V5) |

*Batas kesimpulan:* jawaban wawancara adalah parafrasa. Kebutuhan dan prioritas adalah sintesis peneliti. Belum ada hasil uji prototipe, pengukuran rata-rata waktu tunggu, atau bukti kejadian salah transfer.

---

*End of PRD v1.0*
