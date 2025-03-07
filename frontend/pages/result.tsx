import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, User, X, MessageCircle, Brain } from 'lucide-react'
import axios from 'axios'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

const AnimatedChatButton = ({ isChatOpen, setIsChatOpen }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);

  // Add an effect to stop pulsing after user interaction
  useEffect(() => {
    if (isChatOpen) {
      setIsPulsing(false);
    }
  }, [isChatOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Ripple effect */}
        {isPulsing && (
          <>
            <div className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-75" />
            <div className="absolute inset-0 rounded-full animate-pulse bg-blue-500 opacity-50" />
          </>
        )}
        
        {/* Main button with hover effects */}
        <Button
          className={`
            relative
            rounded-full 
            w-14 
            h-14 
            flex 
            items-center 
            justify-center 
            shadow-lg
            transition-all 
            duration-300 
            ease-in-out
            ${isHovered ? 'bg-indigo-600 scale-110' : 'bg-blue-500'}
            hover:shadow-blue-300/50
            group
          `}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => {
            setIsChatOpen(true);
            setIsPulsing(false);
          }}
        >
          <div className="relative">
            {/* Icon container with rotation animation */}
            <div className={`
              transition-all 
              duration-300 
              ${isHovered ? 'rotate-12 scale-110' : ''}
            `}>
              {isHovered ? (
                <Brain className="h-6 w-6 text-white animate-bounce" />
              ) : (
                <MessageCircle className="h-6 w-6 text-white" />
              )}
            </div>
          </div>

          {/* Tooltip */}
          <span className={`
            absolute 
            right-full 
            mr-4 
            bg-white 
            px-4 
            py-2 
            rounded-lg 
            shadow-lg
            whitespace-nowrap
            transition-all 
            duration-300
            flex 
            items-center 
            gap-2
            hover:bg-gray-50
            border border-gray-100
            ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
          `}>
            <img 
              src="/logo.png" 
              alt="CRANK-MS" 
              className="w-7 h-6 object-contain"
            />
            <span className="text-gray-700 font-medium">
              Ask Crank-MS AI Assistant
            </span>
          </span>
        </Button>
      </div>
    </div>
  );
};

