import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Play, Download, Info, RefreshCcw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HistoryItem {
  id: string;
  user_name: string;
  training_time: string;
  model: string;
  duration: string;
  parameters: Record<string, any>;
  description: string;
  result_path: string;
}

export default function History() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/training-history?user_id=${localStorage.getItem('userId')}`);
      if (!response.ok) {
        if (response.status === 404) {
          setData([]);
          setError('No training history found');
        } else {
          throw new Error('Failed to fetch history');
        }
      } else {
        const jsonData = await response.json();
        setData(jsonData);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const isActive = (path: string): boolean => router.pathname === path;

  const Navigation = () => (
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
  );

  if (loading) return (
    <div className="min-h-screen">
      <Navigation />
      <div className="flex justify-center items-center h-[calc(100vh-96px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
      <h3 className="text-xl font-medium text-gray-600 mb-4">No training history found</h3>
      <p className="text-gray-500 mb-6">Start your first training session to see your history here</p>
      <Button
        onClick={() => router.push('/dashboard')}
        className="bg-red-500 hover:bg-red-600"
      >
        Start Training
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto min-h-screen">
      <Navigation />

      <main className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Training History</h2>
        </div>

        {error || data.length === 0 ? (
          <EmptyState />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Training Time</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Duration(s)</TableHead>
                <TableHead>
                  Parameters
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="inline-block ml-1 h-4 w-4 text-gray-500 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Hover over parameters for details</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => router.push({
                    pathname: '/result',
                    query: { trainingId: item.id },
                  })}
                >
                  <TableCell>{item.user_name}</TableCell>
                  <TableCell>{item.training_time}</TableCell>
                  <TableCell>{item.model.toUpperCase()}</TableCell>
                  <TableCell>{item.duration}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">
                            {Object.entries(item.parameters)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')
                              .substring(0, 20) + '...'}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="max-w-xs space-y-1">
                            {Object.entries(item.parameters).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span> {value}
                              </div>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{item.description.substring(0, 20)}...</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{item.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2" onClick={e => e.stopPropagation()}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-green-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push({
                                  pathname: '/predict',
                                  query: { trainingId: item.id },
                                });
                              }}
                            >
                              <Play className="h-4 w-4 text-green-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Make predictions</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-blue-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push({
                                  pathname: '/dashboard',
                                  query: {
                                    model: item.model,
                                    parameters: JSON.stringify(item.parameters),
                                    description: item.description,
                                    trainingId: item.id
                                  },
                                });
                              }}
                            >
                              <RefreshCcw className="h-4 w-4 text-blue-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Retrain model</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-gray-100"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const response = await fetch(`http://localhost:5000/api/download-zip/${item.result_path}`);
                                  if (!response.ok) throw new Error('Failed to download');
                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `training-results-${item.training_time}.zip`;
                                  document.body.appendChild(a);
                                  a.click();
                                  window.URL.revokeObjectURL(url);
                                  document.body.removeChild(a);
                                } catch (error) {
                                  console.error('Download error:', error);
                                  alert('Failed to download results. Please try again.');
                                }
                              }}
                            >
                              <Download className="h-4 w-4 text-gray-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Download results</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-red-100"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this training record?')) {
                                  try {
                                    const response = await fetch(`http://localhost:5000/api/delete_trainingrecord`, {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify({ training_id: item.id, action: 'delete' })
                                    });
                                    if (!response.ok) throw new Error('Failed to delete');
                                    await fetchHistory();
                                    alert('Record deleted successfully');
                                  } catch (error) {
                                    console.error('Delete error:', error);
                                    alert('Failed to delete record. Please try again.');
                                  }
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete record</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </main>
    </div>
  );
}