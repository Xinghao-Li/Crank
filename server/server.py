from flask import Flask, request, jsonify, send_file, abort
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import traceback  
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge
from dotenv import load_dotenv
import os
import shutil
import json
import matplotlib.pyplot as plt
from CRANK_MS.paper.dataset import Data
from CRANK_MS.paper.misc import get_metrics
from CRANK_MS.paper.train import train
from CRANK_MS.paper.shapAnalysis import run_shap_analysis
from CRANK_MS.paper.bootstrap import bootstrap
from CRANK_MS.paper.plot import plot_roc, plot_pr
import pandas as pd
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
import jwt
import datetime
import time
from datetime import timezone
import redis
import uuid  
import openai  
from openai import OpenAIError
import joblib
from sklearn.preprocessing import StandardScaler
import numpy as np
from flask_mail import Mail, Message
import random
import string
import zipfile
import io
from pathlib import Path
import requests

import logging
import sys

os.environ['FLASK_DEBUG'] = '0'


app = Flask(__name__)
# Allow requests from http://localhost:3000 with credentials
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
socketio = SocketIO(app, cors_allowed_origins="*")

# Configuring the Mail Server
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = 'goodluckhavefun9900@gmail.com' 
app.config['MAIL_PASSWORD'] = 'ztpo epwq rvxw igpv'        

mail = Mail(app)

# get .env path, which is parent folder of current folder 
env_path = Path(__file__).resolve().parent.parent / '.env'

# load .env 
load_dotenv(dotenv_path=env_path)

# Configure database
# Get database configuration information from environment variables, default values used for local development
app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"mysql+pymysql://{os.getenv('MYSQL_USER', 'root')}:"
    f"{os.getenv('MYSQL_PASSWORD', '123456')}@"
    f"{os.getenv('MYSQL_HOST', 'mysql')}/"
    f"{os.getenv('MYSQL_DATABASE', 'my_database')}"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_secret_key') 

# Initialize SQLAlchemy for database management
db = SQLAlchemy(app)

# Initialize Bcrypt for password hashing and verification
bcrypt = Bcrypt(app)

# Initialize Redis connection for session management and caching
r = redis.StrictRedis(host='redis', port=6379, db=0, decode_responses=True)  # Ensure the Redis server is running on the specified host and port


# User table model
class User(db.Model):
    __tablename__ = 'user'  # Explicitly specify the table name as 'user'
    id = db.Column(db.Integer, primary_key=True)  # Primary key
    user_id = db.Column(db.String(255), unique=True, nullable=False)  # Unique user ID
    username = db.Column(db.String(255), nullable=False)  # Username
    email = db.Column(db.String(255), nullable=False)  # Email address
    password = db.Column(db.String(255), nullable=False)  # Password (hashed)
    avatar_path = db.Column(db.String(255))  # Path to the user's avatar image

# Training history table model
class TrainingHistory(db.Model):
    __tablename__ = 'TrainingHistory'  # Explicitly specify the table name as 'TrainingHistory'
    
    id = db.Column(db.Integer, primary_key=True)  # Primary key
    user_id = db.Column(db.String(255), db.ForeignKey('user.user_id'), nullable=False)  # Foreign key linking to the user table
    description = db.Column(db.Text)  # Description of the training
    image_paths = db.Column(db.JSON)  # Paths to the images, stored in JSON format
    training_time = db.Column(db.DateTime, default=datetime.datetime.now())  # Training time, defaults to the current time
    model = db.Column(db.String(255), nullable=False)  # Name of the model used
    duration = db.Column(db.Float)  # Duration of the training in hours
    parameters = db.Column(db.JSON)  # Training parameters, stored in JSON format
    weight_path = db.Column(db.String(255))  # Path to the model's weight file
    confusion_matrix = db.Column(db.JSON)  # Confusion matrix, stored in JSON format
    result_path = db.Column(db.String(255))  # Path to the output result file
    shap_file_path = db.Column(db.String(255))  # Path to the output SHAP file
    
    features = db.Column(db.JSON)  # Additional features, stored in JSON format

    # Relationship: Each user can have multiple training history records
    User = db.relationship('User', backref=db.backref('training_history', lazy=True))


def send_progress_update(current_iter, total_iters):
    progress = int((current_iter / total_iters) * 100)
    socketio.emit('train_progress', {'progress': progress})

