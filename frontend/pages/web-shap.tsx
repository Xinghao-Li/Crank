import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, Download, Copy, Check } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function WebSHAP() {
  const router = useRouter()
  const [topFeatures, setTopFeatures] = useState(10)
  const [featuresList, setFeaturesList] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const [imgPath, setImgPath] = useState(null)

  
  let {trainingId, filePath, features } = router.query
  
  const isActive = (path) => router.pathname === path

  const handleTopFeaturesChange = async (value) => {
    setTopFeatures(value)
    try {
      const response = await fetch(`http://localhost:5000/api/top-features?n=${value}&trainingId=${trainingId}`)
      const data = await response.json()
      setFeaturesList(data.features.join(', '))
    } catch (error) {
      console.error('Error fetching top features:', error)
    }
  }

  const handleCopy = async () => {
    if (!featuresList) return
    try {
      await navigator.clipboard.writeText(featuresList)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleDownloadZip = async () => {
    try {
      if (imgPath) {
        const response = await fetch(`http://localhost:5000/image/${imgPath}`)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${trainingId}_downloaded_image.jpg`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }else{
        fetch(`http://localhost:5000/api/generate_shap_plot?trainingId=${trainingId}`, {
         method: 'get',
        })
        .then((response) => response.json())
        .then( async (data) => {
          const response =  await fetch(`http://localhost:5000/image/${data.path}`)
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${trainingId}_downloaded_image.jpg`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        })
        .catch((error) => {
          console.error('Failed to downloaded image:', error)
          alert('Failed to downloaded image')
        })
      }
    } catch (error) {
      console.error('Error downloading SHAP results:', error)
    }
  }


  const handleShapAnalyze = () => {
    let featuresArray = features ? features.toString().split(',') : []
    featuresArray = featuresArray.filter(item => item !== "")
    
    if (featuresArray.length < 1) {
      const value = localStorage.getItem('fields')
      featuresArray = value ? value.split(',').slice(1) : []
    }

    const data = {
      path: filePath,
      features: featuresArray
    }

    fetch(`http://localhost:5000/api/generate_shap_plot?trainingId=${trainingId}`, {
      method: 'get',
    })
      .then((response) => response.json())
      .then((data) => {
        setImgPath(data.path)
      })
      .catch((error) => {
        console.error('Failed to generate SHAP plot:', error)
        alert('Failed to generate visualization')
      })
  }

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
          <Button 
            variant="destructive" 
            onClick={() => {
              localStorage.removeItem('token')
              router.push('/')
            }}
          >
            Log Out
          </Button>
        </nav>
      </header>

      <main className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">WEB SHAP</h2>
          <Button 
            variant="outline"
            onClick={handleDownloadZip}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Results
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="top-features">Top Features:</Label>
                <Select
                  value={topFeatures.toString()}
                  onValueChange={handleTopFeaturesChange}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Top 5</SelectItem>
                    <SelectItem value="10">Top 10</SelectItem>
                    <SelectItem value="15">Top 15</SelectItem>
                    <SelectItem value="20">Top 20</SelectItem>
                    <SelectItem value="25">Top 25</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Selected Features:</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!featuresList}
                    className="h-8 flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-green-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={featuresList}
                  readOnly
                  className="h-24 font-mono text-sm"
                  placeholder="Features will appear here..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full aspect-video">
          <CardContent className="flex items-center justify-center h-full">
            {imgPath ? (
              <img 
                src={`http://localhost:5000/image/${imgPath}`} 
                alt="SHAP Visualization" 
                className="h-full"
              />
            ) : (
              <p className="text-gray-400">SHAP visualization will be displayed here</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button onClick={handleShapAnalyze}>SHAP ANALYZE</Button>
        </div>
      </main>
    </div>
  )
}
