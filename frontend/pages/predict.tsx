import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Timer, FileType, CheckCircle, PieChart, FileCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TrainingInfoDisplay from './TrainingInfoDisplay';



// Defines the training information interface, which contains the basic information of the model training
interface PredictInfo {
  userId: string;
  trainingTime: string;
  model: string;
  parameters: Record<string, any>;
  features: string[];
}

// Define a prediction result interface that contains preview data and statistics
interface PredictionResult {
  prediction_file: string;
  preview_data: Array<{
    input_features: Record<string, any>;
    prediction: number;
  }>;
  statistics: {
    total_predictions: number;
    class_0_count: number;
    class_1_count: number;
    class_0_percentage: number;
    class_1_percentage: number;
  };
}

export default function PredictPage(): JSX.Element {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [predictInfo, setPredictInfo] = useState<PredictInfo | null>(null);
  const [predictResult, setPredictResult] = useState<PredictionResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Get predictive information when the component loads
  useEffect(() => {
    const fetchPredictInfo = async () => {
      try {
        const { trainingId } = router.query;
        const userId = localStorage.getItem('userId');

        // verify login status of user 
        if (!userId) {
          setError('User not logged in');
          router.push('/login');
          return;
        }

        // verify whether training ID exists 
        if (!trainingId) {
          setError('Training ID is missing');
          return;
        }

        // verify whether training ID exists 
        const url = `http://localhost:5000/api/predict_info?userId=${userId}&trainingId=${trainingId}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
          return;
        }

        setPredictInfo(data);
      } catch (error) {
        setError('Failed to fetch prediction information');
      }
    };

    if (router.isReady) {
      fetchPredictInfo();
    }
  }, [router.isReady, router.query]);

  // upload file function 
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  // drag file function 
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile.type === "text/csv") {
      setFile(droppedFile);
      setError('');
    } else {
      setError("Please upload a CSV file.");
    }
  };

  // deal with predicition request 
  const handlePredict = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('User not logged in');
      router.push('/login');
      return;
    }

    setLoading(true);
    setError('');

    // prepare for the table data 
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('trainingId', router.query.trainingId as string);

    try {
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setPredictResult(data);
      } else {
        setError(data.error || 'Prediction failed');
      }
    } catch (error) {
      setError('Failed to make prediction');
    } finally {
      setLoading(false);
    }
  };

  // Render preview table component
  // Preview the table display function
  const renderPreviewTable = () => {
    if (!predictResult?.preview_data || predictResult.preview_data.length === 0) return null;

    const features = Object.keys(predictResult.preview_data[0].input_features);

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Preview Results</CardTitle>
          <CardDescription>Showing first 5 predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {features.map(feature => (
                    <TableHead key={feature}>{feature}</TableHead>
                  ))}
                  <TableHead>Prediction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {predictResult.preview_data.map((row, index) => (
                  <TableRow key={index}>
                    {features.map(feature => (
                      <TableCell key={feature}>{row.input_features[feature]}</TableCell>
                    ))}
                    <TableCell>
                      <Badge variant={row.prediction === 1 ? "default" : "secondary"}>
                        {row.prediction}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render statistics componen
  const renderStatistics = () => {
    if (!predictResult?.statistics) return null;

    const {
      total_predictions,
      class_0_count,
      class_1_count,
      class_0_percentage,
      class_1_percentage
    } = predictResult.statistics;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="mr-2 h-5 w-5" />
            Prediction Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Statistics grid layout */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Total Predictions</div>
              <div className="text-2xl font-bold">{total_predictions}</div>
            </div>
            {/* distritbution status */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Distribution</div>
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="text-xs">
                  Class 1: {class_1_count} ({class_1_percentage.toFixed(1)}%)
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Class 0: {class_0_count} ({class_0_percentage.toFixed(1)}%)
                </Badge>
              </div>
            </div>
          </div>
          {/* The progress bar shows the distribution */}
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${class_1_percentage}%` }}
            />
          </div>
        </CardContent>
      </Card>
    );
  };
  // Check whether the current route is active
  const isActive = (path: string): boolean => router.pathname === path;
  // Error status display
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  // load status display
  if (!predictInfo) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-2 text-gray-600">Loading prediction information...</p>
        </div>
      </div>
    );
  }
  // Main render content
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
        <div className="flex items-center">
          <img src="/logo.png" alt="CRANK-MS Logo" className="h-20 w-55" />
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
          <Button
            variant="destructive"
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/');
            }}
          >
            Log Out
          </Button>
        </nav>
      </header>

      {predictInfo && <TrainingInfoDisplay predictInfo={predictInfo} />}
      {/* Prediction card */}
      <Card>
        <CardHeader>
          <CardTitle>Make Prediction</CardTitle>
          <CardDescription>Upload your data file and get predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
  
            {/* file upload region */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging
                  ? 'border-red-500 bg-red-50'
                  : file
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300'
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                {!file ? (
                  <>
                    <Upload className={`h-12 w-12 mb-4 ${isDragging ? 'text-red-500' : 'text-gray-400'}`} />
                    <span className={`text-sm ${isDragging ? 'text-red-500' : 'text-gray-600'}`}>
                      {isDragging ? 'Drop your file here' : 'Select a file or drag and drop here'}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">CSV files only</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="h-12 w-12 mb-4 text-green-500" />
                    <span className="text-sm text-green-600 font-semibold">
                      {file.name} UPLOADED SUCCESSFULLY
                    </span>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={(e) => {
                        e.preventDefault();
                        setFile(null);
                      }}
                    >
                      RE-SELECT FILE
                    </Button>
                  </>
                )}
              </label>
            </div>

            <div className="flex justify-end gap-4">
              <Button onClick={handlePredict} disabled={!file || loading} className="w-32">
                {loading ? (
                  <>
                    <Timer className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : 'Predict'}
              </Button>
            </div>

            {predictResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium">Prediction Complete</span>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => window.open(`http://localhost:5000${predictResult.prediction_file}`, '_blank')}
                    className="flex items-center"
                  >
                    <FileType className="mr-2 h-4 w-4" />
                    Download Results
                  </Button>

                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* predicition result display */}
      {predictResult && (
        <>
          {renderStatistics()}
          {renderPreviewTable()}
        </>
      )}
    </div>
  );
}