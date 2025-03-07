import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StickyNote } from 'lucide-react';

const TrainingInfoDisplay = ({ predictInfo, description }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // get notes that will display 
  const displayNotes = description || predictInfo.notes;
  
  // only show 20 features at most 
  const displayedFeatures = predictInfo.features ? predictInfo.features.slice(0, 20) : [];
  const totalFeatures = predictInfo.features?.length || 0;

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Training Information</CardTitle>
            <CardDescription>Model and parameters used in training</CardDescription>
          </div>
          {displayNotes && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg max-w-md">
              <StickyNote className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-600 break-words">{displayNotes}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-x-12 gap-y-8">
          {/* Left Column */}
          <div>
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Model</h3>
              <Badge 
                variant="default"
                className="bg-black text-white text-lg px-4 py-1 rounded"
              >
                {predictInfo.model.toUpperCase()}
              </Badge>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Training Time</h3>
              <p className="text-gray-700">
                {formatDate(predictInfo.trainingTime)}
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Parameters</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(predictInfo.parameters || {}).map(([key, value]) => (
                  <Badge 
                    key={key}
                    variant="outline"
                    className="bg-gray-50 text-gray-700 border-gray-200"
                  >
                    {key}:{value}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Selected features ({totalFeatures})
                {totalFeatures > 20 && <span className="text-xs text-gray-400 ml-2">(Showing first 20)</span>}
              </h3>
              <div className="flex flex-wrap gap-2">
                {displayedFeatures.map((feature, index) => (
                  <Badge
                    key={feature}
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    {index + 1}
                  </Badge>
                ))}
              </div>
              {totalFeatures > 20 && (
                <p className="text-xs text-gray-500 mt-2">
                  {totalFeatures - 20} more features not shown
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainingInfoDisplay;