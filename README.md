# 🖐️ Fingerprint Attendance Event Listener API

Sebuah aplikasi Node.js berbasis Express yang berfungsi sebagai **event listener** untuk menerima dan memproses data kehadiran dari **hardware fingerprint/face recognition**, kemudian mencatat kehadiran ke dalam basis data MySQL. Proyek ini menggunakan arsitektur event-driven dan dapat dikembangkan untuk integrasi lebih lanjut.

---

## 🚀 Fitur

- 📡 Menerima log kehadiran dari perangkat (Fingerprint/Face Recognition)
- 🧠 Deteksi dan buat otomatis data **User** dan **Employee** jika belum terdaftar
- 📍 Menyimpan data kehadiran ke dalam tabel `attendances` dengan informasi lengkap (lokasi, waktu, mesin)
- 🔐 Autentikasi pengguna baru dengan password random + bcrypt
- 🧾 Logging proses menggunakan `log4js`
- 🗓️ Format waktu otomatis menggunakan `moment-timezone` (Asia/Jakarta)
- 📤 Penyimpanan kehadiran berdasarkan UID mesin dan IP Address

---

## 🧰 Teknologi yang Digunakan

- ⚙️ **Node.js + Express**
- 🗃️ **MySQL**
- 📦 **Multer** – Untuk menangani form-data dari perangkat
- 🔒 **Bcrypt** – Untuk enkripsi password
- 📍 **Moment Timezone** – Untuk penyesuaian waktu ke Asia/Jakarta
- 📑 **Log4js** – Untuk logging event dan error
- 📡 **EventEmitter** – Untuk manajemen alur event

---

## 🛠️ Struktur Endpoint

### `POST /`

Endpoint utama untuk menerima data kehadiran dari perangkat.

- **Content-Type**: `multipart/form-data`
- **Body**: `event_log` (JSON string)

Contoh JSON dalam `event_log`:
```json
{
  "ipAddress": "192.168.1.10",
  "dateTime": "2025-07-01T07:10:00Z",
  "AccessControllerEvent": {
    "serialNo": "ABC123456",
    "employeeNoString": "EMP001",
    "name": "John Doe"
  }
}
```

### GET /
- Tes koneksi server. Mengembalikan { status: "OK" }

### 🧩 Alur Proses
1. Perangkat fingerprint mengirim event_log ke endpoint.
2. eventEmitter menerima log, memproses:
  - Cek dan buat user/employee jika belum ada.
  - Cek keberadaan attendance berdasarkan UID & machine_id.
  - Simpan kehadiran baru jika belum tercatat.
3. Semua aktivitas dicatat di log.

### 📂 Struktur File
```bash
project/
│
├── app.js                 # File utama aplikasi
├── db.js                  # Koneksi dan query ke MySQL
├── logger.js              # Konfigurasi log4js
├── package.json
└── .env                   # File konfigurasi (jika ada)
```

### 📦 Instalasi
```bash
git clone https://github.com/your-username/fingerprint-listener.git
cd fingerprint-listener
npm install
```

### ⚙️ Konfigurasi
Pastikan file db.js dan logger.js sudah dikonfigurasi dengan benar sesuai dengan koneksi MySQL dan setup log Anda.

### ▶️ Menjalankan Server
```bash
node app.js
Server berjalan di:
```

```bash
http://127.0.0.1:7650
```

###🧪 Contoh Curl Request
```bash
curl -X POST http://127.0.0.1:7650 \
  -F "event_log={
    \"ipAddress\":\"192.168.1.10\",
    \"dateTime\":\"2025-07-01T07:10:00Z\",
    \"AccessControllerEvent\":{
      \"serialNo\":\"ABC123456\",
      \"employeeNoString\":\"EMP001\",
      \"name\":\"John Doe\"
    }
  }"
```

### Screenshot
![image](https://github.com/user-attachments/assets/60fec7e7-ab28-4cf8-adf9-188d9f71b6d0)

## 📬 Kontak

- Email: 2ahmadfatoni0@gmail.com
- LinkedIn: [linkedin.com/in/2ahmadfatoni0](https://linkedin.com/in/2ahmadfatoni0)
- Website: [inotechno.my.id](https://inotechno.my.id)

  
