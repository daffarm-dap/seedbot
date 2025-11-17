# 📋 DAFTAR FITUR APLIKASI - WEBSITE SISTEM INFORMASI PETANI

## 🎯 Ringkasan Aplikasi
Aplikasi web untuk Sistem Penabur Benih Jagung Otomatis (SeedBot) berbasis AI dan GPS dengan fitur monitoring real-time, kontrol robot, dan manajemen data pertanian.

---

## 🏠 HALAMAN UTAMA (LANDING PAGE)

### Fitur:
1. **Hero Section**
   - Judul dan deskripsi aplikasi
   - Tombol navigasi ke teknologi dan login
   - Background animasi dengan efek blur
   - Badge floating dengan informasi presisi GPS dan AI Analysis

2. **Section Teknologi**
   - GPS Precision: Sistem GPS RTK untuk posisi tanam akurat
   - Machine Learning: AI analisis tanah dan kondisi lahan real-time
   - Real-time Monitoring: Dashboard monitoring proses langsung

3. **Section Berita**
   - Menampilkan 3 berita terbaru (status Published)
   - Card berita dengan gambar, judul, konten, dan tanggal
   - Link ke halaman berita lengkap
   - Loading state dan empty state

4. **Footer**
   - Informasi kontak (Email, Telepon, WhatsApp)
   - Link media sosial (Instagram, Facebook, YouTube, LinkedIn)
   - Badge teknologi (AI-Powered, GPS Precision)

---

## 🔐 HALAMAN LOGIN

### Fitur:
1. **Form Login**
   - Input username
   - Input password (tersembunyi)
   - Validasi form (required fields)
   - Tombol login
   - Tombol kembali ke beranda

2. **Autentikasi**
   - Integrasi dengan backend API
   - Penyimpanan token di localStorage
   - Redirect berdasarkan role (admin/petani)
   - Toast notification untuk success/error

---

## 👨‍🌾 DASHBOARD PETANI (FARMER DASHBOARD)

### Menu Utama:
1. **Lihat Data Realtime** (Dashboard)
2. **Atur Mapping**
3. **Lihat Histori Robot**
4. **Atur Parameter Penaburan**
5. **Kendali Robot**

### 1. Lihat Data Realtime

#### Sensor Data:
- **Suhu** (°C)
  - Status: baik/sedang/jelek
  - Label informasi kondisi
  
- **Kelembapan** (%)
  - Status: baik/sedang/jelek
  - Label informasi kondisi

- **pH Tanah**
  - Status: baik/sedang/jelek
  - Label informasi kondisi

- **Nitrogen (N)** (mg/kg)
  - Status: baik/sedang/jelek
  - Label informasi kondisi

- **Phospor (P)** (mg/kg)
  - Status: baik/sedang/jelek
  - Label informasi kondisi

- **Kalium (K)** (mg/kg)
  - Status: baik/sedang/jelek
  - Label informasi kondisi

#### Status Robot Realtime:
- **Koneksi**: Terhubung/Terputus
- **Status**: Bekerja
- **Benih Tertanam**: Jumlah biji
- **Baterai**: Persentase baterai

#### Fitur:
- Update timestamp terakhir
- Color coding berdasarkan status (hijau/kuning/merah)
- Card dengan background color sesuai status

### 2. Atur Mapping

#### Fitur:
- **Peta GPS Lahan**
  - Placeholder untuk integrasi Mapbox/Leaflet
  - Grid simulasi peta
  - Kontrol zoom (zoom in, zoom out)
  - Kontrol layer
  - Kontrol maximize

- **Buat Mapping Baru**
  - Input nama mapping
  - Tombol simpan mapping
  - Validasi nama mapping

- **Daftar Mapping Tersimpan**
  - List mapping dengan nama dan tanggal
  - Tombol hapus mapping
  - Scrollable list
  - Empty state

### 3. Lihat Histori Robot

#### Grafik Histori:
- **Histori Suhu & Kelembapan** (7 hari terakhir)
- **Histori pH Tanah** (7 hari terakhir)
- **Histori Nitrogen & Kalium** (7 hari terakhir)
- **Histori Phospor** (7 hari terakhir)

#### Tabel Histori Data:
Kolom:
- Waktu (timestamp)
- Suhu (°C)
- Kelembapan (%)
- pH
- N (mg/kg)
- P (mg/kg)
- K (mg/kg)
- Benih (jumlah)
- Baterai (%)
- Status (Layak/Tidak Layak)

#### Fitur:
- Tombol unduh histori
- Tabel scrollable
- Color coding status (hijau/merah)
- Icon calendar untuk timestamp

### 4. Atur Parameter Penaburan

#### Parameter:
- **Kedalaman Tanam** (cm)
  - Range: 3-10 cm
  - Step: 0.5 cm
  - Rekomendasi: 5-7 cm untuk jagung
  - Slider control

- **Jarak Antar Lubang** (cm)
  - Range: 15-30 cm
  - Step: 1 cm
  - Rekomendasi: 20-25 cm untuk jagung
  - Slider control

#### Fitur:
- Real-time preview nilai
- Tombol simpan parameter
- Tombol reset ke default
- Toast notification

### 5. Kendali Robot

#### Status Robot:
- **Koneksi**: Terhubung/Terputus
- **Status Robot**: Siap Dikontrol
- **Mode**: Manual/Otomatis

#### Mode Kontrol:
- **Toggle Switch** Manual/Otomatis
- Mode Manual: Kontrol arah aktif
- Mode Otomatis: Kontrol arah disabled, pilih mapping

#### Kontrol Arah Gerakan (Mode Manual):
- **Maju** (ChevronUp)
- **Kiri** (ChevronLeft)
- **Kanan** (ChevronRight)
- **Mundur** (ChevronDown)
- **Stop** (Square) - disabled

#### Kontrol Operasi:
- **Pilih Mapping** (Mode Otomatis saja)
  - Dropdown list mapping tersimpan
  
- **Mulai Penaburan** (Tombol hijau)
- **Stop** (Tombol merah)
- **Kembali ke Base** (Tombol outline)

#### Fitur:
- Warning message berdasarkan mode
- Disabled state untuk kontrol arah saat mode otomatis
- Toast notification untuk setiap action

---

## 👨‍💼 DASHBOARD ADMIN (ADMIN DASHBOARD)

### Menu Utama:
1. **Atur Parameter Default**
2. **Manajemen User Petani**
3. **Manajemen Berita**

### 1. Atur Parameter Default

#### Parameter Default:
- **Kedalaman Tanam Default** (cm)
  - Range: 3-10 cm
  - Step: 0.5 cm
  - Deskripsi: Parameter ini akan diterapkan untuk semua petani baru

- **Jarak Antar Benih Default** (cm)
  - Range: 15-30 cm
  - Step: 1 cm
  - Deskripsi: Jarak optimal untuk tanaman jagung

#### Fitur:
- Slider control
- Real-time preview nilai
- Tombol simpan parameter default
- Toast notification

### 2. Manajemen User Petani

#### Fitur:
- **Tambah Petani Baru**
  - Dialog form dengan fields:
    - Nama Lengkap
    - Username
    - Password
  - Validasi form
  - Tombol tambah petani

- **Daftar Petani**
  - Tabel dengan kolom:
    - Nama
    - Username
    - Status (Aktif)
    - Aksi (Edit, Hapus)
  - Badge status (hijau untuk Aktif)
  - Tombol edit (icon pencil)
  - Tombol hapus (icon trash)

#### Fitur:
- Toast notification untuk setiap action
- Validasi input
- Empty state

### 3. Manajemen Berita

#### Fitur:
- **Tambah Berita Baru**
  - Dialog form dengan fields:
    - Judul Berita
    - Gambar Berita (upload)
      - Preview gambar
      - Validasi format (JPG, PNG, GIF)
      - Validasi ukuran (max 5MB)
      - Tombol hapus gambar
    - Konten
    - Status (Draft/Published)
  - Validasi form
  - Tombol tambah berita

