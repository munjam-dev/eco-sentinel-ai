import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from app.core.logging import logger


class ModelTrainer:
    """Trains and serializes Scikit-learn / XGBoost models for offline retraining."""

    @staticmethod
    def train_baseline_models(output_dir: str = "app/ai/models"):
        os.makedirs(output_dir, exist_ok=True)
        
        # Synthetic Training Dataset Generation
        np.random.seed(42)
        X_flood = np.random.rand(500, 4) * [5.0, 100.0, 50.0, 2.0] # water, rain, temp, delta
        y_flood = (X_flood[:, 0] * 15.0) + (X_flood[:, 1] * 0.5)

        model = RandomForestRegressor(n_estimators=50, random_state=42)
        model.fit(X_flood, y_flood)

        file_path = os.path.join(output_dir, "flood_model.joblib")
        joblib.dump(model, file_path)
        logger.info(f"Successfully trained and saved flood model to {file_path}")
        return True
