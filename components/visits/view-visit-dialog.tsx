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
  Clock,
  Stethoscope,
  Pill,
  CreditCard,
} from "lucide-react"

interface ViewVisitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  visits: any[]
  patientName: string
}

export function ViewVisitDialog({
  open,
  onOpenChange,
  visits,
  patientName,
}: ViewVisitDialogProps) {
  if (!visits || visits.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-green-700 flex items-center">
            <Stethoscope className="mr-3 h-6 w-6" />
            Visit History - {patientName || "Patient"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            All visit records with medical and billing details
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(90vh-120px)] overflow-y-auto pr-2 space-y-10">
          {visits.map((visit, idx) => (
            <div
              key={idx}
              className="bg-gray-50 rounded-lg border shadow-sm p-4 space-y-6"
            >
              {/* Header */}
              <div className="text-sm text-gray-500">
                Visit #{idx + 1} — {visit.visitDate || "Unknown"} at {visit.visitTime || "N/A"}
              </div>

              {/* Visit Info */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="bg-green-50 px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold text-green-800 flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Visit Information
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">MR Number</p>
                    <p className="text-lg font-semibold text-gray-900">{visit.mrNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Visit Date</p>
                    <p className="text-lg text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-green-600" />
                      {visit.visitDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Visit Time</p>
                    <p className="text-lg text-gray-900 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-green-600" />
                      {visit.visitTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Medical Info */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="bg-blue-50 px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                    <Stethoscope className="mr-2 h-5 w-5" />
                    Medical Information
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-sm font-medium text-gray-500 mb-1">Symptoms</p>
                    <p className="text-gray-900">{visit.symptoms || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-sm font-medium text-gray-500 mb-1">Diagnosis</p>
                    <p className="text-gray-900">{visit.diagnosis || "N/A"}</p>
                  </div>
                  {visit.procedures?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Procedures</p>
                      <div className="flex flex-wrap gap-2">
                        {visit.procedures.map((proc: string, i: number) => (
                          <Badge key={i} className="bg-green-100 text-green-800">{proc}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Medicines */}
              {visit.medicines?.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="bg-orange-50 px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold text-orange-800 flex items-center">
                      <Pill className="mr-2 h-5 w-5" />
                      Prescribed Medicines
                    </h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {visit.medicines.map((med: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                        <div>
                          <p className="font-semibold text-gray-900">{med.name}</p>
                          <p className="text-sm text-gray-600">Dosage: {med.dosage} • Qty: {med.quantity}</p>
                        </div>
                        <p className="font-semibold text-green-600">₨ {med.cost}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Info */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="bg-green-50 px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold text-green-800 flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Payment Summary
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-700">Consultation Fee:</span>
                    <span className="font-medium">₨ {visit.consultationFee?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-700">Procedure Fee:</span>
                    <span className="font-medium">₨ {visit.procedureFee?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-700">Medicine Fee:</span>
                    <span className="font-medium">₨ {visit.medicineFee?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-100 rounded-md border border-green-200">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-xl font-bold text-green-700">
                      ₨ {visit.totalFee?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Payment Status:</span>
                    <Badge
                      variant={visit.paymentStatus === "Paid" ? "default" : "destructive"}
                      className={
                        visit.paymentStatus === "Paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {visit.paymentStatus || "Unpaid"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
