import os
import re
import pickle
import numpy as np
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from sqlalchemy import create_engine
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# 1. INISIALISASI APP & MODEL
app = FastAPI(title="Sistem PRADATA - ML Service Final")

# Konfigurasi Database (Sesuaikan kredensial jika perlu)
DB_URL = "mysql+pymysql://root:@localhost:3306/db_ta_siunand"
engine = create_engine(DB_URL)

# Konfigurasi Path Cache
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
embeddings_path = os.path.join(BASE_DIR, 'embeddings_ta_siunand.pkl')
dataframe_path = os.path.join(BASE_DIR, 'dataframe_ta_siunand.pkl')

print("🔄 Sedang memuat model SBERT...")
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# Variable Global RAM
loaded_embeddings = None
loaded_df = None

# Stopwords Khusus SI Unand
stopwords_unand = [
    'dan', 'pada', 'di', 'untuk', 'dengan', 'ke', 'dari', 'yang',
    'sistem', 'informasi', 'pembangunan', 'berbasis', 'menggunakan',
    'padang', 'kota', 'andalas', 'universitas', 'studi', 'kasus',
    'sumatera', 'barat', 'melalui'
]

# ==============================================================================
# 2. FUNGSI PEMBERSIHAN (LOGIKA SESUAI IPYNB)
# ==============================================================================

def cleaning_tahap_1(text):
    """Lowercasing & Symbol Removal -> Untuk kolom judul_clean"""
    if text is None or pd.isna(text):
        return ""
    text = str(text).lower()
    text = re.sub(r'[^a-z\s]', ' ', text)
    return ' '.join(text.split())

def cleaning_tahap_2(text_clean):
    """Stopwords Removal -> Untuk kolom judul_final"""
    tokens = text_clean.split()
    return ' '.join([t for t in tokens if t not in stopwords_unand])

def load_and_sync_data():
    """Mengambil data dari DB, validasi format, dan simpan ke RAM + Cache"""
    global loaded_embeddings, loaded_df
    try:
        print("🔄 Sinkronisasi: Mengambil data terbaru dari MySQL...")
        query = "SELECT `Nama/BP`, `Judul Tugas Akhir`, `judul_clean`, `judul_final` FROM tugas_akhir_bersih"
        df_db = pd.read_sql(query, engine)
        
        # Bersihkan data yang null
        df_db = df_db.dropna(subset=['Judul Tugas Akhir'])
        
        if df_db.empty:
            raise ValueError("Database kosong.")

        # Self-healing: Pastikan semua kolom format terisi
        df_db['judul_clean'] = df_db['Judul Tugas Akhir'].apply(cleaning_tahap_1)
        df_db['judul_final'] = df_db['judul_clean'].apply(cleaning_tahap_2)
        
        # Filter jika hasil akhirnya kosong
        df_db = df_db[df_db['judul_final'] != ""]

        print(f"⌛ Mengencode {len(df_db)} judul ke vektor SBERT...")
        embeddings = model.encode(df_db['judul_final'].tolist(), show_progress_bar=True)
        
        loaded_df = df_db
        loaded_embeddings = embeddings
        
        # Simpan ke cache .pkl
        with open(embeddings_path, 'wb') as f:
            pickle.dump(embeddings, f)
        df_db.to_pickle(dataframe_path)
        print(f"✅ Sinkronisasi Berhasil. Total data: {len(df_db)}")

    except Exception as e:
        print(f"⚠️ Gagal sinkronisasi DB ({e}). Memuat dari cache .pkl...")
        if os.path.exists(embeddings_path):
            with open(embeddings_path, 'rb') as f:
                loaded_embeddings = pickle.load(f)
            loaded_df = pd.read_pickle(dataframe_path)
            print(f"✅ Berhasil memuat {len(loaded_df)} data dari cache.")

# ==============================================================================
# 3. STARTUP EVENT (Menjalankan Sync & Print Info)
# ==============================================================================

@app.on_event("startup")
async def startup_event():
    # Jalankan sinkronisasi data
    load_and_sync_data()
    
    # Munculkan link di terminal agar tidak lupa
    print("\n" + "="*60)
    print("🚀 SISTEM PRADATA - ML SERVICE TELAH AKTIF")
    print("📂 Akses Swagger UI (Dokumentasi API) di tautan berikut:")
    print("👉 http://127.0.0.1:8000/docs")
    print("="*60 + "\n")

# ==============================================================================
# 4. SCHEMA & ENDPOINTS
# ==============================================================================

class JudulRequest(BaseModel):
    judul: str

class InputMandiriRequest(BaseModel):
    nama_mahasiswa: str
    judul_ta: str

@app.post("/check", summary="Cek Kemiripan Judul")
async def check_similarity(request: JudulRequest):
    if loaded_embeddings is None:
        return {"status": "ERROR", "message": "Data referensi tidak tersedia."}

    # Proses cleaning dua tahap
    clean = cleaning_tahap_1(request.judul)
    final = cleaning_tahap_2(clean)
    
    if not final:
        return {"status": "ERROR", "message": "Judul input tidak valid."}
        
    query_embedding = model.encode([final])
    scores = cosine_similarity(query_embedding, loaded_embeddings)[0]
    
    top_indices = np.argsort(scores)[-5:][::-1]
    max_score = float(np.max(scores))
    
    status = "HIJAU"
    if max_score >= 0.85: status = "MERAH"
    elif max_score >= 0.70: status = "KUNING"

    matches = []
    for idx in top_indices:
        matches.append({
            "judul": loaded_df['Judul Tugas Akhir'].iloc[idx],
            "penulis": loaded_df['Nama/BP'].iloc[idx],
            "skor": round(float(scores[idx]) * 100, 2)
        })

    return {"status": status, "max_score": round(max_score * 100, 2), "matches": matches}

@app.post("/add-data-manual", summary="Input Data & Auto-Clean")
async def add_data_manual(data: InputMandiriRequest):
    try:
        # Proses cleaning bertahap
        j_clean = cleaning_tahap_1(data.judul_ta)
        j_final = cleaning_tahap_2(j_clean)
        
        if not j_final:
            return {"status": "ERROR", "message": "Judul tidak valid untuk disimpan."}
            
        df_baru = pd.DataFrame({
            'Nama/BP': [data.nama_mahasiswa],
            'Judul Tugas Akhir': [data.judul_ta],
            'judul_clean': [j_clean],
            'judul_final': [j_final]
        })
        
        # Simpan ke MySQL
        df_baru.to_sql('tugas_akhir_bersih', con=engine, if_exists='append', index=False)
        
        # Update memori AI secara otomatis
        load_and_sync_data()
        
        return {"status": "SUCCESS", "message": f"Data {data.nama_mahasiswa} berhasil disimpan dan disinkronkan."}
    except Exception as e:
        return {"status": "ERROR", "message": str(e)}

@app.get("/sync", summary="Refresh Memori AI")
async def manual_sync():
    load_and_sync_data()
    return {"status": "SUCCESS", "total_data": len(loaded_df)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)