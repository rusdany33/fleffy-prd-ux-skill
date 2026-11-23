# COMPLETION-REPORT — Eksperimen B v0.1.0

## Implementation Summary
- **Halaman:** N0 Beranda, N1 Pesanan, N1a Buat/Ubah Pesanan, N1b Detail Pesanan (4 bagian accordion), P01 Bukti pembayaran, P12 Catatan keputusan & riwayat, N2 Antrean pemeriksaan, N3 Bantuan, N3a Arti status, N3b Panduan saat menunggu, N3c Kontak pemeriksa, NotFound.
- **Alur:** S1 minta pemeriksaan → S2 menunggu → hasil oleh Owner/Finance (checklist 4 butir) → S3 hasil memadai → S4 keputusan Teruskan tersimpan. Cabang T3 (hasil belum memadai, Tahan, permintaan ulang), P05 (data berubah → hasil kedaluwarsa), P07 (pencarian kosong), E2/E3 (gagal simpan).
- **Domain:** `domain/rules.ts` (aturan murni), `domain/actions.ts` (aksi → state baru, menolak aksi tidak sah), `domain/ids.ts` (PSN/BKT/PRM/HAS).
- **Desain:** token di `styles/tokens.css`, komponen di `components/common`, tema gelap, Roboto, mobile-first, kolom 560 px di layar lebar.

## Acceptance Criteria Status
Lihat [TEST-REPORT.md](TEST-REPORT.md). Seluruh kriteria **Must Have** lulus. AC-017 (Should) belum diuji di browser.

## Known Issues
- Kegagalan penyimpanan (E2/E3) hanya terjadi bila `localStorage` gagal. Belum disimulasikan di browser.
- Bukti transfer berupa data teks, tanpa unggahan gambar (sesuai scope).
- Peran disimulasikan lewat pemilih peran, tanpa login.
- Struktur berkas sedikit berbeda dari AGENTS §6 (D-09, D-10).
- Belum ada pengujian dengan screen reader dan pengguna nyata.

## Next Steps
1. Uji AC-017 dengan mensimulasikan penyimpanan penuh.
2. Pisahkan bagian N1b ke `components/orders/sections/`.
3. Usability test dengan admin kasir (Worksheet 13).

---

## v0.2.0 — Iterasi setelah eksperimen
- **Diselaraskan dengan Fleffy asli**: nota INV, pelanggan K-n, multi-pembayaran, status pengerjaan, tombol + di bottom nav, aksen biru.
- **Inti riset diperkuat**: LUNAS (tercatat) dipisahkan dari "Dana dikonfirmasi". Gerbang Diproses dan Selesai bergantung pada dana yang dipastikan.
- **AC v1.1**: AC-041 s.d. AC-049 Pass. AC-017 tetap Not Tested.
- **Known issues**: bukti masih berupa data teks; peran masih disimulasikan; satu permintaan mencakup beberapa entri (D-14), sehingga hasil tidak bisa membedakan entri yang cocok dan tidak cocok dalam permintaan yang sama.
- **Next steps**: usability test (Worksheet 13) dengan kasir dan owner memakai skenario DP + pelunasan.
