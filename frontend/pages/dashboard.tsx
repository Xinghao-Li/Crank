import React, { useState, useRef, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload, Info, FileCheck, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Progress } from "@/components/ui/progress";
import Papa from 'papaparse';  
import io from 'socket.io-client';
const socket = io('http://localhost:5000');  
const modelOptions = [
  { value: "mlp", label: "Multi-Layer Perceptron (MLP)" },
  { value: "xgb", label: "XGBoost (XGB)" },
  { value: "rf", label: "Random Forest (RF)" },
  { value: "lr", label: "Logistic Regression (LR)" },
  { value: "svm", label: "Support Vector Machine (SVM)" },
  { value: "lda", label: "Linear Discriminant Analysis (LDA)" },
];

const hyperParameters = {
  mlp: [
    {
      name: "num_epochs",
      label: "Number of Epochs",
      type: "number",
      min: 1,
      max: 1000,
      step: 1,
      tooltip: "Number of training iterations. More epochs may improve accuracy but increase the risk of overfitting."
    },
    {
      name: "batch_size",
      label: "Batch Size",
      type: "number",
      min: 1,
      max: 1000,
      step: 1,
      tooltip: "Number of samples per update. Smaller batches improve training speed but may introduce noise."
    },
    {
      name: "lambda_l1",
      label: "L1 Regularization",
      type: "number",
      min: 0,
      max: 1,
      step: 0.01,
      tooltip: "Controls L1 regularization strength. Higher values lead to sparser models."
    },
    {
      name: "lambda_l2",
      label: "L2 Regularization",
      type: "number",
      min: 0,
      max: 1,
      step: 0.01,
      tooltip: "Controls L2 regularization strength. Helps prevent overfitting by reducing large weights."
    },
  ],
  xgb: [
    {
      name: "max_depth",
      label: "Max Depth",
      type: "number",
      min: 1,
      max: 20,
      step: 1,
      tooltip: "Maximum depth of trees. Deeper trees may capture more complex patterns but risk overfitting."
    },
    {
      name: "learning_rate",
      label: "Learning Rate",
      type: "number",
      min: 0.01,
      max: 1,
      step: 0.01,
      tooltip: "Shrinks feature weights for more robust training. Lower rates typically require more iterations."
    },
    {
      name: "n_estimators",
      label: "Number of Estimators",
      type: "number",
      min: 1,
      max: 1000,
      step: 1,
      tooltip: "Number of trees in the ensemble. More trees generally improve accuracy but increase training time."
    },
    {
      name: "reg_alpha",
      label: "reg_alpha",
      type: "number",
      min: 0,
      max: 1,
      step: 0.01,
      tooltip: "L1 regularization term. Controls feature sparsity in trees."
    },
    {
      name: "reg_lambda",
      label: "reg_lambda",
      type: "number",
      min: 0,
      max: 1,
      step: 0.01,
      tooltip: "L2 regularization term. Prevents overfitting by shrinking large weights."
    },
  ],
  rf: [
    {
      name: "n_estimators",
      label: "Number of Estimators",
      type: "number",
      min: 1,
      max: 1000,
      step: 1,
      tooltip: "Number of trees in the forest. More trees can improve predictions but slow down training."
    },
    {
      name: "min_samples_split",
      label: "Min Samples Split",
      type: "number",
      min: 2,
      max: 20,
      step: 1,
      tooltip: "Minimum number of samples required to split an internal node."
    },
    {
      name: "max_features",
      label: "Max Features",
      type: "select",
      options: ['sqrt', 'log2'], 
      tooltip: "Number of features to consider for the best split. Smaller values reduce variance but increase bias."
    },
    {
      name: "criterion",
      label: "Criterion",
      type: "select",
      options: ['gini', 'entropy'],
      tooltip: "Metric for tree splitting. 'gini' for classification, 'entropy' for information gain."
    },
  ],
  lr: [
    {
      name: "solver",
      label: "Solver",
      type: "select",
      options: ['lbfgs', 'liblinear', 'newton-cg', 'newton-cholesky', 'sag', 'saga'],
      tooltip: "Algorithm used for optimization. Different solvers perform better in different datasets."
    },
    {
      name: "C",
      label: "Inverse of Regularization Strength",
      type: "number",
      min: 0.1,
      max: 10,
      step: 0.1,
      tooltip: "Inverse of regularization strength. Higher values reduce regularization."
    },
    {
      name: "penalty",
      label: "Regularization Type",
      type: "select",
      options: ['l1', 'l2', 'elasticnet', 'none'],
      tooltip: "Type of regularization, controlling the complexity of the model."
    },
  ],
  svm: [
    {
      name: "kernel",
      label: "Kernel",
      type: "select",
      options: ['linear', 'rbf', 'poly', 'sigmoid'],
      tooltip: "Function to map data into higher dimensions. 'linear', 'rbf', or 'poly' for nonlinear problems."
    },
    {
      name: "C",
      label: "Regularization Parameter",
      type: "number",
      min: 0.1,
      max: 100,
      step: 0.1,
      tooltip: "Regularization parameter. Higher values reduce the margin but may increase accuracy."
    },
    //////add kernel coefficient and allow customized float value 
    {
      name: "gamma",
      label: "Kernel Coefficient",
      type: "hybrid",
      presets: ['scale', 'auto'],
      min: 0.0001,
      max: 100,
      step: 0.0001,
      tooltip: "Kernel coefficient. Can be 'scale', 'auto', or a numeric value. Higher values focus on fitting closer points."
    },
  ],
  lda: [
    {
      name: "solver",
      label: "Solver",
      type: "select",
      options: ['lsqr', 'eigen'],
      tooltip: "Algorithm to compute the model. 'svd' for large datasets, 'lsqr' for smaller, 'eigen' for regularized solutions."
    },
    {
      name: "shrinkage",
      label: "Shrinkage",
      type: "select",
      options: ['auto', 'null'], 
      tooltip: "Optional regularization term. Controls the variance of estimates, helping with collinearity."
    },
  ],
};

