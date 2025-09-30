"use client"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useMedicines } from "@/components/medicines/medicine-context"
import { updateVisit, updatePatient, markPaymentAndVisitsAsPaid, updateMedicineStock } from "@/lib/api"

interface Medicine {
  name: string
  dosage: string
  quantity: string
  cost: string
  _id?: string // optional
}

interface VisitData {
  id: string
  symptoms: string
  diagnosis: string
  selectedProcedures: string[]
  consultationFee: string
  procedureFee: string
  medicineFee: string
  paymentStatus: string
  medicines: Medicine[]
}

interface PatientData {
  name: string
  age: string
  gender: string
  phone: string
  address: string
  paymentStatus: string
}

interface EditPatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: any
  visits: any[]
  onPatientUpdated: (updated: any) => void
}

export function EditPatientDialog({
  open,
  onOpenChange,
  patient,
  visits,
  onPatientUpdated,
}: EditPatientDialogProps) {
  const { toast } = useToast()
  const { medicines } = useMedicines()
  const procedureList = ["USG", "SVD", "BP Check", "UPT", "HB", "MBA", "Diabetes", "Injections", "Others"]

  const [customProcedure, setCustomProcedure] = useState<string>("")
  const [patientData, setPatientData] = useState<PatientData>({
    name: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    paymentStatus: "Unpaid",
  })

  const [visitData, setVisitData] = useState<VisitData>({
    id: "",
    symptoms: "",
    diagnosis: "",
    selectedProcedures: [],
    consultationFee: "1000",
    procedureFee: "0",
    medicineFee: "0",
    paymentStatus: "Unpaid",
    medicines: [],
  })

  const medicineOptions = medicines.map((m) => ({
    name: m.name,
    stock: m.stock,
    _id: m._id,
    lowStockThreshold: m.lowStockThreshold ?? 5,
  }))

  // Load patient + last visit details
  useEffect(() => {
    if (!patient || !visits) return

    setPatientData({
      name: patient.name || "",
      age: patient.age?.toString() || "",
      gender: patient.gender || "",
      phone: patient.phone || "",
      address: patient.address || "",
      paymentStatus: patient.paymentStatus || "Unpaid",
    })

    const patientVisits = visits.filter((v) => v.mrNo === patient.mrNo)
    if (patientVisits.length > 0) {
      const lastVisit = patientVisits[patientVisits.length - 1]
      const procedures = lastVisit.procedures || []
      const other = procedures.find((p: string) => !procedureList.includes(p)) || ""
      const selected = procedures.map((p: string) => (procedureList.includes(p) ? p : "Others"))

      setVisitData({
        id: lastVisit._id || "",
        symptoms: lastVisit.symptoms || "",
        diagnosis: lastVisit.diagnosis || "",
        selectedProcedures: selected,
        consultationFee: lastVisit.consultationFee?.toString() || "1000",
        procedureFee: lastVisit.procedureFee?.toString() || "0",
        medicineFee: lastVisit.medicineFee?.toString() || "0",
        paymentStatus: lastVisit.paymentStatus || "Unpaid",
        medicines: lastVisit.medicines || [],
      })

      setCustomProcedure(other)
    }
  }, [patient, visits])

  // Procedure checkbox handling
  const handleProcedureChange = (procedure: string, checked: boolean) => {
    if (procedure === "Others" && !checked) setCustomProcedure("")
    setVisitData((prev) => ({
      ...prev,
      selectedProcedures: checked
        ? [...prev.selectedProcedures, procedure]
        : prev.selectedProcedures.filter((p) => p !== procedure),
    }))
  }

  // Patient update
  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const updated = { ...patient, ...patientData, age: Number(patientData.age) }
      await updatePatient(patient._id, updated)
      onPatientUpdated(updated)
      toast({ title: "Patient Updated", description: "Patient info updated successfully" })
      onOpenChange(false)
    } catch {
      toast({ title: "Error", description: "Failed to update patient" })
    }
  }

  // Visit update with medicine stock handling
  const handleUpdateVisit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!visitData.id) return

    const allProcedures = [...visitData.selectedProcedures]
    if (allProcedures.includes("Others") && customProcedure.trim())
      allProcedures[allProcedures.indexOf("Others")] = customProcedure.trim()

    const updatedVisit = {
      mrNo: patient.mrNo,
      symptoms: visitData.symptoms,
      diagnosis: visitData.diagnosis,
      procedures: allProcedures,
      medicines: visitData.medicines,
      consultationFee: Number(visitData.consultationFee),
      procedureFee: Number(visitData.procedureFee),
      medicineFee: Number(visitData.medicineFee),
      paymentStatus: visitData.paymentStatus,
    }

    try {
      await updateVisit(visitData.id, updatedVisit)

      // Reduce medicine stock & show low-stock toast
      for (const med of visitData.medicines) {
        const qty = parseInt(med.quantity || "0")
        if (!med.name || qty <= 0) continue

        const medicine = medicines.find((m) => m.name === med.name)
        if (!medicine || !medicine._id) continue // <-- check for _id

        const newStock = medicine.stock - qty
        if (newStock <= medicine.lowStockThreshold) {
          toast({
            title: `⚠️ Low Stock`,
            description: `"${medicine.name}" stock is low (${newStock} left).`,
            variant: "destructive",
          })
        }

        // Update stock safely
        await updateMedicineStock(medicine._id, qty)
      }

      // If Paid, mark payment & visits
      if (visitData.paymentStatus === "Paid") {
        await markPaymentAndVisitsAsPaid(patient._id, patient.mrNo)
      }

      toast({ title: "Visit Updated", description: "Visit details updated successfully" })
      onOpenChange(false)
    } catch {
      toast({ title: "Error", description: "Failed to update visit" })
    }
  }

  const totalFees =
    Number(visitData.consultationFee) +
    Number(visitData.procedureFee) +
    Number(visitData.medicineFee)

  const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
    setVisitData((prev) => {
      const updated = [...prev.medicines]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, medicines: updated }
    })
  }

  const removeMedicine = (index: number) => {
    setVisitData((prev) => {
      const updated = [...prev.medicines]
      updated.splice(index, 1)
      return { ...prev, medicines: updated }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Patient - {patient?.name}</DialogTitle>
          <DialogDescription>Update patient info, visits, medicines, fees, and payment status</DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(95vh-130px)] overflow-y-auto p-4 bg-gray-50 rounded-md">
          <Tabs defaultValue="patient">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="patient">Patient Info</TabsTrigger>
              <TabsTrigger value="visit">Medical Info</TabsTrigger>
            </TabsList>

            {/* Patient Tab */}
            <TabsContent value="patient">
              <form onSubmit={handleUpdatePatient} className="space-y-4">
                {/* Full Name & Age */}
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Full Name" value={patientData.name} onChange={(v) => setPatientData({ ...patientData, name: v })} />
                  <InputField label="Age" type="number" value={patientData.age} onChange={(v) => setPatientData({ ...patientData, age: v })} />
                </div>

                {/* Gender & Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={patientData.gender} onValueChange={(v) => setPatientData({ ...patientData, gender: v })}>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <InputField label="Phone" value={patientData.phone} onChange={(v) => setPatientData({ ...patientData, phone: v })} />
                </div>

                <TextareaField label="Address" value={patientData.address} onChange={(v) => setPatientData({ ...patientData, address: v })} />

                {/* Payment Status */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Payment Status</Label>
                    <Select value={patientData.paymentStatus} onValueChange={(v) => setPatientData({ ...patientData, paymentStatus: v })}>
                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter><Button type="submit">Update Patient</Button></DialogFooter>
              </form>
            </TabsContent>

            {/* Visit Tab */}
            <TabsContent value="visit">
              <form onSubmit={handleUpdateVisit} className="space-y-4">
                <TextareaField label="Symptoms" value={visitData.symptoms} onChange={(v) => setVisitData({ ...visitData, symptoms: v })} />
                <TextareaField label="Diagnosis" value={visitData.diagnosis} onChange={(v) => setVisitData({ ...visitData, diagnosis: v })} />

                {/* Procedures */}
                <div className="grid grid-cols-3 gap-2">
                  {procedureList.map((p) => (
                    <CheckboxRow key={p} label={p} checked={visitData.selectedProcedures.includes(p)} onChange={(c) => handleProcedureChange(p, c === true)} />
                  ))}
                </div>
                {visitData.selectedProcedures.includes("Others") && (
                  <InputField label="Other Procedure" value={customProcedure} onChange={setCustomProcedure} />
                )}

                {/* Medicines */}
                <Section title="Prescribed Medicines">
                  {visitData.medicines.map((med, idx) => (
                    <div key={idx} className="grid grid-cols-5 gap-2 mb-2 items-center">
                      <Select value={med.name} onValueChange={(val) => handleMedicineChange(idx, "name", val)}>
                        <SelectTrigger><SelectValue placeholder="Select medicine" /></SelectTrigger>
                        <SelectContent>
                          {medicineOptions.map((m) => (
                            <SelectItem key={m._id} value={m.name} disabled={m.stock === 0}>
                              {m.name} {m.stock === 0 ? "(Out of Stock)" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input placeholder="Dosage" value={med.dosage} onChange={(e) => handleMedicineChange(idx, "dosage", e.target.value)} />
                      <Input placeholder="Quantity" value={med.quantity} onChange={(e) => handleMedicineChange(idx, "quantity", e.target.value)} />
                      <Input placeholder="Cost (₨)" value={med.cost} onChange={(e) => handleMedicineChange(idx, "cost", e.target.value)} />
                      <Button type="button" variant="destructive" onClick={() => removeMedicine(idx)}>Remove</Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() => setVisitData((prev) => ({
                      ...prev,
                      medicines: [...prev.medicines, { name: "", dosage: "", quantity: "", cost: "" }]
                    }))}
                    disabled={medicineOptions.every((m) => m.stock === 0)}
                  >
                    Add Medicine
                  </Button>
                </Section>

                {/* Fees */}
                <div className="grid grid-cols-3 gap-2">
                  <InputField label="Consultation Fee" type="number" value={visitData.consultationFee} onChange={(v) => setVisitData({ ...visitData, consultationFee: v })} />
                  <InputField label="Procedure Fee" type="number" value={visitData.procedureFee} onChange={(v) => setVisitData({ ...visitData, procedureFee: v })} />
                  <InputField label="Medicine Fee" type="number" value={visitData.medicineFee} onChange={(v) => setVisitData({ ...visitData, medicineFee: v })} />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <div className="space-y-2">
                    <Label>Payment Status</Label>
                    <Select value={visitData.paymentStatus} onValueChange={(v) => setVisitData({ ...visitData, paymentStatus: v })}>
                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-2 font-bold text-green-700">Total Fee: ₨ {totalFees.toLocaleString()}</div>

                <DialogFooter><Button type="submit">Update Visit</Button></DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// --- Reusable Fields ---
function InputField({ label, value, onChange, type = "text" }: { label:string, value:string, onChange:(v:string)=>void, type?:string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function TextareaField({ label, value, onChange }: { label:string, value:string, onChange:(v:string)=>void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function CheckboxRow({ label, checked, onChange }: { label:string, checked:boolean, onChange:(c:boolean | "indeterminate")=>void }) {
  return (
    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <Label>{label}</Label>
    </div>
  )
}

function Section({ children, title }: { children: React.ReactNode, title: string }) {
  return (
    <div className="my-2 p-2 border rounded bg-white">
      <h3 className="font-semibold mb-2">{title}</h3>
      {children}
    </div>
  )
}
