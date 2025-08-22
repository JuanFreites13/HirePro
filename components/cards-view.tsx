"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Mail, Phone } from "lucide-react"

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

interface CardsViewProps {
  candidates: Candidate[]
  onSelectCandidate: (id: number) => void
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => React.ReactNode
}

export function CardsView({ candidates, onSelectCandidate, getStatusColor, getStatusIcon }: CardsViewProps) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Candidatos - Vista Cards</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={candidate.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {candidate.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{candidate.name}</CardTitle>
                  <p className="text-sm text-gray-600">{candidate.position}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{candidate.email}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{candidate.phone}</span>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant="outline">{candidate.stage}</Badge>
                <div
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}
                >
                  {getStatusIcon(candidate.status)}
                  <span className="ml-1 capitalize">{candidate.status}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Puntaje</div>
                  <div className="text-xl font-bold text-purple-600">{candidate.score ? candidate.score.toFixed(1) : '0.0'}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Responsable</div>
                  <div className="text-sm font-medium">{candidate.assignee}</div>
                </div>
              </div>

              <Button
                className="w-full bg-transparent"
                variant="outline"
                onClick={() => onSelectCandidate(candidate.id)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver detalle
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
