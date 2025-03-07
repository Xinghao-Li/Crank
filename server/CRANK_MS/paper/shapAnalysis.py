import pandas as pd
import glob
import os
import numpy as np
from scipy.stats import pearsonr

# ensure folder exist
def ensure_folder_exists(folder):
    if not os.path.exists(folder):
        os.makedirs(folder)

# 1. combine data and shap analysis 
def combine_files(save_dir,data_dir,values_dir):
    data_files = glob.glob(os.path.join(data_dir, '*.csv'))
    shap_values_files = glob.glob(os.path.join(values_dir, '*.csv'))
    
    # combine data file 
    combined_data = pd.concat([pd.read_csv(f) for f in data_files])
    combined_data.to_csv(os.path.join(data_dir, "combined_data.csv"), index=False)

    # combine shap values file 
    combined_shap_values = pd.concat([pd.read_csv(f) for f in shap_values_files])
    combined_shap_values.to_csv(os.path.join(save_dir,"shap", "combined_shap_values.csv"), index=False)

# 2. calculate the abs average value of shap 
def calculate_shap_avg(save_dir):
    combined_shap_values = pd.read_csv(os.path.join(save_dir,"shap", 'combined_shap_values.csv')).abs()
    shap_avg = combined_shap_values.mean(axis=0)
    shap_avg.to_csv(os.path.join(save_dir, "shap",'shap_absolute_average.csv'), header=['shap value'])

# 3. calculate the correlation relationship of Pearson 
def calculate_pearson_correlation(save_dir,num,data_dir,values_dir):
    corr = []

    for i in range(num):
        df1 = pd.read_csv('{}/test_{}.ckpt_values.csv'.format(values_dir, i))
        df2 = pd.read_csv('{}/test_{}.ckpt_data.csv'.format(data_dir, i))
        
        shap = df1.to_numpy()
        data = df2.to_numpy()
        
        # calculate Pearson's correlation
        corr.append(
            [pearsonr(shap[:,i], data[:,i])[0] for i in range(shap.shape[1])]
        )
        
    corr = np.array(corr)
    corr_mean = np.nanmean(corr, axis=0)
    corr_mean= pd.DataFrame(corr_mean)
        
    corr_mean.to_csv('{}/{}/shap_correlation.csv'.format(save_dir,"shap"), header=['Corr'])

# 4. combine shap abs average and Peasrson correlation relationship and order them
def merge_and_sort_shap_values(save_dir):
    shap_avg_df = pd.read_csv(os.path.join(save_dir, "shap",'shap_absolute_average.csv'))
    shap_corr_df = pd.read_csv(os.path.join(save_dir,"shap", 'shap_correlation.csv'))
    
    merged_df = pd.merge(shap_avg_df, shap_corr_df, left_index=True, right_index=True)
    sorted_df = merged_df.sort_values(by='shap value', ascending=False)
    sorted_df.to_csv(os.path.join(save_dir, "shap",'shap_summary.csv'), index=False)

# Main function to run all analysis steps
def run_shap_analysis(save_dir):
    
    data_dir = os.path.join(save_dir, 'data')
    values_dir = os.path.join(save_dir, 'values')
    list_csv = os.listdir(data_dir)
    fileCount = len(list_csv)
    ensure_folder_exists(data_dir)
    ensure_folder_exists(values_dir)
    
    combine_files(save_dir,data_dir,values_dir)
    calculate_shap_avg(save_dir)
    calculate_pearson_correlation(save_dir,fileCount,data_dir,values_dir)
    merge_and_sort_shap_values(save_dir)
