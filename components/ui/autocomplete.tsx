"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, Users, FileText, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { applicationsService, candidatesService } from "@/lib/supabase-service"

interface SearchResult {
  id: number
  type: "candidate" | "application"
  title: string
  subtitle: string
  icon: React.ReactNode
}

interface AutocompleteProps {
  placeholder?: string
  className?: string
  onSearch?: (query: string) => void
}

export function Autocomplete({ placeholder = "Buscar...", className, onSearch }: AutocompleteProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(-1)
  const [isLoading, setIsLoading] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const resultsRef = React.useRef<HTMLDivElement>(null)

  // Debounce search
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query.trim())
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 250)

    return () => clearTimeout(timeoutId)
  }, [query])

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true)
    try {
      const [applications, candidates] = await Promise.all([
        applicationsService.getAllApplications(),
        candidatesService.getAllCandidates()
      ])

      const filteredApplications = applications
        .filter(app => 
          app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
        .map(app => ({
          id: app.id,
          type: "application" as const,
          title: app.title,
          subtitle: app.area || "Sin área",
          icon: <FileText className="h-4 w-4" />
        }))

      const filteredCandidates = candidates
        .filter(candidate => 
          candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          candidate.position?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
        .map(candidate => ({
          id: candidate.id,
          type: "candidate" as const,
          title: candidate.name,
          subtitle: candidate.position || candidate.email,
          icon: <Users className="h-4 w-4" />
        }))

      const allResults = [...filteredApplications, ...filteredCandidates]
      setResults(allResults)
      setIsOpen(allResults.length > 0)
      setSelectedIndex(-1)
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        )
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelectResult(results[selectedIndex])
        } else if (results.length > 0) {
          handleSelectResult(results[0])
        } else if (query.trim()) {
          // Go to search results page
          router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        }
        break
      case "Escape":
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSelectResult = (result: SearchResult) => {
    if (result.type === "candidate") {
      router.push(`/candidates/${result.id}`)
    } else {
      router.push(`/postulations/${result.id}`)
    }
    setIsOpen(false)
    setQuery("")
    setSelectedIndex(-1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    onSearch?.(e.target.value)
  }

  const handleInputFocus = () => {
    if (results.length > 0) {
      setIsOpen(true)
    }
  }

  const handleInputBlur = () => {
    // Delay closing to allow clicking on results
    setTimeout(() => {
      setIsOpen(false)
      setSelectedIndex(-1)
    }, 200)
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="pl-10 pr-4"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          <div className="p-2">
            {results.some(r => r.type === "application") && (
              <div className="mb-2">
                <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                  Postulaciones
                </div>
                {results
                  .filter(r => r.type === "application")
                  .map((result, index) => {
                    const globalIndex = results.findIndex(r => r.id === result.id && r.type === result.type)
                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSelectResult(result)}
                        className={cn(
                          "w-full flex items-center gap-3 px-2 py-2 rounded-md text-left hover:bg-accent hover:text-accent-foreground transition-colors",
                          selectedIndex === globalIndex && "bg-accent text-accent-foreground"
                        )}
                      >
                        {result.icon}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{result.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                        </div>
                      </button>
                    )
                  })}
              </div>
            )}

            {results.some(r => r.type === "candidate") && (
              <div>
                <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                  Candidatos
                </div>
                {results
                  .filter(r => r.type === "candidate")
                  .map((result, index) => {
                    const globalIndex = results.findIndex(r => r.id === result.id && r.type === result.type)
                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSelectResult(result)}
                        className={cn(
                          "w-full flex items-center gap-3 px-2 py-2 rounded-md text-left hover:bg-accent hover:text-accent-foreground transition-colors",
                          selectedIndex === globalIndex && "bg-accent text-accent-foreground"
                        )}
                      >
                        {result.icon}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{result.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                        </div>
                      </button>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}



