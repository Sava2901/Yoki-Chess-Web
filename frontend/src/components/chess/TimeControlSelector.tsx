import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Zap, Timer, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TimeControlOption {
  id: string
  name: string
  minutes: number
  increment: number
  category: 'bullet' | 'blitz' | 'rapid' | 'classical'
  description: string
  popular?: boolean
}

const TIME_CONTROLS: TimeControlOption[] = [
  // Bullet (6 options)
  { id: '0.5+0', name: '30 sec', minutes: 0.5, increment: 0, category: 'bullet', description: 'Lightning fast' },
  { id: '1+0', name: '1 min', minutes: 1, increment: 0, category: 'bullet', description: 'Ultra-fast games' },
  { id: '1+1', name: '1+1', minutes: 1, increment: 1, category: 'bullet', description: '1 min + 1 sec', popular: true },
  { id: '2+0', name: '2 min', minutes: 2, increment: 0, category: 'bullet', description: 'Speed chess' },
  { id: '2+1', name: '2+1', minutes: 2, increment: 1, category: 'bullet', description: '2 min + 1 sec' },
  { id: '2.5+0', name: '2.5 min', minutes: 2.5, increment: 0, category: 'bullet', description: 'Extended bullet' },
  
  // Blitz (6 options)
  { id: '3+0', name: '3 min', minutes: 3, increment: 0, category: 'blitz', description: 'Quick tactical games' },
  { id: '3+2', name: '3+2', minutes: 3, increment: 2, category: 'blitz', description: '3 min + 2 sec', popular: true },
  { id: '4+0', name: '4 min', minutes: 4, increment: 0, category: 'blitz', description: 'Balanced blitz' },
  { id: '4+2', name: '4+2', minutes: 4, increment: 2, category: 'blitz', description: '4 min + 2 sec' },
  { id: '5+0', name: '5 min', minutes: 5, increment: 0, category: 'blitz', description: 'Standard blitz' },
  { id: '5+3', name: '5+3', minutes: 5, increment: 3, category: 'blitz', description: '5 min + 3 sec' },
  
  // Rapid (6 options)
  { id: '10+0', name: '10 min', minutes: 10, increment: 0, category: 'rapid', description: 'Classic rapid', popular: true },
  { id: '10+5', name: '10+5', minutes: 10, increment: 5, category: 'rapid', description: '10 min + 5 sec' },
  { id: '12+0', name: '12 min', minutes: 12, increment: 0, category: 'rapid', description: 'Extended rapid' },
  { id: '15+0', name: '15 min', minutes: 15, increment: 0, category: 'rapid', description: 'Tournament rapid' },
  { id: '15+10', name: '15+10', minutes: 15, increment: 10, category: 'rapid', description: '15 min + 10 sec' },
  { id: '20+0', name: '20 min', minutes: 20, increment: 0, category: 'rapid', description: 'Long rapid' },
  
  // Classical (6 options)
  { id: '25+0', name: '25 min', minutes: 25, increment: 0, category: 'classical', description: 'Quick classical' },
  { id: '30+0', name: '30 min', minutes: 30, increment: 0, category: 'classical', description: 'Long strategic games' },
  { id: '30+20', name: '30+20', minutes: 30, increment: 20, category: 'classical', description: '30 min + 20 sec', popular: true },
  { id: '45+0', name: '45 min', minutes: 45, increment: 0, category: 'classical', description: 'Extended classical' },
  { id: '60+0', name: '60 min', minutes: 60, increment: 0, category: 'classical', description: 'Tournament style' },
  { id: '90+30', name: '90+30', minutes: 90, increment: 30, category: 'classical', description: '90 min + 30 sec' },
]

const CATEGORY_CONFIG = {
  bullet: {
    name: 'Bullet',
    icon: Zap,
    color: 'bg-red-500',
    description: '1-2 minutes'
  },
  blitz: {
    name: 'Blitz',
    icon: Timer,
    color: 'bg-orange-500',
    description: '3-5 minutes'
  },
  rapid: {
    name: 'Rapid',
    icon: Clock,
    color: 'bg-blue-500',
    description: '10-15 minutes'
  },
  classical: {
    name: 'Classical',
    icon: Crown,
    color: 'bg-purple-500',
    description: '30+ minutes'
  }
}

interface TimeControlSelectorProps {
  selectedTimeControl: string
  onTimeControlChange: (timeControl: TimeControlOption) => void
  className?: string
}

export function TimeControlSelector({
  selectedTimeControl,
  onTimeControlChange,
  className
}: TimeControlSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('rapid')

  const categories = Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>
  const filteredControls = TIME_CONTROLS.filter(control => control.category === selectedCategory)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Category Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {categories.map((category) => {
          const config = CATEGORY_CONFIG[category]
          const Icon = config.icon
          const isSelected = selectedCategory === category
          
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200',
                'hover:shadow-md hover:scale-105',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border bg-background hover:border-primary/50'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center mb-2',
                config.color
              )}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm font-medium">{config.name}</div>
              <div className="text-xs text-muted-foreground">{config.description}</div>
            </button>
          )
        })}
      </div>

      {/* Time Control Options */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredControls.map((control) => {
          const isSelected = selectedTimeControl === control.id
          
          return (
            <Card
              key={control.id}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 h-28',
                isSelected
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:border-primary/50'
              )}
              onClick={() => onTimeControlChange(control)}
            >
              <CardContent className="p-4 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-lg">{control.name}</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {control.description}
                </div>
                {control.increment > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    +{control.increment}s per move
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Selected Time Control Summary */}
      {selectedTimeControl && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Selected Time Control</div>
                <div className="text-sm text-muted-foreground">
                  {(() => {
                    const control = TIME_CONTROLS.find(c => c.id === selectedTimeControl)
                    if (!control) return 'None selected'
                    return `${control.minutes} minute${control.minutes !== 1 ? 's' : ''}${
                      control.increment > 0 ? ` + ${control.increment} second${control.increment !== 1 ? 's' : ''} increment` : ''
                    }`
                  })()}
                </div>
              </div>
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                (() => {
                  const control = TIME_CONTROLS.find(c => c.id === selectedTimeControl)
                  return control ? CATEGORY_CONFIG[control.category].color : 'bg-gray-500'
                })()
              )}>
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}