- **Edit Berita**
  - Dialog form sama seperti tambah
  - Pre-filled dengan data berita
  - Tombol simpan perubahan

- **Daftar Berita**
  - Tabel dengan kolom:
    - Judul (dengan preview konten)
    - Gambar (thumbnail)
    - Tanggal
    - Status (Published/Draft)
    - Aksi (Edit, Hapus)
  - Badge status (hijau untuk Published, kuning untuk Draft)
  - Tombol edit (icon pencil)
  - Tombol hapus (icon trash)

#### Fitur:
- Image upload dengan preview
- Validasi file type dan size
- Toast notification
- Empty state
- Status filter (Published/Draft)

---

## 📰 HALAMAN BERITA (NEWS PAGE)

### Fitur:
1. **Header**
   - Tombol kembali ke beranda
   - Logo aplikasi
   - Responsive (logo berbeda untuk mobile/desktop)

2. **Hero Section**
   - Badge "Berita & Artikel"
   - Judul halaman
   - Deskripsi

3. **Grid Berita**
   - Card berita dengan:
     - Gambar berita
     - Badge kategori (Teknologi/Studi Kasus/Update)
     - Judul berita
     - Preview konten (3 baris)
     - Tanggal (format Indonesia)
     - Tombol "Baca Selengkapnya"
   - Hover effects (scale gambar, translate tombol)
   - Responsive grid (2 kolom md, 3 kolom lg)

4. **Dialog Detail Berita**
   - Modal dengan:
     - Judul berita
     - Gambar berita (jika ada)
     - Tanggal
     - Konten lengkap
     - Tombol tutup

5. **Footer**
   - Informasi kontak
   - Link media sosial
   - Copyright

---

## 🔌 API INTEGRATION

### Auth API:
- `login(username, password)` - Login user
- `logout()` - Logout user
- `getCurrentUser()` - Get current user from localStorage
- `isAuthenticated()` - Check if user is authenticated
- `me()` - Get current user from server

### News API:
- `getAll()` - Get all news articles
- `getById(id)` - Get news by ID
- `create(newsData)` - Create new news article
- `update(id, newsData)` - Update news article
- `delete(id)` - Delete news article
- `uploadImage(file)` - Upload news image

### Admin API:
- `getUsers()` - Get all users
- `createUser(data)` - Create new user
- `updateUser(id, data)` - Update user
- `deleteUser(id)` - Delete user
- `getParameters()` - Get default parameters
- `updateParameters(params)` - Update default parameters

### Farmer API:
- `getSensorData()` - Get sensor data
- `getRobotStatus()` - Get robot status
- `getRobotHistory()` - Get robot history
- `getMappings()` - Get saved mappings
- `getParameters()` - Get farmer parameters

---

## 🎨 UI COMPONENTS (Shadcn/UI)

### Komponen yang Digunakan:
- **Button** - Tombol dengan berbagai variant
- **Card** - Container untuk konten
- **Table** - Tabel data
- **Input** - Input field
- **Label** - Label untuk form
- **Textarea** - Text area untuk konten panjang
- **Slider** - Slider untuk nilai numerik
- **Dialog** - Modal dialog
- **Select** - Dropdown select
- **Badge** - Badge untuk status/kategori
- **Toaster** - Toast notification (Sonner)
- **ImageWithFallback** - Image component dengan fallback

### Icon Library:
- **Lucide React** - Icon library untuk semua icon

---

## 📱 RESPONSIVE DESIGN

### Breakpoints:
- **Mobile**: < 768px (md)
- **Tablet**: >= 768px (md)
- **Desktop**: >= 1024px (lg)

### Fitur Responsive:
- Sidebar mobile dengan overlay
- Menu hamburger untuk mobile
- Grid responsive (1 kolom mobile, 2-3 kolom desktop)
- Logo responsive (icon mobile, medium tablet, full desktop)
- Table scrollable untuk mobile

---

## 🔔 NOTIFICATIONS