# Generate random verification codes
def generate_verification_code(length=6):
    return ''.join(random.choices(string.digits, k=length))


@app.route('/api/send-verification-code', methods=['POST'])
def send_verification_code():
    data = request.get_json()
    email = data.get('email')

    if email:
        code = generate_verification_code()
        # expires in 600 seconds (10 minutes)
        r.setex(f'verification_code:{email}', 600, code)
        msg = Message('Your Verification Code', sender=app.config['MAIL_USERNAME'], recipients=[email])
        msg.body = f'Your verification code is: {code}'
        try:
            mail.send(msg)
            return jsonify({"message": "Verification code sent"}), 200
        except Exception as e:
            print("Error sending email:", e)
            return jsonify({"error": "Unable to send email"}), 500
    else:
        return jsonify({"error": "Invalid email"}), 400



@app.route('/api/verify-reset-code', methods=['POST'])
def verify_code():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')

    #  Get the Verification Code from Redis
    stored_code = r.get(f'verification_code:{email}')
    if stored_code and stored_code == code:
        # Delete the verification code after successful verification
        r.delete(f'verification_code:{email}') 
        return jsonify({"message": "Verification successful"}), 200
    else:
        return jsonify({"error": "Invalid or expired code"}), 400
    
@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    username = data.get('username')
    new_password = data.get('password')

    if not email or not new_password:
        return jsonify({"error": "Email and password are required"}), 400

    # query user
    user = User.query.filter_by(email=email,username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # update user's password
    user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    db.session.commit()

    return jsonify({"message": "Password updated successfully"}), 200


@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')  

    # Automatically generate user_id, use UUID to ensure uniqueness
    user_id = str(uuid.uuid4())  

    # Check if the user name already exists
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 409

    # Encryption password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Create a new user and info
    new_user = User(user_id=user_id, username=username, email=email, password=hashed_password, avatar_path="")
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully', 'user_id': user_id}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # query user
    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Verify password
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid credentials'}), 401

    # generate token
    token = jwt.encode({
        'user_id': user.user_id,
        'exp': datetime.datetime.now(timezone.utc) + datetime.timedelta(hours=1)  # 1小时过期
    }, app.config['SECRET_KEY'], algorithm='HS256')

    # Save sessionID (token) and userID to Redis and set 1-hour expiration
    r.setex(f"session:{token}", 3600, user.id)  # Redis the key is session:token and the value is user_id

    return jsonify({'user_id':user.user_id,'token': token}), 200

# API to validate session
@app.route('/api/verify', methods=['GET'])
def verify_token():
    token = request.headers.get('Authorization')

    if not token:
        return jsonify({'success': False, 'message': 'Token is missing'}), 403

    # Check whether the session exists in Redis 
    user_id = r.get(f"session:{token}")
    if not user_id:
        return jsonify({'success': False, 'message': 'Session expired or invalid'}), 403

    return jsonify({'success': True, 'message': 'Token is valid', 'user_id': user_id}), 200

# query the TrainingHistory record associated with user_id
@app.route('/api/training-history', methods=['GET'])
def get_training_history():
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({"message": "Missing user_id parameter"}), 400

    # Query the database to find the training history associated with the given user_id
    history_records = TrainingHistory.query.filter_by(user_id=user_id).all()

    # If no record is found
    if not history_records:
        return jsonify({"message": "No training history found for this user"}), 404

    # Build a JSON response that contains information about the relevant training record
    results = []
    for record in history_records:
        results.append({
            'id': record.id,
            'user_name': record.User.username,
            'description': record.description,
            'image_paths': record.image_paths,
            'training_time': record.training_time.strftime('%Y-%m-%d %H:%M:%S'),  # 格式化时间
            'model': record.model,
            'duration': record.duration,
            'parameters': record.parameters,
            'weight_path': record.weight_path,
            'confusion_matrix': record.confusion_matrix,
            'result_path': record.result_path,
        })

    return jsonify(results), 200




# Set the path for storing uploaded files
UPLOAD_FOLDER = 'uploads/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure that the upload directory exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@app.route('/api/train', methods=['POST'])
def train_model():

    # Initialize the best AUC and best weight path
    best_auc = 0
    best_weight_path = ''
    # Use internal nested functions to reduce parameter calls to get the best weight path
    def train_wrapper(*args, **kwargs):
        nonlocal best_auc, best_weight_path  
        auc_score, weight_path = train(*args, **kwargs)

        if auc_score > best_auc:
            best_auc = auc_score
            best_weight_path = weight_path
           
    # Check if there are files uploaded
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'file no found'}), 400

    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'success': False, 'message': 'no choose file'}), 400

    if file:
        # Save the file to the uploads directory on the server
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)

        # Get other form data
        model = request.form.get('model')
        ajustmethod = request.form.get('ajustmethod')
        train_size = int(request.form.get('trainSize'))/100

        # Parse feature input
        choose_features = (
            [int(col) for col in request.form.get('features').split(',')]
            if 'features' in request.form and request.form.get('features').strip()
            else []
        ) 

        trainingNotes = request.form.get('trainingNotes')
       # Parse parameters in JSON format
        parameters = request.form.get('parameters')
        if parameters:
            parameters = json.loads(parameters) # parses JSON strings into dictionaries
        userId = request.form.get('userId')
        trainingId = request.form.get('trainingId')
        weight_path = ''
        past_trainingHistory = ''
        
        if trainingId:
            past_trainingHistory = TrainingHistory.query.filter_by(user_id=userId, id=trainingId).first()
            if past_trainingHistory:
                # delete old history record 
                # use old weight path 
                weight_path = past_trainingHistory.weight_path
            
        # directory to save results
        '''
        combined_outputs/
            PD LCMS pos/            (dataset specific)
                mlp/                (model specific)
                    checkpoints/    (to save trained models)
                        test_0.*
                        test_1.*
                        ...
                    results/        (to save labels, scores, predictions etc.)
                        test_0.csv
                        test_1.csv
                        ...
                ...
            ...
        '''
        # get current time and set its format
        current_time = datetime.datetime.now()
        current_time_str = current_time.strftime('%Y%m%d_%H%M%S')
        comb_dir = os.path.join('./', userId, current_time_str)
        dset_dir = os.path.split(file_path)[-1][:-4]
        mode_dir = model
        save_dir = '{}/{}/{}'.format(comb_dir, dset_dir, mode_dir)

        # clean up the result folder
        shutil.rmtree(save_dir, ignore_errors=True)
        os.makedirs(save_dir, exist_ok=True)
        os.makedirs(save_dir + '/checkpoints', exist_ok=True)
        os.makedirs(save_dir + '/results', exist_ok=True)
        os.makedirs(save_dir + '/shap', exist_ok=True)
        os.makedirs(save_dir + '/predict', exist_ok=True)

        # initialize dataset
        df = pd.read_csv(file_path, encoding='latin1')
        choose_data = []
    
        # get the feature colums stored in db based on feature input 
        if choose_features:
            feature_columns = df.columns[choose_features].tolist()  
        else:
            feature_columns = df.columns[df.columns != 'PD'].tolist() 

        choose_data = df[feature_columns]

        # print("feature columns are", feature_columns)

        
        whole_data = Data(
            label = 'PD',
            features = choose_data,
            csv_dir = file_path,
        )
        
        # print("all data that used to train:",whole_data.all)

        # for random data split
        
        valid_size = 1 - train_size

        # run for multiple times to collect the statistics of the performance metrics
        gridsearch = True if ajustmethod=="auto" else False
        # Record start time
        start_time = time.time()
        
        best_auc = 0 
        best_weight_path = '' 

        bootstrap(
            func = train_wrapper, 
            args = (model, whole_data, train_size, valid_size, save_dir,parameters,weight_path,ajustmethod),
            kwargs = {},
            num_runs = 3,
            num_jobs = 1,
            progress_callback=send_progress_update 
        )    
        # record end time
        end_time = time.time()
        # calculate execution time
        execution_time = end_time - start_time

        # calculate and show the mean & std of the metrics for all runs
        list_csv = os.listdir(save_dir + '/results')
        list_csv = ['{}/results/{}'.format(save_dir, fn) for fn in list_csv]

        y_true_all, y_pred_all, scores_all = [], [], []
        for fn in list_csv:
            df = pd.read_csv(fn)
            y_true_all.append(df['Y Label'].to_numpy())
            y_pred_all.append(df['Y Predicted'].to_numpy())
            scores_all.append(df['Predicted score'].to_numpy())

        met_all = get_metrics(y_true_all, y_pred_all, scores_all)
        metrics_dict = {}

        for k, v in met_all.items():
            if k not in ['Confusion Matrix']:
                # Format mean and std as 'mean ± std' strings
                formatted_value = '{:.4f} ± {:.4f}'.format(v[0], v[1])
                print(f'{k}: {formatted_value}'.expandtabs(20))
                
                # save the formatted string into the dictionary
                metrics_dict[k] = formatted_value
                
        # plot roc, pr curves
        fig = plt.figure(figsize=(6, 6), dpi=100)
        img_path_roc = '{}/ROC {}.png'.format(save_dir,model)
        csv_path_roc = '{}/results/ROC {}.csv'.format(save_dir, model)
        plot_roc(plt.gca(), y_true_all, scores_all,img_path_roc,csv_path=csv_path_roc)
        
        # fig.savefig('{}/ROC {}.png'.format(save_dir,model), dpi=300)

        fig = plt.figure(figsize=(6, 6), dpi=100)
        img_path_pr = '{}/PR {}.png'.format(save_dir, model)
        csv_path_pr = '{}/results/PR {}.csv'.format(save_dir, model)
        plot_pr(plt.gca(), y_true_all, scores_all,img_path_pr,csv_path = csv_path_pr)
        
        # fig.savefig('{}/PR {}.png'.format(save_dir, model), dpi=300) 
        run_shap_analysis(save_dir)
        
        # Save the training results to the TrainingHistory table
        training_history = TrainingHistory(
            user_id=userId,
            training_time=current_time,  
            description=trainingNotes,
            image_paths={"roc": img_path_roc, "pr": img_path_pr},
            model = model,
            duration = execution_time,
            parameters = parameters,
            weight_path=best_weight_path,  
            confusion_matrix = metrics_dict,
            result_path = save_dir+'/results',
            shap_file_path = save_dir+'/shap',
            features=feature_columns 
            
        )

        db.session.add(training_history)
        db.session.commit() 
        # After submission, training_history.id will contain the automatically generated primary key id
        new_record_id = training_history.id
        
     
        return jsonify({
            'success': True,
            'message': 'model training success',
            'new_record_id': new_record_id,
            
        })

