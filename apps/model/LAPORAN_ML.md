# Bagian Metode: Pemodelan Prediksi Kalori

## Arsitektur Machine Learning

Pemodelan dilakukan untuk memprediksi `Calories_Burned` berdasarkan input user berupa umur, gender, berat badan, tinggi badan, aktivitas, dan durasi latihan. Dari input tersebut, sistem membuat feature turunan berupa BMI, Activity MET, dan level intensitas. BMI dihitung otomatis menggunakan rumus `BMI = berat badan / tinggi badan^2`, sehingga user tidak perlu memasukkan BMI secara manual.

Tahap preprocessing menggunakan dataset final `merged_dataset.csv` yang sudah menggabungkan data latihan gym dengan data MET. Model menghitung ulang BMI menjadi `BMI_Calculated`, membuat `Activity_MET` dari rata-rata MET untuk setiap aktivitas, lalu membentuk `Intensity_Level` dari `Activity_MET` menjadi kategori Low, Medium, High, dan Very High. Fitur numerik diproses menggunakan `StandardScaler`, sedangkan fitur kategorikal seperti gender, activity, dan intensity level diproses menggunakan `OneHotEncoder`. Seluruh tahapan preprocessing dan model digabungkan dalam `Pipeline` agar proses training dan prediksi konsisten.

Dua model regresi digunakan. Model pertama adalah Linear Regression sebagai baseline karena sederhana dan mudah diinterpretasikan. Model kedua adalah Random Forest Regressor sebagai model utama karena lebih cocok untuk data tabular yang memiliki hubungan non-linear antara fitur, misalnya hubungan antara intensitas, durasi latihan, BMI, dan kalori yang terbakar.

## Evaluasi Model

Data dibagi menjadi data latih dan data uji dengan rasio 80:20 menggunakan `train_test_split` dan `random_state=42` agar hasil eksperimen dapat direproduksi. Setelah model dilatih, performa dievaluasi menggunakan Mean Squared Error dan R-Squared.

Mean Squared Error mengukur rata-rata kuadrat selisih antara nilai kalori aktual dan prediksi. Nilai MSE yang lebih kecil menunjukkan prediksi yang lebih dekat dengan nilai aktual. R-Squared mengukur seberapa besar variasi target yang dapat dijelaskan oleh model. Nilai R-Squared yang lebih mendekati 1 menunjukkan performa model yang lebih baik.

Model terbaik dipilih berdasarkan kombinasi MSE terendah dan R-Squared tertinggi. Linear Regression digunakan sebagai pembanding dasar, sedangkan Random Forest Regressor direkomendasikan sebagai model final karena mampu menangkap pola non-linear dan interaksi antar fitur dengan lebih baik.

## Penjelasan untuk Presentasi Video

Pada bagian machine learning, kami menggunakan dua model yaitu Linear Regression dan Random Forest Regressor. Linear Regression dipakai sebagai baseline supaya kami punya pembanding sederhana. Random Forest digunakan sebagai model utama karena data latihan dan kalori tidak selalu memiliki hubungan linear. Misalnya, efek durasi latihan terhadap kalori dapat berubah tergantung intensitas, tipe workout, BMI, dan detak jantung.

Input dari user berupa usia, gender, berat badan, tinggi badan, aktivitas, dan durasi latihan. Sistem menghitung BMI secara otomatis, lalu menurunkan estimasi MET dan level intensitas dari aktivitas yang dipilih. Fitur numerik distandarisasi, sedangkan fitur kategorikal diubah menjadi bentuk numerik menggunakan one-hot encoding. Setelah itu model memprediksi nilai calories burned.

Evaluasi dilakukan dengan MSE dan R-Squared. MSE menunjukkan besar error prediksi, sedangkan R-Squared menunjukkan seberapa baik model menjelaskan variasi data. Model dengan MSE lebih kecil dan R-Squared lebih tinggi dipilih sebagai model terbaik.

## Daftar Pustaka

1. Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O., Blondel, M., Prettenhofer, P., Weiss, R., Dubourg, V., Vanderplas, J., Passos, A., Cournapeau, D., Brucher, M., Perrot, M., & Duchesnay, E. (2011). Scikit-learn: Machine Learning in Python. Journal of Machine Learning Research, 12, 2825-2830.
2. Breiman, L. (2001). Random Forests. Machine Learning, 45, 5-32.
3. James, G., Witten, D., Hastie, T., & Tibshirani, R. (2021). An Introduction to Statistical Learning. Springer.
4. World Health Organization. (2024). Body mass index. https://www.who.int/
5. Ainsworth, B. E., Haskell, W. L., Herrmann, S. D., Meckes, N., Bassett, D. R., Tudor-Locke, C., Greer, J. L., Vezina, J., Whitt-Glover, M. C., & Leon, A. S. (2011). 2011 Compendium of Physical Activities. Medicine & Science in Sports & Exercise, 43(8), 1575-1581.
