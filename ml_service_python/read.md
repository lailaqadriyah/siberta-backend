# Panduan Testing Machine Learning & API (main.py)

Panduan ini berisi langkah-langkah untuk melakukan testing script machine learning dan API FastAPI yang terdapat di file `main.py`.

## 1. Persiapan Lingkungan

### a. Masuk ke Folder
Pindah ke folder `ml_service_python`:
```bash
cd ml_service_python
```

### b. Membuat Virtual Environment (Opsional tapi Disarankan)
```bash
python -m venv venv
```
Aktifkan virtual environment:
- **Windows:**
  ```bash
  .\venv\Scripts\activate
  # atau
  venv\Scripts\activate
  
  > Gunakan `.\venv\Scripts\activate` jika di PowerShell/cmd, dan `venv\Scripts\activate` jika di Command Prompt lama.
  ```
- **Linux/Mac:**
  ```bash
  source venv/bin/activate
  ```

### c. Install Dependencies
Install semua package yang dibutuhkan:
```bash
pip install -r requirements.txt
```


## 2. Menjalankan Script Machine Learning (Langsung)
Perintah berikut hanya digunakan jika Anda ingin menjalankan script secara langsung untuk keperluan development/testing logic di bawah blok `if __name__ == "__main__"`.

Biasanya, untuk menjalankan API FastAPI, **tidak perlu menjalankan** `python main.py`.

```bash
python main.py
```

> Untuk penggunaan API (production/testing endpoint), gunakan perintah uvicorn di bawah, **bukan** `python main.py`.

## 3. Menjalankan API FastAPI
Jalankan server API menggunakan uvicorn:
```bash
uvicorn main:app --reload
```
atau (jika ingin spesifik host dan port):
```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

## 4. Testing API

### a. Swagger UI (GUI)
Buka browser dan akses:
```
http://127.0.0.1:8000/docs
```
Di halaman ini, Anda bisa mencoba semua endpoint API secara interaktif.

### b. Contoh Test Endpoint via curl

**Cek Kemiripan Judul:**
```bash
curl -X POST "http://127.0.0.1:8000/check" -H "Content-Type: application/json" -d "{\"judul\": \"Contoh Judul Skripsi\"}"
```

**Tambah Data Manual:**
```bash
curl -X POST "http://127.0.0.1:8000/add-data-manual" -H "Content-Type: application/json" -d "{\"nama_mahasiswa\": \"Nama\", \"judul_ta\": \"Judul Skripsi\"}"
```

**Sync Data Manual:**
```bash
curl http://127.0.0.1:8000/sync
```

## 5. Catatan
- Jika ada error terkait package yang belum terinstall, pastikan sudah menjalankan perintah install dependencies di atas.
- Jika ingin keluar dari virtual environment:
  ```bash
  deactivate
  ```

## 6. Troubleshooting
- **Python tidak dikenali:** Pastikan Python sudah terinstall dan ditambahkan ke PATH.
- **Permission denied:** Jalankan terminal sebagai administrator atau gunakan perintah `sudo` (untuk Linux/Mac).
- **uvicorn tidak ditemukan:** Pastikan sudah install dependencies, atau install manual dengan `pip install uvicorn`.

---