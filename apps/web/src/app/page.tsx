"use client";

import { Activity, Flame, Loader2 } from "lucide-react";
import { useState } from "react";

const ACTIVITIES = [
  "Bicycling",
  "Conditioning Exercise",
  "Dancing",
  "Fishing & Hunting",
  "House Chores",
  "Miscellaneous",
  "Occupation",
  "Running",
  "Sports",
  "Transportation",
  "Walking",
  "Water Activities",
  "Winter Activities",
];

interface AnalysisResult {
  prediction: {
    met: number;
    workout_type: string;
    description: string;
    lr_calories: number;
    rf_calories: number;
    bmi: number;
    intensity_level: string;
  };
  weight: number;
  duration_minutes: number;
  duration_hours: number;
  calories: number;
  atp: number;
}

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Kurus";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obesitas";
}

export default function ATPDashboardCompact() {
  const [beratBadan, setBeratBadan] = useState("");
  const [tinggiBadan, setTinggiBadan] = useState("");
  const [durasi, setDurasi] = useState("");
  const [usia, setUsia] = useState("");
  const [gender, setGender] = useState("");
  const [aktivitas, setAktivitas] = useState("");

  const [hasil, setHasil] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalisis = async () => {
    const bb = parseFloat(beratBadan);
    const tb = parseFloat(tinggiBadan);
    const dur = parseFloat(durasi);
    const umur = parseFloat(usia);

    if (!bb || !tb || !dur || !umur || !gender || !aktivitas) {
      setError("Lengkapi semua field sebelum menganalisis.");
      return;
    }

    setError(null);
    setIsLoading(true);
    setHasil(null);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
      const response = await fetch(`${API_BASE}/calculator/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: bb,
          height: tb / 100,
          duration: dur,
          age: umur,
          gender,
          activity: aktivitas,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data: AnalysisResult = await response.json();
      setHasil(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menghubungi server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F5F5] px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#14213D]">
            Prediksi ATP
          </h1>

          <p className="mt-3 text-[#555] max-w-3xl">
            Sistem prediksi pembakaran kalori dan produksi ATP
            berdasarkan aktivitas fisik manusia menggunakan
            Machine Learning.
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* INPUT PANEL */}
          <div className="bg-white rounded-3xl border border-[#E5E5E5] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[#FCA311]/10 flex items-center justify-center">
                <Activity className="text-[#FCA311]" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#14213D]">
                  Input Pengguna
                </h2>

                <p className="text-sm text-[#666]">
                  Masukkan data aktivitas fisik
                </p>
              </div>
            </div>

            {/* FORM */}
            <div className="grid grid-cols-2 gap-5">
              <InputBox
                label="Berat Badan"
                placeholder="65"
                unit="kg"
                value={beratBadan}
                onChange={setBeratBadan}
              />

              <InputBox
                label="Tinggi Badan"
                placeholder="170"
                unit="cm"
                value={tinggiBadan}
                onChange={setTinggiBadan}
              />

              <InputBox
                label="Usia"
                placeholder="25"
                unit="thn"
                value={usia}
                onChange={setUsia}
              />

              <InputBox
                label="Durasi"
                placeholder="45"
                unit="menit"
                value={durasi}
                onChange={setDurasi}
              />

              {/* GENDER */}
              <div className="bg-[#F8F8F8] rounded-2xl p-5 border border-[#E5E5E5]">
                <label className="text-sm font-semibold text-[#14213D] block mb-3">
                  Gender
                </label>

                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={`w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 outline-none focus:border-[#FCA311] ${
                    gender ? "text-[#14213D]" : "text-[#B8B8B8]"
                  }`}
                >
                  <option value="">Pilih Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* AKTIVITAS */}
              <div className="bg-[#F8F8F8] rounded-2xl p-5 border border-[#E5E5E5]">
                <label className="text-sm font-semibold text-[#14213D] block mb-3">
                  Jenis Aktivitas
                </label>

                <select
                  value={aktivitas}
                  onChange={(e) => setAktivitas(e.target.value)}
                  className={`w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 outline-none focus:border-[#FCA311] ${
                    aktivitas ? "text-[#14213D]" : "text-[#B8B8B8]"
                  }`}
                >
                  <option value="">Pilih Aktivitas</option>
                  {ACTIVITIES.map((act) => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-500">{error}</p>
            )}

            <button
              onClick={handleAnalisis}
              disabled={isLoading}
              className="w-full mt-6 bg-[#FCA311] hover:opacity-90 disabled:opacity-50 transition-all text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Menganalisis...
                </>
              ) : (
                "Analisis ATP"
              )}
            </button>
          </div>

          {/* OUTPUT PANEL */}
          <div className="bg-[#14213D] rounded-3xl p-8 text-white shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Flame className="text-[#FCA311]" />
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  Hasil Analisis
                </h2>

                <p className="text-sm text-white/60">
                  Output prediksi metabolisme
                </p>
              </div>
            </div>

            {hasil ? (
              <>
                {/* RESULT GRID */}
                <div className="grid grid-cols-2 gap-5">
                  <ResultCard
                    title="Prediksi MET"
                    value={`${hasil.prediction.met.toFixed(1)} MET`}
                  />

                  <ResultCard
                    title="Workout Type"
                    value={hasil.prediction.workout_type}
                  />

                  <ResultCard
                    title="Kalori yang Dihasilkan"
                    value={`${hasil.calories.toFixed(0)} kcal`}
                  />

                  <ResultCard
                    title="ATP"
                    value={`${hasil.atp.toFixed(2)} mol`}
                  />
                </div>

                {/* EXTRA INFO */}
                <div className="mt-8 bg-white/10 rounded-2xl p-5 border border-white/10">
                  <h3 className="font-semibold text-lg mb-4">
                    Informasi Tambahan
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">BMI</span>
                      <span>{hasil.prediction.bmi.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-white/70">Kategori BMI</span>
                      <span>{getBmiCategory(hasil.prediction.bmi)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-white/70">Intensitas</span>
                      <span>{hasil.prediction.intensity_level}</span>
                    </div>

                    <div className="flex justify-between items-start gap-4">
                      <span className="text-white/70 shrink-0">Deskripsi</span>
                      <span className="text-right text-xs leading-relaxed">
                        {hasil.prediction.description}
                      </span>
                    </div>
                  </div>
                </div>

                {/* METABOLISM */}
                {/* <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">
                    Jalur Metabolisme
                  </h3>

                  <div className="space-y-4">
                    <ProgressBar label="Glikolisis" value={10} />
                    <ProgressBar label="Siklus Krebs" value={20} />
                    <ProgressBar label="Electron Transport Chain" value={70} />
                  </div>
                </div> */}
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-white/60 border border-white/10 rounded-3xl py-20">
                {isLoading
                  ? "Memproses data dengan model ML..."
                  : "Isi data pengguna lalu tekan Analisis ATP."}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function InputBox({
  label,
  placeholder,
  unit,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="bg-[#F8F8F8] rounded-2xl p-5 border border-[#E5E5E5]">
      <label className="text-sm font-semibold text-[#14213D] block mb-3">
        {label}
      </label>

      <div className="relative">
        <input
          type="number"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white text-[#14213D] placeholder:text-[#B8B8B8] border border-[#E5E5E5] rounded-xl px-4 py-3 pr-14 outline-none focus:border-[#FCA311] focus:text-[#14213D]"
        />

        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#777]">
          {unit}
        </span>
      </div>
    </div>
  );
}

function ResultCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white/10 border border-white/10 rounded-2xl p-5">
      <p className="text-sm text-white/60">{title}</p>
      <h3 className="mt-3 text-2xl font-bold">{value}</h3>
    </div>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between mb-2 text-sm">
        <span>{label}</span>
        <span>{value}%</span>
      </div>

      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#FCA311] rounded-full"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