export default function TrainingInterface() {
  const router = useRouter();
  const [csvColumns, setCsvColumns] = useState([]);  
  const [selectedModel, setSelectedModel] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [trainRatio, setTrainRatio] = useState('');
  const [testRatio, setTestRatio] = useState('');
  const [features, setFeatures] = useState('');

  const { model: queryModel, parameters: queryParams, trainingId: trainrecordId } = router.query; // 从 query 获取 model 和 parameters
  const [trainingId, setTrainingId] = useState('')
  const [hyperParams, setHyperParams] = useState({});  
  const [errors, setErrors] = useState({
    ratio: null,
    features: null,
  });
  const fileInputRef = useRef(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [adjustmentMethod, setAdjustmentMethod] = useState('manually');  
  const [trainingNotes, setTrainingNotes] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [gammaInputType, setGammaInputType] = useState('preset');
  const [customGamma, setCustomGamma] = useState('0.0001');
  const handleGammaTypeChange = (type) => {
    if (type === 'custom') {
      setGammaInputType('custom');
      handleHyperParamChange('gamma', customGamma);
    } else {
      setGammaInputType('preset');
      handleHyperParamChange('gamma', type);
    }
  };

  const handleCustomGammaChange = (value) => {
    setCustomGamma(value);
    if (gammaInputType === 'custom') {
      handleHyperParamChange('gamma', value);
    }
  };

  // When the page loads, if there are query parameters, parse and set them
  useEffect(() => {
    if (queryParams) {
      console.log(queryParams);
      try {
        const parsedParams = typeof queryParams === 'string' ? JSON.parse(queryParams) : queryParams;
        setHyperParams(parsedParams);  
        setSelectedModel(queryModel)
        setTrainingId(Array.isArray(trainrecordId) ? trainrecordId[0] : trainrecordId);
      } catch (error) {
        console.error('Failed to parse query parameters:', error);
      }
    }
  }, [queryParams]);

  useEffect(() => {
    
    socket.on('train_progress', (data) => {
      setTrainingProgress(data.progress);
      if (data.progress === 100) {
        setIsTraining(false); 
      }
    });

    return () => {
      socket.off('train_progress'); 
    };
  }, []);

  const handleTrainingNotesChange = (e) => {
    setTrainingNotes(e.target.value);  
  };

  const handleMethodChange = (value) => {
    setAdjustmentMethod(value);  
    console.log('Selected adjustment method:', value); 
  };


  const isActive = (path) => router.pathname === path;


  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      const reader = new FileReader();

      reader.onload = (event) => {
        const csvData = event.target.result;

        // Use PapaParse to parse CSV data
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data;
            // localStorage.setItem('fields', results.meta.fields);
            const columns = results.meta.fields;  
            setCsvColumns(columns);  

            // Check whether the "PD" column is 0 or 1 and all other columns are integers
            const isValid = data.every(row => {
              const pdValue = row["PD"];
              const isPdValid = pdValue === '0' || pdValue === '1';
              const areOtherColumnsValid = Object.keys(row).every((key) => {
                if (key !== "PD") {
                  const value = row[key];
                  return Number.isInteger(Number(value));
                }
                return true;
              });

              return isPdValid && areOtherColumnsValid;
            });

            if (isValid) {
              setUploadedFile(file);
            } else {
              alert("The CSV file must have a 'PD' column with values 0 or 1, and all other columns must contain integers.");
            }
          },
          error: (error) => {
            console.error("CSV parsing error:", error);
            alert("Failed to parse the CSV file.");
          }
        });
      };

      ;

      reader.readAsText(file);
    } else {
      alert("Please upload a CSV file.");
    }
  };

  const handleSelectFileClick = () => {
    fileInputRef.current.click();
  };

  const validateRatio = (train, test) => {
    const trainNum = parseInt(train);
    const testNum = parseInt(test);
    if (isNaN(trainNum) || isNaN(testNum) || trainNum <= 0 || testNum <= 0) {
      return "Both ratios must be positive integers";
    }
    if (trainNum + testNum !== 100) {
      return "The sum of ratios must equal 100%";
    }
    return null;
  };

  const validateFeatures = (value) => {
    if (value === '') return null; // Optional field
    const features = value.split(',').map(f => parseInt(f.trim()));
    if (features.some(isNaN)) {
      return "Please enter valid numbers separated by commas";
    }
    // if (features.some(f => f < 1 || f > 20)) {
    //   return "Features must be between 1 and 20";
    // }
    if (features.some(f => f < 1)) {
      return "Features must be greater than 0";
    }
    return null;
  };

  const handleRatioChange = (e, type) => {
    const value = e.target.value.replace(/\D/g, ''); // Allow only digits

    if (type === 'train') {
      setTrainRatio(value);
    } else {
      setTestRatio(value);
    }

    // Only perform validation once both ratios have values
    if (trainRatio && testRatio) {
      const error = validateRatio(type === 'train' ? value : trainRatio, type === 'test' ? value : testRatio);
      setErrors(prev => ({ ...prev, ratio: error }));
    }
  };

  // Drag and drop event handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type === "text/csv") {
        const reader = new FileReader();

        reader.onload = (event) => {
          const csvData = event.target.result;

          // use PapaParse parse CSV data
          Papa.parse(csvData, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const data = results.data;

              // Check that the "PD" column is 0 or 1 and that all other columns are integers
              const isValid = data.every(row => {
                const pdValue = row["PD"];

                if (pdValue !== '0' && pdValue !== '1') {
                  return false;
                }
                return Object.entries(row).every(([key, value]) => {
                  if (key !== "PD") {
                    return Number.isInteger(Number(value));
                  }
                  return true;
                });
              });
              console.log(isValid)
              if (isValid) {
                setUploadedFile(file);
              } else {
                alert("The CSV file must have 'PD' column with values 0 or 1, and all other columns as integers.");
              }
            },
            error: (error) => {
              console.error("CSV parsing error:", error);
              alert("Failed to parse the CSV file.");
            }
          });
        };

        reader.readAsText(file);
      } else {
        alert("Please upload a CSV file.");
      }
    }
  };

  const handleFeaturesChange = (e) => {
    let value = e.target.value;
    value = value.replace(/，/g, ',');
    // Remove extra consecutive commas, e.g. "1,2" will become "1,2"
    value = value.replace(/,+/g, ',');
    setFeatures(value);
    
    const error = validateFeatures(value);
    setErrors(prev => ({ ...prev, features: error }));
    // Check whether the features entered by the user are in the CSV column
    const featureNames = value.split(',').map(f => f.trim()).filter(Boolean);;
    const invalidFeatures = featureNames.filter(f => !csvColumns.includes(f));
    if (invalidFeatures.length > 0) {
      setErrors(prev => ({
        ...prev,
        features: `Invalid features: ${invalidFeatures.join(', ')}. Please ensure all features match CSV column names.`,
      }));
    } else {
      setErrors(prev => ({ ...prev, features: null }));
    }
  };

  const handleHyperParamChange = (paramName, value) => {
    setHyperParams((prevParams) => ({
      ...prevParams,
      [paramName]: value,  
    }));
  };

  const handleTrainModel = () => {
    // Perform validation
    const ratioError = validateRatio(trainRatio, testRatio);
    const featuresError = validateFeatures(features);

    if (ratioError || featuresError) {
      setErrors({
        ratio: ratioError,
        features: featuresError
      });
      return;
    }
    setIsTraining(true); 
    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('model', selectedModel);
    formData.append('ajustmethod', adjustmentMethod);
    formData.append('trainSize', trainRatio);
    formData.append('features', features);
    formData.append('parameters', JSON.stringify(hyperParams));
    formData.append('trainingNotes', trainingNotes);
    formData.append('userId', localStorage.getItem('userId'));
    formData.append('trainingId', trainingId);
    console.log(localStorage.getItem('userId'))
    fetch('http://localhost:5000/api/train', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setTrainingProgress(0); 
        const new_record_id = data.new_record_id;
        router.push({
          pathname: '/result',
          query: { trainingId: new_record_id, features: features },
        });

      })
      .catch((error) => {
        console.error('training fail:', error);
        setTrainingProgress(0); 
        alert('training fail');
        window.location.reload(); 
      });
  };

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
          {/* <Link href="/result" passHref>
            <span className={`cursor-pointer ${isActive('/result') ? 'text-red-500 font-semibold px-3 py-2 bg-gray-100 rounded' : 'text-gray-600 hover:text-gray-900'}`}>
              Result
            </span>
          </Link>
          <Link href="/web-shap" passHref>
            <span className={`cursor-pointer ${isActive('/web-shap') ? 'text-red-500 font-semibold px-3 py-2 bg-gray-100 rounded' : 'text-gray-600 hover:text-gray-900'}`}>
              Web SHAP
            </span>
          </Link> */}
          <Link href="/help-document" passHref>
            <span className={`cursor-pointer ${isActive('/help-document') ? 'text-red-500 font-semibold px-3 py-2 bg-gray-100 rounded' : 'text-gray-600 hover:text-gray-900'}`}>
              Help Document
            </span>
          </Link>
          <Button variant="destructive" onClick={() => {
            localStorage.removeItem('token')
            router.push('/')
          }}>Log Out</Button>
        </nav>
      </header>

      <div className="flex gap-4">
        <div className="w-1/2">
          <Card
            className={`p-4 mb-4 border-2 border-dashed ${isDragging
                ? 'border-red-500 bg-red-50'
                : uploadedFile
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300'
              } flex flex-col items-center justify-center transition-colors duration-200`}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {!uploadedFile ? (
              <>
                <Upload className={`w-8 h-8 ${isDragging ? 'text-red-500' : 'text-gray-400'} mb-2`} />
                <p className={`text-center ${isDragging ? 'text-red-500' : 'text-gray-600'}`}>
                  {isDragging ? 'Drop your file here' : 'Select a file or drag and drop here'}
                </p>
                <p className="text-center text-gray-400 text-sm">CSV</p>
                <Button
                  variant="outline"
                  className="mt-2 text-red-500"
                  onClick={handleSelectFileClick}
                >
                  SELECT FILE
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </>
            ) : (
              <>
                <FileCheck className="w-8 h-8 text-green-500 mb-2" />
                <p className="text-center text-green-600 font-semibold">
                  {uploadedFile.name} UPLOADED SUCCESSFULLY
                </p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => setUploadedFile(null)}
                >
                  RE-SELECT FILE
                </Button>
              </>
            )}
          </Card>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Ratio between training set and test set</label>
            <div className="flex items-center">
              <Input
                className={`w-24 mr-2 ${errors.ratio ? 'border-red-500' : ''}`}
                placeholder="training %"
                value={trainRatio}
                onChange={(e) => handleRatioChange(e, 'train')}
              />
              <span className="mx-2">/</span>
              <Input
                className={`w-24 ${errors.ratio ? 'border-red-500' : ''}`}
                placeholder="test %"
                value={testRatio}
                onChange={(e) => handleRatioChange(e, 'test')}
              />
            </div>
            {errors.ratio && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.ratio}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Select a machine learning model</label>
            <Select 
              value={selectedModel} 
              onValueChange={setSelectedModel}
              disabled={!!queryModel}  // Disable select if queryModel is defined
              >
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map((model) => (
                  <SelectItem key={model.value} value={model.value}>{model.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Methods for adjusting parameters</label>
            <Select onValueChange={handleMethodChange}>
              <SelectTrigger>
                <SelectValue placeholder="Manually" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manually">Manually</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium flex items-center">
              Feature (Optional)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="ml-1 w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Specify feature indices to use for training. This allows you to select a subset of features from your dataset.</p>
                    <p>Format: Enter comma-separated numbers between 1 and 20, e.g., "1,3,5,7"</p>
                    <p>Leave blank to use all available features.</p>
                    <p>Note: Feature selection can impact model performance and training time.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
            <Input
              placeholder="e.g., 1,2,3"
              value={features}
              onChange={handleFeaturesChange}
              className={errors.features ? 'border-red-500' : ''}
            />
            {errors.features && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.features}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">Enter specific numbers, separated by commas</p>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Training Notes (Optional)</label>
            <Textarea
              rows={4}
              value={trainingNotes} 
              onChange={handleTrainingNotesChange}  
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleTrainModel} disabled={isTraining}>
              {isTraining ? 'Training...' : 'Train model'}
            </Button>
          </div>

          {isTraining && (
            <div className="mt-4">
              <label className="block mb-2 text-sm font-medium">Training Progress</label>
              <Progress value={trainingProgress} className="w-full" />
              <p className="text-sm text-gray-500 mt-1">{trainingProgress}% Complete</p>
            </div>
          )}
        </div>
       
        <div className="w-1/2">
          <Card className="h-full bg-gray-100 p-4">
            <h2 className="text-lg font-semibold mb-4">Hyperparameters</h2>
            {selectedModel && hyperParameters[selectedModel] ? (
              hyperParameters[selectedModel].map((param, index) => (
                <div key={index} className="mb-4">
                  <label className="block mb-2 text-sm font-medium flex items-center">
                    {param.label}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="ml-1 w-4 h-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{param.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  {param.type === 'number' ? (
                    <Input
                      type="number"
                      placeholder={`Enter ${param.label}`}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      value={hyperParams[param.name] || ''}
                      disabled={adjustmentMethod === 'auto' || isTraining}
                      onChange={(e) => handleHyperParamChange(param.name, e.target.value)}
                    />
                  ) : param.type === 'hybrid' && param.name === 'gamma' ? (
                    <div className="space-y-2">
                      <Select
                        value={gammaInputType === 'preset' ? hyperParams[param.name] : 'custom'}
                        disabled={adjustmentMethod === 'auto' || isTraining}
                        onValueChange={handleGammaTypeChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${param.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {param.presets.map((option, optionIndex) => (
                            <SelectItem key={optionIndex} value={option}>{option}</SelectItem>
                          ))}
                          <SelectItem value="custom">Custom Value</SelectItem>
                        </SelectContent>
                      </Select>
                      {gammaInputType === 'custom' && (
                        <Input
                          type="number"
                          placeholder="Enter custom gamma value"
                          min={param.min}
                          max={param.max}
                          step={param.step}
                          value={customGamma}
                          disabled={adjustmentMethod === 'auto' || isTraining}
                          onChange={(e) => handleCustomGammaChange(e.target.value)}
                        />
                      )}
                    </div>
                  ) : param.type === 'select' ? (
                    <Select
                      value={hyperParams[param.name] || ''}
                      disabled={adjustmentMethod === 'auto' || isTraining}
                      onValueChange={(selectedOption) => handleHyperParamChange(param.name, selectedOption)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${param.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {param.options.map((option, optionIndex) => (
                          <SelectItem key={optionIndex} value={option.toString()}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-gray-500">Select a model to view and adjust its hyperparameters.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
