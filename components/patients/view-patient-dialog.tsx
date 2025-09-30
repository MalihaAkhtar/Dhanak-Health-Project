"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Phone,
  MapPin,
  User,
  CreditCard,
  Stethoscope,
  Pill,
} from "lucide-react"

interface ViewPatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: any
  visits: any[]
}

export function ViewPatientDialog({
  open,
  onOpenChange,
  patient,
  visits,
}: ViewPatientDialogProps) {
  if (!patient) return null

  // Debug logs
  console.log("VIEW PATIENT:", patient)
  console.log("ALL VISITS:", visits)

  // Filter visits for the current patient (by patientId or MR No)
  const patientVisits = Array.isArray(visits)
    ? visits.filter(
        (v) =>
          (v.patientId && v.patientId.toString() === patient._id?.toString()) ||
          (v.mrNo && v.mrNo === patient.mrNo)
      )
    : []

  console.log("FILTERED VISITS:", patientVisits)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-green-700 flex items-center">
            <User className="mr-3 h-6 w-6" />
            Patient Profile - {patient.name}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Complete patient information and medical history
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-4 bg-gray-50 rounded-md">
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="bg-green-50 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-green-800 flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Patient Information
                </h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">MR Number</p>
                  <p className="text-lg font-semibold text-gray-900">{patient.mrNo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-lg font-semibold text-gray-900">{patient.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Age</p>
                  <p className="text-lg font-medium text-gray-900">{patient.age} years</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-lg font-medium text-gray-900">{patient.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Registration Date</p>
                  <p className="text-lg font-medium text-gray-900">{patient.visitDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-lg font-medium text-gray-900">{patient.phone}</p>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-lg font-medium text-gray-900">{patient.address}</p>
                </div>
              </div>
            </div>

            {/* Visit History */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Visit History & Medical Records
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {patientVisits.length === 0 ? (
                  <p className="text-gray-500 italic">No visits recorded.</p>
                ) : (
                  patientVisits.map((visit, index) => (
                    <div
                      key={visit._id || index}
                      className="border rounded-lg p-4 bg-gray-50 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3 text-sm text-gray-700">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>
                            {visit.visitDate} at {visit.visitTime}
                          </span>
                        </div>
                        <Badge
                          variant={
                            visit.paymentStatus === "Paid" ? "default" : "destructive"
                          }
                          className={
                            visit.paymentStatus === "Paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {visit.paymentStatus}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Symptoms</p>
                          <p className="text-sm text-gray-900">{visit.symptoms || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Diagnosis</p>
                          <p className="text-sm text-gray-900">{visit.diagnosis || "-"}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Procedures</p>
                        <div className="flex flex-wrap gap-2">
                          {visit.procedures?.length ? (
                            visit.procedures.map((p: string, i: number) => (
                              <Badge key={i} className="bg-blue-100 text-blue-800">
                                {p}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-gray-500 italic">None</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Medicines</p>
                        {visit.medicines?.length ? (
                          <div className="space-y-1">
                            {visit.medicines.map((m: any, i: number) => (
                              <div
                                key={i}
                                className="text-sm text-gray-800 flex flex-col md:flex-row justify-between border rounded p-2 bg-white"
                              >
                                <span>
                                  <Pill className="inline h-4 w-4 mr-1" /> {m.name}
                                </span>
                                <span>
                                  Dosage: {m.dosage}, Qty: {m.quantity}, Cost: ₨ {m.cost}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            No medicines prescribed
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between pt-3 border-t">
                        <div className="flex items-center text-green-600">
                          <CreditCard className="mr-2 h-4 w-4" />
                          <span className="font-semibold">Total Fee</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          ₨ {visit.totalFee?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
