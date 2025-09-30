"use client"

import { useState, useEffect } from "react"
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
import { Plus, Search, AlertTriangle, Trash2 } from "lucide-react"
import { AddMedicineDialog } from "@/components/medicines/add-medicine-dialog"
import { ViewMedicineDialog } from "@/components/medicines/view-medicine-dialog"
import { EditMedicineDialog } from "@/components/medicines/edit-medicine-dialog"
import { useMedicines } from "@/components/medicines/medicine-context"
import { ActionMenu } from "@/components/shared/action-menu"
import type { Medicine } from "@/components/medicines/medicine-context"

export default function MedicinesPage() {
  const {
    medicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    restoreMedicine,
    permanentlyDeleteMedicine,
    trashedMedicines,
    fetchMedicines,
  } = useMedicines()

  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  useEffect(() => {
    fetchMedicines()
  }, [])

  const filteredMedicines = medicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const lowStockMedicines = medicines.filter(
    (m) => m.stock <= m.lowStockThreshold
  )

  const handleViewMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine)
    setShowViewDialog(true)
  }

  const handleEditMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine)
    setShowEditDialog(true)
  }

  const handleDeleteMedicine = async (id: string) => {
    await deleteMedicine(id)
    await fetchMedicines()
  }

  const handleRestoreMedicine = async (id: string) => {
    await restoreMedicine(id)
    await fetchMedicines()
  }

  const handlePermanentDelete = async (id: string) => {
    await permanentlyDeleteMedicine(id)
    await fetchMedicines()
  }

  const handleMedicineAdded = async (medicine: Medicine) => {
    await addMedicine(medicine)
    await fetchMedicines()
  }

  const handleMedicineUpdated = async (updatedMedicine: Medicine) => {
    await updateMedicine(updatedMedicine)
    await fetchMedicines()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Medicine Stock Management</h1>
        <div className="space-x-2">
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Medicine
          </Button>
        </div>
      </div>

      {lowStockMedicines.length > 0 && (
        <Card className="border-red-200 bg-red-50 animate-pulse">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="mr-2 h-5 w-5 animate-bounce" />
              🚨 Critical Low Stock Alert
            </CardTitle>
            <CardDescription className="text-red-700 font-medium">
              {lowStockMedicines.length} medicine(s) are critically low on stock - Immediate restocking required!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockMedicines.map((medicine) => (
                <div
                  key={medicine._id}
                  className="flex items-center justify-between p-3 bg-white rounded border-l-4 border-red-500"
                >
                  <div>
                    <span className="font-bold text-red-900">{medicine.name}</span>
                    <p className="text-sm text-red-600">{medicine.type} - {medicine.dosage}</p>
                  </div>
                  <Badge variant="destructive" className="animate-pulse">
                    Only {medicine.stock} left!
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Medicine Inventory</CardTitle>
          <CardDescription>Manage medicine stock and pricing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Cost (₨)</TableHead>
                  <TableHead>Available Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.map((medicine) => (
                  <TableRow key={medicine._id}>
                    <TableCell className="font-medium">{medicine.name}</TableCell>
                    <TableCell>{medicine.type}</TableCell>
                    <TableCell>{medicine.dosage}</TableCell>
                    <TableCell>₨ {medicine.cost}</TableCell>
                    <TableCell>{medicine.stock}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          medicine.stock <= medicine.lowStockThreshold ? "destructive" : "default"
                        }
                        className={
                          medicine.stock > medicine.lowStockThreshold
                            ? "bg-green-100 text-green-800"
                            : ""
                        }
                      >
                        {medicine.stock <= medicine.lowStockThreshold ? "Low Stock" : "In Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ActionMenu
                        onView={() => handleViewMedicine(medicine)}
                        onEdit={() => handleEditMedicine(medicine)}
                        onDelete={() => medicine._id && handleDeleteMedicine(medicine._id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Trashed Medicines */}
      {trashedMedicines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Trash2 className="h-5 w-5" /> Trashed Medicines
            </CardTitle>
            <CardDescription>
              Restore or permanently delete removed medicines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trashedMedicines.map((medicine: any) => (
                    <TableRow key={medicine._id} className="text-red-600">
                      <TableCell className="font-medium">{medicine.name}</TableCell>
                      <TableCell>{medicine.type}</TableCell>
                      <TableCell>{medicine.dosage}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="border-green-600 text-green-700 hover:bg-green-50"
                            onClick={() => handleRestoreMedicine(medicine._id)}
                          >
                            Restore
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handlePermanentDelete(medicine._id)}
                          >
                            Delete Permanently
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <AddMedicineDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onMedicineAdded={handleMedicineAdded}
      />

      <ViewMedicineDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        medicine={selectedMedicine}
      />

      <EditMedicineDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        medicine={selectedMedicine}
        onMedicineUpdated={handleMedicineUpdated}
      />
    </div>
  )
}