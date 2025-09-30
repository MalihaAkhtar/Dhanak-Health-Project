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
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, Stethoscope, CreditCard } from "lucide-react"
import { useMedicines } from "@/components/medicines/medicine-context"

interface AddPatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPatientAdded: (patient: any, visit?: any) => void
}

export function AddPatientDialog({ open, onOpenChange, onPatientAdded }: AddPatientDialogProps) {
  const { toast } = useToast()
  const { medicines, updateMedicineStock } = useMedicines()

  const [medicineOptions, setMedicineOptions] = useState<
    { name: string; stock: number; lowStockThreshold: number }[]
  >([])
  const [customProcedure, setCustomProcedure] = useState<string>("")
  const procedures = ["USG", "SVD", "BP Check", "UPT", "HB", "MBA", "Diabetes", "Injections", "Others"]

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    selectedProcedures: [] as string[],
    consultationFee: "",
    procedureFee: "0",
    medicineFee: "0",
    symptoms: "",
    diagnosis: "",
    paymentStatus: "Unpaid",
    medicines: [] as { name: string; dosage: string; quantity: string; cost: string }[],
  })

  useEffect(() => {
    setMedicineOptions(
      medicines.map((m) => ({
        name: m.name,
        stock: m.stock,
        lowStockThreshold: m.lowStockThreshold ?? 5,
      }))
    )
  }, [medicines])

  const handleProcedureChange = (procedure: string, checked: boolean) => {
    if (procedure === "Others" && !checked) setCustomProcedure("")
    setFormData((prev) => ({
      ...prev,
      selectedProcedures: checked
        ? [...prev.selectedProcedures, procedure]
        : prev.selectedProcedures.filter((p) => p !== procedure),
    }))
  }

  const handleMedicineDetailChange = (
    index: number,
    field: keyof (typeof formData.medicines)[0],
    value: string
  ) => {
    const updated = [...formData.medicines]
    updated[index][field] = value
    setFormData((prev) => ({ ...prev, medicines: updated }))
  }

  const generateMRNo = () => `MR${String(Date.now()).slice(-6)}`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const allProcedures = [...formData.selectedProcedures]
    if (allProcedures.includes("Others") && customProcedure.trim() !== "")
      allProcedures[allProcedures.indexOf("Others")] = customProcedure.trim()

    const calculatedMedicineFee = formData.medicines.reduce((sum, med) => {
      const qty = parseInt(med.quantity || "0")
      const cost = parseFloat(med.cost || "0")
      return sum + qty * cost
    }, 0)

    const totalFees =
      Number(formData.consultationFee || 0) +
      Number(formData.procedureFee || 0) +
      calculatedMedicineFee

    const mrNo = generateMRNo()
    const visitDate = new Date().toISOString().split("T")[0]

    const newPatient = {
      ...formData,
      mrNo,
      age: Number(formData.age),
      visitDate,
      procedures: allProcedures,
      consultationFee: Number(formData.consultationFee),
      procedureFee: Number(formData.procedureFee),
      medicineFee: calculatedMedicineFee,
      totalFees,
    }

    const newVisit = {
      id: Date.now() + 1,
      mrNo,
      patientName: newPatient.name,
      visitDate,
      visitTime: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
      symptoms: formData.symptoms,
      diagnosis: formData.diagnosis,
      procedures: allProcedures,
      medicines: formData.medicines,
      consultationFee: newPatient.consultationFee,
      procedureFee: newPatient.procedureFee,
      medicineFee: newPatient.medicineFee,
      totalFee: newPatient.totalFees,
      paymentStatus: newPatient.paymentStatus,
    }

    for (const med of formData.medicines) {
      const qty = parseInt(med.quantity || "0")
      if (!med.name || qty <= 0) continue

      await updateMedicineStock(med.name, qty)

      const medicine = medicines.find((m) => m.name.toLowerCase() === med.name.toLowerCase())
      if (medicine && medicine.stock - qty <= medicine.lowStockThreshold) {
        toast({
          title: `⚠️ Low Stock`,
          description: `"${medicine.name}" stock is low (${medicine.stock - qty} left).`,
          variant: "destructive",
        })
      }
    }

    onPatientAdded(newPatient, newVisit)

    toast({ title: "✅ Patient Added", description: `${formData.name} has been added successfully.` })

    // Reset form
    setFormData({
      name: "",
      age: "",
      gender: "",
      phone: "",
      address: "",
      selectedProcedures: [],
      consultationFee: "",
      procedureFee: "0",
      medicineFee: "0",
      symptoms: "",
      diagnosis: "",
      paymentStatus: "Unpaid",
      medicines: [],
    })
    setCustomProcedure("")
    onOpenChange(false)
  }

  const totalFees =
    Number(formData.consultationFee || 0) +
    Number(formData.procedureFee || 0) +
    formData.medicines.reduce((sum, med) => sum + (parseInt(med.quantity || "0") * parseFloat(med.cost || "0")), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-green-700">Add New Patient</DialogTitle>
          <DialogDescription>Enter patient details, visit, and billing info.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(95vh-130px)] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Patient Info */}
            <Section title="Patient Information" icon={<Users className="mr-2 h-5 w-5 text-green-600" />}>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Full Name" placeholder="Enter full name" value={formData.name} onChange={(v:string) => setFormData({ ...formData, name: v })} required />
                <InputField label="Age" type="number" placeholder="Enter age" value={formData.age} onChange={(v:string) => setFormData({ ...formData, age: v })} required />
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <InputField label="Phone" placeholder="Enter phone number" value={formData.phone} onChange={(v:string) => setFormData({ ...formData, phone: v })} required />
              </div>
              <TextareaField label="Address" placeholder="Enter full address" value={formData.address} onChange={(v:string) => setFormData({ ...formData, address: v })} required />
            </Section>

            {/* Procedures */}
            <Section title="Procedures & Services">
              <div className="grid grid-cols-3 gap-2">
                {procedures.map((p) => (
                  <CheckboxRow key={p} label={p} checked={formData.selectedProcedures.includes(p)} onChange={(c: boolean) => handleProcedureChange(p, c)} />
                ))}
              </div>
              {formData.selectedProcedures.includes("Others") && (
                <InputField label="Other Procedure" placeholder="Specify other procedure" value={customProcedure} onChange={setCustomProcedure} />
              )}
            </Section>

            {/* Medicines */}
            <Section title="Prescribed Medicines">
              {formData.medicines.map((med, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2 mb-2">
                  <Select value={med.name} onValueChange={(val) => handleMedicineDetailChange(idx, "name", val)}>
                    <SelectTrigger><SelectValue placeholder="Select medicine" /></SelectTrigger>
                    <SelectContent>
                      {medicineOptions.map((m) => (
                        <SelectItem key={m.name} value={m.name} disabled={m.stock === 0}>
                          {m.name} {m.stock === 0 ? "(Out of Stock)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Dosage" value={med.dosage} onChange={(e) => handleMedicineDetailChange(idx, "dosage", e.target.value)} />
                  <Input placeholder="Quantity" value={med.quantity} onChange={(e) => handleMedicineDetailChange(idx, "quantity", e.target.value)} />
                  <Input placeholder="Cost (₨)" value={med.cost} onChange={(e) => handleMedicineDetailChange(idx, "cost", e.target.value)} />
                </div>
              ))}
              <Button
                type="button"
                onClick={() => setFormData((prev) => ({
                  ...prev,
                  medicines: [...prev.medicines, { name: "", dosage: "", quantity: "", cost: "" }]
                }))}
                disabled={medicineOptions.every((m) => m.stock === 0)}
              >
                Add Medicine
              </Button>
            </Section>

            {/* Fees */}
            <Section title="Fee Structure" icon={<CreditCard className="mr-2 h-5 w-5 text-green-600" />}>
              <div className="grid grid-cols-3 gap-4">
                <InputField label="Consultation Fee" type="number" placeholder="Consultation charges" value={formData.consultationFee} onChange={(v:string) => setFormData({ ...formData, consultationFee: v })} />
                <InputField label="Procedure Fee" type="number" placeholder="Procedure charges" value={formData.procedureFee} onChange={(v:string) => setFormData({ ...formData, procedureFee: v })} />
                <InputField label="Medicine Fee" type="number" placeholder="Automatically calculated" value={formData.medicineFee} readOnly />
              </div>
              <div className="mt-4 font-bold text-green-700">Total Fee: ₨ {totalFees.toLocaleString()}</div>
            </Section>

            {/* Payment Status */}
            <Section title="Payment Status">
              <Select value={formData.paymentStatus} onValueChange={(v) => setFormData({ ...formData, paymentStatus: v })}>
                <SelectTrigger><SelectValue placeholder="Select payment status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </Section>

            <DialogFooter>
              <Button type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Add Patient</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* Helper Components */
function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
      <h3 className="text-lg font-semibold mb-4 flex items-center">{icon} {title}</h3>
      {children}
    </div>
  )
}

function InputField({ label, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function TextareaField({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function CheckboxRow({ label, checked, onChange }: any) {
  return (
    <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-600 p-2 rounded">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <Label>{label}</Label>
    </div>
  )
}
