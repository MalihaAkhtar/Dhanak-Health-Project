"use client"

import React, { useState, useEffect } from "react"
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
import { useToast } from "@/hooks/use-toast"
import type { Medicine } from "@/components/medicines/medicine-context"

interface EditMedicineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicine: Medicine | null
  onMedicineUpdated: (medicine: Medicine) => void
}

export function EditMedicineDialog({
  open,
  onOpenChange,
  medicine,
  onMedicineUpdated,
}: EditMedicineDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    dosage: "",
    cost: "",
    stock: "",
    lowStockThreshold: "",
  })
  const { toast } = useToast()

  useEffect(() => {
  if (medicine) {
    setFormData({
      name: medicine.name || "",
      type: medicine.type || "",
      dosage: medicine.dosage || "", // ✅ FIXED
      cost: medicine.cost?.toString() || "",
      stock: medicine.stock?.toString() || "",
      lowStockThreshold: medicine.lowStockThreshold?.toString() || "",
    })
  }
}, [medicine])


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!medicine) return

    const updatedMedicine: Medicine = {
      ...medicine,
      name: formData.name,
      type: formData.type,
      dosage: formData.dosage,
      cost: parseFloat(formData.cost),
      stock: parseInt(formData.stock),
      lowStockThreshold: parseInt(formData.lowStockThreshold),
    }

    onMedicineUpdated(updatedMedicine)

    toast({
      title: "Medicine Updated",
      description: `${formData.name} has been updated successfully.`,
    })

    onOpenChange(false)
  }

  if (!medicine) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Medicine - {medicine.name}</DialogTitle>
          <DialogDescription>Update medicine information and stock details</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tablet">Tablet</SelectItem>
                    <SelectItem value="Capsule">Capsule</SelectItem>
                    <SelectItem value="Syrup">Syrup</SelectItem>
                    <SelectItem value="Injection">Injection</SelectItem>
                    <SelectItem value="Cream">Cream</SelectItem>
                    <SelectItem value="Drops">Drops</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dosage" className="text-right">
                  Dosage
                </Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., 500mg"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cost" className="text-right">
                  Cost (₨)
                </Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">
                  Stock
                </Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="threshold" className="text-right">
                  Low Stock Alert
                </Label>
                <Input
                  id="threshold"
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
            </div>

            <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Update Medicine
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
