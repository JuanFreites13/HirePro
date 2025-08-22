"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { List, Grid3X3, LayoutGrid } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type ViewMode = "list" | "cards" | "kanban"

interface ViewToggleProps {
  value: ViewMode
  onValueChange: (value: ViewMode) => void
  className?: string
}

const viewOptions = [
  {
    value: "list" as ViewMode,
    icon: List,
    label: "Vista Lista",
    description: "Mostrar como lista"
  },
  {
    value: "cards" as ViewMode,
    icon: Grid3X3,
    label: "Vista Tarjetas", 
    description: "Mostrar como tarjetas"
  },
  {
    value: "kanban" as ViewMode,
    icon: LayoutGrid,
    label: "Vista Kanban",
    description: "Mostrar como kanban"
  }
]

export function ViewToggle({ value, onValueChange, className }: ViewToggleProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load saved preference from localStorage
    const savedView = localStorage.getItem("viewMode") as ViewMode
    if (savedView && ["list", "cards", "kanban"].includes(savedView)) {
      onValueChange(savedView)
    }
  }, [onValueChange])

  const handleViewChange = (newView: ViewMode) => {
    onValueChange(newView)
    localStorage.setItem("viewMode", newView)
  }

  if (!mounted) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {viewOptions.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            size="sm"
            disabled
            className="w-9 h-9 p-0"
          >
            <option.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-1 ${className}`}>
        {viewOptions.map((option) => {
          const Icon = option.icon
          return (
            <Tooltip key={option.value}>
              <TooltipTrigger asChild>
                <Button
                  variant={value === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleViewChange(option.value)}
                  className="w-9 h-9 p-0"
                  aria-label={option.label}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{option.description}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}



