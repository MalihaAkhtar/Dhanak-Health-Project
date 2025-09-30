"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

export default function TrashPage() {
  const router = useRouter();

  const [patients, setPatients] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [pRes, vRes, mRes] = await Promise.all([
      fetch("http://localhost:5000/api/patients?deleted=true"),
      fetch("http://localhost:5000/api/visits?deleted=true"),
      fetch("http://localhost:5000/api/medicines?deleted=true"),
    ]);
    const [pData, vData, mData] = await Promise.all([
      pRes.json(),
      vRes.json(),
      mRes.json(),
    ]);
    setPatients(pData);
    setVisits(vData);
    setMedicines(mData);
  };

  // ----------- Restore Handlers -----------
  const restorePatient = async (id: string) => {
    const res = await fetch(`http://localhost:5000/api/patients/${id}/restore`, {
      method: "PATCH",
    });
    if (res.ok) {
      toast({ title: "Restored", description: "Patient restored successfully" });
      setPatients((prev) => prev.filter((p) => p._id !== id));
    router.push("/dashboard/patients"); } else {
      toast({ title: "Error", description: "Failed to restore patient" });
    }
  };

  const restoreVisit = async (id: string) => {
    const res = await fetch(`http://localhost:5000/api/visits/${id}/restore`, {
      method: "PATCH",
    });
    if (res.ok) {
      toast({ title: "Restored", description: "Visit restored successfully" });
      setVisits((prev) => prev.filter((v) => v._id !== id));
   router.push("/dashboard/visits");  } else {
      toast({ title: "Error", description: "Failed to restore visit" });
    }
  };

  const restoreMedicine = async (id: string) => {
    const res = await fetch(`http://localhost:5000/api/medicines/${id}/restore`, {
      method: "PATCH",
    });
    if (res.ok) {
      toast({ title: "Restored", description: "Medicine restored successfully" });
      setMedicines((prev) => prev.filter((m) => m._id !== id));
   router.push("/dashboard/medicines") } else {
      toast({ title: "Error", description: "Failed to restore medicine" });
    }
  };

  // ----------- Permanent Delete Handlers -----------
  const deletePatient = async (id: string) => {
    const res = await fetch(`http://localhost:5000/api/patients/${id}/permanent`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast({ title: "Deleted", description: "Patient permanently deleted" });
      setPatients((prev) => prev.filter((p) => p._id !== id));
    }
  };

  const deleteVisit = async (id: string) => {
    const res = await fetch(`http://localhost:5000/api/visits/${id}/permanent`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast({ title: "Deleted", description: "Visit permanently deleted" });
      setVisits((prev) => prev.filter((v) => v._id !== id));
    }
  };

  const deleteMedicine = async (id: string) => {
    const res = await fetch(`http://localhost:5000/api/medicines/${id}/permanent`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast({ title: "Deleted", description: "Medicine permanently deleted" });
      setMedicines((prev) => prev.filter((m) => m._id !== id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Trash</h2>

      <Tabs defaultValue="patients" className="w-full">
        <TabsList>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="visits">Visits</TabsTrigger>
          <TabsTrigger value="medicines">Medicines</TabsTrigger>
        </TabsList>

        {/* ---------- PATIENTS ---------- */}
        <TabsContent value="patients">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>MR No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((p) => (
                <TableRow key={p._id}>
                  <TableCell>{p.mrNo}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>
                    <Button onClick={() => restorePatient(p._id)} className="mr-2">
                      Restore
                    </Button>
                    <Button onClick={() => deletePatient(p._id)} variant="destructive">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* ---------- VISITS ---------- */}
        <TabsContent value="visits">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>MR No</TableHead>
                <TableHead>Symptoms</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(visits) &&
                visits.map((v) => (
                  <TableRow key={v._id}>
                    <TableCell>{v.mrNo}</TableCell>
                    <TableCell>{v.symptoms}</TableCell>
                    <TableCell>{v.diagnosis}</TableCell>
                    <TableCell>
                      <Button onClick={() => restoreVisit(v._id)} className="mr-2">
                        Restore
                      </Button>
                      <Button onClick={() => deleteVisit(v._id)} variant="destructive">
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* ---------- MEDICINES ---------- */}
        <TabsContent value="medicines">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicines.map((m) => (
                <TableRow key={m._id}>
                  <TableCell>{m.name}</TableCell>
                  <TableCell>{m.type}</TableCell>
                  <TableCell>{m.stock}</TableCell>
                  <TableCell>
                    <Button onClick={() => restoreMedicine(m._id)} className="mr-2">
                      Restore
                    </Button>
                    <Button onClick={() => deleteMedicine(m._id)} variant="destructive">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
