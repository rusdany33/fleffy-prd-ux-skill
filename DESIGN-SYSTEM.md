# DESIGN-SYSTEM — Fleffy

**Versi:** 1.0 · **Status:** Final untuk Eksperimen B
**Rujukan:** UX-SPEC.md · Worksheet 12 (komponen wireframe `WF/*`, variabel *Fleffy / Wireframe*) · tampilan aplikasi Fleffy saat ini (Worksheet 1: antarmuka gelap, minimal, layar ±384 px).

---

## 1. Design Principles & Direction

1. **Tenang dan jelas.** Kasir bekerja cepat sambil melayani pelanggan, jadi hierarki harus langsung terbaca: identitas → keadaan → aksi.
2. **Monokrom + warna semantik.** Basis abu-abu monokrom mengikuti wireframe. Warna hanya dipakai untuk **makna status** (info, peringatan, sukses, bahaya), tidak untuk dekorasi.
3. **Gelap seperti Fleffy saat ini.** Tema gelap dipakai sebagai satu-satunya tema agar konsisten dengan aplikasi kasir yang sudah dipakai.
4. **Mobile-first.** Didesain untuk lebar 360–430 px; di layar lebih besar, konten tetap satu kolom terpusat.
5. **Status tidak hanya warna.** Setiap status memiliki teks dan (bila relevan) ikon.

---

## 2. Color Palette

### 2.1 Primitive

| Token | Nilai | Catatan |
|---|---|---|
| `--gray-950` | `#0E1013` | latar aplikasi |
| `--gray-900` | `#16191E` | permukaan kartu |
| `--gray-850` | `#1C2026` | permukaan kedua (header accordion terbuka, input) |
| `--gray-800` | `#252A31` | latar chip netral, soft |
| `--gray-700` | `#343A43` | garis/border |
| `--gray-500` | `#6B7380` | disabled teks |
| `--gray-400` | `#9AA3AF` | teks sekunder |
| `--gray-100` | `#EEF0F3` | teks utama |
| `--white` | `#FFFFFF` | — |
| `--blue-400` / `--blue-950` | `#7FB0FF` / `#14233D` | info / menunggu |
| `--amber-400` / `--amber-950` | `#F2C46D` / `#33270F` | peringatan / tercatat belum pasti |
| `--green-400` / `--green-950` | `#6FD39A` / `#10291C` | sukses / hasil memadai |
| `--red-400` / `--red-950` | `#FF8A80` / `#3A1514` | bahaya / tidak sesuai / error |

### 2.2 Semantic tokens (dipakai komponen)

| Token | Nilai | Pemakaian |
|---|---|---|
| `--color-bg` | gray-950 | latar halaman |
| `--color-surface` | gray-900 | kartu, header, bottom nav |
| `--color-surface-2` | gray-850 | input, header accordion terbuka |
| `--color-soft` | gray-800 | chip netral, kotak info |
| `--color-border` | gray-700 | garis 1 px |
| `--color-text` | gray-100 | teks utama |
| `--color-text-secondary` | gray-400 | teks pendukung, label |
| `--color-text-disabled` | gray-500 | teks tombol nonaktif |
| `--color-action` | gray-100 | latar tombol utama |
| `--color-action-text` | gray-950 | teks tombol utama |
| `--color-focus` | blue-400 | cincin fokus |
| `--color-info` / `--color-info-bg` | blue-400 / blue-950 | menunggu hasil |
| `--color-warning` / `--color-warning-bg` | amber-400 / amber-950 | tercatat, perlu klarifikasi, peringatan |
| `--color-success` / `--color-success-bg` | green-400 / green-950 | hasil memadai, dana dikonfirmasi, keputusan tersimpan |
| `--color-danger` / `--color-danger-bg` | red-400 / red-950 | tidak sesuai, error |

Kontras teks utama dan teks semantik terhadap latarnya ≥ 4.5:1.

### 2.3 Pemetaan status → warna

