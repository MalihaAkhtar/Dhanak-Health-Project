"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
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
import { Plus, Search } from "lucide-react"

import { AddPatientDialog } from "@/components/patients/add-patient-dialog"
import { ViewPatientDialog } from "@/components/patients/view-patient-dialog"
import { EditPatientDialog } from "@/components/patients/edit-patient-dialog"
import { ActionMenu } from "@/components/shared/action-menu"

import {
  addPatient,
  addVisit,
  addPayment,
  deletePatient,
  fetchPatients,
  fetchVisits,
} from "@/lib/api"

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [visits, setVisits] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const loadData = async () => {
    try {
      const [patientsData, visitsData] = await Promise.all([fetchPatients(), fetchVisits()])
      setPatients(patientsData || [])
      setVisits(visitsData || [])
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load patient data")
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredPatients = patients.filter((p) =>
    [p.name, p.mrNo, p.phone].some((field) =>
      field?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const handleDeletePatient = async (id: string) => {
    try {
      await deletePatient(id)
      toast.success("Patient moved to trash")
      loadData()
    } catch (err) {
      toast.error("Failed to delete patient")
      console.error(err)
    }
  }

  const handlePatientAdded = async (patient: any) => {
    try {
      const created = await addPatient(patient)
      const today = new Date().toISOString().split("T")[0]
      const time = new Date().toLocaleTimeString()

      const total =
        (patient.consultationFee || 0) +
        (patient.procedureFee || 0) +
        (patient.medicineFee || 0)

      setPatients((prev) => [
        ...prev,
        { ...created, visitDate: today, totalFees: total },
      ])

      await addVisit({
        visitDate: today,
        visitTime: time,
        mrNo: patient.mrNo,
        patientName: patient.name,
        symptoms: patient.symptoms,
        diagnosis: patient.diagnosis,
        procedures: patient.procedures || [],
        totalFee: total,
        paymentStatus: patient.paymentStatus,
        medicines: patient.medicines || [],
      })

      await addPayment({
        mrNo: patient.mrNo,
        patientName: patient.name,
        visitDate: today,
        consultationFee: patient.consultationFee || 0,
        procedureFee: patient.procedureFee || 0,
        medicineFee: patient.medicineFee || 0,
        totalFee: total,
        status: patient.paymentStatus,
      })

      toast.success("Patient added successfully")
    } catch (err) {
      console.error("Error adding patient:", err)
      toast.error("Failed to add patient")
    }
  }

  const handlePatientUpdated = (updated: any) => {
    setPatients((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p))
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Patient
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Overview</CardTitle>
          <CardDescription>Manage all patient records and visits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, MR No, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SR No.</TableHead>
                  <TableHead>MR No.</TableHead>
                  <TableHead>Visit Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Total Fees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((p, i) => (
                  <TableRow key={p._id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{p.mrNo}</TableCell>
                    <TableCell>{p.visitDate}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.phone}</TableCell>
                    <TableCell>{p.address}</TableCell>
                    <TableCell>{p.age}</TableCell>
                    <TableCell>{p.gender}</TableCell>
                    <TableCell>₨ {p.totalFees?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={p.paymentStatus === "Paid" ? "default" : "destructive"}
                        className={p.paymentStatus === "Paid" ? "bg-green-100 text-green-800" : ""}
                      >
                        {p.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ActionMenu
                        onView={() => {
                          setSelectedPatient(p)
                          setShowViewDialog(true)
                        }}
                        onEdit={() => {
                          setSelectedPatient(p)
                          setShowEditDialog(true)
                        }}
                        onDelete={() => handleDeletePatient(p._id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddPatientDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onPatientAdded={handlePatientAdded}
      />
      <ViewPatientDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        patient={selectedPatient}
        visits={visits}
      />
      <EditPatientDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        patient={selectedPatient}
        visits={visits}
        onPatientUpdated={handlePatientUpdated}
      />
    </div>
  )
}
