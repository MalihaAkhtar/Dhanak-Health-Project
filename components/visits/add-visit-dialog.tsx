"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useMedicines } from "@/components/medicines/medicine-context"
import { User, Stethoscope, Activity, CreditCard } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import * as api from "@/lib/api"

interface AddVisitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVisitAdded: (visit: any) => void
}

const procedures = [
  "USG",
  "SVD",
  "BP Check",
  "UPT",
  "HB",
  "MBA",
  "Diabetes",
  "Injections",
  "Others",
]

const AddVisitDialog = ({ open, onOpenChange, onVisitAdded }: AddVisitDialogProps) => {
  const [formData, setFormData] = useState({
    mrNo: "",
    patientName: "",
    symptoms: "",
    diagnosis: "",
    selectedProcedures: [] as string[],
    otherProcedure: "",
    consultationFee: "1000",
    procedureFee: "0",
    prescribedMedicines: [] as {
      name: string
      dosage: string
      quantity: string
      cost: string
    }[],
    paymentStatus: "Unpaid",
  })

  const [patients, setPatients] = useState<any[]>([])
  const { toast } = useToast()
  const { medicines: availableMedicines, updateMedicineStock } = useMedicines()

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await api.fetchPatients()
        setPatients(data)
      } catch (error) {
        console.error("Failed to load patients", error)
      }
    }
    fetchPatients()
  }, [open])

  const handleProcedureChange = (procedure: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      selectedProcedures: checked
        ? [...prev.selectedProcedures, procedure]
        : prev.selectedProcedures.filter((p) => p !== procedure),
    }))
  }

  const handleMRNoChange = (mrNo: string) => {
    const patient = patients.find((p) => p.mrNo === mrNo)
    if (patient) {
      setFormData((prev) => ({
        ...prev,
        mrNo,
        patientName: patient.name || "",
        consultationFee: patient.amount?.toString() || "1000",
      }))
    } else {
      setFormData((prev) => ({ ...prev, mrNo }))
    }
  }

  type MedicineField = "name" | "dosage" | "quantity" | "cost"

  const handleMedicineChange = (index: number, field: MedicineField, value: string) => {
    const updated = [...formData.prescribedMedicines]
    if (field === "name") {
      const selected = availableMedicines.find((m) => m.name === value)
      updated[index] = {
        ...updated[index],
        name: value,
        dosage: selected?.dosage || "",
        cost: selected?.cost?.toString() || "",
      }
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value,
      }
    }
    setFormData((prev) => ({ ...prev, prescribedMedicines: updated }))
  }

  const calculateMedicineFee = () => {
    return formData.prescribedMedicines.reduce(
      (sum, med) => sum + Number(med.cost || 0) * Number(med.quantity || 0),
      0
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const finalProcedures = [...formData.selectedProcedures]
    if (formData.selectedProcedures.includes("Others") && formData.otherProcedure.trim() !== "") {
      finalProcedures.push(formData.otherProcedure)
    }

    const medicineFee = calculateMedicineFee()
    const totalFee =
      Number(formData.consultationFee) +
      Number(formData.procedureFee) +
      medicineFee

    const newVisit = {
      ...formData,
      visitDate: new Date().toISOString().split("T")[0],
      visitTime: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      procedures: finalProcedures,
      consultationFee: Number(formData.consultationFee),
      procedureFee: Number(formData.procedureFee),
      medicineFee,
      totalFee,
      medicines: formData.prescribedMedicines.map((m) => ({
        name: m.name,
        dosage: m.dosage,
        quantity: Number(m.quantity),
        cost: Number(m.cost),
      })),
      paymentStatus: formData.paymentStatus,
    }

    try {
      const savedVisit = await api.addVisit(newVisit)

      // Update medicine stock
      if (formData.prescribedMedicines.length > 0) {
        formData.prescribedMedicines.forEach((medicine) => {
          updateMedicineStock(medicine.name, Number(medicine.quantity))
        })
      }

      // Update UI instantly
      onVisitAdded(savedVisit)

      toast({
        title: "Visit Added",
        description: `Visit for ${formData.patientName} has been recorded.`,
      })

      // Reset form
      setFormData({
        mrNo: "",
        patientName: "",
        symptoms: "",
        diagnosis: "",
        selectedProcedures: [],
        otherProcedure: "",
        consultationFee: "1000",
        procedureFee: "0",
        prescribedMedicines: [],
        paymentStatus: "Unpaid",
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error saving visit:", error)
      toast({
        variant: "destructive",
        title: "Failed to add visit",
        description: "Please try again.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-green-700">Add New Visit</DialogTitle>
          <DialogDescription>Record a new patient visit with procedures and fees.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-4 bg-gray-50 rounded-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Info */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="mr-2 h-5 w-5 text-green-600" />
                Patient Identification
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mrNo">MR Number *</Label>
                  <Select value={formData.mrNo} onValueChange={handleMRNoChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select MR No" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.mrNo} value={p.mrNo}>
                          {p.mrNo} - {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientName">Patient Name *</Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    placeholder="Enter patient's full name"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Medical Info */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Stethoscope className="mr-2 h-5 w-5 text-green-600" />
                Medical Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symptoms">Symptoms</Label>
                  <Textarea
                    id="symptoms"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    placeholder="Enter patient's symptoms"
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Textarea
                    id="diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    placeholder="Enter diagnosis"
                    rows={4}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Procedures */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="mr-2 h-5 w-5 text-green-600" />
                Procedures Performed
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {procedures.map((procedure) => (
                  <div key={procedure} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <Checkbox
                      id={procedure}
                      checked={formData.selectedProcedures.includes(procedure)}
                      onCheckedChange={(checked) => handleProcedureChange(procedure, checked as boolean)}
                    />
                    <Label htmlFor={procedure}>{procedure}</Label>
                  </div>
                ))}
              </div>
              {formData.selectedProcedures.includes("Others") && (
                <div className="mt-3">
                  <Input
                    placeholder="Enter other procedure"
                    value={formData.otherProcedure}
                    onChange={(e) => setFormData({ ...formData, otherProcedure: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* Medicines */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prescribed Medicines</h3>
              <div className="space-y-2">
                {formData.prescribedMedicines.map((med, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2">
                    <Select
                      value={med.name}
                      onValueChange={(value) => handleMedicineChange(index, "name", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Medicine" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMedicines.map((m) => (
                          <SelectItem
                            key={m._id}
                            value={m.name}
                            disabled={Number(m.stock) <= 0} // disable out of stock
                          >
                            {m.name} ({m.stock} left)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Dosage"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                    />
                    <Input
                      placeholder="Quantity"
                      value={med.quantity}
                      onChange={(e) => handleMedicineChange(index, "quantity", e.target.value)}
                    />
                    <Input
                      placeholder="Cost"
                      value={med.cost}
                      onChange={(e) => handleMedicineChange(index, "cost", e.target.value)}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      prescribedMedicines: [
                        ...prev.prescribedMedicines,
                        { name: "", dosage: "", quantity: "", cost: "" },
                      ],
                    }))
                  }
                >
                  + Add Medicine
                </Button>
              </div>
            </div>

            {/* Fees */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-green-600" />
                Fee Structure
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  type="number"
                  value={formData.consultationFee}
                  onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                  placeholder="Consultation Fee"
                  required
                />
                <Input
                  type="number"
                  value={formData.procedureFee}
                  onChange={(e) => setFormData({ ...formData, procedureFee: e.target.value })}
                  placeholder="Procedure Fee"
                  required
                />
                <Input
                  type="number"
                  value={calculateMedicineFee()}
                  readOnly
                  placeholder="Medicine Fee"
                  className="bg-gray-100"
                />
              </div>
              <div className="mt-4 text-lg font-bold text-green-700">
                Total Fee: ₨{" "}
                {(
                  Number(formData.consultationFee) +
                  Number(formData.procedureFee) +
                  calculateMedicineFee()
                ).toLocaleString()}
              </div>
              <div className="mt-4">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Add Visit
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddVisitDialog
