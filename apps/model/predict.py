"""
Inference bridge: baca JSON dari stdin, jalankan model .joblib, tulis JSON ke stdout.

Model:
  linear_regression.joblib        -> prediksi MET langsung
  random_forest_regressor.joblib  -> prediksi MET langsung
  workout_type_classifier.joblib  -> prediksi Workout_Type

Kalori diturunkan dari MET: calories = MET * weight_kg * duration_hours

Input JSON wajib:
  weight (kg), height (m), duration (menit), age, gender, activity
"""

import json
import sys
from pathlib import Path

import joblib

from model_features import (
    build_feature_frame,
    calories_from_met,
    intensity_level,
    select_recommended_prediction,
)


BASE_DIR = Path(__file__).resolve().parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"

WORKOUT_DESCRIPTIONS: dict[str, str] = {
    "Cardio": "Latihan kardiovaskular: lari, bersepeda, berenang, atau aktivitas aerobik lainnya",
    "HIIT": "High-Intensity Interval Training: latihan intensitas tinggi dengan jeda pemulihan singkat",
    "Low Strength": "Latihan kekuatan ringan: gerakan sederhana atau beban tubuh dengan intensitas rendah",
    "Strength": "Latihan kekuatan sedang-berat: angkat beban atau resistance training",
}


def load_model(filename: str):
    path = ARTIFACTS_DIR / filename
    if not path.exists():
        raise FileNotFoundError(
            f"Artifact model tidak ditemukan: {path}. Jalankan train_calorie_models.py dulu."
        )
    return joblib.load(path)


def load_model_selection() -> dict:
    path = ARTIFACTS_DIR / "model_selection.json"
    if not path.exists():
        return {"recommended_model": "Random Forest Regressor"}

    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def main() -> None:
    payload: dict = json.loads(sys.stdin.read())

    features = build_feature_frame(payload)
    weight = float(payload["weight"])
    duration_hours = float(payload["duration"]) / 60.0

    lr_model = load_model("linear_regression.joblib")
    rf_model = load_model("random_forest_regressor.joblib")
    clf_model = load_model("workout_type_classifier.joblib")

    lr_met = float(lr_model.predict(features)[0])
    rf_met = float(rf_model.predict(features)[0])
    workout_type = str(clf_model.predict(features)[0])
    model_selection = load_model_selection()
    recommended_model, met = select_recommended_prediction(
        {
            "Linear Regression": lr_met,
            "Random Forest Regressor": rf_met,
        },
        str(model_selection["recommended_model"]),
    )

    lr_calories = calories_from_met(lr_met, weight, duration_hours)
    rf_calories = calories_from_met(rf_met, weight, duration_hours)
    calories = calories_from_met(met, weight, duration_hours)
    description = WORKOUT_DESCRIPTIONS.get(workout_type, workout_type)

    print(json.dumps({
        "met": round(met, 4),
        "lr_met": round(lr_met, 4),
        "rf_met": round(rf_met, 4),
        "calories": round(calories, 2),
        "lr_calories": round(lr_calories, 2),
        "rf_calories": round(rf_calories, 2),
        "workout_type": workout_type,
        "description": description,
        "bmi": round(float(features.loc[0, "BMI_Calculated"]), 2),
        "intensity_level": intensity_level(met),
        "recommended_model": recommended_model,
    }))


if __name__ == "__main__":
    main()
