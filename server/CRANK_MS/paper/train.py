import pandas as pd
import numpy as np
from .shap_analysis__ import Get_shap_values
import os
from ..crankms import MLPClassifier as MLP
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC, LinearSVC
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.preprocessing import StandardScaler
import joblib
from .gridsearch import perform_grid_search, get_model_and_params
from sklearn.metrics import roc_auc_score



def train(
    model_name,
    dataset, train_size, valid_size, save_dir, parameters,weight_path,ajustmethod,
    seed=0
):

    assert model_name in ['mlp', 'xgb', 'rf', 'lr', 'svm', 'lda']

    # initialize models
    if model_name == 'mlp':
      
            
            
        if ajustmethod=="auto":
            best_score, best_params = perform_grid_search(model_name, *dataset.all)
            print(best_params)
            # model = MLP(
            #     hidden_dims = (32,),
            #     # num_epochs = 64,
            #     # batch_size = 16,
            #     # lambda_l1 = 0.0011697870951761014,
            #     # lambda_l2 = 0.0004719190005714674, 
            #     **best_params,
            #     device = 'cpu',
            # )
            parameters.update(best_params)
        else:
            type_mapping = {
                "num_epochs": int,
                "batch_size": int,
                "lambda_l1": float,
                "lambda_l2": float
            }

            for key, value in parameters.items():
                if key in type_mapping:
                    parameters[key] = type_mapping[key](value)

        model = MLP(
                hidden_dims = (32,),
                **parameters,
                device = 'cpu',
            )
            
        

    elif model_name == 'xgb':
        if ajustmethod=="auto":
            best_score, best_params = perform_grid_search(model_name, *dataset.all)
            print(best_params)
            parameters.update(best_params)
        else:
            type_mapping = {
                "max_depth": int,
                "learning_rate": float,
                "n_estimators": int,
                "reg_alpha": float,
                "reg_lambda": float
            }

            for key, value in parameters.items():
                if key in type_mapping:
                    parameters[key] = type_mapping[key](value) 

                        
        model = XGBClassifier(
            booster = 'gbtree',
            # learning_rate = .3,
            subsample = 1,
            colsample_bytree = .4,
            # max_depth = 1,
            # reg_alpha = .5,
            # reg_lambda = .05,
            use_label_encoder = False,
            eval_metric = 'logloss',
            # n_estimators = 50
            **parameters
        )

    elif model_name == 'rf':
        if ajustmethod=="auto":
            best_score, best_params = perform_grid_search(model_name, *dataset.all)
            print(best_params)
            parameters.update(best_params)
        else:
            type_mapping = {
                "n_estimators": int,
                "min_samples_split": int,
             
            }

            for key, value in parameters.items():
                if key in type_mapping:
                    parameters[key] = type_mapping[key](value) 


              
        model = RandomForestClassifier(
            # criterion='entropy',
            # n_estimators = 500,
            max_depth = None,
            # max_features = 'auto',
            # min_samples_split = 5,
            random_state = seed,
            **parameters
        )

    elif model_name == 'lr':
        if ajustmethod=="auto":
            best_score, best_params = perform_grid_search(model_name, *dataset.all)
            print(best_params)
            parameters.update(best_params)
        else:
            type_mapping = {
                "C": float,
                
             
            }

            for key, value in parameters.items():
                if key in type_mapping:
                    parameters[key] = type_mapping[key](value) 

        model = LogisticRegression(
            # C = 241,
            # penalty = 'l1',
            # solver = 'liblinear',
            **parameters,
            random_state = seed
        )

    elif model_name == 'svm':
        if ajustmethod=="auto":
            best_score, best_params = perform_grid_search(model_name, *dataset.all)
            print(best_params)
            parameters.update(best_params) 
        else:
            type_mapping = {
                "C": float,
                "gamma": lambda x: float(x) if x not in ["scale", "auto"] else x  # convert gamma to float or keep 'scale' / 'auto'
            }

            for key, value in parameters.items():
                if key in type_mapping:
                    parameters[key] = type_mapping[key](value)  # update value in dictionary 
        model = SVC(
            # kernel = 'linear',
            # C = 0.1,
            # gamma = 0.0001,
            **parameters,
            random_state = seed
        )

    elif model_name == 'lda':
        if ajustmethod=="auto":
            best_score, best_params = perform_grid_search(model_name, *dataset.all)
            print(best_params)
            parameters.update(best_params) 
            
        if parameters['shrinkage'] == 'null':
            parameters.update({'shrinkage':None})

        
        model = LinearDiscriminantAnalysis(
            **parameters
        )
    

    if weight_path and os.path.isfile(weight_path):
    # load weight file 
        print(f"Loading weights from file: {weight_path}")
        model = joblib.load(weight_path)
        model.set_params(**parameters)
        print("model", model)

    # split dataset
    x,y = dataset.all
    x_train, x_test, y_train, y_test = train_test_split(
        x,y,
        train_size = train_size,
        test_size = valid_size,
        stratify=y,
        random_state = seed,
    )

    # normalize features
    norm_obj = StandardScaler().fit(x_train)

    x_train = norm_obj.transform(x_train)
    x_test = norm_obj.transform(x_test)



    # store the normalization object for future use
    model.norm_obj_ = norm_obj

    # convert labels to integers
    y_train = y_train.astype(np.int32)
    y_test = y_test.astype(np.int32)

    # train model
    model.fit(x_train, y_train)
    
    # save model checkpoint
    weight_path = '{}/checkpoints/test_{}.ckpt'.format(save_dir, seed)
    joblib.dump(model, weight_path)

    # evaluate and save results
    s_test = model.predict_proba(x_test)[:, 1] if model_name != 'svm' else model.decision_function(x_test)
    p_test = model.predict(x_test)

    auc_score = roc_auc_score(y_test, s_test)


    Get_shap_values(save_dir,x_test,y_test,seed,dataset.features)
    
    _save_results(y_test, p_test, s_test, save_dir, seed)
    
    return auc_score, weight_path



def _save_results(labels, predictions, scores, save_dir, seed):

    df_results = pd.DataFrame()
    df_results['Y Label'] = labels
    df_results['Y Predicted'] = predictions
    df_results['Predicted score'] = scores
    df_results.to_csv('{}/results/test_{}.csv'.format(save_dir, seed), index=False)     
