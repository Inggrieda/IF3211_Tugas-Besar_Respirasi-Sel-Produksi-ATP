from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import accuracy_score, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


BASE_DIR = Path(__file__).resolve().parent
MERGED_DATASET_PATH = BASE_DIR / "merged_dataset.csv"
OUTPUT_DIR = BASE_DIR / "artifacts"

TARGET_COLS = ["Workout_Type", "MET", "Description"]


def regression_accuracy(y_true, y_pred, tolerance: float = 0.10) -> float:
    y_true = np.asarray(y_true)
    y_pred = np.asarray(y_pred)
    relative_error = np.abs(y_true - y_pred) / np.maximum(np.abs(y_true), 1e-9)
    return float(np.mean(relative_error <= tolerance))


def train_all() -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)

    df = pd.read_csv(MERGED_DATASET_PATH)
    feature_cols = [col for col in df.columns if col not in TARGET_COLS]

    X = df[feature_cols]
    y = df[TARGET_COLS]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42
    )

    print(f"Dataset   : {len(df):,} rows")
    print(f"Features  : {feature_cols}")
    print(f"X_train: {X_train.shape}, X_test: {X_test.shape}")

    # --- MET regression ---
    print("\n=== MET Models ===")
    y_met_train, y_met_test = y_train["MET"], y_test["MET"]

    met_models = {
        "Linear Regression": Pipeline([
            ("scaler", StandardScaler()),
            ("model", LinearRegression()),
        ]),
        "Random Forest Regressor": Pipeline([
            ("model", RandomForestRegressor(
                n_estimators=200, random_state=42, max_depth=12, min_samples_leaf=3
            )),
        ]),
    }

    rows = []
    for name, pipeline in met_models.items():
        pipeline.fit(X_train, y_met_train)
        preds = pipeline.predict(X_test)
        rows.append({
            "model": name,
            "accuracy (±10%)": regression_accuracy(y_met_test, preds),
            "mse": mean_squared_error(y_met_test, preds),
            "r2": r2_score(y_met_test, preds),
        })
        joblib.dump(pipeline, OUTPUT_DIR / f"{name.lower().replace(' ', '_')}.joblib")

    metrics = pd.DataFrame(rows).sort_values(by=["r2", "mse"], ascending=[False, True])
    print(metrics.to_string(index=False))

    # --- Workout_Type classifier ---
    print("\n=== Workout Type Classifier ===")
    y_wt_train, y_wt_test = y_train["Workout_Type"], y_test["Workout_Type"]

    clf = Pipeline([
        ("model", RandomForestClassifier(
            n_estimators=200, random_state=42, max_depth=12, min_samples_leaf=3
        )),
    ])
    clf.fit(X_train, y_wt_train)
    acc = accuracy_score(y_wt_test, clf.predict(X_test))
    joblib.dump(clf, OUTPUT_DIR / "workout_type_classifier.joblib")

    print(f"Accuracy : {acc:.4f}")
    print(f"Classes  : {sorted(y_wt_train.unique().tolist())}")

    metrics.to_csv(OUTPUT_DIR / "model_metrics.csv", index=False)
    print("\nArtifacts saved to:", OUTPUT_DIR)


if __name__ == "__main__":
    train_all()
