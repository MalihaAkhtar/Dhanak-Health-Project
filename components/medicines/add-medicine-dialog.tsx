"use client"

import type React from "react"

import { useState } from "react"
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
import { DollarSign, Pill } from "lucide-react"

interface AddMedicineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMedicineAdded: (medicine: any) => void
}

export function AddMedicineDialog({ open, onOpenChange, onMedicineAdded }: AddMedicineDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    dosage: "",
    cost: "",
    stock: "",
    lowStockThreshold: "20",
  })
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newMedicine = {
      ...formData,
      cost: Number.parseFloat(formData.cost),
      stock: Number.parseInt(formData.stock),
      lowStockThreshold: Number.parseInt(formData.lowStockThreshold),
    }

    onMedicineAdded(newMedicine)

    toast({
      title: "Medicine Added",
      description: `${formData.name} has been added to inventory.`,
    })

    setFormData({
      name: "",
      type: "",
      dosage: "",
      cost: "",
      stock: "",
      lowStockThreshold: "20",
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-green-700">Add New Medicine</DialogTitle>
          <DialogDescription>Add a new medicine to the inventory system.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-4 bg-gray-50 rounded-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Medicine Information Card */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Pill className="mr-2 h-5 w-5 text-green-600" />
                Medicine Information
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Medicine Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter medicine name"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                      Type *
                    </Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
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
                  <div className="space-y-2">
                    <Label htmlFor="dosage">Dosage</Label>
   

                    <Input
                      id="dosage"
                      value={formData.dosage}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      placeholder="e.g., 500mg"
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Stock Card */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                Pricing & Stock Management
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost" className="text-sm font-medium text-gray-700">
                      Cost per Unit (₨) *
                    </Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      placeholder="0.00"
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock" className="text-sm font-medium text-gray-700">
                      Initial Stock *
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="threshold" className="text-sm font-medium text-gray-700">
                    Low Stock Alert Threshold *
                  </Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    placeholder="20"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                  <p className="text-xs text-gray-500">System will alert when stock falls below this number</p>
                </div>
              </div>
            </div>

            <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Add Medicine
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
