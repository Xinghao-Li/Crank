
import sklearn
import pandas as pd
from sklearn import svm
from sklearn.ensemble import RandomForestClassifier as rf
from torch.utils.data import Dataset, DataLoader, random_split
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import numpy as np
from sklearn.model_selection import GridSearchCV
from xgboost import XGBClassifier as xgb
import sys
from ..crankms import MLPClassifier as MLP
from sklearn.metrics import matthews_corrcoef
from sklearn.metrics import make_scorer
from sklearn.model_selection import ShuffleSplit
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression as logreg
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis as lda


def get_model_and_params(model_name):
    """
    Function to return the model instance and corresponding parameter grid based on model_name.
    
    Parameters:
    - model_name: String, name of the model (e.g., 'SVC', 'RandomForest', 'XGBoost', 'LogisticRegression', 'LDA')
    
    Returns:
    - model: The initialized model instance
    - param_grid: The parameter grid for that model
    """
    
    if model_name == 'svm':
        model = SVC(probability=True)
        param_grid = {
            'kernel': ['linear'],
            'C': [0.1,  0.5,  1,  10,  50,  100],
            # 'gamma': [0.0001, 0.0005, 0.001, 0.005, 0.01, 0.05, 0.1, 0.25, 0.5, 0.75, 1]
            'gamma': [0.0001, 0.005, 0.05, 0.1, 0.5, 1]
        }
    elif model_name == 'mlp':
        model = MLP((32,))

        lambda_l1 = 0.001291549665014884
        lambda_l2 = 0.000774263682681127

        param_grid = {
            'num_epochs': [32,64],
            'batch_size': [16],
            'lambda_l1': np.geomspace(lambda_l1 / 2, lambda_l1 * 2, 2),
            'lambda_l2': np.geomspace(lambda_l2 / 2, lambda_l2 * 2, 2),
        }
    elif model_name == 'rf':
        model = rf()
        param_grid = {
            'n_estimators': [25, 50, 100, 250, 500],
            'min_samples_split': [2, 3, 4, 5],
            'max_features': ['auto', 'sqrt', 'log2'],
            'criterion': ['gini', 'entropy'],
        }
    
    elif model_name == 'xgb':
        model = xgb(objective='binary:logistic', nthread=1, seed=100, eval_metric='logloss')
        param_grid = {
            'max_depth': [1],
            'n_estimators': [50], 
            'learning_rate': np.linspace(0.6, 0.1, 6),
            'reg_alpha': [0.5, 0.05],
            'reg_lambda': [0.5, 0.05],
            # 'colsample_bytree': np.linspace(1, 0.2, 5),
        }
    
    elif model_name == 'lr':
        model = logreg()
        param_grid = {
            'solver': ['saga', 'liblinear'],
            'C': range(1, 1000, 60),
            'penalty': ['l1'],
        }
        
    
    elif model_name == 'lda':
        model = lda()
        param_grid = {
            'solver': ['lsqr'],
            'shrinkage': ['auto', 'none', 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
        }
    
    else:
        raise ValueError(f"Model {model_name} not supported")
    
    return model, param_grid


def perform_grid_search(model_name, X, y, n_splits=1, test_size=0.4, n_jobs=4, verbose=4):
    """
    Function to perform grid search with cross-validation.
    
    Parameters:
    - model_name: Name of the model (e.g., 'SVC', 'RandomForest', 'XGBoost', 'LogisticRegression', 'LDA')
    - X: Features dataset (Pandas DataFrame or Numpy array)
    - y: Target labels (Pandas Series or Numpy array)
    - n_splits: Number of splits for cross-validation (default: 100)
    - test_size: Test size fraction for cross-validation (default: 0.4)
    - n_jobs: Number of parallel jobs for grid search (default: 4)
    - verbose: Verbosity level for grid search (default: 4)
    
    Returns:
    - best_score: Best MCC score achieved by the grid search
    - best_params: Best hyperparameters found during grid search
    """
    
    # Get the model and corresponding parameter grid
    model, param_grid = get_model_and_params(model_name)
    
    # Set up shuffle split cross-validation strategy
    sss = ShuffleSplit(n_splits=n_splits, test_size=test_size)
    sss.get_n_splits(X, y)
    
    # Define the scoring method
    scoring = make_scorer(matthews_corrcoef, greater_is_better=True)
    
    # Set up GridSearchCV
    grid_search = GridSearchCV(
        estimator=model,
        param_grid=param_grid,
        scoring=scoring,
        n_jobs=n_jobs,
        cv=sss.split(X, y),
        verbose=verbose
    )
    
    # Fit the model
    grid_search.fit(X, y)
    
    # Return best score and parameters
    return grid_search.best_score_, grid_search.best_params_






    
