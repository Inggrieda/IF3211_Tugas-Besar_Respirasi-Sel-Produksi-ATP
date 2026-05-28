from pathlib import Path
import json

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import accuracy_score, mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import GroupShuffleSplit, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from model_features import FEATURE_COLUMNS, build_training_features


BASE_DIR = Path(__file__).resolve().parent
MERGED_DATASET_PATH = BASE_DIR / "merged_dataset.csv"
OUTPUT_DIR = BASE_DIR / "artifacts"

NUMERIC_FEATURES = [
    "Age",
    "Weight (kg)",
    "Height (m)",
    "Session_Duration (hours)",
    "BMI_Calculated",
]
CATEGORICAL_FEATURES = ["Gender", "Activity", "Intensity_Level"]
GYM_ID_COLUMNS = [
    "Age",
    "Gender",
    "Weight (kg)",
    "Height (m)",
    "Max_BPM",
    "Avg_BPM",
    "Resting_BPM",
    "Session_Duration (hours)",
    "Calories_Burned",
    "Workout_Type",
    "Fat_Percentage",
    "Water_Intake (liters)",
    "Workout_Frequency (days/week)",
    "Experience_Level",
    "BMI",
]


def regression_accuracy(y_true, y_pred, tolerance: float = 0.10) -> float:
    y_true = np.asarray(y_true)
    y_pred = np.asarray(y_pred)
    relative_error = np.abs(y_true - y_pred) / np.maximum(np.abs(y_true), 1e-9)
    return float(np.mean(relative_error <= tolerance))


def regression_accuracy_absolute(y_true, y_pred, tolerance: float = 1.0) -> float:
    y_true = np.asarray(y_true)
    y_pred = np.asarray(y_pred)
    return float(np.mean(np.abs(y_true - y_pred) <= tolerance))


def build_preprocessor() -> ColumnTransformer:
    return ColumnTransformer([
        ("numeric", StandardScaler(), NUMERIC_FEATURES),
        ("categorical", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
    ])


def make_pipeline(model) -> Pipeline:
    return Pipeline([
        ("preprocessor", build_preprocessor()),
        ("model", model),
    ])


def add_gym_group_id(df: pd.DataFrame) -> pd.DataFrame:
    grouped = df.copy()
    grouped["gym_group_id"] = grouped.groupby(GYM_ID_COLUMNS, sort=False).ngroup()
    return grouped


def train_all() -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)

    df = add_gym_group_id(pd.read_csv(MERGED_DATASET_PATH))

    X = build_training_features(df)
    y_met = df["MET"]
    y_workout_type = df["Workout_Type"]
    groups = df["gym_group_id"]

    splitter = GroupShuffleSplit(n_splits=1, test_size=0.3, random_state=42)
    train_idx, test_idx = next(splitter.split(X, y_met, groups=groups))

    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_met_train, y_met_test = y_met.iloc[train_idx], y_met.iloc[test_idx]

    X_train_clf, X_test_clf, y_wt_train, y_wt_test = train_test_split(
        X,
        y_workout_type,
        test_size=0.3,
        random_state=42,
        stratify=y_workout_type,
    )

    print(f"Dataset   : {len(df):,} rows")
    print(f"Gym groups: {df['gym_group_id'].nunique():,}")
    print(f"Features  : {FEATURE_COLUMNS}")
    print(f"X_train: {X_train.shape}, X_test: {X_test.shape}")

    print("\n=== MET Models ===")
    met_models = {
        "Linear Regression": make_pipeline(LinearRegression()),
        "Random Forest Regressor": make_pipeline(RandomForestRegressor(
            n_estimators=300,
            random_state=42,
            max_depth=8,
            min_samples_leaf=50,
            n_jobs=-1,
        )),
    }

    rows = []
    for name, pipeline in met_models.items():
        pipeline.fit(X_train, y_met_train)
        preds = pipeline.predict(X_test)
        rows.append({
            "model": name,
            "mae_met": mean_absolute_error(y_met_test, preds),
            "rmse_met": np.sqrt(mean_squared_error(y_met_test, preds)),
            "mse": mean_squared_error(y_met_test, preds),
            "r2": r2_score(y_met_test, preds),
            "accuracy_pm_10pct": regression_accuracy(y_met_test, preds),
            "accuracy_pm_1_met": regression_accuracy_absolute(y_met_test, preds),
        })
        filename = name.lower().replace(" ", "_")
        joblib.dump(pipeline, OUTPUT_DIR / f"{filename}.joblib")

    metrics = pd.DataFrame(rows).sort_values(by=["r2", "mse"], ascending=[False, True])
    print(metrics.to_string(index=False))

    best_model = str(metrics.iloc[0]["model"])
    with open(OUTPUT_DIR / "model_selection.json", "w", encoding="utf-8") as f:
        json.dump(
            {
                "target": "MET",
                "recommended_model": best_model,
                "selection_metric": "r2_then_mse",
                "feature_columns": FEATURE_COLUMNS,
            },
            f,
            indent=2,
        )
    joblib.dump(
        joblib.load(OUTPUT_DIR / f"{best_model.lower().replace(' ', '_')}.joblib"),
        OUTPUT_DIR / "best_met_model.joblib",
    )
    print(f"\nRecommended MET model: {best_model}")

    print("\n=== Workout Type Classifier ===")
    clf = make_pipeline(RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        max_depth=18,
        min_samples_leaf=2,
        n_jobs=-1,
    ))
    clf.fit(X_train_clf, y_wt_train)
    acc = accuracy_score(y_wt_test, clf.predict(X_test_clf))
    joblib.dump(clf, OUTPUT_DIR / "workout_type_classifier.joblib")

    print(f"Accuracy : {acc:.4f}")
    print(f"Classes  : {sorted(y_wt_train.unique().tolist())}")

    metrics.to_csv(OUTPUT_DIR / "model_metrics.csv", index=False)
    print("\nArtifacts saved to:", OUTPUT_DIR)


if __name__ == "__main__":
    train_all()
