"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { X, Loader2, ArrowRight } from "lucide-react"
import { candidatesService } from "@/lib/supabase-service"

interface MoveStageModalProps {
  onClose: () => void
  candidate: any
  currentStage: string
  onStageChanged: () => void
}

const stages = [
  { id: "pre-entrevista", name: "Pre-entrevista", color: "bg-blue-100 text-blue-800" },
  { id: "primera", name: "1ª Entrevista", color: "bg-yellow-100 text-yellow-800" },
  { id: "segunda", name: "2ª Entrevista", color: "bg-orange-100 text-orange-800" },
  { id: "fit-cultural", name: "Fit Cultural", color: "bg-purple-100 text-purple-800" },
  { id: "seleccionado", name: "Seleccionado", color: "bg-green-100 text-green-800" },
  { id: "descartado", name: "Descartado", color: "bg-red-100 text-red-800" },
  { id: "stand-by", name: "Stand by", color: "bg-gray-100 text-gray-800" },
]

export function MoveStageModal({ onClose, candidate, currentStage, onStageChanged }: MoveStageModalProps) {
  const [loading, setLoading] = useState(false)
  const [newStage, setNewStage] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStage || newStage === currentStage) return

    setLoading(true)
    
    try {
      const updatedCandidate = await candidatesService.updateCandidate(candidate.id, {
        stage: newStage,
        // Aquí podrías agregar un campo para notas de cambio de etapa
        updated_at: new Date().toISOString()
      })

      if (updatedCandidate) {
        console.log("✅ Candidato movido a etapa:", newStage)
        onStageChanged()
        onClose()
      }
    } catch (error) {
      console.error("❌ Error moviendo candidato:", error)
      alert("Error al mover el candidato. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const getStageName = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId)
    return stage?.name || stageId
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Mover Candidato
            <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Candidato</Label>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium">{candidate.name}</div>
              <div className="text-sm text-muted-foreground">{candidate.position}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Etapa Actual</Label>
            <div className="p-3 bg-muted rounded-md">
              <span className="font-medium">{getStageName(currentStage)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newStage">Nueva Etapa *</Label>
            <Select
              value={newStage}
              onValueChange={setNewStage}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nueva etapa" />
              </SelectTrigger>
              <SelectContent>
                {stages
                  .filter(stage => stage.id !== currentStage)
                  .map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Razón del cambio de etapa..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !newStage || newStage === currentStage}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Moviendo...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Mover a {getStageName(newStage)}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}