@app.route('/api/get-training-details', methods=['GET'])
def get_training_details():
    training_id = request.args.get('trainingId')
    
    # Query records in the database
    training_history = TrainingHistory.query.filter_by(id=training_id).first()

    if not training_history:
        return jsonify({"error": "Training record not found"}), 404
    
    files = os.listdir(training_history.result_path)
    # Combine each file name with the directory path to get the full path
    results_full_paths = [os.path.join(training_history.result_path, file) for file in files]
    print("result full paths", results_full_paths)
    
    files = os.listdir(training_history.shap_file_path)
    # Combine each file name with the directory path to get the full path
    shap_full_paths = [os.path.join(training_history.shap_file_path, file) for file in files]

    response_data = {
        "userId": training_history.user_id,
        "trainingTime": training_history.training_time.strftime('%Y.%m.%d %H : %M'),
        "model": training_history.model,
        "duration": f'{int(training_history.duration // 60)}min {int(training_history.duration % 60)}s',
        "notes": training_history.description,
        "parameters": training_history.parameters,
        "imagePaths": training_history.image_paths, 
        "features": training_history.features, 
        "confusionMatrix": training_history.confusion_matrix,
        "resultFiles": [{"name":path,"checked":False} for path in results_full_paths], 
        "shapFiles": [
            {"name":path,"checked":False} for path in shap_full_paths
        ]  


    }

    return jsonify(response_data)

