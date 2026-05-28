import unittest

from model_features import (
    FEATURE_COLUMNS,
    build_feature_frame,
    calories_from_met,
    intensity_level,
    select_recommended_prediction,
)


class ModelFeatureTests(unittest.TestCase):
    def test_build_feature_frame_matches_training_schema(self):
        features = build_feature_frame({
            "weight": 70,
            "height": 1.75,
            "duration": 30,
            "age": 24,
            "gender": "Male",
            "activity": "Running",
            "intensity": "High",
        })

        self.assertEqual(list(features.columns), FEATURE_COLUMNS)
        self.assertEqual(features.loc[0, "Age"], 24)
        self.assertEqual(features.loc[0, "Gender"], "Male")
        self.assertEqual(features.loc[0, "Activity"], "Running")
        self.assertEqual(features.loc[0, "Intensity_Level"], "High")
        self.assertEqual(features.loc[0, "Session_Duration (hours)"], 0.5)
        self.assertAlmostEqual(features.loc[0, "BMI_Calculated"], 22.8571, places=4)

    def test_intensity_level_uses_predicted_met_thresholds(self):
        self.assertEqual(intensity_level(3.9), "Low")
        self.assertEqual(intensity_level(6.0), "Medium")
        self.assertEqual(intensity_level(8.5), "High")
        self.assertEqual(intensity_level(11.0), "Very High")

    def test_calories_are_derived_from_predicted_met(self):
        self.assertEqual(calories_from_met(met=8.0, weight=70, duration_hours=0.5), 280.0)

    def test_select_recommended_prediction_uses_training_metadata(self):
        predictions = {
            "Linear Regression": 6.5,
            "Random Forest Regressor": 7.25,
        }

        name, value = select_recommended_prediction(predictions, "Linear Regression")

        self.assertEqual(name, "Linear Regression")
        self.assertEqual(value, 6.5)


if __name__ == "__main__":
    unittest.main()
