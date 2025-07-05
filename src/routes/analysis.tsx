import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChessBoard } from '@/components/chess/ChessBoard'
import { MoveHistory } from '@/components/chess/MoveHistory'
import { EngineEvaluation } from '@/components/chess/EngineEvaluation'
import { Upload, Play, BarChart3, FileText } from 'lucide-react'

export const Route = createFileRoute('/analysis')({ 
  component: AnalysisPage,
})

function AnalysisPage() {
  const [pgnText, setPgnText] = useState('')
  const [fenPosition, setFenPosition] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyzePGN = () => {
    if (pgnText.trim()) {
      setIsAnalyzing(true)
      // TODO: Implement PGN analysis logic
    }
  }

  const handleAnalyzeFEN = () => {
    if (fenPosition.trim()) {
      setIsAnalyzing(true)
      // TODO: Implement FEN analysis logic
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setPgnText(content)
      }
      reader.readAsText(file)
    }
  }

  if (isAnalyzing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chess Board Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Game Analysis
                </CardTitle>
                <CardDescription>
                  Use the controls below to navigate through the game
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-4">
                  <ChessBoard />
                </div>
                <div className="flex justify-center space-x-2">
                  <Button variant="outline" size="sm">
                    ⏮️ Start
                  </Button>
                  <Button variant="outline" size="sm">
                    ⏪ Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    ⏸️ Pause
                  </Button>
                  <Button variant="outline" size="sm">
                    ⏩ Next
                  </Button>
                  <Button variant="outline" size="sm">
                    ⏭️ End
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Engine Evaluation</CardTitle>
              </CardHeader>
              <CardContent>
                <EngineEvaluation 
                  evaluation={0.3} 
                  depth={18} 
                  bestMove="Nf3" 
                  principalVariation={['Nf3', 'Nc6', 'Bb5', 'a6']}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Move History</CardTitle>
              </CardHeader>
              <CardContent>
                <MoveHistory 
                  moves={['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6']} 
                  currentMove={4}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analysis Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full">
                  <Play className="mr-2 h-4 w-4" />
                  Auto-play
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Export Analysis
                </Button>
                <Button variant="outline" className="w-full">
                  Reset Position
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Game Analysis</h1>
          <p className="text-muted-foreground">
            Analyze your chess games with our powerful engine to improve your play
          </p>
        </div>

        <Tabs defaultValue="pgn" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pgn">PGN Analysis</TabsTrigger>
            <TabsTrigger value="position">Position Analysis</TabsTrigger>
            <TabsTrigger value="upload">Upload File</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pgn" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analyze PGN</CardTitle>
                <CardDescription>
                  Paste your game in PGN format for detailed analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pgn-input">PGN Text</Label>
                  <Textarea
                    id="pgn-input"
                    placeholder="1. e4 e5 2. Nf3 Nc6 3. Bb5..."
                    value={pgnText}
                    onChange={(e) => setPgnText(e.target.value)}
                    rows={8}
                  />
                </div>
                <Button onClick={handleAnalyzePGN} className="w-full" disabled={!pgnText.trim()}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analyze Game
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="position" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analyze Position</CardTitle>
                <CardDescription>
                  Enter a FEN string to analyze a specific chess position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fen-input">FEN Position</Label>
                  <Input
                    id="fen-input"
                    placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                    value={fenPosition}
                    onChange={(e) => setFenPosition(e.target.value)}
                  />
                </div>
                <Button onClick={handleAnalyzeFEN} className="w-full" disabled={!fenPosition.trim()}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analyze Position
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload PGN File</CardTitle>
                <CardDescription>
                  Upload a PGN file from your computer for analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Choose PGN File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pgn"
                    onChange={handleFileUpload}
                  />
                </div>
                {pgnText && (
                  <div className="space-y-2">
                    <Label>File Content Preview</Label>
                    <Textarea
                      value={pgnText.substring(0, 200) + (pgnText.length > 200 ? '...' : '')}
                      readOnly
                      rows={4}
                    />
                  </div>
                )}
                <Button onClick={handleAnalyzePGN} className="w-full" disabled={!pgnText.trim()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Analyze Uploaded Game
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Analyses */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
            <CardDescription>
              Your recently analyzed games
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Sicilian Defense Game</p>
                  <p className="text-sm text-muted-foreground">Analyzed 2 hours ago</p>
                </div>
                <Button size="sm" variant="outline">View</Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Queen's Gambit</p>
                  <p className="text-sm text-muted-foreground">Analyzed yesterday</p>
                </div>
                <Button size="sm" variant="outline">View</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}