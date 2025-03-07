import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from 'next/image';

export default function HelpDocument() {
  const router = useRouter();
  const isActive = (path) => router.pathname === path;

  return (
    <div className="container mx-auto">
      <header className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
        <div className="flex items-center">
          <img src="logo.png" alt="CRANK-MS Logo" className="h-20 w-55" />
        </div>
      
        <nav className="flex items-center space-x-6">
          <Link href="/dashboard" passHref>
            <span className={`cursor-pointer ${isActive('/dashboard') ? 'text-red-500 font-semibold px-3 py-2 bg-gray-100 rounded' : 'text-gray-600 hover:text-gray-900'}`}>
              Training
            </span>
          </Link>
          <Link href="/history" passHref>
            <span className={`cursor-pointer ${isActive('/history') ? 'text-red-500 font-semibold px-3 py-2 bg-gray-100 rounded' : 'text-gray-600 hover:text-gray-900'}`}>
              History
            </span>
          </Link>
          <Link href="/help-document" passHref>
            <span className={`cursor-pointer ${isActive('/help-document') ? 'text-red-500 font-semibold px-3 py-2 bg-gray-100 rounded' : 'text-gray-600 hover:text-gray-900'}`}>
              Help Document
            </span>
          </Link>
          <Button variant="destructive" onClick={() => {
            localStorage.removeItem('token');
            router.push('/');
          }}>Log Out</Button>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Help Documentation</h1>
        
        <div className="space-y-8">
          {/* Registration Section */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="text-2xl">1. Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Username:</strong> Choose a unique username.</li>
                <li><strong>Email:</strong> Enter a valid email address.</li>
                <li><strong>Password:</strong> Set a password with at least 8 characters.</li>
              </ul>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">Tip: It is suggested to use a combination of letters, numbers, and symbols for a stronger password.</p>
              </div>
              <div className="mt-4">
                <img 
                  src="/registration.png" 
                  alt="Registration interface"
                  className="w-full max-w-md mx-auto rounded-lg shadow-md"
                />
              </div>
            </CardContent>
          </Card> */}

          {/* Login Section */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="text-2xl">2. Log In</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Provide your username and password to log in. If you forget your password, please click "Forgot your password" to reset it.</p>
              <div className="mt-4">
                <img 
                  src="/login.png" 
                  alt="Login interface"
                  className="w-full max-w-md mx-auto rounded-lg shadow-md"
                />
              </div>
            </CardContent>
          </Card> */}

          {/* Main Page Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">1. Main Page Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Welcome to the system! You now have access to several key pages:</p>
              <ul className="space-y-4">
                <li className="bg-gray-50 p-4 rounded-md">
                  <strong className="block mb-2">Training Page</strong>
                  <p>Start training models here by configuring settings and uploading your source data files.</p>
                </li>
                <li className="bg-gray-50 p-4 rounded-md">
                  <strong className="block mb-2">History Page</strong>
                  <p>Review all your past training sessions and results linked to your account.</p>
                </li>
                <li className="bg-gray-50 p-4 rounded-md">
                  <strong className="block mb-2">Help Documentation Page</strong>
                  <p>Find helpful tips and guides on how to effectively use the system.</p>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Start Training Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">2. Start Training your Model</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Step 1: Provide source data</h3>
                <div className="bg-gray-50 p-4 rounded-md space-y-4">
                  <p>On this page, you can select a file or drag and drop your source data to upload it before training model. </p>
                  <p>Requirements for the source data:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>File format: Must be in .csv format</li>
                    <li>Classification target:
                      <ul className="list-disc pl-6 mt-2">
                        <li>Include a column named "PD" as the target label</li>
                        <li>The "PD" column should only contain 0 or 1 values(for binary classification).</li>
                      </ul>
                    </li>
                    <li>Features:
                      <ul className="list-disc pl-6 mt-2">
                        <li>All other columns represent features used to train the model</li>
                        <li>Feature values must be of integer (int) type</li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="mt-4">
                  <img 
                    src="/train.png" 
                    alt="Source data upload interface"
                    className="w-full rounded-lg shadow-md"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Step 2: Configuring Your Training Session</h3>
                <div className="space-y-4">
                  <p>Before starting the training, you can customize the following settings:</p>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-semibold mb-2">Train/Test Set Ratio</h4>
                    <p>Select the proportion of data used for training vs. testing (e.g., 70/30 or 80/20).</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-semibold mb-2">Machine Learning Model</h4>
                    <p>Choose from available models to fit your data and meet your objectives.<br/>
                    We provide below 6 models in our system.<br />
                    For suggestions about these 6 models, please jump to “Model Suggestion” part. 
                    </p>
                    <div className="mt-4">
                      <img 
                        src="/models.png" 
                        alt="Model selection interface"
                        className="w-full max-w-sm rounded-lg shadow-md"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-semibold mb-2">Hyperparameter Selection</h4>
                    <p>Decide how to adjust hyperparameters, either manually or through automatic tuning. <br />
                      When you choose Auto, we will use Grid Search in backend automatically, and find best hypermeters for you. <br />
                      When you choose manual, you need to define hyperparameter value as per your requirement.<br />
                      Different model has different hyperparameters, which will be shown in Training page. We also provide suggested hyperparameters for each model, please jump to “Model Hyperparameter Suggestion” section. 
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-semibold mb-2">Feature Selection</h4>
                    <p>Specify which feature to be included in the model for training (optional). Use commas to separate multiple feature names. If you don’t specify feature name, the model will use all available features by default. </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-semibold mb-2">Training Notes</h4>
                    <p>Add any notes or comments about this training session for future reference (optional). This note is helpful for you to find your training record in History Page. </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Step 3: Start Training</h3>
                <p>Once you have completed all configurations, click “Train Model” to start training process. <br />
                  Training may take some time to complete, depending on the dataset and model. Check the progress bar to monitor the status of the training process.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Review Training Results Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">3. Review Training Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Once the training process is completed, you will see a summary of all the results, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>2 Images:
                  <ul className="list-disc pl-6 mt-2">
                    <li>PR Curve (Precision-Recall)</li>
                    <li>ROC Curve (Receiver Operating Characteristic)</li>
                  </ul>
                </li>
                <li>Model Performance Metrics:
                  <ul className="list-disc pl-6 mt-2">
                    <li>AUC (Area Under Curve)</li>
                    <li>Accuracy</li>
                    <li>F1 score</li>
                    <li>MCC (Matthews Correlation Coefficient)</li>
                    <li>Precision</li>
                    <li>Recall (Sensitivity)</li>
                    <li>Specificity</li>
                  </ul>
                </li>
                <li>SHAP CSV Files:
                  <ul>CSV files containing SHAP values to interpret feature importance.</ul>
                </li>
                <li>Additional CSV Files:
                  <ul>Other result files generated during the training process. The result files also include CSVs for PR and ROC, allowing you to generalize your own visualizations.</ul>
                </li>

              </ul>
              <div className="mt-4">
                <img 
                  src="/result.png" 
                  alt="Training results interface"
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">4. AI Assistant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>In result page, we’ve integrated a chatbot powered by the GPT-4 model. This AI assistant can take your contextual input and provide analysis, helping you gain insights, clarify doubts, and make informed decisions.</p>
              
              <div className="mt-4">
                <img 
                  src="/ai_assistant.png" 
                  alt="Here is a demo for how to use AI Assistant"
                  width={500}
                  className=" rounded-lg shadow-md"
                />
              </div>
            </CardContent>
          </Card>

          {/* SHAP Analysis Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">5. Find best features via SHAP Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We provide the visualization of SHAP Feature importance to help user define the contribution of individual features to the predictions made by the model.</p>
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-semibold mb-2">How to generalize the SHAP Visualization:</h4>
                <ul className="list-disc pl-6">
                  <li>In Result page, click "Web Shap"</li>
                  <li>In WEB SHAP page, click “SHAP ANALYZE” to generalize the SHAP Feature Importance image. We also provide download button to download corresponding results. </li>
                  <li>In the top features section, you can filter the top 5, 10, 15, 20, or 25 features to identify those with the greatest contribution to prediction. You are free to use features which have high values and optimize your model. </li>
                </ul>
              </div>
              <div className="mt-4">
                <img 
                  src="/select_features.png" 
                  alt="Interface to select top features for SHAP analysis"
                  className="w-full rounded-lg shadow-md"
                />
              </div>
              <div className="mt-4">
                <img 
                  src="/shap.png" 
                  alt="SHAP analysis interface"
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            </CardContent>
          </Card>

          {/* History Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">6. Review the Training History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>In the navigation bar, click "History" to view all the training records associated with your account.</p>
              <h4 className="font-semibold mt-4">Each training record contains:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>User ID: A unique identifier linked to your account</li>
                <li>Training Time: The date and time when the training was performed</li>
                <li>Model: The machine learning model used for this training session</li>
                <li>Training Duration: The total time taken to complete the training</li>
                <li>Hyperparameter Settings: The specific parameter values used during the training (e.g., max_depth, learning_rate).</li>
                <li>Notes: Any custom notes you added during the training setup for reference</li>
              </ul>
              <h4 className="font-semibold mt-4">Actions: Available actions such as:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>View Results: Click the record and review detailed results.</li>
                <li>Predict: Use this pre-trained model to do prediction.</li>
                <li>Retrain: Option to retrain the model with adjusted configurations.</li>
                <li>Download Files: Download the generated outputs, including all files that generated in the training process, such as ROC and PR images, Shap explanation files, Model checkpoints.</li>
                <li>Delete: Delete this record if you don’t need it.</li>
              </ul>
              <div className="mt-4">
                <img 
                  src="/review.png" 
                  alt="History page interface"
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            </CardContent>
          </Card>

          {/* Prediction Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">7. Prediction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>When you click "Predict" in the history record, you’ll be redirected to the prediction page. Here, you can review essential details about your model settings, including: Model Name, Training Time, Parameters, selected Features which were used to train the model. </p>
              <div className="mt-4">
                <img 
                  src="/train_info.png" 
                  alt="Basic training information for record"
                  className="w-full rounded-lg shadow-md"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p>To make predictions using the trained model, follow these steps:</p>
                <ul className="list-disc pl-6">
                  <li>Upload your data: Click on the upload area or drag and drop your CSV file. Ensure the CSV file includes the same features that were used during model training. </li>
                  <li>Click Predict button to start prediction. The results will be saved in a CSV file, which combines your input data with the prediction output for easy reference. A download link for this CSV file will be provided.</li>
                  <li>We show first 5 predictions and prediction distributions for your quick review.  </li>
                </ul>
              </div>
              
              <div className="mt-4">
                <img 
                  src="/predict_statistic.png" 
                  alt="Prediction statistic interface"
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            </CardContent>
          </Card>

          {/* Retrain model Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">8. Retrain Model</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>If you want to retrain your model with different configurations, follow these steps: </p>
                <ul className="list-disc pl-6">
                  <li>In the navigation bar, click "History" to view all your previous training records. </li>
                  <li>Find the record you wish to retrain and click the "Retrain" action.</li>
                  <li>You will be redirected to the training page, where the previous configurations are pre-loaded.</li>
                  <li>Update Configurations
                    <ul>Model selection will remain the same as the original training.</ul>
                    <ul>You are free to change other configurations, such as hyperparameters, training/test set ratio, or training notes.</ul>
                  </li>
                  <li>After adjusting the settings, click "Train Model" to retrain and generate the latest results.</li>
                </ul> 
            </CardContent>
          </Card>

          {/* Model Suggestion Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">9. Model Suggestion</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Here’s a simple guide to help you select the right model. Choose your model based on your dataset characteristics and project goals.</p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">When to use</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Limitations</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">Multi-Layer Perceptron (MLP)</td>
                      <td className="px-6 py-4">Large datasets, try to capture non-linear patterns in data.</td>
                      <td className="px-6 py-4">Requires substantial data and careful hyperparameter tuning.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">XGBoost (XGB)</td>
                      <td className="px-6 py-4">Datasets with many features or missing data, want to train model fast.</td>
                      <td className="px-6 py-4">May overfit if not properly tuned.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">Random Forest (RF)</td>
                      <td className="px-6 py-4">Want to avoid overfitting, dataset has lots of categorical data.</td>
                      <td className="px-6 py-4">Training can be slow on large datasets.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">Logistic Regression (LR)</td>
                      <td className="px-6 py-4">Want a simple, interpretable model, best for Linear data.</td>                  
                      <td className="px-6 py-4">May struggle with complex, non-linear data.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">Support Vector Machine (SVM)</td>
                      <td className="px-6 py-4">Datasets are small with high-dimensional data.</td>
                      <td className="px-6 py-4">May struggle with large datasets.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">Linear Discriminant Analysis (LDA)</td>
                      <td className="px-6 py-4">Want a fast and interpretable model for linear classification.</td>
                      <td className="px-6 py-4">Performance may decrease with noisy data.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Retrain model Section */}
          <Card>
  <CardHeader>
    <CardTitle className="text-2xl">10. Model Hyperparameter Suggestion</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left bg-gray-50 font-semibold border">Model</th>
            <th className="px-6 py-3 text-left bg-gray-50 font-semibold border">Hyperparameters</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr className="hover:bg-gray-50">
            <td rowSpan={5} className="px-6 py-4 border font-medium">Multi-Layer Perceptron (MLP)</td>
            <td className="px-6 py-4 border">Number of Epochs: 64</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 border">Batch Size: 16</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 border">L1 Regularization: 0.0011697870951761014</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 border">L2 Regularization: 0.0004719190005714674</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 border">Max Depth: 1</td>
          </tr>

          <tr className="hover:bg-gray-50">
            <td rowSpan={4} className="px-6 py-4 border font-medium">XGBoost (XGB)</td>
            <td className="px-6 py-4 border">Learning Rate: 0.3</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 border">Number of Estimators: 50</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 border">reg_alpha: 0.5</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 border">reg_lambda: 0.05</td>
          </tr>

          <tr className="hover:bg-gray-50">
            <td rowSpan={4} className="px-6 py-4 border font-medium">Random Forest (RF)</td>
            <td className="px-6 py-4 border">Number of Estimators: 500</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 border">Min Samples Split: 5</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 border">Max Features: sqrt</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 border">Criterion: entropy</td>
          </tr>

          <tr className="hover:bg-gray-50">
            <td rowSpan={3} className="px-6 py-4 border font-medium">Logistic Regression (LR)</td>
            <td className="px-6 py-4 border">Solver: liblinear</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 border">Inverse of Regularization Strength: 241</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 border">Regularization Type: L1</td>
          </tr>
        </tbody>
      </table>
    </div>
  </CardContent>
</Card>

        </div>
      </main>
    </div>
  );
}