### Toast Notifications (Sonner):
- Success notifications (hijau)
- Error notifications (merah)
- Info notifications (biru)
- Warning notifications (kuning)

### Use Cases:
- Login success/error
- Save parameters success
- Delete mapping success
- Robot control commands
- Add/edit/delete user
- Add/edit/delete news
- Image upload success/error

---

## 🎯 FITUR UTAMA YANG TERSEDIA

### ✅ Fitur yang Sudah Diimplementasi:
1. ✅ Landing page dengan hero, teknologi, dan berita
2. ✅ Login dengan autentikasi
3. ✅ Dashboard petani dengan 5 menu
4. ✅ Monitoring sensor data real-time
5. ✅ Mapping GPS lahan (placeholder)
6. ✅ Histori robot dengan tabel data
7. ✅ Parameter penaburan (kedalaman & jarak)
8. ✅ Kontrol robot (manual & otomatis)
9. ✅ Dashboard admin dengan 3 menu
10. ✅ Manajemen user petani
11. ✅ Manajemen berita (CRUD)
12. ✅ Halaman berita dengan detail
13. ✅ Image upload untuk berita
14. ✅ Responsive design
15. ✅ Toast notifications
16. ✅ API integration

### 🚧 Fitur yang Perlu Integrasi Backend:
1. ⚠️ Real-time sensor data dari backend
2. ⚠️ Real-time robot status dari backend
3. ⚠️ Integrasi GPS mapping (Mapbox/Leaflet)
4. ⚠️ Grafik historis (perlu library chart seperti Recharts)
5. ⚠️ Download histori sebagai file
6. ⚠️ Upload mapping GPS ke backend
7. ⚠️ Kontrol robot ke backend (WebSocket?)
8. ⚠️ CRUD user petani ke backend
9. ⚠️ CRUD berita ke backend
10. ⚠️ Upload gambar ke backend

---

## 📦 DEPENDENCIES

### Main Dependencies:
- **React** ^18.3.1
- **React DOM** ^18.3.1
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - UI components
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **Recharts** - Charts (tersedia tapi belum digunakan)

### Dev Dependencies:
- **TypeScript** - Type checking (untuk App.tsx)
- **@vitejs/plugin-react-swc** - React plugin untuk Vite

---

## 🚀 TEKNOLOGI STACK

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (Shadcn/UI)
- **Icons**: Lucide React
- **Notifications**: Sonner
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: Conditional rendering (tidak menggunakan React Router)
- **API Client**: Fetch API
- **Storage**: localStorage

---

## 📝 CATATAN PENTING

1. **File Format**: Komponen utama sudah dikonversi dari TSX ke JSX
2. **App.tsx**: Masih menggunakan TypeScript (perlu dikonversi jika ingin full JSX)
3. **API Integration**: Sudah disiapkan tapi perlu backend untuk testing
4. **Image Upload**: Sudah ada UI tapi perlu backend endpoint
5. **Real-time Data**: Perlu WebSocket atau polling untuk real-time updates
6. **GPS Mapping**: Perlu integrasi Mapbox/Leaflet untuk peta real
7. **Charts**: Recharts sudah terinstall tapi belum digunakan untuk grafik historis

---

## 🔄 FLOW APLIKASI

1. **User mengakses Landing Page**
2. **User klik Login** → Halaman Login
3. **User login** → Redirect ke Dashboard (Admin/Petani)
4. **Admin Dashboard** → Atur Parameter, Kelola Petani, Kelola Berita
5. **Petani Dashboard** → Lihat Data, Atur Mapping, Histori, Parameter, Kontrol Robot
6. **User klik Berita** → Halaman Berita
7. **User logout** → Kembali ke Landing Page

---

## 📞 KONTAK & INFORMASI

- **Email**: info@seedbot.id
- **Telepon**: (021) 8765-4321
- **WhatsApp**: +62 812-3456-7890
- **Media Sosial**: Instagram, Facebook, YouTube, LinkedIn

---

**Dokumen ini dibuat berdasarkan analisis kode frontend aplikasi Website Sistem Informasi Petani (SeedBot)**