@app.route('/api/delete_trainingrecord', methods=['POST'])
def delete_training_record():
    data = request.get_json()
    training_id = data.get('training_id')
    action = data.get('action')
    
    if action == 'delete' and training_id:
        training_history = TrainingHistory.query.filter_by(id=training_id).first()
        if not training_history:
            return jsonify({"error": "Record not found"}), 404
        db.session.delete(training_history)
        db.session.commit()
        return jsonify({"message": "Training history deleted successfully"}), 200
    return jsonify({"error": "Invalid request"}), 400

@app.route('/image/<path:file_path>')
def get_image(file_path):
    
    print("file_path：",file_path)
    if not os.path.exists(file_path):
        abort(404) 
    return send_file(file_path, mimetype='image/png')

@app.route('/imageDownload/<path:file_path>')
def download_image(file_path):
    
    print("file_path：",file_path)
    if not os.path.exists(file_path):
        abort(404)  
    return send_file(file_path, mimetype='image/png',as_attachment=True)
@app.route('/fileDownload/<path:file_path>')
def download_file(file_path):
    
    print("file_path：",file_path)
    if not os.path.exists(file_path):
        abort(404) 
    return send_file(file_path, mimetype='text/csv',as_attachment=True)

def get_base_path(full_path, depth=4):
    path_parts = Path(full_path).parts[:depth]
    return str(Path(*path_parts))
