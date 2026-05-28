# Bagian Metode: Pemodelan Prediksi MET dan Estimasi Kalori

## Arsitektur Machine Learning

Pemodelan dilakukan untuk memprediksi nilai `MET` berdasarkan input user berupa umur, gender, berat badan, tinggi badan, aktivitas, intensitas aktivitas, dan durasi latihan. Setelah nilai MET diprediksi, sistem menghitung estimasi kalori dengan rumus `kalori = MET x berat badan x durasi_jam`, lalu menghitung ATP dari hasil kalori tersebut. Dengan pendekatan ini, model machine learning fokus pada prediksi intensitas aktivitas, sedangkan perhitungan kalori dan ATP dilakukan secara deterministik.

Tahap preprocessing menggunakan dataset final `merged_dataset.csv` yang sudah menggabungkan data latihan gym dengan data MET. Feature yang digunakan sengaja disamakan dengan input yang tersedia pada aplikasi, yaitu `Age`, `Gender`, `Weight (kg)`, `Height (m)`, `Session_Duration (hours)`, `Activity`, `Intensity_Level`, dan feature turunan `BMI_Calculated`. BMI dihitung otomatis menggunakan rumus `BMI = berat badan / tinggi badan^2`, sehingga user tidak perlu memasukkan BMI secara manual.

Fitur numerik diproses menggunakan `StandardScaler`, sedangkan fitur kategorikal seperti gender, aktivitas, dan intensitas diproses menggunakan `OneHotEncoder`. Seluruh tahapan preprocessing dan model digabungkan dalam `Pipeline` agar proses training dan prediksi konsisten. Dua model regresi digunakan, yaitu Linear Regression sebagai baseline dan Random Forest Regressor sebagai pembanding non-linear. Model terbaik dipilih dari hasil evaluasi, lalu disimpan sebagai rekomendasi model untuk proses inference.

## Evaluasi Model

Data dibagi menjadi data latih dan data uji dengan `GroupShuffleSplit` dan `random_state=42` agar hasil eksperimen dapat direproduksi. Pembagian dilakukan berdasarkan grup data gym asli, bukan baris hasil merge, untuk mengurangi risiko data leakage antara data latih dan data uji.

Setelah model dilatih, performa dievaluasi menggunakan MAE, RMSE, MSE, R-Squared, akurasi toleransi +/-10%, dan akurasi toleransi +/-1 MET. MAE menunjukkan rata-rata besar kesalahan prediksi dalam satuan MET, sedangkan R-Squared mengukur seberapa besar variasi target yang dapat dijelaskan oleh model.

Hasil evaluasi training terbaru adalah sebagai berikut:

| Model | MAE MET | RMSE MET | MSE | R-Squared | Accuracy +/-10% | Accuracy +/-1 MET |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Random Forest Regressor | 0.7862 | 1.0653 | 1.1349 | 0.9049 | 0.3764 | 0.7383 |
| Linear Regression | 0.8060 | 1.0912 | 1.1907 | 0.9003 | 0.3527 | 0.7364 |

Berdasarkan R-Squared tertinggi dan MSE terendah, model yang direkomendasikan untuk prediksi MET adalah Random Forest Regressor. Penambahan fitur intensitas meningkatkan performa secara signifikan karena MET sangat dipengaruhi oleh tingkat intensitas aktivitas, bukan hanya kategori aktivitas umum.

## Penjelasan untuk Presentasi Video

Pada bagian machine learning, kami menggunakan dua model yaitu Linear Regression dan Random Forest Regressor untuk memprediksi MET. Nilai MET yang diprediksi kemudian digunakan untuk menghitung kalori dengan rumus `MET x berat badan x durasi_jam`, lalu hasil kalori digunakan untuk menghitung estimasi ATP.

Input dari user berupa usia, gender, berat badan, tinggi badan, aktivitas, intensitas, dan durasi latihan. Sistem menghitung BMI secara otomatis, lalu model memprediksi MET dari data tersebut. Fitur numerik distandarisasi, sedangkan fitur kategorikal diubah menjadi bentuk numerik menggunakan one-hot encoding. Setelah itu sistem menghitung kalori dan ATP dari nilai MET hasil prediksi.

Evaluasi dilakukan dengan MAE, RMSE, MSE, R-Squared, dan akurasi toleransi. Pada hasil training terbaru, Random Forest Regressor menjadi model rekomendasi karena memiliki R-Squared tertinggi dan MSE terendah dibanding Linear Regression untuk target MET.

## Daftar Pustaka

1. Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O., Blondel, M., Prettenhofer, P., Weiss, R., Dubourg, V., Vanderplas, J., Passos, A., Cournapeau, D., Brucher, M., Perrot, M., & Duchesnay, E. (2011). Scikit-learn: Machine Learning in Python. Journal of Machine Learning Research, 12, 2825-2830.
2. Breiman, L. (2001). Random Forests. Machine Learning, 45, 5-32.
3. James, G., Witten, D., Hastie, T., & Tibshirani, R. (2021). An Introduction to Statistical Learning. Springer.
4. World Health Organization. (2024). Body mass index. https://www.who.int/
5. Ainsworth, B. E., Haskell, W. L., Herrmann, S. D., Meckes, N., Bassett, D. R., Tudor-Locke, C., Greer, J. L., Vezina, J., Whitt-Glover, M. C., & Leon, A. S. (2011). 2011 Compendium of Physical Activities. Medicine & Science in Sports & Exercise, 43(8), 1575-1581.
