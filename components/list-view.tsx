"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye } from "lucide-react"

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

interface ListViewProps {
  candidates: Candidate[]
  onSelectCandidate: (id: number) => void
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => React.ReactNode
}

export function ListView({ candidates, onSelectCandidate, getStatusColor, getStatusIcon }: ListViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidatos - Vista Lista</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={candidate.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {candidate.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{candidate.name}</h3>
                  <p className="text-sm text-gray-600">{candidate.position}</p>
                  <p className="text-xs text-gray-500">{candidate.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <Badge variant="outline" className="mb-1">
                    {candidate.stage}
                  </Badge>
                  <div
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}
                  >
                    {getStatusIcon(candidate.status)}
                    <span className="ml-1 capitalize">{candidate.status}</span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm font-medium">Puntaje</div>
                  <div className="text-lg font-bold text-purple-600">{candidate.score ? candidate.score.toFixed(1) : '0.0'}</div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-gray-600">Responsable</div>
                  <div className="text-sm font-medium">{candidate.assignee}</div>
                </div>

                <Button variant="outline" size="sm" onClick={() => onSelectCandidate(candidate.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver detalle
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
