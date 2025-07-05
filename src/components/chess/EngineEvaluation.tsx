import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react'

interface EngineEvaluationProps {
  evaluation: number // in pawns (positive = white advantage, negative = black advantage)
  depth: number
  bestMove?: string
  principalVariation?: string[]
  isAnalyzing?: boolean
  className?: string
}

export function EngineEvaluation({
  evaluation,
  depth,
  bestMove,
  principalVariation = [],
  isAnalyzing = false,
  className
}: EngineEvaluationProps) {
  // Convert evaluation to percentage for progress bar (0-100)
  const evaluationPercentage = Math.max(0, Math.min(100, 50 + (evaluation * 10)))
  
  // Format evaluation display
  const formatEvaluation = (evalValue: number): string => {
    if (Math.abs(evalValue) > 10) {
      return evalValue > 0 ? '+M' : '-M' // Mate
    }
    return evalValue > 0 ? `+${evalValue.toFixed(1)}` : evalValue.toFixed(1)
  }

  // Get evaluation color and icon
  const getEvaluationDisplay = (evalValue: number) => {
    if (Math.abs(evalValue) < 0.1) {
      return {
        icon: Minus,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        label: 'Equal'
      }
    } else if (evalValue > 0) {
      return {
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        label: 'White advantage'
      }
    } else {
      return {
        icon: TrendingDown,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        label: 'Black advantage'
      }
    }
  }

  const evalDisplay = getEvaluationDisplay(evaluation)
  const EvalIcon = evalDisplay.icon

  return (
    <div className={cn('space-y-4', className)}>
      {/* Evaluation Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Evaluation</span>
          <div className="flex items-center space-x-2">
            {isAnalyzing && (
              <Zap className="h-3 w-3 text-yellow-500 animate-pulse" />
            )}
            <Badge variant="outline" className={cn('font-mono', evalDisplay.color)}>
              <EvalIcon className="h-3 w-3 mr-1" />
              {formatEvaluation(evaluation)}
            </Badge>
          </div>
        </div>
        
        <div className="relative">
          <Progress 
            value={evaluationPercentage} 
            className="h-3"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-0.5 h-full bg-gray-400 opacity-50" />
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Black</span>
          <span>Equal</span>
          <span>White</span>
        </div>
      </div>

      {/* Engine Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Depth:</span>
          <span className="ml-2 font-mono">{depth}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Status:</span>
          <span className={cn('ml-2', isAnalyzing ? 'text-yellow-600' : 'text-green-600')}>
            {isAnalyzing ? 'Analyzing...' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Best Move */}
      {bestMove && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Best Move</h4>
          <div className={cn(
            'p-3 rounded-lg border font-mono text-lg text-center',
            evalDisplay.bgColor,
            evalDisplay.color
          )}>
            {bestMove}
          </div>
        </div>
      )}

      {/* Principal Variation */}
      {principalVariation.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Principal Variation</h4>
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-mono text-sm space-x-1">
              {principalVariation.map((move, index) => (
                <span key={index} className="inline-block">
                  {index % 2 === 0 && (
                    <span className="text-muted-foreground mr-1">
                      {Math.floor(index / 2) + 1}.
                    </span>
                  )}
                  <span className="mr-2">{move}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Description */}
      <div className="text-xs text-muted-foreground">
        <p>{evalDisplay.label}</p>
        {Math.abs(evaluation) > 10 && (
          <p className="mt-1">
            {evaluation > 0 ? 'White' : 'Black'} has a forced mate
          </p>
        )}
      </div>
    </div>
  )
}

// Simplified evaluation bar for compact display
export function SimpleEvaluationBar({ 
  evaluation, 
  className 
}: { 
  evaluation: number
  className?: string 
}) {
  const evaluationPercentage = Math.max(0, Math.min(100, 50 + (evaluation * 10)))
  
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between text-xs">
        <span>Black</span>
        <span className="font-mono">
          {evaluation > 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1)}
        </span>
        <span>White</span>
      </div>
      <Progress value={evaluationPercentage} className="h-2" />
    </div>
  )
}