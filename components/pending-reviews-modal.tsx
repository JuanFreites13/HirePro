"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { pendingReviewsService } from "@/lib/supabase-service"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

interface PendingReviewsModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  userId: string
}

export function PendingReviewsModal({ open, onOpenChange, userId }: PendingReviewsModalProps) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const defaultDays = Number(process.env.NEXT_PUBLIC_STALLED_DAYS ?? 7)

  useEffect(() => {
    if (open) load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const load = async () => {
    setLoading(true)
    const data = await pendingReviewsService.getStalledCandidates({ assigneeId: userId })
    setItems(data)
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Revisiones Pendientes</DialogTitle>
        </DialogHeader>

        {/* Info de umbral ocultada a solicitud del usuario */}

        {loading ? (
          <div className="py-10 text-center text-gray-500">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center text-gray-500">No hay elementos pendientes bajo el umbral seleccionado.</div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {items.map(item => (
              <div key={`${item.source}-${item.candidate_id}-${item.application_id}`} className="border rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold truncate">{item.candidate_name}</h4>
                    <Badge variant="outline">{item.stage}</Badge>
                  </div>
                  <div className="text-sm text-gray-600 truncate">{item.application_title}</div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.days_stalled} días</div>
                    <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(item.updated_at).toLocaleDateString('es-ES')}</div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link href={`/postulations/${item.application_id}`}>
                    <Button size="sm"><ArrowRight className="h-4 w-4 mr-1"/>Ir al Proceso</Button>
                  </Link>
                  <Link href={`/candidates/${item.candidate_id}`}>
                    <Button size="sm" variant="outline">Ver Candidato</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}