| Status | Chip | Warna |
|---|---|---|
| Pembayaran tercatat | `Pembayaran tercatat` | warning |
| Dana dikonfirmasi | `✓ Dana dikonfirmasi` | success |
| Tunai | `Tunai` | neutral |
| Belum diminta | `Belum diminta` | neutral |
| Menunggu hasil | `Menunggu hasil` | info |
| Hasil tersedia (memadai) | `Hasil tersedia` | success |
| Perlu klarifikasi | `Perlu klarifikasi` | warning |
| Tidak sesuai | `Tidak sesuai` | danger |
| Keputusan Teruskan | `Diteruskan` | success |
| Keputusan Tahan | `Ditahan` | warning |

---

## 3. Typography

Keluarga: **Roboto** (Google Fonts), cadangan `system-ui, sans-serif`. Angka nominal memakai `font-variant-numeric: tabular-nums`. ID (PSN-015, dll.) ditulis dengan huruf biasa, bobot Medium.

| Token | Ukuran / line-height | Bobot | Pemakaian |
|---|---|---|---|
| `--text-display` | 28 / 34 | 700 | judul halaman (Beranda, Detail pesanan) |
| `--text-title` | 20 / 26 | 700 | judul kartu besar, sapaan |
| `--text-heading` | 16 / 22 | 700 | judul kartu, header accordion |
| `--text-body` | 14 / 20 | 400 | isi |
| `--text-label` | 14 / 20 | 500 | label baris, tombol |
| `--text-caption` | 12 / 16 | 400 | catatan kecil, chip |

---

## 4. Spacing Scale & Breakpoints

### Spacing
`--space-4: 4px` · `--space-8: 8px` · `--space-12: 12px` · `--space-16: 16px` · `--space-24: 24px` · `--space-32: 32px`
Padding halaman horizontal 16 px. Jarak antarkartu 12 px. Padding kartu 16 px.

### Radius
`--radius-6: 6px` (chip, input) · `--radius-12: 12px` (kartu, tombol, accordion) · `--radius-full` (avatar/pill)

### Breakpoints

| Nama | Lebar | Perilaku |
|---|---|---|
| Mobile | < 640 px | Lebar penuh, bottom nav tetap di bawah. |
| Tablet | 640–1023 px | Kolom konten max 560 px terpusat; bottom nav ikut lebar kolom. |
| Desktop | ≥ 1024 px | Kolom konten max 560 px terpusat dengan bingkai aplikasi (border kiri-kanan). |
| Wide | ≥ 1440 px | Sama dengan desktop. |

---

## 5. Layout, Grid & Design Tokens

### Struktur layar
```
┌ App header (56px, sticky) ───────────────┐  FLEFFY · Ari · Admin ▾   |  ‹ Kembali · Bantuan
│ Page header: judul + baris identitas     │
│ Banner status (opsional)                 │
│ Konten (kartu / accordion), gap 12px     │
│                                          │
└ Bottom navigation (64px, fixed) ─────────┘  Beranda · Pesanan · Pemeriksaan · Bantuan
```
Konten diberi padding bawah 96 px agar tidak tertutup bottom nav.

### Elevasi
Tanpa bayangan pada kartu (garis 1 px). Toast dan bottom sheet memakai `--shadow-overlay: 0 8px 24px rgba(0,0,0,.45)`. Scrim overlay `rgba(0,0,0,.6)`.

### Motion
Durasi 150 ms (`ease-out`) untuk buka/tutup accordion dan bottom sheet. Hormati `prefers-reduced-motion` (tanpa animasi).

---

## 6. Component Specifications

