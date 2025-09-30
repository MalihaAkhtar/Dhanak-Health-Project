"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, CreditCard, DollarSign, Clock, CheckCircle, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import * as api from "@/lib/api"

type PaymentRow = {
  _id: string
  mrNo: string
  patientName: string
  visitDate: string
  consultationFee: number
  procedureFee: number
  medicineFee: number
  totalFee: number
  status: "Paid" | "Unpaid"
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    const loadPayments = async () => {
      try {
        // Fetch all visits
        const visits = await api.fetchVisits() // make sure this API returns all visits with patient info & medicines

        const allPayments: PaymentRow[] = visits.map((v: any) => {
          const medicineFee = (v.medicines || []).reduce(
            (sum: number, m: any) => sum + (Number(m.cost) || 0) * (Number(m.quantity) || 0),
            0
          )
          const consultationFee = Number(v.consultationFee) || 0
          const procedureFee = Number(v.procedureFee) || 0
          return {
            _id: v._id,
            mrNo: v.mrNo,
            patientName: v.patientName,
            visitDate: v.visitDate,
            consultationFee,
            procedureFee,
            medicineFee,
            totalFee: consultationFee + procedureFee + medicineFee,
            status: v.paymentStatus || "Unpaid",
          }
        })

        setPayments(allPayments)
      } catch (err) {
        console.error("❌ Failed to load visits:", err)
        toast({
          title: "Error",
          description: "Failed to load visits for payments",
          variant: "destructive",
        })
      }
    }

    loadPayments()
  }, [])

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      (p.patientName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (p.mrNo?.toLowerCase() || "").includes(searchTerm.toLowerCase())

    const matchesFilter =
      filter === "all" || (p.status?.toLowerCase() || "") === filter

    return matchesSearch && matchesFilter
  })

  const totalUnpaid = payments.filter((p) => p.status === "Unpaid").reduce((sum, p) => sum + p.totalFee, 0)
  const totalPaid = payments.filter((p) => p.status === "Paid").reduce((sum, p) => sum + p.totalFee, 0)

  const markAsPaid = async (id: string, mrNo: string) => {
    try {
      const updated = await api.markPaymentAndVisitsAsPaid(id, mrNo)
      if (!updated || !updated.payment || !updated.payment.status) {
        toast({
          title: "Error",
          description: "Invalid response from server",
          variant: "destructive",
        })
        return
      }

      setPayments((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status: updated.payment.status } : p))
      )

      toast({
        title: "Payment Updated",
        description: "Marked as Paid",
      })
    } catch (err) {
      console.error("❌ Failed to update payment:", err)
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const deletePayment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment/visit?")) return
    try {
      await api.deleteVisit(id)
      setPayments((prev) => prev.filter((p) => p._id !== id))
      toast({
        title: "Deleted",
        description: "Payment record deleted successfully",
      })
    } catch (err) {
      console.error("❌ Failed to delete payment:", err)
      toast({
        title: "Error",
        description: "Could not delete payment",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Payment Tracking</h1>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold">Total Unpaid</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₨ {totalUnpaid.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">{payments.filter((p) => p.status === "Unpaid").length} pending payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold">Total Paid</CardTitle>
            <CheckCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₨ {totalPaid.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">{payments.filter((p) => p.status === "Paid").length} completed payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₨ {(totalPaid + totalUnpaid).toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
          <CardDescription>All visits and payments for all patients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by patient name or MR No..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
            </div>
            <div className="flex space-x-2">
              {["all", "paid", "unpaid"].map(f => (
                <Button key={f} variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} size="sm">
                  {f[0].toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MR No.</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Visit Date</TableHead>
                  <TableHead>Consultation Fee</TableHead>
                  <TableHead>Procedure Fee</TableHead>
                  <TableHead>Medicine Fee</TableHead>
                  <TableHead>Total Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map(p => (
                  <TableRow key={p._id}>
                    <TableCell>{p.mrNo}</TableCell>
                    <TableCell>{p.patientName}</TableCell>
                    <TableCell>{p.visitDate}</TableCell>
                    <TableCell>₨ {p.consultationFee.toLocaleString()}</TableCell>
                    <TableCell>₨ {p.procedureFee.toLocaleString()}</TableCell>
                    <TableCell>₨ {p.medicineFee.toLocaleString()}</TableCell>
                    <TableCell>₨ {p.totalFee.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "Paid" ? "default" : "destructive"}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex space-x-2">
                      {p.status === "Unpaid" && <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => markAsPaid(p._id, p.mrNo)}><CreditCard className="mr-2 h-4 w-4"/>Mark Paid</Button>}
                      <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => deletePayment(p._id)}><Trash2 className="mr-2 h-4 w-4"/>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
