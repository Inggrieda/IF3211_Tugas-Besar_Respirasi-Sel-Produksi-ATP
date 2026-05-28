import math
from typing import Any

import pandas as pd


FEATURE_COLUMNS = [
    "Age",
    "Gender",
    "Weight (kg)",
    "Height (m)",
    "Session_Duration (hours)",
    "Activity",
    "Intensity_Level",
    "BMI_Calculated",
]

VALID_INTENSITY_LEVELS = {"Low", "Medium", "High", "Very High"}


def calculate_bmi(weight: float, height: float) -> float:
    return weight / (height ** 2)


def intensity_level(met: float) -> str:
    if met <= 4:
        return "Low"
    if met <= 6:
        return "Medium"
    if met <= 10:
        return "High"
    return "Very High"


def calories_from_met(met: float, weight: float, duration_hours: float) -> float:
    return met * weight * duration_hours


def select_recommended_prediction(
    predictions: dict[str, float],
    recommended_model: str,
) -> tuple[str, float]:
    if recommended_model in predictions:
        return recommended_model, predictions[recommended_model]

    fallback_model = next(iter(predictions))
    return fallback_model, predictions[fallback_model]


def build_training_features(df: pd.DataFrame) -> pd.DataFrame:
    features = df.copy()
    features["BMI_Calculated"] = features["Weight (kg)"] / (features["Height (m)"] ** 2)
    features["Intensity_Level"] = features["MET"].map(intensity_level)
    return features[FEATURE_COLUMNS]


def build_feature_frame(payload: dict[str, Any]) -> pd.DataFrame:
    weight = float(payload["weight"])
    height = float(payload["height"])
    duration_hours = float(payload["duration"]) / 60.0

    row = {
        "Age": int(payload["age"]),
        "Gender": str(payload["gender"]).title(),
        "Weight (kg)": weight,
        "Height (m)": height,
        "Session_Duration (hours)": duration_hours,
        "Activity": str(payload["activity"]),
        "Intensity_Level": str(payload["intensity"]),
        "BMI_Calculated": calculate_bmi(weight, height),
    }

    if not math.isfinite(row["BMI_Calculated"]):
        raise ValueError("BMI tidak valid; pastikan tinggi badan lebih dari 0")

    if row["Intensity_Level"] not in VALID_INTENSITY_LEVELS:
        raise ValueError("Intensitas tidak valid; gunakan Low, Medium, High, atau Very High")

    return pd.DataFrame([row], columns=FEATURE_COLUMNS)