| Komponen | Spesifikasi |
|---|---|
| **AppHeader** | Tinggi 56 px, latar surface, border bawah. Varian *root* (logo "FLEFFY" 16/700 + pemilih peran "Ari · Admin ▾" caption) dan *detail* ("‹ Kembali" label + tautan "Bantuan"). |
| **BottomNav** | 4 item, tinggi 64 px, label caption 12 px di bawah ikon. Aktif: latar `--color-soft`, teks `--color-text` 600; nonaktif: `--color-text-secondary`. `aria-current="page"`. |
| **Button** | Tinggi 48 px, radius 12, label 14/500, lebar penuh di dalam kartu. *Primary*: latar action, teks action-text. *Secondary*: latar transparan, border 1 px, teks utama. *Disabled*: latar soft, teks disabled, `cursor: not-allowed`. *Loading*: label diganti "Menyimpan…" dan nonaktif. Varian *sm* tinggi 36 px untuk aksi inline. |
| **Card** | Latar surface, border 1 px, radius 12, padding 16. Judul heading. |
| **InfoBox** | Latar soft (netral) atau `*-bg` semantik, radius 12, padding 12–16, judul label 600 + isi body. Dipakai untuk banner status dan konteks. |
| **Chip (status)** | Tinggi 24 px, padding 0 10, radius 6, caption 12/500, latar `*-bg` + teks semantik. Selalu berisi teks. |
| **Accordion** | Header 48 px: judul heading + ikon "+" (tertutup) / "−" (terbuka) di kanan; `button` dengan `aria-expanded` dan `aria-controls`. Panel: padding 16, border mengikuti header. Bisa banyak terbuka. |
| **KeyValue row** | Label secondary kiri, nilai label kanan (rata kanan). Gap vertikal 8. |
| **Checklist hasil** | Baris ikon ✓ (success) / ✗ (danger) + teks body. |
| **TextField / TextArea / Select** | Tinggi 48 px (textarea min 88), latar surface-2, border 1 px, radius 6, label di atas (label 14/500), hint caption secondary, error caption danger + border danger, `aria-invalid` dan `aria-describedby`. |
| **RadioList (filter)** | Baris 44 px, radius 6, ikon ○/● + label + jumlah di kanan. Terpilih: latar soft, teks tebal. `role="radiogroup"`. |
| **SegmentedChoice** | Untuk metode bayar / hasil pemeriksaan; opsi ≥ 44 px; terpilih: border text + latar soft. |
| **BottomSheet** | Untuk *Tahan untuk klarifikasi* dan konfirmasi. Muncul dari bawah, radius atas 16, handle 4×36, judul heading, scrim. Di ≥ 640 px tampil sebagai dialog terpusat max 480 px. Fokus terkunci di dalam; Esc menutup. |
| **Toast** | Di atas bottom nav, max 480 px, radius 12, latar surface-2 + garis kiri 4 px warna semantik, hilang otomatis 4 detik, `aria-live="polite"`. |
| **OrderCard** | Card berisi judul "PSN-015 · Nama", baris layanan · metode, baris "Tagihan" + nominal (kanan), chip keadaan, baris konteks caption, tombol secondary "Buka PSN-015". |
| **EmptyState** | InfoBox netral (judul + penjelasan) + Card "Coba …" dengan tombol primary. |
| **SampleTag** | Label "Contoh", caption 10/600 uppercase, latar soft, teks secondary. |

---

## 7. Iconography & Accessibility Rules

- **Ikon:** karakter teks sederhana (‹ + − ✓ ✗ ○ ● ▾) atau SVG garis 1.5 px, 20 px. Tidak memakai pustaka ikon eksternal. Ikon dekoratif `aria-hidden`.
- **Fokus:** `outline: 2px solid var(--color-focus); outline-offset: 2px` pada semua elemen interaktif (`:focus-visible`).
- **Keyboard:** seluruh fungsi dapat dicapai dengan Tab/Enter/Space; accordion dengan Enter/Space; bottom sheet Esc.
- **Label:** setiap field punya `<label>`; tombol ikon punya `aria-label`.
- **Kontras:** teks ≥ 4.5:1, komponen UI ≥ 3:1.
- **Bahasa:** `lang="id"`.
- **Gerak:** tanpa animasi jika `prefers-reduced-motion: reduce`.

*End of DESIGN-SYSTEM v1.0*
