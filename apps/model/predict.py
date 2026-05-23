"""
Inference bridge: baca JSON dari stdin, jalankan 3 model .joblib, tulis JSON ke stdout.

Model:
  linear_regression.joblib        → prediksi MET langsung
  random_forest_regressor.joblib  → prediksi MET langsung (lebih akurat)
  workout_type_classifier.joblib  → prediksi Workout_Type (accuracy=75%)

Kalori diturunkan dari MET: calories = MET × weight_kg × duration_hours

Input JSON wajib:
  weight (kg), height (m), duration (menit), age, gender, activity

Nilai valid untuk activity:
  Bicycling, Conditioning Exercise, Dancing, Fishing & Hunting, House Chores,
  Miscellaneous, Occupation, Running, Sports, Transportation,
  Walking, Water Activities, Winter Activities
"""

import json
import sys
from pathlib import Path

import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"

# Rata-rata MET per kategori Activity dari merged_dataset.csv
ACTIVITY_MET: dict[str, float] = {
    "Bicycling": 7.72,
    "Conditioning Exercise": 6.03,
    "Dancing": 6.42,
    "Fishing & Hunting": 3.66,
    "House Chores": 3.82,
    "Miscellaneous": 1.94,
    "Occupation": 4.43,
    "Running": 11.18,
    "Sports": 6.74,
    "Transportation": 4.49,
    "Walking": 5.77,
    "Water Activities": 6.87,
    "Winter Activities": 8.95,
}

WORKOUT_DESCRIPTIONS: dict[str, str] = {
    "Cardio": "Latihan kardiovaskular: lari, bersepeda, berenang, atau aktivitas aerobik lainnya",
    "HIIT": "High-Intensity Interval Training: latihan intensitas tinggi dengan jeda pemulihan singkat",
    "Low Strength": "Latihan kekuatan ringan: gerakan sederhana atau beban tubuh dengan intensitas rendah",
    "Strength": "Latihan kekuatan sedang-berat: angkat beban, resistance training",
}


def intensity_level(activity_met: float) -> str:
    if activity_met <= 4:
        return "Low"
    if activity_met <= 6:
        return "Medium"
    if activity_met <= 10:
        return "High"
    return "Very High"


def main() -> None:
    payload: dict = json.loads(sys.stdin.read())

    weight: float = float(payload["weight"])
    height: float = float(payload["height"])
    duration_hours: float = float(payload["duration"]) / 60.0
    age: int = int(payload["age"])
    gender: str = payload["gender"]
    activity: str = payload["activity"]

    bmi = weight / (height ** 2)
    act_met = ACTIVITY_MET.get(activity, 5.0)
    intensity = intensity_level(act_met)

    features = pd.DataFrame([{
        "Age": age,
        "Gender": gender,
        "BMI_Calculated": bmi,
        "Session_Duration (hours)": duration_hours,
        "Activity_MET": act_met,
        "Activity": activity,
        "Intensity_Level": intensity,
    }])

    lr_model = joblib.load(ARTIFACTS_DIR / "linear_regression.joblib")
    rf_model = joblib.load(ARTIFACTS_DIR / "random_forest_regressor.joblib")
    clf_model = joblib.load(ARTIFACTS_DIR / "workout_type_classifier.joblib")

    lr_met = float(lr_model.predict(features)[0])
    rf_met = float(rf_model.predict(features)[0])
    workout_type = str(clf_model.predict(features)[0])

    met = rf_met
    lr_calories = lr_met * weight * duration_hours
    rf_calories = rf_met * weight * duration_hours
    description = WORKOUT_DESCRIPTIONS.get(workout_type, workout_type)

    print(json.dumps({
        "met": round(met, 4),
        "lr_calories": round(lr_calories, 2),
        "rf_calories": round(rf_calories, 2),
        "workout_type": workout_type,
        "description": description,
        "bmi": round(bmi, 2),
        "intensity_level": intensity,
    }))


if __name__ == "__main__":
    main()
