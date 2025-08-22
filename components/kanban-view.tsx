"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StageChangeModal } from "./stage-change-modal"

interface Candidate {
  id: number
  name: string
  email: string
  phone: string
  position: string
  stage: string
  status: string
  assignee: string
  lastActivity: string
  score: number
  avatar: string
}

interface KanbanViewProps {
  candidates: Candidate[]
  stages: string[]
  onSelectCandidate: (id: number) => void
  onStageChange: (candidateId: number, newStage: string, feedback: string, score: number) => void
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => React.ReactNode
}

export function KanbanView({
  candidates,
  stages,
  onSelectCandidate,
  onStageChange,
  getStatusColor,
  getStatusIcon,
}: KanbanViewProps) {
  const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null)
  const [showStageModal, setShowStageModal] = useState(false)
  const [targetStage, setTargetStage] = useState("")

  const handleDragStart = (e: React.DragEvent, candidate: Candidate) => {
    setDraggedCandidate(candidate)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, stage: string) => {
    e.preventDefault()
    if (draggedCandidate && draggedCandidate.stage !== stage) {
      setTargetStage(stage)
      setShowStageModal(true)
    }
    setDraggedCandidate(null)
  }

  const handleStageChangeConfirm = (feedback: string, score: number, assignee: string) => {
    if (draggedCandidate) {
      onStageChange(draggedCandidate.id, targetStage, feedback, score)
      setShowStageModal(false)
      setDraggedCandidate(null)
      setTargetStage("")
    }
  }

  const getCandidatesByStage = (stage: string) => {
    return candidates.filter((candidate) => candidate.stage === stage)
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Pre-entrevista":
        return "bg-gray-100 border-gray-300"
      case "Primera etapa":
        return "bg-blue-100 border-blue-300"
      case "Segunda etapa":
        return "bg-yellow-100 border-yellow-300"
      case "Fit cultural":
        return "bg-purple-100 border-purple-300"
      case "Seleccionado":
        return "bg-green-100 border-green-300"
      case "Descartado":
        return "bg-red-100 border-red-300"
      case "Stand by":
        return "bg-orange-100 border-orange-300"
      default:
        return "bg-gray-100 border-gray-300"
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Candidatos - Vista Kanban</h2>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageCandidates = getCandidatesByStage(stage)
          return (
            <div
              key={stage}
              className={`min-w-80 rounded-lg border-2 border-dashed p-4 ${getStageColor(stage)}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="mb-4">
                <h3 className="font-semibold text-lg">{stage}</h3>
                <p className="text-sm text-gray-600">{stageCandidates.length} candidatos</p>
              </div>

              <div className="space-y-3">
                {stageCandidates.map((candidate) => (
                  <Card
                    key={candidate.id}
                    className="cursor-move hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, candidate)}
                    onClick={() => onSelectCandidate(candidate.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={candidate.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {candidate.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{candidate.name}</h4>
                          <p className="text-xs text-gray-600">{candidate.position}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}
                        >
                          {getStatusIcon(candidate.status)}
                          <span className="ml-1 capitalize">{candidate.status}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-600">Puntaje</div>
                          <div className="text-sm font-bold text-purple-600">{candidate.score.toFixed(1)}</div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600">
                        <div>Responsable: {candidate.assignee}</div>
                        <div>Última actividad: {candidate.lastActivity}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {showStageModal && draggedCandidate && (
        <StageChangeModal
          candidate={draggedCandidate}
          newStage={targetStage}
          onConfirm={handleStageChangeConfirm}
          onCancel={() => {
            setShowStageModal(false)
            setDraggedCandidate(null)
            setTargetStage("")
          }}
        />
      )}
    </div>
  )
}
