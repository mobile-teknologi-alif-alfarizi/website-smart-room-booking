# Instruksi Penempatan Asset Wallpaper

## Untuk menampilkan wallpaper di Login page:

1. **Lokasi file:** 
   ```
   website/public/assets/auth/wallpaper_auth.jpg
   ```

2. **Spesifikasi gambar:**
   - Format: JPG/PNG
   - Recommended resolusi: 1920x1080 atau lebih tinggi
   - Aspect ratio: 16:9 atau landscape
   - Ukuran file: < 1MB untuk performa optimal

3. **Jika image tidak ada:**
   - Login page akan menampilkan animated gradient fallback
   - Gradient colors: Purple → Blue → Teal
   - Design tetap responsif dan terlihat bagus

4. **Cara menggunakan custom wallpaper:**
   - Simpan gambar ke folder: `website/public/assets/auth/`
   - Nama file: `wallpaper_auth.jpg`
   - Biarkan nama file tetap sama

---

**Catatan:** Folder ini sudah dibuat secara otomatis. Tinggal copy/paste gambar wallpaper ke folder tersebut.

Jika menggunakan image tapi ingin tetap dengan gradient fallback sebagai backup, image akan ditampilkan jika tersedia, dan gradient akan otomatis menggantikan jika image tidak ditemukan.
