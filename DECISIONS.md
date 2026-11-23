# DECISIONS — Eksperimen B

Keputusan teknis dan interpretasi spesifikasi selama implementasi (AGENTS.md §12).

| ID | Keputusan | Alasan | Rujukan |
|---|---|---|---|
| D-01 | Stack: React 19 + TypeScript + Vite, Vitest, tanpa pustaka UI/ikon/routing tambahan. | AGENTS §4 & §7: tanpa dependensi baru. Cukup untuk prototipe satu halaman. | AGENTS §4, §7 |
| D-02 | Hash routing (`#/…`) dengan tumpukan navigasi internal. *‹ Kembali* memakai `history.back()` hanya bila halaman asal ada di dalam aplikasi; selain itu ke halaman induk. | GitHub Pages tidak mendukung rewrite. Kembali dari antrean harus mempertahankan filter (AC-024). | INTERACTION-SPEC §2.1 |
| D-03 | Filter & pencarian disimpan di query URL lewat `history.replaceState` (tidak menambah riwayat). | Kembali dari detail langsung mengembalikan filter yang sama tanpa menumpuk riwayat. | INTERACTION-SPEC §7 |
| D-04 | Pemilih peran hanya ada di header *root* (Beranda, Pesanan, Pemeriksaan, Bantuan). Header detail berisi ‹ Kembali + Bantuan. | Mengikuti dua varian AppHeader di wireframe. | DESIGN-SYSTEM §6 |
| D-05 | "Data terbaru" = snapshot permintaan (ID, pelanggan, nominal, metode, ID/nominal/waktu bukti) sama dengan data pesanan. Mengubah salah satunya menandai permintaan terakhir `stale`. | Implementasi konkret INTERACTION-SPEC §4.4 butir 3 dan §3.3. | INTERACTION-SPEC §3.3, §4.4 |
| D-06 | Membuat permintaan ulang menandai semua permintaan sebelumnya tidak aktif. ID ulang memakai sufiks huruf (PRM-018-B / HAS-018-B). | Satu permintaan aktif per pesanan (aturan bisnis 4). | UX-SPEC §3.4 |
| D-07 | Keputusan *Tahan* yang merujuk permintaan lama tidak lagi ditampilkan sebagai keputusan berlaku setelah permintaan ulang dibuat. Keputusan tetap tercatat di riwayat. | Keadaan baru (Menunggu hasil) menggantikan konteks tahan. Riwayat tetap utuh (NFR-04). | INTERACTION-SPEC §6.3 |
| D-08 | Kegagalan simpan (E2/E3) dideteksi dari kegagalan `localStorage.setItem`. Saat gagal, state tidak berubah dan banner "belum terkonfirmasi" tampil. Tombol *Periksa …* memuat ulang data dari penyimpanan. | Tidak ada server. Ini satu-satunya titik kegagalan nyata pada prototipe. | INTERACTION-SPEC §4.2, §6.1 |
| D-09 | Bagian accordion N1b: tiga komponen bagian ditulis di dalam `pages/OrderDetail.tsx`, bukan di folder `components/orders/sections/`. | Ketiganya memakai state halaman yang sama (banner, busy, verifier). Pemisahan ditunda sebagai refactor. **Menyimpang dari struktur AGENTS §6.** | AGENTS §6 |
| D-10 | Halaman dikelompokkan per area: `Orders.tsx` (N1, N1a, ubah), `Records.tsx` (P01, P12), `Help.tsx` (N3, N3a–c), `Queue.tsx`, `Home.tsx`, `NotFound.tsx`, `OrderDetail.tsx`. Unit test dalam satu berkas `tests/domain.test.ts`. | Mengurangi duplikasi import. **Menyimpang dari daftar berkas AGENTS §6**, tetapi pemisahan `domain/` vs komponen tetap dipatuhi. | AGENTS §6 |
| D-11 | Tema gelap tunggal dan font Roboto dari Google Fonts. | DESIGN-SYSTEM §1 & §3. | DESIGN-SYSTEM |
| D-12 | Kontak pemeriksa berupa teks contoh (tidak ada tautan `tel:`/WhatsApp). | Wireframe P11: kontak belum tersedia dalam riset; tidak boleh mengarang nomor nyata. | UX-SPEC N3c |
| D-13 | Status "Dana dikonfirmasi" menghitung entri tunai sebagai terkonfirmasi. | Uang tunai diterima langsung oleh kasir di laci; risiko riset hanya pada transfer/e-wallet. | UX-SPEC §7.2 |
| D-14 | Satu permintaan mencakup semua entri non-tunai yang perlu diperiksa, bukan satu permintaan per entri. | Pemeriksa mencocokkan mutasi sekaligus; mengurangi jumlah permintaan. Hasil tetap dicatat per entri lewat snapshot. | UX-SPEC §7.3 |
| D-15 | Pemeriksa mana pun (Owner/Finance) boleh mencatat hasil, walau permintaan ditujukan ke salah satunya. | Wawancara: pemeriksa pengganti dipakai bila pemeriksa utama lambat. Hasil mencatat siapa yang memeriksa. | INTERACTION-SPEC §5 |
| D-16 | Entri berstatus *Tidak sesuai* boleh dibatalkan kasir. | Artinya dana tidak ditemukan; kasir perlu menghapus catatan yang keliru dari perhitungan LUNAS. | INTERACTION-SPEC §11.2 |
| D-17 | Lebar progress bar memakai `style={{ width }}` dinamis. | Nilai dihitung dari data, bukan nilai visual tetap; warnanya tetap dari token. | AC-028 |
| D-18 | Nama berkas komponen tetap `Order*` (OrderCard, OrderForm, OrderDetail) walau istilah UI menjadi "Transaksi". | Mengurangi perubahan berkas pada iterasi; istilah yang terlihat pengguna sudah "Transaksi". | AGENTS §6 |
