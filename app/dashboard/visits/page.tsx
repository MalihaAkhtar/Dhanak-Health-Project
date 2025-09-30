"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Calendar, Stethoscope } from "lucide-react"

import AddVisitDialog from "@/components/visits/add-visit-dialog"
import { ViewVisitDialog } from "@/components/visits/view-visit-dialog"
import { EditVisitDialog } from "@/components/visits/edit-visit-dialog"
import { useMedicines } from "@/components/medicines/medicine-context"
import { ActionMenu } from "@/components/shared/action-menu"
import * as api from "@/lib/api"

type Visit = {
  _id: string
  visitDate: string
  visitTime: string
  mrNo: string
  patientName: string
  symptoms: string
  diagnosis: string
  procedures?: string[]
  totalFee: number
  paymentStatus: "Paid" | "Unpaid"
  consultationFee?: number
  procedureFee?: number
  medicineFee?: number
  medicines?: { name: string; quantity: number }[]
}

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)

  const { updateMedicineStock } = useMedicines()

  // Fetch visits
  const loadVisits = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.fetchVisits()
      setVisits(data || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching visits:", err)
      setError("Failed to load visits")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadVisits()
  }, [loadVisits])

  const today = new Date().toISOString().split("T")[0]

  // Filtered visits
  const filteredVisits = visits.filter((visit) =>
    [visit.patientName, visit.mrNo, visit.diagnosis].some((field) =>
      (field ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const todayVisits = visits.filter((v) => v.visitDate === today).length

  const handleDeleteVisit = async (id: string) => {
    try {
      await api.deleteVisit(id)
      setVisits((prev) => prev.filter((v) => v._id !== id))
    } catch (err) {
      console.error("Failed to delete visit:", err)
    }
  }

  // Add new visit
 // inside VisitsPage component
const handleVisitAdded = useCallback(async (newVisit: Visit) => {
  try {
    const saved = await api.addVisit(newVisit); // ✅ backend validated data
    setVisits((prev) => [saved, ...prev]);
    setShowAddDialog(false);
  } catch (error) {
    console.error("Failed to persist new visit:", error);
  }
}, []);


  const handleVisitUpdated = async (updated: Visit) => {
    // Recalculate total fee if needed
    updated.totalFee =
      (updated.consultationFee || 0) +
      (updated.procedureFee || 0) +
      (updated.medicineFee || 0)

    try {
      await api.updateVisit(updated._id, updated)
      setVisits((prev) => prev.map((v) => (v._id === updated._id ? updated : v)))
    } catch (err) {
      console.error("Failed to update visit:", err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Visit Management</h1>
        <Button onClick={() => setShowAddDialog(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Add New Visit
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-800">Today's Visits</CardTitle>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-gray-900">{todayVisits}</div>
            <p className="text-sm text-muted-foreground">Patients seen today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-800">Total Visits</CardTitle>
              <Stethoscope className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-gray-900">{visits.length}</div>
            <p className="text-sm text-muted-foreground">All time visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-800">Avg. Visit Value</CardTitle>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-gray-900">
              ₨ {visits.length > 0 ? Math.round(visits.reduce((sum, v) => sum + (v.totalFee || 0), 0) / visits.length).toLocaleString() : 0}
            </div>
            <p className="text-sm text-muted-foreground">Average per visit</p>
          </CardContent>
        </Card>
      </div>

      {/* Visit Table */}
      <Card>
        <CardHeader>
          <CardTitle>Visit Records</CardTitle>
          <CardDescription>Track all patient visits and treatments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4 space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient name, MR No, or diagnosis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-gray-500 text-sm">Loading visits...</p>
          ) : error ? (
            <p className="text-red-600 text-sm">{error}</p>
          ) : filteredVisits.length === 0 ? (
            <p className="text-gray-500 text-sm">No visits found.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>MR No.</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Symptoms</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Procedures</TableHead>
                    <TableHead>Total Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVisits.map((visit) => (
                    <TableRow key={visit._id}>
                      <TableCell>{visit.visitDate}</TableCell>
                      <TableCell>{visit.visitTime}</TableCell>
                      <TableCell>{visit.mrNo}</TableCell>
                      <TableCell>{visit.patientName}</TableCell>
                      <TableCell className="max-w-xs truncate">{visit.symptoms}</TableCell>
                      <TableCell>{visit.diagnosis}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(visit.procedures || []).map((proc, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {proc}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>₨ {(visit.totalFee || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={visit.paymentStatus === "Paid" ? "default" : "destructive"}
                          className={visit.paymentStatus === "Paid" ? "bg-green-100 text-green-800" : ""}
                        >
                          {visit.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ActionMenu
                          onView={() => { setSelectedVisit(visit); setShowViewDialog(true) }}
                          onEdit={() => { setSelectedVisit(visit); setShowEditDialog(true) }}
                          onDelete={() => handleDeleteVisit(visit._id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddVisitDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onVisitAdded={handleVisitAdded}
      />
      <ViewVisitDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        visits={selectedVisit ? [selectedVisit] : []}
        patientName={selectedVisit?.patientName || ""}
      />
      <EditVisitDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        visit={selectedVisit}
        onVisitUpdated={handleVisitUpdated}
      />
    </div>
  )
}
