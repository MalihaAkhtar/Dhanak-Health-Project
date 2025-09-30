"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export interface Medicine {
  _id?: string
  name: string
  type: string
  dosage?: string
  cost: number
  stock: number
  lowStockThreshold: number
  deleted?: boolean
}

interface MedicineContextType {
  medicines: Medicine[]
  trashedMedicines: Medicine[]
  fetchMedicines: () => Promise<void>
  addMedicine: (medicine: Medicine) => Promise<void>
  updateMedicine: (medicine: Medicine) => Promise<void>
  deleteMedicine: (id: string) => Promise<void>
  permanentlyDeleteMedicine: (id: string) => Promise<void>
  updateMedicineStock: (medicineName: string, quantity: number) => Promise<void>
  restoreMedicine: (id: string) => Promise<void>
}

const MedicineContext = createContext<MedicineContextType | undefined>(undefined)

export const MedicineProvider = ({ children }: { children: React.ReactNode }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [trashedMedicines, setTrashedMedicines] = useState<Medicine[]>([])
  const { toast } = useToast()

  const fetchMedicines = async () => {
    try {
      const res = await axios.get<Medicine[]>(`${API_BASE_URL}/api/medicines`)
      const active = res.data.filter((m) => !m.deleted)
      const trashed = res.data.filter((m) => m.deleted)

      setMedicines(active)
      setTrashedMedicines(trashed)
    } catch (error) {
      console.error("❌ Error fetching medicines:", error)
    }
  }

  useEffect(() => {
    fetchMedicines()
  }, [])

  const addMedicine = async (medicine: Medicine) => {
    try {
      const res = await axios.post<Medicine>(`${API_BASE_URL}/api/medicines`, medicine)
      setMedicines((prev) => [...prev, res.data])
    } catch (error) {
      console.error("❌ Error adding medicine:", error)
    }
  }

  const updateMedicine = async (medicine: Medicine) => {
    if (!medicine._id) return
    try {
      const res = await axios.put<Medicine>(`${API_BASE_URL}/api/medicines/${medicine._id}`, medicine)
      setMedicines((prev) =>
        prev.map((m) => (m._id === medicine._id ? res.data : m))
      )
    } catch (error) {
      console.error("❌ Error updating medicine:", error)
    }
  }

  const deleteMedicine = async (id: string) => {
    try {
      await axios.put(`${API_BASE_URL}/api/medicines/${id}`, { deleted: true })
      setMedicines((prev) => prev.filter((m) => m._id !== id))
      const deleted = medicines.find((m) => m._id === id)
      if (deleted) setTrashedMedicines((prev) => [...prev, { ...deleted, deleted: true }])
    } catch (error) {
      console.error("❌ Error soft deleting medicine:", error)
    }
  }

const restoreMedicine = async (id: string) => {
  try {
    const res = await axios.patch(`${API_BASE_URL}/api/medicines/${id}/restore`);
    toast({ title: "Restored", description: "Medicine restored successfully" });

    // Remove from trash list
    setTrashedMedicines((prev) => prev.filter((m) => m._id !== id));

    // ✅ Refresh list from backend instead of manually adding
    await fetchMedicines();
  } catch (error) {
    toast({ title: "Error", description: "Failed to restore medicine" });
    console.error("Restore medicine error", error);
  }
};

  const permanentlyDeleteMedicine = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/medicines/permanent/${id}`)
      setTrashedMedicines((prev) => prev.filter((m) => m._id !== id))
    } catch (error) {
      console.error("❌ Error permanently deleting medicine:", error)
    }
  }

  const updateMedicineStock = async (medicineName: string, quantity: number) => {
    const medicine = medicines.find(
      (m) => m.name.toLowerCase() === medicineName.toLowerCase()
    )
    if (!medicine || !medicine._id) return

    const updatedStock = Math.max(0, medicine.stock - quantity)
    const updatedMedicine = { ...medicine, stock: updatedStock }

    try {
      await axios.put(`${API_BASE_URL}/api/medicines/${medicine._id}`, updatedMedicine)
      setMedicines((prev) =>
        prev.map((m) => (m._id === medicine._id ? updatedMedicine : m))
      )

      if (updatedStock < medicine.lowStockThreshold) {
        toast({
          title: "⚠️ Low Stock Alert",
          description: `${medicine.name} stock is low (${updatedStock} units remaining).`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Error updating stock:", error)
    }
  }

  return (
    <MedicineContext.Provider
      value={{
        medicines,
        trashedMedicines,
        fetchMedicines,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        restoreMedicine,
        permanentlyDeleteMedicine,
        updateMedicineStock,
      }}
    >
      {children}
    </MedicineContext.Provider>
  )
}

export const useMedicines = (): MedicineContextType => {
  const context = useContext(MedicineContext)
  if (!context) {
    throw new Error("useMedicines must be used within a MedicineProvider")
  }
  return context
}