// ChatAssistant Component
const ChatAssistant = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isHovered, setIsHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);

  const sendMessage = async (e) => {
    e?.preventDefault()
    if (!input.trim()) return

    const newMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, newMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        messages: [...messages, newMessage]
      })

      if (response.data && response.data.message) {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.message
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to get response. Please try again.')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleRetry = () => {
    setError(null)
    if (input.trim()) {
      sendMessage(input)
    }
  }

  return (
    <>
      <AnimatedChatButton isChatOpen={isOpen} setIsChatOpen={setIsOpen} />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <img 
               src="/logo.png" 
               alt="Logo" 
               className="w-12 h-10 object-contain"
              />
              <span>Crank-MS AI Assistant</span>
            </DialogTitle>
            <DialogDescription>
              Ask me anything about the results or analysis
            </DialogDescription>
          </DialogHeader>
          <div className="h-[400px] pr-4 overflow-y-auto mb-4" style={{ scrollBehavior: 'smooth' }}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100'
                    } shadow-sm`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {error && (
            <div className="mb-4">
              <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg p-3">
                <span className="text-red-600 text-sm">Failed to get response. Please try again.</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-100 px-3 py-1 text-sm"
                  onClick={handleRetry}
                >
                  Retry
                </Button>
              </div>
            </div>
          )}
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={loading || !input.trim()}
              className={loading ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {loading ? 'Sending...' : 'Send'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Main Result Component
export default function Result({ fromHistory = false }) {
  const router = useRouter();
  const {trainingId, features} = router.query;
  const [trainingDetails, setTrainingDetails] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [resultFiles, setResultFiles] = useState([]);
  const [shapFiles, setShapFiles] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const isActive = (path) => router.pathname === path;

  useEffect(() => {
    if (trainingId) {
      axios.get(`http://localhost:5000/api/get-training-details?trainingId=${trainingId}`)
        .then(response => {
          console.log("Fetched trainingDetails:", response.data);
          setTrainingDetails(response.data);
          setResultFiles(response.data.resultFiles);
          setShapFiles(response.data.shapFiles);
        })
        .catch(error => {
          console.error('Error fetching training details:', error);
        });
    }
  }, [trainingId]);

  const formatFileName = (fullPath) => {
    return fullPath.split(/[/\\]+/).pop();
  };

  const handleImageClick = (imageSrc) => {
    setZoomedImage(imageSrc);
  };

  const closeZoomedImage = () => {
    setZoomedImage(null);
  };

  const handleNavigate = () => {
    const shapAbsoluteAverageFilePath = shapFiles.find(e => e.name.includes('shap_absolute_average.csv'))
    router.push({
      pathname: '/web-shap',
      query: { trainingId:trainingId,features: features, filePath: shapAbsoluteAverageFilePath.name },
    });
  };

  const handleDownloadImage = (imageUrl) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadresultFiles = () => {
    resultFiles.forEach((file, index) => {
      if (file.checked) {
        setTimeout(() => {
          const fileName = file.name;
          const link = document.createElement('a');
          link.href = `http://localhost:5000/fileDownload/${fileName}`;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, index * 500);
      }
    });
  };

  const handleDownloadshapFiles = () => {
    shapFiles.forEach((file, index) => {
      if (file.checked) {
        setTimeout(() => {
          const fileName = file.name;
          const link = document.createElement('a');
          link.href = `http://localhost:5000/fileDownload/${fileName}`;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, index * 500);
      }
    });
  };

  const toggleFileCheck = (index, isShap = false) => {
    if (isShap) {
      setShapFiles(prevFiles => 
        prevFiles.map((file, i) => 
          i === index ? { ...file, checked: !file.checked } : file
        )
      );
    } else {
      setResultFiles(prevFiles => 
        prevFiles.map((file, i) => 
          i === index ? { ...file, checked: !file.checked } : file
        )
      );
    }
  };

  if (!trainingDetails || !resultFiles || !shapFiles) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto">
      <header className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
        <div className="flex items-center">
          <img src="logo.png" alt="CRANK-MS Logo" className="h-20 w-55" />
        </div>

        <div className="fixed bottom-6 right-6 z-50">
          <Button
            className="rounded-full w-12 h-12 flex items-center justify-center bg-blue-500 hover:bg-blue-600 shadow-lg"
            onClick={() => setIsChatOpen(true)}
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </Button>
        </div>

        <ChatAssistant isOpen={isChatOpen} setIsOpen={setIsChatOpen} />

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

      <main className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Result</h2>
        <Card>
          <CardContent className="grid grid-cols-2 gap-4 p-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Training Details</h2>
              <p><strong>User ID:</strong> {trainingDetails.userId}</p>
              <p><strong>Training time:</strong> {trainingDetails.trainingTime}</p>
              <p><strong>Model:</strong> {trainingDetails.model}</p>
              <p><strong>Duration(s):</strong> {trainingDetails.duration}</p>
              <p><strong>Notes:</strong> {trainingDetails.notes}</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Parameter</h2>
              {Object.entries(trainingDetails.parameters ?? {}).map(([key, value]) => (
                <p key={key}>{key}: {String(value ?? 'N/A')}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold mb-4">Image Result</h2>
              <div className="flex justify-between space-x-4">
                {Object.entries(trainingDetails.imagePaths).map(([key, imgPath], index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-49 h-41 bg-gray-200 flex items-center justify-center mb-2 cursor-pointer"
                      onClick={() => handleImageClick(`http://localhost:5000/image/${imgPath}`)}
                    >
                      <img 
                        src={`http://localhost:5000/image/${imgPath}`} 
                        alt={`Image Result ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownloadImage(`http://localhost:5000/imageDownload/${imgPath}`)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold mb-4">Model Performance Metrics</h2>
              {Object.entries(trainingDetails.confusionMatrix ?? {}).map(([key, value]) => (
                <p key={key}>{key}: {String(value ?? 'N/A')}</p>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
  <Card>
    <CardContent>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Result files</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleDownloadresultFiles}
        >
         Download selected
        </Button>
      </div>
      <div className="space-y-2">
        {resultFiles.map((file, index) => (
          <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
            <div 
              className="flex items-center space-x-2 cursor-pointer flex-1"
              onClick={() => toggleFileCheck(index)}
            >
              <Checkbox 
                id={`file-${index}`}
                checked={file.checked}
              />
              <label htmlFor={`file-${index}`} className="text-sm">
                {file.name.split(/[/\\]+/).pop()}
              </label>
            </div>
            {/* <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleDownloadresultFiles(file)}
            >
              <Download className="h-4 w-4" />
            </Button> */}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>

  <Card>
    <CardContent>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Shap files</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleDownloadshapFiles}
        >
          Download selected
        </Button>
      </div>
      <div className="space-y-2">
        {shapFiles.map((file, index) => (
          <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
            <div 
              className="flex items-center space-x-2 cursor-pointer flex-1"
              onClick={() => toggleFileCheck(index, true)}
            >
              <Checkbox 
                id={`shap-file-${index}`}
                checked={file.checked}
              />
              <label htmlFor={`shap-file-${index}`} className="text-sm">
                {file.name.split(/[/\\]+/).pop()}
              </label>
            </div>
            {/* <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleDownloadshapFiles(file)}
            >
              <Download className="h-4 w-4" />
            </Button> */}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
</div>

        <div className="flex justify-center">
          <Button onClick={handleNavigate}>
            Web Shap
          </Button>
        </div>
      </main>

      {zoomedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative">
            <img src={zoomedImage} alt="Zoomed image" className="max-w-90vw max-h-90vh" />
            <Button 
              className="absolute top-4 right-4" 
              variant="secondary" 
              size="icon"
              onClick={closeZoomedImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
