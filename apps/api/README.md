# Respirasi Sel – ATP Calculator API

Backend NestJS untuk menghitung kalori dan ATP dari aktivitas olahraga menggunakan nilai MET.

## Menjalankan Server

```bash
# Dari root monorepo
npm run dev:api

# Atau langsung dari apps/api
npm run start:dev
```

Server berjalan di `http://localhost:3000`.
Swagger UI tersedia di `http://localhost:3000/docs`.

---

## Endpoint: POST /calculator/calculate

### Rumus

```
kalori  = MET × berat_kg × (durasi_menit / 60)
ATP     = kalori / 7.3
```

- **MET** → hasil prediksi model ML (saat ini: placeholder 5.0)
- **workout_type** & **description** → hasil prediksi model ML kedua (saat ini: placeholder)

### Request Body

```json
{
  "weight": 70,
  "duration": 30,
  "age": 25,
  "gender": "Male",
  "height": 1.75,
  "max_bpm": 185,
  "avg_bpm": 140,
  "resting_bpm": 65,
  "fat_percentage": 20.5,
  "water_intake": 2.5,
  "workout_frequency": 3,
  "experience_level": 2
}
```

| Field               | Wajib | Keterangan                            |
|---------------------|-------|---------------------------------------|
| `weight`            | Ya    | Berat badan (kg)                      |
| `duration`          | Ya    | Durasi olahraga (menit)               |
| `age`               | Ya    | Usia pengguna                         |
| `gender`            | Ya    | `"Male"` atau `"Female"`              |
| `height`            | Ya    | Tinggi badan (meter)                  |
| `max_bpm`           | Ya    | Detak jantung maksimum                |
| `avg_bpm`           | Ya    | Detak jantung rata-rata sesi          |
| `resting_bpm`       | Ya    | Detak jantung istirahat               |
| `fat_percentage`    | Tidak | Persentase lemak tubuh                |
| `water_intake`      | Tidak | Asupan air (liter)                    |
| `workout_frequency` | Tidak | Frekuensi olahraga per minggu         |
| `experience_level`  | Tidak | 1=pemula, 2=menengah, 3=mahir         |

### Response

```json
{
  "prediction": {
    "met": 5.0,
    "workout_type": "Cardio",
    "description": "General cardio activity"
  },
  "weight": 70,
  "duration_minutes": 30,
  "duration_hours": 0.5,
  "calories": 175.0,
  "atp": 23.97
}
```

### Contoh dengan curl

```bash
curl -X POST http://localhost:3000/calculator/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "weight": 70,
    "duration": 30,
    "age": 25,
    "gender": "Male",
    "height": 1.75,
    "max_bpm": 185,
    "avg_bpm": 140,
    "resting_bpm": 65
  }'
```

---

## Panduan Integrasi Model ML

### Cara mengganti placeholder MET

Buka `src/calculator/calculator.service.ts`, method `predictMET()`.

**Jika model Python (Flask/FastAPI)**:
1. Tambahkan `HttpModule` dari `@nestjs/axios` ke `CalculatorModule`
2. Inject `HttpService` di `CalculatorService`
3. Ganti body method dengan:
   ```typescript
   const res = await firstValueFrom(
     this.httpService.post('http://localhost:5000/predict/met', input)
   );
   return res.data.met;
   ```

**Jika model file `.pkl` / `.onnx`**:
- Gunakan `child_process.spawn` untuk memanggil script Python inference, atau
- Gunakan library `onnxruntime-node` jika model diekspor ke ONNX

### Cara mengganti placeholder Workout Type & Description

Buka method `predictWorkout()` di file yang sama, ikuti pola yang sama seperti `predictMET()`.
Return object `{ workout_type: string, description: string }`.

---

## Struktur File Terkait

```
src/calculator/
├── dto/
│   ├── calculate-request.dto.ts   ← field input (tambah/hapus sesuai kebutuhan model)
│   └── calculate-response.dto.ts  ← shape response API
├── calculator.service.ts          ← PLACEHOLDER MODEL ADA DI SINI
├── calculator.controller.ts       ← definisi endpoint POST /calculator/calculate
└── calculator.module.ts           ← module declaration
```
