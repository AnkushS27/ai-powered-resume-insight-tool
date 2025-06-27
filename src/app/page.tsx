"use client"

import { useState, useEffect, ChangeEvent } from "react"
import { Upload, FileText, History, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface InsightData {
  id: string
  filename: string
  uploadDate: string
  summary?: string
  topWords?: string[]
  type: "ai_summary" | "word_frequency"
}

export default function DocumentInsightTool() {
  const [activeTab, setActiveTab] = useState("upload")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [currentInsight, setCurrentInsight] = useState<InsightData | null>(null)
  const [history, setHistory] = useState<InsightData[]>([])
  const [error, setError] = useState<string>("")

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setSelectedFile(file)
      setError("")
    } else {
      setError("Please select a valid PDF file")
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("resume", selectedFile)

      const response = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      })

      const responseText = await response.text()

      if (!response.ok) {
        let errorMessage = "Upload failed"
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.error || errorData.details || errorMessage
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const result = JSON.parse(responseText)
      setCurrentInsight(result)

      // Refresh history
      await fetchHistory()

      setSelectedFile(null)
      // Reset file input
      const fileInput = document.getElementById("file-input") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload and process document. Please try again."
      setError(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/insights")
      if (response.ok) {
        const historyData = await response.json()
        setHistory(historyData)
      }
    } catch (err) {
      console.error("Failed to fetch history:", err)
    }
  }

  const viewHistoryItem = async (id: string) => {
    try {
      const response = await fetch(`/api/insights?id=${id}`)
      if (response.ok) {
        const insight = await response.json()
        setCurrentInsight(insight)
        // Switch to upload tab to show the results
        setActiveTab("upload")
      }
    } catch (err) {
      console.error("Failed to fetch insight:", err)
    }
  }

  // Load history on component mount
  useEffect(() => {
    fetchHistory()
  }, [])

  // Format the AI summary for better readability
  const formatSummary = (summary: string) => {
    return summary
      .split("\n")
      .map((line, index) => {
        const trimmedLine = line.trim()
        if (!trimmedLine) return null

        // Check if line is a section header (all caps or ends with colon)
        if (trimmedLine.match(/^[A-Z\s]+:$/) || trimmedLine.match(/^[A-Z][A-Z\s]+$/)) {
          return (
            <div key={index} className="font-semibold text-slate-800 mt-4 mb-2 first:mt-0">
              {trimmedLine}
            </div>
          )
        }

        return (
          <div key={index} className="mb-2 leading-relaxed">
            {trimmedLine}
          </div>
        )
      })
      .filter(Boolean)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">AI Document Insight Tool</h1>
          <p className="text-slate-600 text-lg">Upload PDF documents and get AI-powered insights and summaries</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upload" className="flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              Upload & Analyze
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 cursor-pointer">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Document Upload
                  </CardTitle>
                  <CardDescription>Select a PDF document to analyze and get insights</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
                    <input id="file-input" type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
                    <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-slate-400" />
                      <span className="text-sm text-slate-600">Click to select PDF file</span>
                    </label>
                  </div>

                  {selectedFile && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                      </div>
                      <Badge variant="secondary">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Badge>
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full cursor-pointer">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Upload & Analyze"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Results Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>AI-generated insights from your document</CardDescription>
                </CardHeader>
                <CardContent>
                  {currentInsight ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{currentInsight.filename}</h3>
                        <Badge variant={currentInsight.type === "ai_summary" ? "default" : "secondary"}>
                          {currentInsight.type === "ai_summary" ? "AI Summary" : "Word Analysis"}
                        </Badge>
                      </div>

                      {currentInsight.type === "ai_summary" && currentInsight.summary && (
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="font-medium mb-3">AI Summary:</h4>
                          <div className="text-slate-700">{formatSummary(currentInsight.summary)}</div>
                        </div>
                      )}

                      {currentInsight.type === "word_frequency" && currentInsight.topWords && (
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="font-medium mb-2">Top 5 Most Frequent Words:</h4>
                          <div className="flex flex-wrap gap-2">
                            {currentInsight.topWords.map((word, index) => (
                              <Badge key={index} variant="outline">
                                {word}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-sm text-slate-500">
                        Processed on {new Date(currentInsight.uploadDate).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Upload a document to see analysis results</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Document History</CardTitle>
                <CardDescription>View all previously analyzed documents</CardDescription>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => viewHistoryItem(item.id)}
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-slate-500" />
                            <div>
                              <p className="font-medium">{item.filename}</p>
                              <p className="text-sm text-slate-500">{new Date(item.uploadDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Badge variant={item.type === "ai_summary" ? "default" : "secondary"}>
                            {item.type === "ai_summary" ? "AI Summary" : "Word Analysis"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No documents analyzed yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
