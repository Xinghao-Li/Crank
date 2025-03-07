import pandas as pd
import joblib
import torch
import os
import shap
import numpy as np
from sklearn.preprocessing import StandardScaler


def Get_shap_values(save_dir, x_test, y_test, seed, features):
    try:
        os.makedirs(save_dir + '/data', exist_ok=True)
        os.makedirs(save_dir + '/values', exist_ok=True)

        df = pd.DataFrame(features)

        x = df.iloc[:, :].to_numpy()
        y = y_test

        # Load model
        ckpt_filepath = '{}/checkpoints'.format(save_dir)
        for ckpt_filename in os.listdir(ckpt_filepath):
            model = joblib.load('{}/test_{}.ckpt'.format(ckpt_filepath, seed))

            print(f"Model type: {type(model)}")
            print(f"x shape: {x.shape}")

            # Transform data
            x_ = model.norm_obj_.transform(x)

            print(f"x_ shape: {x_.shape}")

            try:
                max_evals = df.shape[1] * 2 + 1 
                print('max_evals:',max_evals)

                explainer = shap.PermutationExplainer(model.predict, x_, max_evals=max_evals)
                shap_values = explainer(x_)
            except Exception as e:
                print(f"Error in SHAP calculation: {str(e)}")

            feature_values = pd.DataFrame(list(shap_values.values))
            feature_data = pd.DataFrame(list(shap_values.data))

            # save results 
            feature_values.to_csv('{}/values/test_{}.ckpt_values.csv'.format(save_dir, seed), index=False)
            feature_data.to_csv('{}/data/test_{}.ckpt_data.csv'.format(save_dir, seed), index=False)

            return True
    except Exception as e:
        print(f"Error in Get_shap_values: {str(e)}")
        return False
