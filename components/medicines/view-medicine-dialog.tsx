"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Pill, DollarSign, Package, AlertTriangle } from "lucide-react"

interface ViewMedicineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicine: any
}

export function ViewMedicineDialog({ open, onOpenChange, medicine }: ViewMedicineDialogProps) {
  if (!medicine) return null

  const isLowStock = medicine.stock <= medicine.lowStockThreshold

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-green-700 flex items-center">
            <Pill className="mr-3 h-6 w-6" />
            Medicine Details - {medicine.name}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Complete medicine information and inventory status
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-4 bg-gray-50 rounded-md">
          <div className="space-y-6">
            {/* Medicine Information Card */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="bg-green-50 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-green-800 flex items-center">
                  <Pill className="mr-2 h-5 w-5" />
                  Medicine Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Medicine Name</p>
                    <p className="text-xl font-semibold text-gray-900">{medicine.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Type</p>
                    <p className="text-lg font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded">{medicine.type}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Dosage</p>
                    <p className="text-lg font-medium text-gray-900">{medicine.dosage}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Cost per Unit</p>
                    <p className="text-lg font-semibold text-green-600">₨ {medicine.cost}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Information Card */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Stock Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-medium text-gray-500 mb-2">Available Stock</p>
                    <p className="text-3xl font-bold text-gray-900">{medicine.stock}</p>
                    <p className="text-xs text-gray-500 mt-1">Units available</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-medium text-gray-500 mb-2">Low Stock Threshold</p>
                    <p className="text-2xl font-semibold text-orange-600">{medicine.lowStockThreshold}</p>
                    <p className="text-xs text-gray-500 mt-1">Alert threshold</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg border-2 border-dashed">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-900">Stock Status:</span>
                      {isLowStock && <AlertTriangle className="ml-2 h-5 w-5 text-orange-500" />}
                    </div>
                    <Badge
                      variant={isLowStock ? "destructive" : "default"}
                      className={!isLowStock ? "bg-green-100 text-green-800 border-green-200" : ""}
                    >
                      {isLowStock ? "⚠️ Low Stock" : "✅ In Stock"}
                    </Badge>
                  </div>
                </div>

                {isLowStock && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-orange-800">Low Stock Alert</p>
                        <p className="text-sm text-orange-700 mt-1">
                          This medicine is running low on stock. Consider restocking soon to avoid shortages.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Information Card */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="bg-green-50 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-green-800 flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Financial Summary
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-700">Cost per Unit:</span>
                    <span className="font-semibold text-gray-900">₨ {medicine.cost}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-700">Available Stock:</span>
                    <span className="font-semibold text-gray-900">{medicine.stock} units</span>
                  </div>
                  <div className="flex justify-between items-center py-4 bg-green-50 px-4 rounded-lg border border-green-200">
                    <span className="text-lg font-semibold text-gray-900">Total Inventory Value:</span>
                    <span className="text-xl font-bold text-green-600">
                      ₨ {(medicine.cost * medicine.stock).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
