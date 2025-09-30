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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMedicines } from "@/components/medicines/medicine-context"
import { updateVisit } from "@/lib/api"

interface EditVisitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  visit: any
  onVisitUpdated: (visit: any) => void
}

const procedures = ["USG", "SVD", "BP Check", "UPT", "HB", "MBA", "Diabetes", "Injections", "Others"]
type MedicineField = "name" | "dosage" | "quantity" | "cost"

export function EditVisitDialog({ open, onOpenChange, visit, onVisitUpdated }: EditVisitDialogProps) {
  const [formData, setFormData] = useState({
    symptoms: "",
    diagnosis: "",
    selectedProcedures: [] as string[],
    consultationFee: "0",
    procedureFee: "0",
    medicineFee: "0",
    paymentStatus: "Unpaid",
    prescribedMedicines: [] as { name: string; dosage: string; quantity: string; cost: string }[],
  })

  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { medicines: availableMedicines } = useMedicines()

  useEffect(() => {
    if (visit) {
      setFormData({
        symptoms: visit.symptoms || "",
        diagnosis: visit.diagnosis || "",
        selectedProcedures: visit.procedures || [],
        consultationFee: visit.consultationFee?.toString() || "0",
        procedureFee: visit.procedureFee?.toString() || "0",
        medicineFee: visit.medicineFee?.toString() || "0",
        paymentStatus: visit.paymentStatus || "Unpaid",
        prescribedMedicines: (visit.medicines || []).map((m: any) => ({
          name: m.name || "",
          dosage: m.dosage || "",
          quantity: m.quantity?.toString() || "",
          cost: m.cost?.toString() || "",
        })),
      })
    }
  }, [visit])

  const handleProcedureChange = (procedure: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      selectedProcedures: checked
        ? [...prev.selectedProcedures, procedure]
        : prev.selectedProcedures.filter((p) => p !== procedure),
    }))
  }

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
      updated[index] = { ...updated[index], [field]: value }
    }
    setFormData((prev) => ({ ...prev, prescribedMedicines: updated }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!visit?._id) return
    setLoading(true)

    try {
      const medicinesPayload = formData.prescribedMedicines.map((m) => ({
        name: m.name,
        dosage: m.dosage,
        quantity: Number(m.quantity) || 0,
        cost: Number(m.cost) || 0,
      }))

      const updatedVisit = {
        symptoms: formData.symptoms,
        diagnosis: formData.diagnosis,
        procedures: formData.selectedProcedures,
        consultationFee: Number(formData.consultationFee),
        procedureFee: Number(formData.procedureFee),
        paymentStatus: formData.paymentStatus,
        medicines: medicinesPayload,
      }

      const res = await updateVisit(visit._id, updatedVisit)

      toast({
        title: "Visit Updated",
        description: `Visit for ${visit.patientName} has been updated successfully.`,
      })

      onVisitUpdated(res)
      onOpenChange(false)
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!visit) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Visit - {visit.patientName}</DialogTitle>
          <DialogDescription>
            Update symptoms, diagnosis, procedures, medicines, and fees
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Patient Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>MR No.</Label>
              <Input value={visit.mrNo} disabled />
            </div>
            <div>
              <Label>Patient Name</Label>
              <Input value={visit.patientName} disabled />
            </div>
          </div>

          {/* Medical Info */}
          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptoms</Label>
            <Textarea
              id="symptoms"
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              required
            />
          </div>

          {/* Procedures */}
          <div className="space-y-2">
            <Label>Procedures</Label>
            <div className="grid grid-cols-3 gap-2">
              {procedures.map((procedure) => (
                <div key={procedure} className="flex items-center space-x-2">
                  <Checkbox
                    id={procedure}
                    checked={formData.selectedProcedures.includes(procedure)}
                    onCheckedChange={(checked) =>
                      handleProcedureChange(procedure, checked as boolean)
                    }
                  />
                  <Label htmlFor={procedure}>{procedure}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Medicines */}
          <div className="space-y-4">
            <Label>Prescribed Medicines</Label>
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
                        disabled={Number(m.stock) <= 0} // ✅ Disabled if stock <= 0
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
                  type="number"
                  value={med.quantity}
                  onChange={(e) => handleMedicineChange(index, "quantity", e.target.value)}
                />
                <Input
                  placeholder="Cost"
                  type="number"
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
              className="mt-2"
            >
              + Add Medicine
            </Button>
          </div>

          {/* Fees */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Consultation Fee</Label>
              <Input
                type="number"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
              />
            </div>
            <div>
              <Label>Procedure Fee</Label>
              <Input
                type="number"
                value={formData.procedureFee}
                onChange={(e) => setFormData({ ...formData, procedureFee: e.target.value })}
              />
            </div>
            <div>
              <Label>Total (Auto)</Label>
              <Input
                disabled
                value={
                  Number(formData.consultationFee || 0) +
                  Number(formData.procedureFee || 0) +
                  formData.prescribedMedicines.reduce(
                    (s, m) => s + (Number(m.cost) || 0) * (Number(m.quantity) || 0),
                    0
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment Status</Label>
            <Select
              value={formData.paymentStatus}
              onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? "Updating..." : "Update Visit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