@app.route('/api/download-zip/<path:directory_path>', methods=['GET'])
def download_result_files(directory_path):
    basePath = get_base_path(directory_path)
    print(basePath)
    if not os.path.isdir(basePath):
        abort(404, description="Directory not found")
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
       
        for root, _, files in os.walk(basePath):
            for file in files:
                file_path = os.path.join(root, file)
                zip_file.write(file_path, os.path.relpath(file_path, basePath))

    zip_buffer.seek(0)
    

    return send_file(
        zip_buffer,
        mimetype='application/zip',
        as_attachment=True,
        download_name=f'{directory_path.split("//")[0]}.zip'
    )

@app.route('/api/generate_shap_plot', methods=['GET'])
def generate_shap_plot():
    try:
        training_id = request.args.get('trainingId')
        training_history = TrainingHistory.query.filter_by(id=training_id).first()
        if not training_history:
            return jsonify({"error": "Training record not found"}), 404

        features_get = training_history.features  # Retrieve the SHAP file path from the training record
        path_get = "{}/shap_absolute_average.csv".format(training_history.shap_file_path)
        shap_data = pd.read_csv(path_get, names=['index', 'shap_value'], header=0)

        # Replace the index with feature names and remove empty strings
        if features_get:
            shap_data['index'] = [f'features{f}' for f in features_get]  # Replace with known feature names if provided
        else:
            shap_data['index'] = [f'features{f}' for f in shap_data['index']]

        # Ensure the 'shap_value' column is numeric
        shap_data['shap_value'] = pd.to_numeric(shap_data['shap_value'], errors='coerce')

        # Sort data by value in descending order
        shap_data = shap_data.sort_values(by='shap_value', ascending=False)
        # Display only the top 20 rows
        top_n = 20
        shap_data = shap_data[:top_n]
        shap_data = shap_data.sort_values(by='shap_value', ascending=True)

        plt.figure(figsize=(10, 8))
        bars = plt.barh(shap_data['index'].values, shap_data['shap_value'].values, color='magenta', height=0.4)

        plt.title('SHAP Feature Importance')
        plt.xlabel('Mean |SHAP value|')
        plt.ylabel('Features')

        # Reduce the font size of the y-axis labels to avoid overlap
        plt.yticks(fontsize=10)  # Reduce label font size to avoid overlapping

        # Adjust margins to ensure y-axis labels are fully visible
        plt.subplots_adjust(left=0.15)  # Increase left margin for more space

        save_dir = os.path.dirname(path_get)
        save_dir = os.path.dirname(save_dir)

        # Set x-axis limits to ensure value labels fit within the frame
        padding = 0.2  # Add padding
        plt.xlim(0, max(shap_data['shap_value']) * (1 + padding))  # Add right margin

        # Adjust margins to ensure y-axis labels are fully visible
        plt.subplots_adjust(left=0.2)  # Adjust left margin

        # Dynamically adjust y-axis range; add extra space when there is only one data point
        if len(shap_data['shap_value']) == 1:
            plt.ylim(-0.9, 0.9)  # Add vertical padding when there's only one data point
        else:
            plt.ylim(-1, len(shap_data['shap_value']))  # Remove restrictions for multiple data points

        # Display value labels on each bar to ensure all categories have labels
        for bar, value in zip(bars, shap_data['shap_value']):
            plt.text(
                bar.get_width() + max(shap_data['shap_value']) * 0.005,  # Position labels slightly to the right
                bar.get_y() + bar.get_height() / 2,
                f'{value:.9g}',  # Use a general format for values, keeping significant digits
                va='center',
                ha='left',  # Align labels to the left horizontally
                fontsize=10  # Optionally use smaller font
            )

        # Save the plot as an image and return the path
        img_path = os.path.join(save_dir, 'shap_feature_importance.png')
        plt.savefig(img_path)
        plt.close()

        return jsonify({'path': img_path}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/result-files/<int:id>', methods=['GET'])
def download_zip(id):
    try:
        # Query the record from the database
        training_history = TrainingHistory.query.filter_by(id=id).first()

        if not training_history:
            return jsonify({"error": "Training record not found"}), 404

        # Generate a text representation of the confusion matrix
        metrics_text = "\n".join([f"{key}: {value}" for key, value in training_history.confusion_matrix.items()])
        paths_to_add = [training_history.result_path, training_history.shap_file_path]
        paths_to_add.extend(list(training_history.image_paths.values()))

        # Get the first part of the path
        first_directory = os.path.normpath(training_history.shap_file_path).split(os.sep)[1]

        # Construct the JSON data to send
        data = {
            'features': training_history.features,  # Pass feature names
            'path': "{}\shap_absolute_average.csv".format(training_history.shap_file_path)  # Pass SHAP file path
        }

        # Flask API URL
        url = 'http://127.0.0.1:5000/api/generate_shap_plot'  # Update based on the actual Flask server address

        # Send a POST request
        response = requests.post(url, json=data)

        # Check the response
        if response.status_code == 200:
            result = response.json()
            print(result['path'])
            paths_to_add.append(result['path'])  # Add the generated image path
            print('path:' + result['path'])
        else:
            print("Error:", response.json())

        # Create a byte stream
        zip_buffer = io.BytesIO()

        # Create a ZIP file
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
            zipf.writestr("Model Performance Metrics.txt", metrics_text)
            for path in paths_to_add:
                if os.path.isdir(path):
                    # If it is a directory, recursively add all contents
                    for root, dirs, files in os.walk(path):
                        for file in files:
                            file_path = os.path.join(root, file)
                            # Add to ZIP file, stripping the root directory
                            zipf.write(file_path, os.path.relpath(file_path, os.path.dirname(path)))
                elif os.path.isfile(path):
                    # If it is a file, add it directly to the ZIP
                    zipf.write(path, os.path.basename(path))

        # Reset the byte stream pointer
        zip_buffer.seek(0)

        return send_file(
            zip_buffer,
            mimetype='application/zip',
            as_attachment=True,
            download_name=f'{first_directory}.zip'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# api function

load_dotenv(dotenv_path=env_path)

openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json(force=True)
        messages = data.get("messages", [])

        # Check and retrieve user input
        if not messages or not isinstance(messages, list):
            return jsonify({"error": "Invalid input format"}), 400

        user_input = messages[-1].get("content", "")
        print(f"Received input: {user_input}")

        if not user_input:
            return jsonify({"error": "No input provided"}), 400

        # Call GPT and return the response
        response_content = generate(user_input)
        return jsonify({"message": response_content})

    except Exception as e:
        print(f"Unexpected Error: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500
       
def generate(user_input):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4", 
            messages=[
                {"role": "user", "content": user_input}
            ]
        )

        # Retrieve the response content
        if response and len(response.choices) > 0:
            content = response.choices[0].message["content"]
            print(f"Generated content: {content}")  # Print the generated content
            return content
        else:
            print("No choices found in response.")
            return "[Error] No response content found"

    except OpenAIError as e:
        print(f"OpenAI API Error: {e}")
        return "[Error] Failed to get response from GPT"
        

# API route to display relevant information about the current training record on the predict page
@app.route('/api/predict_info', methods=['GET'])
def get_predict_info():
    userId = request.args.get('userId')
    trainingId = request.args.get('trainingId')

    if not userId:
        return jsonify({"message": "Missing user_id parameter"}), 400

    # Query the database to find training history related to the given user_id
    training_history = TrainingHistory.query.filter_by(user_id=userId, id=trainingId).first()

    # If no record is found
    if not training_history:
        return jsonify({"message": "No training history found for this user"}), 404

    # Return training information
    return jsonify({
        "userId": training_history.user_id,
        "trainingTime": training_history.training_time.strftime('%Y-%m-%d %H:%M:%S'),
        "model": training_history.model,
        "parameters": training_history.parameters,
        "features": training_history.features,
        "trainingId": training_history.id
    }), 200


# API route to accept uploaded files on the predict page and return the predicted CSV file
@app.route('/api/predict', methods=['POST'])
def predict():
    # Check if a file is uploaded
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file found'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No file selected'}), 400

    userId = request.form.get('userId')
    trainingId = request.form.get('trainingId')

    # Retrieve training history by training ID
    if trainingId:
        training_history = TrainingHistory.query.filter_by(user_id=userId, id=trainingId).first()
    else:
        return jsonify({'error': 'Training ID not found'}), 404

    if not training_history:
        return jsonify({'error': 'Training record not found'}), 404

    base_dir = os.path.dirname(training_history.result_path)
    predict_results_dir = os.path.join(base_dir, 'predictresults')
    os.makedirs(predict_results_dir, exist_ok=True)

    # Load weight path and feature columns
    weight_path = training_history.weight_path
    feature_columns = training_history.features
    print("weight path in prediction", weight_path)

    if file:
        # Save the uploaded file to the server's uploads directory
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)
        # Load data and select feature columns
        uploaded_predict_data = pd.read_csv(file_path)
        if not all(col in uploaded_predict_data.columns for col in feature_columns):
            return jsonify({'error': 'Uploaded file does not contain required feature columns'}), 400

    input_data = uploaded_predict_data[feature_columns]

    try:
        # Load the trained model
        loaded_model = joblib.load(weight_path)
        # Transform data; input_data is converted to NumPy format if it's a DataFrame
        input_data = input_data.values if isinstance(input_data, pd.DataFrame) else input_data

        # Standardize the input data
        input_data = loaded_model.norm_obj_.transform(input_data)
        
        # Make predictions
        predictions = loaded_model.predict(input_data)

        # Compute statistics
        total_predictions = len(predictions)
        class_1_count = np.sum(predictions == 1)
        class_0_count = np.sum(predictions == 0)
        class_1_percentage = (class_1_count / total_predictions) * 100
        class_0_percentage = (class_0_count / total_predictions) * 100

        # Prepare preview data
        preview_data = []
        for i in range(min(5, len(predictions))):
            preview_data.append({
                'input_features': {
                    feature: str(uploaded_predict_data[feature].iloc[i]) for feature in feature_columns
                },
                'prediction': int(predictions[i])
            })

        # Create the output file
        output_data = pd.DataFrame({'Predicted Label': predictions})
        output_data = pd.concat([output_data, uploaded_predict_data], axis=1)
        
        curr_time = datetime.datetime.now().strftime("%Y%m%d_%H%M")
        output_filename = f'predictions_{curr_time}.csv'
        output_path = os.path.join(predict_results_dir, output_filename)
        output_data.to_csv(output_path, index=False)

        download_url = f'/fileDownload/{output_path}'
        print("download url", download_url)

        # Return a complete response
        return jsonify({
            'success': True,
            'prediction_file': download_url,
            'preview_data': preview_data,
            'statistics': {
                'total_predictions': int(total_predictions),
                'class_1_count': int(class_1_count),
                'class_0_count': int(class_0_count),
                'class_1_percentage': float(class_1_percentage),
                'class_0_percentage': float(class_0_percentage)
            }
        }), 200

    except Exception as e:
        print(f"Prediction Error: {e}")
        traceback.print_exc()  # Print detailed error information
        return jsonify({'error': 'An error occurred during prediction'}), 500
    
@app.route('/api/top-features', methods=['GET'])
def top_features():
    try:
        training_id = request.args.get('trainingId')
        top_n = int(request.args.get('n'))

        # Query the record from the database
        training_history = TrainingHistory.query.filter_by(id=training_id).first()
        if not training_history:
            return jsonify({"error": "Training record not found"}), 404

        features_get = training_history.features  # Retrieve the SHAP file path
        path_get = training_history.shap_file_path + '/shap_absolute_average.csv'

        shap_data = pd.read_csv(path_get, names=['index', 'shap_value'], header=0)

        # Replace index with known features and remove empty strings
        if features_get:
            shap_data['index'] = [f for f in features_get]  # Replace directly if the original data has issues
        else:
            shap_data['index'] = [f for f in shap_data['index']]

        # Ensure the shap_value column is numeric
        shap_data['shap_value'] = pd.to_numeric(shap_data['shap_value'], errors='coerce')

        # Sort values in descending order
        shap_data = shap_data.sort_values(by='shap_value', ascending=False)
        shap_data = shap_data[:top_n]

        return jsonify({'features': shap_data['index'].tolist()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Start the Flask application
if __name__ == "__main__":
    # app.run(host='0.0.0.0', port=5000, debug=True)
    socketio.run(app, host='0.0.0.0', port=5000, use_reloader=False, debug=True, allow_unsafe_werkzeug=True)
