"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PieLabelRenderProps } from "recharts"
import { Users, Calendar, CreditCard, DollarSign, Activity } from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { useEffect, useState } from "react"
import { fetchPatients } from "@/lib/api"

// ----------------- TYPES -----------------
type Visit = {
  _id: string
  patientName: string
  mrNo: string
  visitDate: string
  consultationFee: number
  procedureFee: number
  paymentStatus: "Paid" | "Unpaid"
  medicines: { name: string; quantity: number; cost: number }[]
}

// ----------------- DASHBOARD -----------------
export default function DashboardPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [unpaidCount, setUnpaidCount] = useState(0)
  const [totalVisits, setTotalVisits] = useState(0)
  const [totalIncome, setTotalIncome] = useState(0)
  const [chartView, setChartView] = useState<"daily" | "monthly">("daily")
  const [dailyIncomeData, setDailyIncomeData] = useState<{ day: string; income: number; date: string }[]>([])
  const [monthlyIncomeData, setMonthlyIncomeData] = useState<{ month: string; income: number; fullMonth: string }[]>([])
  const [feeBreakdownData, setFeeBreakdownData] = useState<{ name: string; value: number; color: string }[]>([])

  // ----------------- TOOLTIP -----------------
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      const d = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-semibold">{d.fullMonth || label}</p>
          {d.date && <p className="text-gray-500 text-sm">{new Date(d.date).toLocaleDateString()}</p>}
          <p className="text-green-600 font-medium">Income: ₨ {Number(payload[0].value).toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  // ----------------- FETCH DATA -----------------
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const p = await fetchPatients()
        setPatients(p)

        const vRes = await fetch("http://localhost:5000/api/visits")
        const vJson: Visit[] = await vRes.json()
        setVisits(vJson)
        setTotalVisits(vJson.length)

        let total = 0
        let unpaid = 0
        let consultSum = 0
        let procSum = 0
        let medSum = 0

        vJson.forEach((v) => {
          const medicineFee = (v.medicines || []).reduce(
            (sum, m) => sum + (Number(m.cost) || 0) * (Number(m.quantity) || 0),
            0
          )
          const consultationFee = Number(v.consultationFee) || 0
          const procedureFee = Number(v.procedureFee) || 0
          const visitTotal = consultationFee + procedureFee + medicineFee
          total += visitTotal

          consultSum += consultationFee
          procSum += procedureFee
          medSum += medicineFee

          if (v.paymentStatus === "Unpaid") unpaid++
        })

        setTotalIncome(total)
        setUnpaidCount(unpaid)

        // ----------------- DAILY CHART -----------------
        const dailyMap: Record<string, { income: number; date: string }> = {}
        const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        vJson.forEach((v) => {
          const d = new Date(v.visitDate)
          const day = weekDays[d.getDay()]
          const medicineFee = (v.medicines || []).reduce(
            (sum, m) => sum + (Number(m.cost) || 0) * (Number(m.quantity) || 0),
            0
          )
          const visitTotal = (Number(v.consultationFee) || 0) + (Number(v.procedureFee) || 0) + medicineFee
          if (!dailyMap[day]) dailyMap[day] = { income: 0, date: v.visitDate }
          dailyMap[day].income += visitTotal
        })
        setDailyIncomeData(
          weekDays.map((d) => ({ day: d, income: dailyMap[d]?.income || 0, date: dailyMap[d]?.date || "" }))
        )

        // ----------------- MONTHLY CHART -----------------
        const monthlyMap: Record<string, number> = {}
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        months.forEach((m) => (monthlyMap[m] = 0))
        vJson.forEach((v) => {
          const d = new Date(v.visitDate)
          const m = months[d.getMonth()]
          const medicineFee = (v.medicines || []).reduce(
            (sum, m) => sum + (Number(m.cost) || 0) * (Number(m.quantity) || 0),
            0
          )
          const visitTotal = (Number(v.consultationFee) || 0) + (Number(v.procedureFee) || 0) + medicineFee
          monthlyMap[m] += visitTotal
        })
        setMonthlyIncomeData(months.map((m) => ({ month: m, fullMonth: m, income: monthlyMap[m] })))

        // ----------------- FEE BREAKDOWN -----------------
        setFeeBreakdownData([
          { name: "Consult.", value: consultSum, color: "#22c55e" },
          { name: "Procs.", value: procSum, color: "#3b82f6" },
          { name: "Meds", value: medSum, color: "#facc15" },
        ])
      } catch (err) {
        console.error("Dashboard fetch error:", err)
      }
    }
    loadDashboard()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <Button className="bg-green-600 hover:bg-green-700">
          Total Income: ₨ {totalIncome.toLocaleString()}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Patients", value: patients.length.toLocaleString(), icon: <Users /> },
          { title: "Total Visits", value: totalVisits.toLocaleString(), icon: <Calendar /> },
          { title: "Unpaid Visits", value: unpaidCount.toLocaleString(), icon: <CreditCard /> },
          { title: "Total Income", value: `₨ ${totalIncome.toLocaleString()}`, icon: <DollarSign /> },
        ].map((item, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              {item.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">{i === 2 ? "-5%" : "+12%"} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-[2fr_1fr]">
        {/* Income Chart */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-xl font-bold">Income Analytics</CardTitle>
                <CardDescription>
                  {chartView === "daily" ? "Weekly income trends" : "Monthly income performance"}
                </CardDescription>
              </div>
              <div className="inline-flex bg-gray-100 rounded-md overflow-hidden">
                {["daily", "monthly"].map((view) => (
                  <Button
                    key={view}
                    size="sm"
                    onClick={() => setChartView(view as "daily" | "monthly")}
                    className={`rounded-none px-4 py-1.5 text-sm font-medium ${
                      chartView === view
                        ? "bg-green-600 text-white"
                        : "bg-transparent text-gray-700 hover:bg-green-100"
                    }`}
                  >
                    {view[0].toUpperCase() + view.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              {chartView === "daily" ? (
                <BarChart data={dailyIncomeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="income" fill="url(#gradientDaily)" radius={[6, 6, 0, 0]} barSize={30} />
                  <defs>
                    <linearGradient id="gradientDaily" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                </BarChart>
              ) : (
                <LineChart data={monthlyIncomeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 6, stroke: "#22c55e", strokeWidth: 2 }}
                    activeDot={{ r: 8, stroke: "#16a34a", strokeWidth: 3 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fee Breakdown Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Revenue Breakdown</CardTitle>
            <CardDescription>By category</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={feeBreakdownData}
                  cx="50%"
                  cy="50%"
                  outerRadius={63}
                  label={(props: PieLabelRenderProps) => {
                    const name = props.name ?? ""
                    const percent = typeof props.percent === "number" ? props.percent : 0
                    return `${name} ${(percent * 100).toFixed(0)}%`
                  }}
                  dataKey="value"
                >
                  {feeBreakdownData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>

                <Tooltip formatter={(v: any) => [`₨ ${Number(v).toLocaleString()}`, "Amount"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
          <CardDescription>Latest visits & payments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {visits
            .slice()
            .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
            .slice(0, 5)
            .map((v, i) => {
              const medicineFee = (v.medicines || []).reduce((s, m) => s + (Number(m.cost) || 0) * (Number(m.quantity) || 0), 0)
              const total = (Number(v.consultationFee) || 0) + (Number(v.procedureFee) || 0) + medicineFee
              return (
                <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{v.patientName}</p>
                      <p className="text-sm text-gray-500">
                        {v.paymentStatus === "Paid" ? "Payment received" : "Payment pending"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">₨ {total.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{new Date(v.visitDate).toLocaleString()}</p>
                  </div>
                </div>
              )
            })}
        </CardContent>
      </Card>
    </div>
  )
}
